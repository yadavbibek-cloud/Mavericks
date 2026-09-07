"""
PyTorch Spatial Message-Passing Graph Neural Network for Power Grids.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, Optional
from .heads import FailureRiskHead, TimeToCriticalHead, CascadeRiskHead

class PowerGridGNN(nn.Module):
    """
    GraphSAGE-inspired Inductive Graph Neural Network.
    Aggregates physical telemetry across electrical topology with residual LayerNorm connections.
    """

    def __init__(self, in_features: int = 7, hidden_dim: int = 32, num_layers: int = 3):
        super(PowerGridGNN, self).__init__()
        self.in_features = in_features
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

        # Physical feature encoder: [load_pct, voltage_pu, temp_norm, age_norm, cap_norm, p_norm, q_norm]
        self.encoder = nn.Sequential(
            nn.Linear(in_features, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.1)
        )

        # Message Passing Layers (SAGE-style aggregation)
        self.msg_weights = nn.ModuleList([
            nn.Linear(hidden_dim * 2, hidden_dim) for _ in range(num_layers)
        ])
        self.layer_norms = nn.ModuleList([
            nn.LayerNorm(hidden_dim) for _ in range(num_layers)
        ])

        # Multi-task output heads
        self.failure_head = FailureRiskHead(hidden_dim, 16)
        self.ttc_head = TimeToCriticalHead(hidden_dim, 16)
        self.cascade_head = CascadeRiskHead(hidden_dim, 16)

    def forward(self, x: torch.Tensor, adj: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Args:
            x: Node feature matrix [N, in_features]
            adj: Normalized adjacency matrix [N, N]
        Returns:
            node_risks: [N, 1] probability of failure
            time_to_critical: [N, 1] estimated hours
            cascade_risk: [1] system-wide cascade risk [0, 1]
        """
        h = self.encoder(x)

        # Spatial message passing
        for layer_idx in range(self.num_layers):
            h_neigh = torch.matmul(adj, h)
            h_cat = torch.cat([h, h_neigh], dim=-1)
            h_next = F.relu(self.msg_weights[layer_idx](h_cat))
            h = self.layer_norms[layer_idx](h + h_next)  # Residual connection

        node_risks = self.failure_head(h)
        time_to_critical = self.ttc_head(h) + 1.0  # Base min 1.0 hr offset
        cascade_risk = self.cascade_head(h)

        return node_risks, time_to_critical, cascade_risk
