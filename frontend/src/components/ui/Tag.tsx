import type { ReactNode } from "react";
import { WOBBLY } from "../../lib/tokens";

/** Sticky-note style section label, slightly tilted. */
export function Tag({
  children,
  tone = "postit",
  className = "",
}: {
  children: ReactNode;
  tone?: "postit" | "accent" | "pen";
  className?: string;
}) {
  const tones = {
    postit: "bg-postit text-ink",
    accent: "bg-accent text-white",
    pen: "bg-pen text-white",
  };
  return (
    <span
      className={`inline-block -rotate-2 border-2 border-ink px-3 py-1 text-base shadow-sketch-sm ${tones[tone]} ${className}`}
      style={{ borderRadius: WOBBLY.sm }}
    >
      {children}
    </span>
  );
}
