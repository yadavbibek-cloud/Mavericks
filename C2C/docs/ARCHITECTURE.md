# GridSense Internal Architecture

## Overview
GridSense bridges power-systems cascading failure simulation with Graph Neural Networks (GNNs), causal root-cause heuristics, split-conformal uncertainty quantification, post-hoc physical validation, and counterfactual interventions.

```
+-------------------------------------------------------------+
|                  Existing Research Layer                    |
|  PowerGraph-XAI datasets (21,500 IEEE24 cascade scenarios)  |
|  Pandapower IEEE 24 RTS / 39 / 118 power flow models        |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                        Adapter Layer                        |
|  - simulation/grid_loader.py (pandapower -> GeoJSON / 3D)   |
|  - simulation/cascade.py (step-by-step N-k power flow)      |
|  - ml/data/converter.py (grid_state -> PyG Data)            |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                      GridSense Core ML                      |
|  - 3-Layer GAT with Edge Features & Multi-task Heads         |
|  - Temporal Precedence & Cross-Correlation Root-Cause       |
|  - Split-Conformal Prediction (90% coverage interval)        |
|  - Post-Hoc Physics Sanity Check (power balance, voltage)   |
|  - Feature Permutation Attribution (Why? breakdown)         |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                Counterfactual Prevention Engine             |
|  - What-If Intervention Search                              |
|  - Load shedding, Generation redispatch, Feeder rerouting   |
|  - Before (86%) vs After (18%) Risk Evaluation              |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     FastAPI REST Backend                    |
|  /api/grid, /api/simulate, /api/predict, /api/what-if...    |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|             Interactive 3D Control Room Frontend            |
|  React 19 + Three.js + React Three Fiber + Tailwind CSS     |
|  - 3D Digital Twin with Substations, Transformers, Lines    |
|  - Live Risk Glow, Animated Cascade Particle Path           |
|  - Intelligence, Root Cause, Why?, & What-If Panels         |
+-------------------------------------------------------------+
```

## Component Breakdown

1. **Simulation Layer (`simulation/`)**:
   - `grid_loader.py`: Loads IEEE 24 RTS, IEEE 39, and IEEE 118 networks with calibrated 3D coordinates for spatial layout.
   - `cascade.py`: Simulates cascading overloads using AC power flow (`pandapower.runpp`). Computes line and transformer loading percentages, bus voltage deviations, and branch tripping sequences.
   - `interventions.py`: Applies candidate interventions (load reduction, generation redispatch) and re-evaluates cascade outcomes.
   - `scenarios.py`: Configures standard scenarios (Normal, Transformer Overload, Line Outage, High Demand Heatwave, Cascade Emergency).

2. **Machine Learning Layer (`ml/`)**:
   - `models/gnn.py`: 3-layer GAT / GraphSAGE with node risk classification head and time-to-critical regression head.
   - `training/train.py`: Trains model on real cascade failure data, computing precision, recall, F1, and ROC-AUC.
   - `inference/predict.py`: Inference service executing forward pass on live or simulated grid states.
   - `causal/root_cause.py`: Temporal precedence and lagged cross-correlation heuristic separating initiating root causes from downstream symptoms.
   - `uncertainty/conformal.py`: Distribution-free split-conformal prediction generating valid $1-\alpha$ confidence bands.
   - `physics/validation.py`: Checks power balance ($\sum P \approx 0$), voltage bounds ($0.95-1.05$ pu), and thermal constraints.
   - `explainability/attribution.py`: Permutation importance ranking factors (Temperature, Load %, Neighbor transfer, Voltage deviation).

3. **Backend Service Layer (`backend/`)**:
   - FastAPI modular architecture with dependency injection and in-memory model/grid caching.
   - Strict validation matching `schema.json`.

4. **3D Visualization Layer (`frontend/`)**:
   - WebGL / Three.js canvas rendering realistic infrastructure meshes:
     - Substations (heavy transformer yards)
     - Step-up / step-down Transformers
     - High-voltage Buses
     - Transmission Lines with animated particle pulses
   - Dynamic risk coloring (teal -> amber -> orange -> pulsing crimson).
   - Sequential cascade path playback and interactive What-If slider.
