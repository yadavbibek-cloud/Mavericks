import React from 'react';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import type { TimelineEvent } from '../../types/schema';

interface TimelineControlsProps {
  timeline: TimelineEvent[];
  currentStep: number;
  onSetStep: (step: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  timeline,
  currentStep,
  onSetStep,
  isPlaying,
  onTogglePlay,
  onReset
}) => {
  if (!timeline || timeline.length === 0) return null;

  const maxSteps = timeline.length - 1;
  const currentEvent = timeline[currentStep] || timeline[0];

  return (
    <div className="glass-panel px-5 py-3 rounded-xl flex items-center justify-between font-mono gap-6 z-20">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/40 flex items-center justify-center transition-all"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <button
          onClick={() => onSetStep(Math.min(maxSteps, currentStep + 1))}
          disabled={currentStep >= maxSteps}
          className="w-8 h-8 rounded-lg glass-panel text-slate-300 hover:text-white flex items-center justify-center disabled:opacity-30 transition-all"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={onReset}
          className="w-8 h-8 rounded-lg glass-panel text-slate-300 hover:text-white flex items-center justify-center transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline Steps Tracker */}
      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400">T+{currentStep}</span>
        <div className="flex-1 flex items-center gap-1.5">
          {timeline.map((_evt, idx) => (
            <button
              key={idx}
              onClick={() => onSetStep(idx)}
              className={`flex-1 h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                  : idx < currentStep
                  ? 'bg-red-500/80'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-slate-500">T+{maxSteps}</span>
      </div>

      {/* Active Step Event Callout */}
      <div className="max-w-md truncate text-xs text-slate-300 border-l border-slate-800 pl-4">
        <span className="text-cyan-400 font-bold mr-2">[{currentEvent.node}]:</span>
        <span>{currentEvent.event}</span>
      </div>
    </div>
  );
};
