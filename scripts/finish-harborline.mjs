import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";

const orivex = "C:/Users/ehsan/Documents/Codex/2026-09-17/first-of-all-connect-to-https/work/orivex-protocol/package.json";
const { createClient } = createRequire(orivex)("genlayer-js");
const { studionet } = createRequire(orivex)("genlayer-js/chains");

const RPC = "https://studio-dev.genlayer.com/api";
const address = "0x99f8Ccf4f9b2d84E8C966d266459332351774f90";
const deployTx = "0x6ca1e7fb17c9f43d35e583395b18d456530fdc6b6e12ca94a3b2fcdb6e3ff8f2";
const createTx = "0xd861029d299ffb85942128d0785c69e84b12646b0224afa6c7245db408c96004";
const chain = { ...studionet, id: 61997, rpcUrls: { default: { http: [RPC] } } };
const client = createClient({ chain, endpoint: RPC });

function executionOf(receipt) {
  const leaders = receipt.consensus_data?.leader_receipt ?? [];
  return leaders.at(-1)?.execution_result ?? leaders.at(-1)?.result?.status ?? "unknown";
}

const receipt = await client.waitForTransactionReceipt({
  hash: createTx,
  status: "ACCEPTED",
  interval: 4000,
  retries: 40,
});
const execution = executionOf(receipt);
console.log("create execution", execution, receipt.status_name ?? receipt.statusName);
if (execution !== "SUCCESS") throw new Error(`Agreement transaction did not succeed: ${execution}`);

const count = BigInt(await client.readContract({ address, functionName: "get_agreement_count", args: [] }));
const agreementId = String(await client.readContract({
  address,
  functionName: "get_agreement_id_at",
  args: [count - 1n],
}));
const raw = await client.readContract({ address, functionName: "get_agreement", args: [agreementId] });
const agreement = typeof raw === "string" ? JSON.parse(raw) : raw;
console.log("agreement", agreementId, agreement.status ?? agreement.Status);

const manifest = {
  network: "studio-dev",
  chainId: 61997,
  rpc: RPC,
  explorer: "https://explorer-studio-dev.genlayer.com",
  contract: address,
  wallet: "0x7a413BB4AB62E31d62d4cD9efC8C8a8Dae37FB42",
  deployTx,
  example: {
    id: agreementId,
    title: "Harborline payout-vault review",
    client: "Harborline Freight",
    provider: "SecurityAudit-Agent",
    providerWallet: "0x2222222222222222222222222222222222222222",
    problem: "Harborline's booking agent is ready to pay 0.05 ETH for an ownership-control review of a payout vault. The payment stays recorded until GenLayer validators read the pinned source themselves.",
    evidenceUrl: "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/c64a1edb67b6e3f4a15cca8909c9482ad33a02b0/contracts/access/Ownable.sol",
    createTx,
    status: agreement.status ?? agreement.Status ?? "CREATED",
    payment: "0.05 ETH",
  },
};
writeFileSync("public/harborline-example.json", JSON.stringify(manifest, null, 2) + "\n");
writeFileSync("deployment.studio-next.json", JSON.stringify({
  network: "studio-next",
  chainId: 61997,
  rpc: RPC,
  explorer: manifest.explorer,
  contract: "AgentEscrowContract",
  deployer: manifest.wallet,
  deployTx,
  address,
  exampleTx: createTx,
  agreementId,
  deployedAt: new Date().toISOString(),
}, null, 2) + "\n");
console.log(JSON.stringify({ address, agreementId, createTx, status: manifest.example.status }));
