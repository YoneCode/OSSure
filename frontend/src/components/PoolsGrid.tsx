import { RefreshCw, Github } from "lucide-react";
import { Card } from "./ui/Card";
import { Tag } from "./ui/Tag";
import { Button } from "./ui/Button";
import { IconBubble } from "./ui/IconBubble";
import { DashedCircleHL } from "./decor/Sketch";
import { formatGen } from "../lib/format";
import { wobblyFor, tiltFor } from "../lib/tokens";
import type { Pool } from "../lib/genlayer";

export function PoolsGrid({
  pools,
  loading,
  onRefresh,
}: {
  pools: Pool[];
  loading: boolean;
  onRefresh: () => void;
}) {
  // Find the pool with the most stake -> visually highlight it.
  const topIdx = pools.reduce(
    (best, p, i) =>
      BigInt(p.total_stake_wei || "0") > BigInt(pools[best]?.total_stake_wei || "0") ? i : best,
    0,
  );

  return (
    <section id="pools" className="mx-auto max-w-[1800px] px-6 md:px-10 lg:px-16 py-20">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Tag tone="pen">the pools</Tag>
          <h2 className="mt-3 font-head text-4xl md:text-6xl">Insured dependencies</h2>
          <p className="mt-2 text-lg md:text-xl text-ink/60">
            real public repos, real GEN at stake, real validators
          </p>
        </div>
        <Button variant="secondary" onClick={onRefresh}>
          <RefreshCw strokeWidth={2.5} className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {pools.length === 0 ? (
        <Card decoration="tack" className="p-10 text-center text-xl text-ink/70">
          {loading ? "Loading pools…" : "No pools yet -- be the first to underwrite a dependency below."}
        </Card>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pools.map((p, i) => {
            const isTop = i === topIdx && pools.length > 1;
            return (
              <div key={p.repo} className={`relative ${tiltFor(i)} ${isTop ? "md:scale-105" : ""}`}>
                {isTop && (
                  <DashedCircleHL className="hidden md:block pointer-events-none absolute -inset-4" />
                )}
                <Card
                  className="p-6 transition-transform duration-100 hover:rotate-0 hover:shadow-sketch-lg"
                  radius={wobblyFor(i)}
                  decoration={i % 3 === 0 ? "tape" : i === topIdx ? "tack" : "none"}
                >
                  <div className="flex items-start gap-3">
                    <IconBubble tone="white" size="md" variant={i}>
                      <Github strokeWidth={2.5} className="h-5 w-5 text-pen" />
                    </IconBubble>
                    <span className="break-all font-head text-xl md:text-2xl leading-tight">
                      {p.repo}
                    </span>
                  </div>
                  <dl className="mt-5 space-y-2 text-lg">
                    <Row k="Backing" v={`${formatGen(p.total_stake_wei)} GEN`} />
                    <Row k="Available" v={`${formatGen(p.available_wei)} GEN`} />
                    <Row k="Locked" v={`${formatGen(p.locked_wei)} GEN`} />
                    <Row k="Premiums" v={`${formatGen(p.premium_income_wei)} GEN`} />
                  </dl>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-ink/25 pb-1">
      <dt className="text-ink/60">{k}</dt>
      <dd className="font-head">{v}</dd>
    </div>
  );
}
