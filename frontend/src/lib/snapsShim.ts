// Wallet-detection code (bundled inside Privy / WalletConnect / AppKit) probes
// MetaMask-only Snaps methods (wallet_getSnaps, wallet_requestSnaps) on any
// provider that reports `isMetaMask`. Rabby reports MetaMask compatibility but
// does NOT implement Snaps, so it rejects with:
//   "method [wallet_getSnaps] doesn't has corresponding handler"
// and that rejection aborts the transaction.
//
// This shim patches the injected provider(s) at page load -- including every
// EIP-6963-announced provider (which is how Privy discovers Rabby) -- so those
// probes resolve to "no snaps installed" instead of throwing. Every other RPC
// call passes through untouched.

const SNAP_PROBE = new Set([
  "wallet_getSnaps",
  "wallet_requestSnaps",
  "wallet_invokeSnap",
  "wallet_snap",
]);

function patch(provider: any) {
  if (!provider || provider.__ossureSnapsPatched) return;
  const original = provider.request;
  if (typeof original !== "function") return;
  const bound = original.bind(provider);
  try {
    provider.request = async (args: any) => {
      if (args && SNAP_PROBE.has(args.method)) return {};
      return bound(args);
    };
    Object.defineProperty(provider, "__ossureSnapsPatched", {
      value: true,
      enumerable: false,
    });
  } catch {
    /* provider.request not writable -- best effort, ignore */
  }
}

export function installSnapsShim(): void {
  if (typeof window === "undefined") return;

  const eth = (window as any).ethereum;
  if (eth) {
    patch(eth);
    if (Array.isArray(eth.providers)) eth.providers.forEach(patch);
  }

  // EIP-6963: wallets announce their provider via this event. Patch each one,
  // then ask everyone to (re)announce so we catch providers registered later.
  window.addEventListener("eip6963:announceProvider", (e: any) => {
    patch(e?.detail?.provider);
  });
  try {
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  } catch {
    /* ignore */
  }
}
