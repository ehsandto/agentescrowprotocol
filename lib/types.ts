export const AGREEMENT_STATUSES = [
  "CREATED",
  "ACCEPTED",
  "IN_PROGRESS",
  "EVIDENCE_SUBMITTED",
  "UNDER_REVIEW",
  "COMPLETED",
  "DISPUTED",
] as const;

export type AgreementStatus = (typeof AGREEMENT_STATUSES)[number];
export type ConsensusResult = "NONE" | "SUCCESS" | "FAILED" | "INCONCLUSIVE";
export type AgentCategory = "Coding" | "Research" | "Security" | "Data" | "Marketing";

export type Agent = {
  wallet: string;
  name: string;
  slug: string;
  category: AgentCategory;
  capabilities: string[];
  listedPrice: string;
  completedJobs: number;
  successfulJobs: number;
  failedJobs: number;
  certificates: number;
  trustLevel: string;
  successRate: number;
  bio: string;
  jobs: JobRecord[];
};

export type JobRecord = {
  id: string;
  title: string;
  counterparty: string;
  result: ConsensusResult;
  payment: string;
  date: string;
};

export type Agreement = {
  id: string;
  client: string;
  provider: string;
  clientName: string;
  providerName: string;
  description: string;
  requirements: string;
  evidenceRequirements: string;
  paymentWei: string;
  lockedWei: string;
  paymentLabel: string;
  deadline: string;
  evidenceUrl: string;
  githubRepo: string;
  ipfsHash: string;
  executionLogs: string;
  evidenceHash: string;
  claim: string;
  status: AgreementStatus;
  result: ConsensusResult;
  verdict: Verdict | null;
  createdAt: string;
  settled: boolean;
  source: "chain" | "demo";
};

export type Verdict = {
  policy: string;
  agreementId: string;
  result: ConsensusResult;
  evidenceExists: boolean;
  matchesRequirements: boolean;
  taskCompleted: boolean;
  claimSupported: boolean;
  fetchOk: boolean;
  hashMatch: boolean;
  sourceCount: number;
  recordFingerprint: string;
  computedHash?: string;
};

export type TrustEdge = {
  from: string;
  to: string;
  fromWallet: string;
  toWallet: string;
  agreementId: string;
  result: ConsensusResult;
};

export type ProtocolStats = {
  totalAgreements: number;
  totalSettled: number;
  agentCount: number;
  edgeCount: number;
  policy: string;
  contractAddress: string;
  live: boolean;
};

export type OnchainProof = {
  id: string;
  agreementId: string;
  submitter: string;
  claim: string;
  evidenceHash: string;
  result: ConsensusResult | string;
  status: string;
  createdAt: string;
  fingerprint: string;
  txHash?: string;
};

export type ProtocolState = {
  agents: Agent[];
  agreements: Agreement[];
  edges: TrustEdge[];
  proofs: OnchainProof[];
  stats: ProtocolStats;
};
