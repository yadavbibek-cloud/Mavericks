"""
Physics-Grounded Dataset Generator for Power Grid GNN Training.
Generates scenarios across nominal, thermal surge, heatwave, and cascading fault conditions.
"""

import os
import json
import random
from typing import Dict, List, Any
import numpy as np

from backend.simulator import GridSimulator

class GridDatasetGenerator:
    """Generates synthetic power grid topology snapshots with physics labels."""

    def __init__(self, seed: int = 42):
        self.sim = GridSimulator(seed=seed)
        self.node_ids = list(self.sim.graph.nodes())

    def generate_sample(self, stress_node: str = None, stress_mult: float = 1.0, ambient_temp: float = 28.0) -> Dict[str, Any]:
        """Generates a single graph state sample with physical labels."""
        if stress_node and stress_mult > 1.0:
            sim_res = self.sim.simulate_cascade(
                initiating_node=stress_node,
                stress_multiplier=stress_mult,
                ambient_temp_c=ambient_temp,
                max_steps=4
            )
            pf = sim_res["final_power_flow"]
        else:
            pf = self.sim.solve_power_flow()

        grid_state = self.sim.export_grid_state(pf)
        
        # Ground-truth failure labels & TTC targets
        node_labels = {}
        ttc_labels = {}
        node_map = {n["id"]: n for n in grid_state["nodes"]}

        for nid in self.node_ids:
            nd = node_map.get(nid, {})
            feats = nd.get("features", {})
            load = feats.get("load_pct", 50.0)
            temp = feats.get("temperature_c", 28.0)
            status = nd.get("status", "ONLINE")

            if status == "TRIPPED" or load > 105.0 or temp > 85.0:
                is_failed = 1.0
                ttc = 0.0
            elif load > 90.0 or temp > 72.0:
                is_failed = 0.85
                ttc = max(1.0, (110.0 - load) * 0.3)
            elif load > 75.0:
                is_failed = 0.35
                ttc = max(4.0, (120.0 - load) * 0.5)
            else:
                is_failed = 0.05
                ttc = 24.0

            node_labels[nid] = float(is_failed)
            ttc_labels[nid] = float(round(ttc, 2))

        # Overall cascade risk target
        max_label = max(node_labels.values())
        cascade_risk = min(1.0, max(0.05, max_label * 0.8 + (sum(1 for v in node_labels.values() if v > 0.5) * 0.05)))

        return {
            "grid_state": grid_state,
            "labels": {
                "node_failure_risk": node_labels,
                "time_to_critical_hours": ttc_labels,
                "cascade_risk": float(round(cascade_risk, 4))
            }
        }

    def generate_dataset(self, num_samples: int = 150) -> List[Dict[str, Any]]:
        """Generates a comprehensive dataset with balanced distribution of grid operating conditions."""
        samples = []
        candidates = ["T17", "F8", "S4", "T21", "T10", "F14", "T30", "F3"]

        for i in range(num_samples):
            rand_val = random.random()
            if rand_val < 0.30:
                # Normal baseline
                sample = self.generate_sample(ambient_temp=random.uniform(20.0, 32.0))
            elif rand_val < 0.65:
                # Moderate localized stress
                node = random.choice(candidates)
                mult = random.uniform(1.2, 1.7)
                temp = random.uniform(28.0, 38.0)
                sample = self.generate_sample(stress_node=node, stress_mult=mult, ambient_temp=temp)
            else:
                # Severe cascade contingency / heatwave
                node = random.choice(candidates)
                mult = random.uniform(1.8, 2.5)
                temp = random.uniform(38.0, 48.0)
                sample = self.generate_sample(stress_node=node, stress_mult=mult, ambient_temp=temp)
            
            samples.append(sample)

        return samples

    def export_splits(self, data_dir: str, train_count: int = 120, val_count: int = 30, test_count: int = 30):
        """Exports train.json, val.json, test.json splits."""
        os.makedirs(data_dir, exist_ok=True)
        total = train_count + val_count + test_count
        samples = self.generate_dataset(total)

        train_set = samples[:train_count]
        val_set = samples[train_count:train_count + val_count]
        test_set = samples[train_count + val_count:]

        with open(os.path.join(data_dir, "train.json"), "w") as f:
            json.dump(train_set, f, indent=2)
        with open(os.path.join(data_dir, "val.json"), "w") as f:
            json.dump(val_set, f, indent=2)
        with open(os.path.join(data_dir, "test.json"), "w") as f:
            json.dump(test_set, f, indent=2)

        print(f"Exported {len(train_set)} train, {len(val_set)} val, {len(test_set)} test samples to {data_dir}")
