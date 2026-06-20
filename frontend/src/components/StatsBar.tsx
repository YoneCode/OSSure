import { formatGen } from "../lib/format";
import type { Stats as StatsT } from "../lib/genlayer";
import { Tag } from "./ui/Tag";

// Five distinct, deliberately uneven "circles" -- never matched, never centered.
const BLOBS = [
  "62% 38% 63% 37% / 41% 44% 56% 59%",
  "38% 62% 41% 59% / 59% 41% 59% 41%",
  "50% 50% 36% 64% / 55% 47% 53% 45%",
  "63% 37% 54% 46% / 38% 63% 37% 62%",
];

const TILTS = ["-rotate-2", "rotate-2", "-rotate-1", "rotate-1"];

export function StatsBar({ stats, loading }: { stats: StatsT | null; loading: boolean }) {
  const items = [
    { label: "GEN staked", value: stats ? formatGen(stats.total_staked_wei) : "--", tone: "bg-postit" },
    { label: "GEN locked", value: stats ? formatGen(stats.total_locked_wei) : "--", tone: "bg-white" },
    { label: "Active policies", value: stats ? String(stats.active_policies) : "--", tone: "bg-white" },
    { label: "Claims paid", value: stats ? String(stats.paid_claims) : "--", tone: "bg-accent text-white" },
  ];
  return (
    <section className="mx-auto max-w-[1800px] px-6 md:px-10 lg:px-16 py-20">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <Tag tone="postit">live, on Bradbury</Tag>
          <h2 className="mt-3 font-head text-4xl md:text-6xl">By the numbers</h2>
        </div>
        <p className="hidden md:block max-w-sm text-lg text-ink/60 -rotate-1">
          all values pulled from the contract -- refresh whenever
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-10">
        {items.map((it, i) => (
          <div key={it.label} className="flex flex-col items-center">
            <div
              className={`grid h-32 w-32 md:h-40 md:w-40 place-items-center border-[3px] border-ink shadow-sketch ${it.tone} ${TILTS[i % TILTS.length]}`}
              style={{ borderRadius: BLOBS[i % BLOBS.length] }}
            >
              <div className="font-head text-3xl md:text-4xl px-3 text-center leading-tight">
                {loading ? "…" : it.value}
              </div>
            </div>
            <div className="mt-3 font-head text-lg md:text-xl text-ink/80">{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
