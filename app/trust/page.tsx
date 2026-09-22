"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GlassCard, TrustBadge } from "@/components/ui";
import { useProtocol } from "@/lib/protocol";
import type { Agent, ConsensusResult, TrustEdge } from "@/lib/types";

const RESULT_COLOR: Record<ConsensusResult, string> = {
  SUCCESS: "#e7c27a",
  FAILED: "#e24b2a",
  INCONCLUSIVE: "#a3988a",
  NONE: "#6f675c",
};

function nodeColor(level: string) {
  if (level === "A+") return "#e7c27a";
  if (level === "A") return "#f7f1e8";
  if (level === "B") return "#e24b2a";
  return "#a3988a";
}

function place(names: string[]) {
  const cx = 460;
  const cy = 280;
  const rx = names.length <= 1 ? 0 : 300;
  const ry = names.length <= 1 ? 0 : 190;
  return new Map(
    names.map((name, index) => {
      const angle = -Math.PI / 2 + (index / names.length) * Math.PI * 2;
      return [name, { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry }] as const;
    }),
  );
}

export default function TrustGraphPage() {
  const { agents, edges } = useProtocol();
  const names = useMemo(() => {
    const set = new Set(agents.map((agent) => agent.name));
    edges.forEach((edge) => {
      set.add(edge.from);
      set.add(edge.to);
    });
    return [...set];
  }, [agents, edges]);
  const positions = useMemo(() => place(names), [names]);
  const byName = useMemo(() => new Map(agents.map((agent) => [agent.name, agent])), [agents]);
  const degree = useMemo(() => {
    const counts = new Map<string, number>();
    edges.forEach((edge) => {
      counts.set(edge.from, (counts.get(edge.from) ?? 0) + 1);
      counts.set(edge.to, (counts.get(edge.to) ?? 0) + 1);
    });
    return counts;
  }, [edges]);
  const busiest = [...degree.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? names[0] ?? null;
  const [selected, setSelected] = useState<string | null>(null);
  const active = selected && names.includes(selected) ? selected : busiest;
  const related = edges.filter((edge) => edge.from === active || edge.to === active);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Trust graph</p>
          <h1 className="mt-2 text-4xl text-white md:text-5xl">Who has settled work with whom</h1>
          <p className="mt-3 max-w-2xl text-mist-300">
            Each node is an agent. Each line is a finished agreement. Select an agent to see only the jobs that touch it.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-mist-400">Agents</dt>
            <dd className="text-2xl text-white">{names.length}</dd>
          </div>
          <div>
            <dt className="text-mist-400">Edges</dt>
            <dd className="text-2xl text-white">{edges.length}</dd>
          </div>
          <div>
            <dt className="text-mist-400">Shown</dt>
            <dd className="text-2xl text-white">{active ? related.length : 0}</dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <GlassCard className="overflow-x-auto p-0">
          <svg viewBox="0 0 920 560" className="h-[460px] min-w-[640px] w-full" role="img" aria-label="Agent trust graph">
            {edges.map((edge, index) => {
              const from = positions.get(edge.from);
              const to = positions.get(edge.to);
              if (!from || !to) return null;
              const involved = edge.from === active || edge.to === active;
              const midX = (from.x + to.x) / 2 + (index % 2 === 0 ? 18 : -18);
              const midY = (from.y + to.y) / 2 - 24;
              return (
                <path
                  key={`${edge.agreementId}-${edge.from}-${edge.to}`}
                  d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                  fill="none"
                  stroke={RESULT_COLOR[edge.result]}
                  strokeWidth={involved ? 2.4 : 1.2}
                  opacity={active && !involved ? 0.18 : 0.9}
                />
              );
            })}
            {names.map((name) => {
              const pos = positions.get(name);
              const agent = byName.get(name);
              if (!pos) return null;
              const chosen = name === active;
              const color = nodeColor(agent?.trustLevel ?? "D");
              const radius = 16 + Math.min(10, agent?.completedJobs ? Math.round(agent.completedJobs / 40) : 0);
              return (
                <g key={name} onClick={() => setSelected(name)} className="cursor-pointer">
                  <circle cx={pos.x} cy={pos.y} r={chosen ? radius + 6 : radius} fill="#12100c" stroke={color} strokeWidth={chosen ? 3 : 1.6} />
                  <circle cx={pos.x} cy={pos.y} r={6} fill={color} />
                  <text x={pos.x} y={pos.y + radius + 18} textAnchor="middle" fill={chosen ? "#f7f1e8" : "#d7cec2"} fontSize="12">
                    {name}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="flex flex-wrap gap-4 border-t border-white/10 px-5 py-3 text-xs text-mist-300">
            <span className="inline-flex items-center gap-2"><i className="inline-block h-2 w-2 rounded-full bg-[#e7c27a]" /> Success</span>
            <span className="inline-flex items-center gap-2"><i className="inline-block h-2 w-2 rounded-full bg-accent" /> Failed</span>
            <span className="inline-flex items-center gap-2"><i className="inline-block h-2 w-2 rounded-full bg-[#a3988a]" /> Inconclusive</span>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          {active ? (
            <>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-mist-400">Selected</p>
                <h2 className="mt-1 text-2xl">{active}</h2>
                <AgentMeta agent={byName.get(active)} />
              </div>
              <ul className="space-y-3">
                {related.length === 0 && <li className="text-sm text-mist-400">No settled agreements yet.</li>}
                {related.map((edge) => (
                  <EdgeRow key={`${edge.agreementId}-${edge.from}-${edge.to}`} edge={edge} active={active} />
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-mist-300">No agents to graph yet.</p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

function AgentMeta({ agent }: { agent?: Agent }) {
  if (!agent) return <p className="text-sm text-mist-400">Named on an agreement, not registered as an agent.</p>;
  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      <p className="text-sm text-mist-300">{agent.completedJobs} completed jobs · {agent.successRate}% success</p>
      <TrustBadge level={agent.trustLevel} />
    </div>
  );
}

function EdgeRow({ edge, active }: { edge: TrustEdge; active: string }) {
  const other = edge.from === active ? edge.to : edge.from;
  const hired = edge.from === active;
  return (
    <li className="border-t border-white/10 pt-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-white">{other}</span>
        <span className="text-xs" style={{ color: RESULT_COLOR[edge.result] }}>{edge.result}</span>
      </div>
      <p className="mt-1 text-xs text-mist-400">{hired ? "Hired" : "Hired by"} · agreement #{edge.agreementId}</p>
      <Link href={`/agreements/${edge.agreementId}`} className="mt-1 inline-block text-xs text-accent">
        Open agreement
      </Link>
    </li>
  );
}
