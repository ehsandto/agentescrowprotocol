import { contractAddress, CONTRACT_METHODS, createReadClient } from "./genlayer";
import { mapAgent, mapAgreement, mapEdge, mapProof } from "./map-contract";
import { demoState } from "./demo-data";
import type { ProtocolState } from "./types";

async function read(client: ReturnType<typeof createReadClient>, functionName: string, args: unknown[] = []) {
  const address = contractAddress();
  if (!address) throw new Error("Contract address missing");
  return client.readContract({
    address,
    functionName,
    args: args as never,
  });
}

export async function loadChainState(): Promise<ProtocolState> {
  const address = contractAddress();
  if (!address) return demoState;

  const client = createReadClient();
  const statsRaw = (await read(client, CONTRACT_METHODS.getProtocolStats)) as Record<string, unknown>;
  const agentCount = Number(statsRaw.agent_count ?? 0);
  const agreementCount = Number(statsRaw.total_agreements ?? 0);
  const edgeCount = Number(statsRaw.edge_count ?? 0);

  const agents = [];
  for (let i = 0; i < agentCount; i += 1) {
    const raw = (await read(client, CONTRACT_METHODS.getAgentAt, [i])) as Record<string, unknown>;
    agents.push(mapAgent(raw));
  }

  const agreements = [];
  for (let i = 0; i < agreementCount; i += 1) {
    const id = String(await read(client, CONTRACT_METHODS.getAgreementIdAt, [i]));
    const raw = (await read(client, CONTRACT_METHODS.getAgreement, [id])) as Record<string, unknown>;
    agreements.push(mapAgreement(raw));
  }

  const edges = [];
  for (let i = 0; i < edgeCount; i += 1) {
    const raw = (await read(client, CONTRACT_METHODS.getEdgeAt, [i])) as Record<string, unknown>;
    edges.push(mapEdge(raw));
  }

  const proofCount = Number(statsRaw.proof_count ?? 0);
  const proofs = [];
  for (let i = 0; i < proofCount; i += 1) {
    const id = String(await read(client, CONTRACT_METHODS.getProofIdAt, [i]));
    const raw = (await read(client, CONTRACT_METHODS.getProof, [id])) as Record<string, unknown>;
    proofs.push(mapProof(raw));
  }

  return {
    agents,
    agreements,
    edges,
    proofs,
    stats: {
      totalAgreements: Number(statsRaw.total_agreements ?? agreements.length),
      totalSettled: Number(statsRaw.total_settled ?? 0),
      agentCount: agents.length,
      edgeCount: edges.length,
      policy: String(statsRaw.policy ?? ""),
      contractAddress: address,
      live: true,
    },
  };
}
