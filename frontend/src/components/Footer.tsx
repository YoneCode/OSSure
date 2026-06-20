import { Github } from "lucide-react";
import { CONTRACT_ADDRESS } from "../lib/genlayer";
import { shortAddr } from "../lib/format";
import { SquiggleDivider } from "./decor/Sketch";
import { BrandMark } from "./decor/BrandMark";

const EXPLORER = "https://explorer-bradbury.genlayer.com";
const GITHUB_URL = "https://github.com/YoneCode/OSSure";
const X_URL = "https://x.com/YoneCode";

export function Footer() {
  return (
    <footer className="mx-auto max-w-[1800px] px-6 md:px-10 lg:px-16 pb-16">
      {/* SVG squiggle divider -- no straight lines */}
      <SquiggleDivider className="h-6 w-full" />

      <div className="mt-8 grid gap-8 md:grid-cols-3 md:items-start">
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

        <div className="flex items-center gap-3 md:justify-end">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="OSSure on GitHub"
            className="grid h-12 w-12 place-items-center border-2 border-ink bg-white text-ink shadow-sketch transition-transform duration-100 hover:-rotate-6 hover:bg-postit"
            style={{ borderRadius: "55% 45% 50% 50% / 55% 50% 50% 45%" }}
          >
            <Github strokeWidth={2.5} className="h-6 w-6" />
          </a>
          <a
            href={X_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="YoneCode on X"
            className="grid h-12 w-12 place-items-center border-2 border-ink bg-white text-ink shadow-sketch transition-transform duration-100 hover:rotate-6 hover:bg-postit"
            style={{ borderRadius: "50% 50% 60% 40% / 60% 40% 60% 40%" }}
          >
            <XIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
