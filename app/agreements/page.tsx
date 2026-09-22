"use client";

import Link from "next/link";
import { Button, GlassCard, StatusBadge } from "@/components/ui";
import { useProtocol } from "@/lib/protocol";

export default function AgreementsPage() {
  const { agreements } = useProtocol();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold">Active agreements</h1>
        </div>
        <Button href="/agreements/new?demo=1">Create Agreement</Button>
      </div>
      <div className="grid gap-4">
        {agreements.map((item) => (
          <Link key={item.id} href={`/agreements/${item.id}`}>
            <GlassCard className="transition hover:border-white/12">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-mist-400">Agreement #{item.id}</div>
                  <h2 className="mt-1 text-lg font-semibold">{item.description}</h2>
                  <p className="mt-1 text-sm text-mist-300">
                    {item.clientName} → {item.providerName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <StatusBadge status={item.status} />
                  <span>{item.paymentLabel}</span>
                  <span className="text-mist-400">{item.deadline}</span>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
