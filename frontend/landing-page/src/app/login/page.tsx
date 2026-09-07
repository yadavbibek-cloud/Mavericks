"use client";

import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gs-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gs-bg-panel border border-gs-border rounded-lg p-8">
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gs-blue-500 to-gs-cyan-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-white">GridSense</span>
        </div>

        <h2 className="text-xl font-bold text-white text-center mb-2">Operator Portal</h2>
        <p className="text-xs text-gs-text-secondary text-center mb-6">Enter credentials to access dispatch control room</p>

        <form onSubmit={(e) => { e.preventDefault(); window.location.href = "/map-explorer"; }} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gs-text-secondary mb-1">Operator ID</label>
            <input
              type="text"
              defaultValue="OP-GRID-772"
              className="w-full px-3 py-2 rounded bg-gs-bg-secondary border border-gs-border text-xs font-mono text-white focus:outline-none focus:border-gs-cyan-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gs-text-secondary mb-1">Security Token</label>
            <input
              type="password"
              defaultValue="••••••••••••"
              className="w-full px-3 py-2 rounded bg-gs-bg-secondary border border-gs-border text-xs font-mono text-white focus:outline-none focus:border-gs-cyan-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gs-cyan-500 hover:bg-gs-cyan-400 text-gs-bg-primary font-bold text-xs rounded transition-colors flex items-center justify-center gap-2"
          >
            Authenticate & Open Map
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-gs-text-tertiary hover:text-white">
            ← Return to Home Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}