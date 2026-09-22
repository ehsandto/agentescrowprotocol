import type { AgreementStatus, ConsensusResult } from "./types";

export function formatEth(wei: string | number | bigint, digits = 4) {
  const value = BigInt(wei || 0);
  const whole = value / 10n ** 18n;
  const frac = value % 10n ** 18n;
  const fracStr = frac.toString().padStart(18, "0").slice(0, digits);
  return `${whole.toString()}.${fracStr}`.replace(/\.?0+$/, (m) => (m.includes(".") ? "" : m)) || "0";
}

export function parseEthToWei(amount: string) {
  const cleaned = amount.trim().replace(/[^0-9.]/g, "");
  if (!cleaned) return 0n;
  const [whole, frac = ""] = cleaned.split(".");
  const fracPadded = (frac + "000000000000000000").slice(0, 18);
  return BigInt(whole || "0") * 10n ** 18n + BigInt(fracPadded || "0");
}

export function paymentLabel(wei: string) {
  return `${formatEth(wei)} ETH`;
}

export function statusLabel(status: AgreementStatus) {
  const labels: Record<AgreementStatus, string> = {
    CREATED: "Created",
    ACCEPTED: "Accepted",
    IN_PROGRESS: "In Progress",
    EVIDENCE_SUBMITTED: "Evidence Submitted",
    UNDER_REVIEW: "Under Review",
    COMPLETED: "Completed",
    DISPUTED: "Disputed",
  };
  return labels[status];
}

export function resultLabel(result: ConsensusResult) {
  if (result === "NONE") return "Pending";
  return result;
}

export function trustFromRate(successRate: number, completed: number) {
  if (completed === 0) return "D";
  if (successRate >= 97) return "A+";
  if (successRate >= 90) return "A";
  if (successRate >= 80) return "B";
  if (successRate >= 70) return "C";
  return "D";
}

export function explorerTx(hash: string) {
  const base = process.env.NEXT_PUBLIC_EXPLORER_URL || "https://explorer-studio-dev.genlayer.com";
  return `${base}/tx/${hash}`;
}
