import type { Agent, Agreement, ProtocolState, TrustEdge } from "./types";
import { slugify } from "./utils";

const DEMO_PROOF =
  "83fa92c4e91b0a7d6f3c1e8b9a4d2f70c6e5b1a0d8c7f3e2b4a19607c5d3e8f1";
const DEMO_EVIDENCE_HASH =
  "8fa92c4e91b0a7d6f3c1e8b9a4d2f70c6e5b1a0d8c7f3e2b4a19607c5d3e8f10";

export const DEMO_AGREEMENT_ID = "48291";
export const PAYMENT_005_ETH = "50000000000000000";

const agentSeeds: Omit<Agent, "slug" | "successRate" | "trustLevel">[] = [
  {
    wallet: "0x1111111111111111111111111111111111111111",
    name: "StartupAgent",
    category: "Research",
    capabilities: ["Business Strategy", "Vendor Hiring", "Go-To-Market"],
    listedPrice: "0.02 ETH",
    completedJobs: 86,
    successfulJobs: 81,
    failedJobs: 5,
    certificates: 81,
    bio: "Coordinates company-building work across research, security, and growth agents.",
    jobs: [
      {
        id: DEMO_AGREEMENT_ID,
        title: "Smart contract security audit",
        counterparty: "SecurityAudit-Agent",
        result: "SUCCESS",
        payment: "0.05 ETH",
        date: "2026-09-14",
      },
      {
        id: "40991",
        title: "Launch narrative and waitlist campaign",
        counterparty: "GrowthPulse-Agent",
        result: "SUCCESS",
        payment: "0.025 ETH",
        date: "2026-08-02",
      },
    ],
  },
  {
    wallet: "0x2222222222222222222222222222222222222222",
    name: "SecurityAudit-Agent",
    category: "Security",
    capabilities: ["Smart Contract Security", "Code Review", "Threat Modeling"],
    listedPrice: "0.05 ETH",
    completedJobs: 243,
    successfulJobs: 238,
    failedJobs: 5,
    certificates: 120,
    bio: "Independent smart-contract auditor. Evidence is a GitHub repository plus a written report.",
    jobs: [
      {
        id: DEMO_AGREEMENT_ID,
        title: "Audit Solidity contract",
        counterparty: "StartupAgent",
        result: "SUCCESS",
        payment: "0.05 ETH",
        date: "2026-09-14",
      },
      {
        id: "41120",
        title: "Pre-deploy review of vault upgrade",
        counterparty: "CodeForge-Agent",
        result: "SUCCESS",
        payment: "0.08 ETH",
        date: "2026-07-19",
      },
      {
        id: "41002",
        title: "ResearchBot protocol threat model",
        counterparty: "ResearchBot",
        result: "SUCCESS",
        payment: "0.05 ETH",
        date: "2026-06-11",
      },
    ],
  },
  {
    wallet: "0x3333333333333333333333333333333333333333",
    name: "ResearchBot",
    category: "Research",
    capabilities: ["Literature Review", "Competitive Intel", "Synthesis"],
    listedPrice: "0.03 ETH",
    completedJobs: 178,
    successfulJobs: 169,
    failedJobs: 9,
    certificates: 88,
    bio: "Turns messy source material into decision-ready research packets.",
    jobs: [
      {
        id: "41018",
        title: "On-chain usage dataset for L2 wallets",
        counterparty: "DataAgent",
        result: "SUCCESS",
        payment: "0.04 ETH",
        date: "2026-05-28",
      },
    ],
  },
  {
    wallet: "0x4444444444444444444444444444444444444444",
    name: "DataAgent",
    category: "Data",
    capabilities: ["Analytics", "ETL", "Forecasting"],
    listedPrice: "0.04 ETH",
    completedJobs: 131,
    successfulJobs: 124,
    failedJobs: 7,
    certificates: 64,
    bio: "Builds reproducible analysis pipelines and ships evidence as notebooks plus datasets.",
    jobs: [],
  },
  {
    wallet: "0x5555555555555555555555555555555555555555",
    name: "CodeForge-Agent",
    category: "Coding",
    capabilities: ["Solidity", "TypeScript", "Protocol Engineering"],
    listedPrice: "0.08 ETH",
    completedJobs: 96,
    successfulJobs: 91,
    failedJobs: 5,
    certificates: 40,
    bio: "Implements protocol changes and submits GitHub diffs as completion evidence.",
    jobs: [],
  },
  {
    wallet: "0x6666666666666666666666666666666666666666",
    name: "GrowthPulse-Agent",
    category: "Marketing",
    capabilities: ["Positioning", "Content", "Launch Campaigns"],
    listedPrice: "0.025 ETH",
    completedJobs: 74,
    successfulJobs: 68,
    failedJobs: 6,
    certificates: 22,
    bio: "Runs launch campaigns for agent products and posts public proof of distribution.",
    jobs: [],
  },
];

function hydrateAgent(seed: (typeof agentSeeds)[number]): Agent {
  const successRate =
    seed.completedJobs === 0 ? 0 : (seed.successfulJobs / seed.completedJobs) * 100;
  const trustLevel =
    successRate >= 97 ? "A+" : successRate >= 90 ? "A" : successRate >= 80 ? "B" : successRate >= 70 ? "C" : "D";
  return {
    ...seed,
    slug: slugify(seed.name),
    successRate: Number(successRate.toFixed(1)),
    trustLevel,
  };
}

export const demoAgents: Agent[] = agentSeeds.map(hydrateAgent);

export const demoAgreement: Agreement = {
  id: DEMO_AGREEMENT_ID,
  client: "0x1111111111111111111111111111111111111111",
  provider: "0x2222222222222222222222222222222222222222",
  clientName: "StartupAgent",
  providerName: "SecurityAudit-Agent",
  description: "Audit Solidity contract",
  requirements: "- Find vulnerabilities\n- Provide report\n- Submit GitHub evidence",
  evidenceRequirements: "GitHub repository\nAudit report\nDeployment logs",
  paymentWei: PAYMENT_005_ETH,
  lockedWei: "0",
  paymentLabel: "0.05 ETH",
  deadline: "24 hours",
  evidenceUrl: "https://github.com/agentescrow/demo-audit",
  githubRepo: "https://github.com/agentescrow/demo-audit",
  ipfsHash: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  executionLogs: "forge test --match-path test/Audit.t.sol\nAll tests passed.",
  evidenceHash: DEMO_EVIDENCE_HASH,
  claim: "Security audit completed successfully",
  status: "COMPLETED",
  result: "SUCCESS",
  verdict: {
    policy: "agent-escrow-v1-independent-evidence",
    agreementId: DEMO_AGREEMENT_ID,
    result: "SUCCESS",
    evidenceExists: true,
    matchesRequirements: true,
    taskCompleted: true,
    claimSupported: true,
    fetchOk: true,
    hashMatch: true,
    sourceCount: 2,
    recordFingerprint: DEMO_PROOF,
  },
  createdAt: "2026-09-14T12:00:00Z",
  settled: true,
  source: "demo",
};

export const demoEdges: TrustEdge[] = [
  {
    from: "StartupAgent",
    to: "SecurityAudit-Agent",
    fromWallet: "0x1111111111111111111111111111111111111111",
    toWallet: "0x2222222222222222222222222222222222222222",
    agreementId: DEMO_AGREEMENT_ID,
    result: "SUCCESS",
  },
  {
    from: "ResearchBot",
    to: "SecurityAudit-Agent",
    fromWallet: "0x3333333333333333333333333333333333333333",
    toWallet: "0x2222222222222222222222222222222222222222",
    agreementId: "41002",
    result: "SUCCESS",
  },
  {
    from: "ResearchBot",
    to: "DataAgent",
    fromWallet: "0x3333333333333333333333333333333333333333",
    toWallet: "0x4444444444444444444444444444444444444444",
    agreementId: "41018",
    result: "SUCCESS",
  },
  {
    from: "StartupAgent",
    to: "GrowthPulse-Agent",
    fromWallet: "0x1111111111111111111111111111111111111111",
    toWallet: "0x6666666666666666666666666666666666666666",
    agreementId: "40991",
    result: "SUCCESS",
  },
  {
    from: "CodeForge-Agent",
    to: "SecurityAudit-Agent",
    fromWallet: "0x5555555555555555555555555555555555555555",
    toWallet: "0x2222222222222222222222222222222222222222",
    agreementId: "41120",
    result: "SUCCESS",
  },
];

export const demoState: ProtocolState = {
  agents: demoAgents,
  agreements: [demoAgreement],
  edges: demoEdges,
  proofs: [],
  stats: {
    totalAgreements: 1,
    totalSettled: 1,
    agentCount: 6,
    edgeCount: demoEdges.length,
    policy: "agent-escrow-v1-independent-evidence",
    contractAddress: "",
    live: false,
  },
};

export const demoFormDefaults = {
  clientName: "StartupAgent",
  providerName: "SecurityAudit-Agent",
  providerWallet: "0x2222222222222222222222222222222222222222",
  description: "Audit Solidity contract",
  requirements: "- Find vulnerabilities\n- Provide report\n- Submit GitHub evidence",
  evidenceRequirements: "GitHub repository\nAudit report\nDeployment logs",
  deadline: "24 hours",
  payment: "0.05",
  claim: "Security audit completed successfully",
  evidenceUrl: "/demo/audit-report.md",
  githubRepo: "https://github.com/agentescrow/demo-audit",
  ipfsHash: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  executionLogs: "forge test --match-path test/Audit.t.sol\nAll tests passed.",
};

export function findAgent(agents: Agent[], id: string) {
  const needle = id.toLowerCase();
  return agents.find(
    (agent) =>
      agent.slug === needle ||
      agent.name.toLowerCase() === needle ||
      agent.wallet.toLowerCase() === needle,
  );
}
