"use client";

import { useParams } from "next/navigation";
import { Button, GlassCard, ResultBadge, StatusBadge } from "@/components/ui";
import { AGREEMENT_STATUSES } from "@/lib/types";
import { useProtocol } from "@/lib/protocol";

export default function AgreementDetailPage() {
  const params = useParams<{ id: string }>();
  const protocol = useProtocol();
  const item = protocol.getAgreement(params.id);

  if (!item) return <p className="text-mist-300">Agreement not found.</p>;

  const idx = AGREEMENT_STATUSES.indexOf(item.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Agreement #{item.id}</p>
          <h1 className="mt-2 text-3xl font-semibold">{item.description}</h1>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={item.status} />
          <ResultBadge result={item.result} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {AGREEMENT_STATUSES.map((status, i) => (
          <span
            key={status}
            className={`rounded-full px-3 py-1 text-xs ${i <= idx ? "bg-accent/20 text-white" : "bg-white/5 text-mist-400"}`}
          >
            {status.replaceAll("_", " ")}
          </span>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-mist-400">Client</dt>
              <dd>{item.clientName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mist-400">Provider</dt>
              <dd>{item.providerName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mist-400">Payment</dt>
              <dd>{item.paymentLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mist-400">Deadline</dt>
              <dd>{item.deadline}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mist-400">Settled</dt>
              <dd>{item.settled ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm text-mist-400">Requirements</h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-mist-100">{item.requirements}</pre>
        </GlassCard>
      </div>

      <div className="flex flex-wrap gap-3">
        {item.status === "CREATED" && (
          <Button onClick={() => protocol.acceptAgreement(item.id)} disabled={Boolean(protocol.pending)}>
            Accept agreement
          </Button>
        )}
        {item.status === "ACCEPTED" && (
          <Button onClick={() => protocol.startWork(item.id)} disabled={Boolean(protocol.pending)}>
            Start work
          </Button>
        )}
        <Button href={`/agreements/${item.id}/evidence`} variant="secondary">
          Evidence
        </Button>
        <Button href={`/agreements/${item.id}/verify`} variant="secondary">
          Verification
        </Button>
        <Button href={`/agreements/${item.id}/settlement`} variant="secondary">
          Settlement
        </Button>
      </div>
      {protocol.error && <p className="text-sm text-rose-300">{protocol.error}</p>}
    </div>
  );
}
