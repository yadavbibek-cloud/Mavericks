"""
PyTorch GNN Model Training Script.
Trains PowerGridGNN on generated IEEE-33 power grid datasets and serializes weights.
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import numpy as np

from backend.simulator import GridSimulator
from backend.ml.models.gnn_model import PowerGridGNN
from backend.ml.dataset.generator import GridDatasetGenerator
from backend.ml.dataset.loader import PowerGridGraphDataset

def train_gnn(
    data_dir: str,
    weights_path: str,
    epochs: int = 15,
    lr: float = 0.003,
    batch_size: int = 16
):
    sim = GridSimulator(seed=42)
    node_ids = list(sim.graph.nodes())

    # Ensure dataset exists
    train_json = os.path.join(data_dir, "train.json")
    val_json = os.path.join(data_dir, "val.json")
    if not os.path.exists(train_json) or not os.path.exists(val_json):
        print("Generating training dataset splits...")
        gen = GridDatasetGenerator(seed=42)
        gen.export_splits(data_dir=data_dir, train_count=100, val_count=25, test_count=25)

    train_ds = PowerGridGraphDataset(train_json, node_ids=node_ids)
    val_ds = PowerGridGraphDataset(val_json, node_ids=node_ids)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)

    model = PowerGridGNN(in_features=7, hidden_dim=32, num_layers=3)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    bce_loss = nn.BCELoss()
    mse_loss = nn.MSELoss()

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

    print(f"--> Training PowerGridGNN for {epochs} epochs...")
    best_val_loss = float("inf")

    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0

        for x, y_risk, y_ttc, y_cascade in train_loader:
            optimizer.zero_grad()
            batch_loss = 0.0
            
            # Process each sample in batch
            for b in range(x.shape[0]):
                pred_risk, pred_ttc, pred_cas = model(x[b], adj_norm)
                l_risk = bce_loss(pred_risk, y_risk[b])
                l_ttc = mse_loss(pred_ttc / 24.0, y_ttc[b] / 24.0)
                l_cas = bce_loss(pred_cas.view(1), y_cascade[b].view(1))
                loss = l_risk + 0.5 * l_ttc + 0.5 * l_cas
                batch_loss += loss

            batch_loss = batch_loss / x.shape[0]
            batch_loss.backward()
            optimizer.step()
            train_loss += batch_loss.item()

        scheduler.step()
        train_loss /= len(train_loader)

        # Validation
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for x, y_risk, y_ttc, y_cascade in val_loader:
                batch_loss = 0.0
                for b in range(x.shape[0]):
                    pred_risk, pred_ttc, pred_cas = model(x[b], adj_norm)
                    loss = bce_loss(pred_risk, y_risk[b]) + 0.5 * mse_loss(pred_ttc / 24.0, y_ttc[b] / 24.0)
                    batch_loss += loss
                val_loss += (batch_loss.item() / x.shape[0])
        val_loss /= len(val_loader)

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            os.makedirs(os.path.dirname(weights_path), exist_ok=True)
            torch.save(model.state_dict(), weights_path)

        if epoch % 5 == 0 or epoch == epochs:
            print(f"  Epoch [{epoch:02d}/{epochs:02d}] - Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")

    print(f"Training complete. Weights saved to: {weights_path}")
    return model

if __name__ == "__main__":
    ml_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(ml_root, "dataset", "data")
    weights_path = os.path.join(ml_root, "models", "weights", "pretrained_gnn.pt")
    train_gnn(data_dir=data_dir, weights_path=weights_path, epochs=15)
