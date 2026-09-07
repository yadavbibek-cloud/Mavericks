"use client";
import { useEffect } from "react";
import { useGridStore } from "@/store/gridStore";
import { DEMO_SCENARIOS } from "@/lib/mockData";
import { Navbar } from "@/components/layout/Navbar";
import { GridScene } from "@/components/grid/GridScene";
import { IntelligencePanel } from "@/components/dashboard/IntelligencePanel";
import { NodeDetailPanel } from "@/components/dashboard/NodeDetailPanel";
import { Legend } from "@/components/dashboard/Legend";
import { WhatIfSimulator } from "@/components/dashboard/WhatIfSimulator";
import { DemoControls } from "@/components/dashboard/DemoControls";
import { SimulationBanner } from "@/components/dashboard/SimulationBanner";

export default function DashboardPage() {
const { setGridState, setPrediction, showNodeDetail, isDemoMode } = useGridStore();

useEffect(() => {
document.body.classList.add("dark-mode");
return () => document.body.classList.remove("dark-mode");
}, []);

useEffect(() => {
const scenario = DEMO_SCENARIOS.healthy();
setGridState(scenario.gridState);
setPrediction(scenario.prediction);
}, [setGridState, setPrediction]);

return (
<>
<Navbar variant="dark" />
<main className="pt-16 h-screen w-screen flex flex-col bg-gs-navy-950 overflow-hidden">
<SimulationBanner />
<div className="flex-1 flex overflow-hidden relative">
<div className="flex-1 relative">
<GridScene />
<Legend />
<WhatIfSimulator />
</div>
<IntelligencePanel />
{showNodeDetail && <NodeDetailPanel />}
</div>
{isDemoMode && <DemoControls />}
</main>
</>
);
}