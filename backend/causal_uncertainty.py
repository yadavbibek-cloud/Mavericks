"""
GridSense Causal Root-Cause and Conformal Uncertainty Engine
Modular wrapper referencing backend.ml package.
"""

from .ml import CausalUncertaintyEngine, ConformalPredictor, GrangerCausalAttributor
from .simulator import global_simulator
from .gnn_engine import global_gnn_engine

global_causal_engine = CausalUncertaintyEngine(simulator=global_simulator, gnn_engine=global_gnn_engine)

__all__ = ["CausalUncertaintyEngine", "ConformalPredictor", "GrangerCausalAttributor", "global_causal_engine"]
