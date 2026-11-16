"""SchemaShield Core API Lambda Function.

Handles all REST API endpoints for contracts, consumers, analyses, and interactive demo seeding.
"""

import datetime
import json
import os
import uuid
import boto3
from boto3.dynamodb.conditions import Key
from core.schema_validator import validate_schema_structure

s3_client = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
stepfunctions = boto3.client("stepfunctions")

CONTRACTS_TABLE = os.environ.get("CONTRACTS_TABLE", "schemashield-contracts")
CONSUMERS_TABLE = os.environ.get("CONSUMERS_TABLE", "schemashield-consumers")
ANALYSES_TABLE = os.environ.get("ANALYSES_TABLE", "schemashield-analyses")
STORAGE_BUCKET = os.environ.get("STORAGE_BUCKET", "")
STATE_MACHINE_ARN = os.environ.get("STATE_MACHINE_ARN", "")


def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
    }


def response(status_code: int, body: dict):
    return {
        "statusCode": status_code,
        "headers": cors_headers(),
        "body": json.dumps(body)
    }


def lambda_handler(event, context):
    http_method = event.get("httpMethod") or event.get("requestContext", {}).get("http", {}).get("method", "GET")
    path = event.get("path") or event.get("rawPath", "/")

    # Handle OPTIONS for CORS preflight
    if http_method == "OPTIONS":
        return response(200, {"message": "CORS preflight OK"})

    try:
        # Route dispatch
        if path == "/api/health" and http_method == "GET":
            return response(200, {
                "status": "healthy",
                "service": "SchemaShield Serverless Firewall",
                "version": "1.0.0",
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
            })

        # --- DEMO SEED ---
        if path == "/api/demo/seed" and http_method == "POST":
            return seed_demo_data()

        # --- CONTRACTS ---
        if path == "/api/contracts" and http_method == "GET":
            return list_contracts()

        if path == "/api/contracts" and http_method == "POST":
            body = json.loads(event.get("body", "{}"))
            return create_contract(body)

        if path.startswith("/api/contracts/") and not path.endswith("/consumers") and not path.endswith("/analyze"):
            parts = path.strip("/").split("/")
            if len(parts) == 3:
                contract_id = parts[2]
                if http_method == "GET":
                    return get_contract(contract_id)
                elif http_method == "PUT":
                    body = json.loads(event.get("body", "{}"))
                    return update_contract(contract_id, body)

        # --- CONSUMERS ---
        if path.endswith("/consumers"):
            parts = path.strip("/").split("/")
            contract_id = parts[2]
            if http_method == "GET":
                return list_consumers(contract_id)
            elif http_method == "POST":
                body = json.loads(event.get("body", "{}"))
                return create_consumer(contract_id, body)

        # --- ANALYZE ---
        if path.endswith("/analyze") and http_method == "POST":
            parts = path.strip("/").split("/")
            contract_id = parts[2]
            body = json.loads(event.get("body", "{}"))
            return start_analysis(contract_id, body)

        # --- ANALYSES & REPORTS ---
        if path == "/api/analyses" and http_method == "GET":
            return list_analyses()

        if path.startswith("/api/analyses/"):
            parts = path.strip("/").split("/")
            if len(parts) == 3 and http_method == "GET":
                analysis_id = parts[2]
                return get_analysis(analysis_id)
            elif len(parts) == 4 and parts[3] == "report" and http_method == "GET":
                analysis_id = parts[2]
                return get_analysis_report(analysis_id)

        return response(404, {"error": f"Endpoint not found: {http_method} {path}"})

    except Exception as e:
        print(f"Error handling request: {e}")
        return response(500, {"error": "Internal server error", "detail": str(e)})


def list_contracts():
    table = dynamodb.Table(CONTRACTS_TABLE)
    scan_res = table.scan()
    items = scan_res.get("Items", [])

    # Enrich with consumer count
    consumers_tbl = dynamodb.Table(CONSUMERS_TABLE)
    for c in items:
        cid = c.get("contractId")
        try:
            q_res = consumers_tbl.query(
                KeyConditionExpression=Key("contractId").eq(cid),
                Select="COUNT"
            )
            c["consumerCount"] = q_res.get("Count", 0)
        except Exception:
            c["consumerCount"] = 0

    return response(200, {"contracts": items})


def create_contract(body: dict):
    name = body.get("name")
    description = body.get("description", "")
    domain = body.get("domain", "General")
    schema = body.get("schema")

    if not name or not schema:
        return response(400, {"error": "Both 'name' and 'schema' are required."})

    is_valid, errors = validate_schema_structure(schema)
    if not is_valid:
        return response(400, {"error": "Invalid JSON Schema definition", "details": errors})

    contract_id = body.get("contractId") or f"contract-{str(uuid.uuid4())[:8]}"
    schema_s3_key = f"contracts/{contract_id}/versions/v1.json"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # Save schema to S3
    if STORAGE_BUCKET:
        s3_client.put_object(
            Bucket=STORAGE_BUCKET,
            Key=schema_s3_key,
            Body=json.dumps(schema, indent=2),
            ContentType="application/json"
        )

    # Save to DynamoDB
    table = dynamodb.Table(CONTRACTS_TABLE)
    item = {
        "contractId": contract_id,
        "name": name,
        "description": description,
        "domain": domain,
        "currentVersion": "1.0.0",
        "schemaS3Key": schema_s3_key,
        "createdAt": now,
        "updatedAt": now
    }
    table.put_item(Item=item)
    item["schema"] = schema
    return response(201, {"contract": item})


def get_contract(contract_id: str):
    table = dynamodb.Table(CONTRACTS_TABLE)
    res = table.get_item(Key={"contractId": contract_id})
    if "Item" not in res:
        return response(404, {"error": f"Contract '{contract_id}' not found."})

    contract = res["Item"]
    s3_key = contract.get("schemaS3Key")
    schema = {}
    if s3_key and STORAGE_BUCKET:
        try:
            s3_obj = s3_client.get_object(Bucket=STORAGE_BUCKET, Key=s3_key)
            schema = json.loads(s3_obj["Body"].read().decode("utf-8"))
        except Exception as e:
            print(f"Error fetching schema from S3: {e}")

    contract["schema"] = schema
    return response(200, {"contract": contract})


def update_contract(contract_id: str, body: dict):
    table = dynamodb.Table(CONTRACTS_TABLE)
    res = table.get_item(Key={"contractId": contract_id})
    if "Item" not in res:
        return response(404, {"error": f"Contract '{contract_id}' not found."})

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    contract = res["Item"]

    name = body.get("name", contract.get("name"))
    description = body.get("description", contract.get("description"))
    domain = body.get("domain", contract.get("domain"))
    schema = body.get("schema")

    if schema:
        is_valid, errors = validate_schema_structure(schema)
        if not is_valid:
            return response(400, {"error": "Invalid JSON Schema", "details": errors})
        s3_key = f"contracts/{contract_id}/versions/{str(uuid.uuid4())[:8]}.json"
        if STORAGE_BUCKET:
            s3_client.put_object(
                Bucket=STORAGE_BUCKET,
                Key=s3_key,
                Body=json.dumps(schema, indent=2),
                ContentType="application/json"
            )
        contract["schemaS3Key"] = s3_key

    contract["name"] = name
    contract["description"] = description
    contract["domain"] = domain
    contract["updatedAt"] = now

    table.put_item(Item=contract)
    if schema:
        contract["schema"] = schema
    return response(200, {"contract": contract})


def list_consumers(contract_id: str):
    table = dynamodb.Table(CONSUMERS_TABLE)
    res = table.query(KeyConditionExpression=Key("contractId").eq(contract_id))
    items = res.get("Items", [])

    for c in items:
        s3_key = c.get("expectedSchemaS3Key")
        if s3_key and STORAGE_BUCKET:
            try:
                s3_obj = s3_client.get_object(Bucket=STORAGE_BUCKET, Key=s3_key)
                c["expected_schema"] = json.loads(s3_obj["Body"].read().decode("utf-8"))
            except Exception:
                c["expected_schema"] = {}

    return response(200, {"consumers": items})


def create_consumer(contract_id: str, body: dict):
    name = body.get("name")
    ctype = body.get("type", "service")
    expected_schema = body.get("expected_schema") or body.get("schema")

    if not name or not expected_schema:
        return response(400, {"error": "Fields 'name' and 'expected_schema' are required."})

    is_valid, errors = validate_schema_structure(expected_schema)
    if not is_valid:
        return response(400, {"error": "Invalid expected JSON Schema", "details": errors})

    consumer_id = body.get("consumerId") or f"consumer-{str(uuid.uuid4())[:8]}"
    s3_key = f"consumers/{contract_id}/{consumer_id}.json"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    if STORAGE_BUCKET:
        s3_client.put_object(
            Bucket=STORAGE_BUCKET,
            Key=s3_key,
            Body=json.dumps(expected_schema, indent=2),
            ContentType="application/json"
        )

    table = dynamodb.Table(CONSUMERS_TABLE)
    item = {
        "contractId": contract_id,
        "consumerId": consumer_id,
        "name": name,
        "type": ctype,
        "expectedSchemaS3Key": s3_key,
        "createdAt": now,
        "updatedAt": now
    }
    table.put_item(Item=item)
    item["expected_schema"] = expected_schema
    return response(201, {"consumer": item})


def start_analysis(contract_id: str, body: dict):
    proposed_schema = body.get("proposed_schema")
    if not proposed_schema:
        return response(400, {"error": "'proposed_schema' is required."})

    is_valid, errors = validate_schema_structure(proposed_schema)
    if not is_valid:
        return response(400, {"error": "Invalid proposed JSON Schema", "details": errors})

    analysis_id = f"analysis-{str(uuid.uuid4())[:8]}"
    proposal_s3_key = f"proposals/{contract_id}/{analysis_id}.json"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # Save proposed schema to S3
    if STORAGE_BUCKET:
        s3_client.put_object(
            Bucket=STORAGE_BUCKET,
            Key=proposal_s3_key,
            Body=json.dumps(proposed_schema, indent=2),
            ContentType="application/json"
        )

    # Record analysis in DynamoDB
    table = dynamodb.Table(ANALYSES_TABLE)
    analysis_item = {
        "analysisId": analysis_id,
        "contractId": contract_id,
        "status": "QUEUED",
        "createdAt": now,
        "proposalS3Key": proposal_s3_key
    }
    table.put_item(Item=analysis_item)

    # Start Step Functions Execution
    execution_arn = ""
    if STATE_MACHINE_ARN:
        try:
            sfn_input = {
                "analysis_id": analysis_id,
                "contract_id": contract_id,
                "proposal_s3_key": proposal_s3_key
            }
            exec_res = stepfunctions.start_execution(
                stateMachineArn=STATE_MACHINE_ARN,
                name=f"exec-{analysis_id}",
                input=json.dumps(sfn_input)
            )
            execution_arn = exec_res.get("executionArn", "")
            table.update_item(
                Key={"analysisId": analysis_id},
                UpdateExpression="SET #st = :st, executionArn = :ea",
                ExpressionAttributeNames={"#st": "status"},
                ExpressionAttributeValues={":st": "RUNNING", ":ea": execution_arn}
            )
        except Exception as e:
            print(f"Error starting Step Functions execution: {e}")

    return response(202, {
        "analysis_id": analysis_id,
        "contract_id": contract_id,
        "status": "RUNNING" if execution_arn else "QUEUED",
        "execution_arn": execution_arn,
        "created_at": now
    })


def list_analyses():
    table = dynamodb.Table(ANALYSES_TABLE)
    scan_res = table.scan()
    items = scan_res.get("Items", [])
    # Sort by createdAt descending
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return response(200, {"analyses": items})


def get_analysis(analysis_id: str):
    table = dynamodb.Table(ANALYSES_TABLE)
    res = table.get_item(Key={"analysisId": analysis_id})
    if "Item" not in res:
        return response(404, {"error": f"Analysis '{analysis_id}' not found."})
    return response(200, {"analysis": res["Item"]})


def get_analysis_report(analysis_id: str):
    table = dynamodb.Table(ANALYSES_TABLE)
    res = table.get_item(Key={"analysisId": analysis_id})
    if "Item" not in res:
        return response(404, {"error": f"Analysis '{analysis_id}' not found."})

    analysis = res["Item"]
    report_s3_key = analysis.get("reportS3Key")

    if not report_s3_key or not STORAGE_BUCKET:
        return response(404, {"error": "Report not yet generated or available."})

    try:
        s3_obj = s3_client.get_object(Bucket=STORAGE_BUCKET, Key=report_s3_key)
        report = json.loads(s3_obj["Body"].read().decode("utf-8"))
        return response(200, {"report": report})
    except Exception as e:
        return response(500, {"error": f"Failed to retrieve report: {e}"})


def seed_demo_data():
    """Seeds the realistic Order Events contract and 3 downstream consumers."""
    contract_id = "contract-order-events"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # 1. Baseline Order Events Contract
    baseline_schema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
            "order_id": {"type": "string"},
            "customer_id": {"type": "string"},
            "total": {"type": "number"},
            "currency": {"type": "string", "enum": ["USD", "PKR"]},
            "created_at": {"type": "string", "format": "date-time"},
            "customer_email": {"type": "string"}
        },
        "required": ["order_id", "customer_id", "total", "currency", "created_at", "customer_email"],
        "additionalProperties": False
    }

    schema_s3_key = f"contracts/{contract_id}/versions/v1.json"
    if STORAGE_BUCKET:
        s3_client.put_object(
            Bucket=STORAGE_BUCKET,
            Key=schema_s3_key,
            Body=json.dumps(baseline_schema, indent=2),
            ContentType="application/json"
        )

    contracts_tbl = dynamodb.Table(CONTRACTS_TABLE)
    contracts_tbl.put_item(Item={
        "contractId": contract_id,
        "name": "Order Events",
        "description": "Core e-commerce order lifecycle events published by Orders Service.",
        "domain": "E-Commerce",
        "currentVersion": "1.0.0",
        "schemaS3Key": schema_s3_key,
        "createdAt": now,
        "updatedAt": now
    })

    # 2. Consumers
    consumers_tbl = dynamodb.Table(CONSUMERS_TABLE)
    demo_consumers = [
        {
            "consumerId": "consumer-billing-01",
            "name": "Billing Service",
            "type": "payment_service",
            "schema": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string"},
                    "customer_id": {"type": "string"},
                    "total": {"type": "number"},
                    "currency": {"type": "string"}
                },
                "required": ["order_id", "customer_id", "total", "currency"]
            }
        },
        {
            "consumerId": "consumer-analytics-02",
            "name": "Analytics Warehouse",
            "type": "warehouse",
            "schema": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string"},
                    "customer_id": {"type": "string"},
                    "total": {"type": "number"},
                    "created_at": {"type": "string"}
                },
                "required": ["order_id", "customer_id", "total", "created_at"]
            }
        },
        {
            "consumerId": "consumer-notify-03",
            "name": "Customer Notification Service",
            "type": "notification_service",
            "schema": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string"},
                    "customer_email": {"type": "string"}
                },
                "required": ["order_id", "customer_email"]
            }
        }
    ]

    for c in demo_consumers:
        s3_key = f"consumers/{contract_id}/{c['consumerId']}.json"
        if STORAGE_BUCKET:
            s3_client.put_object(
                Bucket=STORAGE_BUCKET,
                Key=s3_key,
                Body=json.dumps(c["schema"], indent=2),
                ContentType="application/json"
            )
        consumers_tbl.put_item(Item={
            "contractId": contract_id,
            "consumerId": c["consumerId"],
            "name": c["name"],
            "type": c["type"],
            "expectedSchemaS3Key": s3_key,
            "createdAt": now,
            "updatedAt": now
        })

    # Sample breaking schema for instant simulation
    breaking_schema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
            "order_id": {"type": "string"},
            "buyer_id": {"type": "string"},
            "total": {"type": "string"},
            "currency": {"type": "string", "enum": ["USD"]},
            "created_at": {"type": "string", "format": "date-time"},
            "customer_email": {"type": "string"},
            "discount_code": {"type": "string"}
        },
        "required": ["order_id", "buyer_id", "total", "currency", "created_at", "customer_email"],
        "additionalProperties": False
    }

    return response(200, {
        "message": "Demo data successfully seeded.",
        "contract_id": contract_id,
        "contract_name": "Order Events",
        "consumers_seeded": len(demo_consumers),
        "baseline_schema": baseline_schema,
        "sample_breaking_schema": breaking_schema
    })
