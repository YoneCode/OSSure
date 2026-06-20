# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""OSSure — trustless parametric insurance against open-source dependency
abandonment.

Engineering teams insure a critical public dependency (a GitHub repo). Underwriters
stake native GEN into a per-repo pool and earn premiums. When a policyholder files a
claim, GenLayer validators independently fetch the dependency's public GitHub
evidence, ground an LLM with deterministic facts (archival status, time since last
release/push), and reach consensus on a single bounded decision field: a maintenance
tier of "healthy", "at_risk", or "abandoned". If the consensus verdict is
"abandoned", the contract pays the coverage amount from the pool to the policyholder.

The subjective, evidence-based judgement ("is this project abandoned?") is the part
that genuinely needs GenLayer: it cannot be reduced to a single deterministic API
field, and a centralized insurer adjudicating its own payouts is a conflict of
interest. Everything that moves money is deterministic and runs only after consensus.

Underwriter economics use a share model (mirroring GenLayer's own staking): premiums
increase the stake-per-share, payouts decrease it. Underwriters carry the risk and
earn the yield.
"""

from genlayer import *

import json
import re
import typing
from dataclasses import dataclass
from datetime import datetime, timezone

# --- Error classification (compared by validators to decide agreement) --------
ERROR_EXPECTED = "[EXPECTED]"   # business-logic error, deterministic, must match
ERROR_EXTERNAL = "[EXTERNAL]"   # external 4xx, deterministic, must match
ERROR_TRANSIENT = "[TRANSIENT]"  # network/5xx, non-deterministic, both => agree
ERROR_LLM = "[LLM_ERROR]"       # malformed model output, disagree to force rotation

# --- Policy lifecycle states (stored as plain strings, never enums) -----------
STATUS_ACTIVE = "ACTIVE"    # coverage in force
STATUS_PAID = "PAID"        # abandonment adjudicated, coverage paid out
STATUS_DENIED = "DENIED"    # claim filed, dependency not abandoned (re-fileable)
STATUS_EXPIRED = "EXPIRED"  # coverage lapsed without payout

# --- Maintenance tiers (the bounded consensus decision field) -----------------
TIER_HEALTHY = "healthy"
TIER_AT_RISK = "at_risk"
TIER_ABANDONED = "abandoned"
VALID_TIERS = (TIER_HEALTHY, TIER_AT_RISK, TIER_ABANDONED)

# --- Abandonment criteria (encoded so the judgement is bounded, not open) ------
ABANDON_RELEASE_DAYS = 540   # > ~18 months since last release
ABANDON_PUSH_DAYS = 365      # AND > 12 months since last push
ATRISK_RELEASE_DAYS = 270    # > 9 months since last release
ATRISK_PUSH_DAYS = 180       # OR > 6 months since last push

MAX_FEE_BPS = 2000           # protocol fee on premiums capped at 20%
SECONDS_PER_DAY = 86400


@allow_storage
@dataclass
class Pool:
    repo: str
    total_stake: u256    # GEN backing this repo, in wei (1 GEN = 1e18 wei)
    total_shares: u256   # underwriter shares outstanding
    locked: u256         # wei reserved against active coverage
    premium_income: u256  # cumulative premiums received (informational)


@allow_storage
@dataclass
class Policy:
    holder: Address
    repo: str
    coverage: u256       # payout amount if abandoned, in wei
    premium: u256        # premium paid, in wei
    start: u256          # unix seconds
    expiry: u256         # unix seconds
    status: str
    verdict: str         # last adjudicated tier ("" until first claim)
    last_checked: u256   # unix seconds of last adjudication


def _now() -> int:
    return int(datetime.now(timezone.utc).timestamp())


def _skey(repo: str, addr: Address) -> str:
    """Composite key for per-(repo, address) records."""
    return repo + "|" + addr.as_hex


def _parse_json(text: typing.Any) -> dict:
    """Best-effort extraction of a JSON object from an LLM text response."""
    if isinstance(text, dict):
        return text
    if not isinstance(text, str):
        raise gl.vm.UserError(f"{ERROR_LLM} model returned non-text: {type(text)}")
    first = text.find("{")
    last = text.rfind("}")
    if first == -1 or last == -1 or last <= first:
        raise gl.vm.UserError(f"{ERROR_LLM} no JSON object in model output")
    blob = text[first : last + 1]
    blob = re.sub(r",(?!\s*?[\{\[\"'\w])", "", blob)  # strip trailing commas
    try:
        return json.loads(blob)
    except Exception:
        raise gl.vm.UserError(f"{ERROR_LLM} unparseable JSON from model")


def _tier_of(data: dict) -> str:
    """Reduce a model response to the single stable consensus field."""
    if not isinstance(data, dict):
        raise gl.vm.UserError(f"{ERROR_LLM} expected JSON object, got {type(data)}")
    raw = data.get("tier")
    if raw is None:
        for alt in ("classification", "status", "label", "result"):
            if alt in data:
                raw = data[alt]
                break
    tier = str(raw).strip().lower() if raw is not None else ""
    if tier not in VALID_TIERS:
        raise gl.vm.UserError(f"{ERROR_LLM} invalid tier: {raw}")
    return tier


def _days_since(iso: str, now_unix: int) -> int:
    """Whole days between an ISO-8601 timestamp and now. Missing => very large."""
    if not iso:
        return 99999
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        return max(0, (now_unix - int(dt.timestamp())) // SECONDS_PER_DAY)
    except Exception:
        return 99999


class DepGuard(gl.Contract):
    owner: Address
    fee_wallet: Address
    fee_bps: u256
    pools: TreeMap[str, Pool]
    shares: TreeMap[str, u256]        # key: _skey(repo, underwriter)
    policies: TreeMap[str, Policy]    # key: _skey(repo, holder)
    repo_list: DynArray[str]
    policy_keys: DynArray[str]

    def __init__(self, fee_wallet: str, fee_bps: int):
        if fee_bps < 0 or fee_bps > MAX_FEE_BPS:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} fee_bps out of range")
        self.owner = gl.message.sender_address
        self.fee_wallet = Address(fee_wallet)
        self.fee_bps = u256(fee_bps)

    # ----------------------------------------------------------- underwriting
    @gl.public.write.payable
    def underwrite(self, repo: str) -> None:
        """Stake native GEN into a repo's pool; receive proportional shares."""
        repo = _norm_repo(repo)
        value = int(gl.message.value)
        if value <= 0:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} stake must be positive")

        if repo not in self.pools:
            self.pools[repo] = Pool(
                repo=repo,
                total_stake=u256(0),
                total_shares=u256(0),
                locked=u256(0),
                premium_income=u256(0),
            )
            self.repo_list.append(repo)
        # Fetch the storage view AFTER insertion so mutations write through.
        pool = self.pools[repo]

        total_stake = int(pool.total_stake)
        total_shares = int(pool.total_shares)
        # 1:1 for the first stake; otherwise proportional to current share price.
        if total_shares == 0 or total_stake == 0:
            minted = value
        else:
            minted = (value * total_shares) // total_stake
        if minted <= 0:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} stake too small to mint shares")

        pool.total_stake = u256(total_stake + value)
        pool.total_shares = u256(total_shares + minted)

        k = _skey(repo, gl.message.sender_address)
        self.shares[k] = u256(int(self.shares.get(k, u256(0))) + minted)

    @gl.public.write
    def withdraw_stake(self, repo: str, share_amount: u256) -> None:
        """Burn shares and withdraw the backing GEN, never below locked capacity."""
        repo = _norm_repo(repo)
        pool = self._require_pool(repo)
        k = _skey(repo, gl.message.sender_address)
        owned = int(self.shares.get(k, u256(0)))
        burn = int(share_amount)
        if burn <= 0 or burn > owned:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} invalid share amount")

        total_stake = int(pool.total_stake)
        total_shares = int(pool.total_shares)
        amount = (burn * total_stake) // total_shares
        available = total_stake - int(pool.locked)
        if amount > available:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} amount exceeds unlocked capacity")

        pool.total_stake = u256(total_stake - amount)
        pool.total_shares = u256(total_shares - burn)
        self.shares[k] = u256(owned - burn)
        self._pay(gl.message.sender_address, amount)

    # --------------------------------------------------------------- coverage
    @gl.public.write.payable
    def buy_policy(self, repo: str, coverage: u256, duration_days: u256) -> None:
        """Pay a premium to insure `coverage` wei against abandonment of `repo`."""
        repo = _norm_repo(repo)
        premium = int(gl.message.value)
        cover = int(coverage)
        days = int(duration_days)
        if premium <= 0:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} premium required")
        if cover <= 0:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} coverage must be positive")
        if days <= 0:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} duration must be positive")

        pool = self._require_pool(repo)
        available = int(pool.total_stake) - int(pool.locked)
        if cover > available:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} insufficient pool capacity")

        key = _skey(repo, gl.message.sender_address)
        existing = self.policies.get(key)
        if existing is not None and existing.status == STATUS_ACTIVE:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} active policy already exists")

        # Protocol fee on the premium; remainder accrues to underwriters by raising
        # the pool's stake-per-share.
        fee = (premium * int(self.fee_bps)) // 10000
        to_pool = premium - fee
        pool.total_stake = u256(int(pool.total_stake) + to_pool)
        pool.locked = u256(int(pool.locked) + cover)
        pool.premium_income = u256(int(pool.premium_income) + premium)

        now = _now()
        self.policies[key] = Policy(
            holder=gl.message.sender_address,
            repo=repo,
            coverage=u256(cover),
            premium=u256(premium),
            start=u256(now),
            expiry=u256(now + days * SECONDS_PER_DAY),
            status=STATUS_ACTIVE,
            verdict="",
            last_checked=u256(0),
        )
        if existing is None:
            self.policy_keys.append(key)

        if fee > 0:
            self._pay(self.fee_wallet, fee)

    @gl.public.write
    def expire_policy(self, repo: str, holder: str) -> None:
        """Free locked capacity for a policy whose term has ended without payout."""
        repo = _norm_repo(repo)
        key = _skey(repo, Address(holder))
        policy = self._require_policy(key)
        if policy.status != STATUS_ACTIVE:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} policy not active")
        if _now() < int(policy.expiry):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} policy not yet expired")
        pool = self._require_pool(repo)
        pool.locked = u256(int(pool.locked) - int(policy.coverage))
        policy.status = STATUS_EXPIRED

    # ----------------------------------------------------- claim adjudication
    @gl.public.write
    def file_claim(self, repo: str) -> None:
        """Adjudicate abandonment from public GitHub evidence and settle if abandoned.

        Validators each fetch the same public GitHub endpoints, derive the same
        deterministic facts, ground the LLM with them, and agree only on the bounded
        `tier` decision field. Funds move only after consensus, in deterministic code.
        """
        repo = _norm_repo(repo)
        key = _skey(repo, gl.message.sender_address)
        policy = self._require_policy(key)
        if policy.status != STATUS_ACTIVE:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} no active policy")
        now = _now()
        if now > int(policy.expiry):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} policy expired")

        api = "https://api.github.com/repos/" + repo

        def leader_fn() -> dict:
            res = gl.nondet.web.get(api)
            if res.status == 404:
                raise gl.vm.UserError(f"{ERROR_EXTERNAL} repo not found: {repo}")
            if res.status == 403 or res.status == 429:
                raise gl.vm.UserError(f"{ERROR_TRANSIENT} github rate limited")
            if res.status >= 500:
                raise gl.vm.UserError(f"{ERROR_TRANSIENT} github unavailable")
            if res.status != 200:
                raise gl.vm.UserError(f"{ERROR_EXTERNAL} github status {res.status}")
            data = json.loads(res.body.decode("utf-8"))

            # Stable, objective facts only (no star/fork counts, no updated_at noise).
            archived = bool(data.get("archived", False))
            days_since_push = _days_since(str(data.get("pushed_at", "")), now)

            rel = gl.nondet.web.get(api + "/releases/latest")
            if rel.status == 200:
                rdata = json.loads(rel.body.decode("utf-8"))
                days_since_release = _days_since(str(rdata.get("published_at", "")), now)
            elif rel.status == 404:
                days_since_release = 99999  # no releases ever published
            elif rel.status in (403, 429) or rel.status >= 500:
                raise gl.vm.UserError(f"{ERROR_TRANSIENT} github releases unavailable")
            else:
                raise gl.vm.UserError(f"{ERROR_EXTERNAL} releases status {rel.status}")

            facts = {
                "archived": archived,
                "days_since_push": days_since_push,
                "days_since_release": days_since_release,
            }
            prompt = (
                "You classify open-source maintenance health for an insurance "
                "payout decision. Use the VERIFIED FACTS below as ground truth. "
                "Do not override them with guesses.\n\n"
                f"Repository: {repo}\n"
                f"Verified facts: {json.dumps(facts)}\n\n"
                "Apply these rules in order:\n"
                f'- "abandoned" if archived is true, OR '
                f"(days_since_release > {ABANDON_RELEASE_DAYS} AND "
                f"days_since_push > {ABANDON_PUSH_DAYS}).\n"
                f'- "at_risk" if days_since_release > {ATRISK_RELEASE_DAYS} '
                f"OR days_since_push > {ATRISK_PUSH_DAYS}.\n"
                '- "healthy" otherwise.\n\n'
                'Respond with ONLY a JSON object, no prose:\n'
                '{"tier": "healthy|at_risk|abandoned", '
                '"reasoning": "<one sentence>"}'
            )
            res_llm = gl.nondet.exec_prompt(prompt, response_format="json")
            parsed = _parse_json(res_llm)
            tier = _tier_of(parsed)
            return {
                "tier": tier,
                "archived": archived,
                "days_since_release": days_since_release,
                "days_since_push": days_since_push,
                "reasoning": str(parsed.get("reasoning", ""))[:300],
            }

        def validator_fn(leaders_res: gl.vm.Result) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return self._agree_on_error(leaders_res, leader_fn)
            try:
                mine = leader_fn()
                my_tier = mine["tier"]
                ld_tier = _tier_of(leaders_res.calldata)
            except gl.vm.UserError:
                return False
            # Agree only on the bounded decision field.
            return my_tier == ld_tier

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

        # --- deterministic settlement (post-consensus) ------------------------
        tier = _tier_of(result)
        policy.verdict = tier
        policy.last_checked = u256(now)

        if tier == TIER_ABANDONED:
            pool = self._require_pool(repo)
            cover = int(policy.coverage)
            pool.total_stake = u256(int(pool.total_stake) - cover)
            pool.locked = u256(int(pool.locked) - cover)
            policy.status = STATUS_PAID
            self._pay(policy.holder, cover)
        else:
            # Claim denied for now; coverage stays in force until expiry so the
            # holder can re-file if the dependency later deteriorates.
            policy.status = STATUS_ACTIVE

    # ------------------------------------------------------------------- views
    @gl.public.view
    def get_pool(self, repo: str) -> dict:
        return self._pool_dict(self._require_pool(_norm_repo(repo)))

    @gl.public.view
    def get_pools(self) -> list:
        return [self._pool_dict(self.pools[r]) for r in self.repo_list]

    @gl.public.view
    def get_policy(self, repo: str, holder: str) -> dict:
        key = _skey(_norm_repo(repo), Address(holder))
        return self._policy_dict(self._require_policy(key))

    @gl.public.view
    def get_shares(self, repo: str, underwriter: str) -> str:
        k = _skey(_norm_repo(repo), Address(underwriter))
        return str(int(self.shares.get(k, u256(0))))

    @gl.public.view
    def get_config(self) -> dict:
        return {
            "owner": self.owner.as_hex,
            "fee_wallet": self.fee_wallet.as_hex,
            "fee_bps": int(self.fee_bps),
            "abandon_release_days": ABANDON_RELEASE_DAYS,
            "abandon_push_days": ABANDON_PUSH_DAYS,
        }

    @gl.public.view
    def get_stats(self) -> dict:
        total_staked = 0
        total_locked = 0
        for r in self.repo_list:
            p = self.pools[r]
            total_staked += int(p.total_stake)
            total_locked += int(p.locked)
        active = 0
        paid = 0
        for key in self.policy_keys:
            pol = self.policies[key]
            if pol.status == STATUS_ACTIVE:
                active += 1
            elif pol.status == STATUS_PAID:
                paid += 1
        return {
            "pools": len(self.repo_list),
            "policies": len(self.policy_keys),
            "active_policies": active,
            "paid_claims": paid,
            "total_staked_wei": str(total_staked),
            "total_locked_wei": str(total_locked),
        }

    # --------------------------------------------------------------- internals
    def _require_pool(self, repo: str) -> Pool:
        if repo not in self.pools:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} pool not found")
        return self.pools[repo]

    def _require_policy(self, key: str) -> Policy:
        if key not in self.policies:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} policy not found")
        return self.policies[key]

    def _pay(self, to: Address, amount: int) -> None:
        if amount > 0:
            gl.get_contract_at(to).emit_transfer(value=u256(amount), on="finalized")

    def _agree_on_error(self, leaders_res: gl.vm.Result, leader_fn) -> bool:
        leader_msg = getattr(leaders_res, "message", "") or ""
        try:
            leader_fn()
            return False  # leader errored, validator succeeded -> disagree
        except gl.vm.UserError as e:
            validator_msg = getattr(e, "message", "") or str(e)
            if validator_msg.startswith(ERROR_EXPECTED) or validator_msg.startswith(
                ERROR_EXTERNAL
            ):
                return validator_msg == leader_msg
            if validator_msg.startswith(ERROR_TRANSIENT) and leader_msg.startswith(
                ERROR_TRANSIENT
            ):
                return True
            return False
        except Exception:
            return False

    def _pool_dict(self, p: Pool) -> dict:
        total_stake = int(p.total_stake)
        total_shares = int(p.total_shares)
        return {
            "repo": p.repo,
            "total_stake_wei": str(total_stake),
            "total_shares": str(total_shares),
            "locked_wei": str(int(p.locked)),
            "available_wei": str(total_stake - int(p.locked)),
            "premium_income_wei": str(int(p.premium_income)),
        }

    def _policy_dict(self, a: Policy) -> dict:
        return {
            "holder": a.holder.as_hex,
            "repo": a.repo,
            "coverage_wei": str(int(a.coverage)),
            "premium_wei": str(int(a.premium)),
            "start": int(a.start),
            "expiry": int(a.expiry),
            "status": a.status,
            "verdict": a.verdict,
            "last_checked": int(a.last_checked),
        }


def _norm_repo(repo: str) -> str:
    """Normalize a repo identifier to `owner/name`, rejecting anything malformed."""
    if not isinstance(repo, str):
        raise gl.vm.UserError(f"{ERROR_EXPECTED} repo must be a string")
    r = repo.strip().strip("/")
    parts = r.split("/")
    if len(parts) != 2 or not parts[0] or not parts[1]:
        raise gl.vm.UserError(f"{ERROR_EXPECTED} repo must be 'owner/name'")
    return parts[0] + "/" + parts[1]
