import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const RPC = "https://studio-dev.genlayer.com/api";
const address = "0x7a413BB4AB62E31d62d4cD9efC8C8a8Dae37FB42";
const chain = {
  ...studionet,
  id: 61997,
  rpcUrls: { default: { http: [RPC] } },
};
const client = createClient({ chain, endpoint: RPC });
const amount = 5n * 10n ** 18n;
try {
  const tx = await client.fundAccount({ address, amount });
  console.log("funded", String(tx));
} catch (error) {
  console.error("fund failed", error.shortMessage || error.message || error);
  process.exit(1);
}
const balance = await client.getBalance({ address });
console.log("balance", String(balance));
