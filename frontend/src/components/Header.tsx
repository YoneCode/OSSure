import { usePrivy } from "@privy-io/react-auth";
import { Wallet } from "lucide-react";
import { Button } from "./ui/Button";
import { BrandMark } from "./decor/BrandMark";
import { useActiveWallet } from "../hooks/useDepGuard";
import { shortAddr } from "../lib/format";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#pools", label: "Pools" },
  { href: "#act", label: "Act" },
];


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

          {ready &&
            (authenticated ? (
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
            ))}
        </div>
      </div>
    </header>
  );
}


// X (formerly Twitter) glyph as inline SVG so we don't pull in an icon set just for this.
