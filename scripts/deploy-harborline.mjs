import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";

const orivex = "C:/Users/ehsan/Documents/Codex/2026-09-17/first-of-all-connect-to-https/work/orivex-protocol/package.json";
const genlayerPkg = "C:/Users/ehsan/Documents/Codex/2026-09-17/first-of-all-connect-to-https/work/orivex-protocol/node_modules/genlayer/package.json";
const { createClient, createAccount } = createRequire(orivex)("genlayer-js");
const { studionet } = createRequire(orivex)("genlayer-js/chains");
const keytar = createRequire(genlayerPkg)("keytar");

const RPC = "https://studio-dev.genlayer.com/api";
const provider = "0x2222222222222222222222222222222222222222";
const chain = { ...studionet, id: 61997, name: "GenLayer Studio Next", rpcUrls: { default: { http: [RPC] } } };

const privateKey = await keytar.getPassword("genlayer-cli", "account:studio-proof-deployer");
if (!privateKey) throw new Error("Studio Next wallet is locked. Unlock studio-proof-deployer in the GenLayer CLI.");
const account = createAccount(privateKey);
const client = createClient({ chain, account, endpoint: RPC });

async function fees(leader, validator, budget) {
  const quote = await client.estimateTransactionFees({
    leaderTimeunitsAllocation: BigInt(leader),
    validatorTimeunitsAllocation: BigInt(validator),
    rotations: [0n],
    appealRounds: 0n,
    totalMessageFees: 0n,
    executionBudgetPerRound: BigInt(budget),
  });
  return { distribution: quote.distribution, feeValue: BigInt(quote.feeValue) };
}

async function finalized(hash) {
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: "ACCEPTED",
    interval: 5000,
    retries: 80,
  });
  const leaders = receipt.consensus_data?.leader_receipt ?? [];
  const execution = leaders.at(-1)?.execution_result;
  if (execution && execution !== "SUCCESS") {
    throw new Error(`Execution ${execution} on ${hash}`);
  }
  return receipt;
}

const deployFees = await fees(80, 80, "90000000000000000");
console.log("deploy fee", deployFees.feeValue.toString(), "from", account.address);
const codeText = readFileSync("contracts/AgentEscrowContract.py", "utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
if (!codeText.includes('# { "Depends": "py-genlayer:')) throw new Error("Runner header is missing");
const code = new Uint8Array(Buffer.from(codeText, "utf8"));
console.log("header", Buffer.from(code.slice(0, 80)).toString("utf8"));
const deployTx = await client.deployContract({ code, args: [], fees: deployFees });
console.log("deploy tx", deployTx);
const deployed = await finalized(deployTx);
const address = deployed.data?.contract_address ?? deployed.txDataDecoded?.contractAddress;
if (!address) throw new Error("Deploy receipt had no contract address");
console.log("contract", address);

const writeFees = await fees(40, 40, "4000000000000000");
const createTx = await client.writeContract({
  address,
  functionName: "create_agreement",
  args: [
    provider,
    "Harborline Freight",
    "SecurityAudit-Agent",
    "Harborline's booking agent must not release the 0.05 ETH milestone for the payout-vault review until an independent check confirms the pinned Ownable source.",
    "SUCCESS only if transferOwnership is restricted to the current owner and rejects the zero address. Anything else is FAILED.",
    "Pinned HTTPS source. Validators fetch it themselves. The auditor's claim is not evidence.",
    "2026-10-15",
    50000000000000000n,
  ],
  value: 0n,
  fees: writeFees,
});
console.log("create tx", createTx);
await finalized(createTx);
const count = await client.readContract({ address, functionName: "get_agreement_count", args: [] });
const agreementId = await client.readContract({
  address,
  functionName: "get_agreement_id_at",
  args: [BigInt(count) - 1n],
});
const rawAgreement = await client.readContract({ address, functionName: "get_agreement", args: [String(agreementId)] });
const agreement = typeof rawAgreement === "string" ? JSON.parse(rawAgreement) : rawAgreement;
const manifest = {
  network: "studio-dev",
  chainId: 61997,
  rpc: RPC,
  explorer: "https://explorer-studio-dev.genlayer.com",
  contract: address,
  deployer: account.address,
  deployTx,
  example: {
    id: String(agreementId),
    title: "Harborline payout-vault review",
    client: "Harborline Freight",
    provider: "SecurityAudit-Agent",
    providerWallet: provider,
    problem: "An autonomous booking agent is about to pay 0.05 ETH for an ownership-control review. The payment stays locked until GenLayer validators read the pinned source themselves.",
    evidenceUrl: "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/c64a1edb67b6e3f4a15cca8909c9482ad33a02b0/contracts/access/Ownable.sol",
    createTx,
    status: agreement.status,
    payment: "0.05 ETH",
  },
};
writeFileSync("deployment.studio-next.json", JSON.stringify({
  network: "studio-next",
  chainId: 61997,
  rpc: RPC,
  explorer: manifest.explorer,
  contract: "AgentEscrowContract",
  deployer: account.address,
  deployTx,
  address,
  deployedAt: new Date().toISOString(),
}, null, 2) + "\n");
writeFileSync("public/harborline-example.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify({ address, deployTx, createTx, agreementId: String(agreementId), status: agreement.status }));
