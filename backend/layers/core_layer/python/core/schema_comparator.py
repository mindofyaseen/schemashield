"""Deterministic Schema Comparator Engine.

Compares two JSON Schemas (Draft 2020-12) to detect:
- Breaking changes (Field removal, incompatible type changes, narrowing enums, making required fields optional)
- Risky changes (Adding newly required fields, narrowing constraints)
- Safe changes (Adding optional properties, adding enum values, metadata updates)
"""

from typing import Any, Dict, List, Optional
import uuid


def compare_schemas(old_schema: Dict[str, Any], new_schema: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Compares old_schema with new_schema and produces an ordered list of structured findings."""
    findings: List[Dict[str, Any]] = []
    _compare_schema_node(old_schema, new_schema, path="$", findings=findings)
    return findings


def _compare_schema_node(old_node: Dict[str, Any], new_node: Dict[str, Any], path: str, findings: List[Dict[str, Any]]) -> None:
    if not isinstance(old_node, dict) or not isinstance(new_node, dict):
        return

    # 1. Type comparison
    old_type = old_node.get("type")
    new_type = new_node.get("type")

    if old_type and new_type:
        if old_type != new_type:
            # Check integer -> number compatibility (widening is safe, narrowing or string change is breaking)
            if old_type == "integer" and new_type == "number":
                findings.append({
                    "id": str(uuid.uuid4())[:8],
                    "path": path,
                    "change_type": "TYPE_WIDENED",
                    "severity": "LOW",
                    "category": "SAFE",
                    "message": f"Field type widened from '{old_type}' to '{new_type}'.",
                    "old_value": old_type,
                    "new_value": new_type,
                    "suggested_action": "Verify downstream systems accept floating-point numbers if previously expecting strict integers."
                })
            else:
                findings.append({
                    "id": str(uuid.uuid4())[:8],
                    "path": path,
                    "change_type": "TYPE_CHANGED",
                    "severity": "HIGH",
                    "category": "BREAKING",
                    "message": f"Incompatible type change: changed from '{old_type}' to '{new_type}'.",
                    "old_value": old_type,
                    "new_value": new_type,
                    "suggested_action": f"Maintain backward compatibility by preserving type '{old_type}' or introduce a versioned alias."
                })

    # 2. Enum comparison
    old_enums = old_node.get("enum")
    new_enums = new_node.get("enum")
    if old_enums is not None and new_enums is not None:
        old_set = set(old_enums)
        new_set = set(new_enums)
        removed_enums = old_set - new_set
        added_enums = new_set - old_set

        if removed_enums:
            findings.append({
                "id": str(uuid.uuid4())[:8],
                "path": path,
                "change_type": "ENUM_NARROWED",
                "severity": "HIGH",
                "category": "BREAKING",
                "message": f"Allowed enum values removed: {sorted(list(removed_enums))}. Upstream producer will no longer accept/produce these.",
                "old_value": sorted(list(old_set)),
                "new_value": sorted(list(new_set)),
                "suggested_action": f"Avoid removing enum values {sorted(list(removed_enums))} or ensure no downstream consumers expect them."
            })
        if added_enums:
            findings.append({
                "id": str(uuid.uuid4())[:8],
                "path": path,
                "change_type": "ENUM_EXPANDED",
                "severity": "LOW",
                "category": "SAFE",
                "message": f"New enum values added: {sorted(list(added_enums))}.",
                "old_value": sorted(list(old_set)),
                "new_value": sorted(list(new_set)),
                "suggested_action": "Ensure downstream consumers handle newly added enum values gracefully."
            })

    # 3. Required fields comparison
    old_req = set(old_node.get("required", []))
    new_req = set(new_node.get("required", []))

    # Newly required fields
    newly_required = new_req - old_req
    for req_field in sorted(newly_required):
        # If the field was already in properties, it was made required
        is_new_field = req_field not in old_node.get("properties", {})
        findings.append({
            "id": str(uuid.uuid4())[:8],
            "path": f"{path}.{req_field}",
            "change_type": "REQUIRED_FIELD_ADDED",
            "severity": "HIGH" if not is_new_field else "CRITICAL",
            "category": "RISKY",
            "message": f"Field '{req_field}' is now marked as REQUIRED." + (" (New property introduced as required)" if is_new_field else " (Previously optional property is now required)"),
            "old_value": "optional" if not is_new_field else "non_existent",
            "new_value": "required",
            "suggested_action": f"Ensure all producers and consumers guarantee '{req_field}', or make it optional with default values."
        })

    # Previously required field is no longer required (relaxing requirement)
    # For a producer: if producer stops guaranteeing a field, consumers that rely on it may break!
    unrequired = old_req - new_req
    for unreq_field in sorted(unrequired):
        findings.append({
            "id": str(uuid.uuid4())[:8],
            "path": f"{path}.{unreq_field}",
            "change_type": "REQUIRED_FIELD_REMOVED",
            "severity": "HIGH",
            "category": "BREAKING",
            "message": f"Field '{unreq_field}' was previously REQUIRED by producer, but is now OPTIONAL.",
            "old_value": "required",
            "new_value": "optional",
            "suggested_action": f"Keep '{unreq_field}' required if downstream consumers depend on its guaranteed presence."
        })

    # 4. Properties comparison
    old_props = old_node.get("properties", {})
    new_props = new_node.get("properties", {})

    old_prop_names = set(old_props.keys())
    new_prop_names = set(new_props.keys())

    # Removed properties (BREAKING)
    removed_props = old_prop_names - new_prop_names
    for prop in sorted(removed_props):
        was_required = prop in old_req
        findings.append({
            "id": str(uuid.uuid4())[:8],
            "path": f"{path}.{prop}",
            "change_type": "PROPERTY_REMOVED",
            "severity": "CRITICAL" if was_required else "HIGH",
            "category": "BREAKING",
            "message": f"Property '{prop}' was removed from the schema." + (" (Was previously required)" if was_required else ""),
            "old_value": old_props[prop],
            "new_value": None,
            "suggested_action": f"Retain property '{prop}', deprecate it gradually, or provide an alias field."
        })

    # Added properties
    added_props = new_prop_names - old_prop_names
    for prop in sorted(added_props):
        is_required = prop in new_req
        if not is_required:
            findings.append({
                "id": str(uuid.uuid4())[:8],
                "path": f"{path}.{prop}",
                "change_type": "PROPERTY_ADDED",
                "severity": "LOW",
                "category": "SAFE",
                "message": f"Optional property '{prop}' added.",
                "old_value": None,
                "new_value": new_props[prop],
                "suggested_action": "Safe addition. Verify consumers with strict schema validation allow additional properties."
            })

    # Common properties: recurse
    common_props = old_prop_names & new_prop_names
    for prop in sorted(common_props):
        _compare_schema_node(old_props[prop], new_props[prop], f"{path}.{prop}", findings)

    # 5. Array items comparison
    old_items = old_node.get("items")
    new_items = new_node.get("items")
    if isinstance(old_items, dict) and isinstance(new_items, dict):
        _compare_schema_node(old_items, new_items, f"{path}[]", findings)

    # 6. AdditionalProperties comparison
    old_add = old_node.get("additionalProperties")
    new_add = new_node.get("additionalProperties")
    if old_add is not False and new_add is False:
        findings.append({
            "id": str(uuid.uuid4())[:8],
            "path": path,
            "change_type": "ADDITIONAL_PROPERTIES_RESTRICTED",
            "severity": "MEDIUM",
            "category": "RISKY",
            "message": "additionalProperties set to false; unexpected properties will be rejected.",
            "old_value": old_add,
            "new_value": False,
            "suggested_action": "Ensure no consumers send undeclared metadata fields."
        })
