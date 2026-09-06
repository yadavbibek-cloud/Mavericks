"use client";
import { useGridStore } from "@/store/gridStore";
import { Brain, Crosshair, HelpCircle, Route, Wrench, Check, ArrowDown, Target, Zap, AlertOctagon, ChevronRight } from "lucide-react";
import { DEMO_SCENARIOS } from "@/lib/mockData";

export function IntelligencePanel() {
  const { gridState, prediction, demoPhase, setDemoPhase, setGridState, setPrediction, setInterventionResult, interventionResult, setProcessing, selectNode } = useGridStore();
  const rootCause = prediction?.root_cause_ranking[0];
  const isMitigated = demoPhase === "mitigated";
  const hasStress = demoPhase !== "healthy";

  const handleIntervention = async () => {
    setProcessing(true, "intervention");
    await new Promise((r) => setTimeout(r, 700));
    const data = DEMO_SCENARIOS.mitigated();
    setGridState(data.gridState);
    setPrediction(data.prediction);
    setInterventionResult(data.intervention);
    setDemoPhase("mitigated");
    setProcessing(false);
  };

  return (
    <div className="w-[360px] bg-grid-bg-secondary border-l border-grid-border flex flex-col overflow-y-auto shrink-0">
      <div className="p-3 space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-grid-purple" />
            <span className="text-xs font-semibold text-grid-text-primary tracking-wide">AI INTELLIGENCE</span>
          </div>
          <span className="text-[9px] font-mono text-grid-text-tertiary">LIVE</span>
        </div>

        {/* AI Prediction */}
        {hasStress && rootCause && (
          <div className="panel p-3 glow-border-cyan">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3.5 h-3.5 text-grid-purple" />
              <span className="label">AI PREDICTION</span>
            </div>
            <div className="bg-grid-bg-primary rounded-lg p-2.5 mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-lg font-bold text-grid-red">{rootCause.node_id}</span>
                <span className="text-[9px] font-mono text-grid-text-secondary uppercase">TRANSFORMER</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="label mb-0.5">FAILURE RISK</div>
                  <div className="font-mono text-base font-bold text-grid-red">{Math.round(rootCause.root_cause_score * 100)}%</div>
                </div>
                <div>
                  <div className="label mb-0.5">WINDOW</div>
                  <div className="font-mono text-base font-bold text-grid-yellow">~{prediction?.prediction_window_hours}h</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="label">CONFIDENCE</span>
              <span className="font-mono text-xs text-grid-purple">{prediction?.confidence_interval.lower}–{prediction?.confidence_interval.upper}%</span>
            </div>
            <div className="mt-1 h-1 bg-grid-bg-primary rounded-full overflow-hidden relative">
              <div className="absolute h-full bg-grid-purple/30 rounded-full" style={{ left: `${prediction?.confidence_interval.lower}%`, width: `${(prediction?.confidence_interval.upper ?? 0) - (prediction?.confidence_interval.lower ?? 0)}%` }} />
            </div>
          </div>
        )}

        {/* Root Cause */}
        {rootCause && (
          <div className="panel p-3">
            <div className="flex items-center gap-2 mb-2">
              <Crosshair className="w-3.5 h-3.5 text-grid-red" />
              <span className="label">ROOT CAUSE DETECTED</span>
            </div>
            <button
              onClick={() => selectNode(rootCause.node_id)}
              className="w-full bg-grid-red/10 border border-grid-red/30 rounded-lg p-2.5 mb-2 text-left hover:bg-grid-red/15 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-grid-red" />
                  <span className="font-mono text-base font-bold text-grid-red">{rootCause.node_id}</span>
                </div>
                <span className="px-1.5 py-0.5 bg-grid-red/20 rounded text-[9px] font-mono text-grid-red">ROOT</span>
              </div>
              <div className="text-[10px] text-grid-text-secondary">{rootCause.failure_mode}</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="label">SCORE</span>
                <span className="font-mono text-sm font-semibold text-grid-red">{Math.round(rootCause.root_cause_score * 100)}%</span>
              </div>
            </button>
          </div>
        )}

        {/* Why Explanation */}
        {rootCause && prediction?.feature_contributions[rootCause.node_id] && (
          <div className="panel p-3">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-grid-cyan" />
              <span className="label">WHY {rootCause.node_id}?</span>
            </div>
            <div className="space-y-1.5">
              {prediction.feature_contributions[rootCause.node_id].map((c, idx) => {
                const shades = ["#00E5FF", "#00B8CC", "#008899", "#006677", "#004455"];
                return (
                  <div key={c.feature}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-grid-text-secondary">{c.feature}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-grid-text-tertiary">{c.value}</span>
                        <span className="text-[10px] font-mono font-bold text-grid-cyan">+{c.contribution_pct}%</span>
                      </div>
                    </div>
                    <div className="h-1 bg-grid-bg-primary rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.contribution_pct * 3}%`, backgroundColor: shades[idx] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cascade Path */}
        {prediction && prediction.cascade_path.length > 0 && (
          <div className="panel p-3">
            <div className="flex items-center gap-2 mb-2">
              <Route className="w-3.5 h-3.5 text-grid-red" />
              <span className="label">CASCADE PROPAGATION</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {prediction.cascade_path.map((step, idx) => (
                <div key={step.node_id} className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => selectNode(step.node_id)}
                    className={`px-2 py-1 rounded border text-center min-w-[42px] ${idx === 0 ? "bg-grid-red/15 border-grid-red/40 text-grid-red" : "bg-grid-yellow/10 border-grid-yellow/30 text-grid-yellow"}`}
                  >
                    <div className="font-mono text-[10px] font-bold">{step.node_id}</div>
                    <div className="text-[8px] font-mono opacity-70">+{step.time_offset_hours}h</div>
                  </button>
                  {idx < prediction.cascade_path.length - 1 && <ChevronRight className="w-3 h-3 text-grid-yellow shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Action */}
        {rootCause && (
          <div className="panel p-3">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-3.5 h-3.5 text-grid-cyan" />
              <span className="label">RECOMMENDED ACTION</span>
            </div>
            {!isMitigated ? (
              <>
                <div className="bg-grid-bg-primary rounded p-2.5 mb-2 text-[10px] text-grid-text-secondary">
                  <div className="mb-1">→ Reduce <span className="font-mono text-grid-cyan">T17</span> load by <span className="font-mono text-grid-cyan">12%</span></div>
                  <div>→ Redistribute to <span className="font-mono text-grid-cyan">T14</span> / <span className="font-mono text-grid-cyan">T19</span></div>
                </div>
                <button
                  onClick={handleIntervention}
                  className="w-full py-2 rounded bg-grid-cyan/15 border border-grid-cyan/40 text-grid-cyan text-xs font-mono font-semibold hover:bg-grid-cyan/25 transition-colors"
                >
                  <Zap className="w-3 h-3 inline mr-1" />
                  APPLY INTERVENTION
                </button>
              </>
            ) : (
              <div className="bg-grid-green/10 border border-grid-green/30 rounded p-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-grid-green" />
                  <span className="text-xs font-semibold text-grid-green">RISK MITIGATED</span>
                </div>
                {interventionResult && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-grid-red/5 rounded p-1.5 text-center">
                      <div className="text-[8px] text-grid-text-tertiary">BEFORE</div>
                      <div className="font-mono text-base font-bold text-grid-red">{interventionResult.original_cascade_risk_pct}%</div>
                    </div>
                    <div className="bg-grid-green/5 rounded p-1.5 text-center">
                      <div className="text-[8px] text-grid-text-tertiary">AFTER</div>
                      <div className="font-mono text-base font-bold text-grid-green">{interventionResult.new_cascade_risk_pct}%</div>
                    </div>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-center gap-1">
                  <ArrowDown className="w-3 h-3 text-grid-green" />
                  <span className="font-mono text-xs font-bold text-grid-green">-{interventionResult?.risk_reduction_pct}% risk reduction</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
