import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Loader2, XCircle, ArrowUpRight, X } from "lucide-react";
import { WOBBLY } from "../../lib/tokens";

const EXPLORER = "https://explorer-bradbury.genlayer.com";

export type ToastPhase = "pending" | "success" | "error";

export type Toast = {
  id: number;
  phase: ToastPhase;
  title: string;
  message?: string;
  hash?: string;
};

type ToastContextValue = {
  push: (t: Omit<Toast, "id">) => number;
  update: (id: number, patch: Partial<Omit<Toast, "id">>) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { ...t, id }]);
    return id;
  }, []);

  const update = useCallback((id: number, patch: Partial<Omit<Toast, "id">>) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  return (
    <ToastContext.Provider value={{ push, update, dismiss }}>
      {children}
      <Toaster toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function Toaster({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,26rem)] flex-col gap-3">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: number) => void }) {
  // Auto-dismiss successes after a while; keep errors + pending until resolved.
  useEffect(() => {
    if (toast.phase === "success") {
      const timer = setTimeout(() => dismiss(toast.id), 9000);
      return () => clearTimeout(timer);
    }
  }, [toast.phase, toast.id, dismiss]);

  const accent =
    toast.phase === "success" ? "bg-pen" : toast.phase === "error" ? "bg-accent" : "bg-ink";

  return (
    <div
      className="pointer-events-auto relative -rotate-1 animate-toast-in border-[3px] border-ink bg-white p-4 pr-9 shadow-sketch"
      style={{ borderRadius: WOBBLY.b }}
      role="status"
      aria-live="polite"
    >
      {/* colored phase stripe down the left */}
      <span
        aria-hidden
        className={`absolute left-0 top-0 h-full w-1.5 ${accent}`}
        style={{ borderRadius: "6px 0 0 6px" }}
      />

      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss"
        className="absolute right-2 top-2 grid h-6 w-6 place-items-center border-2 border-ink bg-white text-ink transition-transform duration-100 hover:rotate-6 hover:bg-accent hover:text-white"
        style={{ borderRadius: "50% 50% 55% 45% / 55% 45% 55% 45%" }}
      >
        <X strokeWidth={3} className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex-none">
          {toast.phase === "pending" && (
            <Loader2 strokeWidth={3} className="h-6 w-6 animate-spin text-ink" />
          )}
          {toast.phase === "success" && (
            <CheckCircle2 strokeWidth={3} className="h-6 w-6 text-pen" />
          )}
          {toast.phase === "error" && <XCircle strokeWidth={3} className="h-6 w-6 text-accent" />}
        </span>

        <div className="min-w-0">
          <p className="font-head text-lg leading-tight">{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 break-words text-base text-ink/70">{toast.message}</p>
          )}
          {toast.hash && (
            <a
              href={`${EXPLORER}/tx/${toast.hash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-base text-pen wavy"
            >
              {toast.hash.slice(0, 8)}…{toast.hash.slice(-6)}
              <ArrowUpRight strokeWidth={3} className="h-4 w-4 no-underline" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
