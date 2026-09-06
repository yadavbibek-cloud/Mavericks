"""
GridSense Pydantic Schemas:
Enforces strict typing and data validation matching schema.json.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

# Node & Edge Models
class NodePosition(BaseModel):
    x: float
    y: float
    z: float

class NodeFeatures(BaseModel):
    load_pct: float
    voltage_pu: float
    temperature_c: float
    age_years: Optional[float] = 12.0
    capacity_mva: float
    p_mw: Optional[float] = 0.0
    q_mvar: Optional[float] = 0.0
    is_tripped: Optional[bool] = False

class GridNode(BaseModel):
    id: str
    bus_id: Optional[int] = None
    name: str
    type: str = "bus"
    position: NodePosition
    features: NodeFeatures

class GridEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str = "line"
    capacity_mva: float
    loading_pct: float
    p_from_mw: Optional[float] = 0.0
    q_from_mvar: Optional[float] = 0.0
    r_ohm: Optional[float] = 0.0
    x_ohm: Optional[float] = 0.0
    is_tripped: Optional[bool] = False

class GridState(BaseModel):
    timestamp: str
    grid_id: str
    nodes: List[GridNode]
    edges: List[GridEdge]

# Model Output Models
class RootCauseItem(BaseModel):
    node: str
    root_cause_score: float
    explained_by_upstream: bool
    explained_by: Optional[str] = None
    reasons: Optional[List[str]] = []

class TimelineEvent(BaseModel):
    step: int
    node: str
    event: str
    cascade_risk_pct: Optional[float] = None

class RecommendedIntervention(BaseModel):
    action: str
    target_node: str
    reduction_pct: float
    redistribute_to: Optional[List[str]] = []
    expected_risk_reduction: float
    narrative: str

class PhysicsValidation(BaseModel):
    power_balance_ok: bool
    voltage_constraints_ok: bool
    thermal_constraints_ok: Optional[bool] = True
    powerflow_converged: bool
    total_generation_mw: Optional[float] = 0.0
    total_load_mw: Optional[float] = 0.0
    total_losses_mw: Optional[float] = 0.0
    mismatch_mw: Optional[float] = 0.0

class ModelOutput(BaseModel):
    node_risk: Dict[str, float]
    time_to_critical: Optional[Dict[str, float]] = {}
    root_cause_ranking: List[RootCauseItem]
    confidence_interval: Dict[str, List[float]]
    cascade_path: List[str]
    cascade_timeline: Optional[List[TimelineEvent]] = []
    cascade_risk_pct: float
    predicted_failures: Optional[List[str]] = []
    feature_attributions: Optional[Dict[str, Dict[str, float]]] = {}
    recommended_intervention: Optional[RecommendedIntervention] = None
    physics_validation: PhysicsValidation

class GridSenseFullResponse(BaseModel):
    grid_state: GridState
    model_output: ModelOutput

# Request Models
class SimulateRequest(BaseModel):
    grid_id: str = "ieee24"
    initiating_node: str = "T17"
    stress_multiplier: float = 1.85
    max_steps: Optional[int] = 5

class WhatIfRequest(BaseModel):
    grid_id: str = "ieee24"
    initiating_node: Optional[str] = "T17"
    stress_multiplier: Optional[float] = 1.85
    action: Dict[str, Any] = Field(
        default_factory=lambda: {"type": "reduce_load", "node": "T17", "value": 12.0}
    )

class WhatIfResponse(BaseModel):
    before: Dict[str, Any]
    after: Dict[str, Any]
    risk_reduction: float
    action: str
    physics_valid: bool
    cascade_before: List[str]
    cascade_after: List[str]
    narrative: str
    updated_grid_state: Optional[GridState] = None
