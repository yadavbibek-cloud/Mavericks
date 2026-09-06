"use client";
import { useEffect, useState } from "react";
import { useGridStore } from "@/store/gridStore";
import { DEMO_SCENARIOS } from "@/lib/mockData";
import { INDIA_GRID_ASSETS } from "@/lib/indiaGeo";
import { Navbar } from "@/components/layout/Navbar";
import { GridScene } from "@/components/grid/GridScene";
import { IntelligencePanel } from "@/components/dashboard/IntelligencePanel";
import { NodeDetailPanel } from "@/components/dashboard/NodeDetailPanel";
import { Legend } from "@/components/dashboard/Legend";
import { WhatIfSimulator } from "@/components/dashboard/WhatIfSimulator";
import { Search, Filter, Layers, X } from "lucide-react";

export default function MapExplorerPage() {
  const { setGridState, setPrediction, showNodeDetail, selectNode } = useGridStore();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<typeof INDIA_GRID_ASSETS>([]);
  const [riskFilter, setRiskFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Force dark mode for map explorer
    document.body.classList.add("dark-mode");
    return () => document.body.classList.remove("dark-mode");
  }, []);

  useEffect(() => {
    const scenario = DEMO_SCENARIOS.healthy();
    setGridState(scenario.gridState);
    setPrediction(scenario.prediction);
  }, [setGridState, setPrediction]);

  useEffect(() => {
    if (search.length < 1) {
      setSuggestions([]);
      return;
    }
    const q = search.toLowerCase();
    const matches = INDIA_GRID_ASSETS.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        a.label.toLowerCase().includes(q) ||
        a.state.toLowerCase().includes(q)
    ).slice(0, 6);
    setSuggestions(matches);
  }, [search]);

  const handleSelect = (id: string) => {
    selectNode(id);
    setSearch("");
    setSuggestions([]);
  };

  return (
    <>
      <Navbar variant="dark" />
      <main className="pt-16 h-screen w-screen flex flex-col bg-gs-navy-950 overflow-hidden">
        {/* Search bar */}
        <div className="shrink-0 bg-gs-navy-900 border-b border-gs-navy-800 px-6 py-3 z-30">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gs-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search city, state, substation or grid asset (e.g., Mumbai, T17)..."
                className="w-full pl-10 pr-4 py-2.5 bg-gs-navy-800 border border-gs-navy-700 rounded-md text-sm text-white placeholder-gs-gray-500 focus:outline-none focus:border-gs-cyan-500"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gs-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}

              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gs-navy-800 border border-gs-navy-700 rounded-md shadow-2xl overflow-hidden">
                  {suggestions.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => handleSelect(a.id)}
                      className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gs-navy-700 text-left border-b border-gs-navy-700 last:border-b-0"
                    >
                      <div>
                        <div className="text-sm text-white font-medium">
                          <span className="font-mono text-gs-cyan-400 mr-2">{a.id}</span>
                          {a.label}
                        </div>
                        <div className="text-[10px] text-gs-gray-500 uppercase mt-0.5">
                          {a.state} · {a.type}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-gs-gray-600 uppercase">{a.region}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gs-navy-800 border border-gs-navy-700 rounded-md text-sm text-white hover:bg-gs-navy-700"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-gs-navy-800 border border-gs-navy-700 rounded-md text-sm text-white hover:bg-gs-navy-700">
              <Layers className="w-4 h-4" />
              Layers
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 flex items-center gap-4 pt-3 border-t border-gs-navy-800">
              <span className="text-xs uppercase tracking-widest text-gs-gray-500 font-semibold">Risk Level:</span>
              {["all", "healthy", "warning", "critical"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors capitalize ${
                    riskFilter === r
                      ? "bg-gs-cyan-500/20 border-gs-cyan-500 text-gs-cyan-400"
                      : "border-gs-navy-700 text-gs-gray-400 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map + Panels */}
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 relative">
            <GridScene />
            <Legend />
            <WhatIfSimulator />
          </div>
          <IntelligencePanel />
          {showNodeDetail && <NodeDetailPanel />}
        </div>
      </main>
    </>
  );
}