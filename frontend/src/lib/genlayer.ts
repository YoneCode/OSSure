// GenLayer client wiring for OSSure.
// Reads use a chain-only client (no wallet). Writes are signed by the user's
// Privy wallet via its EIP-1193 provider, following the documented browser flow.
import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS ?? "") as `0x${string}`;

export type Stats = {
  pools: number;
  policies: number;
  active_policies: number;
  paid_claims: number;
  total_staked_wei: string;
  total_locked_wei: string;
};

export type Pool = {
  repo: string;
  total_stake_wei: string;
  total_shares: string;
  locked_wei: string;
  available_wei: string;
  premium_income_wei: string;
};

export type Policy = {
  holder: string;
  repo: string;
  coverage_wei: string;
  premium_wei: string;
  start: number;
  expiry: number;
  status: string;
  verdict: string;
  last_checked: number;
};

// Read-only client -- talks directly to the Bradbury RPC, no account needed.
const readClient = createClient({ chain: testnetBradbury });

function read<T>(functionName: string, args: any[] = []): Promise<T> {
  return readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args,
  }) as Promise<T>;
}

export const api = {
  getStats: () => read<Stats>("get_stats"),
  getPools: () => read<Pool[]>("get_pools"),
  getPool: (repo: string) => read<Pool>("get_pool", [repo]),
  getPolicy: (repo: string, holder: string) => read<Policy>("get_policy", [repo, holder]),
  getShares: (repo: string, underwriter: string) =>
    read<string>("get_shares", [repo, underwriter]),
};

/** Build a wallet-bound write client from a Privy EIP-1193 provider. */
async function getWriteClient(provider: unknown, address: string) {
  const client = createClient({
    chain: testnetBradbury,
    account: address as `0x${string}`,
    // genlayer-js accepts a standard EIP-1193 provider here.
    provider: provider as never,
  });
  // Ensure the wallet is on the Bradbury chain before signing.
  await client.connect("testnetBradbury");
  return client;
}

export type TxArgs = {
  provider: unknown;
  address: string;
  functionName: string;
  args?: any[];
  value?: bigint;
};

/** Send a write transaction and wait until it is accepted by consensus. */
export async function sendTx({ provider, address, functionName, args = [], value = 0n }: TxArgs) {
  const client = await getWriteClient(provider, address);
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args,
    value,
  });
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.ACCEPTED,
    interval: 5000,
    retries: 60,
  });
  return { hash, receipt };
}
