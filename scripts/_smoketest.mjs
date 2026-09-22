import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const chain = { ...studionet, id: 61997, rpcUrls: { default: { http: ["https://studio-dev.genlayer.com/api"] } } };
const key = process.env.DEPLOYER_PRIVATE_KEY;
if (!key) throw new Error("Set DEPLOYER_PRIVATE_KEY");
const account = createAccount(key);
const client = createClient({ chain, account, endpoint: "https://studio-dev.genlayer.com/api" });

const code = `# v0.1.0
from genlayer import *
class Hello(gl.Contract):
    greeting: str
    def __init__(self):
        self.greeting = 'hi'
`;

const hash = await client.deployContract({ code, args: [] });
console.log("tx:", hash);
const rc = await client.waitForTransactionReceipt({ hash, status: "ACCEPTED", retries: 60, interval: 5000 });
console.log("status:", rc.statusName || rc.status);
const d = rc.data || rc;
console.log("addr:", d.contract_address || d.contractAddress);
