# GridSense — Launch Script (PowerShell)
# Starts both the FastAPI backend and the Vite frontend dev server.

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

# ─── Locate Python venv ────────────────────────────────────────────────
$VENV_PYTHON = "$ROOT\..\PowerGraph-XAI-master\PowerGraph-XAI-master\venv\Scripts\python.exe"
if (-not (Test-Path $VENV_PYTHON)) {
    Write-Host "[ERROR] Python venv not found at $VENV_PYTHON" -ForegroundColor Red
    Write-Host "        Create it with: python -m venv ..\PowerGraph-XAI-master\PowerGraph-XAI-master\venv"
    exit 1
}

# ─── Ensure Node.js is on PATH ─────────────────────────────────────────
$env:Path = "C:\Program Files\nodejs;" + $env:Path

# ─── Start backend (FastAPI / Uvicorn) ─────────────────────────────────
Write-Host ""
Write-Host "  ┌─────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "  │    GridSense — Predict • Explain • Act   │" -ForegroundColor Cyan
Write-Host "  └─────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/2] Starting backend (FastAPI) on http://localhost:8000 ..." -ForegroundColor Yellow

$backendJob = Start-Job -ScriptBlock {
    param($python, $root)
    Set-Location $root
    & $python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload 2>&1
} -ArgumentList $VENV_PYTHON, $ROOT

Start-Sleep -Seconds 3

# ─── Start frontend (Vite dev server) ──────────────────────────────────
Write-Host "[2/2] Starting frontend (Vite) on http://localhost:5173 ..." -ForegroundColor Yellow

$frontendJob = Start-Job -ScriptBlock {
    param($root)
    $env:Path = "C:\Program Files\nodejs;" + $env:Path
    Set-Location "$root\frontend"
    & npm run dev 2>&1
} -ArgumentList $ROOT

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "  Dashboard:  http://localhost:5173" -ForegroundColor Green
Write-Host "  API Docs:   http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers." -ForegroundColor DarkGray
Write-Host ""

# ─── Tail logs until user presses Ctrl+C ───────────────────────────────
try {
    while ($true) {
        Receive-Job -Job $backendJob -ErrorAction SilentlyContinue 2>$null | ForEach-Object { Write-Host "[backend] $_" -ForegroundColor DarkCyan }
        Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue 2>$null | ForEach-Object { Write-Host "[frontend] $_" -ForegroundColor DarkMagenta }
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`nShutting down..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "Done." -ForegroundColor Green
}
