"""Step 1: LoadAnalysisContext Lambda Function.

Retrieves contract metadata from DynamoDB and baseline & proposed schemas from S3.
"""

import json
import os
import boto3

s3_client = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

CONTRACTS_TABLE = os.environ.get("CONTRACTS_TABLE", "schemashield-contracts")
STORAGE_BUCKET = os.environ.get("STORAGE_BUCKET", "")


def lambda_handler(event, context):
    print("Received event:", json.dumps(event))
    analysis_id = event["analysis_id"]
    contract_id = event["contract_id"]
    proposal_s3_key = event["proposal_s3_key"]

    # 1. Fetch Contract from DynamoDB
    table = dynamodb.Table(CONTRACTS_TABLE)
    response = table.get_item(Key={"contractId": contract_id})
    if "Item" not in response:
        raise ValueError(f"Contract '{contract_id}' not found in DynamoDB.")
    contract = response["Item"]

    # 2. Fetch baseline schema from S3
    baseline_s3_key = contract.get("schemaS3Key")
    if not baseline_s3_key:
        raise ValueError(f"Contract '{contract_id}' has no schemaS3Key defined.")

    baseline_obj = s3_client.get_object(Bucket=STORAGE_BUCKET, Key=baseline_s3_key)
    baseline_schema = json.loads(baseline_obj["Body"].read().decode("utf-8"))

    # 3. Fetch proposed schema from S3
    proposed_obj = s3_client.get_object(Bucket=STORAGE_BUCKET, Key=proposal_s3_key)
    proposed_schema = json.loads(proposed_obj["Body"].read().decode("utf-8"))

    return {
        "analysis_id": analysis_id,
        "contract_id": contract_id,
        "contract_name": contract.get("name", "Unknown Contract"),
        "baseline_schema": baseline_schema,
        "proposed_schema": proposed_schema
    }
