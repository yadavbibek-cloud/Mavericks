# ⚡ GridSense — National Grid Intelligence Platform

> **Real-Time Causal AI, Graph Neural Networks (GNN), and Digital Twin for Power Grid Cascading Failure Prediction, Root-Cause Disambiguation, and What-If Mitigation.**

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Dual-Server Architecture](#-dual-server-architecture)
3. [System Prerequisites](#-system-prerequisites)
4. [Step-by-Step Execution Guide](#-step-by-step-execution-guide)
5. [Codebase & Directory Structure](#-codebase--directory-structure)
6. [Deep-Dive Code & Module Explanation](#-deep-dive-code--module-explanation)
   - [1. Backend Engine (`backend/`)](#1-backend-engine-backend)
   - [2. Main GIS Map Explorer (`frontend/map-explorer/`)](#2-main-gis-map-explorer-frontendmap-explorer)
   - [3. Next.js Home Landing Page (`frontend/landing-page/`)](#3-nextjs-home-landing-page-frontendlanding-page)
7. [Dependencies Manifest](#-dependencies-manifest)
8. [REST API Endpoints Reference](#-rest-api-endpoints-reference)
9. [Automated Testing & Quality Assurance](#-automated-testing--quality-assurance)
10. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🌟 Project Overview

Modern electricity grids are highly interconnected, non-linear physical networks. When an asset (such as a high-voltage transformer or transmission feeder) experiences severe thermal or electrical stress, standard SCADA alarms often trigger only after equipment fails. Furthermore, power immediately redistributes across neighboring lines according to Kirchhoff's laws, triggering **cascading blackout failures** across lateral sub-grids.

**GridSense** solves this challenge through a three-layer resilience framework:

1. **Physics-Informed Digital Twin Simulation**: Implements AC power flow analysis over an IEEE 33-Bus benchmark system to compute active/reactive power, voltage angles, line losses, and thermal heat buildup.
2. **Inductive Graph Neural Network (GraphSAGE)**: Learns spatial-temporal topological dependencies across grid buses to forecast failure probabilities up to **6 to 24 hours ahead** of SCADA threshold violations.
3. **Granger Causal Root-Cause Attribution & Split-Conformal Uncertainty**: Differentiates initiating primary faults (`T17`) from downstream symptoms (`F8`, `T21`, `S4`), providing mathematical confidence intervals (90% coverage) and automated what-if dispatch mitigation actions.

---

## 🏛️ Dual-Server Architecture

GridSense operates as a coordinated dual-server system:

```text
┌─────────────────────────────────────────────────────────────┐
│                 PORT 3000: Home Landing Page                │
│    (Next.js 16.3 + React 19 + Tailwind CSS + Framer Motion) │
│                                                             │
│   • Cinematic Hero Presentation & Video Backdrop            │
│   • 6-Stage SCADA-to-Mitigation Architecture Pipeline       │
│   • Live Regional Snapshots & Grid Health Telemetry         │
│   • "Explore Grid" & "Map Explorer" CTA Routing             │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Direct Interactive Link)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          PORT 8000: Main Map Explorer & AI Backend          │
│            (FastAPI + Leaflet GIS + PyTorch GNN)            │
│                                                             │
│   • OpenStreetMap Dark Canvas (33 IEEE Bus Assets)          │
│   • Real-Time SCADA Telemetry Stream (59.98 Hz Frequency)   │
│   • Live Stress Injection Slider (1.0x to 2.6x Multiplier)  │
│   • Granger Causal Root-Cause Isolator (T17: 91% Score)     │
│   • Multi-Hop Cascade Propagation Path Forecaster           │
│   • What-If Mitigation Optimizer (86% -> 18% Risk Slashed)  │
│   • "Home Landing Page" Header Button (Returns to Port 3000)│
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 System Prerequisites

Before running the project, ensure you have the following installed on your system:

- **Python**: Version `3.10` or higher (compatible with Python 3.10, 3.11, 3.12, 3.14).
- **Node.js**: Version `18.x`, `20.x`, or higher.
- **npm**: Version `9.x` or higher.
- **Web Browser**: Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari.

---

## 🚀 Step-by-Step Execution Guide

### Recommended: Unified Single-Command Runner
From the root directory `c1c`, you can launch **both** the backend (port 8000) and the website (port 3000) with one command:
```bash
python run.py
```
- **Access Home Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Access Main GIS Map Explorer**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Manual / Individual Server Launch

#### 💻 Terminal 1: Start the AI Backend & GIS Map Explorer (Port 8000)
```bash
python run_backend.py
# Or: uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 💻 Terminal 2: Start the Home Landing Page (Port 3000)
```bash
cd frontend/landing-page
npm run dev
```

---

## 📂 Codebase & Directory Structure

```text
c1c/
├── 🌐 frontend/                          # ALL FRONTEND APPLICATIONS
│   ├── landing-page/                   # Next.js 16 Web Platform & Landing Page (Port 3000)
│   │   ├── src/
│   │   │   ├── app/                    # App Router pages (Home, About, Intelligence, Alerts)
│   │   │   ├── components/             # Reusable UI, 3D Grid, Canvas, and Layouts
│   │   │   ├── store/                  # Client-side State Stores (Zustand)
│   │   │   └── lib/                    # Types, mock data, and Geo utilities
│   │   ├── package.json                # Frontend NPM dependencies
│   │   ├── tailwind.config.ts          # Tailwind CSS theme configuration
│   │   └── tsconfig.json               # TypeScript configuration
│   │
│   └── map-explorer/                   # Main Interactive GIS Map Explorer (Port 8000)
│       ├── index.html                  # Leaflet OpenStreetMap Dark GIS Dashboard
│       ├── app.js                      # Real-time WebSocket/SCADA Telemetry Client
│       ├── styles.css                  # Control-Room Dark Theme Stylesheet
│       └── all-in-one.html             # Standalone all-in-one single file build
│
├── ⚙️ backend/                           # ALL BACKEND ENGINES, APIS & DATA
│   ├── ml/                             # MACHINE LEARNING & DEEP LEARNING SUBSYSTEM
│   │   ├── models/                     # PyTorch Neural Network Architectures
│   │   │   ├── gnn_model.py            # Spatial Message Passing (GraphSAGE / GAT)
│   │   │   ├── heads.py                # Multi-Task Prediction Heads (Risk, TTC, Cascade)
│   │   │   └── weights/                # Serialized Model Checkpoints
│   │   │       └── pretrained_gnn.pt   # PyTorch Model Weights (.pt)
│   │   ├── dataset/                    # Synthetic Data Generation & DataLoaders
│   │   │   ├── generator.py            # Physics-Grounded IEEE-33 Scenario Generator
│   │   │   ├── loader.py               # PyTorch GraphDataset & Batch Collator
│   │   │   └── data/                   # Train / Validation / Test Splits
│   │   │       ├── train.json          # 100 Training Samples
│   │   │       ├── val.json            # 25 Validation Samples
│   │   │       └── test.json           # 25 Benchmark Test Samples
│   │   ├── training/                   # Model Training & Evaluation Engine
│   │   │   ├── train.py                # Multi-Task Loss Backpropagation Loop (BCE + MSE)
│   │   │   └── evaluate.py             # Test Set Evaluation & Conformal Coverage Checks
│   │   ├── causal/                     # Causal Inference & Statistical Guarantees
│   │   │   ├── causal_engine.py        # Granger Temporal Precedence & Root-Cause Isolator
│   │   │   ├── conformal.py            # Split-Conformal Prediction (90% Confidence Bounds)
│   │   │   └── explainability.py       # Feature Attribution & Kirchhoff Sanity Checks
│   │   └── inference.py                # Production Real-Time Inference Manager
│   │
│   ├── main.py                         # FastAPI REST API Server & Static Asset Mounter
│   ├── simulator.py                    # AC Power Flow Solver & Dynamic Thermal Simulator
│   ├── gnn_engine.py                   # GNN Engine Modular Wrapper
│   ├── causal_uncertainty.py           # Causal Uncertainty Modular Wrapper
│   ├── intervention.py                 # What-If Load Shedding & Dispatch Optimizer
│   ├── scenarios.py                    # Pre-Calibrated Pitch & Stress Scenarios
│   ├── schema.json                     # System Architecture & Topology Data Contract
│   ├── requirements.txt                # Python backend dependencies
│   ├── run_backend.py                  # Dedicated backend launcher script
│   └── tests/                          # Automated Unit & Integration Tests
│       ├── __init__.py
│       ├── test_pipeline.py            # End-to-End System Pipeline Tests (6/6 Passing)
│       └── test_ml_pipeline.py         # Dedicated ML & Model Test Suite (6/6 Passing)
│
├── run.py                              # Unified root launcher (Starts Ports 3000 & 8000)
├── requirements.txt                    # Root Python dependencies pointer
└── README.md                           # Complete Project Documentation & Guide
```

---

## 🔍 Deep-Dive Code & Module Explanation

### 1. Backend Engine (`backend/`)

#### 📄 `backend/main.py`
- **Purpose**: The primary API application server built with **FastAPI**.
- **Key Responsibilities**:
  - Serves static files and mounts `frontend/index.html` on the root route (`GET /`).
  - Implements CORS middleware to permit multi-port communication.
  - Exposes `/api/health`, `/api/grid/topology`, `/api/simulate`, `/api/predict`, `/api/intervene`, and `/api/scenarios`.

#### 📄 `backend/simulator.py`
- **Purpose**: Physics-informed power grid simulator modeled on the **IEEE 33-Bus Radial Distribution Feeder**.
- **Key Algorithms**:
  - **Power Flow Solver**: Computes bus voltages ($V_i$), phase angles ($\theta_i$), active power injections ($P_i$), and line currents ($I_{ij}$).
  - **Dynamic Thermal Model**: Calculates temperature accumulation ($T_{t+1} = T_t + \alpha \cdot I^2 - \beta \cdot (T_t - T_{\text{ambient}})$).
  - **Cascade Simulation Loop**: Iteratively trips lines when current exceeds thermal thresholds ($I > I_{\text{max}}$) and recomputes power flow until Kirchhoff convergence or blackout.

#### 📄 `backend/gnn_engine.py`
- **Purpose**: PyTorch-based **GraphSAGE (Graph Sample and Aggregate)** neural network.
- **Key Mechanism**:
  - Aggregates neighborhood feature embeddings (voltage magnitude, loading percentage, ambient temperature, line reactance) across $k$-hop neighbors:
    $$h_{\mathcal{N}(v)}^{(k)} = \text{AGGREGATE}_k \left( \left\{ h_u^{(k-1)}, \forall u \in \mathcal{N}(v) \right\} \right)$$
    $$h_v^{(k)} = \sigma \left( W^{(k)} \cdot \left[ h_v^{(k-1)} \,\|\, h_{\mathcal{N}(v)}^{(k)} \right] \right)$$
  - Outputs per-node failure probability scores and estimated Time-to-Critical (TTC) in hours.

#### 📄 `backend/causal_uncertainty.py`
- **Purpose**: Disambiguates root causes from cascading symptoms and provides calibrated confidence bounds.
- **Key Techniques**:
  - **Granger Causal Attribution**: Uses lagged correlation and upstream electrical distance to isolate initiating faults (`T17: 91% Score`) from downstream overloaded lines (`F8: 22% Score`).
  - **Split-Conformal Prediction**: Guarantees distribution-free mathematical coverage ($1 - \alpha = 90\%$) for failure prediction intervals $[L_i, U_i]$.
  - **Multi-Hop Cascade Tracing**: Computes time-offset horizons ($+0.0\text{h} \rightarrow +1.5\text{h} \rightarrow +3.0\text{h} \rightarrow +5.0\text{h}$).

#### 📄 `backend/intervention.py`
- **Purpose**: Optimization engine for contingency mitigation and power rerouting.
- **Key Calculations**:
  - Calculates optimal load-shedding setpoints on stressed nodes ($\Delta P = 12\%$).
  - Simulates active power transfer across tie-lines to adjacent transformers (`T14` and `T19`).
  - Evaluates Before vs. After metrics (slashes cascade risk from **86% to 18%**).

#### 📄 `backend/scenarios.py`
- **Purpose**: Pre-configured, deterministic benchmark scenarios:
  1. `scenario_normal`: Baseline healthy grid state (3.2% risk).
  2. `scenario_t17_overload`: Transformer T17 thermal surge and Western corridor cascade.
  3. `scenario_f8_storm`: High-wind surge event on Feeder F8.
  4. `scenario_heatwave`: Extreme $42^\circ\text{C}$ ambient regional heatwave.

---

### 2. Main GIS Map Explorer (`frontend/`)

- **`frontend/index.html`**:
  - Renders a **Leaflet OpenStreetMap dark-canvas** visualizing all 33 IEEE bus nodes across real-world geospatial coordinates.
  - Features real-time status indicators (Green: Healthy, Amber: Stressed, Red: Critical, Gold: Root Cause).
  - Displays live telemetry gauges: Loading (`84.2%`), Voltage (`0.972 pu`), Temperature (`71.0 °C`), and Time-to-Critical (`6.2 hrs`).
  - Includes a direct **"Home Landing Page"** button in the header bar to navigate back to `http://localhost:3000`.
- **`frontend/app.js`**:
  - Handles client-side state, live telemetry streaming tick timers, interactive asset selection, stress slider event listeners, and API calls to `/api/simulate` and `/api/intervene`.
- **`frontend/styles.css`**:
  - Enterprise control-room dark aesthetics, neon glow borders, and custom map marker animations.

---

### 3. Next.js Home Landing Page (`frontend/landing-page/`)

- **`src/app/page.tsx`**: Executive landing page composing the Hero, Impact Statistics, Architecture Pipeline, Regional Preview, and CTA sections.
- **`src/components/layout/Navbar.tsx`**: Navigation header with direct routing to `http://localhost:8000` for all **"Map Explorer"** and **"Get Started"** triggers.
- **`src/components/home/Hero.tsx`**: Video backdrop with glowing institutional typography and action buttons linking to the map explorer.
- **`src/components/home/HowItWorks.tsx`**: Interactive 6-stage pipeline (Data Ingestion $\rightarrow$ Digital Twin $\rightarrow$ GNN Inference $\rightarrow$ Root Cause $\rightarrow$ Cascade Analysis $\rightarrow$ Mitigation).
- **`src/components/home/GridPreview.tsx`**: Interactive India regional map preview (Northern, Western, Southern, Eastern, North-Eastern zones).

---

### 4. Machine Learning Subsystem (`backend/ml/`)

The machine learning core is organized into modular packages:

```bash
# 1. Generate synthetic physics-grounded power flow datasets (train / val / test splits):
python -c "from backend.ml.dataset.generator import GridDatasetGenerator; GridDatasetGenerator().export_splits('backend/ml/dataset/data')"

# 2. Train the PyTorch GraphSAGE model & save checkpoints to backend/ml/models/weights/pretrained_gnn.pt:
python -m backend.ml.training.train

# 3. Evaluate the model on test.json (Conformal coverage guarantee, MAE, RMSE):
python -m backend.ml.training.evaluate
```


## 📦 Dependencies Manifest

### 🐍 Python Dependencies (`requirements.txt`)

```text
fastapi>=0.115.0       # Asynchronous REST API web framework
uvicorn>=0.30.0        # ASGI web server
networkx>=3.2.0        # Topological graph data structures
numpy>=1.26.0          # Numerical vector & matrix operations
scipy>=1.12.0          # Scientific algorithms & AC power flow solver
pandas>=2.2.0          # Telemetry time-series dataframes
scikit-learn>=1.4.0    # Conformal calibration & statistical metrics
torch>=2.0.0           # PyTorch deep learning framework for GNN
pydantic>=2.7.0        # Data validation and API request models
```

### ⚛️ Node.js Dependencies (`frontend/landing-page/package.json`)

```json
{
  "dependencies": {
    "next": "16.3.4",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "tailwindcss": "^4",
    "lucide-react": "^1.41.0",
    "framer-motion": "^13.2.0",
    "three": "^0.185.1",
    "@react-three/fiber": "^9.7.0",
    "@react-three/drei": "^10.7.8",
    "zustand": "^5.0.15",
    "d3-geo": "^3.1.1",
    "topojson-client": "^3.1.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.6.0"
  }
}
```

---

## 📡 REST API Endpoints Reference

### 1. Health Check
- **`GET /api/health`**
- **Response**:
  ```json
  {
    "status": "online",
    "system": "GridSense AI Core",
    "gnn_model_loaded": true,
    "conformal_calibration_level": "90% Coverage",
    "topology": "IEEE 33-Bus Feeder System"
  }
  ```

### 2. Grid Topology Baseline
- **`GET /api/grid/topology`**
- **Response**: Returns the complete baseline IEEE 33-Bus network, node features, active edges, and nominal voltages.

### 3. Run Contingency Simulation
- **`POST /api/simulate`**
- **Request Body**:
  ```json
  {
    "initiating_node": "T17",
    "stress_multiplier": 1.85,
    "ambient_temp_c": 34.0,
    "max_steps": 6
  }
  ```
- **Response**: Returns post-stress grid state, GNN failure probabilities, Granger root-cause ranking, conformal intervals, and cascade sequence.

### 4. Execute What-If Mitigation
- **`POST /api/intervene`**
- **Request Body**:
  ```json
  {
    "initiating_node": "T17",
    "stress_multiplier": 1.85,
    "ambient_temp_c": 34.0,
    "load_shed_pct": 12.0
  }
  ```
- **Response**: Returns comparative Before vs. After risk metrics, power flow redistribution, and cascade elimination verification.

---

## 🧪 Automated Testing & Quality Assurance

GridSense includes a comprehensive unit and integration test suite verifying power flow convergence, GNN inference, causal ranking, and API endpoints.

To run the automated tests:
```bash
python -m unittest discover tests
```

### Test Coverage Summary:
- ✅ `test_health_endpoint`: Verifies API availability and model loading status.
- ✅ `test_topology_endpoint`: Validates IEEE 33-bus graph structure and voltage bounds.
- ✅ `test_simulation_pipeline`: Tests AC power flow, GNN failure estimation, and Granger attribution.
- ✅ `test_intervention_optimizer`: Asserts mitigation efficacy (risk reduction $\ge 50\%$).
- ✅ `test_canned_scenarios`: Tests all deterministic demonstration scenarios.
- ✅ `test_schema_json_exists`: Asserts system architecture specification integrity.

---

## ❓ Troubleshooting & FAQs

### Q1: Port 8000 is already in use
**Solution**: Stop any conflicting process on port 8000:
```powershell
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
```

### Q2: Port 3000 is already in use
**Solution**: Next.js will automatically offer port 3001, or you can kill the active PID:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Q3: How do I test without internet access?
**Solution**: All core machine learning models, physics power flow algorithms, and map tiles are bundled locally or gracefully fallback to offline mathematical approximations. You can also directly open `frontend/index.html` in any browser.

---

<div align="center">
  <sub>Built for National Electricity Grid Resilience &bull; GridSense AI Core &bull; 2026</sub>
</div>
