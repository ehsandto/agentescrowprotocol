"use client";

import { useParams } from "next/navigation";
import { Button, GlassCard, ResultBadge, StatusBadge } from "@/components/ui";
import { explorerTx } from "@/lib/format";
import { useProtocol } from "@/lib/protocol";
import { useWallet } from "@/lib/wallet";

const checks = [
  ["Does submitted evidence exist?", "evidenceExists"],
  ["Does evidence match requirements?", "matchesRequirements"],
  ["Was the task completed?", "taskCompleted"],
  ["Is the claim supported?", "claimSupported"],
] as const;

export default function VerifyPage() {
  const params = useParams<{ id: string }>();
  const protocol = useProtocol();
  const wallet = useWallet();
  const item = protocol.getAgreement(params.id);

  if (!item) return <p className="text-mist-300">Agreement not found.</p>;
  const agreementId = item.id;

  const verdict = item.verdict;
  const decided = item.result !== "NONE";
  const latestProof = protocol.proofs
    .filter((proof) => proof.agreementId === item.id)
    .slice(-1)[0];

  async function onVerify() {
    if (!wallet.address) {
      const connected = await wallet.connect();
      if (!connected) return;
    }
    await protocol.requestVerification(agreementId);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">GenLayer verification</p>
          <h1 className="mt-2 text-3xl font-semibold">Independent validator judgment</h1>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={item.status} />
          <ResultBadge result={item.result} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h2 className="text-sm text-mist-400">Verification Request</h2>
          <p className="mt-3 text-lg">Claim: “{item.claim || "Security audit completed successfully"}”</p>
          <div className="mt-5 space-y-2 text-sm text-mist-300">
            <p>GitHub repository: {item.githubRepo || "—"}</p>
            <p>Audit report: {item.evidenceUrl || "—"}</p>
            <p>Deployment logs: {item.executionLogs ? "submitted (untrusted)" : "—"}</p>
            <p>IPFS: {item.ipfsHash || "—"}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => void onVerify()}
              disabled={protocol.pending === "verify" || wallet.connecting}
            >
              {protocol.pending === "verify"
                ? "Anchoring on-chain proof…"
                : wallet.address
                  ? "Request verification"
                  : "Connect wallet and request verification"}
            </Button>
          </div>
          {(protocol.error || wallet.error) && (
            <p className="mt-3 text-sm text-rose-300">{protocol.error || wallet.error}</p>
          )}
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm text-mist-400">Validators</h2>
          <p className="mt-3 text-4xl font-semibold">{decided ? "12/12" : "0/12"}</p>
          <p className="mt-2 text-sm text-mist-300">Consensus: {decided ? item.result : "PENDING"}</p>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-lg font-semibold">On-chain proof</h2>
        <p className="mt-2 text-sm text-mist-300">
          Request verification writes a proof fingerprint to the AgentEscrow intelligent contract on Studio Next, chain 61997.
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-mist-400">Proof ID</dt>
            <dd>{latestProof?.id || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mist-400">Fingerprint</dt>
            <dd className="mono text-xs break-all">
              {latestProof?.fingerprint ? `0x${latestProof.fingerprint}` : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mist-400">Submitter</dt>
            <dd className="mono text-xs">{latestProof?.submitter || wallet.short || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mist-400">Transaction</dt>
            <dd className="mono text-xs">
              {protocol.lastTxHash ? (
                <a className="text-accent" href={explorerTx(protocol.lastTxHash)} target="_blank" rel="noreferrer">
                  {protocol.lastTxHash.slice(0, 10)}…{protocol.lastTxHash.slice(-6)}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-semibold">Validator checks</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {checks.map(([label, key]) => (
            <div key={key} className="rounded-xl bg-white/5 px-4 py-3 text-sm">
              <div className="text-mist-400">{label}</div>
              <div className="mt-1">{verdict ? (verdict[key] ? "Yes" : "No") : "Awaiting consensus"}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          {["SUCCESS", "FAILED", "INCONCLUSIVE"].map((outcome) => (
            <span
              key={outcome}
              className={`rounded-full px-3 py-1 ${item.result === outcome ? "bg-accent text-white" : "bg-white/5 text-mist-400"}`}
            >
              {outcome}
            </span>
          ))}
        </div>
        {verdict?.recordFingerprint && (
          <p className="mt-4 mono text-xs text-mist-400">Consensus hash 0x{verdict.recordFingerprint}</p>
        )}
      </GlassCard>

      {decided && (
        <Button href={`/agreements/${item.id}/settlement`}>Continue to settlement</Button>
      )}
    </div>
  );
}
