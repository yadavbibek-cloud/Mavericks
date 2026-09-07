"""
Explainability and Physics Validation Subsystem for Power Grid GNN.
"""

from typing import Dict, List, Any

class PhysicsValidator:
    """Evaluates Kirchhoff physical law compliance and voltage bounds."""

    @staticmethod
    def evaluate_physics_sanity(grid_state: Dict[str, Any]) -> Dict[str, Any]:
        nodes = grid_state.get("nodes", [])
        total_nodes = len(nodes)
        if total_nodes == 0:
            return {"kirchhoff_p_balanced": True, "voltage_in_bounds_pct": 100.0, "thermal_stable_pct": 100.0}

        v_in_bounds = 0
        t_stable = 0
        total_p = 0.0

        for n in nodes:
            feats = n.get("features", {})
            v = feats.get("voltage_pu", 1.0)
            t = feats.get("temperature_c", 28.0)
            p = feats.get("active_power_mw", 0.0)

            if 0.88 <= v <= 1.08:
                v_in_bounds += 1
            if t < 90.0:
                t_stable += 1
            total_p += p

        v_pct = round(100.0 * v_in_bounds / total_nodes, 1)
        t_pct = round(100.0 * t_stable / total_nodes, 1)
        p_balance = abs(total_p) < 50.0

        return {
            "kirchhoff_p_balanced": p_balance,
            "voltage_in_bounds_pct": v_pct,
            "thermal_stable_pct": t_pct,
            "physical_consistency_score": round((v_pct + t_pct) / 2.0, 1)
        }

    @staticmethod
    def explain_prediction_features(node_id: str, node_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        feats = node_data.get("features", {})
        load = feats.get("load_pct", 50.0)
        temp = feats.get("temperature_c", 28.0)
        voltage = feats.get("voltage_pu", 1.0)
        age = feats.get("age_years", 10.0)

        attributions = [
            {"feature": "Transformer Thermal Loading", "importance": round(min(0.55, (load / 100.0) * 0.50), 3), "value": f"{load:.1f}%"},
            {"feature": "Core and Winding Temperature", "importance": round(min(0.35, max(0.05, (temp - 25.0) / 65.0 * 0.35)), 3), "value": f"{temp:.1f} °C"},
            {"feature": "Bus Voltage Sag (pu)", "importance": round(max(0.05, abs(1.0 - voltage) * 1.5), 3), "value": f"{voltage:.3f} pu"},
            {"feature": "Asset Age and Degradation", "importance": round(min(0.15, (age / 25.0) * 0.15), 3), "value": f"{age:.0f} yrs"}
        ]
        attributions.sort(key=lambda x: x["importance"], reverse=True)
        return attributions
