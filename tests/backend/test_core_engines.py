"""Unit tests for SchemaShield deterministic comparison, compatibility, and risk engines.

Covers all 14 mandatory test requirements.
"""

import unittest
import sys
import os

# Add backend to sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from core.schema_validator import validate_schema_structure
from core.schema_comparator import compare_schemas
from core.compatibility_engine import check_consumer_compatibility
from core.risk_engine import calculate_risk


class TestSchemaShieldCoreEngines(unittest.TestCase):

    def setUp(self):
        # Baseline producer Order Events schema
        self.baseline_schema = {
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

        # Billing Service Consumer
        self.billing_consumer = {
            "consumer_id": "c-billing-01",
            "name": "Billing Service",
            "type": "payment_service",
            "expected_schema": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string"},
                    "customer_id": {"type": "string"},
                    "total": {"type": "number"},
                    "currency": {"type": "string"}
                },
                "required": ["order_id", "customer_id", "total", "currency"]
            }
        }

        # Analytics Warehouse Consumer
        self.analytics_consumer = {
            "consumer_id": "c-analytics-02",
            "name": "Analytics Warehouse",
            "type": "warehouse",
            "expected_schema": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string"},
                    "customer_id": {"type": "string"},
                    "total": {"type": "number"},
                    "created_at": {"type": "string"}
                },
                "required": ["order_id", "customer_id", "total", "created_at"]
            }
        }

        # Customer Notification Service Consumer
        self.notification_consumer = {
            "consumer_id": "c-notify-03",
            "name": "Customer Notification Service",
            "type": "notification_service",
            "expected_schema": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string"},
                    "customer_email": {"type": "string"}
                },
                "required": ["order_id", "customer_email"]
            }
        }

    # 1. Field removal
    def test_01_field_removal(self):
        new_schema = {
            "type": "object",
            "properties": {"order_id": {"type": "string"}},
            "required": ["order_id"]
        }
        findings = compare_schemas(self.baseline_schema, new_schema)
        removed = [f for f in findings if f["change_type"] == "PROPERTY_REMOVED"]
        self.assertTrue(len(removed) > 0)
        self.assertTrue(any("customer_id" in f["path"] for f in removed))

    # 2. Field addition
    def test_02_field_addition(self):
        new_schema = dict(self.baseline_schema)
        new_schema["properties"] = dict(self.baseline_schema["properties"])
        new_schema["properties"]["discount_code"] = {"type": "string"}
        findings = compare_schemas(self.baseline_schema, new_schema)
        added = [f for f in findings if f["change_type"] == "PROPERTY_ADDED"]
        self.assertEqual(len(added), 1)
        self.assertEqual(added[0]["path"], "$.discount_code")
        self.assertEqual(added[0]["category"], "SAFE")

    # 3. Type change
    def test_03_type_change(self):
        new_schema = dict(self.baseline_schema)
        new_schema["properties"] = dict(self.baseline_schema["properties"])
        new_schema["properties"]["total"] = {"type": "string"}  # Changed from number to string
        findings = compare_schemas(self.baseline_schema, new_schema)
        type_changes = [f for f in findings if f["change_type"] == "TYPE_CHANGED"]
        self.assertEqual(len(type_changes), 1)
        self.assertEqual(type_changes[0]["category"], "BREAKING")

    # 4. Required field removal (Relaxing requirement)
    def test_04_required_field_removed_from_guarantee(self):
        new_schema = dict(self.baseline_schema)
        new_schema["required"] = ["order_id"]  # others made optional
        findings = compare_schemas(self.baseline_schema, new_schema)
        unreq = [f for f in findings if f["change_type"] == "REQUIRED_FIELD_REMOVED"]
        self.assertTrue(len(unreq) > 0)

    # 5. Newly required field
    def test_05_newly_required_field(self):
        new_schema = dict(self.baseline_schema)
        new_schema["properties"] = dict(self.baseline_schema["properties"])
        new_schema["properties"]["merchant_id"] = {"type": "string"}
        new_schema["required"] = self.baseline_schema["required"] + ["merchant_id"]
        findings = compare_schemas(self.baseline_schema, new_schema)
        req_added = [f for f in findings if f["change_type"] == "REQUIRED_FIELD_ADDED"]
        self.assertEqual(len(req_added), 1)
        self.assertEqual(req_added[0]["category"], "RISKY")

    # 6. Enum narrowing
    def test_06_enum_narrowing(self):
        new_schema = dict(self.baseline_schema)
        new_schema["properties"] = dict(self.baseline_schema["properties"])
        new_schema["properties"]["currency"] = {"type": "string", "enum": ["USD"]}  # PKR removed
        findings = compare_schemas(self.baseline_schema, new_schema)
        narrowed = [f for f in findings if f["change_type"] == "ENUM_NARROWED"]
        self.assertEqual(len(narrowed), 1)
        self.assertEqual(narrowed[0]["category"], "BREAKING")

    # 7. Nested object changes
    def test_07_nested_object_changes(self):
        old_nested = {
            "type": "object",
            "properties": {
                "address": {
                    "type": "object",
                    "properties": {"city": {"type": "string"}, "zip": {"type": "string"}},
                    "required": ["city", "zip"]
                }
            }
        }
        new_nested = {
            "type": "object",
            "properties": {
                "address": {
                    "type": "object",
                    "properties": {"city": {"type": "string"}, "zip": {"type": "integer"}},  # zip changed type
                    "required": ["city"]  # zip no longer required
                }
            }
        }
        findings = compare_schemas(old_nested, new_nested)
        self.assertTrue(any("zip" in f["path"] and f["change_type"] == "TYPE_CHANGED" for f in findings))

    # 8. Array item changes
    def test_08_array_item_changes(self):
        old_arr = {
            "type": "object",
            "properties": {
                "items": {"type": "array", "items": {"type": "string"}}
            }
        }
        new_arr = {
            "type": "object",
            "properties": {
                "items": {"type": "array", "items": {"type": "number"}}
            }
        }
        findings = compare_schemas(old_arr, new_arr)
        self.assertTrue(any(f["change_type"] == "TYPE_CHANGED" for f in findings))

    # 9. Optional compatible additions
    def test_09_optional_compatible_additions(self):
        new_schema = dict(self.baseline_schema)
        new_schema["properties"] = dict(self.baseline_schema["properties"])
        new_schema["properties"]["notes"] = {"type": "string"}
        findings = compare_schemas(self.baseline_schema, new_schema)
        breaking = [f for f in findings if f["category"] == "BREAKING"]
        self.assertEqual(len(breaking), 0)

    # 10. Consumer requiring a missing field
    def test_10_consumer_requiring_missing_field(self):
        proposed_producer = {
            "type": "object",
            "properties": {
                "order_id": {"type": "string"},
                "buyer_id": {"type": "string"}  # customer_id renamed!
            },
            "required": ["order_id", "buyer_id"]
        }
        res = check_consumer_compatibility(self.billing_consumer, proposed_producer)
        self.assertEqual(res["status"], "BREAKING")
        self.assertIn("$.customer_id", res["affected_fields"])

    # 11. Consumer rejecting a producer type
    def test_11_consumer_rejecting_producer_type(self):
        proposed_producer = {
            "type": "object",
            "properties": {
                "order_id": {"type": "string"},
                "customer_id": {"type": "string"},
                "total": {"type": "string"},  # type mismatch: string vs number
                "currency": {"type": "string"}
            },
            "required": ["order_id", "customer_id", "total", "currency"]
        }
        res = check_consumer_compatibility(self.billing_consumer, proposed_producer)
        self.assertEqual(res["status"], "BREAKING")
        self.assertTrue(any(i["issue_type"] == "TYPE_MISMATCH" for i in res["issues"]))

    # 12. Unaffected consumer detection (Exact Demo Scenario!)
    def test_12_unaffected_consumer_detection(self):
        # Demo breaking schema: customer_id -> buyer_id, total number -> string, currency narrowed, discount_code added
        proposed_breaking = {
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
            "required": ["order_id", "buyer_id", "total", "currency", "created_at", "customer_email"]
        }

        billing_res = check_consumer_compatibility(self.billing_consumer, proposed_breaking)
        analytics_res = check_consumer_compatibility(self.analytics_consumer, proposed_breaking)
        notify_res = check_consumer_compatibility(self.notification_consumer, proposed_breaking)

        self.assertEqual(billing_res["status"], "BREAKING")
        self.assertEqual(analytics_res["status"], "BREAKING")
        self.assertEqual(notify_res["status"], "COMPATIBLE")  # Correctly remains green/compatible!

        # Verify risk score & verdict
        schema_findings = compare_schemas(self.baseline_schema, proposed_breaking)
        risk = calculate_risk(schema_findings, [billing_res, analytics_res, notify_res])
        self.assertEqual(risk["release_verdict"], "BLOCK RELEASE")
        self.assertEqual(risk["breaking_consumers"], 2)
        self.assertEqual(risk["compatible_consumers"], 1)

    # 13. Malformed schema rejection
    def test_13_malformed_schema_rejection(self):
        malformed = {"type": "invalid_type_name", "properties": "not_a_dict"}
        is_valid, errors = validate_schema_structure(malformed)
        self.assertFalse(is_valid)
        self.assertTrue(len(errors) >= 2)

    # 14. Invalid input handling
    def test_14_invalid_input_handling(self):
        is_valid, errors = validate_schema_structure("just a string")
        self.assertFalse(is_valid)
        self.assertIn("must be a JSON object", errors[0])


if __name__ == "__main__":
    unittest.main()
