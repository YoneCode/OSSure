import type { CSSProperties, ReactNode } from "react";
import { WOBBLY } from "../../lib/tokens";

type Decoration = "none" | "tape" | "tack";

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Paper-collage decoration pinned to the top center. */
  decoration?: Decoration;
  /** Post-it yellow fill for feature/highlight cards. */
  postit?: boolean;
  radius?: string;
}

/**
 * Hand-drawn container: white (or post-it) paper with a wobbly black border and
 * a soft hard-offset shadow. Optional tape strip or thumbtack on top.
 */
export function Card({
  children,
  className = "",
  style,
  decoration = "none",
  postit = false,
  radius = WOBBLY.a,
}: Props) {
  return (
    <div
      className={`relative border-2 border-ink shadow-sketch-soft ${
        postit ? "bg-postit" : "bg-white"
      } ${className}`}
      style={{ borderRadius: radius, ...style }}
    >
      {decoration === "tape" && (
        <span
          aria-hidden
          className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 bg-ink/15 border border-ink/20"
          style={{ borderRadius: "4px" }}
        />
      )}
      {decoration === "tack" && (
        <span
          aria-hidden
          className="absolute -top-3 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-accent border-2 border-ink shadow-sketch-sm"
        />
      )}
      {children}
    </div>
  );
}
