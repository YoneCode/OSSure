<div align="center">

<img src="frontend/public/logo.svg" alt="OSSure" width="96" height="96" />

# OSSure

### Trustless parametric insurance for open source dependencies

Underwrite a pool. Insure a public GitHub project against abandonment. Settle claims on-chain via GenLayer validator consensus, from real public evidence. No insurer, no oracle.

[![Network](https://img.shields.io/badge/Network-Testnet%20Bradbury-2d5da1?style=for-the-badge)](https://explorer-bradbury.genlayer.com)
[![Contract](https://img.shields.io/badge/Contract-0x3Ed6...91AC-2d2d2d?style=for-the-badge)](https://explorer-bradbury.genlayer.com/address/0x3Ed60410f60BF9E58845a7Ac020cCE52e00b91AC)
[![Built on GenLayer](https://img.shields.io/badge/Built%20on-GenLayer-ff4d4d?style=for-the-badge)](https://docs.genlayer.com)

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Privy](https://img.shields.io/badge/Auth-Privy-1F1F1F)](https://privy.io)

[![GitHub](https://img.shields.io/badge/GitHub-YoneCode%2FOSSure-181717?logo=github)](https://github.com/YoneCode/OSSure)
[![X](https://img.shields.io/badge/X-%40YoneCode-000?logo=x)](https://x.com/YoneCode)

</div>

---

## Live protocol stats

Pulled directly from the contract on Testnet Bradbury at the time of this commit.

| Metric              | Value           |
|---------------------|-----------------|
| Pools               | **5**           |
| Policies (total)    | **5**           |
| Active policies     | **4**           |
| Claims paid         | **1**           |
| Total GEN staked    | **4.975 GEN**   |
| Total GEN locked    | **2.0 GEN**     |
| Protocol fee        | **5.00%** (500 bps, capped at 20%) |
| Abandonment rule    | `archived = true` **OR** (`days_since_release > 540` **AND** `days_since_push > 365`) |

### Real Bradbury transactions

The first deployment + a real, fully-on-chain claim cycle on `moment/moment` (verdict `abandoned`, coverage paid out by the contract).

| Action | Tx | Result |
|---|---|---|
| Deploy contract | [`0x510644…f0c9`](https://explorer-bradbury.genlayer.com/tx/0x510644142447f60ff951b1c2ef4080bdd21ced68e0a361fd641a24e888b2f0c9) | Address `0x3Ed6…91AC` |
| Underwrite `moment/moment` | [`0x473732…d505`](https://explorer-bradbury.genlayer.com/tx/0x47373222b5efda00ceb613e6b18f5490c5c86e18db3e5aee280e0b5ace92d505) | 1 GEN staked |
| Buy policy | [`0x1e35ac…8108`](https://explorer-bradbury.genlayer.com/tx/0x1e35aceff53bef711da755df8a3780b13a8a0c888dfcce18994bb4cd9d4e8108) | 0.5 GEN coverage, 0.1 GEN premium |
| **File claim → ABANDONED → payout** | [**`0xab2262…2af51`**](https://explorer-bradbury.genlayer.com/tx/0xab2262546418de9f8eb3428f4b5bc14347567e0946193d32f429d1e308b2af51) | 0.5 GEN paid out from the pool |

### Insured dependencies (current state on chain)

| Repo | Backing | Available | Locked | Premiums |
|---|---:|---:|---:|---:|
| [`facebook/react`](https://github.com/facebook/react) | 1.095 GEN | 0.595 | 0.500 | 0.100 |
| [`expressjs/express`](https://github.com/expressjs/express) | 1.095 GEN | 0.595 | 0.500 | 0.100 |
| [`moment/moment`](https://github.com/moment/moment) | 0.595 GEN | 0.595 | 0.000 | 0.100 |
| [`request/request`](https://github.com/request/request) | 1.095 GEN | 0.595 | 0.500 | 0.100 |
| [`bower/bower`](https://github.com/bower/bower) | 1.095 GEN | 0.595 | 0.500 | 0.100 |

> The `moment/moment` pool's locked column is `0` because that policy was already settled as `abandoned` and paid out.

---

## How it works

```
1. Underwriter   → stakes GEN into a per-repo pool (mints proportional shares).
2. Policyholder  → pays a premium to insure a coverage amount for N days.
3. Claim filed   → GenLayer validators each fetch:
                       • https://api.github.com/repos/<repo>            (archived, pushed_at)
                       • https://api.github.com/repos/<repo>/releases/latest
                   Code derives stable facts (days since push/release).
                   An LLM is grounded with those facts and assigns a tier.
                   Validators must agree on the tier (the bounded decision field).
4. Settlement    → if tier == "abandoned": coverage paid from pool to holder.
                   Otherwise: claim denied, policy stays in force until expiry.
```

What needs GenLayer is the **judgement** ("is this dependency abandoned?") -- it cannot be reduced to one deterministic API field, and a centralized insurer adjudicating its own payouts is a conflict of interest. Validators independently re-fetch the public evidence and vote on a single bounded `tier` field; payouts are deterministic code that runs only after consensus.

---

## Tech stack

**Intelligent Contract** (Python on GenLayer GenVM)
- Pinned runner: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`
- `gl.vm.run_nondet_unsafe(leader_fn, validator_fn)` for adjudication
- `gl.nondet.web.get` for public GitHub evidence
- `gl.nondet.exec_prompt(..., response_format="json")` grounded with code-verified facts
- `gl.get_contract_at(holder).emit_transfer(value=u256(amount), on="finalized")` for payouts

**Deployment + scripting** (Node)
- [`genlayer-js`](https://github.com/genlayerlabs/genlayer-js) `1.1.8` -- `createClient`, `createAccount`, `deployContract`, `writeContract`, `readContract`
- `testnetBradbury` chain config

**Frontend**
- Vite + React 18 + TypeScript (strict)
- Tailwind v3, hand-drawn design system, custom SVG decorations
- [Privy](https://privy.io) wallet connect (email + injected wallet)
- `genlayer-js` for reads (chain-only client) and writes (Privy EIP-1193 provider, then `client.connect("testnetBradbury")` before signing)

**Testing**
- `genvm-linter` for static contract validation
- `genlayer-test` direct-mode unit tests with `mock_web` / `mock_llm`

---

## Repository

```
contracts/         Intelligent Contract (dep_guard.py)
deploy/            genlayer-js deploy + seed scripts (Bradbury)
tests/direct/      Fast in-memory tests (genlayer-test, no server needed)
frontend/          Vite + React + Tailwind dapp
gltest.config.yaml gltest configuration (default: testnet_bradbury)
```

---

## Develop

### Contract

```bash
# Python toolchain (3.12)
. .venv/bin/activate
genvm-lint check contracts/dep_guard.py     # static validation
python -m pytest tests/direct/ -q            # in-memory tests
```

### Deploy / seed

```bash
cd deploy
npm ci
node deploy.mjs    # prints the deployed contract address
node seed.mjs      # underwrite + insure 5 real GitHub repos, then file 1 abandoned claim
```

### Frontend

```bash
cd frontend
npm ci
npm run build      # production build into dist/
```

---

## Cloudflare Pages deploy

| Setting          | Value              |
|------------------|--------------------|
| Root directory   | `frontend`         |
| Build command    | `npm run build`    |
| Output directory | `dist`             |
| `NODE_VERSION`   | `20`               |
| Env vars         | `VITE_PRIVY_APP_ID`, `VITE_CONTRACT_ADDRESS` |

Cloudflare's build uses `npm ci`, so `package-lock.json` must stay in sync. `frontend/public/_headers` ships `Cache-Control: no-store` for `index.html` and `immutable` for hashed assets.

---

## Security

- Secrets live only in `.env` files (git-ignored). Never commit private keys.
- Public GitHub evidence only -- private repos cannot be validated trustlessly because each validator must independently fetch the same evidence.
- Payouts are emitted on `finalized` only, so consensus appeals can't strand or double-spend funds.
- Underwriter stake can never be withdrawn below the pool's locked coverage (`available_wei` invariant enforced in the contract).

---

## Author

[![X](https://img.shields.io/badge/X-%40YoneCode-000?logo=x&logoColor=white&style=for-the-badge)](https://x.com/YoneCode)
[![GitHub](https://img.shields.io/badge/GitHub-YoneCode-181717?logo=github&style=for-the-badge)](https://github.com/YoneCode)
