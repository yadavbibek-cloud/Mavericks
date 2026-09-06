"""
Uncertainty Service:
Wraps split-conformal prediction intervals and physics validation.
"""

from typing import Dict, Any, List
from ml.uncertainty.conformal import ConformalPredictor
from ml.physics.validation import PhysicsValidator
from ml.explainability.attribution import FeatureExplainer
from simulation.grid_loader import GridLoader

class UncertaintyService:
    def __init__(self):
        self.conformal = ConformalPredictor(alpha=0.10)
        self.physics = PhysicsValidator()
        self.explainer = FeatureExplainer()
        self.loader = GridLoader()

    def get_confidence_intervals(self, node_risks: Dict[str, float]) -> Dict[str, List[float]]:
        return self.conformal.batch_intervals(node_risks)

    def get_physics_validation(self, grid_id: str = "ieee24") -> Dict[str, Any]:
        net = self.loader.get_net(grid_id)
        self.loader.solve_power_flow(net)
        return self.physics.validate_grid_state(net)

    def get_feature_attributions(self, grid_state: Dict[str, Any], node_risks: Dict[str, float]) -> Dict[str, Dict[str, float]]:
        return self.explainer.explain_all_nodes(grid_state, node_risks)
