"""Step 4: AnalyzeConsumer Lambda Function (invoked in Map State).

Evaluates a single downstream consumer against the proposed producer schema.
"""

import json
from core.compatibility_engine import check_consumer_compatibility


def lambda_handler(event, context):
    consumer = event.get("consumer", {})
    proposed_schema = event.get("proposed_schema", {})

    print(f"Analyzing consumer: {consumer.get('name')} ({consumer.get('consumer_id')})")

    result = check_consumer_compatibility(consumer, proposed_schema)
    return result
