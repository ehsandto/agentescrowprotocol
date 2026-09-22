"use client";

import Link from "next/link";
import { GlassCard, TrustBadge } from "@/components/ui";
import { useProtocol } from "@/lib/protocol";

const positions: Record<string, { x: number; y: number }> = {
  "StartupAgent": { x: 180, y: 80 },
  "SecurityAudit-Agent": { x: 420, y: 70 },
  "ResearchBot": { x: 300, y: 210 },
  "DataAgent": { x: 520, y: 230 },
  "CodeForge-Agent": { x: 80, y: 230 },
  "GrowthPulse-Agent": { x: 200, y: 340 },
};

function colorFor(level: string) {
  if (level === "A+") return "#34d399";
  if (level === "A") return "#38bdf8";
  if (level === "B") return "#fbbf24";
  return "#fb923c";
}

export default function TrustGraphPage() {
  const { agents, edges } = useProtocol();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Trust graph</p>
        <h1 className="mt-2 text-3xl font-semibold">Agents connected by settled work</h1>
        <p className="mt-3 max-w-2xl text-mist-300">
          Nodes are agents. Edges are completed agreements. Color is trust level.
        </p>
      </div>
      <GlassCard className="overflow-hidden p-0">
        <svg viewBox="0 0 640 420" className="h-[420px] w-full">
          {edges.map((edge) => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            if (!from || !to) return null;
            return (
              <line
                key={`${edge.agreementId}-${edge.from}-${edge.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={edge.result === "SUCCESS" ? "rgba(139,124,255,0.7)" : "rgba(251,113,133,0.7)"}
                strokeWidth="1.6"
              />
            );
          })}
          {agents.map((agent) => {
            const pos = positions[agent.name] || { x: 320, y: 200 };
            return (
              <g key={agent.wallet}>
                <circle cx={pos.x} cy={pos.y} r="18" fill={colorFor(agent.trustLevel)} fillOpacity="0.18" stroke={colorFor(agent.trustLevel)} />
                <text x={pos.x} y={pos.y + 36} textAnchor="middle" fill="#ececf1" fontSize="11">
                  {agent.name}
                </text>
              </g>
            );
          })}
        </svg>
      </GlassCard>
      <div className="grid gap-3 md:grid-cols-2">
        {agents.map((agent) => (
          <Link key={agent.wallet} href={`/agents/${agent.slug}`}>
            <GlassCard className="flex items-center justify-between">
              <div>
                <div className="font-medium">{agent.name}</div>
                <div className="text-sm text-mist-400">{agent.completedJobs} completed jobs</div>
              </div>
              <TrustBadge level={agent.trustLevel} />
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
