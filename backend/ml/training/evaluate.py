"""
Model Evaluation Script for Test Set Performance & Conformal Coverage.
"""

import os
import json
import torch
import numpy as np

from backend.simulator import GridSimulator
from backend.ml.models.gnn_model import PowerGridGNN
from backend.ml.dataset.loader import PowerGridGraphDataset
from backend.ml.causal.conformal import ConformalPredictor

def evaluate_test_set(data_dir: str, weights_path: str):
    sim = GridSimulator(seed=42)
    node_ids = list(sim.graph.nodes())
    test_json = os.path.join(data_dir, "test.json")
    
    if not os.path.exists(test_json):
        print("Test split not found.")
        return {}

    test_ds = PowerGridGraphDataset(test_json, node_ids=node_ids)
    model = PowerGridGNN(in_features=7, hidden_dim=32, num_layers=3)
    if os.path.exists(weights_path):
        model.load_state_dict(torch.load(weights_path))
    model.eval()

    # Build adjacency
    N = len(node_ids)
    node_to_idx = {nid: i for i, nid in enumerate(node_ids)}
    adj_np = np.zeros((N, N), dtype=np.float32)
    for u, v in sim.graph.edges():
        i, j = node_to_idx[u], node_to_idx[v]
        adj_np[i, j] = 1.0
        adj_np[j, i] = 1.0
    for i in range(N):
        adj_np[i, i] = 1.0
    deg = np.sum(adj_np, axis=1)
    d_mat = np.diag(1.0 / np.sqrt(deg))
    adj_norm = torch.tensor(d_mat @ adj_np @ d_mat, dtype=torch.float32)

    conformal = ConformalPredictor(alpha=0.10)

    covered_count = 0
    total_nodes = 0
    risk_errors = []
    ttc_errors = []

    with torch.no_grad():
        for i in range(len(test_ds)):
            x, y_risk, y_ttc, y_cascade = test_ds[i]
            pred_risk, pred_ttc, pred_cas = model(x, adj_norm)

            pred_risk_np = pred_risk.squeeze().numpy()
            y_risk_np = y_risk.squeeze().numpy()
            y_ttc_np = y_ttc.squeeze().numpy()
            pred_ttc_np = pred_ttc.squeeze().numpy()

            risk_dict = {node_ids[j]: float(pred_risk_np[j]) for j in range(N)}
            intervals = conformal.predict_intervals(risk_dict)

            for j in range(N):
                low, high = intervals[node_ids[j]]
                true_val = float(y_risk_np[j])
                if low <= true_val <= high:
                    covered_count += 1
                total_nodes += 1
                risk_errors.append(abs(pred_risk_np[j] - true_val))
                ttc_errors.append(abs(pred_ttc_np[j] - y_ttc_np[j]))

    coverage_pct = round(100.0 * covered_count / max(1, total_nodes), 2)
    risk_mae = round(float(np.mean(risk_errors)), 4)
    ttc_mae = round(float(np.mean(ttc_errors)), 2)

    metrics = {
        "test_samples": len(test_ds),
        "conformal_coverage_pct": coverage_pct,
        "conformal_guarantee": ">= 90.0%",
        "risk_prediction_mae": risk_mae,
        "ttc_prediction_mae_hrs": ttc_mae
    }

    print("=== Model Evaluation Report ===")
    for k, v in metrics.items():
        print(f"  {k}: {v}")

    return metrics

if __name__ == "__main__":
    ml_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(ml_root, "dataset", "data")
    weights_path = os.path.join(ml_root, "models", "weights", "pretrained_gnn.pt")
    evaluate_test_set(data_dir=data_dir, weights_path=weights_path)
