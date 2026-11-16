"""Deterministic Risk Scoring & Release Verdict Engine.

Calculates an explainable risk score (0-100) and authoritative release verdict based on:
1. Schema-level diff findings
2. Impacted downstream consumer findings
"""

from typing import Any, Dict, List


SEVERITY_WEIGHTS = {
    "CRITICAL": 30,
    "HIGH": 20,
    "MEDIUM": 10,
    "LOW": 3,
}


def calculate_risk(
    schema_findings: List[Dict[str, Any]],
    consumer_results: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Calculates risk score, severity breakdown, and release verdict.

    Returns:
        {
            "risk_score": int (0-100),
            "risk_level": "LOW RISK" | "MODERATE RISK" | "HIGH RISK" | "CRITICAL RISK",
            "release_verdict": "SAFE TO RELEASE" | "REVIEW REQUIRED" | "BLOCK RELEASE",
            "severity_distribution": {
                "critical": int,
                "high": int,
                "medium": int,
                "low": int
            },
            "total_findings": int,
            "total_consumers": int,
            "compatible_consumers": int,
            "warning_consumers": int,
            "breaking_consumers": int,
            "blast_radius_percentage": float,
            "summary_explanation": str
        }
    """
    severity_distribution = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    raw_score = 0

    # 1. Score schema-level findings
    for finding in schema_findings:
        sev = finding.get("severity", "LOW").upper()
        if sev == "CRITICAL":
            severity_distribution["critical"] += 1
            raw_score += SEVERITY_WEIGHTS["CRITICAL"]
        elif sev == "HIGH":
            severity_distribution["high"] += 1
            raw_score += SEVERITY_WEIGHTS["HIGH"]
        elif sev == "MEDIUM":
            severity_distribution["medium"] += 1
            raw_score += SEVERITY_WEIGHTS["MEDIUM"]
        else:
            severity_distribution["low"] += 1
            raw_score += SEVERITY_WEIGHTS["LOW"]

    # 2. Score consumer impact
    breaking_consumers = 0
    warning_consumers = 0
    compatible_consumers = 0

    for c in consumer_results:
        status = c.get("status", "COMPATIBLE").upper()
        if status == "BREAKING":
            breaking_consumers += 1
            raw_score += 25  # Heavy penalty for broken downstream systems
        elif status == "WARNING":
            warning_consumers += 1
            raw_score += 10
        else:
            compatible_consumers += 1

    total_consumers = len(consumer_results)
    blast_radius_pct = (breaking_consumers / total_consumers * 100.0) if total_consumers > 0 else 0.0

    # Cap at 100
    risk_score = min(100, raw_score)

    # Determine risk level
    if risk_score >= 80:
        risk_level = "CRITICAL RISK"
    elif risk_score >= 50:
        risk_level = "HIGH RISK"
    elif risk_score >= 20:
        risk_level = "MODERATE RISK"
    else:
        risk_level = "LOW RISK"

    # Determine release verdict (Rule: Any breaking consumer MUST block release)
    if breaking_consumers > 0:
        release_verdict = "BLOCK RELEASE"
        summary_explanation = (
            f"Release blocked. {breaking_consumers} of {total_consumers} downstream consumer(s) "
            f"will fail due to breaking contract changes."
        )
    elif warning_consumers > 0 or severity_distribution["high"] > 0 or severity_distribution["medium"] > 0:
        release_verdict = "REVIEW REQUIRED"
        summary_explanation = (
            f"Review required before release. {warning_consumers} consumer warning(s) and "
            f"{severity_distribution['medium']} potential contract risk(s) detected."
        )
    else:
        release_verdict = "SAFE TO RELEASE"
        summary_explanation = "All downstream consumers are fully compatible. Backward compatibility preserved."

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "release_verdict": release_verdict,
        "severity_distribution": severity_distribution,
        "total_findings": len(schema_findings),
        "total_consumers": total_consumers,
        "compatible_consumers": compatible_consumers,
        "warning_consumers": warning_consumers,
        "breaking_consumers": breaking_consumers,
        "blast_radius_percentage": round(blast_radius_pct, 1),
        "summary_explanation": summary_explanation,
    }
