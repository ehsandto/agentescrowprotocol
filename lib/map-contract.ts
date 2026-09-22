import { slugify } from "./utils";
import { paymentLabel, trustFromRate } from "./format";
import type {
  Agent,
  AgentCategory,
  Agreement,
  AgreementStatus,
  ConsensusResult,
  TrustEdge,
  Verdict,
} from "./types";

function asString(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function asNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asBool(value: unknown) {
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
}

function splitCaps(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return asString(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

const CATEGORIES: AgentCategory[] = ["Coding", "Research", "Security", "Data", "Marketing"];

export function mapAgent(raw: Record<string, unknown>, jobs: Agent["jobs"] = []): Agent {
  const completed = asNumber(raw.completed_jobs);
  const successful = asNumber(raw.successful_jobs);
  const bps = asNumber(raw.success_rate_bps ?? raw.trust_score);
  const successRate = completed === 0 ? 0 : bps > 0 ? bps / 100 : (successful / completed) * 100;
  const categoryRaw = asString(raw.category, "Research") as AgentCategory;
  return {
    wallet: asString(raw.wallet),
    name: asString(raw.name),
    slug: slugify(asString(raw.name)),
    category: CATEGORIES.includes(categoryRaw) ? categoryRaw : "Research",
    capabilities: splitCaps(raw.capabilities),
    listedPrice: asString(raw.listed_price, "0.05 ETH"),
    completedJobs: completed,
    successfulJobs: successful,
    failedJobs: asNumber(raw.failed_jobs),
    certificates: asNumber(raw.certificates),
    trustLevel: asString(raw.trust_level) || trustFromRate(successRate, completed),
    successRate: Number(successRate.toFixed(1)),
    bio: `${asString(raw.name)} is a registered AgentEscrow worker.`,
    jobs,
  };
}

export function mapVerdict(raw: unknown, agreementId: string): Verdict | null {
  if (!raw) return null;
  let data: Record<string, unknown> = {};
  if (typeof raw === "string" && raw.length > 0) {
    try {
      data = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  } else if (typeof raw === "object") {
    data = raw as Record<string, unknown>;
  } else {
    return null;
  }
  const result = asString(data.result, "NONE") as ConsensusResult;
  return {
    policy: asString(data.policy),
    agreementId: asString(data.agreement_id, agreementId),
    result: result === "SUCCESS" || result === "FAILED" || result === "INCONCLUSIVE" ? result : "NONE",
    evidenceExists: asBool(data.evidence_exists),
    matchesRequirements: asBool(data.matches_requirements),
    taskCompleted: asBool(data.task_completed),
    claimSupported: asBool(data.claim_supported),
    fetchOk: asBool(data.fetch_ok),
    hashMatch: asBool(data.hash_match),
    sourceCount: asNumber(data.source_count),
    recordFingerprint: asString(data.record_fingerprint),
    computedHash: asString(data.computed_hash) || undefined,
  };
}

export function mapAgreement(raw: Record<string, unknown>): Agreement {
  const paymentWei = asString(raw.payment, "0");
  const status = asString(raw.status, "CREATED") as AgreementStatus;
  const result = asString(raw.result, "NONE") as ConsensusResult;
  return {
    id: asString(raw.id),
    client: asString(raw.client),
    provider: asString(raw.provider),
    clientName: asString(raw.client_name),
    providerName: asString(raw.provider_name),
    description: asString(raw.description),
    requirements: asString(raw.requirements),
    evidenceRequirements: asString(raw.evidence_requirements),
    paymentWei,
    lockedWei: asString(raw.locked, "0"),
    paymentLabel: paymentLabel(paymentWei),
    deadline: asString(raw.deadline),
    evidenceUrl: asString(raw.evidence_url),
    githubRepo: asString(raw.github_repo),
    ipfsHash: asString(raw.ipfs_hash),
    executionLogs: asString(raw.execution_logs),
    evidenceHash: asString(raw.evidence_hash),
    claim: asString(raw.claim),
    status,
    result,
    verdict: mapVerdict(raw.verdict_json, asString(raw.id)),
    createdAt: asString(raw.created_at),
    settled: asBool(raw.settled),
    source: "chain",
  };
}

export function mapProof(raw: Record<string, unknown>): import("./types").OnchainProof {
  return {
    id: asString(raw.id),
    agreementId: asString(raw.agreement_id),
    submitter: asString(raw.submitter),
    claim: asString(raw.claim),
    evidenceHash: asString(raw.evidence_hash),
    result: asString(raw.result),
    status: asString(raw.status),
    createdAt: asString(raw.created_at),
    fingerprint: asString(raw.fingerprint),
  };
}

export function mapEdge(raw: Record<string, unknown>): TrustEdge {
  return {
    from: asString(raw.from),
    to: asString(raw.to),
    fromWallet: asString(raw.from_wallet),
    toWallet: asString(raw.to_wallet),
    agreementId: asString(raw.agreement_id),
    result: asString(raw.result, "SUCCESS") as ConsensusResult,
  };
}
