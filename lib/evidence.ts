export async function sha256Hex(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function fingerprintPayload(input: {
  evidenceUrl: string;
  githubRepo: string;
  ipfsHash: string;
  executionLogs: string;
  claim: string;
}) {
  return JSON.stringify({
    evidenceUrl: input.evidenceUrl.trim(),
    githubRepo: input.githubRepo.trim(),
    ipfsHash: input.ipfsHash.trim(),
    executionLogs: input.executionLogs.trim(),
    claim: input.claim.trim(),
  });
}

export async function evidenceFingerprint(input: {
  evidenceUrl: string;
  githubRepo: string;
  ipfsHash: string;
  executionLogs: string;
  claim: string;
}) {
  return sha256Hex(fingerprintPayload(input));
}
