import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

// Studio Next (GenLayer Studio Dev preview network) — chain 61997.
export const STUDIO_NEXT_CHAIN_ID = 61997;
export const STUDIO_NEXT_RPC =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio-dev.genlayer.com/api";
export const STUDIO_NEXT_EXPLORER = "https://explorer-studio-dev.genlayer.com";

// genlayer-js has no preset for 61997 yet; derive it from the studionet preset.
export const studioNext = {
  ...studionet,
  id: STUDIO_NEXT_CHAIN_ID,
  name: "GenLayer Studio Next",
  rpcUrls: { default: { http: [STUDIO_NEXT_RPC] } },
  blockExplorers: {
    default: { name: "GenLayer Explorer (Studio Dev)", url: STUDIO_NEXT_EXPLORER },
  },
};

// Back-compat aliases (app code previously imported STUDIONET_*).
export const STUDIONET_CHAIN_ID = STUDIO_NEXT_CHAIN_ID;
export const STUDIONET_RPC = STUDIO_NEXT_RPC;

const DEPLOYED_CONTRACT = "0x99f8Ccf4f9b2d84E8C966d266459332351774f90";

export function contractAddress() {
  const value = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || DEPLOYED_CONTRACT;
  return value.startsWith("0x") ? (value as `0x${string}`) : null;
}

export function createReadClient() {
  return createClient({
    chain: studioNext,
    endpoint: STUDIO_NEXT_RPC,
  });
}

export function createWriteClient(account: `0x${string}`, provider: unknown) {
  return createClient({
    chain: studioNext,
    account,
    provider,
  });
}

export const CONTRACT_METHODS = {
  createAgreement: "create_agreement",
  acceptAgreement: "accept_agreement",
  startWork: "start_work",
  submitEvidence: "submit_evidence",
  requestVerification: "request_verification",
  finalizeAgreement: "finalize_agreement",
  registerAgent: "register_agent",
  getAgreement: "get_agreement",
  getAgreementCount: "get_agreement_count",
  getAgreementIdAt: "get_agreement_id_at",
  getAgent: "get_agent",
  getAgentByName: "get_agent_by_name",
  getAgentCount: "get_agent_count",
  getAgentAt: "get_agent_at",
  getTrustScore: "get_trust_score",
  getCertificate: "get_certificate",
  getProtocolStats: "get_protocol_stats",
  getEdgeCount: "get_edge_count",
  getEdgeAt: "get_edge_at",
  anchorProof: "anchor_proof",
  getProof: "get_proof",
  getProofCount: "get_proof_count",
  getProofIdAt: "get_proof_id_at",
  getLatestProof: "get_latest_proof",
} as const;
