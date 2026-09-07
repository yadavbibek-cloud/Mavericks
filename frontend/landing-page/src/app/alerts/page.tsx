"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-gs-bg-primary text-gs-text-primary flex flex-col">
      <Navbar variant="dark" />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Active Grid Contingency Alerts</h1>
              <p className="text-xs font-mono text-gs-text-secondary">IEEE 33-Bus Monitoring Corridor</p>
            </div>
            <span className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
              1 CRITICAL ALARM
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white">Transformer T17 — Thermal Surge Overload</h3>
                  <p className="text-xs text-gs-text-secondary mt-1">
                    Loading at 185% capacity (4.85 MW). Core temperature rising at +0.8°C/min. Projected breach in 1.8 hours.
                  </p>
                </div>
              </div>
              <Link
                href="/map-explorer"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gs-bg-primary font-bold text-xs rounded transition-colors"
              >
                Inspect on Map
              </Link>
            </div>

            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white">Feeder F8 — Downstream Cascade Warning</h3>
                  <p className="text-xs text-gs-text-secondary mt-1">
                    Secondary overload anticipated upon potential T17 trip event. Projected cascade risk: 78.5%.
                  </p>
                </div>
              </div>
              <Link
                href="/map-explorer"
                className="px-3 py-1.5 bg-gs-bg-panel hover:bg-gs-bg-elevated border border-gs-border text-xs font-medium rounded transition-colors"
              >
                View Cascade Path
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}