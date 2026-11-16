"""Step 3: FetchConsumers Lambda Function.

Retrieves all registered downstream consumers for the contract and loads their expected schemas.
"""

import json
import os
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
s3_client = boto3.client("s3")

CONSUMERS_TABLE = os.environ.get("CONSUMERS_TABLE", "schemashield-consumers")
STORAGE_BUCKET = os.environ.get("STORAGE_BUCKET", "")


def lambda_handler(event, context):
    print("Fetching consumers for contract:", event.get("contract_id"))
    contract_id = event["contract_id"]

    table = dynamodb.Table(CONSUMERS_TABLE)
    response = table.query(
        KeyConditionExpression=Key("contractId").eq(contract_id)
    )
    items = response.get("Items", [])

    consumers = []
    for item in items:
        expected_schema = None
        s3_key = item.get("expectedSchemaS3Key")

        if s3_key:
            try:
                s3_obj = s3_client.get_object(Bucket=STORAGE_BUCKET, Key=s3_key)
                expected_schema = json.loads(s3_obj["Body"].read().decode("utf-8"))
            except Exception as e:
                print(f"Warning: Failed to load S3 schema for consumer {item.get('consumerId')}: {e}")

        # Fallback to inline schema if stored in DynamoDB item
        if not expected_schema and "expectedSchema" in item:
            expected_schema = item["expectedSchema"]

        consumers.append({
            "consumer_id": item.get("consumerId"),
            "name": item.get("name", "Unnamed Consumer"),
            "type": item.get("type", "service"),
            "expected_schema": expected_schema or {}
        })

    return {
        "analysis_id": event["analysis_id"],
        "contract_id": contract_id,
        "contract_name": event.get("contract_name", "Contract"),
        "proposed_schema": event["proposed_schema"],
        "schema_findings": event["schema_findings"],
        "consumers": consumers
    }
