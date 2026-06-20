// Seed OSSure with REAL Bradbury transactions for 5 real GitHub dependencies.
//   cd deploy && node seed.mjs
// Uses ACCOUNT_PRIVATE_KEY + CONTRACT_ADDRESS from the root .env.
// Budget-conscious: 1 GEN stake per pool (5 GEN total), 0.5 GEN coverage, 0.1 GEN premium.
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";
import { createClient, createAccount } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: resolve(root, ".env") });

const pk = process.env.ACCOUNT_PRIVATE_KEY;
const CONTRACT = process.env.CONTRACT_ADDRESS;
if (!pk || !CONTRACT) {
  console.error("Need ACCOUNT_PRIVATE_KEY and CONTRACT_ADDRESS in .env");
  process.exit(1);
}

const GEN = 10n ** 18n;
const STAKE = 1n * GEN;            // 1 GEN per pool  -> 5 GEN total
const COVERAGE = GEN / 2n;         // 0.5 GEN coverage
const PREMIUM = GEN / 10n;         // 0.1 GEN premium
const DURATION = 90n;              // days

const REPOS = [
  "facebook/react",     // healthy
  "expressjs/express",  // healthy
  "moment/moment",      // abandoned (will be claimed -> payout)
  "request/request",    // abandoned
  "bower/bower",        // abandoned
];
const CLAIM_REPO = "moment/moment";

const account = createAccount(pk.startsWith("0x") ? pk : `0x${pk}`);
const client = createClient({ chain: testnetBradbury, account });
const EXPLORER = "https://explorer-bradbury.genlayer.com";

async function tx(label, functionName, args, value = 0n) {
  process.stderr.write(`→ ${label} … `);
  try {
    const hash = await client.writeContract({ address: CONTRACT, functionName, args, value });
    await client.waitForTransactionReceipt({
      hash, status: TransactionStatus.ACCEPTED, interval: 5000, retries: 90,
    });
    console.error(`ok  ${EXPLORER}/tx/${hash}`);
    return hash;
  } catch (e) {
    console.error(`FAIL: ${e?.message || e}`);
    return null;
  }
}

async function read(functionName, args = []) {
  return client.readContract({ address: CONTRACT, functionName, args });
}

console.error(`Seeding OSSure ${CONTRACT} from ${account.address}\n`);

// 1) Underwrite + insure each real repo.
for (const repo of REPOS) {
  await tx(`underwrite ${repo} (1 GEN)`, "underwrite", [repo], STAKE);
  await tx(`buy_policy  ${repo} (cov 0.5, prem 0.1)`, "buy_policy", [repo, COVERAGE, DURATION], PREMIUM);
}

// 2) File one real claim on an abandoned repo -> validators adjudicate -> payout.
console.error(`\nFiling REAL claim on ${CLAIM_REPO} (validators read live GitHub)…`);
await tx(`file_claim ${CLAIM_REPO}`, "file_claim", [CLAIM_REPO]);

// 3) Show the on-chain result.
const stats = await read("get_stats");
const claimedPolicy = await read("get_policy", [CLAIM_REPO, account.address]);
const claimedPool = await read("get_pool", [CLAIM_REPO]);

console.error("\n================ RESULT (on-chain) ================");
console.error("stats         :", JSON.stringify(stats));
console.error(`${CLAIM_REPO} policy:`, JSON.stringify(claimedPolicy));
console.error(`${CLAIM_REPO} pool  :`, JSON.stringify(claimedPool));
console.error("===================================================");
console.error(`\nVerdict for ${CLAIM_REPO}: ${claimedPolicy.verdict} | policy status: ${claimedPolicy.status}`);
