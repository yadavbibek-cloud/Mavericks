"use client";
import { useState } from "react";
import { useGridStore } from "@/store/gridStore";
import { DEMO_SCENARIOS } from "@/lib/mockData";
import { Play, RotateCcw, Zap, Sliders } from "lucide-react";

export function WhatIfSimulator() {
const { setGridState, setPrediction, setInterventionResult, setDemoPhase, setProcessing, resetSimulation } = useGridStore();
const [stress, setStress] = useState(0);
const [loadReduction, setLoadReduction] = useState(12);
const [expanded, setExpanded] = useState(true);

const runStress = async () => {
setProcessing(true, "simulation");
await new Promise((r) => setTimeout(r, 400));
setProcessing(true, "gnn");
await new Promise((r) => setTimeout(r, 400));
setProcessing(true, "root_cause_analysis");
await new Promise((r) => setTimeout(r, 400));
const data = DEMO_SCENARIOS.cascade_visualized();
setGridState(data.gridState);
setPrediction(data.prediction);
setDemoPhase("cascade_visualized");
setProcessing(false);
};

const handleReset = () => {
resetSimulation();
const data = DEMO_SCENARIOS.healthy();
setGridState(data.gridState);
setPrediction(data.prediction);
setInterventionResult(null);
setStress(0);
};

return (
<div className="absolute bottom-4 left-4 z-10 w-[300px]">
<div className="panel backdrop-blur-md bg-grid-bg-panel/85">
<button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-3 py-2 border-b border-grid-border">
<div className="flex items-center gap-2">
<Sliders className="w-3.5 h-3.5 text-grid-cyan" />
<span className="text-xs font-semibold text-grid-text-primary">WHAT-IF SIMULATOR</span>
</div>
<span className="text-[10px] font-mono text-grid-text-tertiary">{expanded ? "▼" : "▶"}</span>
</button>

{expanded && (
<div className="p-3 space-y-3">
{/* Demand Stress */}
<div>
<div className="flex items-center justify-between mb-1.5">
<span className="text-[10px] text-grid-text-secondary">Demand Stress</span>
<span className="font-mono text-xs text-grid-yellow font-bold">{stress}%</span>
</div>
<input
type="range"
min="0"
max="40"
value={stress}
onChange={(e) => setStress(Number(e.target.value))}
className="w-full h-1.5 bg-grid-bg-primary rounded-full appearance-none cursor-pointer
[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-grid-yellow [&::-webkit-slider-thumb]:cursor-pointer"
/>
</div>

{/* Load Reduction */}
<div>
<div className="flex items-center justify-between mb-1.5">
<span className="text-[10px] text-grid-text-secondary">Intervention: Reduce T17 Load</span>
<span className="font-mono text-xs text-grid-cyan font-bold">-{loadReduction}%</span>
</div>
<input
type="range"
min="0"
max="30"
value={loadReduction}
onChange={(e) => setLoadReduction(Number(e.target.value))}
className="w-full h-1.5 bg-grid-bg-primary rounded-full appearance-none cursor-pointer
[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-grid-cyan [&::-webkit-slider-thumb]:cursor-pointer"
/>
</div>

<div className="grid grid-cols-2 gap-2 pt-1">
<button
onClick={runStress}
className="py-1.5 rounded bg-grid-yellow/15 border border-grid-yellow/30 text-grid-yellow text-[10px] font-mono font-bold hover:bg-grid-yellow/25 transition-colors"
>
<Zap className="w-3 h-3 inline mr-1" />
RUN STRESS
</button>
<button
onClick={handleReset}
className="py-1.5 rounded bg-grid-bg-primary border border-grid-border text-grid-text-secondary text-[10px] font-mono font-bold hover:bg-grid-bg-elevated transition-colors"
>
<RotateCcw className="w-3 h-3 inline mr-1" />
RESET
</button>
</div>
</div>
)}
</div>
</div>
);
}
