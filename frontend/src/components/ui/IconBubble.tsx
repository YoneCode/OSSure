import type { ReactNode } from "react";

const ROUGH_CIRCLES = [
  "60% 40% 60% 40% / 50% 60% 40% 50%",
  "55% 45% 50% 50% / 55% 50% 50% 45%",
  "50% 50% 60% 40% / 60% 40% 60% 40%",
  "45% 55% 60% 40% / 50% 60% 40% 50%",
];

type Tone = "postit" | "white" | "accent" | "pen";
const TONES: Record<Tone, string> = {
  postit: "bg-postit text-ink",
  white: "bg-white text-ink",
  accent: "bg-accent text-white",
  pen: "bg-pen text-white",
};

const SIZES = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
};

/** Wraps an icon in a deliberately uneven "circle" with thick border + sketch shadow. */
export function IconBubble({
  children,
  tone = "postit",
  size = "md",
  variant = 0,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  size?: keyof typeof SIZES;
  variant?: number;
  className?: string;
}) {
  return (
    <span
      className={`grid flex-none place-items-center border-[3px] border-ink shadow-sketch-sm ${SIZES[size]} ${TONES[tone]} ${className}`}
      style={{ borderRadius: ROUGH_CIRCLES[variant % ROUGH_CIRCLES.length] }}
    >
      {children}
    </span>
  );
}
