"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Zap, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gs-bg-primary text-gs-text-primary flex flex-col">
      <Navbar variant="dark" />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">About GridSense</h1>
            <p className="text-gs-text-secondary text-base">
              National Grid Resilience Platform powered by Physics-Informed Causal Artificial Intelligence.
            </p>
          </div>

          <div className="space-y-8 text-sm text-gs-text-secondary leading-relaxed">
            <div className="bg-gs-bg-panel border border-gs-border rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gs-cyan-400" />
                The Mission
              </h2>
              <p>
                Modern electrical transmission networks face unprecedented stress from climate heatwaves, renewable intermittency, and growing industrial loads. GridSense provides system operators with real-time early warnings and autonomous contingency dispatch recommendations to prevent catastrophic cascading blackouts.
              </p>
            </div>

            <div className="bg-gs-bg-panel border border-gs-border rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-gs-cyan-400" />
                Physics Meets Deep Learning
              </h2>
              <p>
                Unlike standard SCADA alarm systems that only trigger after equipment fails, GridSense models the underlying AC power flow physics and combines it with Graph Neural Networks to forecast failure risks 6 to 24 hours in advance.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/map-explorer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gs-blue-500 hover:bg-gs-blue-600 text-white font-medium rounded-md transition-colors"
            >
              Open Map Explorer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}