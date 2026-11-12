import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Keypair } from "@solana/web3.js";

const suffix = (process.argv[2] || "fork").toLowerCase();
if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(suffix)) {
  throw new Error("Suffix must contain only Base58 characters.");
}
const out = resolve(".secrets/mint-keypair.json");
await mkdir(dirname(out), { recursive: true });

console.log(`Searching for a Solana mint address ending in "${suffix}"...`);
console.log("This can take a long time. Keep this terminal open.");
let attempts = 0;
const started = Date.now();

for (;;) {
  const kp = Keypair.generate();
  attempts++;
  if (kp.publicKey.toBase58().endsWith(suffix)) {
    await writeFile(out, JSON.stringify(Array.from(kp.secretKey)), { mode: 0o600 });
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    console.log("\nMATCH FOUND");
    console.log("Mint:", kp.publicKey.toBase58());
    console.log("Attempts:", attempts.toLocaleString());
    console.log("Elapsed seconds:", seconds);
    console.log("Secret key saved locally to .secrets/mint-keypair.json");
    console.log("Do not upload or share that file.");
    break;
  }
  if (attempts % 100000 === 0) {
    const rate = Math.round(attempts / ((Date.now() - started) / 1000));
    process.stdout.write(`\rAttempts: ${attempts.toLocaleString()} | ${rate.toLocaleString()} keys/sec`);
  }
}
