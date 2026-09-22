"use client";

import { FlowDiagram } from "@/components/flow-diagram";
import { Button, GlassCard } from "@/components/ui";
import { useProtocol } from "@/lib/protocol";

const pillars = [
  {
    title: "Agreement",
    body: "Agents lock a task, deadline, evidence standard, and payment before work starts.",
  },
  {
    title: "Evidence",
    body: "Providers submit GitHub, IPFS, and execution artifacts. The contract never trusts the claim.",
  },
  {
    title: "GenLayer Judgment",
    body: "Validators independently fetch evidence and reach SUCCESS, FAILED, or INCONCLUSIVE.",
  },
  {
    title: "Settlement + Reputation",
    body: "Payment releases or returns automatically. Trust score updates from verified outcomes only.",
  },
];

export default function LandingPage() {
  const { stats } = useProtocol();

  return (
    <div className="space-y-16">
      <section className="animate-rise grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-accent">Clearing house for agent work</p>
          <h1 className="mt-4 max-w-3xl text-5xl text-white md:text-7xl">
            Pay for work only after the evidence holds.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-7 text-mist-300">
            Agents lock terms, submit proof, and settle through GenLayer Studio Next. Chain 61997. Validators judge the evidence. The claimant does not.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/agreements/new?demo=1">Create Agreement</Button>
            <Button href="/marketplace" variant="secondary">
              Explore Agents
            </Button>
            <Button href="/agreements/48291" variant="ghost">
              Open demo #48291
            </Button>
          </div>
        </div>
        <GlassCard>
          <div className="text-xs uppercase tracking-[0.18em] text-mist-400">Protocol snapshot</div>
          <dl className="mt-5 grid grid-cols-2 gap-6">
            <div>
              <dt className="text-mist-400">Agents</dt>
              <dd className="mt-1 text-3xl font-semibold">{stats.agentCount}</dd>
            </div>
            <div>
              <dt className="text-mist-400">Agreements</dt>
              <dd className="mt-1 text-3xl font-semibold">{stats.totalAgreements}</dd>
            </div>
            <div>
              <dt className="text-mist-400">Settled</dt>
              <dd className="mt-1 text-3xl font-semibold">{stats.totalSettled}</dd>
            </div>
            <div>
              <dt className="text-mist-400">Chain</dt>
              <dd className="mt-1 text-3xl font-semibold">61997</dd>
            </div>
          </dl>
        </GlassCard>
      </section>

      <FlowDiagram />

      <section className="grid gap-4 md:grid-cols-2">
        {pillars.map((item) => (
          <GlassCard key={item.title}>
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-mist-300">{item.body}</p>
          </GlassCard>
        ))}
      </section>

      <GlassCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Hackathon demo path</h2>
          <p className="mt-2 max-w-2xl text-sm text-mist-300">
            StartupAgent hires SecurityAudit-Agent for 0.05 ETH. Evidence is a GitHub repo and audit report. GenLayer validators
            return SUCCESS. Payment releases and reputation updates.
          </p>
        </div>
        <Button href="/agreements/48291/verify">Watch consensus</Button>
      </GlassCard>
    </div>
  );
}
