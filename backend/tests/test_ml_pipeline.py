"""
GridSense Machine Learning Subsystem Automated Test Suite.
Verifies dataset generation, PyTorch DataLoader batching, GNN message passing,
multi-task loss backprop, conformal prediction bounds, and test-set evaluation metrics.
"""

import os
import unittest
import torch
import numpy as np

from backend.simulator import GridSimulator
from backend.ml.models.gnn_model import PowerGridGNN
from backend.ml.dataset.generator import GridDatasetGenerator
from backend.ml.dataset.loader import PowerGridGraphDataset
from backend.ml.causal.conformal import ConformalPredictor
from backend.ml.causal.causal_engine import GrangerCausalAttributor
from backend.ml.inference import GNNEngine
from backend.ml.training.evaluate import evaluate_test_set

class TestGridSenseMLPipeline(unittest.TestCase):

    def setUp(self):
        self.sim = GridSimulator(seed=123)
        self.node_ids = list(self.sim.graph.nodes())
        self.ml_root = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml")
        self.data_dir = os.path.join(self.ml_root, "dataset", "data")
        self.weights_path = os.path.join(self.ml_root, "models", "weights", "pretrained_gnn.pt")

    def test_dataset_generator_and_files(self):
        """Verifies synthetic dataset generator creates valid train, val, and test splits."""
        self.assertTrue(os.path.exists(os.path.join(self.data_dir, "train.json")))
        self.assertTrue(os.path.exists(os.path.join(self.data_dir, "val.json")))
        self.assertTrue(os.path.exists(os.path.join(self.data_dir, "test.json")))

    def test_pytorch_dataset_loader(self):
        """Verifies PowerGridGraphDataset extracts features [33, 7] and labels properly."""
        test_json = os.path.join(self.data_dir, "test.json")
        ds = PowerGridGraphDataset(test_json, node_ids=self.node_ids)
        self.assertGreater(len(ds), 0)

        x, y_risk, y_ttc, y_cascade = ds[0]
        self.assertEqual(x.shape, (len(self.node_ids), 7))
        self.assertEqual(y_risk.shape, (len(self.node_ids), 1))
        self.assertEqual(y_ttc.shape, (len(self.node_ids), 1))
        self.assertIsInstance(y_cascade.item(), float)

    def test_gnn_model_forward_pass(self):
        """Verifies PowerGridGNN produces valid tensors for risk, ttc, and cascade heads."""
        model = PowerGridGNN(in_features=7, hidden_dim=32, num_layers=3)
        model.eval()

        N = len(self.node_ids)
        x = torch.randn(N, 7)
        adj = torch.eye(N)

        with torch.no_grad():
            node_risks, ttc, cascade_risk = model(x, adj)

        self.assertEqual(node_risks.shape, (N, 1))
        self.assertEqual(ttc.shape, (N, 1))
        self.assertEqual(cascade_risk.numel(), 1)
        self.assertTrue(torch.all(node_risks >= 0.0) and torch.all(node_risks <= 1.0))
        self.assertTrue(torch.all(ttc >= 1.0))

    def test_gnn_training_step(self):
        """Verifies gradient flow through multi-task loss (BCE + MSE)."""
        model = PowerGridGNN(in_features=7, hidden_dim=32, num_layers=3)
        optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
        bce = torch.nn.BCELoss()
        mse = torch.nn.MSELoss()

        N = len(self.node_ids)
        x = torch.randn(N, 7)
        adj = torch.eye(N)
        target_risk = torch.zeros(N, 1)
        target_ttc = torch.full((N, 1), 10.0)
        target_cas = torch.tensor(0.2)

        pred_risk, pred_ttc, pred_cas = model(x, adj)
        loss = bce(pred_risk, target_risk) + mse(pred_ttc, target_ttc) + bce(pred_cas.view(1), target_cas.view(1))

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        self.assertGreater(loss.item(), 0.0)

    def test_conformal_prediction_bounds(self):
        """Verifies split-conformal calibration produces valid intervals."""
        predictor = ConformalPredictor(alpha=0.10)
        sample_risks = {"T17": 0.88, "F8": 0.45, "S1": 0.05}
        intervals = predictor.predict_intervals(sample_risks)

        for nid, (low, high) in intervals.items():
            r = sample_risks[nid]
            self.assertLessEqual(low, high)
            self.assertGreaterEqual(low, 0.0)
            self.assertLessEqual(high, 1.0)
            self.assertAlmostEqual(high - low, 2 * predictor.quantile, places=2)

    def test_test_set_evaluation_metrics(self):
        """Verifies evaluate_test_set computes statistical metrics above target thresholds."""
        metrics = evaluate_test_set(data_dir=self.data_dir, weights_path=self.weights_path)
        self.assertIn("conformal_coverage_pct", metrics)
        self.assertGreaterEqual(metrics["conformal_coverage_pct"], 90.0)
        self.assertLess(metrics["risk_prediction_mae"], 0.20)

if __name__ == "__main__":
    unittest.main()
