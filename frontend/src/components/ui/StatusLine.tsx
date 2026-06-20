import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { TxState } from "../../hooks/useDepGuard";

const EXPLORER = "https://explorer-bradbury.genlayer.com";

/** Inline transaction feedback in the hand-drawn palette. */
export function StatusLine({ state }: { state: TxState }) {
  if (state.status === "idle") return null;
  const tone =
    state.status === "success"
      ? "text-pen"
      : state.status === "error"
        ? "text-accent"
        : "text-ink/70";
  return (
    <div className={`mt-3 flex items-start gap-2 text-base ${tone}`}>
      {state.status === "pending" && <Loader2 strokeWidth={3} className="mt-0.5 h-5 w-5 animate-spin" />}
      {state.status === "success" && <CheckCircle2 strokeWidth={3} className="mt-0.5 h-5 w-5" />}
      {state.status === "error" && <XCircle strokeWidth={3} className="mt-0.5 h-5 w-5" />}
      <span className="break-words">
        {state.message}
        {state.hash && (
          <>
            {" "}
            <a
              className="wavy"
              href={`${EXPLORER}/tx/${state.hash}`}
              target="_blank"
              rel="noreferrer"
            >
              view tx
            </a>
          </>
        )}
      </span>
    </div>
  );
}
