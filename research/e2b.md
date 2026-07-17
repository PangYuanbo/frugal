# Research archive: e2b

Raw dual-engine research output (2026-07-17). Engine A = Claude subagent with web search; Engine B = grok CLI (`grok -p`, web search enabled). The merged factsheet cross-checks both, preferring official pricing pages on conflicts.

## Merged factsheet (cross-checked)

```json
{
  "provider": "E2B",
  "billing_dimensions": [
    "Compute time of RUNNING sandboxes only, billed per second: vCPU-seconds at $0.000014/vCPU/s ($0.0504/vCPU/hr); tiers 1/2/4/6/8 vCPU = $0.000014/$0.000028/$0.000056/$0.000084/$0.000112 per s",
    "RAM GiB-seconds at $0.0000045/GiB/s ($0.0162/GiB/hr), configurable 512 MiB-8,192 MiB; default sandbox = 2 vCPU + 512 MiB ~= $0.109/hr",
    "Billing stops the moment a sandbox is paused, killed, or times out; paused snapshots cost $0 compute",
    "Flat plan base fee (Pro $150/mo) buys LIMITS only, not credits; usage billed on top, charged at start of each month for prior month",
    "Storage: free allowance only (10 GiB Hobby / 20 GiB Pro); no published self-serve per-GiB overage - more is contact-us",
    "Concurrency add-ons as flat monthly fees (Pro+ +$500/mo for 600, Pro++ +$1,000/mo for 1,100)",
    "NOT metered: egress/bandwidth, API requests, seats, per-sandbox-create fees, template builds (concurrency limit only)"
  ],
  "free_tier": "Hobby: $0/mo, no credit card to start, ONE-TIME $100 usage credit (never refills). Limits: 1-hour max continuous session, 20 concurrent running sandboxes, 1 sandbox created/sec, 20 concurrent template builds, max 8 vCPU + 8 GB RAM per sandbox, 10 GiB storage. Same per-second rates as Pro. $100 at default size (2 vCPU + 512 MiB, ~$0.1089/hr) ~= 918 sandbox-hours (~38 days one always-on box, or ~5,500 ten-minute sessions).",
  "plans": [
    {
      "name": "Hobby",
      "price": "$0/mo + usage",
      "included": "One-time $100 credit; 1h max session; 20 concurrent sandboxes; 1 create/sec; 8 vCPU / 8 GB RAM max; 10 GiB storage; community support",
      "overage": "Pure per-second usage: $0.000014/vCPU/s + $0.0000045/GiB-RAM/s after credit is gone"
    },
    {
      "name": "Pro",
      "price": "$150/mo + usage",
      "included": "NO usage credits (fee buys limits only); 24h max session; 100 concurrent sandboxes; 5 creates/sec; 20 GiB storage; customizable CPU/RAM (8+ via support)",
      "overage": "Same per-second rates as Hobby, no discount"
    },
    {
      "name": "Pro+ (concurrency add-on)",
      "price": "+$500/mo on top of Pro",
      "included": "600 concurrent sandboxes (official pricing.e2b.dev estimator)",
      "overage": "Usage still metered at standard per-second rates"
    },
    {
      "name": "Pro++ (concurrency add-on)",
      "price": "+$1,000/mo on top of Pro",
      "included": "1,100 concurrent sandboxes (official pricing.e2b.dev estimator)",
      "overage": "Usage still metered at standard per-second rates"
    },
    {
      "name": "Enterprise",
      "price": "Custom, $3,000/mo minimum (official pricing.e2b.dev estimator)",
      "included": "1,100+ concurrent, custom session length / CPU / RAM / disk / rate limits, volume discounts and bonus credits",
      "overage": "Custom contract"
    },
    {
      "name": "Startups program (application, not retail)",
      "price": "Pro pricing",
      "included": "Pro plan + $20,000 one-time usage credits for qualifying AI startups (e2b.dev/startups)"
    }
  ],
  "first_quota_blown": "On Hobby the first hard wall is the 1-HOUR SESSION LIMIT: any dev-server/preview/long agent sandbox dies at 60 min (pause/resume resets the window but disrupts live servers). The first COST wall is forgotten running sandboxes eating the $100 credit: one default box left running 24/7 burns ~$2.61/day, and a 2vCPU+4GiB box ~$3.97/day drains the whole credit in ~26 days. Next walls: 20 concurrent sandboxes (~20 users each holding a live preview) and 1 create/sec throttling burst test matrices.",
  "sweet_spots": "Hobby: prototyping, demos, short code-exec/CI sandboxes - until you need >1h sessions, >20 concurrent, >1 create/sec, or the one-time $100 runs out. Pro ($150): any production agent product; required for 24h sessions, 100 concurrent, 5 creates/sec. Pro+/Pro++ (+$500/+$1,000): heavy parallel evals needing 600/1,100 concurrent - add-on fee dominates before raw CPU $ does. Enterprise (>=$3k/mo): 1,100+ concurrent or custom runtime. Always-on default box on Pro ~= $150 + ~$80 usage ~= $230/mo.",
  "traps": [
    "Forgotten running sandboxes: per-second billing until timeout/kill - default box $2.61/day (~$78-80/mo), 2vCPU+4GiB $3.97/day, 8vCPU+8GiB $12.79/day (~$384/mo, more than the Pro fee); 50 leaked boxes for a day ~= $130",
    "set_timeout(24h) 'as insurance' turns every abandoned sandbox into a $2.6-$12.8/day leak; keep the default 5-min timeout and extend only when needed",
    "Idle-while-thinking: sandbox bills during the agent's LLM turns and package installs (npm/pip on boot count as run time - cache deps in custom templates); pause between turns",
    "Polling/health-check loops reset the timeout clock and keep a should-be-dead sandbox billing forever",
    "Snapshot sprawl: paused sandboxes persist INDEFINITELY (no TTL), do not count toward concurrency, and their snapshots eat the 10/20 GiB storage allowance - easy to accumulate thousands silently; reap with `e2b sandbox list --state paused` + kill (keepMemory:false shrinks snapshots)",
    "Pro $150 includes ZERO compute - it only raises limits; all usage is metered on top",
    "Hobby 1h hard stop kills long agent sessions mid-task; even Pro caps continuous runtime at 24h, so always-on product UX needs pause/resume architecture",
    "Egress is unmetered (no published price) but big downloads still burn CPU-seconds and disk allowance",
    "No hard spend ceiling by default - set budget alerts/limits at the dashboard budget page before letting agents provision",
    "Report B claims the account is BLOCKED once the $100 credit is exhausted until a card is added (fail-closed mid-prod risk) - not confirmed on the official pricing page, treat as likely",
    "Auth migration: E2B_ACCESS_TOKEN deprecated - no new tokens after 2026-07-01, all stop working 2026-08-01; use E2B_API_KEY"
  ],
  "usage_check": "Spend is dashboard-only (no CLI/API spend endpoint): https://e2b.dev/dashboard?tab=usage (costs and sandbox-hours), ?tab=budget (spending limits/alerts), ?tab=billing, ?tab=keys. For leak-hunting running/paused resources: `e2b sandbox list --state running --format json` (also --state paused, --limit N, --metadata k=v), kill with `e2b sandbox kill <id>`. Cost estimator: https://pricing.e2b.dev/. CLI install: `npm i -g @e2b/cli` or `brew install e2b`.",
  "keywords": [
    "e2b",
    "e2b sandbox",
    "e2b template",
    "e2b auth",
    "@e2b/cli",
    "@e2b/code-interpreter",
    "e2b_code_interpreter",
    "e2b-code-interpreter",
    "e2b_api_key",
    "e2b_access_token",
    "api.e2b.dev",
    "e2b.dev",
    "e2b.toml",
    "pip install e2b",
    "npm i -g @e2b/cli",
    "npm i e2b",
    "npx e2b",
    "brew install e2b",
    "from e2b"
  ],
  "hint": "E2B free: $100 one-time credit, 1h session cap, 20 concurrent, 1/s creates; default 2vCPU+512MiB~$0.109/hr. Billed per-second while RUNNING - pause/kill idle sandboxes (leak ~$2.61/day). Pro $150/mo buys limits only, no credits.",
  "conflicts": [
    "Concurrency add-on pricing: A said not published; B cited Pro+ 600 concurrent +$500/mo and Pro++ 1,100 +$1,000/mo. WebFetch of official https://pricing.e2b.dev/ confirms both add-ons verbatim - B wins.",
    "Enterprise minimum: A treated ~$3,000/mo as unofficial third-party reporting; WebFetch of official https://pricing.e2b.dev/ shows 'Enterprise requires $3,000/mo minimum' - B wins, number is official.",
    "$100-credit runway at default size: A said ~920 hrs, B said ~918 hrs - rounding only; exact math ($100 / $0.1089/hr) gives ~918 hrs, B's figure kept.",
    "Account blocked when free credits exhaust: claimed only by B; not confirmed by the official pricing page fetch - unresolved, kept as a flagged likely-true trap.",
    "e2b.dev/pricing itself lists no Pro+/Pro++ tiers or Enterprise floor (only 'purchase extra concurrency up to 1,100' and 'contact us') - those numbers live solely on the official estimator pricing.e2b.dev."
  ],
  "sources": [
    "https://e2b.dev/pricing (re-verified via WebFetch 2026-07-17: plans, per-second rates, limits, storage, $100 credit)",
    "https://pricing.e2b.dev/ (official estimator, re-verified via WebFetch 2026-07-17: Pro+ +$500/mo @600, Pro++ +$1,000/mo @1,100, Enterprise $3,000/mo minimum)",
    "https://e2b.dev/docs/billing (per-second billing model, billing cycle, budget alerts, cost tips)",
    "https://e2b.dev/docs/sandbox/persistence (pause/resume, no snapshot TTL, keepMemory)",
    "https://e2b.mintlify.app/docs/faq/paused-sandboxes-concurrency.md (paused sandboxes excluded from concurrency)",
    "https://e2b.mintlify.app/docs/cli/list-sandboxes.md and https://e2b.dev/docs/cli (CLI commands and install)",
    "https://e2b.dev/docs/api-key (API key auth, access-token deprecation 2026-07-01/2026-08-01)",
    "https://e2b.dev/startups ($20,000 startup credits)",
    "Unofficial corroboration only: northflank.com/blog/e2b-vs-vercel-sandbox, beam.cloud/blog/e2b-pricing-explained"
  ]
}
```

## Engine A — Claude web research (raw)

E2B PRICING & QUOTA FACTSHEET — verified against official pages, current as of 2026-07-17

=== 1. METERED BILLING DIMENSIONS ===
E2B bills on exactly one metered dimension: compute time of RUNNING sandboxes, per second, split into vCPU-seconds and RAM GiB-seconds. "You pay per second for compute resources while your sandbox is running." Billing stops immediately when a sandbox is paused, killed, or times out. (https://e2b.dev/docs/billing)
- NOT metered (as of July 2026): egress/bandwidth (no published price), requests/API calls, seats.
- Storage: free allowance per plan (10 GiB Hobby / 20 GiB Pro); NO self-serve per-GiB overage price is published — more storage is "contact us". Paused-sandbox snapshots consume this storage indefinitely (no TTL) but do not incur compute charges. (https://e2b.dev/pricing, https://e2b.dev/docs/billing, https://e2b.dev/docs/sandbox/persistence)
- Plan base fee: flat monthly subscription (Pro $150/mo) that buys LIMITS, not credits — usage is billed on top. Usage is charged automatically at the start of each month for the previous month. (https://e2b.dev/docs/billing)

Metered unit prices (identical on Hobby and Pro) — https://e2b.dev/pricing:
- 1 vCPU: $0.000014/s (= $0.0504/vCPU/hr)
- 2 vCPU (default): $0.000028/s
- 4 vCPU: $0.000056/s
- 6 vCPU: $0.000084/s
- 8 vCPU: $0.000112/s
- RAM: $0.0000045/GiB/s (= $0.0162/GiB/hr), configurable 512 MiB–8,192 MiB (higher on Pro/Enterprise by request)

=== 2. FREE TIER (HOBBY) — EXACT QUOTAS ===
Source: https://e2b.dev/pricing
- $0/mo + usage; ONE-TIME $100 usage credit for new users (not monthly, never refills).
- Max 20 concurrently running sandboxes.
- Max sandbox session length: 1 hour continuous runtime.
- Sandbox creation rate: 1 sandbox/sec.
- Max resources per sandbox: 8 vCPU, 8 GB RAM.
- 10 GiB storage included.
- The $100 credit at default sandbox size (2 vCPU + 512 MiB ≈ $0.109/hr) ≈ ~920 sandbox-hours of default compute.

=== 3. PAID PLANS ===
Source: https://e2b.dev/pricing (verified 2026-07-17)

PRO — $150/mo + usage:
- No included usage credits (the $150 buys limits only — explicitly stated in billing docs).
- Up to 100 concurrent sandboxes included; purchasable concurrency add-ons up to 1,100 (add-on pricing not published — via dashboard/sales).
- Up to 24-hour sandbox session length.
- 5 sandboxes created/sec.
- 20 GiB storage included.
- Higher CPU/RAM configurations available on request.
- Overage/usage unit prices: same per-second rates as above (no discount).

ENTERPRISE ("Ultimate") — custom pricing; third-party reporting cites a ~$3,000/mo minimum (not on the official page — treat as unofficial: https://northflank.com/blog/e2b-vs-vercel-sandbox). Custom limits, longer sessions, dedicated infra.

STARTUPS PROGRAM: Pro plan + $20,000 usage credits for qualifying AI startups (apply via e2b.dev).

Pricing stability note: these rates ($0.000014/vCPU/s, $100 one-time credit, $150 Pro) have been stable for an extended period; no recent price change detected. One real recent change: E2B_ACCESS_TOKEN auth is deprecated — no new tokens after 2026-07-01, all stop working 2026-08-01; use E2B_API_KEY (https://e2b-changelog.framer.website/, https://e2b.dev/docs/api-key).

=== 4. SWEET SPOTS & FIRST QUOTA BLOWN ===
- Hobby fits: prototyping, single-agent dev, CI experiments — until the one-time $100 credit runs out or you need >1h sessions.
- Pro fits: any production agent product; needed as soon as you want sandboxes alive >1 hour, >20 concurrent, or >1 creation/sec.
- For a typical agent-built app the FIRST quota blown on Hobby is almost always the 1-HOUR SESSION LIMIT: a dev-server/preview sandbox for a small web app dies mid-demo after 60 minutes (workaround: pause/resume resets the runtime window, but is disruptive for a live server).
- Second: the 1 sandbox/sec CREATION RATE + 20 CONCURRENT cap — an agent that provisions one sandbox per test/PR/user hits 20 concurrent quickly (e.g., 20 users each with a live preview = hard wall; burst-creating sandboxes for a test matrix throttles at 1/sec).
- The $100 credit itself lasts a while at defaults (~920 hrs) but evaporates in ~26 days if a single 2 vCPU/4 GiB sandbox (~$0.166/hr) is kept alive continuously; ~5 days with five such sandboxes.
- Chatty-DB / auto-deploy patterns don't hit request quotas (none exist) — they hit compute time from keeping sandboxes hot.

=== 5. COST TRAPS FOR AI-AGENT PATTERNS ===
- Forgotten running sandboxes: billing runs per second until timeout/kill. Cost of leaving one sandbox running 24h (verified math from official per-second rates):
  * default 2 vCPU + 512 MiB: (0.000028 + 0.0000045×0.5) × 86,400 ≈ $2.61/day (~$78/mo)
  * 2 vCPU + 4 GiB: ≈ $3.97/day (~$119/mo)
  * max 8 vCPU + 8 GiB: ≈ $12.79/day (~$384/mo — more than the Pro subscription itself)
- Long timeouts as insurance: agents that call set_timeout(24h) "to be safe" turn every abandoned sandbox into a $2.6–$12.8/day leak. Keep default 5-min timeouts; extend only when needed.
- Per-test/per-request provisioning: creating a fresh sandbox per code run is fine (billing is per-second, no per-create fee), but idle time between agent turns is billed — an agent "thinking" for 2 minutes while a sandbox idles pays for those 2 minutes. Pause between turns (sbx.pause()) or kill and resume.
- Snapshot sprawl: paused sandboxes persist INDEFINITELY (no TTL, no auto-expiry) and their filesystem+memory snapshots count against the 10/20 GiB storage allowance until explicitly killed. Paused sandboxes do NOT count toward concurrency ("Only running sandboxes count toward your concurrency limit" — https://e2b.mintlify.app/docs/faq/paused-sandboxes-concurrency.md), which makes it easy to accumulate thousands silently. Build a reaper: `e2b sandbox list --state paused` + kill.
- keepMemory: pause saves RAM+disk by default; keepMemory: false / keep_memory=False saves disk only (smaller snapshot, cold-boot resume). (https://e2b.dev/docs/sandbox/persistence)
- Polling loops that keep a sandbox alive: any activity/setTimeout refresh resets the timeout clock — a health-check loop can keep a "should-be-dead" sandbox billing forever.
- Egress is currently unmetered — large downloads aren't a direct E2B cost trap (unlike most clouds), but big artifacts written to disk eat the storage allowance.
- No hard spend ceiling by default: set budget alerts/spending limits on the dashboard budget page before letting agents provision.

=== 6. CHECKING USAGE / SPEND ===
- Dashboard (primary): https://e2b.dev/dashboard → Usage tab (costs & sandbox-hours), Budget page (spending limits/alerts), Keys tab (API keys). (https://e2b.dev/docs/billing, https://e2b.dev/docs/api-key)
- CLI (running resources, not spend): `e2b sandbox list` — flags: `--state running|paused`, `--format json`, `--limit N`, `--metadata k=v`. Kill leaks with `e2b sandbox kill <id>` (or kill all). Install: `npm i -g @e2b/cli` or `brew install e2b`. (https://e2b.mintlify.app/docs/cli/list-sandboxes.md, https://e2b.dev/docs/cli)
- API: REST API at api.e2b.dev authenticated with `X-API-Key: e2b_...` can list sandboxes (GET /sandboxes); no public spend endpoint — spend is dashboard-only. (https://e2b.dev/docs/api-key)
- No CLI command exists for billing/spend figures — use the dashboard usage tab.

=== 7. KEYWORD TRIGGERS ===
Shell/code strings indicating E2B is in play: "e2b", "e2b sandbox", "e2b template", "e2b auth", "@e2b/cli", "@e2b/code-interpreter", "e2b_code_interpreter" (Python pkg), "E2B_API_KEY", "E2B_ACCESS_TOKEN" (deprecated), "api.e2b.dev", "e2b.dev/dashboard", "e2b.toml" (template config), "brew install e2b", "npm i -g @e2b/cli", "pip install e2b".

SOURCES
- https://e2b.dev/pricing (plans, per-second rates, limits, storage, credits)
- https://e2b.dev/docs/billing (billing model, monitoring, budget alerts, billing cycle)
- https://e2b.dev/docs/sandbox (session length 1h/24h, timeout behavior)
- https://e2b.dev/docs/sandbox/persistence (pause/resume, no TTL, keepMemory)
- https://e2b.mintlify.app/docs/cli/list-sandboxes.md (CLI list command)
- https://e2b.mintlify.app/docs/faq/paused-sandboxes-concurrency.md (paused sandboxes excluded from concurrency)
- https://e2b.dev/docs/api-key (dashboard/keys, access-token deprecation dates)
- https://e2b.dev/docs/cli (CLI install)
- https://pricing.e2b.dev/ (official workload cost estimator)
- Unofficial corroboration: https://northflank.com/blog/e2b-vs-vercel-sandbox, https://www.beam.cloud/blog/e2b-pricing-explained (enterprise ~$3k/mo minimum, hourly-rate conversions)

## Engine B — grok CLI (raw)

I'll pull E2B's official pricing and docs now and build a July 2026 factsheet from those sources only.# E2B pricing & quota factsheet  
**As of July 2026** · Sources: [e2b.dev/pricing](https://e2b.dev/pricing), [e2b.dev/docs/billing](https://e2b.dev/docs/billing), [pricing.e2b.dev](https://pricing.e2b.dev/)

---

## 1. Metered billing dimensions

| Dimension | Billed? | How |
|---|---|---|
| **Sandbox compute (CPU)** | Yes | Per second, by vCPU count while **running** |
| **Sandbox memory (RAM)** | Yes | Per second × GiB allocated while **running** |
| **Disk (storage in sandbox)** | Included free at tier caps | 10 GiB Hobby / 20 GiB Pro; not a separate $/GB-mo line on public pricing |
| **Egress / bandwidth** | **Not listed** on public pricing | No per-GB egress rate on official pages |
| **API requests** | No | Not a billing dimension |
| **Seats / users** | No | Plan + usage, not per-seat |
| **Template builds** | Concurrent build **limit** only | Not a separate $/build price on public pricing |
| **Paused / killed sandboxes** | **$0** | Billing stops when paused, killed, or timed out |

**Core formula (running only):**  
`cost/s = CPU_rate(vCPUs) + (GiB_RAM × $0.0000045/s)`

CPU rates (Hobby and Pro same):

| vCPUs | $/second | ≈ $/hour |
|---|---:|---:|
| 1 | $0.000014 | $0.0504 |
| **2 (default)** | **$0.000028** | **$0.1008** |
| 4 | $0.000056 | $0.2016 |
| 6 | $0.000084 | $0.3024 |
| 8 | $0.000112 | $0.4032 |

Memory: **$0.0000045 per GiB per second** · even values **512 MiB–8,192 MiB**.  
Default allocation: **2 vCPU + 512 MiB RAM**.

Sources: [pricing](https://e2b.dev/pricing), [billing docs](https://e2b.dev/docs/billing)

---

## 2. Free tier (Hobby) — exact quotas

| Item | Value |
|---|---|
| Base price | **$0/month** |
| Free credits | **$100 one-time** usage credits |
| Credit card | **Not required** to start |
| Max continuous runtime | **1 hour** per sandbox session |
| Concurrent sandboxes | **20** |
| Concurrent template builds | **20** |
| Sandbox creation rate | **1 / second** |
| Max vCPUs | **8** |
| Max memory | **8 GB** |
| Disk size | **10 GB** (free) |
| Support | Community |
| After credits exhausted | Account **blocked** until payment method added |

**What $100 buys at default size (2 vCPU + 512 MiB):**

- Default rate ≈ **$0.00003025/s** = **~$0.1089/hour**  
  (`$0.000028` CPU + `0.5 × $0.0000045` RAM)
- **~$918 hours** of single default sandbox ≈ **~38 days** continuous  
- Or ~**5,500 × 10-minute** sessions

Sources: [pricing](https://e2b.dev/pricing), [billing](https://e2b.dev/docs/billing)

---

## 3. Paid plans

### Pro — **$150/month** + usage

| Item | Value |
|---|---|
| Base | **$150/mo** (Stripe) |
| Included usage credits | **None** (upgrade only raises limits; no extra free compute) |
| Session length | **Up to 24 hours** continuous |
| Concurrent sandboxes | **100** included |
| Concurrency add-ons | **Pro+ 600 concurrent: +$500/mo** · **Pro++ 1,100: +$1,000/mo** |
| Creation rate | **5 / second** |
| Concurrent builds | **20** |
| Disk | **20+ GB** free |
| CPU/RAM | Same per-second rates; **8+** vCPU / memory with support |
| Overage | Pure usage: same **$/s** CPU + RAM rates as Hobby |

Sources: [pricing](https://e2b.dev/pricing), [billing](https://e2b.dev/docs/billing) (add-on note: $500/mo for higher concurrency), [pricing.e2b.dev](https://pricing.e2b.dev/) (Pro+ / Pro++ tiers)

### Enterprise — **Custom** (estimator floor **$3,000/mo**)

| Item | Value |
|---|---|
| Base | Custom; workload estimator cites **$3,000/mo minimum** |
| Concurrent | **1,100+** |
| Runtime / CPU / RAM / disk / rate limits | Custom |
| Credits / volume discounts | Custom (estimator shows volume discount + bonus credits paths) |

Sources: [pricing](https://e2b.dev/pricing), [billing](https://e2b.dev/docs/billing), [pricing.e2b.dev](https://pricing.e2b.dev/)

### Startup program (not a retail plan)
- Includes **Pro** + **$20,000** one-time usage credits (application program).  
Source: [e2b.dev/startups](https://e2b.dev/startups)

---

## 4. Cost of leaving a sandbox running **24 hours**

| Config | $/s | ~$/hour | **24h cost** |
|---|---:|---:|---:|
| **Default: 2 vCPU + 0.5 GiB** | $0.00003025 | $0.109 | **~$2.61** |
| 2 vCPU + 1 GiB | $0.0000325 | $0.117 | **~$2.81** |
| 2 vCPU + 4 GiB | $0.000046 | $0.166 | **~$3.97** |
| 4 vCPU + 4 GiB | $0.000074 | $0.266 | **~$6.39** |
| 8 vCPU + 8 GiB | $0.000148 | $0.533 | **~$12.79** |

**Continuous for a full month (~730 h), one default sandbox:** ~**$79–80** usage alone.  
On Pro: **$150 + ~$80 ≈ $230/mo** for one always-on default box (if allowed by 24h continuous limit — you’d need pause/resume or recreate every 24h; continuous runtime cap is 24h on Pro, 1h on Hobby).

Rates from [pricing](https://e2b.dev/pricing); 24h math is derived.

---

## 5. Sweet spots & what an agent app burns first

| Plan | Fits | Blows through first |
|---|---|---|
| **Hobby ($0 + $100 credits)** | Prototyping, demos, low-volume code-exec tools, CI-style short sandboxes | **(1) $100 credits** if sandboxes stay alive / idle-running; **(2) 1-hour session cap** for long agents; **(3) 20 concurrent** under parallel evals/tests |
| **Pro ($150 + usage)** | Production agents, multi-user code runners, sessions >1h | **Usage $** from idle-running sandboxes; then **100 concurrent** under fan-out agents; **5 creates/sec** under bursty test grids |
| **Pro+ / Pro++** | Heavy parallel evals (hundreds of concurrent sandboxes) | Concurrency add-on cost **before** raw CPU $ becomes dominant |
| **Enterprise** | 1,100+ concurrent, custom runtime, volume | Contract floor ($3k/mo estimator) |

### Typical agent-built app (small web app + chatty DB + auto-deploys + sandboxed code runs)

| Quota | When it hits first | Rough threshold |
|---|---|---|
| **Compute $ (idle run time)** | Almost always first | 1 default sandbox left up 24/7 ≈ **$80/mo** usage; 10 concurrent always-on ≈ **$800/mo** usage alone |
| **Session length (Hobby 1h)** | Long-running agent / IDE sessions | Any session > **60 min** without pause/resume architecture |
| **Concurrency (20 Hobby / 100 Pro)** | Parallel tool calls, multi-user, test matrix | Hobby: ~**20 users** each with an open sandbox; Pro: ~**100** |
| **Creation rate (1/s Hobby, 5/s Pro)** | CI / per-PR / per-test provision | Burst of **>1 (Hobby) or >5 (Pro) creates per second** |
| **Disk 10/20 GB** | Rare for “chatty DB” patterns unless large deps/datasets in-sandbox | Fat Docker-ish templates, big model weights, datasets |
| **Egress** | Not a public meter | Not the first bill line on official pricing |

**Rule of thumb:** for agent apps, the first wall is usually **forgotten running sandboxes → compute $**, not CPU size. Second is **session length** (Hobby) or **concurrency** (production fan-out).

---

## 6. Cost traps specific to AI-agent patterns

1. **Polling / “keep-alive” loops** — Meter runs while the VM is **running**, even if the agent only waits on LLM I/O. Prefer **pause** / **auto-pause** between turns.  
2. **Forgotten sandboxes** — No kill after tool use. One default box × 24h ≈ **$2.61**; 50 leaked boxes × a day ≈ **$130**.  
3. **Per-test / per-PR provisioning without kill** — CI creates N sandboxes, test hangs, meter keeps spinning.  
4. **Oversized templates** — Default is enough for many code-exec tools; jumping to 8 vCPU + 8 GiB multiplies cost ~**5×** vs default.  
5. **Treating Pro base as “includes hours”** — Pro is **$150 limits only**, not free compute; usage is fully metered.  
6. **Hobby 1h hard stop** — Long agents die mid-task unless you pause (resets continuous window) or upgrade.  
7. **Always-on “workspace” sandboxes** — 24h is the Pro continuous max; always-on product UX needs pause/resume or multi-day product design, not one infinite VM.  
8. **Large package installs every cold start** — Billed as run time (npm/pip during boot), not as free setup. Cache in **custom templates**.  
9. **Egress / big downloads** — Not on public price list, but still wastes **CPU-seconds** and can hit disk caps; don’t treat “free egress” as free time.  
10. **Credits cliff** — After **$100**, account **blocks** until payment method; agents fail closed mid-prod if only Hobby credits were used.

Official cost tips (pause, kill, right-size, monitor): [billing FAQ](https://e2b.dev/docs/billing)

---

## 7. How to check current usage / spend

| Method | Exact path / command |
|---|---|
| **Usage & costs dashboard** | https://e2b.dev/dashboard?tab=usage |
| **Billing / plan / add-ons** | https://e2b.dev/dashboard?tab=billing |
| **Spending limits** | https://e2b.dev/dashboard?tab=budget |
| **API keys** | https://e2b.dev/dashboard?tab=keys |
| **CLI — list active sandboxes** (ops hygiene, not dollar spend) | `e2b sandbox list` · `e2b sandbox list --state running,paused` · `e2b sandbox list --format json` |
| **CLI spend report** | **None documented** — no `e2b usage` / `e2b billing` for dollar totals; use dashboard |
| **Workload estimator** | https://pricing.e2b.dev/ |

Sources: [billing – monitoring](https://e2b.dev/docs/billing), [list sandboxes CLI](https://e2b.dev/docs/cli/list-sandboxes)

---

## 8. Keyword triggers (shell / code)

Short lowercase signals that E2B is in play:

```
e2b
e2b_
e2b-dev
@e2b
e2b-code-interpreter
code-interpreter
sandbox.create
Sandbox.create
E2B_API_KEY
e2b sandbox
e2b template
e2b auth
from e2b
import { Sandbox }
@e2b/code-interpreter
npx e2b
pip install e2b
npm i e2b
@e2b/cli
```

---

## Quick reference card

| | Hobby | Pro | Enterprise |
|---|---|---|---|
| Base | $0 | **$150/mo** | Custom (≥**~$3k/mo** estimator) |
| Free compute | **$100 once** | $0 included | Custom |
| Session | **1 h** | **24 h** | Custom |
| Concurrent | **20** | **100** (→600/1,100 add-ons) | **1,100+** |
| Create rate | 1/s | 5/s | Custom |
| Disk | 10 GB | 20+ GB | Custom |
| Default $/h | ~**$0.109** (2 vCPU + 512 MiB) | same | custom |
| 24h default box | ~**$2.61** usage | same + plan base | custom |

**Primary sources (every number above traces here):**  
- https://e2b.dev/pricing  
- https://e2b.dev/docs/billing  
- https://pricing.e2b.dev/  
- https://e2b.dev/docs/cli/list-sandboxes  
- https://e2b.dev/startups (startup credits only)

**Not used as authority:** third-party blogs claiming "100 hrs free" or "500 hrs in Pro" — those contradict official **$100 credits + pure per-second** model as of July 2026.
