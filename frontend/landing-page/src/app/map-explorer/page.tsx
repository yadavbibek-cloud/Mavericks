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