# SchemaShield REST API Reference

SchemaShield provides RESTful endpoints served via Amazon API Gateway and AWS Lambda.

Base URL format:
`https://{api-id}.execute-api.{region}.amazonaws.com/prod/api`

---

## 1. System Health

### `GET /api/health`
Returns runtime heartbeat and deployment metadata.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "SchemaShield Serverless Firewall",
  "version": "1.0.0",
  "timestamp": "2026-11-16T18:30:00Z"
}
```

---

## 2. Interactive Demo Seeding

### `POST /api/demo/seed`
Idempotently provisions the realistic Order Events contract along with three downstream consumers (Billing Service, Analytics Warehouse, Customer Notification Service).

**Response `200 OK`:**
```json
{
  "message": "Demo data successfully seeded.",
  "contract_id": "contract-order-events",
  "contract_name": "Order Events",
  "consumers_seeded": 3,
  "baseline_schema": { ... },
  "sample_breaking_schema": { ... }
}
```

---

## 3. Contracts Registry

### `GET /api/contracts`
Retrieves all active data contracts.

**Response `200 OK`:**
```json
{
  "contracts": [
    {
      "contractId": "contract-order-events",
      "name": "Order Events",
      "description": "Core e-commerce order lifecycle events.",
      "domain": "E-Commerce",
      "currentVersion": "1.0.0",
      "consumerCount": 3,
      "createdAt": "2026-11-16T18:00:00Z",
      "updatedAt": "2026-11-16T18:00:00Z"
    }
  ]
}
```

### `POST /api/contracts`
Creates a new data contract.

**Request Body:**
```json
{
  "name": "Payment Events",
  "domain": "FinTech",
  "description": "Payment authorization and settlement events.",
  "schema": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "properties": {
      "payment_id": { "type": "string" },
      "amount": { "type": "number" }
    },
    "required": ["payment_id", "amount"]
  }
}
```

**Response `201 Created`:**
```json
{
  "contract": {
    "contractId": "contract-a1b2c3d4",
    "name": "Payment Events",
    "domain": "FinTech",
    "currentVersion": "1.0.0",
    "schemaS3Key": "contracts/contract-a1b2c3d4/versions/v1.json"
  }
}
```

### `GET /api/contracts/{contractId}`
Returns contract metadata including full active schema definition.

---

## 4. Consumer Registry

### `GET /api/contracts/{contractId}/consumers`
Lists all downstream consumers registered for the contract.

**Response `200 OK`:**
```json
{
  "consumers": [
    {
      "contractId": "contract-order-events",
      "consumerId": "consumer-billing-01",
      "name": "Billing Service",
      "type": "payment_service",
      "expected_schema": { ... }
    }
  ]
}
```

### `POST /api/contracts/{contractId}/consumers`
Registers a new consumer against an existing contract.

---

## 5. Contract Verification & Step Functions Execution

### `POST /api/contracts/{contractId}/analyze`
Starts asynchronous Step Functions execution to analyze proposed schema changes.

**Request Body:**
```json
{
  "proposed_schema": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "properties": {
      "order_id": { "type": "string" },
      "buyer_id": { "type": "string" }
    },
    "required": ["order_id", "buyer_id"]
  }
}
```

**Response `202 Accepted`:**
```json
{
  "analysis_id": "analysis-9f8e7d6c",
  "contract_id": "contract-order-events",
  "status": "RUNNING",
  "execution_arn": "arn:aws:states:us-east-1:237657481511:execution:schemashield-machine:exec-analysis-9f8e7d6c",
  "created_at": "2026-11-16T18:32:00Z"
}
```

### `GET /api/analyses`
Lists previous analysis executions sorted chronologically.

### `GET /api/analyses/{analysisId}`
Returns summary status, risk score, and verdict for an analysis.

### `GET /api/analyses/{analysisId}/report`
Returns the full durable JSON report saved in Amazon S3, including schema diff findings, per-consumer validation status, and migration action items.
