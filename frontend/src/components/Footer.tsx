import { CONTRACT_ADDRESS } from "../lib/genlayer";
import { shortAddr } from "../lib/format";
import { SquiggleDivider } from "./decor/Sketch";
import { BrandMark } from "./decor/BrandMark";

const EXPLORER = "https://explorer-bradbury.genlayer.com";

export function Footer() {
  return (
    <footer className="mx-auto max-w-[1800px] px-6 md:px-10 lg:px-16 pb-16">
      {/* SVG squiggle divider -- no straight lines */}
      <SquiggleDivider className="h-6 w-full" />

      <div className="mt-8 grid gap-8 md:grid-cols-2 md:items-start">
        <div className="flex items-start gap-3">
          <BrandMark className="h-12 w-12 flex-none" />
          <div>
            <p className="font-head text-3xl wavy">OSSure</p>
            <p className="mt-2 max-w-md text-lg text-ink/60">
              Trustless insurance for open source dependencies. Public evidence
              only. Built on GenLayer.
            </p>
          </div>
        </div>

        <ul className="space-y-1 text-lg md:text-center">
          <li>
            <a
              className="font-head transition-colors hover:line-through hover:text-accent"
              target="_blank"
              rel="noreferrer"
              href="https://docs.genlayer.com"
            >
              Built on GenLayer ↗
            </a>
          </li>
          {CONTRACT_ADDRESS && (
            <li>
              <a
                className="font-head transition-colors hover:line-through hover:text-accent"
                target="_blank"
                rel="noreferrer"
                href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
              >
                Contract {shortAddr(CONTRACT_ADDRESS)} ↗
              </a>
            </li>
          )}
          <li className="text-base text-ink/50">Testnet Bradbury</li>
        </ul>

      </div>
    </footer>
  );
}

