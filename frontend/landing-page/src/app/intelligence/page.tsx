"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Cpu, ShieldCheck, GitBranch, Binary, BarChart2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-gs-bg-primary text-gs-text-primary flex flex-col">
      <Navbar variant="dark" />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gs-bg-panel border border-gs-border text-xs font-mono uppercase tracking-widest text-gs-cyan-400 mb-4">
              <Cpu className="w-3.5 h-3.5" />
              Machine Learning Architecture
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Inductive Graph Neural Networks & Causal Attribution
            </h1>
            <p className="text-gs-text-secondary text-base leading-relaxed">
              GridSense combines spatial topological deep learning with distribution-free conformal calibration and Granger causality to deliver mathematically guaranteed contingency forecasting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gs-bg-panel border border-gs-border rounded-lg p-6">
              <div className="w-10 h-10 rounded bg-gs-blue-500/10 border border-gs-blue-500/30 flex items-center justify-center text-gs-blue-400 mb-4">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">GraphSAGE Spatial Aggregator</h3>
              <p className="text-xs text-gs-text-secondary leading-relaxed mb-4">
                Aggregates node embeddings across multi-hop electrical neighborhoods using admittance-weighted adjacency matrices and LayerNorm residual connections.
              </p>
              <div className="text-[11px] font-mono text-gs-cyan-400 bg-gs-bg-secondary p-2.5 rounded border border-gs-border">
                {"h_v^(k) = σ(W · [h_v^(k-1) || AGG({h_u^(k-1)})])"}
              </div>
            </div>

            <div className="bg-gs-bg-panel border border-gs-border rounded-lg p-6">
              <div className="w-10 h-10 rounded bg-gs-green-500/10 border border-gs-green-500/30 flex items-center justify-center text-gs-green-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Split-Conformal Bounds</h3>
              <p className="text-xs text-gs-text-secondary leading-relaxed mb-4">
                Guarantees distribution-free 90% statistical coverage on risk prediction intervals, eliminating neural network overconfidence in safety-critical grid dispatches.
              </p>
              <div className="text-[11px] font-mono text-gs-green-400 bg-gs-bg-secondary p-2.5 rounded border border-gs-border">
                P(Y ∈ [L_i, U_i]) ≥ 1 - α = 90.0% Coverage
              </div>
            </div>

            <div className="bg-gs-bg-panel border border-gs-border rounded-lg p-6">
              <div className="w-10 h-10 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Binary className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Granger Causal Isolator</h3>
              <p className="text-xs text-gs-text-secondary leading-relaxed mb-4">
                Evaluates temporal onset precedence and shortest path graph distance to differentiate originating root causes from downstream overloaded symptoms.
              </p>
              <div className="text-[11px] font-mono text-amber-400 bg-gs-bg-secondary p-2.5 rounded border border-gs-border">
                True Cause: T17 (91%) | Downstream: F8 (22%)
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/map-explorer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gs-cyan-500 hover:bg-gs-cyan-400 text-gs-bg-primary font-bold text-sm rounded-md transition-all shadow-lg shadow-gs-cyan-500/20"
            >
              Launch Live Map Explorer & Model Sandbox
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}