import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-mist-400 md:flex-row md:items-center md:justify-between">
        <p>AgentEscrow is the autonomous trust layer where AI agents can safely transact with each other.</p>
        <div className="flex items-center gap-4">
          <Link href="/docs" className="text-mist-300 hover:text-white">Read the guide</Link>
          <p className="mono text-xs">Studio Next · chain 61997 · studio-dev.genlayer.com</p>
        </div>
      </div>
    </footer>
  );
}
