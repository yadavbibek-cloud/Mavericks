export type NodeType = 'bus' | 'transformer' | 'generator' | 'load' | 'substation';

export interface NodePosition {
  x: number;
  y: number;
  z: number;
}

export interface NodeFeatures {
  load_pct: number;
  voltage_pu: number;
  temperature_c: number;
  age_years?: number;
  capacity_mva: number;
  p_mw?: number;
  q_mvar?: number;
  is_tripped?: boolean;
}

export interface GridNode {
  id: string;
  bus_id?: number;
  name: string;
  type: NodeType;
  city?: string;
  lat?: number;
  lon?: number;
  reference?: string;
  position: NodePosition;
  features: NodeFeatures;
}

export interface VerifiedSubstation {
  name: string;
  city: string;
  state: string;
  voltage_level_kv: string;
  transformer_config?: string;
  capacity_mva?: string;
  notes?: string;
  source: string;
  lat: number;
  lon: number;
  is_real_verified: boolean;
}

export interface GridEdge {
  id: string;
  source: string;
  target: string;
  type: 'line' | 'trafo' | 'feeder';
  capacity_mva: number;
  loading_pct: number;
  p_from_mw?: number;
  q_from_mvar?: number;
  r_ohm?: number;
  x_ohm?: number;
  is_tripped?: boolean;
}

export interface GridState {
  timestamp: string;
  grid_id: string;
  nodes: GridNode[];
  edges: GridEdge[];
}

export interface RootCauseItem {
  node: string;
  root_cause_score: number;
  explained_by_upstream: boolean;
  explained_by?: string | null;
  reasons?: string[];
}

export interface TimelineEvent {
  step: number;
  node: string;
  event: string;
  cascade_risk_pct?: number;
}

export interface RecommendedIntervention {
  action: string;
  target_node: string;
  reduction_pct: number;
  redistribute_to?: string[];
  expected_risk_reduction: number;
  narrative: string;
}

export interface PhysicsValidation {
  power_balance_ok: boolean;
  voltage_constraints_ok: boolean;
  thermal_constraints_ok?: boolean;
  powerflow_converged: boolean;
  total_generation_mw?: number;
  total_load_mw?: number;
  total_losses_mw?: number;
  mismatch_mw?: number;
}

export interface ModelOutput {
  node_risk: Record<string, number>;
  time_to_critical?: Record<string, number>;
  root_cause_ranking: RootCauseItem[];
  confidence_interval: Record<string, [number, number]>;
  cascade_path: string[];
  cascade_timeline?: TimelineEvent[];
  cascade_risk_pct: number;
  predicted_failures?: string[];
  feature_attributions?: Record<string, Record<string, number>>;
  recommended_intervention?: RecommendedIntervention;
  physics_validation: PhysicsValidation;
}

export interface GridSenseFullResponse {
  grid_state: GridState;
  model_output: ModelOutput;
}

export interface ScenarioMeta {
  id: string;
  name: string;
  description: string;
  initiating_node: string;
  base_risk_pct: number;
}

export interface WhatIfResponse {
  before: {
    cascade_risk: number;
    cascade_path: string[];
  };
  after: {
    cascade_risk: number;
    cascade_path: string[];
  };
  risk_reduction: number;
  action: string;
  physics_valid: boolean;
  cascade_before: string[];
  cascade_after: string[];
  narrative: string;
  updated_grid_state?: GridState;
}
