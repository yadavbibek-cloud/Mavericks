import React from 'react';
import { Target } from 'lucide-react';
import type { RootCauseItem } from '../../types/schema';

interface RootCausePanelProps {
  ranking: RootCauseItem[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export const RootCausePanel: React.FC<RootCausePanelProps> = ({
  ranking,
  selectedNodeId,
  onSelectNode
}) => {
  if (!ranking || ranking.length === 0) return null;

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Temporal Root-Cause Hierarchy
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">
          Ranked by causal precedence
        </span>
      </div>

      <div className="space-y-2">
        {ranking.slice(0, 4).map((item, idx) => {
          const isSelected = selectedNodeId === item.node;
          const isInitiator = !item.explained_by_upstream;

          return (
            <div
              key={item.node}
              onClick={() => onSelectNode(item.node)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 border-cyan-400 shadow-md shadow-cyan-500/10'
                  : isInitiator
                  ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/80'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">#{idx + 1}</span>
                  <span className="font-bold text-sm text-slate-100">{item.node}</span>
                  {isInitiator ? (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      FAILURE ORIGIN
                    </span>
                  ) : (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      SYMPTOM
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Root-Cause Likelihood</span>
                  <span className={`text-xs font-bold ${isInitiator ? 'text-amber-400' : 'text-slate-400'}`}>
                    {(item.root_cause_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Upstream Explanation Note */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                {item.explained_by ? (
                  <>
                    <span>Preceded by surge on</span>
                    <span className="text-cyan-300 font-bold underline">{item.explained_by}</span>
                  </>
                ) : (
                  <span className="text-amber-300/90 font-medium">
                    Earliest onset (T+0); unprovoked upstream stress
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
