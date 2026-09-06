import React from 'react';
import { X, ArrowDown, Network } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    { title: "1. SCADA / AC Power Flow Physics", desc: "Pandapower solves full non-linear AC power flow equations (Kirchhoff laws, bus voltages, line MVA ratings)." },
    { title: "2. Topological Grid Graph", desc: "Electrical infrastructure converted to 3D graph (Substations, Transformers, Lines, Buses) with dynamic electrical state." },
    { title: "3. Multi-Head GAT Risk Model", desc: "3-layer Graph Attention Network with edge features predicts per-node failure probability & time-to-critical." },
    { title: "4. Temporal Root-Cause Hierarchy", desc: "Temporal precedence and lagged cross-correlation separates failure originators from downstream symptoms." },
    { title: "5. Split-Conformal Uncertainty", desc: "Distribution-free calibration bounds guarantee rigorous 90% confidence intervals around risk predictions." },
    { title: "6. Post-Hoc Physics Sanity Check", desc: "Validates active/reactive power balance, voltage envelopes (0.95-1.05 pu), and thermal constraints." },
    { title: "7. Counterfactual Intervention Engine", desc: "Evaluates load reduction & redispatch candidate actions to find the minimal action that halts cascade propagation." },
    { title: "8. Real-Time 3D Digital Twin", desc: "WebGL 3D visual control room displaying risk flows, cascade propagation paths, and what-if comparisons." }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-mono select-none">
      <div className="glass-panel max-w-2xl w-full rounded-2xl border border-slate-700/80 p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
              GridSense End-to-End Pipeline
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all">
                <h3 className="text-xs font-bold text-cyan-300 uppercase">{step.title}</h3>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{step.desc}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex justify-center text-cyan-500/60">
                  <ArrowDown className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
