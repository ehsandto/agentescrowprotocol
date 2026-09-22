"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, GlassCard, inputClass } from "@/components/ui";
import { demoFormDefaults } from "@/lib/demo-data";
import { useProtocol } from "@/lib/protocol";

export default function EvidencePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const protocol = useProtocol();
  const item = protocol.getAgreement(params.id);
  const [form, setForm] = useState({
    evidenceUrl: item?.evidenceUrl || demoFormDefaults.evidenceUrl,
    githubRepo: item?.githubRepo || demoFormDefaults.githubRepo,
    ipfsHash: item?.ipfsHash || demoFormDefaults.ipfsHash,
    executionLogs: item?.executionLogs || demoFormDefaults.executionLogs,
    claim: item?.claim || demoFormDefaults.claim,
  });
  const [hash, setHash] = useState(item?.evidenceHash || "");

  if (!item) return <p className="text-mist-300">Agreement not found.</p>;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!item) return;
    const nextHash = await protocol.submitEvidence(item.id, form);
    setHash(nextHash);
    router.push(`/agreements/${item.id}/verify`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Evidence submission</p>
        <h1 className="mt-2 text-3xl font-semibold">Submit independent proof</h1>
        <p className="mt-3 text-sm text-mist-300">
          Validators fetch these sources themselves. Execution logs are treated as untrusted claimant statements.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Field label="Evidence URL">
            <input
              className={inputClass}
              value={form.evidenceUrl}
              onChange={(e) => setForm({ ...form, evidenceUrl: e.target.value })}
            />
          </Field>
          <Field label="GitHub Repository">
            <input
              className={inputClass}
              value={form.githubRepo}
              onChange={(e) => setForm({ ...form, githubRepo: e.target.value })}
            />
          </Field>
          <Field label="IPFS Hash">
            <input
              className={inputClass}
              value={form.ipfsHash}
              onChange={(e) => setForm({ ...form, ipfsHash: e.target.value })}
            />
          </Field>
          <Field label="Execution Logs">
            <textarea
              className={inputClass}
              rows={4}
              value={form.executionLogs}
              onChange={(e) => setForm({ ...form, executionLogs: e.target.value })}
            />
          </Field>
          <Field label="Claim">
            <input
              className={inputClass}
              value={form.claim}
              onChange={(e) => setForm({ ...form, claim: e.target.value })}
            />
          </Field>
          <Button type="submit" disabled={protocol.pending === "evidence"}>
            {protocol.pending === "evidence" ? "Storing fingerprint…" : "Store evidence fingerprint"}
          </Button>
        </form>
      </GlassCard>
      <GlassCard>
        <h2 className="text-lg font-semibold">Evidence Hash</h2>
        <p className="mt-4 break-all mono text-sm text-accent">{hash ? `0x${hash}` : "0x pending"}</p>
        <p className="mt-4 text-sm text-mist-300">
          The hash is a SHA-256 fingerprint of the submitted sources. GenLayer validators recompute it from fetched content
          and will fail the job if the claimant fingerprint does not match.
        </p>
      </GlassCard>
    </div>
  );
}
