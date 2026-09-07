"""
PyTorch Graph Dataset & DataLoader for PowerGridGNN.
"""

import json
import torch
from torch.utils.data import Dataset, DataLoader
from typing import List, Dict, Any, Tuple
import numpy as np

class PowerGridGraphDataset(Dataset):
    """PyTorch Dataset loading pre-computed graph states and supervision labels."""

    def __init__(self, json_path: str, node_ids: List[str]):
        self.node_ids = node_ids
        self.N = len(node_ids)
        with open(json_path, "r", encoding="utf-8") as f:
            self.samples = json.load(f)

    def __len__(self) -> int:
        return len(self.samples)

    def _extract_features(self, grid_state: Dict[str, Any]) -> torch.Tensor:
        features = np.zeros((self.N, 7), dtype=np.float32)
        node_map = {n["id"]: n for n in grid_state["nodes"]}

        for i, nid in enumerate(self.node_ids):
            node_data = node_map.get(nid, {})
            feats = node_data.get("features", {})
            load_pct = feats.get("load_pct", 50.0) / 100.0
            voltage_pu = feats.get("voltage_pu", 1.0)
            temp_norm = (feats.get("temperature_c", 28.0) - 25.0) / 50.0
            age_norm = feats.get("age_years", 10.0) / 20.0
            cap_norm = feats.get("capacity_mva", 10.0) / 30.0
            p_norm = feats.get("active_power_mw", 0.1) / 1.0
            q_norm = feats.get("reactive_power_mvar", 0.05) / 0.5

            if node_data.get("status") == "TRIPPED":
                load_pct = 2.0
                voltage_pu = 0.0
                temp_norm = 1.5

            features[i] = [load_pct, voltage_pu, temp_norm, age_norm, cap_norm, p_norm, q_norm]

        return torch.tensor(features, dtype=torch.float32)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
        sample = self.samples[idx]
        grid_state = sample["grid_state"]
        labels = sample["labels"]

        x = self._extract_features(grid_state)
        
        y_risk = torch.tensor([labels["node_failure_risk"].get(nid, 0.0) for nid in self.node_ids], dtype=torch.float32).unsqueeze(-1)
        y_ttc = torch.tensor([labels["time_to_critical_hours"].get(nid, 24.0) for nid in self.node_ids], dtype=torch.float32).unsqueeze(-1)
        y_cascade = torch.tensor(labels["cascade_risk"], dtype=torch.float32)

        return x, y_risk, y_ttc, y_cascade
