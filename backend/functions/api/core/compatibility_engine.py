"""Deterministic Consumer Compatibility Engine.

Evaluates whether a proposed Producer JSON Schema satisfies the contract requirements
of registered downstream consumers.

Statuses:
- COMPATIBLE: All consumer requirements are fully satisfied.
- WARNING: Minor non-breaking or risky deviations (e.g., optional fields missing, enum expansions).
- BREAKING: Consumer required properties missing, type mismatches, or contract violations.
"""

from typing import Any, Dict, List, Optional, Set, Tuple


def check_consumer_compatibility(
    consumer: Dict[str, Any],
    producer_schema: Dict[str, Any]
) -> Dict[str, Any]:
    """Analyzes compatibility of a proposed producer schema against a consumer's expected schema.

    Returns:
        {
            "consumer_id": str,
            "consumer_name": str,
            "consumer_type": str,
            "status": "COMPATIBLE" | "WARNING" | "BREAKING",
            "affected_fields": List[str],
            "issues": List[Dict[str, Any]],
            "explanation": str,
            "recommended_fix": str
        }
    """
    consumer_id = consumer.get("consumer_id", "unknown")
    consumer_name = consumer.get("name") or consumer.get("consumer_name", "Unknown Consumer")
    consumer_type = consumer.get("type") or consumer.get("consumer_type", "service")
    expected_schema = consumer.get("expected_schema") or consumer.get("schema", {})

    issues: List[Dict[str, Any]] = []
    _evaluate_node_compatibility(
        consumer_node=expected_schema,
        producer_node=producer_schema,
        path="$",
        issues=issues
    )

    # Determine status
    has_breaking = any(i["severity"] in ("CRITICAL", "HIGH") for i in issues)
    has_warning = any(i["severity"] == "MEDIUM" for i in issues)

    if has_breaking:
        status = "BREAKING"
    elif has_warning:
        status = "WARNING"
    else:
        status = "COMPATIBLE"

    affected_fields = sorted(list({i["field_path"] for i in issues if "field_path" in i}))

    # Generate human-readable explanation
    if status == "COMPATIBLE":
        explanation = f"Proposed schema fully satisfies all requirements of '{consumer_name}'. All required fields and types match."
        recommended_fix = "No changes needed for this consumer."
    elif status == "WARNING":
        explanation = f"Potential issues detected for '{consumer_name}'. {len(issues)} non-critical warning(s) found."
        recommended_fix = "; ".join([i.get("fix", "") for i in issues if i.get("fix")])
    else:
        breaking_issues = [i for i in issues if i["severity"] in ("CRITICAL", "HIGH")]
        reasons = [b["message"] for b in breaking_issues]
        explanation = f"CRITICAL: Proposed schema breaks '{consumer_name}'. " + " | ".join(reasons)
        fixes = [b.get("fix", "") for b in breaking_issues if b.get("fix")]
        recommended_fix = "; ".join(fixes) if fixes else "Revert breaking field changes or update consumer schema."

    return {
        "consumer_id": consumer_id,
        "consumer_name": consumer_name,
        "consumer_type": consumer_type,
        "status": status,
        "affected_fields": affected_fields,
        "issues": issues,
        "explanation": explanation,
        "recommended_fix": recommended_fix
    }


def _evaluate_node_compatibility(
    consumer_node: Dict[str, Any],
    producer_node: Dict[str, Any],
    path: str,
    issues: List[Dict[str, Any]]
) -> None:
    if not isinstance(consumer_node, dict) or not isinstance(producer_node, dict):
        return

    # Check 1: Consumer Required Fields vs Producer Available & Guaranteed Properties
    consumer_req: List[str] = consumer_node.get("required", [])
    producer_props: Dict[str, Any] = producer_node.get("properties", {})
    producer_req: Set[str] = set(producer_node.get("required", []))

    for req_field in consumer_req:
        field_path = f"{path}.{req_field}"
        # Does producer provide this field at all?
        if req_field not in producer_props:
            issues.append({
                "field_path": field_path,
                "severity": "CRITICAL",
                "issue_type": "REQUIRED_FIELD_MISSING",
                "message": f"Consumer requires field '{req_field}', but it is missing in the proposed producer schema.",
                "fix": f"Restore property '{req_field}' in producer schema or provide an alias mapping."
            })
            continue

        # Does producer guarantee this field (is it in producer's required)?
        if req_field not in producer_req:
            issues.append({
                "field_path": field_path,
                "severity": "HIGH",
                "issue_type": "REQUIRED_FIELD_OPTIONAL_IN_PRODUCER",
                "message": f"Consumer requires field '{req_field}', but producer marks it as OPTIONAL (producer does not guarantee presence).",
                "fix": f"Add '{req_field}' to producer's 'required' array."
            })

    # Check 2: Properties type compatibility and deep inspection
    consumer_props: Dict[str, Any] = consumer_node.get("properties", {})

    for prop_name, c_prop_schema in consumer_props.items():
        if prop_name not in producer_props:
            # If not required, it was already handled or is optional
            continue

        p_prop_schema = producer_props[prop_name]
        field_path = f"{path}.{prop_name}"

        c_type = c_prop_schema.get("type") if isinstance(c_prop_schema, dict) else None
        p_type = p_prop_schema.get("type") if isinstance(p_prop_schema, dict) else None

        if c_type and p_type:
            # Type compatibility logic
            # If types don't match:
            # integer can satisfy number if consumer expects number and producer emits integer
            compatible = (c_type == p_type) or (c_type == "number" and p_type == "integer")
            if not compatible:
                issues.append({
                    "field_path": field_path,
                    "severity": "HIGH",
                    "issue_type": "TYPE_MISMATCH",
                    "message": f"Consumer expects type '{c_type}' for '{prop_name}', but producer supplies '{p_type}'.",
                    "fix": f"Keep type of '{prop_name}' as '{c_type}' in producer schema."
                })

        # Check Enum compatibility
        if isinstance(c_prop_schema, dict) and isinstance(p_prop_schema, dict):
            c_enum = c_prop_schema.get("enum")
            p_enum = p_prop_schema.get("enum")

            if c_enum and p_enum:
                # Producer enums must be subset of or covered by consumer enums
                c_set = set(c_enum)
                p_set = set(p_enum)
                unsupported_producer_values = p_set - c_set
                if unsupported_producer_values:
                    issues.append({
                        "field_path": field_path,
                        "severity": "HIGH",
                        "issue_type": "ENUM_MISMATCH",
                        "message": f"Producer emits enum values {sorted(list(unsupported_producer_values))} which consumer '{path}.{prop_name}' does not accept.",
                        "fix": f"Limit producer enums to consumer accepted set: {sorted(list(c_set))}."
                    })

            # Check nested object
            if c_type == "object" and p_type == "object":
                _evaluate_node_compatibility(c_prop_schema, p_prop_schema, field_path, issues)

            # Check array items
            if c_type == "array" and p_type == "array":
                c_items = c_prop_schema.get("items")
                p_items = p_prop_schema.get("items")
                if isinstance(c_items, dict) and isinstance(p_items, dict):
                    _evaluate_node_compatibility(c_items, p_items, f"{field_path}[]", issues)

    # Check 3: Consumer additionalProperties: false restriction
    if consumer_node.get("additionalProperties") is False:
        extra_props = set(producer_props.keys()) - set(consumer_props.keys())
        if extra_props:
            issues.append({
                "field_path": path,
                "severity": "MEDIUM",
                "issue_type": "ADDITIONAL_PROPERTIES_VIOLATION",
                "message": f"Consumer rejects additional properties, but producer introduces undeclared fields: {sorted(list(extra_props))}.",
                "fix": "Remove extra fields or configure consumer to allow additionalProperties."
            })
