"""Step 2: CompareSchemas Lambda Function.

Executes deterministic schema comparison between baseline and proposed schemas.
"""

import json
from core.schema_comparator import compare_schemas


def lambda_handler(event, context):
    print("Executing CompareSchemas for analysis:", event.get("analysis_id"))
    baseline_schema = event["baseline_schema"]
    proposed_schema = event["proposed_schema"]

    schema_findings = compare_schemas(baseline_schema, proposed_schema)

    return {
        "analysis_id": event["analysis_id"],
        "contract_id": event["contract_id"],
        "contract_name": event.get("contract_name", "Contract"),
        "proposed_schema": proposed_schema,
        "schema_findings": schema_findings
    }
