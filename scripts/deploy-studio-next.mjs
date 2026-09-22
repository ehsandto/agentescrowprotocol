// Deploy AgentEscrowContract to GenLayer Studio Dev preview (chain 61997, "Studio Next").
// Usage: node scripts/deploy-studio-next.mjs [0xPRIVATE_KEY]
// If no key is given, a fresh deployer account is generated and funded via sim_fundAccount.
import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { readFileSync, writeFileSync } from "node:fs";

const RPC = "https://studio-dev.genlayer.com/api";

// Studio Next = studionet preset pointed at the 61997 dev-preview chain.
export const studioNext = {
  ...studionet,
  id: 61997,
  name: "GenLayer Studio Dev (Next)",
  rpcUrls: { default: { http: [RPC] } },
  blockExplorers: {
    default: {
      name: "GenLayer Explorer (Studio Dev)",
      url: "https://explorer-studio-dev.genlayer.com",
    },
  },
};

async function main() {
  const keyArg = process.argv[2];
  const privateKey = keyArg || generatePrivateKey();
  const account = createAccount(privateKey);
  console.log("Deployer:", account.address);
  if (!keyArg) console.log("PrivateKey:", privateKey);

  const client = createClient({ chain: studioNext, account, endpoint: RPC });

  try {
    const fundTx = await client.fundAccount({
      address: account.address,
      amount: 100000000000000000000n, // 100 GEN
    });
    console.log("Funded:", fundTx);
  } catch (e) {
    console.log("Funding skipped/failed (continuing):", e.shortMessage || e.message);
  }

  const code = readFileSync("contracts/AgentEscrowContract.py", "utf8");
  console.log("Deploying AgentEscrowContract (" + code.length + " bytes) to 61997...");
  const hash = await client.deployContract({ code, args: [] });
  console.log("Deploy tx:", hash);

  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: "ACCEPTED",
    retries: 120,
    interval: 5000,
  });

  const data = receipt?.data ?? receipt;
  console.log("Receipt status:", receipt?.statusName || receipt?.status);
  console.log("Contract address:", data?.contract_address || data?.contractAddress || JSON.stringify(data).slice(0, 2000));

  const out = {
    network: "studio-next",
    chainId: 61997,
    rpc: RPC,
    explorer: "https://explorer-studio-dev.genlayer.com",
    contract: "AgentEscrowContract",
    deployer: account.address,
    deployTx: hash,
    address: (data?.contract_address || data?.contractAddress || "").toString(),
    deployedAt: new Date().toISOString(),
  };
  writeFileSync("deployment.studio-next.json", JSON.stringify(out, null, 2));
  console.log("Wrote deployment.studio-next.json");
}

main().catch((e) => {
  console.error("DEPLOY FAILED:", e.shortMessage || e.message);
  if (e.details) console.error("Details:", e.details);
  process.exit(1);
});
