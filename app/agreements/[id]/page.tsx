"use client";

import { useParams } from "next/navigation";
import { Button, GlassCard, ResultBadge, StatusBadge } from "@/components/ui";
import { explorerTx } from "@/lib/format";
import { AGREEMENT_STATUSES } from "@/lib/types";
import { useProtocol } from "@/lib/protocol";
import { useWallet } from "@/lib/wallet";
import { shortAddress } from "@/lib/utils";

function sameAddress(left?: string | null, right?: string | null) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

export default function AgreementDetailPage() {
  const params = useParams<{ id: string }>();
  const protocol = useProtocol();
  const wallet = useWallet();
  const item = protocol.getAgreement(params.id);

  if (!item) return <p className="text-mist-300">Agreement not found.</p>;

  const isProvider = sameAddress(wallet.address, item.provider);
  const isClient = sameAddress(wallet.address, item.client);

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
              <dd>
                {item.clientName}
                <span className="mt-1 block text-xs text-mist-400">{shortAddress(item.client, 6)}{isClient ? " · your wallet" : ""}</span>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mist-400">Provider</dt>
              <dd>
                {item.providerName}
                <span className="mt-1 block text-xs text-mist-400">{shortAddress(item.provider, 6)}{isProvider ? " · your wallet" : ""}</span>
              </dd>
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
            {protocol.lastTxHash && (
              <div className="flex justify-between gap-4">
                <dt className="text-mist-400">Transaction</dt>
                <dd className="break-all text-right">
                  <a className="text-accent" href={explorerTx(protocol.lastTxHash)} target="_blank" rel="noreferrer">
                    {protocol.lastTxHash}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm text-mist-400">Requirements</h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-mist-100">{item.requirements}</pre>
        </GlassCard>
      </div>

      {item.status === "CREATED" && isClient && (
        <p className="text-sm text-mist-300">
          Your wallet is the client, so it cannot accept this agreement. Connect {item.providerName}&apos;s wallet ({shortAddress(item.provider, 6)}) and accept from there.
        </p>
      )}
      {item.status === "CREATED" && !isClient && !isProvider && (
        <p className="text-sm text-mist-300">Connect {item.providerName}&apos;s wallet to accept this agreement.</p>
      )}
      <div className="flex flex-wrap gap-3">
        {item.status === "CREATED" && isProvider && (
          <Button onClick={() => protocol.acceptAgreement(item.id)} disabled={Boolean(protocol.pending)}>
            Accept agreement
          </Button>
        )}
        {item.status === "ACCEPTED" && isProvider && (
          <Button onClick={() => protocol.startWork(item.id)} disabled={Boolean(protocol.pending)}>
            Start work
          </Button>
        )}
        {item.status === "ACCEPTED" && !isProvider && (
          <p className="w-full text-sm text-mist-300">Only {item.providerName} can start the work.</p>
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
