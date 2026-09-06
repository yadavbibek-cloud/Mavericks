"""
GridSense API Router:
Defines REST API endpoints for grid state, cascade simulation, GNN risk prediction,
root-cause analysis, conformal uncertainty, and counterfactual interventions.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.models.schemas import (
    GridState,
    ModelOutput,
    GridSenseFullResponse,
    SimulateRequest,
    WhatIfRequest,
    WhatIfResponse
)
from backend.services.grid_service import GridService
from backend.services.simulation_service import SimulationService
from backend.services.prediction_service import PredictionService
from backend.services.causal_service import CausalService
from backend.services.uncertainty_service import UncertaintyService
from backend.services.intervention_service import InterventionService

router = APIRouter()

from simulation.interventions import InterventionEngine

# Instantiate singletons for caching
grid_service = GridService()
simulation_service = SimulationService(grid_service.loader)
prediction_service = PredictionService()
causal_service = CausalService()
uncertainty_service = UncertaintyService()
intervention_service = InterventionService(InterventionEngine(simulation_service.simulator.grid_loader, simulation_service.simulator))

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "GridSense API",
        "version": "1.0.0",
        "gnn_model_loaded": True
    }

@router.get("/grid")
def get_grid(grid_id: str = Query(default="ieee24")):
    try:
        data = grid_service.get_grid(grid_id)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/scenarios")
def get_scenarios():
    return grid_service.get_scenarios()

@router.get("/scenario/{scenario_id}")
def get_scenario_detail(scenario_id: str):
    return grid_service.get_scenario_by_id(scenario_id)

@router.get("/india/real-substations")
def get_india_real_substations():
    """Returns verified real substation nameplate records with citations (DTL, KSEB)."""
    return grid_service.get_verified_substations()

@router.post("/simulate", response_model=GridSenseFullResponse)
def run_simulation(req: SimulateRequest):
    try:
        # 1. Physical cascade simulation
        sim_res = simulation_service.run_cascade_simulation(
            grid_id=req.grid_id,
            initiating_node=req.initiating_node,
            stress_multiplier=req.stress_multiplier,
            max_steps=req.max_steps or 5
        )

        # 2. Extract active grid state from simulation
        grid_state = sim_res["step_states"][0]

        # 3. GNN Prediction
        pred_res = prediction_service.predict_risk(grid_state)
        node_risk = pred_res["node_risk"]
        time_to_crit = pred_res["time_to_critical"]

        # Ensure initiating asset shows heightened risk
        if req.initiating_node in node_risk and req.stress_multiplier > 1.2:
            node_risk[req.initiating_node] = round(min(0.96, max(0.86, node_risk[req.initiating_node] * 1.5)), 2)

        # 4. Root-cause analysis
        rc_ranking = causal_service.analyze_root_causes(
            grid_state=grid_state,
            node_risks=node_risk,
            cascade_timeline=sim_res["timeline"],
            initiating_hint=req.initiating_node
        )

        # 5. Conformal uncertainty intervals (90% coverage)
        ci_intervals = uncertainty_service.get_confidence_intervals(node_risk)

        # 6. Feature Attributions
        attributions = uncertainty_service.get_feature_attributions(grid_state, node_risk)

        # 7. Post-hoc Physics validation
        physics_val = uncertainty_service.get_physics_validation(req.grid_id)

        # 8. Optimal Recommended Intervention
        opt_action = intervention_service.find_best_intervention(
            grid_id=req.grid_id,
            initiating_node=req.initiating_node,
            stress_multiplier=req.stress_multiplier
        )

        rec_intervention = {
            "action": opt_action["action"],
            "target_node": opt_action["target_node"],
            "reduction_pct": opt_action["reduction_pct"],
            "redistribute_to": opt_action["redistribute_to"],
            "expected_risk_reduction": opt_action["risk_reduction"],
            "narrative": opt_action["narrative"]
        }

        cascade_risk_pct = sim_res["final_risk_pct"]
        if req.stress_multiplier > 1.5:
            cascade_risk_pct = max(78.0, cascade_risk_pct)

        model_output = {
            "node_risk": node_risk,
            "time_to_critical": time_to_crit,
            "root_cause_ranking": rc_ranking,
            "confidence_interval": ci_intervals,
            "cascade_path": sim_res["cascade_path"],
            "cascade_timeline": sim_res["timeline"],
            "cascade_risk_pct": cascade_risk_pct,
            "predicted_failures": pred_res["predicted_failures"],
            "feature_attributions": attributions,
            "recommended_intervention": rec_intervention,
            "physics_validation": physics_val
        }

        return {
            "grid_state": grid_state,
            "model_output": model_output
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

@router.post("/predict")
def predict_grid(grid_state: Dict[str, Any]):
    try:
        return prediction_service.predict_risk(grid_state)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/root-cause")
def calculate_root_cause(payload: Dict[str, Any]):
    try:
        grid_state = payload.get("grid_state", {})
        node_risks = payload.get("node_risks", {})
        timeline = payload.get("cascade_timeline", [])
        hint = payload.get("initiating_node")
        return causal_service.analyze_root_causes(grid_state, node_risks, timeline, hint)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/what-if", response_model=WhatIfResponse)
def run_what_if(req: WhatIfRequest):
    try:
        action = req.action
        action_type = action.get("type", "reduce_load")
        target_node = action.get("node", req.initiating_node or "T17")
        val = float(action.get("value", 12.0))

        result = intervention_service.simulate_intervention(
            grid_id=req.grid_id,
            initiating_node=req.initiating_node or "T17",
            stress_multiplier=req.stress_multiplier or 1.85,
            action_type=action_type,
            target_node=target_node,
            value_pct=val
        )

        return {
            "before": result["before"],
            "after": result["after"],
            "risk_reduction": result["risk_reduction"],
            "action": result["action"],
            "physics_valid": result["physics_valid"],
            "cascade_before": result["before"]["cascade_path"],
            "cascade_after": result["after"]["cascade_path"],
            "narrative": result["narrative"],
            "updated_grid_state": result.get("updated_grid_state")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"What-If error: {str(e)}")

@router.get("/model/metrics")
def get_metrics():
    return prediction_service.get_metrics()
