// Reusable wobbly border-radius values for inline styles, so individual elements
// can vary their irregular edges (the design rejects uniform geometry).
export const WOBBLY = {
  a: "255px 15px 225px 15px / 15px 225px 15px 255px",
  b: "15px 225px 15px 255px / 255px 15px 225px 15px",
  c: "125px 25px 155px 35px / 25px 155px 35px 125px",
  sm: "18px 8px 22px 8px / 8px 22px 8px 20px",
  blob: "50% 50% 50% 50% / 62% 40% 60% 38%",
} as const;

// Deterministically pick a wobbly variant from an index so a list of cards looks
// hand-drawn-irregular but stays stable across re-renders.
const VARIANTS = [WOBBLY.a, WOBBLY.b, WOBBLY.c];
export function wobblyFor(i: number): string {
  return VARIANTS[i % VARIANTS.length];
}

// Small alternating tilt for casual, off-grid energy.
export function tiltFor(i: number): string {
  const tilts = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];
  return tilts[i % tilts.length];
}
