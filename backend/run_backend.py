#!/usr/bin/env python3
"""
GridSense Application Launcher
Starts the FastAPI Backend server and serves the frontend on http://localhost:8000
"""

import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("  GridSense AI Backend & Map Server")
    print("  Serving at: http://localhost:8000")
    print("  API Docs at: http://localhost:8000/docs")
    print("=" * 60)
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
