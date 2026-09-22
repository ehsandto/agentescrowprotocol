// Old SDK (1.1.8) read test against the NEW Hello contract on 61997.
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const HELLO = "0x5A593f0A8B3B14Ba3f16F739C020F1EFc67a11E0";
const chain = { ...studionet, id: 61997, rpcUrls: { default: { http: ["https://studio-dev.genlayer.com/api"] } } };
const client = createClient({ chain, endpoint: "https://studio-dev.genlayer.com/api" });

try {
  const g = await client.readContract({ address: HELLO, functionName: "greeting", args: [] });
  console.log("OLD SDK read greeting:", g);
  console.log("OLD_SDK_READ_OK");
} catch (e) {
  console.log("OLD SDK read failed:", e.shortMessage || e.message);
}
