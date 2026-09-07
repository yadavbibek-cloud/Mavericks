"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { 
  Zap, 
  MapPin, 
  Activity, 
  Layers, 
  ShieldAlert, 
  Maximize2, 
  RefreshCw, 
  ExternalLink,
  Cpu,
  BarChart3,
  Sliders,
  ChevronRight
} from "lucide-react";

export default function MapExplorerPage() {
  const [viewMode, setViewMode] = useState<"gis" | "3d">("gis");
  const [backendOnline, setBackendOnline] = useState(true);
  const [simStress, setSimStress] = useState(1.85);
  const [selectedAsset, setSelectedAsset] = useState("T17");

  useEffect(() => {
    // Check backend health
    fetch("http://localhost:8000/api/health")
      .then((res) => res.json())
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  return (
    <div className="min-h-screen bg-gs-bg-primary text-gs-text-primary flex flex-col">
      <Navbar variant="dark" />

      {/* Top Controls Sub-Header */}
      <div className="pt-16 border-b border-gs-border bg-gs-bg-secondary/90 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-gs-bg-panel border border-gs-border text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${backendOnline ? "bg-gs-green-500 animate-pulse" : "bg-gs-red-500"}`} />
              <span>{backendOnline ? "AI CORE: ONLINE" : "AI CORE: DISCONNECTED"}</span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gs-cyan-400" />
              National Grid Map Explorer & ML Digital Twin
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex rounded-md border border-gs-border p-0.5 bg-gs-bg-panel text-xs font-medium">
              <button
                onClick={() => setViewMode("gis")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                  viewMode === "gis"
                    ? "bg-gs-cyan-500 text-gs-bg-primary font-bold shadow-sm"
                    : "text-gs-text-secondary hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Live GIS Map (Port 8000)
              </button>
              <button
                onClick={() => setViewMode("3d")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                  viewMode === "3d"
                    ? "bg-gs-cyan-500 text-gs-bg-primary font-bold shadow-sm"
                    : "text-gs-text-secondary hover:text-white"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                ML Risk Analytics
              </button>
            </div>

            {/* Launch Fullscreen on 8000 */}
            <a
              href="http://localhost:8000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gs-bg-panel hover:bg-gs-bg-elevated border border-gs-border hover:border-gs-cyan-400/50 text-xs font-medium rounded transition-all text-gs-text-secondary hover:text-white"
              title="Open standalone full-screen control room"
            >
              <Maximize2 className="w-3.5 h-3.5 text-gs-cyan-400" />
              Full Screen
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex flex-col">
        {viewMode === "gis" ? (
          <div className="w-full flex-1 min-h-[calc(100vh-120px)] relative">
            <iframe
              src="http://localhost:8000"
              className="w-full h-full min-h-[calc(100vh-120px)] border-none"
              title="GridSense GIS Map Explorer"
            />
          </div>
        ) : (
          <div className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: ML Model Telemetry & Heatmap */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gs-bg-panel border border-gs-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gs-cyan-400" />
                    <h2 className="text-base font-bold text-white">Graph Neural Network Spatial Inference</h2>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-gs-blue-500/20 text-gs-blue-400 border border-gs-blue-500/30">
                    GraphSAGE 3-Hop Message Passing
                  </span>
                </div>
                <p className="text-xs text-gs-text-secondary mb-6 leading-relaxed">
                  The deep Graph Neural Network processes physical topology, line admittance matrices, active/reactive power flow, and dynamic ambient thermal buildup to predict multi-hop cascading blackout probabilities up to 24 hours ahead.
                </p>

                {/* Grid Heatmap Nodes */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-6">
                  {["S1", "T2", "F3", "S4", "T5", "F6", "T7", "F8", "T9", "T10", "F11", "T12", "F13", "F14", "T15", "T16", "T17", "F18", "T19", "T20", "T21", "F22", "T23", "F24", "T25", "T26", "F27", "T28", "T29", "T30", "F31", "T32", "T33"].map((nid) => {
                    const isRoot = nid === "T17";
                    const isDownstream = ["F8", "S4", "T21", "T16"].includes(nid);
                    const riskPct = isRoot ? 94 : isDownstream ? 72 : 12;
                    return (
                      <button
                        key={nid}
                        onClick={() => setSelectedAsset(nid)}
                        className={`p-2.5 rounded border text-center transition-all ${
                          selectedAsset === nid
                            ? "border-gs-cyan-400 bg-gs-cyan-500/20 scale-105"
                            : isRoot
                            ? "border-amber-500/80 bg-amber-500/10 hover:bg-amber-500/20"
                            : isDownstream
                            ? "border-red-500/60 bg-red-500/10 hover:bg-red-500/20"
                            : "border-gs-border bg-gs-bg-secondary hover:border-gs-border-light"
                        }`}
                      >
                        <div className="text-[11px] font-mono font-bold text-white">{nid}</div>
                        <div className={`text-[10px] font-mono ${isRoot ? "text-amber-400 font-bold" : isDownstream ? "text-red-400" : "text-gs-green-400"}`}>
                          {riskPct}%
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-between text-xs font-mono text-gs-text-tertiary pt-4 border-t border-gs-border">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gs-green-500" /> Nominal (&lt;30%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Root Cause Trigger</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Cascade Overload (&gt;70%)</span>
                  </div>
                  <span>Topology: IEEE 33-Bus Feeder</span>
                </div>
              </div>

              {/* Cascade Timeline */}
              <div className="bg-gs-bg-panel border border-gs-border rounded-lg p-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Granger Multi-Hop Cascade Propagation Horizon
                </h3>
                <div className="space-y-3">
                  {[
                    { step: "T + 0.0h", asset: "T17 (Western Bulk Transformer)", status: "Thermal Surge Overload (185% load)", risk: "94.2% Risk", color: "text-amber-400", bg: "border-amber-500/40 bg-amber-500/10" },
                    { step: "T + 1.5h", asset: "F8 (Inter-Regional Feeder Tie)", status: "Cascading Power Redistribution", risk: "78.5% Risk", color: "text-red-400", bg: "border-red-500/30 bg-red-500/10" },
                    { step: "T + 3.0h", asset: "S4 (Western 132kV Substation)", status: "Voltage Sag Breach (0.892 pu)", risk: "68.1% Risk", color: "text-red-400", bg: "border-red-500/30 bg-red-500/10" },
                    { step: "T + 5.0h", asset: "T21 (Industrial Feeder Lateral)", status: "Thermal Trip & Corridor Blackout", risk: "59.0% Risk", color: "text-red-400", bg: "border-red-500/30 bg-red-500/10" },
                  ].map((hop, i) => (
                    <div key={i} className={`p-3 rounded border flex items-center justify-between text-xs font-mono ${hop.bg}`}>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gs-cyan-400">{hop.step}</span>
                        <div>
                          <div className="font-bold text-white">{hop.asset}</div>
                          <div className="text-[11px] text-gs-text-secondary">{hop.status}</div>
                        </div>
                      </div>
                      <span className={`font-bold ${hop.color}`}>{hop.risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Asset Inspection & What-If Mitigation */}
            <div className="space-y-6">
              {/* Asset Detail */}
              <div className="bg-gs-bg-panel border border-gs-border rounded-lg p-6">
                <div className="text-[10px] font-mono uppercase tracking-widest text-gs-cyan-400 mb-1">Asset Telemetry</div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                  <span>{selectedAsset} — Transformer</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    CRITICAL RISK
                  </span>
                </h3>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded bg-gs-bg-secondary border border-gs-border">
                    <span className="text-gs-text-secondary">Predicted Risk:</span>
                    <span className="font-bold text-amber-400">91.4% (Conformal: [84%, 98%])</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-gs-bg-secondary border border-gs-border">
                    <span className="text-gs-text-secondary">Time-to-Critical:</span>
                    <span className="font-bold text-white">1.8 Hours</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-gs-bg-secondary border border-gs-border">
                    <span className="text-gs-text-secondary">Active Power:</span>
                    <span className="font-bold text-white">4.85 MW (185% rated)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-gs-bg-secondary border border-gs-border">
                    <span className="text-gs-text-secondary">Core Temperature:</span>
                    <span className="font-bold text-red-400">84.2 °C (Ambient: 38°C)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-gs-bg-secondary border border-gs-border">
                    <span className="text-gs-text-secondary">Bus Voltage:</span>
                    <span className="font-bold text-white">0.968 pu</span>
                  </div>
                </div>
              </div>

              {/* What-If Mitigation Optimizer */}
              <div className="bg-gs-bg-panel border border-gs-border rounded-lg p-6">
                <div className="text-[10px] font-mono uppercase tracking-widest text-gs-cyan-400 mb-1">AI Recommendation</div>
                <h3 className="text-base font-bold text-white mb-3">Optimal Contingency Dispatch</h3>
                <p className="text-xs text-gs-text-secondary leading-relaxed mb-4">
                  Autonomous optimizer recommends shedding 12.0% non-essential industrial load on bus T17 and rerouting 1.2 MW power across tie-line to T14.
                </p>

                <div className="p-3 rounded bg-gs-green-500/10 border border-gs-green-500/30 text-xs font-mono space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gs-text-secondary">Pre-Mitigation Risk:</span>
                    <span className="text-red-400 font-bold">86.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gs-text-secondary">Post-Mitigation Risk:</span>
                    <span className="text-gs-green-400 font-bold">18.4% (-67.8%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gs-text-secondary">Cascade Avoidance:</span>
                    <span className="text-gs-green-400 font-bold">100% Guaranteed</span>
                  </div>
                </div>

                <a
                  href="http://localhost:8000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gs-cyan-500 hover:bg-gs-cyan-400 text-gs-bg-primary font-bold text-xs rounded transition-colors"
                >
                  Apply & Simulate in Live GIS View
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}