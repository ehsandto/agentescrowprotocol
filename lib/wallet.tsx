"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { createWriteClient, STUDIONET_CHAIN_ID } from "./genlayer";
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
    try {
      await wallet.switchChain(STUDIONET_CHAIN_ID);
    } catch {
      // Privy will prompt to add StudioNet if the wallet does not know it yet.
    }
    const provider = await wallet.getEthereumProvider();
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

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
