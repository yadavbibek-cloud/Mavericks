#!/usr/bin/env python3
"""
GridSense Unified Runner
Launches both the FastAPI AI Backend (Port 8000) and the Next.js Website Landing Page (Port 3000)
with a single command, unified logging, and graceful shutdown on Ctrl+C.
"""

import os
import sys
import time
import signal
import subprocess
import threading
import urllib.request

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_LANDING_DIR = os.path.join(ROOT_DIR, "frontend", "landing-page")
if not os.path.exists(FRONTEND_LANDING_DIR):
    FRONTEND_LANDING_DIR = os.path.join(ROOT_DIR, "Mavericks")

backend_proc = None
frontend_proc = None
is_shutting_down = False


def log_stream(proc, prefix):
    """Pipes stdout/stderr from a child process with a colored/clean prefix."""
    try:
        for line in iter(proc.stdout.readline, ""):
            if is_shutting_down:
                break
            if line:
                clean_line = line.rstrip()
                print(f"{prefix} {clean_line}", flush=True)
    except Exception:
        pass


def check_port(url, timeout=1.0):
    """Checks if an HTTP service is responding."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "GridSense-HealthChecker"})
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.status == 200
    except Exception:
        return False


def start_backend():
    """Starts the FastAPI Backend server on Port 8000."""
    global backend_proc
    cmd = [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
    backend_proc = subprocess.Popen(
        cmd,
        cwd=ROOT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        universal_newlines=True
    )
    t = threading.Thread(target=log_stream, args=(backend_proc, "[\033[96mBackend:8000\033[0m]"), daemon=True)
    t.start()


def start_frontend():
    """Starts the Next.js Website Landing Page on Port 3000."""
    global frontend_proc
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    cmd = [npm_cmd, "run", "dev"]
    frontend_proc = subprocess.Popen(
        cmd,
        cwd=FRONTEND_LANDING_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        universal_newlines=True,
        shell=(os.name == "nt")
    )
    t = threading.Thread(target=log_stream, args=(frontend_proc, "[\033[92mFrontend:3000\033[0m]"), daemon=True)
    t.start()


def shutdown(signum=None, frame=None):
    """Gracefully terminates both child processes on exit."""
    global is_shutting_down
    if is_shutting_down:
        return
    is_shutting_down = True
    print("\n" + "=" * 65)
    print("  Stopping GridSense services gracefully...")
    print("=" * 65)

    if backend_proc:
        try:
            if os.name == "nt":
                subprocess.call(["taskkill", "/F", "/T", "/PID", str(backend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                backend_proc.terminate()
        except Exception:
            pass

    if frontend_proc:
        try:
            if os.name == "nt":
                subprocess.call(["taskkill", "/F", "/T", "/PID", str(frontend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                frontend_proc.terminate()
        except Exception:
            pass

    print("  All services stopped. Goodbye!\n")
    sys.exit(0)


def print_banner():
    """Prints the startup dashboard banner."""
    print("=" * 65)
    print("   GRIDSENSE NATIONAL GRID INTELLIGENCE PLATFORM")
    print("=" * 65)
    print("  Starting unified services...\n")
    print("  1. AI Backend & GIS Map Explorer : http://localhost:8000")
    print("  2. Home Landing Page (Mavericks) : http://localhost:3000")
    print("  3. Interactive API Swagger Docs  : http://localhost:8000/docs")
    print("\n  Press Ctrl+C at any time to stop both servers.")
    print("=" * 65 + "\n")


def main():
    # Register signal handlers for clean Ctrl+C termination
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    print_banner()

    # 1. Start Backend on Port 8000
    print("--> Launching FastAPI Backend on Port 8000...")
    start_backend()

    # 2. Start Frontend on Port 3000 (Mavericks)
    print("--> Launching Next.js Landing Page on Port 3000...")
    start_frontend()

    # 3. Health check waiter
    print("\n--> Verifying server health...")
    backend_up = False
    frontend_up = False
    for attempt in range(15):
        time.sleep(1)
        if not backend_up and check_port("http://localhost:8000/api/health"):
            backend_up = True
            print("  [OK] Backend & Map Explorer is LIVE on http://localhost:8000")
        if not frontend_up and check_port("http://localhost:3000"):
            frontend_up = True
            print("  [OK] Home Landing Page is LIVE on http://localhost:3000")
        if backend_up and frontend_up:
            break

    print("\n" + "-" * 65)
    print("  All GridSense servers are running successfully!")
    print("  - Open Home Website  : http://localhost:3000")
    print("  - Open Map Explorer  : http://localhost:8000")
    print("-" * 65 + "\n")

    # Keep main thread alive
    try:
        while True:
            time.sleep(0.5)
            # If any process unexpectedly died, monitor it
            if backend_proc and backend_proc.poll() is not None and not is_shutting_down:
                print("[Warning] Backend process exited unexpectedly.")
                break
            if frontend_proc and frontend_proc.poll() is not None and not is_shutting_down:
                print("[Warning] Frontend process exited unexpectedly.")
                break
    except KeyboardInterrupt:
        shutdown()


if __name__ == "__main__":
    main()
