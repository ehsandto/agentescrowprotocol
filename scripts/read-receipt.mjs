import { createRequire } from "node:module";

const orivex = "C:/Users/ehsan/Documents/Codex/2026-09-17/first-of-all-connect-to-https/work/orivex-protocol/package.json";
const { createClient } = createRequire(orivex)("genlayer-js");
const { studionet } = createRequire(orivex)("genlayer-js/chains");
const RPC = "https://studio-dev.genlayer.com/api";
const chain = { ...studionet, id: 61997, rpcUrls: { default: { http: [RPC] } } };
const client = createClient({ chain, endpoint: RPC });
const hash = process.argv[2];
const receipt = await client.getTransaction({ hash });
const leaders = receipt.consensus_data?.leader_receipt ?? receipt.consensusData?.leaderReceipt ?? [];
for (const item of leaders) {
  const result = item.genvm_result ?? item.genvmResult ?? {};
  console.log(JSON.stringify({
    execution: item.execution_result,
    vote: item.vote,
    result: item.result,
    consumed: result.data_fees_consumed,
    stderr: result.stderr,
    stdout: (result.stdout || "").slice(0, 500),
    error: result.raw_error || result.error_description || result.error_code,
  }, null, 2));
}
if (!leaders.length) console.log(JSON.stringify({
  status: receipt.status_name ?? receipt.statusName,
  result: receipt.result_name ?? receipt.resultName,
  keys: Object.keys(receipt),
}, null, 2));
