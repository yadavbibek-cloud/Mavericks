"""
Multi-Task Prediction Heads for Power Grid GNN.
"""

import torch
import torch.nn as nn

class FailureRiskHead(nn.Module):
    """Predicts per-node failure probability in next horizon [0.0, 1.0]."""
    def __init__(self, in_features: int = 32, hidden_dim: int = 16):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_dim, 1),
            nn.Sigmoid()
        )

    def forward(self, h: torch.Tensor) -> torch.Tensor:
        return self.net(h)


class TimeToCriticalHead(nn.Module):
    """Predicts remaining hours until critical thermal / voltage violation (>= 0.0 hrs)."""
    def __init__(self, in_features: int = 32, hidden_dim: int = 16):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_dim, 1),
            nn.Softplus()
        )

    def forward(self, h: torch.Tensor) -> torch.Tensor:
        return self.net(h)


class CascadeRiskHead(nn.Module):
    """Predicts global system-wide cascade blackout probability [0.0, 1.0]."""
    def __init__(self, in_features: int = 32, hidden_dim: int = 16):
        super().__init__()
        self.pool = nn.Linear(in_features, in_features)
        self.net = nn.Sequential(
            nn.Linear(in_features, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1),
            nn.Sigmoid()
        )

    def forward(self, h: torch.Tensor) -> torch.Tensor:
        h_graph = torch.mean(self.pool(h), dim=0, keepdim=True)
        return self.net(h_graph).squeeze(-1)
