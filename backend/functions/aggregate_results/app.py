"""Step 5: AggregateResults Lambda Function.

Combines schema findings with consumer compatibility results, computes explainable risk,
persists the durable report to S3, and updates DynamoDB status to COMPLETED.
"""

import datetime
import json
import os
import boto3
from core.risk_engine import calculate_risk

s3_client = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

ANALYSES_TABLE = os.environ.get("ANALYSES_TABLE", "schemashield-analyses")
STORAGE_BUCKET = os.environ.get("STORAGE_BUCKET", "")


def lambda_handler(event, context):
    analysis_id = event["analysis_id"]
    contract_id = event["contract_id"]
    contract_name = event.get("contract_name", "Contract")
    schema_findings = event.get("schema_findings", [])
    consumer_results = event.get("consumer_results", [])

    print(f"Aggregating results for analysis: {analysis_id}")

    # 1. Calculate risk & release verdict
    risk_summary = calculate_risk(schema_findings, consumer_results)

    # 2. Compile actionable migration recommendations
    recommended_actions = []
    breaking_consumers = [c for c in consumer_results if c.get("status") == "BREAKING"]
    if breaking_consumers:
        for c in breaking_consumers:
            recommended_actions.append(f"Consumer '{c.get('consumer_name')}': {c.get('recommended_fix')}")

    for f in schema_findings:
        if f.get("category") == "BREAKING":
            action = f.get("suggested_action")
            if action and action not in recommended_actions:
                recommended_actions.append(f"Schema Field '{f.get('path')}': {action}")

    if not recommended_actions:
        recommended_actions.append("All consumer contracts are preserved. Safe to proceed with production deployment.")

    completed_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    report_s3_key = f"reports/{contract_id}/{analysis_id}.json"

    # 3. Assemble full report
    full_report = {
        "analysis_id": analysis_id,
        "contract_id": contract_id,
        "contract_name": contract_name,
        "status": "COMPLETED",
        "completed_at": completed_at,
        "risk_score": risk_summary["risk_score"],
        "risk_level": risk_summary["risk_level"],
        "release_verdict": risk_summary["release_verdict"],
        "summary_explanation": risk_summary["summary_explanation"],
        "severity_distribution": risk_summary["severity_distribution"],
        "blast_radius_percentage": risk_summary["blast_radius_percentage"],
        "total_findings": risk_summary["total_findings"],
        "total_consumers": risk_summary["total_consumers"],
        "breaking_consumers": risk_summary["breaking_consumers"],
        "warning_consumers": risk_summary["warning_consumers"],
        "compatible_consumers": risk_summary["compatible_consumers"],
        "schema_findings": schema_findings,
        "consumer_results": consumer_results,
        "recommended_actions": recommended_actions
    }

    # 4. Save report to S3
    try:
        s3_client.put_object(
            Bucket=STORAGE_BUCKET,
            Key=report_s3_key,
            Body=json.dumps(full_report, indent=2),
            ContentType="application/json"
        )
    except Exception as e:
        print(f"Error writing report to S3: {e}")

    # 5. Update DynamoDB record
    try:
        table = dynamodb.Table(ANALYSES_TABLE)
        table.update_item(
            Key={"analysisId": analysis_id},
            UpdateExpression=(
                "SET #st = :st, riskScore = :rs, verdict = :vd, "
                "findingsSummary = :fs, affectedConsumers = :ac, "
                "reportS3Key = :rk, completedAt = :ca"
            ),
            ExpressionAttributeNames={"#st": "status"},
            ExpressionAttributeValues={
                ":st": "COMPLETED",
                ":rs": risk_summary["risk_score"],
                ":vd": risk_summary["release_verdict"],
                ":fs": risk_summary["severity_distribution"],
                ":ac": risk_summary["breaking_consumers"],
                ":rk": report_s3_key,
                ":ca": completed_at
            }
        )
    except Exception as e:
        print(f"Error updating DynamoDB analysis record: {e}")

    return {
        "analysis_id": analysis_id,
        "contract_id": contract_id,
        "status": "COMPLETED",
        "risk_score": risk_summary["risk_score"],
        "release_verdict": risk_summary["release_verdict"],
        "report_s3_key": report_s3_key
    }
