"""Catch Handler: MarkFailed Lambda Function.

Updates DynamoDB analysis record to FAILED with sanitized error message.
"""

import datetime
import os
import boto3

dynamodb = boto3.resource("dynamodb")
ANALYSES_TABLE = os.environ.get("ANALYSES_TABLE", "schemashield-analyses")


def lambda_handler(event, context):
    print("MarkFailed triggered:", event)
    analysis_id = event.get("analysis_id", "unknown")
    error = event.get("error", "An internal error occurred during workflow analysis.")

    # Sanitize error string to prevent leaking internal stack traces
    safe_error = str(error)[:300]
    completed_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

    try:
        table = dynamodb.Table(ANALYSES_TABLE)
        table.update_item(
            Key={"analysisId": analysis_id},
            UpdateExpression="SET #st = :st, errorMessage = :em, completedAt = :ca",
            ExpressionAttributeNames={"#st": "status"},
            ExpressionAttributeValues={
                ":st": "FAILED",
                ":em": safe_error,
                ":ca": completed_at
            }
        )
    except Exception as e:
        print(f"Error marking analysis as failed: {e}")

    return {
        "analysis_id": analysis_id,
        "status": "FAILED",
        "error": safe_error
    }
