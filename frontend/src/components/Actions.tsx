import { useState } from "react";
import { Coins, ShieldPlus, Gavel, Search } from "lucide-react";
import { Card } from "./ui/Card";
import { Tag } from "./ui/Tag";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { StatusLine } from "./ui/StatusLine";
import { IconBubble } from "./ui/IconBubble";
import { useActiveWallet, useTx } from "../hooks/useDepGuard";
import { api, type Policy } from "../lib/genlayer";
import { parseGen, formatGen } from "../lib/format";
import { WOBBLY } from "../lib/tokens";

export function Actions({ onChanged }: { onChanged: () => void }) {
  return (
    <section id="act" className="mx-auto max-w-[1800px] px-6 md:px-10 lg:px-16 py-20">
      <div className="mb-10 grid gap-6 md:grid-cols-[auto_1fr] md:items-end">
        <div>
          <Tag tone="accent">do something</Tag>
          <h2 className="mt-3 font-head text-4xl md:text-6xl">Stake, insure, or claim</h2>
        </div>
        {/* Drop-cap intro card per the spec's "drop-cap first letter treatment" */}
        <p className="text-lg md:text-xl text-ink/75 md:text-right">
          <span
            className="float-left mr-2 mt-1 grid h-12 w-12 place-items-center border-[3px] border-ink bg-postit font-head text-3xl shadow-sketch-sm md:hidden"
            style={{ borderRadius: "55% 45% 50% 50% / 55% 50% 50% 45%" }}
          >
            T
          </span>
          The same wallet can play every role: underwriter, policyholder, claimant.
          Try a real claim against a real GitHub project.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <Underwrite onChanged={onChanged} />
        <BuyPolicy onChanged={onChanged} />
        <FileClaim onChanged={onChanged} />
        <MyPosition />
      </div>
    </section>
  );
}

function PanelHead({
  icon,
  title,
  hint,
  variant = 0,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  variant?: number;
}) {
  return (
    <div className="mb-5 flex items-start gap-4">
      <IconBubble tone="postit" size="lg" variant={variant}>
        {icon}
      </IconBubble>
      <div>
        <h3 className="font-head text-2xl md:text-3xl leading-tight">{title}</h3>
        <p className="text-base md:text-lg text-ink/60">{hint}</p>
      </div>
    </div>
  );
}

function Underwrite({ onChanged }: { onChanged: () => void }) {
  const { authenticated } = useActiveWallet();
  const { state, run } = useTx();
  const [repo, setRepo] = useState("");
  const [amount, setAmount] = useState("");

  async function submit() {
    let value: bigint;
    try {
      value = parseGen(amount);
    } catch {
      return;
    }
    const hash = await run("Staking", "underwrite", { args: [repo.trim()], value });
    if (hash) onChanged();
  }

  return (
    <Card className="-rotate-2 p-6 md:p-8 transition-transform duration-100 hover:-rotate-1" radius={WOBBLY.a} decoration="tape">
      <PanelHead
        icon={<Coins strokeWidth={2.5} className="h-7 w-7" />}
        title="Underwrite a pool"
        hint="Stake GEN, earn premiums, carry risk."
        variant={0}
      />
      <div className="space-y-4">
        <Input label="Repository" placeholder="owner/name" value={repo} onChange={(e) => setRepo(e.target.value)} />
        <Input label="Stake" placeholder="100" suffix="GEN" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
      </div>
      <Button className="mt-6 w-full" disabled={!authenticated || state.status === "pending"} onClick={submit}>
        {authenticated ? "Stake into pool" : "Connect to stake"}
      </Button>
      <StatusLine state={state} />
    </Card>
  );
}

function BuyPolicy({ onChanged }: { onChanged: () => void }) {
  const { authenticated } = useActiveWallet();
  const { state, run } = useTx();
  const [repo, setRepo] = useState("");
  const [coverage, setCoverage] = useState("");
  const [days, setDays] = useState("90");
  const [premium, setPremium] = useState("");

  async function submit() {
    let cover: bigint, prem: bigint, d: bigint;
    try {
      cover = parseGen(coverage);
      prem = parseGen(premium);
      d = BigInt(parseInt(days || "0", 10));
    } catch {
      return;
    }
    const hash = await run("Buying policy", "buy_policy", {
      args: [repo.trim(), cover, d],
      value: prem,
    });
    if (hash) onChanged();
  }

  return (
    <Card className="rotate-2 p-6 md:p-8 transition-transform duration-100 hover:rotate-1" radius={WOBBLY.b} postit decoration="tack">
      <PanelHead
        icon={<ShieldPlus strokeWidth={2.5} className="h-7 w-7" />}
        title="Insure a dependency"
        hint="Pay a premium for abandonment coverage."
        variant={1}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input label="Repository" placeholder="owner/name" value={repo} onChange={(e) => setRepo(e.target.value)} />
        </div>
        <Input label="Coverage" placeholder="10" suffix="GEN" value={coverage} onChange={(e) => setCoverage(e.target.value)} inputMode="decimal" />
        <Input label="Premium" placeholder="1" suffix="GEN" value={premium} onChange={(e) => setPremium(e.target.value)} inputMode="decimal" />
        <Input label="Duration" placeholder="90" suffix="days" value={days} onChange={(e) => setDays(e.target.value)} inputMode="numeric" />
      </div>
      <Button className="mt-6 w-full" disabled={!authenticated || state.status === "pending"} onClick={submit}>
        {authenticated ? "Buy coverage" : "Connect to insure"}
      </Button>
      <StatusLine state={state} />
    </Card>
  );
}

function FileClaim({ onChanged }: { onChanged: () => void }) {
  const { authenticated } = useActiveWallet();
  const { state, run } = useTx();
  const [repo, setRepo] = useState("");

  async function submit() {
    const hash = await run("Filing claim (validators adjudicating)", "file_claim", { args: [repo.trim()] });
    if (hash) onChanged();
  }

  return (
    <Card className="rotate-1 p-6 md:p-8 transition-transform duration-100 hover:-rotate-1" radius={WOBBLY.c}>
      <PanelHead
        icon={<Gavel strokeWidth={2.5} className="h-7 w-7" />}
        title="File a claim"
        hint="Validators read GitHub & vote on a tier."
        variant={2}
      />
      <Input label="Repository" placeholder="owner/name" value={repo} onChange={(e) => setRepo(e.target.value)} />
      <p className="mt-3 text-base md:text-lg text-ink/60">
        If the verdict is <b>abandoned</b>, your coverage is paid out automatically.
        Adjudication can take a little while.
      </p>
      <Button className="mt-5 w-full" disabled={!authenticated || state.status === "pending"} onClick={submit}>
        {authenticated ? "Adjudicate & settle" : "Connect to claim"}
      </Button>
      <StatusLine state={state} />
    </Card>
  );
}

function MyPosition() {
  const { address } = useActiveWallet();
  const [repo, setRepo] = useState("");
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [shares, setShares] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");

  async function lookup() {
    setMsg("");
    setPolicy(null);
    setShares(null);
    if (!address) {
      setMsg("Connect your wallet first.");
      return;
    }
    const r = repo.trim();
    try {
      const sh = await api.getShares(r, address);
      setShares(sh);
    } catch {
      /* no shares */
    }
    try {
      const p = await api.getPolicy(r, address);
      setPolicy(p);
    } catch {
      setMsg("No policy found for this wallet on that repo.");
    }
  }

  return (
    <Card className="-rotate-1 p-6 md:p-8 transition-transform duration-100 hover:rotate-1" radius={WOBBLY.a}>
      <PanelHead
        icon={<Search strokeWidth={2.5} className="h-7 w-7" />}
        title="My position"
        hint="Look up your policy & underwriting shares."
        variant={3}
      />
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input label="Repository" placeholder="owner/name" value={repo} onChange={(e) => setRepo(e.target.value)} />
        </div>
        <Button variant="secondary" onClick={lookup}>Check</Button>
      </div>

      {shares && shares !== "0" && (
        <p className="mt-4 text-lg">Underwriting shares: <b className="font-head text-xl">{formatGen(shares)}</b></p>
      )}
      {policy && (
        <dl className="mt-3 space-y-1 text-lg">
          <Line k="Coverage" v={`${formatGen(policy.coverage_wei)} GEN`} />
          <Line k="Status" v={policy.status} />
          <Line k="Last verdict" v={policy.verdict || "--"} />
        </dl>
      )}
      {msg && <p className="mt-3 text-base text-ink/60">{msg}</p>}
    </Card>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-dashed border-ink/25 pb-1">
      <dt className="text-ink/60">{k}</dt>
      <dd className="font-head">{v}</dd>
    </div>
  );
}
