import type { ButtonHTMLAttributes } from "react";
import { WOBBLY } from "../../lib/tokens";

type Variant = "primary" | "secondary";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/**
 * Hand-drawn button: irregular wobbly oval, thick border, hard offset shadow.
 * Hover fills with accent and "lifts"; active "presses flat" (shadow removed).
 */
export function Button({ variant = "primary", className = "", style, ...rest }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 h-12 md:h-14 px-6 border-[3px] border-ink " +
    "font-body text-lg md:text-2xl transition-transform duration-100 select-none " +
    "shadow-sketch hover:shadow-sketch-sm hover:translate-x-[2px] hover:translate-y-[2px] " +
    "active:shadow-none active:translate-x-[4px] active:translate-y-[4px] " +
    "disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<Variant, string> = {
    primary: "bg-white text-ink hover:bg-accent hover:text-white",
    secondary: "bg-muted text-ink hover:bg-pen hover:text-white",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={{ borderRadius: WOBBLY.sm, ...style }}
      {...rest}
    />
  );
}
