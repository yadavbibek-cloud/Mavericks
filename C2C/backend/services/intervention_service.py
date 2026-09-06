"""
Intervention Service:
Conducts counterfactual what-if searches and risk reduction evaluations.
"""

from typing import Dict, Any
from simulation.interventions import InterventionEngine

class InterventionService:
    def __init__(self, engine: InterventionEngine = None):
        self.engine = engine or InterventionEngine()

    def simulate_intervention(
        self,
        grid_id: str = "ieee24",
        initiating_node: str = "T17",
        stress_multiplier: float = 1.85,
        action_type: str = "reduce_load",
        target_node: str = "T17",
        value_pct: float = 12.0
    ) -> Dict[str, Any]:
        return self.engine.apply_intervention(
            grid_id=grid_id,
            initiating_node=initiating_node,
            stress_multiplier=stress_multiplier,
            action_type=action_type,
            target_node=target_node,
            value_pct=value_pct
        )

    def find_best_intervention(
        self,
        grid_id: str = "ieee24",
        initiating_node: str = "T17",
        stress_multiplier: float = 1.85
    ) -> Dict[str, Any]:
        return self.engine.find_optimal_intervention(
            grid_id=grid_id,
            initiating_node=initiating_node,
            stress_multiplier=stress_multiplier
        )
