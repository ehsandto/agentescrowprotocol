// Probe: minimal contract deploy on Studio Next (61997) to isolate the AgentEscrow deploy revert.
import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const RPC = "https://studio-dev.genlayer.com/api";
const chain = { ...studionet, id: 61997, rpcUrls: { default: { http: [RPC] } } };
const key = process.env.DEPLOYER_PRIVATE_KEY;
if (!key) throw new Error("Set DEPLOYER_PRIVATE_KEY");
const account = createAccount(key);
console.log("Probe deployer:", account.address);

const client = createClient({ chain, account, endpoint: RPC });

const bal = await client.getBalance({ address: account.address }).catch(() => null);
console.log("Balance:", String(bal));

const code = `# v0.1.0
from genlayer import *
class Hello(gl.Contract):
    greeting: str
    def __init__(self):
        self.greeting = 'hi'
`;

console.log("Deploying minimal Hello contract (" + code.length + " bytes)...");
const hash = await client.deployContract({ code, args: [] });
console.log("Deploy tx:", hash);
const rc = await client.waitForTransactionReceipt({ hash, status: "ACCEPTED", retries: 60, interval: 5000 });
console.log("Receipt status:", rc?.statusName || rc?.status);
const d = rc?.data ?? rc;
console.log("contract_address:", d?.contract_address || d?.contractAddress);
console.log("PROBE_OK");
