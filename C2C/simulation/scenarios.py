"""
GridSense Predefined Scenarios:
Provides calibrated scenarios for deterministic demo mode and benchmark testing.
"""

from typing import Dict, Any, List

SCENARIOS = {
    "normal": {
        "id": "normal",
        "name": "Normal Operating State",
        "description": "IEEE 24-bus grid operating within standard N-0 security limits. All voltages within 0.98-1.04 pu.",
        "initiating_node": "T17",
        "stress_multiplier": 1.0,
        "ambient_temp_c": 24.0,
        "base_risk_pct": 3.4
    },
    "transformer_overload": {
        "id": "transformer_overload",
        "name": "Transformer Overload (T17)",
        "description": "Localized surge at substation 17 causing severe thermal overload on step-up transformer T17.",
        "initiating_node": "T17",
        "stress_multiplier": 1.82,
        "ambient_temp_c": 32.0,
        "base_risk_pct": 82.0
    },
    "line_outage": {
        "id": "line_outage",
        "name": "Critical Transmission Line Outage",
        "description": "N-1 contingency: transmission corridor L14 trips unexpectedly, forcing flow redistribution onto parallel feeders.",
        "initiating_node": "B14",
        "stress_multiplier": 1.45,
        "ambient_temp_c": 28.0,
        "base_risk_pct": 68.5
    },
    "high_demand": {
        "id": "high_demand",
        "name": "High Demand Heatwave",
        "description": "Regional heatwave pushes ambient temperature to 39°C and elevates system-wide cooling demand by +35%.",
        "initiating_node": "B18",
        "stress_multiplier": 1.35,
        "ambient_temp_c": 39.0,
        "base_risk_pct": 61.0
    },
    "cascade_emergency": {
        "id": "cascade_emergency",
        "name": "Cascade Emergency (Critical)",
        "description": "Imminent cascading blackout: transformer T17 thermal breach rapidly propagating across feeder F8 and transformer T21 toward substation S4.",
        "initiating_node": "T17",
        "stress_multiplier": 1.95,
        "ambient_temp_c": 36.0,
        "base_risk_pct": 86.4
    },
    "india_delhi_overload": {
        "id": "india_delhi_overload",
        "name": "India: Delhi Patparganj Transformer Overload",
        "description": "Localized surge at Delhi transmission node causing severe thermal overload on Patparganj step-up transformer (DEL-TRAN-02 / T17).",
        "initiating_node": "DEL-TRAN-02",
        "stress_multiplier": 1.82,
        "ambient_temp_c": 38.5,
        "base_risk_pct": 84.5
    },
    "india_cascade": {
        "id": "india_cascade",
        "name": "India: Inter-Regional Backbone Cascade (Del-Mum-Blr)",
        "description": "Cascading event initiated at Delhi Patparganj propagating through Preet Vihar feeder, Mumbai transmission corridor, and Bengaluru regional hub.",
        "initiating_node": "DEL-TRAN-02",
        "stress_multiplier": 1.95,
        "ambient_temp_c": 39.0,
        "base_risk_pct": 89.2
    },
    "india_normal": {
        "id": "india_normal",
        "name": "India: 6-Hub National Grid Normal State",
        "description": "India 6-city synthetic demo network operating within N-0 security limits across Delhi, Mumbai, Bengaluru, Chennai, Kolkata, and Hyderabad.",
        "initiating_node": "DEL-TRAN-02",
        "stress_multiplier": 1.0,
        "ambient_temp_c": 29.0,
        "base_risk_pct": 3.8
    }
}

def get_scenario_list() -> List[Dict[str, Any]]:
    return [
        {
            "id": s["id"],
            "name": s["name"],
            "description": s["description"],
            "initiating_node": s["initiating_node"],
            "base_risk_pct": s["base_risk_pct"]
        }
        for s in SCENARIOS.values()
    ]

def get_scenario(scenario_id: str) -> Dict[str, Any]:
    return SCENARIOS.get(scenario_id.lower(), SCENARIOS["cascade_emergency"])
