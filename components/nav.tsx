"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { useWallet } from "@/lib/wallet";
import { useProtocol } from "@/lib/protocol";
import { cn } from "@/lib/utils";

const links = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/agreements", label: "Agreements" },
  { href: "/trust", label: "Trust Graph" },
  { href: "/docs", label: "Docs" },
];

export function Nav() {
  const path = usePathname();
  const wallet = useWallet();
  const protocol = useProtocol();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#12100c]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <div>
            <div className="font-serif text-lg leading-none tracking-tight">AgentEscrow</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-mist-400">Studio Next · 61997</div>
          </div>
        </Link>
        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto md:order-none md:w-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm text-mist-300 hover:bg-white/5 hover:text-white",
                path.startsWith(link.href) && "bg-white/10 text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-mist-300 md:inline">
            {protocol.liveConfigured && protocol.stats.live ? "Studio Next live" : "Demo mode"}
          </span>
          <Link
            href="/agreements/new"
            className="hidden rounded-full bg-accent px-3 py-2 text-sm font-medium text-white md:inline-flex"
          >
            Create Agreement
          </Link>
          <button
            onClick={() => (wallet.address ? wallet.disconnect() : wallet.connect())}
            disabled={wallet.connecting}
            title={wallet.error || undefined}
            className="rounded-xl bg-white/5 px-3 py-2 text-sm hairline"
          >
            {wallet.connecting
              ? "Connecting…"
              : wallet.address
                ? wallet.short
                : "Connect wallet"}
          </button>
        </div>
      </div>
    </header>
  );
}
