"""
Entrypoint script to train the GridSense GNN model locally.
"""

import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.training.train import train_gridsense_model

if __name__ == "__main__":
    dataset_file = r"C:\GridSense\PowerGraph-XAI-master\PowerGraph-XAI-master\dataset\raw\dataset_cascades\ieee24\ieee24\processed\data.pt"
    output_model = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", "gridsense_gnn.pt"))
    output_metrics = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "results", "metrics.json"))
    
    print(f"Executing GridSense Training Script...")
    train_gridsense_model(
        dataset_path=dataset_file,
        output_model_path=output_model,
        output_metrics_path=output_metrics,
        epochs=8, # Fast efficient convergence
        max_samples=1500
    )
