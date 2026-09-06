import React from 'react';
import { Play, RotateCcw, Cpu, Network, Zap, Boxes, Map } from 'lucide-react';
import type { ScenarioMeta } from '../../types/schema';

interface TopBarProps {
  selectedGrid: string;
  onSelectGrid: (grid: string) => void;
  scenarios: ScenarioMeta[];
  selectedScenario: string;
  onSelectScenario: (scenarioId: string) => void;
  cascadeRiskPct: number;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onOpenModelModal: () => void;
  onOpenArchModal: () => void;
  currentView: '3d' | 'india_map';
  onChangeView: (view: '3d' | 'india_map') => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  selectedGrid,
  onSelectGrid,
  scenarios,
  selectedScenario,
  onSelectScenario,
  cascadeRiskPct,
  isDemoMode,
  onToggleDemoMode,
  onOpenModelModal,
  onOpenArchModal,
  currentView,
  onChangeView
}) => {
  const getRiskBadgeColor = (risk: number) => {
    if (risk < 20) return 'border-emerald-500/50 text-emerald-400 bg-emerald-950/40';
    if (risk < 50) return 'border-amber-500/50 text-amber-400 bg-amber-950/40';
    if (risk < 75) return 'border-orange-500/50 text-orange-400 bg-orange-950/40';
    return 'border-red-500/50 text-red-400 bg-red-950/40 animate-pulse';
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0c1222]/90 backdrop-blur-md px-6 flex items-center justify-between z-30 select-none">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider text-slate-100 flex items-center gap-1.5">
              GRID<span className="text-cyan-400">SENSE</span>
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
              Predict → Explain → Prevent
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-2" />

        {/* View Toggle */}
        <div className="flex items-center bg-slate-900/90 border border-slate-700/70 rounded-lg p-0.5 shadow-inner">
          <button
            onClick={() => onChangeView('3d')}
            className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 ${
              currentView === '3d'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D DIGITAL TWIN</span>
          </button>
          <button
            onClick={() => {
              onChangeView('india_map');
              if (selectedGrid !== 'india_demo_grid_v1') {
                onSelectGrid('india_demo_grid_v1');
              }
            }}
            className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 ${
              currentView === 'india_map'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-amber-400" />
            <span>INDIA MAP</span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-2" />

        {/* Grid Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400">GRID:</label>
          <select
            value={selectedGrid}
            onChange={(e) => {
              const g = e.target.value;
              onSelectGrid(g);
              if (g === 'india_demo_grid_v1') {
                onSelectScenario('india_cascade');
              }
            }}
            className="bg-slate-900/80 border border-slate-700/70 text-slate-200 text-xs font-mono rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ieee24">IEEE 24-bus RTS</option>
            <option value="india_demo_grid_v1">India National Grid (Synthetic)</option>
            <option value="ieee39">IEEE 39-bus New England</option>
            <option value="ieee118">IEEE 118-bus</option>
          </select>
        </div>

        {/* Scenario Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400">SCENARIO:</label>
          <select
            value={selectedScenario}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-slate-900/80 border border-slate-700/70 text-cyan-300 text-xs font-mono rounded px-3 py-1.5 focus:outline-none focus:border-cyan-500 max-w-[260px] truncate"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* System Status & Actions */}
      <div className="flex items-center gap-3">
        {/* Cascade Risk Badge */}
        <div className={`px-3 py-1 rounded-full border text-xs font-mono flex items-center gap-2 ${getRiskBadgeColor(cascadeRiskPct)}`}>
          <span className="text-[10px] uppercase tracking-wider text-slate-300">System Risk:</span>
          <span className="font-bold text-sm">{cascadeRiskPct.toFixed(0)}%</span>
        </div>

        {/* Demo Mode Button */}
        <button
          onClick={onToggleDemoMode}
          className={`px-3.5 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
            isDemoMode
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
              : 'glass-panel text-amber-300 border-amber-500/40 hover:bg-amber-500/10'
          }`}
        >
          {isDemoMode ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          {isDemoMode ? 'STOP DEMO' : 'DEMO MODE'}
        </button>

        {/* Model Analytics Modal trigger */}
        <button
          onClick={onOpenModelModal}
          className="glass-panel px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 flex items-center gap-1.5 transition-all"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>MODEL</span>
        </button>

        {/* Architecture Modal trigger */}
        <button
          onClick={onOpenArchModal}
          className="glass-panel px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 flex items-center gap-1.5 transition-all"
        >
          <Network className="w-3.5 h-3.5" />
          <span>PIPELINE</span>
        </button>
      </div>
    </header>
  );
};
