"use client";
import { useCountUp, useInView } from "@/hooks/useCountUp";

const STATS = [
  { value: 33, suffix: "+", label: "Grid Nodes Monitored" },
  { value: 91, suffix: "%", label: "Predictive Risk Detection" },
  { value: 78, suffix: "%", label: "Cascade Analysis Accuracy" },
  { value: 24, suffix: "/7", label: "Grid Intelligence" },
];

export function StatsSection() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="bg-gs-bg-primary border-y border-gs-border py-24">
      <div ref={ref} className="container-official">
        <div className="max-w-2xl mb-16">
          <div className="inline-block text-xs font-semibold text-gs-cyan-400 uppercase tracking-widest mb-4">
            Our Impact
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-institutional">
            Powering a more resilient grid.
          </h2>
          <p className="text-gs-text-secondary leading-relaxed">
            GridSense continuously analyzes national grid infrastructure to detect
            emerging risks and recommend intervention before failure occurs.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <StatCard key={i} {...stat} enabled={inView} delay={i * 120} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  value,
  suffix,
  label,
  enabled,
  delay,
}: {
  value: number;
  suffix: string;
  label: string;
  enabled: boolean;
  delay: number;
}) {
  const count = useCountUp(value, 1800, enabled);
  return (
    <div
      className="bg-gs-bg-panel border border-gs-border rounded-lg p-6 hover:border-gs-cyan-500/50 hover:bg-gs-bg-elevated transition-all"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="text-4xl md:text-5xl font-bold text-gs-cyan-400 mb-2 tabular-nums">
        {count}
        <span className="text-white/70">{suffix}</span>
      </div>
      <div className="text-xs text-gs-text-secondary uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}