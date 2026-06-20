import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Tag } from "./ui/Tag";
import { IconBubble } from "./ui/IconBubble";
import { ArrowDashed, CornerMarks, StarBurst } from "./decor/Sketch";
import { WOBBLY } from "../lib/tokens";

export function Hero() {
  return (
    <section id="top" className="relative mx-auto max-w-[1800px] px-6 md:px-10 lg:px-16 pt-20 pb-16 md:pt-28">
      {/* off-grid bouncing scribble */}
      <span
        aria-hidden
        className="hidden md:block pointer-events-none absolute right-12 top-12 h-20 w-20 border-[3px] border-pen animate-soft-bounce"
        style={{ borderRadius: WOBBLY.blob }}
      />
      <StarBurst className="hidden md:block absolute left-[42%] top-10 h-10 w-10 -rotate-12" />

      <div className="grid items-center gap-12 md:grid-cols-2">
        {/* LEFT -- copy */}
        <div className="relative">
          <Tag tone="accent" className="mb-5">parametric insurance</Tag>

          <h1 className="font-head leading-[1.05] text-5xl md:text-7xl">
            Insure your code
            <br />
            against
            <span className="relative whitespace-nowrap text-accent"> abandoned</span>
            <span className="ml-1 inline-block animate-[soft-bounce_2s_ease-in-out_infinite] rotate-12 text-ink">
              !
            </span>
            <br />
            <span className="text-3xl md:text-5xl text-ink/70">dependencies.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg md:text-2xl text-ink/80">
            Stake or insure a public GitHub dependency. When a claim is filed,
            GenLayer validators read the project's public evidence and agree on a
            verdict -- <span className="bg-postit px-1.5">healthy</span>,
            <span className="bg-postit px-1.5"> at&nbsp;risk</span>, or
            <span className="bg-postit px-1.5"> abandoned</span>. Abandoned pays out.
            No insurer. No oracle.
          </p>

          <div className="relative mt-10 flex flex-wrap items-center gap-6">
            <a href="#act"><Button>Get covered</Button></a>
            <a href="#pools"><Button variant="secondary">Earn as underwriter</Button></a>

            {/* dashed arrow SVG pointing at the primary CTA (desktop only) */}
            <ArrowDashed
              className="hidden md:block absolute -right-2 -top-16 h-24 w-44 -scale-x-100"
            />
            <span className="hidden md:block absolute -right-10 -top-20 font-head text-pen rotate-[-6deg]">
              try it →
            </span>
          </div>
        </div>

        {/* RIGHT -- sketchbook diagram with corner frame marks */}
        <div className="relative">
          <CornerMarks
            className="absolute inset-0 h-[calc(100%+24px)] w-[calc(100%+24px)] -translate-x-3 -translate-y-3 pointer-events-none"
          />
          <Card decoration="tape" className="rotate-[1.5deg] p-7 md:p-10" radius={WOBBLY.b}>
            <p className="font-head text-3xl md:text-4xl">How a claim settles</p>

            <ol className="mt-6 space-y-5 text-lg md:text-xl">
              <li className="flex items-start gap-4">
                <IconBubble tone="postit" size="sm" variant={0}>
                  <span className="font-head">1</span>
                </IconBubble>
                <span>Fetch <b>public</b> GitHub evidence</span>
              </li>
              <li className="flex items-start gap-4">
                <IconBubble tone="white" size="sm" variant={1}>
                  <span className="font-head">2</span>
                </IconBubble>
                <span>Validators agree on a tier</span>
              </li>
              <li className="flex items-start gap-4">
                <IconBubble tone="accent" size="sm" variant={2}>
                  <span className="font-head">3</span>
                </IconBubble>
                <span><b>abandoned</b> → coverage paid from the pool</span>
              </li>
            </ol>

            <p className="mt-7 border-t-2 border-dashed border-ink/40 pt-4 text-base md:text-lg text-ink/70">
              The judgement is the part that needs GenLayer. The money moves only
              after consensus.
            </p>
          </Card>

          {/* Speech bubble callout, with a real geometric tail */}
          <div
            className="hidden md:block absolute -bottom-8 -left-10 -rotate-3 bg-postit border-2 border-ink shadow-sketch-sm px-4 py-2 max-w-[16rem]"
            style={{ borderRadius: WOBBLY.sm }}
          >
            <p className="font-head text-lg leading-tight">
              live on Bradbury -- <span className="wavy">try a real claim</span>
            </p>
            {/* triangle tail */}
            <span
              aria-hidden
              className="absolute -bottom-3 left-8 h-0 w-0"
              style={{
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "12px solid #2d2d2d",
              }}
            />
            <span
              aria-hidden
              className="absolute -bottom-2 left-9 h-0 w-0"
              style={{
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "10px solid #fff9c4",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
