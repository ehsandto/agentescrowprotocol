"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import {
  createWriteClient,
  STUDIO_NEXT_CHAIN_ID,
  STUDIO_NEXT_EXPLORER,
  STUDIO_NEXT_RPC,
} from "./genlayer";
import { shortAddress } from "./utils";

type WalletContextValue = {
  address: string | null;
  short: string;
  connecting: boolean;
  ready: boolean;
  authenticated: boolean;
  error: string | null;
  hasProvider: boolean;
  connect: () => Promise<string | null>;
  disconnect: () => void;
  getWriteClient: () => Promise<ReturnType<typeof createWriteClient> | null>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeWallet = wallets[0] ?? null;
  const address = activeWallet?.address ?? null;
  const walletsRef = useRef(wallets);
  walletsRef.current = wallets;

  const connect = useCallback(async () => {
    setError(null);
    setConnecting(true);
    try {
      if (!authenticated) {
        await login();
      }

      // Privy resolves login before useWallets() has necessarily re-rendered.
      // Wait briefly so callers can safely start a write in the same action.
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const wallet = walletsRef.current[0];
        if (wallet?.address) return wallet.address;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      throw new Error("Wallet provider connected, but no wallet was returned.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wallet connection failed";
      setError(message);
      return null;
    } finally {
      setConnecting(false);
    }
  }, [authenticated, login]);

  const disconnect = useCallback(() => {
    void logout();
  }, [logout]);

  const getWrite = useCallback(async () => {
    const wallet = walletsRef.current[0];
    if (!wallet) return null;
    const provider = await wallet.getEthereumProvider();
    await ensureStudioNext(wallet, provider);
    return createWriteClient(wallet.address as `0x${string}`, provider);
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      short: address ? shortAddress(address) : "",
      connecting: connecting || !ready,
      ready,
      authenticated,
      error,
      hasProvider: ready,
      connect,
      disconnect,
      getWriteClient: getWrite,
    }),
    [address, connecting, ready, authenticated, error, connect, disconnect, getWrite],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function readChainId(value: unknown) {
  const text = String(value ?? "");
  return Number.parseInt(text, text.startsWith("0x") ? 16 : 10);
}

async function ensureStudioNext(
  wallet: { switchChain: (chainId: number) => Promise<void> },
  provider: EthereumProvider,
) {
  const current = readChainId(await provider.request({ method: "eth_chainId" }));
  if (current === STUDIO_NEXT_CHAIN_ID) return;
  try {
    await wallet.switchChain(STUDIO_NEXT_CHAIN_ID);
  } catch {
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${STUDIO_NEXT_CHAIN_ID.toString(16)}`,
          chainName: "GenLayer Studio Next",
          nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
          rpcUrls: [STUDIO_NEXT_RPC],
          blockExplorerUrls: [STUDIO_NEXT_EXPLORER],
        },
      ],
    });
  }
  const after = readChainId(await provider.request({ method: "eth_chainId" }));
  if (after !== STUDIO_NEXT_CHAIN_ID) {
    throw new Error(`Switch the wallet to GenLayer Studio Next, chain ${STUDIO_NEXT_CHAIN_ID}, then create the agreement again.`);
  }
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
