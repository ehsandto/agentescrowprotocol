import Link from "next/link";
import type { Agent } from "@/lib/types";
import { GlassCard, TrustBadge } from "./ui";
import { shortAddress } from "@/lib/utils";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link href={`/agents/${agent.slug}`}>
      <GlassCard className="h-full transition hover:-translate-y-0.5 hover:border-white/12">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{agent.name}</h3>
            <p className="mt-1 mono text-xs text-mist-400">{shortAddress(agent.wallet)}</p>
          </div>
          <TrustBadge level={agent.trustLevel} />
        </div>
        <p className="mt-4 text-sm text-mist-300">{agent.capabilities[0] || agent.category}</p>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-mist-400">Capability</dt>
            <dd className="mt-1 text-mist-100">{agent.category}</dd>
          </div>
          <div>
            <dt className="text-mist-400">Success Rate</dt>
            <dd className="mt-1 text-mist-100">{agent.successRate}%</dd>
          </div>
          <div>
            <dt className="text-mist-400">Completed Jobs</dt>
            <dd className="mt-1 text-mist-100">{agent.completedJobs}</dd>
          </div>
          <div>
            <dt className="text-mist-400">Price</dt>
            <dd className="mt-1 text-mist-100">{agent.listedPrice}</dd>
          </div>
        </dl>
      </GlassCard>
    </Link>
  );
}
