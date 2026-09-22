import { spawn } from "node:child_process";

const cli = process.env.GENLAYER_CLI || "C:\\Users\\ehsan\\Documents\\Codex\\2026-09-17\\first-of-all-connect-to-https\\work\\orivex-protocol\\node_modules\\genlayer\\dist\\index.js";
const fees = JSON.stringify({
  distribution: {
    leaderTimeunitsAllocation: "400",
    validatorTimeunitsAllocation: "600",
    rotations: ["3"],
  },
});
const args = [cli, ...process.argv.slice(2)];
if (args.includes("--fees") === false && (args[1] === "deploy" || args[1] === "write")) {
  args.push("--fees", fees);
}
const child = spawn(process.execPath, args, { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 1));
