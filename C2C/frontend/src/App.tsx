import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from './api/client';
import { Grid3DCanvas } from './components/grid3d/Grid3DCanvas';
import { IndiaGeoMap } from './components/map/IndiaGeoMap';
import { TopBar } from './components/panels/TopBar';
import { IntelligencePanel } from './components/panels/IntelligencePanel';
import { RootCausePanel } from './components/panels/RootCausePanel';
import { WhatIfPanel } from './components/panels/WhatIfPanel';
import { TimelineControls } from './components/panels/TimelineControls';
import { ModelMetricsModal } from './components/modals/ModelMetricsModal';
import { ArchitectureModal } from './components/modals/ArchitectureModal';
import type {
  GridNode,
  GridEdge,
  ModelOutput,
  ScenarioMeta,
  WhatIfResponse,
  GridSenseFullResponse,
  VerifiedSubstation
} from './types/schema';

// ─── Default empty state ──────────────────────────────────────────────
const EMPTY_MODEL: ModelOutput = {
  node_risk: {},
  root_cause_ranking: [],
  confidence_interval: {},
  cascade_path: [],
  cascade_timeline: [],
  cascade_risk_pct: 0,
  predicted_failures: [],
  physics_validation: {
    power_balance_ok: true,
    voltage_constraints_ok: true,
    powerflow_converged: false,
  },
};

// ─── Demo‑mode sequence timing (ms) ──────────────────────────────────
const DEMO_SCENARIO_SEQUENCE = [
  'normal',
  'transformer_overload',
  'line_outage',
  'high_demand',
  'cascade_emergency',
];
const DEMO_STEP_DELAY = 6000;

const App: React.FC = () => {
  // ── Grid + scenario state ────────────────────────────────────────────
  const [selectedGrid, setSelectedGrid] = useState('ieee24');
  const [currentView, setCurrentView] = useState<'3d' | 'india_map'>('3d');
  const [scenarios, setScenarios] = useState<ScenarioMeta[]>([]);
  const [selectedScenario, setSelectedScenario] = useState('cascade_emergency');
  const [verifiedSubstations, setVerifiedSubstations] = useState<VerifiedSubstation[]>([]);

  // ── Data state ───────────────────────────────────────────────────────
  const [nodes, setNodes] = useState<GridNode[]>([]);
  const [edges, setEdges] = useState<GridEdge[]>([]);
  const [modelOutput, setModelOutput] = useState<ModelOutput>(EMPTY_MODEL);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ── Cascade playback ────────────────────────────────────────────────
  const [cascadeStep, setCascadeStep] = useState(0);
  const [isPlayingCascade, setIsPlayingCascade] = useState(false);
  const cascadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── What-if ──────────────────────────────────────────────────────────
  const [whatIfResult, setWhatIfResult] = useState<WhatIfResponse | null>(null);
  const [isSimulatingWhatIf, setIsSimulatingWhatIf] = useState(false);

  // ── Modals ───────────────────────────────────────────────────────────
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [modelMetrics, setModelMetrics] = useState<any>(null);

  // ── Demo mode ────────────────────────────────────────────────────────
  const [isDemoMode, setIsDemoMode] = useState(false);
  const demoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoStepRef = useRef(0);

  // ═════════════════════════════════════════════════════════════════════
  //  Scenario list & verified substations load
  // ═════════════════════════════════════════════════════════════════════
  useEffect(() => {
    apiClient.getScenarios().then(setScenarios);
    apiClient.getVerifiedSubstations().then(setVerifiedSubstations);
  }, []);

  // ═════════════════════════════════════════════════════════════════════
  //  Simulate when scenario changes
  // ═════════════════════════════════════════════════════════════════════
  const runSimulation = useCallback(
    async (scenarioId: string) => {
      setIsLoading(true);
      setWhatIfResult(null);
      setCascadeStep(0);
      setIsPlayingCascade(false);
      if (cascadeTimerRef.current) {
        clearInterval(cascadeTimerRef.current);
        cascadeTimerRef.current = null;
      }

      const scenario = scenarios.find((s) => s.id === scenarioId);
      const initiatingNode =
        scenario?.initiating_node ?? (selectedGrid === 'india_demo_grid_v1' ? 'DEL-TRAN-02' : 'T17');
      const stressMult =
        scenarioId === 'cascade_emergency' || scenarioId === 'india_cascade'
          ? 1.85
          : scenarioId === 'transformer_overload' || scenarioId === 'india_delhi_overload'
          ? 1.55
          : scenarioId === 'high_demand'
          ? 1.3
          : scenarioId === 'line_outage'
          ? 1.4
          : 1.0;

      try {
        const data: GridSenseFullResponse = await apiClient.simulate(
          selectedGrid,
          initiatingNode,
          stressMult
        );
        setNodes(data.grid_state.nodes);
        setEdges(data.grid_state.edges);
        setModelOutput(data.model_output);
        // Auto-select the initiating node so Intelligence Panel shows its details
        setSelectedNodeId(initiatingNode);
      } catch (err) {
        console.error('Simulation failed:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [scenarios, selectedGrid]
  );

  useEffect(() => {
    if (scenarios.length > 0) {
      runSimulation(selectedScenario);
    }
  }, [selectedScenario, scenarios, runSimulation]);

  // ═════════════════════════════════════════════════════════════════════
  //  Cascade playback timer
  // ═════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (isPlayingCascade) {
      const maxStep = (modelOutput.cascade_timeline?.length ?? 1) - 1;
      cascadeTimerRef.current = setInterval(() => {
        setCascadeStep((prev) => {
          if (prev >= maxStep) {
            setIsPlayingCascade(false);
            if (cascadeTimerRef.current) clearInterval(cascadeTimerRef.current);
            return maxStep;
          }
          return prev + 1;
        });
      }, 1800);
    } else {
      if (cascadeTimerRef.current) {
        clearInterval(cascadeTimerRef.current);
        cascadeTimerRef.current = null;
      }
    }
    return () => {
      if (cascadeTimerRef.current) clearInterval(cascadeTimerRef.current);
    };
  }, [isPlayingCascade, modelOutput.cascade_timeline]);

  // ═════════════════════════════════════════════════════════════════════
  //  What-If handler
  // ═════════════════════════════════════════════════════════════════════
  const handleWhatIf = useCallback(
    async (valuePct: number): Promise<WhatIfResponse | null> => {
      setIsSimulatingWhatIf(true);
      const scenario = scenarios.find((s) => s.id === selectedScenario);
      const initiatingNode =
        scenario?.initiating_node ?? (selectedGrid === 'india_demo_grid_v1' ? 'DEL-TRAN-02' : 'T17');
      try {
        const result = await apiClient.whatIf(
          selectedGrid,
          initiatingNode,
          1.8,
          valuePct
        );
        setWhatIfResult(result);
        return result;
      } catch (err) {
        console.error('What-if failed:', err);
        return null;
      } finally {
        setIsSimulatingWhatIf(false);
      }
    },
    [scenarios, selectedScenario, selectedGrid]
  );

  // ═════════════════════════════════════════════════════════════════════
  //  Model metrics loader
  // ═════════════════════════════════════════════════════════════════════
  const handleOpenModelModal = useCallback(async () => {
    if (!modelMetrics) {
      const m = await apiClient.getMetrics();
      setModelMetrics(m);
    }
    setIsModelModalOpen(true);
  }, [modelMetrics]);

  // ═════════════════════════════════════════════════════════════════════
  //  Demo mode
  // ═════════════════════════════════════════════════════════════════════
  const toggleDemoMode = useCallback(() => {
    if (isDemoMode) {
      // Stop demo
      if (demoTimerRef.current) {
        clearInterval(demoTimerRef.current);
        demoTimerRef.current = null;
      }
      setIsDemoMode(false);
      return;
    }

    // Start demo
    setIsDemoMode(true);
    demoStepRef.current = 0;
    setSelectedScenario(DEMO_SCENARIO_SEQUENCE[0]);

    demoTimerRef.current = setInterval(() => {
      demoStepRef.current += 1;
      if (demoStepRef.current >= DEMO_SCENARIO_SEQUENCE.length) {
        // Loop back
        demoStepRef.current = 0;
      }
      setSelectedScenario(DEMO_SCENARIO_SEQUENCE[demoStepRef.current]);
    }, DEMO_STEP_DELAY);
  }, [isDemoMode]);

  // Clean up demo timer on unmount
  useEffect(() => {
    return () => {
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    };
  }, []);

  // ═════════════════════════════════════════════════════════════════════
  //  Derived state
  // ═════════════════════════════════════════════════════════════════════
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const currentScenario = scenarios.find((s) => s.id === selectedScenario);
  const initiatingNode = currentScenario?.initiating_node ?? 'T17';

  // ═════════════════════════════════════════════════════════════════════
  //  Render
  // ═════════════════════════════════════════════════════════════════════
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-mono">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <TopBar
        selectedGrid={selectedGrid}
        onSelectGrid={setSelectedGrid}
        scenarios={scenarios}
        selectedScenario={selectedScenario}
        onSelectScenario={(id) => {
          if (isDemoMode) return; // Block manual changes during demo
          setSelectedScenario(id);
        }}
        cascadeRiskPct={modelOutput.cascade_risk_pct}
        isDemoMode={isDemoMode}
        onToggleDemoMode={toggleDemoMode}
        onOpenModelModal={handleOpenModelModal}
        onOpenArchModal={() => setIsArchModalOpen(true)}
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      {/* ── Main content area ────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-slate-950/60 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
              <span className="text-xs text-cyan-400 tracking-widest uppercase">
                Running power flow simulation...
              </span>
            </div>
          </div>
        )}

        {/* ── Main Center View (3D Canvas or India Geospatial Map) ── */}
        <div className="flex-1 relative">
          {currentView === '3d' ? (
            <Grid3DCanvas
              nodes={nodes}
              edges={edges}
              modelOutput={modelOutput}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              cascadeStep={cascadeStep}
              isPlayingCascade={isPlayingCascade}
            />
          ) : (
            <IndiaGeoMap
              nodes={nodes}
              edges={edges}
              modelOutput={modelOutput}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              cascadeStep={cascadeStep}
              isPlayingCascade={isPlayingCascade}
              verifiedSubstations={verifiedSubstations}
            />
          )}

          {/* Watermark */}
          <div className="absolute bottom-3 left-4 text-[10px] text-slate-600 select-none pointer-events-none">
            {selectedGrid === 'india_demo_grid_v1'
              ? 'GridSense v1.0 — India National Grid (Synthetic Demo)'
              : 'GridSense v1.0 — IEEE 24 RTS Digital Twin'}
          </div>
        </div>

        {/* ── Right sidebar (Intelligence Panel) ──────────────────── */}
        <div className="w-80 flex-shrink-0 overflow-y-auto p-3 space-y-3 border-l border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
          <IntelligencePanel
            selectedNode={selectedNode}
            modelOutput={modelOutput}
            totalAssets={nodes.length}
            onSelectNode={setSelectedNodeId}
          />
        </div>
      </div>

      {/* ── Bottom panel bar ─────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-slate-800/50 bg-slate-950/90 backdrop-blur-sm">
        <div className="flex items-stretch gap-3 p-3 max-h-64 overflow-y-auto">
          {/* Root-cause hierarchy */}
          <div className="flex-1 min-w-0">
            <RootCausePanel
              ranking={modelOutput.root_cause_ranking}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
          </div>

          {/* Cascade timeline playback */}
          <div className="flex-1 min-w-0">
            <TimelineControls
              timeline={modelOutput.cascade_timeline ?? []}
              currentStep={cascadeStep}
              onSetStep={setCascadeStep}
              isPlaying={isPlayingCascade}
              onTogglePlay={() => setIsPlayingCascade((p) => !p)}
              onReset={() => {
                setCascadeStep(0);
                setIsPlayingCascade(false);
              }}
            />
          </div>

          {/* What-if intervention */}
          <div className="flex-1 min-w-0">
            <WhatIfPanel
              initiatingNode={initiatingNode}
              onSimulateWhatIf={handleWhatIf}
              isSimulating={isSimulatingWhatIf}
              whatIfResult={whatIfResult}
              onReset={() => setWhatIfResult(null)}
            />
          </div>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────── */}
      <ModelMetricsModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        metrics={modelMetrics}
      />

      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
};

export default App;
