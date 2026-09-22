import { NextResponse } from "next/server";
import { createHash } from "crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json();
  const canonical = JSON.stringify({
    evidenceUrl: String(payload.evidenceUrl ?? "").trim(),
    githubRepo: String(payload.githubRepo ?? "").trim(),
    ipfsHash: String(payload.ipfsHash ?? "").trim(),
    executionLogs: String(payload.executionLogs ?? "").trim(),
    claim: String(payload.claim ?? "").trim(),
  });
  const hash = createHash("sha256").update(canonical).digest("hex");
  return NextResponse.json({
    hash,
    ipfsCompatible: `sha256-${hash}`,
    canonical,
  });
}
