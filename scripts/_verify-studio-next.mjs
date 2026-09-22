// One-off verification: confirm AgentEscrowContract deployment on Studio Next (61997).
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const RPC = "https://studio-dev.genlayer.com/api";
const ADDRESS = "0xdc1dC2a80eebc03f4040646d20FD6e854458149D";
const DEPLOY_TX = "0xd70cb4d7a83261ba04e6de32e133ccc912955e364a3fb0618ecc9776b4a5f1cf";

const chain = { ...studionet, id: 61997, rpcUrls: { default: { http: [RPC] } } };
const client = createClient({ chain, endpoint: RPC });

const bigify = (k, v) => (typeof v === "bigint" ? v.toString() : v);

// 1) Raw receipt (shows current on-chain state of the deploy tx)
console.log("[1] eth_getTransactionReceipt", DEPLOY_TX);
const raw = await fetch(RPC, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getTransactionReceipt", params: [DEPLOY_TX] }),
});
const rawJson = await raw.json();
console.log(JSON.stringify(rawJson, bigify, 2));

// 2) Confirm FINALIZED status via genlayer-js
console.log("\n[2] waitForTransactionReceipt(FINALIZED)");
const receipt = await client.waitForTransactionReceipt({ hash: DEPLOY_TX, status: "FINALIZED", retries: 3, interval: 3000 });
const d = receipt?.data ?? receipt;
console.log("status:", receipt?.statusName || receipt?.status);
console.log("contract_address:", d?.contract_address || d?.contractAddress);

// 3) Read calls against the contract on 61997
console.log("\n[3] readContract get_protocol_stats @", ADDRESS);
const stats = await client.readContract({ address: ADDRESS, functionName: "get_protocol_stats", args: [] });
console.log(JSON.stringify(stats, bigify, 2));

console.log("\n[4] readContract get_agreement_count");
const count = await client.readContract({ address: ADDRESS, functionName: "get_agreement_count", args: [] });
console.log("agreement_count:", String(count));

console.log("\nVERIFY_OK");
