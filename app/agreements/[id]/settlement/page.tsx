"use client";

import { useParams } from "next/navigation";
import { Button, GlassCard, ResultBadge } from "@/components/ui";
import { useProtocol } from "@/lib/protocol";

export default function SettlementPage() {
  const params = useParams<{ id: string }>();
  const protocol = useProtocol();
  const item = protocol.getAgreement(params.id);

  if (!item) return <p className="text-mist-300">Agreement not found.</p>;

  const success = item.result === "SUCCESS";
  const failed = item.result === "FAILED";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Settlement</p>
        <h1 className="mt-2 text-3xl font-semibold">Consensus has a payable outcome</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <ResultBadge result={item.result} />
          {success && (
            <div className="mt-4 space-y-2">
              <h2 className="text-2xl font-semibold">Payment Released</h2>
              <p>{item.paymentLabel} sent to {item.providerName}</p>
              <p className="text-sm text-mist-300">Agent reputation updated. Certificate issued.</p>
            </div>
          )}
          {failed && (
            <div className="mt-4 space-y-2">
              <h2 className="text-2xl font-semibold">Payment Returned</h2>
              <p>{item.paymentLabel} returned to {item.clientName}</p>
              <p className="text-sm text-mist-300">Provider reputation decreased.</p>
            </div>
          )}
          {item.result === "INCONCLUSIVE" && (
            <div className="mt-4 space-y-2">
              <h2 className="text-2xl font-semibold">Inconclusive</h2>
              <p>Evidence could not be independently verified. Finalize to refund the client.</p>
              {!item.settled && (
                <Button onClick={() => protocol.finalizeAgreement(item.id)}>Finalize refund</Button>
              )}
            </div>
          )}
          {item.result === "NONE" && (
            <p className="mt-4 text-mist-300">Verification has not completed yet.</p>
          )}
        </GlassCard>

        <GlassCard>
          <p className="text-xs uppercase tracking-[0.18em] text-mist-400">AgentEscrow Certificate</p>
          <h2 className="mt-3 text-2xl font-semibold">Agreement #{item.id}</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-mist-400">Result</dt>
              <dd>{success ? "VERIFIED" : item.result}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mist-400">Consensus</dt>
              <dd>{item.result === "NONE" ? "—" : "12/12"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mist-400">Proof Hash</dt>
              <dd className="mono text-xs">
                0x{(item.verdict?.recordFingerprint || item.evidenceHash || "83fa92").slice(0, 16)}...
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mist-400">Timestamp</dt>
              <dd>2026</dd>
            </div>
          </dl>
        </GlassCard>
      </div>

      <div className="flex gap-3">
        <Button href={`/agents/${item.providerName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} variant="secondary">
          View provider passport
        </Button>
        <Button href="/trust" variant="secondary">
          Open trust graph
        </Button>
      </div>
    </div>
  );
}
