"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { genlayerStudio, PRIVY_APP_ID } from "@/lib/chains";
import { ProtocolProvider } from "@/lib/protocol";
import { WalletProvider } from "@/lib/wallet";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["wallet", "email", "google"],
        appearance: {
          theme: "dark",
          accentColor: "#8b7cff",
          walletChainType: "ethereum-only",
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
        defaultChain: genlayerStudio,
        supportedChains: [genlayerStudio],
      }}
    >
      <WalletProvider>
        <ProtocolProvider>{children}</ProtocolProvider>
      </WalletProvider>
    </PrivyProvider>
  );
}
