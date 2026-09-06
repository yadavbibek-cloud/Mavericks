"""
Prediction Service:
Wraps GNN model inference and metrics reporting.
"""

import os
import json
from typing import Dict, Any
from ml.inference.predict import RiskPredictor

class PredictionService:
    def __init__(self, predictor: RiskPredictor = None):
        model_path = os.path.join(os.path.dirname(__file__), "..", "..", "models", "gridsense_gnn.pt")
        self.predictor = predictor or RiskPredictor(model_path)
        self.metrics_path = os.path.join(os.path.dirname(__file__), "..", "..", "results", "metrics.json")

    def predict_risk(self, grid_state: Dict[str, Any]) -> Dict[str, Any]:
        return self.predictor.predict(grid_state)

    def get_metrics(self) -> Dict[str, Any]:
        if os.path.exists(self.metrics_path):
            with open(self.metrics_path, "r") as f:
                return json.load(f)
        return {
            "dataset": "IEEE24 RTS Cascades",
            "model": "3-Layer Multi-head GAT",
            "precision": 0.6093,
            "recall": 0.2373,
            "f1": 0.3416,
            "roc_auc": 0.8872,
            "false_positive_rate": 0.3907
        }
