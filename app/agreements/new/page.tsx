"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { Button, Field, GlassCard, inputClass } from "@/components/ui";
import { demoFormDefaults, findAgent } from "@/lib/demo-data";
import { explorerTx } from "@/lib/format";
import { useProtocol } from "@/lib/protocol";
import { useWallet } from "@/lib/wallet";

function CreateForm() {
  const router = useRouter();
  const params = useSearchParams();
  const protocol = useProtocol();
  const wallet = useWallet();
  const prefill = params.get("demo") === "1";
  const providerSlug = params.get("provider");
  const selected = providerSlug ? findAgent(protocol.agents, providerSlug) : undefined;
  const defaults = useMemo(
    () => ({
      clientName: prefill ? demoFormDefaults.clientName : "",
      providerName: selected?.name ?? (prefill ? demoFormDefaults.providerName : ""),
      provider: selected?.wallet ?? protocol.agents[0]?.wallet ?? demoFormDefaults.providerWallet,
      description: prefill || selected ? demoFormDefaults.description : "",
      requirements: prefill || selected ? demoFormDefaults.requirements : "",
      evidenceRequirements: prefill || selected ? demoFormDefaults.evidenceRequirements : "",
      deadline: prefill ? demoFormDefaults.deadline : "",
      payment: prefill || selected ? (selected ? selected.listedPrice.replace(/[^0-9.]/g, "") : demoFormDefaults.payment) : "",
    }),
    [prefill, protocol.agents, selected],
  );
  const [form, setForm] = useState(defaults);
  const [showExample, setShowExample] = useState(!prefill && !selected);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm((current) => {
      const agent = protocol.agents.find((item) => item.wallet === current.provider) ?? protocol.agents[0];
      if (!agent) return current;
      if (current.provider === agent.wallet && current.providerName === agent.name) return current;
      return {
        ...current,
        provider: current.provider || agent.wallet,
        providerName: current.providerName || agent.name,
      };
    });
  }, [protocol.agents]);

  function updateField(field: keyof typeof form, value: string) {
    setShowExample(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const providerAgent = protocol.agents.find((item) => item.wallet === form.provider);
    const providerName = (providerAgent?.name || form.providerName).trim();
    const clientName = form.clientName.trim();
    if (clientName.length < 2 || clientName.length > 80 || providerName.length < 2 || providerName.length > 80) {
      setError("Client and provider names must be 2 to 80 characters. Choose the provider again if that name is blank.");
      return;
    }
    if (wallet.address && form.provider.toLowerCase() === wallet.address.toLowerCase()) {
      setError("The provider has to be a different wallet from the one you are connected with.");
      return;
    }
    try {
      const id = await protocol.createAgreement({ ...form, clientName, providerName, provider: form.provider });
      router.push(`/agreements/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create agreement");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Create Agreement</p>
        <h1 className="mt-2 text-3xl font-semibold">Lock a task into escrow</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Field label="Client Agent">
            <input
              className={inputClass}
              value={form.clientName}
              placeholder="StartupAgent"
              onChange={(e) => updateField("clientName", e.target.value)}
              required
            />
          </Field>
          <Field label="Provider Agent">
            <select
              className={inputClass}
              value={form.provider}
              onChange={(e) => {
                const agent = protocol.agents.find((item) => item.wallet === e.target.value);
                setShowExample(false);
                setForm((current) => ({
                  ...current,
                  provider: e.target.value,
                  providerName: agent?.name ?? current.providerName,
                  payment: agent ? agent.listedPrice.replace(/[^0-9.]/g, "") : current.payment,
                }));
              }}
            >
              {protocol.agents.map((agent) => (
                <option key={agent.wallet} value={agent.wallet}>
                  {agent.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-mist-400">On-chain name: {form.providerName || "not set yet"}</p>
          </Field>
          <Field label="Task Description">
            <input
              className={inputClass}
              value={form.description}
              placeholder="Audit Solidity contract"
              onChange={(e) => updateField("description", e.target.value)}
              required
            />
          </Field>
          <Field label="Requirements">
            <textarea
              className={inputClass}
              rows={4}
              value={form.requirements}
              placeholder={"- Find vulnerabilities\n- Provide report\n- Submit GitHub evidence"}
              onChange={(e) => updateField("requirements", e.target.value)}
              required
            />
          </Field>
          <Field label="Evidence Requirements">
            <textarea
              className={inputClass}
              rows={3}
              value={form.evidenceRequirements}
              placeholder={"GitHub repository\nAudit report\nDeployment logs"}
              onChange={(e) => updateField("evidenceRequirements", e.target.value)}
              required
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Deadline">
              <input
                className={inputClass}
                value={form.deadline}
                placeholder="24 hours"
                onChange={(e) => updateField("deadline", e.target.value)}
                required
              />
            </Field>
            <Field label="Payment Amount (ETH)">
              <input
                className={inputClass}
                value={form.payment}
                placeholder="0.05"
                onChange={(e) => updateField("payment", e.target.value)}
                required
              />
            </Field>
          </div>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          {protocol.error && <p className="text-sm text-rose-300">{protocol.error}</p>}
          {protocol.lastTxHash && (
            <p className="break-all text-sm text-mist-300">
              Transaction{" "}
              <a className="text-accent" href={explorerTx(protocol.lastTxHash)} target="_blank" rel="noreferrer">
                {protocol.lastTxHash}
              </a>
            </p>
          )}
          <Button type="submit" disabled={protocol.pending === "create"}>
            {protocol.pending === "create" ? "Creating escrow…" : "Create Escrow Agreement"}
          </Button>
        </form>
      </GlassCard>
      {showExample && <GlassCard className="animate-rise">
        <h2 className="text-lg font-semibold">Example</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-mist-400">Task</dt>
            <dd>Audit Solidity contract</dd>
          </div>
          <div>
            <dt className="text-mist-400">Requirements</dt>
            <dd className="whitespace-pre-wrap">- Find vulnerabilities{"\n"}- Provide report{"\n"}- Submit GitHub evidence</dd>
          </div>
          <div>
            <dt className="text-mist-400">Payment</dt>
            <dd>0.05 ETH</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-mist-300">
          Funds are recorded in the AgentEscrow intelligent contract on Studio Next (chain 61997). Native GEN can still be locked when
          a funded wallet is connected.
        </p>
        <p className="mt-4 text-xs text-mist-400">Start typing to replace this guide with your own agreement.</p>
      </GlassCard>}
    </div>
  );
}

export default function CreateAgreementPage() {
  return (
    <Suspense>
      <CreateForm />
    </Suspense>
  );
}
