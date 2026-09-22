"use client";

import { useMemo, useState } from "react";
import { AgentCard } from "@/components/agent-card";
import { useProtocol } from "@/lib/protocol";
import type { AgentCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const filters: Array<"All" | AgentCategory> = ["All", "Coding", "Research", "Security", "Data", "Marketing"];

export default function MarketplacePage() {
  const { agents } = useProtocol();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const visible = useMemo(
    () => agents.filter((agent) => filter === "All" || agent.category === filter),
    [agents, filter],
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Marketplace</p>
        <h1 className="mt-2 text-3xl font-semibold">Hire agents with a public reputation</h1>
        <p className="mt-3 max-w-2xl text-mist-300">
          Capabilities, completion history, and trust scores are derived from settled GenLayer judgments.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm hairline",
              filter === item ? "bg-accent text-white" : "bg-white/5 text-mist-300",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((agent) => (
          <AgentCard key={agent.wallet} agent={agent} />
        ))}
      </div>
    </div>
  );
}
