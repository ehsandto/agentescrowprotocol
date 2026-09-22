import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AgreementStatus, ConsensusResult } from "@/lib/types";
import { statusLabel } from "@/lib/format";

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("glass rounded-2xl p-6", className)}>{children}</div>;
}

export function Button({
  href,
  children,
  variant = "primary",
  className,
  type,
  onClick,
  disabled,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const styles = {
    primary:
      "bg-accent text-white shadow-[0_10px_24px_rgba(226,75,42,0.28)] hover:bg-accent-dim",
    secondary:
      "bg-white/5 text-mist-100 hairline hover:bg-white/8",
    ghost: "text-mist-300 hover:text-white hover:bg-white/5",
  }[variant];
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-50",
    styles,
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function StatusBadge({ status }: { status: AgreementStatus }) {
  const tone: Record<AgreementStatus, string> = {
    CREATED: "bg-white/8 text-mist-300",
    ACCEPTED: "bg-sky-500/15 text-sky-300",
    IN_PROGRESS: "bg-indigo-500/15 text-indigo-300",
    EVIDENCE_SUBMITTED: "bg-violet-500/15 text-violet-300",
    UNDER_REVIEW: "bg-amber-500/15 text-amber-300",
    COMPLETED: "bg-emerald-500/15 text-emerald-300",
    DISPUTED: "bg-rose-500/15 text-rose-300",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide", tone[status])}>
      {statusLabel(status)}
    </span>
  );
}

export function ResultBadge({ result }: { result: ConsensusResult }) {
  const tone: Record<ConsensusResult, string> = {
    NONE: "bg-white/8 text-mist-300",
    SUCCESS: "bg-emerald-500/15 text-emerald-300",
    FAILED: "bg-rose-500/15 text-rose-300",
    INCONCLUSIVE: "bg-amber-500/15 text-amber-300",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide", tone[result])}>
      {result === "NONE" ? "Pending" : result}
    </span>
  );
}

export function TrustBadge({ level }: { level: string }) {
  const tone =
    level === "A+"
      ? "text-emerald-300 bg-emerald-500/12"
      : level === "A"
        ? "text-sky-300 bg-sky-500/12"
        : level === "B"
          ? "text-amber-300 bg-amber-500/12"
          : "text-orange-300 bg-orange-500/12";
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", tone)}>
      Trust {level}
    </span>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.16em] text-mist-400">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl bg-black/30 px-3 py-2.5 text-sm hairline text-mist-100 placeholder:text-mist-400/70";
