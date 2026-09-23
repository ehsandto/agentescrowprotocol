"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { demoAgents, demoAgreement, demoEdges, demoState } from "./demo-data";
import { evidenceFingerprint } from "./evidence";
import { parseEthToWei, paymentLabel } from "./format";
import { TransactionStatus } from "genlayer-js/types";
import { CONTRACT_METHODS, contractAddress, studioWriteFees } from "./genlayer";
import { sleep } from "./utils";
import { useWallet } from "./wallet";
import type {
  Agreement,
  AgreementStatus,
  ConsensusResult,
  ProtocolState,
  Verdict,
} from "./types";

const LOCAL_KEY = "agentescrow.local.agreements";

type CreateInput = {
  provider: string;
  clientName: string;
  providerName: string;
  description: string;
  requirements: string;
  evidenceRequirements: string;
  deadline: string;
  payment: string;
};

type EvidenceInput = {
  evidenceUrl: string;
  githubRepo: string;
  ipfsHash: string;
  executionLogs: string;
  claim: string;
};

type ProtocolContextValue = ProtocolState & {
  loading: boolean;
  pending: string | null;
  error: string | null;
  liveConfigured: boolean;
  lastTxHash: string | null;
  refresh: () => Promise<void>;
  getAgreement: (id: string) => Agreement | undefined;
  createAgreement: (input: CreateInput) => Promise<string>;
  acceptAgreement: (id: string) => Promise<void>;
  startWork: (id: string) => Promise<void>;
  submitEvidence: (id: string, input: EvidenceInput) => Promise<string>;
  requestVerification: (id: string) => Promise<ConsensusResult>;
  finalizeAgreement: (id: string) => Promise<void>;
};

const ProtocolContext = createContext<ProtocolContextValue | null>(null);

function readLocal(): Agreement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Agreement[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: Agreement[]) {
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

function mergeState(remote: ProtocolState, local: Agreement[]): ProtocolState {
  const byId = new Map<string, Agreement>();
  for (const item of remote.agreements) byId.set(item.id, item);
  for (const item of local) {
    const existing = byId.get(item.id);
    if (!existing || existing.source === "demo") byId.set(item.id, item);
  }
  if (!byId.has(demoAgreement.id)) byId.set(demoAgreement.id, demoAgreement);
  const agreements = Array.from(byId.values()).sort((a, b) => Number(b.id) - Number(a.id));
  return {
    ...remote,
    agents: remote.agents.length ? remote.agents : demoAgents,
    agreements,
    edges: remote.edges.length ? remote.edges : demoEdges,
    proofs: remote.proofs ?? [],
  };
}

export function ProtocolProvider({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const [remote, setRemote] = useState<ProtocolState>(demoState);
  const [local, setLocal] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const liveConfigured = Boolean(contractAddress());

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      const data = (await res.json()) as ProtocolState;
      setRemote(data);
    } catch {
      setRemote(demoState);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLocal(readLocal());
    void refresh();
  }, [refresh]);

  const state = useMemo(() => mergeState(remote, local), [remote, local]);

  const persistLocal = useCallback((next: Agreement[]) => {
    setLocal(next);
    writeLocal(next);
  }, []);

  const patchLocal = useCallback(
    (id: string, patch: Partial<Agreement>) => {
      const current = readLocal();
      const existing = current.find((item) => item.id === id);
      if (existing) {
        persistLocal(current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
        return;
      }
      const fromState = remote.agreements.find((item) => item.id === id) || (id === demoAgreement.id ? demoAgreement : null);
      if (fromState) {
        persistLocal([{ ...fromState, ...patch, source: "demo" }, ...current]);
      }
    },
    [persistLocal, remote.agreements],
  );

  const writeLive = useCallback(
    async (functionName: string, args: unknown[], value = 0n) => {
      let client = await wallet.getWriteClient();
      if (!client) {
        const connected = await wallet.connect();
        if (!connected) throw new Error("Connect a wallet to continue.");
        client = await wallet.getWriteClient();
      }
      if (!client) {
        throw new Error("Connect a wallet for live Studio Next writes.");
      }
      const address = contractAddress();
      if (!address) throw new Error("Contract is not configured.");
      const fees = await studioWriteFees(client);
      const hash = String(
        await client.writeContract({
          address,
          functionName,
          args: args as never,
          value,
          fees: fees as never,
        }),
      );
      setLastTxHash(hash);
      const receipt = await client.waitForTransactionReceipt({
        hash: hash as never,
        status: TransactionStatus.ACCEPTED,
        retries: 36,
        interval: 4000,
      });
      const leaders = (receipt as { consensus_data?: { leader_receipt?: Array<Record<string, unknown>> } }).consensus_data
        ?.leader_receipt;
      const last = leaders?.at(-1);
      const execution = String(last?.execution_result ?? "");
      const detail = String((last?.result as { payload?: string } | undefined)?.payload ?? "");
      if (execution && execution !== "SUCCESS") {
        throw new Error(`Transaction ${hash} failed (${execution}${detail ? `: ${detail}` : ""}).`);
      }
      await refresh();
      return hash;
    },
    [refresh, wallet],
  );

  const createAgreement = useCallback(
    async (input: CreateInput) => {
      setError(null);
      setPending("create");
      try {
        const paymentWei = parseEthToWei(input.payment).toString();
        if (liveConfigured) {
          const hash = await writeLive(CONTRACT_METHODS.createAgreement, [
            input.provider,
            input.clientName,
            input.providerName,
            input.description,
            input.requirements,
            input.evidenceRequirements,
            input.deadline,
            BigInt(paymentWei),
          ]);
          const latest = await fetch("/api/state", { cache: "no-store" }).then((r) => r.json());
          const created = (latest.agreements as Agreement[])
            .filter(
              (item) =>
                item.description === input.description &&
                item.client.toLowerCase() === (wallet.address || "").toLowerCase(),
            )
            .sort((a, b) => Number(b.id) - Number(a.id))[0];
          if (!created) {
            throw new Error(`Agreement submitted. Refresh in a moment if it is not listed yet. Transaction ${hash}`);
          }
          return created.id;
        }
        const id = String(49000 + readLocal().length + 1);
        const item: Agreement = {
          id,
          client: wallet.address || "0x1111111111111111111111111111111111111111",
          provider: input.provider,
          clientName: input.clientName,
          providerName: input.providerName,
          description: input.description,
          requirements: input.requirements,
          evidenceRequirements: input.evidenceRequirements,
          paymentWei,
          lockedWei: paymentWei,
          paymentLabel: paymentLabel(paymentWei),
          deadline: input.deadline,
          evidenceUrl: "",
          githubRepo: "",
          ipfsHash: "",
          executionLogs: "",
          evidenceHash: "",
          claim: "",
          status: "CREATED",
          result: "NONE",
          verdict: null,
          createdAt: new Date().toISOString(),
          settled: false,
          source: "demo",
        };
        persistLocal([item, ...readLocal()]);
        return id;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Create failed";
        setError(message);
        throw err;
      } finally {
        setPending(null);
      }
    },
    [liveConfigured, persistLocal, wallet.address, writeLive],
  );

  const runStatus = useCallback(
    async (id: string, status: AgreementStatus, method: string) => {
      setError(null);
      setPending(method);
      try {
        const item = state.agreements.find((row) => row.id === id);
        if (liveConfigured && wallet.address && item?.source === "chain") {
          const providerOnly = method === CONTRACT_METHODS.acceptAgreement || method === CONTRACT_METHODS.startWork;
          if (providerOnly && item.provider.toLowerCase() !== wallet.address.toLowerCase()) {
            throw new Error(
              `Only ${item.providerName} can do this. Your wallet created the agreement as the client, so it cannot accept or start the work.`,
            );
          }
          await writeLive(method, [id]);
          return;
        }
        patchLocal(id, { status });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        setError(message);
        throw err;
      } finally {
        setPending(null);
      }
    },
    [liveConfigured, patchLocal, state.agreements, wallet.address, writeLive],
  );

  const submitEvidence = useCallback(
    async (id: string, input: EvidenceInput) => {
      setError(null);
      setPending("evidence");
      try {
        const hash = await evidenceFingerprint(input);
        const item = state.agreements.find((row) => row.id === id);
        if (liveConfigured && wallet.address && item?.source === "chain") {
          if (item.provider.toLowerCase() !== wallet.address.toLowerCase()) {
            throw new Error(`Only ${item.providerName} can submit evidence. Connect that provider wallet.`);
          }
          await writeLive(CONTRACT_METHODS.submitEvidence, [
            id,
            input.evidenceUrl,
            input.githubRepo,
            input.ipfsHash,
            input.executionLogs,
            hash,
            input.claim,
          ]);
          return hash;
        }
        patchLocal(id, {
          ...input,
          evidenceHash: hash,
          status: "EVIDENCE_SUBMITTED",
        });
        return hash;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Evidence submit failed";
        setError(message);
        throw err;
      } finally {
        setPending(null);
      }
    },
    [liveConfigured, patchLocal, state.agreements, wallet.address, writeLive],
  );

  const requestVerification = useCallback(
    async (id: string) => {
      setError(null);
      setPending("verify");
      try {
        const item = state.agreements.find((row) => row.id === id) || demoAgreement;
        const claim = item.claim || "Security audit completed successfully";
        if (liveConfigured) {
          await writeLive(CONTRACT_METHODS.anchorProof, [id, claim]);
          if (item.status === "EVIDENCE_SUBMITTED" || item.status === "DISPUTED") {
            await writeLive(CONTRACT_METHODS.requestVerification, [id]);
          }
          const latest = await fetch("/api/state", { cache: "no-store" }).then((r) => r.json());
          const updated = (latest.agreements as Agreement[]).find((row: Agreement) => row.id === id);
          return (updated?.result ?? item.result ?? "SUCCESS") as ConsensusResult;
        }
        await sleep(1600);
        const fetchOk = Boolean(item.evidenceUrl || item.githubRepo || item.ipfsHash);
        const success =
          fetchOk &&
          item.claim.toLowerCase().includes("success") &&
          (item.id === demoAgreement.id || item.requirements.length > 8);
        const result: ConsensusResult = success ? "SUCCESS" : fetchOk ? "FAILED" : "INCONCLUSIVE";
        const verdict: Verdict = {
          policy: "agent-escrow-v1-independent-evidence",
          agreementId: id,
          result,
          evidenceExists: fetchOk,
          matchesRequirements: success,
          taskCompleted: success,
          claimSupported: success,
          fetchOk,
          hashMatch: true,
          sourceCount: [item.evidenceUrl, item.githubRepo, item.ipfsHash].filter(Boolean).length,
          recordFingerprint: item.evidenceHash || item.verdict?.recordFingerprint || "",
        };
        patchLocal(id, {
          status: result === "INCONCLUSIVE" ? "DISPUTED" : "COMPLETED",
          result,
          verdict,
          settled: result !== "INCONCLUSIVE",
        });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Verification failed";
        setError(message);
        throw err;
      } finally {
        setPending(null);
      }
    },
    [liveConfigured, patchLocal, state.agreements, writeLive],
  );

  const finalizeAgreement = useCallback(
    async (id: string) => {
      setError(null);
      setPending("finalize");
      try {
        const item = state.agreements.find((row) => row.id === id);
        if (liveConfigured && wallet.address && item?.source === "chain") {
          await writeLive(CONTRACT_METHODS.finalizeAgreement, [id]);
          return;
        }
        patchLocal(id, { settled: true, status: "COMPLETED", lockedWei: "0" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Settlement failed";
        setError(message);
        throw err;
      } finally {
        setPending(null);
      }
    },
    [liveConfigured, patchLocal, state.agreements, wallet.address, writeLive],
  );

  const value = useMemo<ProtocolContextValue>(
    () => ({
      ...state,
      loading,
      pending,
      error,
      liveConfigured,
      lastTxHash,
      refresh,
      getAgreement: (id: string) => state.agreements.find((item) => item.id === id),
      createAgreement,
      acceptAgreement: (id: string) => runStatus(id, "ACCEPTED", CONTRACT_METHODS.acceptAgreement),
      startWork: (id: string) => runStatus(id, "IN_PROGRESS", CONTRACT_METHODS.startWork),
      submitEvidence,
      requestVerification,
      finalizeAgreement,
    }),
    [
      state,
      loading,
      pending,
      error,
      liveConfigured,
      lastTxHash,
      refresh,
      createAgreement,
      runStatus,
      submitEvidence,
      requestVerification,
      finalizeAgreement,
    ],
  );

  return <ProtocolContext.Provider value={value}>{children}</ProtocolContext.Provider>;
}

export function useProtocol() {
  const ctx = useContext(ProtocolContext);
  if (!ctx) throw new Error("useProtocol must be used within ProtocolProvider");
  return ctx;
}
