"""
Simulation Service:
Executes cascading-failure power flow physics and tracks sequential tripping.
"""

from typing import Dict, Any
from simulation.cascade import CascadeSimulator
from simulation.grid_loader import GridLoader

class SimulationService:
    def __init__(self, loader: GridLoader = None, simulator: CascadeSimulator = None):
        self.loader = loader or GridLoader()
        self.simulator = simulator or CascadeSimulator(self.loader)

    def run_cascade_simulation(
        self,
        grid_id: str = "ieee24",
        initiating_node: str = "T17",
        stress_multiplier: float = 1.85,
        max_steps: int = 5
    ) -> Dict[str, Any]:
        return self.simulator.simulate_cascade(
            grid_id=grid_id,
            initiating_node=initiating_node,
            stress_multiplier=stress_multiplier,
            max_steps=max_steps
        )
