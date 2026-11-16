"""Schema validator module for JSON Schema Draft 2020-12 compliance and integrity."""

from typing import Any, Dict, List, Tuple


VALID_TYPES = {"string", "number", "integer", "boolean", "object", "array", "null"}


def validate_schema_structure(schema: Any, path: str = "$") -> Tuple[bool, List[str]]:
    """Recursively validates that a dictionary is a syntactically sound JSON Schema.

    Returns:
        (is_valid, error_messages)
    """
    errors: List[str] = []

    if not isinstance(schema, dict):
        return False, [f"Schema at '{path}' must be a JSON object (dict), got {type(schema).__name__}"]

    # Validate 'type' if present
    if "type" in schema:
        schema_type = schema["type"]
        if isinstance(schema_type, str):
            if schema_type not in VALID_TYPES:
                errors.append(f"Invalid type '{schema_type}' at '{path}'. Expected one of {sorted(VALID_TYPES)}")
        elif isinstance(schema_type, list):
            for t in schema_type:
                if t not in VALID_TYPES:
                    errors.append(f"Invalid union type item '{t}' at '{path}'. Expected one of {sorted(VALID_TYPES)}")
        else:
            errors.append(f"'type' at '{path}' must be a string or list of strings")

    # Validate 'required' if present
    if "required" in schema:
        req = schema["required"]
        if not isinstance(req, list):
            errors.append(f"'required' at '{path}' must be an array of strings")
        else:
            for item in req:
                if not isinstance(item, str):
                    errors.append(f"'required' item at '{path}' must be a string, got {item}")

    # Validate 'properties' if present
    if "properties" in schema:
        props = schema["properties"]
        if not isinstance(props, dict):
            errors.append(f"'properties' at '{path}' must be a dictionary")
        else:
            for prop_name, prop_schema in props.items():
                child_valid, child_errs = validate_schema_structure(prop_schema, f"{path}.properties.{prop_name}")
                if not child_valid:
                    errors.extend(child_errs)

    # Validate 'items' if present (for array schemas)
    if "items" in schema:
        items = schema["items"]
        if isinstance(items, dict):
            child_valid, child_errs = validate_schema_structure(items, f"{path}.items")
            if not child_valid:
                errors.extend(child_errs)
        elif isinstance(items, list):
            for idx, item in enumerate(items):
                child_valid, child_errs = validate_schema_structure(item, f"{path}.items[{idx}]")
                if not child_valid:
                    errors.extend(child_errs)
        else:
            errors.append(f"'items' at '{path}' must be a dictionary or list")

    # Validate 'enum' if present
    if "enum" in schema:
        if not isinstance(schema["enum"], list):
            errors.append(f"'enum' at '{path}' must be a list")

    return len(errors) == 0, errors
