import React, { useState } from 'react';
import { Sliders, ArrowDownRight, RefreshCw } from 'lucide-react';
import type { WhatIfResponse } from '../../types/schema';

interface WhatIfPanelProps {
  initiatingNode: string;
  onSimulateWhatIf: (valuePct: number) => Promise<WhatIfResponse | null>;
  isSimulating: boolean;
  whatIfResult: WhatIfResponse | null;
  onReset: () => void;
}

export const WhatIfPanel: React.FC<WhatIfPanelProps> = ({
  initiatingNode,
  onSimulateWhatIf,
  isSimulating,
  whatIfResult,
  onReset
}) => {
  const [sliderValue, setSliderValue] = useState<number>(12);

  const handleSimulate = () => {
    onSimulateWhatIf(sliderValue);
  };

  return (
    <div className="glass-panel p-4 rounded-xl space-y-4 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Counterfactual What-If Simulator
          </h3>
        </div>
        <span className="text-[10px] text-cyan-400/90 font-medium">
          Physics Feasible
        </span>
      </div>

      {/* Slider Control */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-300">
          <span>Reduce {initiatingNode || 'T17'} Load:</span>
          <span className="text-cyan-400 font-bold">{sliderValue}%</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500">0%</span>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[10px] text-slate-500">30%</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="flex-1 py-2 px-3 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSimulating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>SOLVING POWER FLOW...</span>
            </>
          ) : (
            <span>SIMULATE INTERVENTION</span>
          )}
        </button>

        {whatIfResult && (
          <button
            onClick={onReset}
            className="px-3 py-2 glass-panel text-xs text-slate-300 hover:text-white rounded-lg hover:border-slate-600 transition-all"
          >
            RESET
          </button>
        )}
      </div>

      {/* BEFORE vs AFTER RESULTS VIEW */}
      {whatIfResult && (
        <div className="bg-slate-900/80 border border-cyan-500/30 rounded-lg p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-center">
            {/* BEFORE */}
            <div className="p-2.5 rounded bg-red-950/40 border border-red-500/30">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">BEFORE</span>
              <span className="text-xl font-bold text-red-400">
                {whatIfResult.before.cascade_risk.toFixed(0)}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Cascade Risk</span>
            </div>

            {/* AFTER */}
            <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">AFTER</span>
              <span className="text-xl font-bold text-emerald-400">
                {whatIfResult.after.cascade_risk.toFixed(0)}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Cascade Risk</span>
            </div>
          </div>

          {/* Risk Reduction Metric */}
          <div className="flex items-center justify-between text-xs px-2 py-1 bg-slate-950/60 rounded border border-slate-800">
            <span className="text-slate-400">Net Risk Reduction:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" />
              {whatIfResult.risk_reduction.toFixed(0)} percentage points
            </span>
          </div>

          {/* Recommended Action Summary */}
          <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-800/80">
            <span className="text-cyan-400 font-semibold block mb-0.5">
              ✓ Recommended Dispatch Action:
            </span>
            {whatIfResult.narrative}
          </div>
        </div>
      )}
    </div>
  );
};
