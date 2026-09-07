import type { GridState, PredictionResult, InterventionResult, SimulationConfig } from "./types";
import { buildHealthyScenario, buildStressScenario, buildMitigatedScenario } from "./mockData";

export const api = {
async getGridState(): Promise<GridState> {
await new Promise((r) => setTimeout(r, 200));
return buildHealthyScenario().gridState;
},
async predict(state: GridState): Promise<PredictionResult> {
await new Promise((r) => setTimeout(r, 600));
return buildStressScenario(18).prediction;
},
async simulate(config: SimulationConfig): Promise<{ gridState: GridState; prediction: PredictionResult }> {
await new Promise((r) => setTimeout(r, 800));
return buildStressScenario(config.demand_stress_pct);
},
async intervene(nodeId: string, loadReduction: number): Promise<InterventionResult> {
await new Promise((r) => setTimeout(r, 600));
return buildMitigatedScenario(loadReduction).intervention;
}
};
