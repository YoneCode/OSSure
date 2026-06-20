import { Github, BrainCircuit, Coins } from "lucide-react";
import { Card } from "./ui/Card";
import { Tag } from "./ui/Tag";
import { IconBubble } from "./ui/IconBubble";
import { SquiggleConnector } from "./decor/Sketch";
import { WOBBLY } from "../lib/tokens";

const STEPS = [
  {
    icon: <Github strokeWidth={2.5} className="h-7 w-7" />,
    label: "Evidence",
    body: "Validators independently fetch public GitHub data -- releases, last push, archived flag.",
    tilt: "-rotate-2",
    radius: WOBBLY.a,
    decoration: "tape" as const,
  },
  {
    icon: <BrainCircuit strokeWidth={2.5} className="h-7 w-7" />,
    label: "Judgement",
    body: "An LLM is grounded with the verified facts and assigns a tier: healthy, at-risk, or abandoned.",
    tilt: "rotate-1",
    radius: WOBBLY.b,
    decoration: "tack" as const,
    postit: true,
  },
  {
    icon: <Coins strokeWidth={2.5} className="h-7 w-7" />,
    label: "Settlement",
    body: "Validators must agree on the tier. If 'abandoned', the contract pays the coverage out, on-chain.",
    tilt: "-rotate-1",
    radius: WOBBLY.c,
    decoration: "tape" as const,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative mx-auto max-w-[1800px] px-6 md:px-10 lg:px-16 py-20">
      <div className="mb-10 text-center">
        <Tag tone="pen" className="mb-4">how it works</Tag>
        <h2 className="font-head text-4xl md:text-6xl">Three steps. <span className="wavy">No oracle.</span></h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg md:text-xl text-ink/70">
          The judgement is the part that's hard. The payout is the easy part --
          deterministic code, after consensus.
        </p>
      </div>

      <div className="relative grid gap-12 md:grid-cols-3">
        {/* Squiggly connector across the row, hidden on mobile */}
        <SquiggleConnector
          className="hidden md:block pointer-events-none absolute left-[10%] right-[10%] top-[44px] h-12 w-[80%]"
        />

        {STEPS.map((s, i) => (
          <div key={s.label} className={`relative ${s.tilt}`}>
            {/* Big step number badge */}
            <span
              className="absolute -top-6 -left-4 z-10 grid h-14 w-14 place-items-center border-[3px] border-ink bg-accent text-white font-head text-2xl shadow-sketch"
              style={{ borderRadius: "60% 40% 60% 40% / 50% 60% 40% 50%" }}
            >
              {i + 1}
            </span>

            <Card
              className="p-6 md:p-7 transition-transform duration-100 hover:rotate-0"
              radius={s.radius}
              decoration={s.decoration}
              postit={s.postit}
            >
              <div className="flex items-center gap-3">
                <IconBubble tone={s.postit ? "white" : "postit"} size="lg" variant={i}>
                  {s.icon}
                </IconBubble>
                <h3 className="font-head text-2xl md:text-3xl">{s.label}</h3>
              </div>
              <p className="mt-4 text-lg md:text-xl text-ink/80">{s.body}</p>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
