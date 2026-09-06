"""
GridSense FastAPI Application Entrypoint:
Provides REST API services, in-memory caching, and CORS support.
"""

import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Add repository root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.api.routes import router as api_router

app = FastAPI(
    title="GridSense API",
    description="Predict -> Explain -> Prevent: Intelligent Electrical Grid Cascading Failure Diagnosis & Prevention",
    version="1.0.0"
)

# Enable CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API endpoints
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "platform": "GridSense",
        "tagline": "Predict -> Explain -> Prevent",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
