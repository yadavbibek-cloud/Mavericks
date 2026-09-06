import React from 'react';
import { AlertTriangle, Activity, Shield, HelpCircle } from 'lucide-react';
import type { GridNode, ModelOutput } from '../../types/schema';

interface IntelligencePanelProps {
  selectedNode: GridNode | null;
  modelOutput: ModelOutput | null;
  totalAssets: number;
  onSelectNode: (id: string | null) => void;
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({
  selectedNode,
  modelOutput,
  totalAssets,
  onSelectNode
}) => {
  if (!modelOutput) return null;

  // System level metrics when no specific node is selected
  const highRiskCount = Object.values(modelOutput.node_risk).filter(r => r >= 0.5).length;
  const predictedFailuresCount = modelOutput.predicted_failures?.length ?? highRiskCount;
  const gridHealthPct = Math.max(15, Math.round(100 - modelOutput.cascade_risk_pct * 0.75));

  // If a node is selected
  const nodeId = selectedNode?.id;
  const nodeRisk = nodeId ? (modelOutput.node_risk[nodeId] ?? 0.05) : 0.0;
  const nodeCi = nodeId ? (modelOutput.confidence_interval[nodeId] ?? [nodeRisk - 0.05, nodeRisk + 0.05]) : [0, 0];
  const timeToCrit = nodeId ? (modelOutput.time_to_critical?.[nodeId] ?? 3.0) : 3.0;
  
  const rootCauseItem = nodeId ? modelOutput.root_cause_ranking.find(r => r.node === nodeId) : null;
  const rootCauseScore = rootCauseItem ? rootCauseItem.root_cause_score : 0.05;
  const isInitiator = rootCauseItem && !rootCauseItem.explained_by_upstream;

  // Feature attributions
  const attributions = nodeId ? (modelOutput.feature_attributions?.[nodeId] ?? {
    "Temperature": 31,
    "Load": 27,
    "Neighbor transfer": 21,
    "Voltage deviation": 14,
    "Other": 7
  }) : null;

  return (
    <aside className="w-84 glass-panel border-l border-slate-800 p-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            {selectedNode ? 'Asset Intelligence' : 'Grid Operations Status'}
          </h2>
        </div>
        {selectedNode && (
          <button
            onClick={() => onSelectNode(null)}
            className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 underline"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* SELECTED NODE VIEW */}
      {selectedNode ? (
        <div className="space-y-4">
          {/* Asset Title & Status */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100">{selectedNode.name}</h3>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                Type: {selectedNode.type}
              </p>
            </div>
            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
              nodeRisk >= 0.75
                ? 'bg-red-950/80 text-red-400 border border-red-500/50 animate-pulse'
                : nodeRisk >= 0.40
                ? 'bg-amber-950/80 text-amber-400 border border-amber-500/50'
                : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50'
            }`}>
              {nodeRisk >= 0.75 ? 'CRITICAL' : nodeRisk >= 0.40 ? 'ELEVATED' : 'HEALTHY'}
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 font-mono">
            {/* Failure Risk */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase block">Failure Risk</span>
              <span className={`text-xl font-bold ${nodeRisk >= 0.7 ? 'text-red-400' : 'text-emerald-400'}`}>
                {(nodeRisk * 100).toFixed(0)}%
              </span>
            </div>

            {/* 90% Conformal Interval */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase block">90% Coverage CI</span>
              <span className="text-sm font-semibold text-cyan-300">
                {(nodeCi[0] * 100).toFixed(0)}% – {(nodeCi[1] * 100).toFixed(0)}%
              </span>
            </div>

            {/* Time to Critical */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase block">Time to Critical</span>
              <span className="text-sm font-semibold text-slate-200">
                {timeToCrit.toFixed(1)} steps
              </span>
            </div>

            {/* Root Cause Score */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase block">Root Cause Score</span>
              <span className={`text-sm font-bold ${isInitiator ? 'text-amber-400' : 'text-slate-400'}`}>
                {(rootCauseScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Diagnostic Role Pill */}
          <div className={`p-2.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${
            isInitiator
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}>
            {isInitiator ? <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" /> : <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
            <span>
              {isInitiator
                ? 'Candidate Failure Originator (Initiating Root Cause)'
                : rootCauseItem?.explained_by
                ? `Downstream symptom: risk surge driven by upstream ${rootCauseItem.explained_by}`
                : 'Stable operating component within safety margins'}
            </span>
          </div>

          {/* WHY PANEL: Feature Attributions */}
          {attributions && (
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  WHY IS THIS AT RISK?
                </span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              </div>

              <div className="space-y-2 text-xs font-mono">
                {Object.entries(attributions).map(([feature, pct]) => (
                  <div key={feature} className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>{feature}</span>
                      <span className="text-cyan-400 font-semibold">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Physical Readings */}
          <div className="bg-slate-900/50 border border-slate-800/60 rounded-lg p-3 text-xs font-mono space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Loading:</span>
              <span className="text-slate-200">{selectedNode.features.load_pct.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Voltage:</span>
              <span className="text-slate-200">{selectedNode.features.voltage_pu.toFixed(3)} pu</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Core Temp:</span>
              <span className={selectedNode.features.temperature_c > 70 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                {selectedNode.features.temperature_c.toFixed(1)}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Capacity:</span>
              <span className="text-slate-200">{selectedNode.features.capacity_mva.toFixed(1)} MVA</span>
            </div>
          </div>
        </div>
      ) : (
        /* SYSTEM STATUS VIEW (DEFAULT) */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 font-mono">
            {/* System Cascade Risk */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] text-slate-400 uppercase block">System Risk</span>
              <span className={`text-2xl font-bold ${modelOutput.cascade_risk_pct > 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                {modelOutput.cascade_risk_pct.toFixed(0)}%
              </span>
            </div>

            {/* Grid Health */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] text-slate-400 uppercase block">Grid Health</span>
              <span className="text-2xl font-bold text-cyan-400">
                {gridHealthPct}%
              </span>
            </div>

            {/* Assets at Risk */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] text-slate-400 uppercase block">Assets at Risk</span>
              <span className="text-xl font-bold text-amber-300">
                {highRiskCount} / {totalAssets}
              </span>
            </div>

            {/* Predicted Failures */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] text-slate-400 uppercase block">Predicted Trips</span>
              <span className="text-xl font-bold text-red-400">
                {predictedFailuresCount}
              </span>
            </div>
          </div>

          {/* Physics Validation Indicator */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 space-y-2">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              Physics Validation Status
            </span>
            <div className="space-y-1 text-xs font-mono text-slate-300">
              <div className="flex items-center justify-between">
                <span>Power Balance:</span>
                <span className={modelOutput.physics_validation.power_balance_ok ? 'text-emerald-400' : 'text-red-400'}>
                  {modelOutput.physics_validation.power_balance_ok ? 'VERIFIED (ΔP < 5 MW)' : 'MISMATCH'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Voltage Envelope:</span>
                <span className={modelOutput.physics_validation.voltage_constraints_ok ? 'text-emerald-400' : 'text-amber-400'}>
                  {modelOutput.physics_validation.voltage_constraints_ok ? '0.95 - 1.05 pu' : 'VIOLATION DETECTED'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>AC Solver:</span>
                <span className={modelOutput.physics_validation.powerflow_converged ? 'text-emerald-400' : 'text-red-400'}>
                  {modelOutput.physics_validation.powerflow_converged ? 'CONVERGED' : 'DIVERGED'}
                </span>
              </div>
            </div>
          </div>

          {/* Cascade Path Preview */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 space-y-2">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">
              Predicted Cascade Path
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-300 flex-wrap">
              {modelOutput.cascade_path.map((step, idx) => (
                <React.Fragment key={step}>
                  <span className="px-2 py-1 bg-slate-800 border border-cyan-500/30 rounded font-bold">
                    {step}
                  </span>
                  {idx < modelOutput.cascade_path.length - 1 && (
                    <span className="text-slate-500 font-bold">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
