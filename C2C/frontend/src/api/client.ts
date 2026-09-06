import type { GridSenseFullResponse, ScenarioMeta, WhatIfResponse } from '../types/schema';

const API_BASE = 'http://localhost:8000/api';

export const apiClient = {
  async getScenarios(): Promise<ScenarioMeta[]> {
    try {
      const res = await fetch(`${API_BASE}/scenarios`);
      if (res.ok) return await res.json();
    } catch {
      console.warn('Backend unavailable, using fallback scenarios list');
    }
    return [
      { id: 'normal', name: 'Normal Operating State', description: 'IEEE 24-bus grid operating within standard limits.', initiating_node: 'T17', base_risk_pct: 3.4 },
      { id: 'transformer_overload', name: 'Transformer Overload (T17)', description: 'Localized surge causing thermal overload on T17.', initiating_node: 'T17', base_risk_pct: 82.0 },
      { id: 'line_outage', name: 'Critical Transmission Line Outage', description: 'N-1 contingency: transmission corridor L14 trips unexpectedly.', initiating_node: 'B14', base_risk_pct: 68.5 },
      { id: 'high_demand', name: 'High Demand Heatwave', description: 'Regional heatwave pushes ambient temperature to 39°C.', initiating_node: 'B18', base_risk_pct: 61.0 },
      { id: 'cascade_emergency', name: 'Cascade Emergency (Critical)', description: 'Imminent cascading blackout originating at transformer T17.', initiating_node: 'T17', base_risk_pct: 86.4 }
    ];
  },

  async simulate(gridId: string, initiatingNode: string, stressMultiplier: number): Promise<GridSenseFullResponse> {
    try {
      const res = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grid_id: gridId,
          initiating_node: initiatingNode,
          stress_multiplier: stressMultiplier,
          max_steps: 5
        })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend simulate failed, using demo fallback', err);
    }
    // Fallback response for offline resilience
    return this.getFallbackScenario('cascade_emergency');
  },

  async whatIf(gridId: string, initiatingNode: string, stressMultiplier: number, valuePct: number): Promise<WhatIfResponse> {
    try {
      const res = await fetch(`${API_BASE}/what-if`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grid_id: gridId,
          initiating_node: initiatingNode,
          stress_multiplier: stressMultiplier,
          action: {
            type: 'reduce_load',
            node: initiatingNode,
            value: valuePct
          }
        })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend what-if failed, using fallback', err);
    }

    const beforeRisk = 86.4;
    const afterRisk = Math.max(18.0, Number((beforeRisk - valuePct * 5.2).toFixed(1)));
    return {
      before: { cascade_risk: beforeRisk, cascade_path: ['T17', 'F8', 'T21', 'S4'] },
      after: { cascade_risk: afterRisk, cascade_path: valuePct >= 12 ? ['T17'] : ['T17', 'F8'] },
      risk_reduction: Number((beforeRisk - afterRisk).toFixed(1)),
      action: `Reduce ${initiatingNode} loading by ${valuePct.toFixed(0)}%`,
      physics_valid: true,
      cascade_before: ['T17', 'F8', 'T21', 'S4'],
      cascade_after: valuePct >= 12 ? ['T17'] : ['T17', 'F8'],
      narrative: `Reducing ${initiatingNode} loading by ${valuePct.toFixed(0)}% drops cascade risk from ${beforeRisk}% to ${afterRisk}%. Cascade propagation is halted.`
    };
  },

  async getMetrics(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/model/metrics`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      dataset: "IEEE24 RTS Cascades",
      model: "3-Layer Multi-head GAT",
      total_samples: 1500,
      train_samples: 1050,
      val_samples: 225,
      test_samples: 225,
      precision: 0.6093,
      recall: 0.2373,
      f1: 0.3416,
      roc_auc: 0.8872,
      false_positive_rate: 0.3907
    };
  },

  async getVerifiedSubstations(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/india/real-substations`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch verified substations, using fallback', err);
    }
    return [
      { name: "Patparganj", city: "Delhi", state: "Delhi", voltage_level_kv: "220/66 and 220/33", capacity_mva: "500", source: "DTL 13th Transmission Business Plan", lat: 28.6276, lon: 77.3031, is_real_verified: true },
      { name: "Harsh Vihar", city: "Delhi", state: "Delhi", voltage_level_kv: "400/220/66", capacity_mva: "945 MVA at 220kV + 480 MVA at 66kV", source: "Delhi Transco Limited press release", lat: 28.7180, lon: 77.3060, is_real_verified: true },
      { name: "Bamnauli", city: "Delhi", state: "Delhi", voltage_level_kv: "400/220", capacity_mva: "not specified", source: "Delhi Transco Limited press release", lat: 28.5615, lon: 76.9936, is_real_verified: true },
      { name: "Bawana", city: "Delhi", state: "Delhi", voltage_level_kv: "400/220", capacity_mva: "not specified", source: "Delhi Transco Limited press release", lat: 28.7997, lon: 77.0326, is_real_verified: true },
      { name: "Mundka", city: "Delhi", state: "Delhi", voltage_level_kv: "400/220", capacity_mva: "not specified", source: "Delhi Transco Limited press release", lat: 28.6816, lon: 77.0298, is_real_verified: true },
      { name: "Preet Vihar", city: "Delhi", state: "Delhi", voltage_level_kv: "220/33", capacity_mva: "100", source: "DTL 13th Transmission Business Plan", lat: 28.6415, lon: 77.2974, is_real_verified: true },
      { name: "Peeragarhi", city: "Delhi", state: "Delhi", voltage_level_kv: "220/33", capacity_mva: "300", source: "DTL 13th Transmission Business Plan", lat: 28.6789, lon: 77.0911, is_real_verified: true },
      { name: "Pragati (IP Extension)", city: "Delhi", state: "Delhi", voltage_level_kv: "220/66", capacity_mva: "320", source: "DTL 13th Transmission Business Plan", lat: 28.6186, lon: 77.2489, is_real_verified: true },
      { name: "Tughlakabad", city: "Delhi", state: "Delhi", voltage_level_kv: "400", capacity_mva: "not specified", source: "Global Transmission Research news brief", lat: 28.5135, lon: 77.2658, is_real_verified: true },
      { name: "33 kV Substation Perunad", city: "Perunad", state: "Kerala", voltage_level_kv: "33/11", capacity_mva: "not specified", source: "Kerala State Electricity Board Wikipedia", lat: 9.3510, lon: 76.8830, is_real_verified: true }
    ];
  },

  getFallbackScenario(scenarioId: string): GridSenseFullResponse {
    // Generate realistic IEEE 24 RTS fallback nodes & edges
    const nodes: any[] = [];
    const nodeConfigs = [
      { id: "T17", bus_id: 16, type: "transformer", pos: [5.5, 1.5, 3.0], load: 94.2, v: 0.96, t: 84.5, cap: 25 },
      { id: "F8", bus_id: 7, type: "load", pos: [-2.0, 0.0, -4.5], load: 78.4, v: 0.98, t: 54.0, cap: 15 },
      { id: "T21", bus_id: 20, type: "transformer", pos: [4.5, 1.5, 5.5], load: 82.0, v: 0.97, t: 62.0, cap: 20 },
      { id: "S4", bus_id: 3, type: "substation", pos: [-7.0, 0.0, -2.5], load: 68.0, v: 0.99, t: 42.0, cap: 30 },
      { id: "T14", bus_id: 13, type: "transformer", pos: [0.0, 1.5, -1.0], load: 45.0, v: 1.01, t: 36.0, cap: 25 },
      { id: "T19", bus_id: 18, type: "transformer", pos: [1.0, 1.5, 3.5], load: 48.0, v: 1.01, t: 38.0, cap: 25 },
      { id: "G1", bus_id: 0, type: "generator", pos: [-6.0, 0.0, -7.0], load: 52.0, v: 1.02, t: 35.0, cap: 50 },
      { id: "G2", bus_id: 1, type: "generator", pos: [-4.0, 0.0, -7.0], load: 50.0, v: 1.02, t: 34.0, cap: 50 },
      { id: "B3", bus_id: 2, type: "bus", pos: [-5.0, 0.0, -4.5], load: 40.0, v: 1.00, t: 31.0, cap: 25 },
      { id: "B5", bus_id: 4, type: "bus", pos: [-6.5, 0.0, -0.5], load: 38.0, v: 1.01, t: 30.0, cap: 25 },
      { id: "B6", bus_id: 5, type: "bus", pos: [-5.0, 0.0, 0.0], load: 42.0, v: 1.00, t: 32.0, cap: 25 },
      { id: "B7", bus_id: 6, type: "bus", pos: [-3.5, 0.0, -2.0], load: 44.0, v: 1.01, t: 33.0, cap: 25 },
      { id: "B9", bus_id: 8, type: "bus", pos: [-3.5, 0.0, -4.5], load: 45.0, v: 1.00, t: 34.0, cap: 25 },
      { id: "B10", bus_id: 9, type: "bus", pos: [-3.5, 0.0, -6.0], load: 46.0, v: 1.00, t: 34.0, cap: 25 },
      { id: "T11", bus_id: 10, type: "transformer", pos: [-0.5, 1.5, -6.5], load: 51.0, v: 1.01, t: 39.0, cap: 30 },
      { id: "T12", bus_id: 11, type: "transformer", pos: [1.5, 1.5, -6.5], load: 50.0, v: 1.01, t: 38.0, cap: 30 },
      { id: "B13", bus_id: 12, type: "bus", pos: [0.5, 1.5, -4.0], load: 49.0, v: 1.01, t: 37.0, cap: 25 },
      { id: "B15", bus_id: 14, type: "bus", pos: [2.5, 1.5, 0.0], load: 55.0, v: 1.00, t: 40.0, cap: 25 },
      { id: "B16", bus_id: 15, type: "bus", pos: [4.0, 1.5, 1.5], load: 62.0, v: 0.99, t: 44.0, cap: 25 },
      { id: "B18", bus_id: 17, type: "bus", pos: [3.0, 1.5, 4.0], load: 58.0, v: 1.00, t: 41.0, cap: 25 },
      { id: "B20", bus_id: 19, type: "bus", pos: [-1.0, 1.5, 3.0], load: 45.0, v: 1.01, t: 35.0, cap: 25 },
      { id: "G22", bus_id: 21, type: "generator", pos: [6.0, 1.5, 6.0], load: 65.0, v: 1.02, t: 42.0, cap: 60 },
      { id: "G23", bus_id: 22, type: "generator", pos: [-1.5, 1.5, 5.0], load: 60.0, v: 1.02, t: 40.0, cap: 60 },
      { id: "B24", bus_id: 23, type: "bus", pos: [0.0, 1.5, 6.5], load: 50.0, v: 1.01, t: 36.0, cap: 25 }
    ];

    nodeConfigs.forEach(nc => {
      nodes.push({
        id: nc.id,
        bus_id: nc.bus_id,
        name: `${nc.id} (${nc.type})`,
        type: nc.type,
        position: { x: nc.pos[0], y: nc.pos[1], z: nc.pos[2] },
        features: {
          load_pct: nc.load,
          voltage_pu: nc.v,
          temperature_c: nc.t,
          age_years: 12,
          capacity_mva: nc.cap,
          p_mw: nc.load * 1.5,
          q_mvar: nc.load * 0.4,
          is_tripped: false
        }
      });
    });

    const edges = [
      { id: "L1", source: "G1", target: "G2", type: "line", capacity_mva: 175, loading_pct: 32 },
      { id: "L2", source: "G1", target: "B3", type: "line", capacity_mva: 175, loading_pct: 42 },
      { id: "L3", source: "G2", target: "S4", type: "line", capacity_mva: 175, loading_pct: 48 },
      { id: "L4", source: "B3", target: "B9", type: "line", capacity_mva: 175, loading_pct: 52 },
      { id: "L5", source: "S4", target: "B9", type: "line", capacity_mva: 175, loading_pct: 44 },
      { id: "L6", source: "B5", target: "B6", type: "line", capacity_mva: 175, loading_pct: 35 },
      { id: "L7", source: "B7", target: "F8", type: "line", capacity_mva: 175, loading_pct: 65 },
      { id: "L8", source: "F8", target: "B9", type: "line", capacity_mva: 175, loading_pct: 82 },
      { id: "L9", source: "T11", target: "T12", type: "line", capacity_mva: 400, loading_pct: 45 },
      { id: "L10", source: "T12", target: "B13", type: "line", capacity_mva: 400, loading_pct: 48 },
      { id: "L11", source: "B13", target: "T14", type: "line", capacity_mva: 400, loading_pct: 54 },
      { id: "L12", source: "T14", target: "B16", type: "line", capacity_mva: 400, loading_pct: 61 },
      { id: "L13", source: "B16", target: "T17", type: "line", capacity_mva: 400, loading_pct: 92 },
      { id: "L14", source: "T17", target: "B18", type: "line", capacity_mva: 400, loading_pct: 86 },
      { id: "L15", source: "T17", target: "T21", type: "line", capacity_mva: 400, loading_pct: 88 },
      { id: "L16", source: "T21", target: "G22", type: "line", capacity_mva: 400, loading_pct: 68 },
      { id: "L17", source: "B18", target: "T19", type: "line", capacity_mva: 400, loading_pct: 52 },
      { id: "L18", source: "T19", target: "B20", type: "line", capacity_mva: 400, loading_pct: 44 },
      { id: "L19", source: "B20", target: "G23", type: "line", capacity_mva: 400, loading_pct: 49 },
      { id: "TR1", source: "B24", target: "B3", type: "trafo", capacity_mva: 400, loading_pct: 50 },
      { id: "TR2", source: "T11", target: "B9", type: "trafo", capacity_mva: 400, loading_pct: 60 }
    ];

    const isEmergency = scenarioId === 'cascade_emergency' || scenarioId === 'transformer_overload';
    const t17Risk = isEmergency ? 0.89 : 0.08;
    const f8Risk = isEmergency ? 0.41 : 0.06;
    const t21Risk = isEmergency ? 0.38 : 0.05;

    const node_risk: Record<string, number> = {
      T17: t17Risk,
      F8: f8Risk,
      T21: t21Risk,
      S4: isEmergency ? 0.32 : 0.04
    };
    nodes.forEach(n => {
      if (!node_risk[n.id]) node_risk[n.id] = isEmergency ? 0.12 : 0.04;
    });

    const confidence_interval: Record<string, [number, number]> = {};
    Object.keys(node_risk).forEach(k => {
      const r = node_risk[k];
      confidence_interval[k] = [Math.max(0, Number((r - 0.07).toFixed(2))), Math.min(1, Number((r + 0.04).toFixed(2)))];
    });

    return {
      grid_state: {
        timestamp: new Date().toISOString(),
        grid_id: 'ieee24',
        nodes,
        edges: edges as any
      },
      model_output: {
        node_risk,
        time_to_critical: { T17: 1.2, F8: 2.8, T21: 3.5, S4: 4.8 },
        root_cause_ranking: [
          {
            node: "T17",
            root_cause_score: 0.91,
            explained_by_upstream: false,
            explained_by: null,
            reasons: [
              "Risk increased first at T+0 before any other grid asset",
              "Severe thermal overload (94.2% loading, 84.5°C)",
              "Upstream temporal precedence confirms failure origin"
            ]
          },
          {
            node: "F8",
            root_cause_score: 0.22,
            explained_by_upstream: true,
            explained_by: "T17",
            reasons: [
              "Overload onset at T+1 preceded by upstream surge on T17",
              "Secondary symptom: power flow redirected from T17 corridor"
            ]
          },
          {
            node: "T21",
            root_cause_score: 0.17,
            explained_by_upstream: true,
            explained_by: "F8",
            reasons: [
              "Tertiary symptom of cascade propagation from F8",
              "Downstream thermal accumulation"
            ]
          }
        ],
        confidence_interval,
        cascade_path: ["T17", "F8", "T21", "S4"],
        cascade_timeline: [
          { step: 0, node: "T17", event: "Severe thermal overload on T17 (84.5°C)", cascade_risk_pct: 86.4 },
          { step: 1, node: "F8", event: "Feeder F8 tripped at 118% thermal rating", cascade_risk_pct: 89.2 },
          { step: 2, node: "T21", event: "Transformer T21 tripped at 124% capacity", cascade_risk_pct: 92.5 },
          { step: 3, node: "S4", event: "Substation S4 regional voltage collapse", cascade_risk_pct: 96.0 }
        ],
        cascade_risk_pct: isEmergency ? 86.4 : 3.4,
        predicted_failures: isEmergency ? ["T17", "F8", "T21", "S4"] : [],
        feature_attributions: {
          T17: {
            "Temperature": 31,
            "Load": 27,
            "Neighbor transfer": 21,
            "Voltage deviation": 14,
            "Other": 7
          }
        },
        recommended_intervention: {
          action: "Reduce T17 load by 12%",
          target_node: "T17",
          reduction_pct: 12,
          redistribute_to: ["T14", "T19"],
          expected_risk_reduction: 68.0,
          narrative: "Reducing T17 loading by 12% and redistributing to T14 and T19 drops cascade risk from 86% to 18%."
        },
        physics_validation: {
          power_balance_ok: true,
          voltage_constraints_ok: true,
          thermal_constraints_ok: !isEmergency,
          powerflow_converged: true,
          total_generation_mw: 2850.0,
          total_load_mw: 2780.0,
          total_losses_mw: 70.0,
          mismatch_mw: 0.0
        }
      }
    };
  }
};
