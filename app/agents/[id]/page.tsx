"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ReputationChart } from "@/components/reputation-chart";
import { Button, GlassCard, ResultBadge, TrustBadge } from "@/components/ui";
import { findAgent } from "@/lib/demo-data";
import { useProtocol } from "@/lib/protocol";
import { shortAddress } from "@/lib/utils";

export default function AgentProfilePage() {
  const params = useParams<{ id: string }>();
  const { agents, agreements } = useProtocol();
  const agent = findAgent(agents, params.id);

  if (!agent) {
    return <p className="text-mist-300">Agent not found.</p>;
  }

  const related = agreements.filter(
    (item) =>
      item.provider.toLowerCase() === agent.wallet.toLowerCase() ||
      item.client.toLowerCase() === agent.wallet.toLowerCase() ||
      item.providerName === agent.name ||
      item.clientName === agent.name,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Agent passport</p>
          <h1 className="mt-2 text-3xl font-semibold">{agent.name}</h1>
          <p className="mt-2 mono text-sm text-mist-400">{agent.wallet}</p>
        </div>
        <div className="flex gap-2">
          <TrustBadge level={agent.trustLevel} />
          <Button href={`/agreements/new?provider=${agent.slug}`}>Hire agent</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard>
          <h2 className="text-sm text-mist-400">Wallet</h2>
          <p className="mt-2 mono text-sm">{shortAddress(agent.wallet, 6)}</p>
          <h2 className="mt-5 text-sm text-mist-400">Capabilities</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {agent.capabilities.map((cap) => (
              <span key={cap} className="rounded-full bg-white/5 px-2.5 py-1 text-xs">
                {cap}
              </span>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-mist-400">Completed</dt>
              <dd className="mt-1 text-2xl font-semibold">{agent.completedJobs}</dd>
            </div>
            <div>
              <dt className="text-mist-400">Success Rate</dt>
              <dd className="mt-1 text-2xl font-semibold">{agent.successRate}%</dd>
            </div>
            <div>
              <dt className="text-mist-400">Trust Level</dt>
              <dd className="mt-1 text-2xl font-semibold">{agent.trustLevel}</dd>
            </div>
            <div>
              <dt className="text-mist-400">Certificates</dt>
              <dd className="mt-1 text-2xl font-semibold">{agent.certificates}</dd>
            </div>
          </dl>
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm text-mist-400">Reputation</h2>
          <ReputationChart successRate={agent.successRate} />
          <p className="mt-2 text-xs text-mist-400">Trust Score = Successful Agreements / Total Agreements</p>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-lg font-semibold">Previous jobs</h2>
        <div className="mt-4 divide-y divide-white/5">
          {(related.length ? related : agent.jobs).map((job) => {
            if ("description" in job) {
              return (
                <Link key={job.id} href={`/agreements/${job.id}`} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{job.description}</div>
                    <div className="text-sm text-mist-400">
                      {job.clientName} → {job.providerName}
                    </div>
                  </div>
                  <ResultBadge result={job.result} />
                </Link>
              );
            }
            return (
              <div key={job.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{job.title}</div>
                  <div className="text-sm text-mist-400">
                    {job.counterparty} · {job.payment}
                  </div>
                </div>
                <ResultBadge result={job.result} />
              </div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-semibold">Proof certificates</h2>
        <p className="mt-2 text-sm text-mist-300">
          {agent.certificates} AgentEscrow certificates issued from SUCCESS consensus.
        </p>
        <div className="mt-4">
          <Button href="/agreements/48291/settlement" variant="secondary">
            View certificate #48291
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
