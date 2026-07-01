import { usePrivy } from "@privy-io/react-auth";
import { Github, Wallet } from "lucide-react";
import { Button } from "./ui/Button";
import { BrandMark } from "./decor/BrandMark";
import { useActiveWallet } from "../hooks/useDepGuard";
import { shortAddr } from "../lib/format";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#pools", label: "Pools" },
  { href: "#act", label: "Act" },
];

const GITHUB_URL = "https://github.com/YoneCode/OSSure";
const X_URL = "https://x.com/YoneCode";

export function Header() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { address } = useActiveWallet();

  return (
    <header className="sticky top-0 z-30 border-b-2 border-dashed border-ink/40 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 md:px-10 lg:px-16 py-4">
        <a href="#top" className="flex items-center gap-3">
          <BrandMark className="h-10 w-10 drop-shadow-[2px_2px_0_#2d2d2d]" />
          <span className="font-head text-2xl md:text-3xl wavy">OSSure</span>
        </a>

        <nav className="hidden md:flex items-center gap-7 text-lg">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="font-head transition-colors hover:line-through hover:text-accent"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <SocialLinks />

          {!ready ? (
            <Button disabled>
              <Wallet strokeWidth={2.5} className="h-5 w-5" /> Loading…
            </Button>
          ) : authenticated ? (
            <div className="flex items-center gap-3">
              <span
                className="hidden sm:inline-flex items-center gap-2 border-2 border-ink bg-white px-3 py-1 shadow-sketch-sm"
                style={{ borderRadius: "18px 8px 22px 8px / 8px 22px 8px 20px" }}
              >
                <Wallet strokeWidth={2.5} className="h-4 w-4 text-pen" />
                <span className="text-base">{shortAddr(address)}</span>
              </span>
              <Button variant="secondary" onClick={logout}>Disconnect</Button>
            </div>
          ) : (
            <Button onClick={login}>
              <Wallet strokeWidth={2.5} className="h-5 w-5" /> Connect
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function SocialLinks() {
  return (
    <div className="hidden sm:flex items-center gap-2">
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="OSSure on GitHub"
        title="GitHub"
        className="grid h-10 w-10 place-items-center border-2 border-ink bg-white text-ink shadow-sketch-sm transition-transform duration-100 hover:-rotate-3 hover:bg-postit"
        style={{ borderRadius: "55% 45% 50% 50% / 55% 50% 50% 45%" }}
      >
        <Github strokeWidth={2.5} className="h-5 w-5" />
      </a>
      <a
        href={X_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="YoneCode on X"
        title="X / Twitter"
        className="grid h-10 w-10 place-items-center border-2 border-ink bg-white text-ink shadow-sketch-sm transition-transform duration-100 hover:rotate-3 hover:bg-postit"
        style={{ borderRadius: "50% 50% 60% 40% / 60% 40% 60% 40%" }}
      >
        <XIcon className="h-4 w-4" />
      </a>
    </div>
  );
}

// X (formerly Twitter) glyph as inline SVG so we don't pull in an icon set just for this.
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
