"use client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BarChart3, TrendingUp, Activity, Thermometer } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gs-gray-50">
        <section className="bg-white border-b border-gs-gray-200">
          <div className="container-official py-10">
            <div className="flex items-center gap-2 text-xs text-gs-gray-500 mb-3">
              <Link href="/" className="hover:text-gs-blue-600">Home</Link>
              <span>/</span>
              <span>Analytics</span>
            </div>
            <h1 className="text-4xl font-bold text-gs-gray-900 text-institutional">Grid Analytics</h1>
            <p className="text-gs-gray-600 mt-2">Data-driven insights across the national grid.</p>
          </div>
        </section>

        <div className="container-official py-10 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <ChartCard title="Grid Health Over Time" icon={<TrendingUp className="w-5 h-5" />} value="98.7%" trend="+0.3% from last week" />
            <ChartCard title="Regional Risk" icon={<BarChart3 className="w-5 h-5" />} value="17%" trend="Stable" />
            <ChartCard title="Load Distribution" icon={<Activity className="w-5 h-5" />} value="68.5%" trend="Peak hour: 84.2%" />
            <ChartCard title="Temperature Trends" icon={<Thermometer className="w-5 h-5" />} value="52.8°C" trend="Max: 71°C (T17)" />
          </div>

          <div className="bg-white rounded-lg border border-gs-gray-200 p-8 text-center">
            <BarChart3 className="w-12 h-12 text-gs-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gs-gray-900 mb-1">Advanced charting coming soon</h3>
            <p className="text-sm text-gs-gray-500">
              Time-series visualization, voltage stability, and cascade probability trends.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ChartCard({ title, icon, value, trend }: { title: string; icon: React.ReactNode; value: string; trend: string }) {
  return (
    <div className="bg-white rounded-lg border border-gs-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gs-gray-900">{title}</h3>
        <div className="w-9 h-9 rounded-md bg-gs-blue-50 text-gs-blue-600 flex items-center justify-center">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gs-gray-900 mb-1 tabular-nums">{value}</div>
      <div className="text-xs text-gs-gray-500">{trend}</div>
      <div className="mt-4 h-24 bg-gradient-to-b from-gs-blue-50 to-transparent rounded flex items-end justify-around px-2 pb-2">
        {[40, 65, 55, 78, 62, 88, 72].map((h, i) => (
          <div key={i} className="w-4 rounded-t bg-gs-blue-400" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}