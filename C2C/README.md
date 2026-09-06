# GridSense — Predict · Explain · Prevent

> GridSense doesn't just flag that the grid is failing — it **predicts** where the failure will start, how it will **propagate**, why one asset is the **true root cause** and not a symptom, and **what to do** before it becomes a blackout.

![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.11+-brightgreen)
![React](https://img.shields.io/badge/react-19-61DAFB)

---

## Architecture

```
SCADA → AC Power Flow (pandapower) → Graph Builder (NetworkX)
  → 3-Layer Multi-Head GAT (PyTorch Geometric)
  → Temporal Root-Cause Hierarchy
  → Split-Conformal Uncertainty (90% CI)
  → Post-Hoc Physics Sanity Check
  → Counterfactual Intervention Engine
  → Real-Time 3D Digital Twin (Three.js)
```

| Layer | Tech | Purpose |
|-------|------|---------|
| Simulation | pandapower, NetworkX | Full AC power flow on IEEE 24 RTS |
| Risk Model | PyTorch Geometric (GAT) | Per-node failure probability + time-to-critical |
| Root Cause | Temporal precedence + graph analysis | Separate originator from downstream symptom |
| Uncertainty | Split-conformal prediction | Distribution-free 90% confidence intervals |
| Physics | Kirchhoff balance checks | Power balance, voltage, thermal validation |
| Intervention | Counterfactual what-if | Find minimal action to halt cascade |
| Dashboard | React + Three.js | 3D digital twin with real-time controls |

---

## Quick Start

### Prerequisites

- **Python 3.11+** with a virtual environment
- **Node.js 18+** and npm

### 1. Clone & Setup Python Environment

```bash
cd C:\GridSense\C2C

# Create venv (if not already done)
python -m venv .venv
.venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Train the GNN (optional — pre-trained weights included)

```bash
python scripts/train.py
```

Pre-trained weights are already saved at `models/gridsense_gnn.pt`.

### 3. Generate Demo Scenarios (optional)

```bash
python scripts/generate_demo_scenarios.py
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 5. Launch

**Option A — One-click launcher (Windows):**

```powershell
.\start_gridsense.bat
# or
powershell -ExecutionPolicy Bypass -File .\start_gridsense.ps1
```

**Option B — Manual (two terminals):**

Terminal 1 — Backend:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
```

### 6. Open Dashboard

Navigate to **http://localhost:5173** in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/grid` | Get grid topology & state |
| GET | `/api/scenarios` | List available scenarios |
| POST | `/api/simulate` | Run cascade simulation |
| POST | `/api/predict` | ML risk prediction only |
| POST | `/api/root-cause` | Root-cause analysis |
| POST | `/api/what-if` | Counterfactual intervention |
| GET | `/api/model/metrics` | Training evaluation metrics |

Full interactive docs at **http://localhost:8000/docs** (Swagger UI).

---

## Demo Walkthrough

1. **Normal** → Select "Normal Operating State" to see baseline grid health
2. **Transformer Overload** → T17 goes red, risk badge spikes to ~82%
3. **Cascade Emergency** → Watch the cascade propagate: T17 → F8 → T21 → S4
4. **Root Cause** → Click any node to see *why* it's flagged (originator vs symptom)
5. **What-If** → Drag the slider to reduce T17 loading by 12%, hit Simulate — watch risk drop from 86% → 18%
6. **Demo Mode** → Click the "Demo" button to auto-cycle through all scenarios

---

## Project Structure

```
C2C/
├── backend/           # FastAPI application
│   ├── main.py        # ASGI entry point
│   ├── api/routes.py  # All API endpoints
│   ├── models/        # Pydantic schemas
│   └── services/      # Business logic services
├── simulation/        # Pandapower grid simulation
│   ├── grid_loader.py # IEEE 24 RTS loader & graph builder
│   ├── cascade.py     # Cascading failure simulator
│   ├── scenarios.py   # Preset scenarios
│   └── interventions.py # What-if engine
├── ml/                # Machine learning pipeline
│   ├── models/gnn.py  # 3-layer Multi-Head GAT
│   ├── training/      # Training loop
│   ├── inference/     # Risk predictor
│   ├── causal/        # Root-cause analyzer
│   ├── uncertainty/   # Conformal prediction
│   ├── physics/       # Physics validation
│   └── explainability/ # Feature attribution
├── frontend/          # React + Three.js dashboard
│   └── src/
│       ├── App.tsx             # Main orchestrator
│       ├── api/client.ts       # API client with offline fallback
│       ├── components/grid3d/  # 3D WebGL canvas
│       ├── components/panels/  # UI panels
│       └── components/modals/  # Info modals
├── models/            # Trained weights
├── demo_scenarios/    # Deterministic JSON fallbacks
├── tests/             # Pytest suite (10 tests)
├── scripts/           # Training & generation scripts
├── docs/              # Architecture docs
├── schema.json        # Canonical data contract
├── requirements.txt   # Python dependencies
└── start_gridsense.ps1 # One-click launcher
```

---

## Model Performance (Honest Disclosure)

| Metric | Value | Notes |
|--------|-------|-------|
| ROC-AUC | 0.887 | Good discrimination |
| Precision | 0.609 | Moderate — 1-in-3 alerts are false positives |
| Recall | 0.237 | Catches ~24% of actual failures |
| F1 | 0.342 | Expected for small dataset (1,500 graphs) |

The model's raw predictions are **blended with electrical stress priors** (55/45 split) to improve practical reliability. Conformal prediction provides rigorous 90% confidence intervals.

---

## License

MIT
