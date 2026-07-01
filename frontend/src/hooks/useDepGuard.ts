import { useCallback, useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { api, sendTx, type Pool, type Stats } from "../lib/genlayer";
import { useToast } from "../components/ui/Toast";

/** The wallet we sign with: the user's connected/embedded Privy wallet. */
export function useActiveWallet() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  return {
    authenticated,
    address: wallet?.address as string | undefined,
    async getProvider() {
      if (!wallet) throw new Error("Connect a wallet first");
      return wallet.getEthereumProvider();
    },
  };
}

export type TxState = {
  status: "idle" | "pending" | "success" | "error";
  message: string;
  hash?: string;
};

/** Transaction runner with human-readable status, bound to the active wallet. */
export function useTx() {
  const { address, getProvider } = useActiveWallet();
  const toast = useToast();
  const [state, setState] = useState<TxState>({ status: "idle", message: "" });

  const run = useCallback(
    async (
      label: string,
      functionName: string,
      opts: { args?: unknown[]; value?: bigint } = {},
    ) => {
      if (!address) {
        setState({ status: "error", message: "Connect your wallet first." });
        toast.push({ phase: "error", title: "Wallet not connected", message: "Connect a wallet to continue." });
        return null;
      }
      const toastId = toast.push({
        phase: "pending",
        title: `${label}`,
        message: "Confirm in your wallet…",
      });
      try {
        setState({ status: "pending", message: `${label}…` });
        const provider = await getProvider();
        const { hash } = await sendTx({
          provider,
          address,
          functionName,
          args: opts.args ?? [],
          value: opts.value ?? 0n,
          onHash: (h) =>
            toast.update(toastId, {
              message: "Submitted. Validators are adjudicating…",
              hash: h,
            }),
        });
        setState({ status: "success", message: `${label} accepted.`, hash });
        toast.update(toastId, {
          phase: "success",
          title: `${label} confirmed`,
          message: "Accepted by GenLayer consensus.",
          hash,
        });
        return hash;
      } catch (e: unknown) {
        const msg = errToString(e);
        setState({ status: "error", message: cleanError(msg) });
        toast.update(toastId, {
          phase: "error",
          title: `${label} failed`,
          message: cleanError(msg),
        });
        return null;
      }
    },
    [address, getProvider, toast],
  );

  const reset = useCallback(() => setState({ status: "idle", message: "" }), []);
  return { state, run, reset };
}

function errToString(e: unknown): string {
  if (e == null) return "Unknown error";
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  const any = e as Record<string, unknown>;
  for (const k of ["shortMessage", "details", "message", "reason", "error", "data"]) {
    const v = any[k];
    if (typeof v === "string" && v.trim()) return v;
    if (v && typeof v === "object") {
      const nested = errToString(v);
      if (nested && nested !== "Unknown error") return nested;
    }
  }
  if (any.cause) {
    const c = errToString(any.cause);
    if (c && c !== "Unknown error") return c;
  }
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

function cleanError(msg: string): string {
  // Surface the contract's classified error text when present.
  const m = msg.match(/\[(EXPECTED|EXTERNAL|TRANSIENT|LLM_ERROR)\]\s*(.*)/);
  if (m) return m[2] || m[0];
  if (/user rejected|rejected the request/i.test(msg)) return "Transaction rejected.";
  return msg.length > 160 ? msg.slice(0, 160) + "…" : msg;
}

/** Pools + protocol stats with manual refresh. */
export function useProtocol() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, p] = await Promise.all([api.getStats(), api.getPools()]);
      setStats(s);
      setPools(Array.isArray(p) ? p : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, pools, loading, error, refresh };
}
