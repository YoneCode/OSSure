import type { InputHTMLAttributes } from "react";
import { WOBBLY } from "../../lib/tokens";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  suffix?: string;
}

/** Hand-drawn input: full wobbly box, handwritten font, blue-pen focus. */
export function Input({ label, suffix, className = "", style, id, ...rest }: Props) {
  return (
    <label className="block">
      {label && <span className="block mb-1 text-lg text-ink/80">{label}</span>}
      <span className="relative block">
        <input
          id={id}
          className={`w-full h-12 px-4 ${suffix ? "pr-16" : ""} bg-white border-2 border-ink font-body text-lg
            text-ink placeholder:text-ink/40 outline-none transition-colors
            focus:border-pen focus:ring-2 focus:ring-pen/20 ${className}`}
          style={{ borderRadius: WOBBLY.sm, ...style }}
          {...rest}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/50">
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}
