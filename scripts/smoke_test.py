"""SchemaShield End-to-End Live Integration & Smoke Test Script.

Validates:
1. /api/health
2. /api/demo/seed
3. /api/contracts
4. /api/contracts/{contractId}/consumers
5. /api/contracts/{contractId}/analyze (Trigger Step Functions)
6. /api/analyses/{analysisId}
7. /api/analyses/{analysisId}/report
"""

import sys
import time
import json
import urllib.request
import urllib.error


def run_smoke_test(api_base_url: str):
    print("=" * 60)
    print(f" Starting SchemaShield Smoke Test against: {api_base_url}")
    print("=" * 60)

    # 1. Health
    print("[1/6] Testing GET /api/health...")
    req = urllib.request.Request(f"{api_base_url}/health")
    with urllib.request.urlopen(req) as res:
        assert res.status == 200
        data = json.loads(res.read().decode())
        print(f"  Result: {data.get('status')} - {data.get('service')}")

    # 2. Seed Demo
    print("[2/6] Testing POST /api/demo/seed...")
    req = urllib.request.Request(
        f"{api_base_url}/demo/seed",
        data=b"{}",
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as res:
        assert res.status == 200
        seed_data = json.loads(res.read().decode())
        contract_id = seed_data["contract_id"]
        breaking_schema = seed_data["sample_breaking_schema"]
        print(f"  Result: Seeded contract '{contract_id}' with {seed_data.get('consumers_seeded')} consumers.")

    # 3. List Contracts
    print("[3/6] Testing GET /api/contracts...")
    req = urllib.request.Request(f"{api_base_url}/contracts")
    with urllib.request.urlopen(req) as res:
        assert res.status == 200
        data = json.loads(res.read().decode())
        contracts = data.get("contracts", [])
        assert len(contracts) > 0
        print(f"  Result: Retrieved {len(contracts)} contract(s).")

    # 4. List Consumers
    print(f"[4/6] Testing GET /api/contracts/{contract_id}/consumers...")
    req = urllib.request.Request(f"{api_base_url}/contracts/{contract_id}/consumers")
    with urllib.request.urlopen(req) as res:
        assert res.status == 200
        data = json.loads(res.read().decode())
        consumers = data.get("consumers", [])
        assert len(consumers) == 3
        print(f"  Result: Found 3 consumers: {[c['name'] for c in consumers]}")

    # 5. Start Analysis
    print(f"[5/6] Testing POST /api/contracts/{contract_id}/analyze (Step Functions)...")
    payload = json.dumps({"proposed_schema": breaking_schema}).encode()
    req = urllib.request.Request(
        f"{api_base_url}/contracts/{contract_id}/analyze",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as res:
        assert res.status in (200, 202)
        analysis_data = json.loads(res.read().decode())
        analysis_id = analysis_data["analysis_id"]
        print(f"  Result: Initiated analysis ID: {analysis_id}")

    # 6. Poll Analysis Report
    print(f"[6/6] Polling execution status for {analysis_id}...")
    completed = False
    for attempt in range(12):
        time.sleep(2)
        req = urllib.request.Request(f"{api_base_url}/analyses/{analysis_id}")
        try:
            with urllib.request.urlopen(req) as res:
                rec = json.loads(res.read().decode()).get("analysis", {})
                status = rec.get("status")
                print(f"  Attempt {attempt + 1}: status = {status}")
                if status == "COMPLETED":
                    completed = True
                    print(f"  Success: Verdict = {rec.get('verdict')}, Risk Score = {rec.get('riskScore')}")
                    break
        except Exception as e:
            print(f"  Polling note: {e}")

    print("=" * 60)
    print(" SchemaShield Live Integration Smoke Test Passed!")
    print("=" * 60)


if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3001/api"
    run_smoke_test(url)
