import { defineChain } from "viem";
import { STUDIO_NEXT_CHAIN_ID, STUDIO_NEXT_RPC, STUDIO_NEXT_EXPLORER } from "./genlayer";

export const genlayerStudio = defineChain({
  id: STUDIO_NEXT_CHAIN_ID,
  name: "GenLayer Studio Next",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls: {
    default: { http: [STUDIO_NEXT_RPC] },
  },
  blockExplorers: {
    default: {
      name: "GenLayer Explorer (Studio Dev)",
      url: process.env.NEXT_PUBLIC_EXPLORER_URL || STUDIO_NEXT_EXPLORER,
    },
  },
});

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmu4fza34003d0djug6wq6nsn";
