"""
GridSense Graph Neural Network (GNN) Engine
Modular wrapper referencing backend.ml package.
"""

from .ml import PowerGridGNN, GNNEngine
from .simulator import global_simulator

global_gnn_engine = GNNEngine(simulator=global_simulator)

__all__ = ["PowerGridGNN", "GNNEngine", "global_gnn_engine"]
