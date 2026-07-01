import { useState } from "react";
import { TriangleAlert, X, ArrowUpRight, Wallet, Mail } from "lucide-react";
import { IconBubble } from "./ui/IconBubble";
import { WOBBLY } from "../lib/tokens";

const STORAGE_KEY = "ossure-wallet-notice";
const RABBY_URL = "https://rabby.io";

/**
 * A taped-on notice explaining the known MetaMask <-> Bradbury testnet issue and
 * pointing users to Rabby (or email login). Dismissible, and the dismissal is
 * remembered so returning users are not nagged.
 */
export function WalletNotice() {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "dismissed";
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <div className="mx-auto max-w-[1800px] px-6 md:px-10 lg:px-16 pt-6">
      <div
        className="relative -rotate-[0.6deg] border-[3px] border-ink bg-postit p-5 md:p-6 shadow-sketch"
        style={{ borderRadius: WOBBLY.b }}
        role="note"
        aria-label="Wallet compatibility notice"
      >
        {/* tape strip */}
        <span
          aria-hidden
          className="absolute -top-3 left-10 h-6 w-28 -rotate-3 border border-ink/20 bg-white/40"
          style={{ borderRadius: "4px" }}
        />

        {/* dismiss */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss notice"
          title="Dismiss"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center border-2 border-ink bg-white text-ink shadow-sketch-sm transition-transform duration-100 hover:rotate-6 hover:bg-accent hover:text-white"
          style={{ borderRadius: "50% 50% 55% 45% / 55% 45% 55% 45%" }}
        >
          <X strokeWidth={3} className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
          <IconBubble tone="accent" size="lg" variant={2} className="mt-0.5">
            <TriangleAlert strokeWidth={2.5} className="h-7 w-7" />
          </IconBubble>

          <div className="flex-1 pr-6">
            <h3 className="font-head text-2xl md:text-3xl leading-tight">
              Using MetaMask? Switch to <span className="wavy">Rabby</span>.
            </h3>

            <p className="mt-2 text-lg text-ink/80">
              Bradbury is a testnet, and its RPC currently rejects the exact
              request format MetaMask uses to send transactions. Reading the app
              works, but <b>signing a transaction with MetaMask will fail</b>. It
              is a testnet quirk, not a problem with your wallet or your funds.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div
                className="flex items-start gap-3 border-2 border-ink bg-white p-3"
                style={{ borderRadius: WOBBLY.sm }}
              >
                <Wallet strokeWidth={2.5} className="mt-0.5 h-5 w-5 flex-none text-pen" />
                <p className="text-base leading-snug">
                  <b>Connect with Rabby</b> instead. It sends the format Bradbury
                  expects, so every action works.
                </p>
              </div>
              <div
                className="flex items-start gap-3 border-2 border-ink bg-white p-3"
                style={{ borderRadius: WOBBLY.a }}
              >
                <Mail strokeWidth={2.5} className="mt-0.5 h-5 w-5 flex-none text-pen" />
                <p className="text-base leading-snug">
                  No Rabby? <b>Log in with email</b> to use the built-in wallet.
                  That works too.
                </p>
              </div>
            </div>

            <a
              href={RABBY_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 h-11 px-5 border-[3px] border-ink bg-white font-body text-lg shadow-sketch transition-transform duration-100 hover:-translate-y-[1px] hover:bg-accent hover:text-white active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              style={{ borderRadius: WOBBLY.sm }}
            >
              Get Rabby
              <ArrowUpRight strokeWidth={3} className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
