# Research archive: railway

Raw dual-engine research output (2026-07-17). Engine A = Claude subagent with web search; Engine B = grok CLI (`grok -p`, web search enabled). The merged factsheet cross-checks both, preferring official pricing pages on conflicts.

## Merged factsheet (cross-checked)

```json
{
  "provider": "Railway",
  "billing_dimensions": [
    "CPU: $20/vCPU/mo ($0.000463/vCPU/min), billed per-minute while service runs (idle or not)",
    "Memory: $10/GB/mo ($0.000231/GB/min)",
    "Volume (persistent disk): $0.15/GB/mo",
    "Network egress from services: $0.05/GB (ingress free; private-network traffic between services free)",
    "Object storage (Buckets): $0.015/GB-month, rounded UP to whole GB-months; S3 ops and bucket egress free",
    "Railway Agent: LLM tokens passed through at Anthropic rates, drawn from same credit pool; default spend caps $5 (Hobby) / $20 (Pro), cannot be fully removed",
    "Seats: Pro is $20/mo per seat (official pricing page wording)",
    "NOT billed: HTTP requests, S3 API ops, bucket egress; builds/PR envs/replicas consume the same compute meters"
  ],
  "free_tier": "Two stages. TRIAL (new signups, no card): one-time $5 credit, expires after ~30 days. Limits: 2 vCPU (shared) / 1 GB RAM / 2 replicas / 0.5 GB volume / 1 GB ephemeral / 4 GB image, 5 services/project, 3 buckets/project, 50 GB-month bucket max; unverified GitHub = Limited Trial (restricted outbound network, no buckets); trial volumes DELETED 30 days after credit expiry. FREE PLAN (post-trial, reinstated Aug 2025): $1/mo credit, non-rolling. Limits: 1 vCPU / 0.5 GB RAM / 1 replica / 0.5 GB volume / 1 GB ephemeral / 4 GB image, 1 bucket (10 GB-month), API rate limit 100 req/h. When $1 is spent, workloads stop and bucket access suspends (files kept) until next cycle. Reality: 0.5 GB always-on RAM alone ≈ $5/mo = 5x the credit — Free only fits a sleep-heavy serverless toy.",
  "plans": [
    {
      "name": "Free",
      "price": "$0/mo",
      "included": "$1/mo resource credit (non-rolling); 1 vCPU, 0.5 GB RAM, 1 replica, 0.5 GB volume, 1 bucket (10 GB-mo)",
      "overage": "none — workloads stop when the $1 is spent"
    },
    {
      "name": "Hobby",
      "price": "$5/mo (charged even if usage is lower; bill = max($5, usage))",
      "included": "$5/mo usage credit; per-service caps 48 vCPU / 48 GB RAM, 6 replicas, 5 GB volume (self-serve), 100 GB ephemeral, single-developer workspace",
      "overage": "$20/vCPU-mo, $10/GB-RAM-mo, $0.15/GB-mo volume, $0.05/GB egress, $0.015/GB-mo buckets"
    },
    {
      "name": "Pro",
      "price": "$20/mo per seat (official pricing page: \"per seat\")",
      "included": "$20/mo usage credit; 1,000 vCPU / 1 TB RAM caps, 42 replicas, volumes to 1 TB self-serve, 30-day logs, higher API limits (10,000 req/h)",
      "overage": "same metered unit rates as Hobby; annual committed-spend discounts available"
    },
    {
      "name": "Enterprise",
      "price": "custom (third-party reports ~$2,000/mo minimum; unverified)",
      "included": "custom; ~2,400 vCPU / 2.4 TB RAM / 50 replicas / 5 TB volumes, SSO, SLAs",
      "overage": "custom"
    }
  ],
  "first_quota_blown": "The included usage credit, not a hard resource cap. On Hobby, a typical agent stack (web app + Postgres, ~1-2 GB RAM total always-on) runs ~$15-25/mo metered, so the $5 credit is exhausted in under a week and real overage billing begins; RAM is usually the dominant meter ($10/GB-mo — 2x1 GB always-on ≈ $20/mo before CPU). On Free, the $1/mo credit dies in hours-to-days (0.5 GB always-on ≈ $5/mo). On Trial, the $5 one-time credit lasts ~5-10 days of an always-on app+DB. Second walls: public-URL DB egress at $0.05/GB, then PR/preview environments multiplying the whole stack, then Hobby's hard 5 GB volume cap.",
  "sweet_spots": "Trial: weekend demos only. Free: one sleep-heavy serverless toy endpoint (no always-on anything, 0 custom domains). Hobby ($5): solo dev with ONE small always-on service (~0.1 vCPU/256 MB ≈ $4.50/mo fits inside credit) or several serverless-slept services; app+DB pushes to ~$15-25/mo real spend. Pro ($20/seat): teams, staging+prod, PR previews, bigger volumes (1 TB vs Hobby's 5 GB hard cap), 10k req/h API limits; the $20 credit roughly covers one small always-on service, real agent stacks land $25-80+/mo.",
  "traps": [
    "Idle services bill per-minute regardless of traffic — a forgotten 1 vCPU/1 GB service costs ~$30/mo; enable Serverless (scale-to-zero) in Settings > Deploy",
    "Polling loops and health-check pingers defeat Serverless sleep entirely, keeping CPU/RAM billing continuous",
    "Connecting to your own DB via its public URL bills $0.05/GB egress — use the private *.railway.internal hostname (free)",
    "PR/preview environments duplicate every service and bill separately: 3 open PRs with full stack ≈ 4x baseline; agents that auto-open PRs multiply compute",
    "Service-to-bucket uploads pay service egress ($0.05/GB) even though bucket egress is free — buckets sit on the public network",
    "Railway Agent LLM tokens drain the same credit pool (default caps $5 Hobby / $20 Pro); sandboxes are full VMs billed while RUNNING and agents forget them",
    "Bucket GB-months round UP per bucket (5.1 -> 6), so many tiny test buckets each add rounded charges",
    "Hard usage limit (minimum $10) takes ALL workloads offline when hit and suspends bucket reads; set the lower email soft alert too (alerts at 75/90/100%)",
    "Trial volumes are deleted 30 days after the trial credit expires; Free-plan workloads stop mid-cycle when the $1 credit runs out",
    "Memory leaks directly raise the bill since RAM bills on usage ($10/GB-mo)"
  ],
  "usage_check": "Dashboard (primary): https://railway.com/workspace/usage — current + estimated billing-period spend per project/resource, and where soft/hard limits are set; billing at https://railway.com/workspace/billing. No CLI usage/spend command exists (railway status/logs/metrics cover ops only). API: POST https://backboard.railway.com/graphql/v2 with header 'Authorization: Bearer <token>' (account token from Settings > Tokens; env vars RAILWAY_TOKEN / RAILWAY_API_TOKEN) — introspectable schema includes usage/estimatedUsage queries with measurements like CPU_USAGE, MEMORY_USAGE_GB, NETWORK_TX_GB.",
  "keywords": [
    "railway",
    "railway up",
    "railway login",
    "railway link",
    "railway init",
    "railway run",
    "railway deploy",
    "railway logs",
    "railway variables",
    "railway service",
    "railway agent",
    "railway metrics",
    "railway whoami",
    "railway.app",
    "up.railway.app",
    "railway.com",
    "railway.internal",
    "backboard.railway",
    "railway_token",
    "railway_api_token",
    "railway_environment",
    "railway_project_id",
    "railway_public_domain",
    "railway_private_domain",
    "database_public_url",
    "railway.json",
    "railway.toml",
    "nixpacks",
    "railpack"
  ],
  "hint": "Railway bills idle compute per-minute: $20/vCPU-mo, $10/GB-RAM-mo, $0.05/GB egress. Free=$1/mo credit (0.5GB always-on≈$5/mo, dead in days); Hobby $5 credit gone <1wk with app+DB. Enable Serverless sleep; use *.railway.internal for DB.",
  "conflicts": [
    "Pro seat pricing: Report A said $20/mo per seat; Report B said flat $20/mo with unlimited $0 seats. WebFetch of the official pricing page (railway.com/pricing) returned the exact wording 'Pro: $20/month per seat' — Report A wins. B was likely misled by docs.railway.com/pricing/plans, which shows 'Pro $20/month' without seat wording.",
    "Enterprise minimum price: A cited ~$2,000/mo from third-party reports; B cited only feature spend-unlocks (~$1k HIPAA, ~$2k SSO). Neither is an official plan price — recorded as custom/unverified, unresolved.",
    "Free-plan structural limits (1 project, 3 services/project, 10-min build timeout, 3-day logs, 0 custom domains) and Trial extras (5 projects, 20-min builds, 7-day logs) appear only in Report B; A neither confirms nor contradicts, and B cites the official plans page — included but single-sourced.",
    "Free-plan API rate limit 100 req/h and Pro 10,000 req/h / 50 RPS appear only in Report A (cited to docs) — included but single-sourced."
  ],
  "sources": [
    "https://railway.com/pricing",
    "https://docs.railway.com/pricing",
    "https://docs.railway.com/pricing/plans",
    "https://docs.railway.com/pricing/free-trial",
    "https://docs.railway.com/pricing/understanding-your-bill",
    "https://docs.railway.com/pricing/cost-control",
    "https://docs.railway.com/pricing/faqs",
    "https://docs.railway.com/storage-buckets/billing",
    "https://docs.railway.com/projects/project-usage",
    "https://docs.railway.com/integrations/api",
    "https://docs.railway.com/cli",
    "https://blog.railway.com/p/free-plan",
    "https://railway.com/workspace/usage"
  ]
}
```

## Engine A — Claude web research (raw)

# Railway Pricing & Quota Factsheet — verified July 17, 2026

Verified against official pages: https://railway.com/pricing, https://docs.railway.com/pricing, https://docs.railway.com/pricing/plans, https://docs.railway.com/pricing/free-trial, https://docs.railway.com/pricing/cost-control, https://docs.railway.com/storage-buckets/billing

## 1. Metered billing dimensions
Railway bills a base subscription (which doubles as a usage credit) plus per-minute metered usage:
- **CPU**: $20/vCPU/month = $0.000463/vCPU/minute — billed per-minute for actual usage (https://docs.railway.com/pricing/plans)
- **Memory**: $10/GB/month = $0.000231/GB/minute (https://docs.railway.com/pricing/plans)
- **Volume (disk) storage**: $0.15/GB/month = ~$0.00000347/GB/minute (https://docs.railway.com/pricing/plans)
- **Network egress**: $0.05/GB, ingress free; private-network traffic between services is free (https://docs.railway.com/pricing/plans, https://docs.railway.com/pricing/cost-control)
- **Object storage (Buckets)**: $0.015/GB-month averaged daily and rounded UP to whole GB-months; S3 API operations unlimited and free; bucket egress free (https://docs.railway.com/storage-buckets/billing)
- **Railway Agent**: separate line item — LLM token usage passed through at Anthropic's rates, drawn from the same credit pool; default agent spend caps $5 (Hobby) / $20 (Pro), cannot be fully removed (https://docs.railway.com/pricing, https://docs.railway.com/pricing/cost-control)
- **Seats**: Pro is $20/month **per seat** (https://railway.com/pricing)
- NOT billed: requests, build minutes as a separate meter (builds consume compute), S3 ops, bucket egress.

## 2. Free tier (exact quotas)
Two-stage. **Recent change note**: Railway removed its free plan years ago, then reinstated it (blog "Bring Back the Free Plan", Aug 2025 — https://blog.railway.com/p/free-plan). The trial credit now **expires after 30 days**, which older blog posts don't reflect.
- **Trial** (new signups): one-time **$5 credit**, no card required, expires at 30 days or when spent. Limits: 1 GB RAM, shared (not dedicated) vCPU (plans table lists 2 vCPU / 1 GB / 2 replicas / 0.5 GB volume / 1 GB ephemeral / 4 GB image), **5 services per project**, up to 50 GB-month bucket usage, 3 buckets/project. Unverified GitHub accounts get a "Limited Trial" with restricted outbound network and limited ports; verify at railway.com/verify. **Stateful volumes are deleted 30 days after trial credit expiry.** (https://docs.railway.com/pricing/free-trial)
- **Free plan** (post-trial): **$1/month credit, non-rolling**. Limits: 1 vCPU, 0.5 GB RAM, 1 replica, 0.5 GB volume, 1 GB ephemeral, 4 GB image, 10 GB-month buckets (1 bucket), 24 h image retention, API rate limit 100 req/hour. When the $1 is spent, workloads stop and bucket access is suspended (files kept) until next cycle. $1 ≈ one always-on ~0.06 vCPU-equivalent — realistically a single tiny mostly-idle or serverless-enabled app. (https://docs.railway.com/pricing/plans, https://docs.railway.com/storage-buckets/billing)

## 3. Paid plans
| Plan | Price | Included usage | Per-service limits | Overage rates |
|---|---|---|---|---|
| **Hobby** | $5/mo (charged even if unused) | $5/mo resource credit | 48 vCPU, 48 GB RAM, 6 replicas, 5 GB volume (self-serve), 100 GB ephemeral, 100 GB image, 50 buckets | usage beyond $5 billed at metered rates above |
| **Pro** | $20/mo **per seat** | $20/mo credit per seat | 1,000 vCPU, 1 TB RAM, 42 replicas, volumes up to 1 TB self-serve, unlimited image size, 100 buckets (increasable) | same metered rates; annual committed-spend discounts available |
| **Enterprise** | custom (~$2,000/mo minimum per third-party reports) | custom | 2,400 vCPU, 2.4 TB RAM, 50 replicas, 5 TB volumes | custom; SLAs, SSO |

Overage unit prices (all plans): $20/vCPU-mo, $10/GB RAM-mo, $0.15/GB volume-mo, $0.05/GB egress, $0.015/GB-mo buckets. (https://docs.railway.com/pricing/plans, https://railway.com/pricing)

**Always-on service cost estimates** (24/7, at official rates):
- Tiny app, 0.1 vCPU avg + 256 MB RAM: ~$2 + $2.50 = **~$4.50/mo** — fits inside Hobby's $5 credit.
- Small web app, 0.5 vCPU avg + 512 MB: $10 + $5 = **~$15/mo** → Hobby bill ≈ $15 ($5 sub + $10 overage).
- 1 vCPU + 1 GB flat: $20 + $10 = **$30/mo** regardless of traffic.
- Add a small Postgres (0.2 vCPU avg, 512 MB, 1 GB volume): ~$4 + $5 + $0.15 ≈ **$9/mo** extra.

## 4. Sweet spots & first quota an agent-built app blows through
- **Trial**: demos only; 1 GB RAM + shared CPU + 5 services/project. First wall: the **$5 credit** — one always-on 0.5 vCPU/512 MB app burns it in ~10 days; app + DB in ~5–7 days.
- **Free**: a single serverless-enabled toy endpoint. First wall: **$1 credit** — any always-on service plus a DB exceeds it within days; DB alone (~$9/mo run rate) kills it in ~3 days.
- **Hobby**: solo dev, 1–2 small always-on services. The typical agent stack (web app + Postgres + auto-deploys) runs ~$15–25/mo of metered usage, so the **$5 included credit** is the first thing blown — usually within the first week; you then pay real metered overage. Memory is the usual dominant line item for chatty DBs (Postgres idles at 100–300 MB but RAM bills on usage, $10/GB-mo).
- **Pro**: teams, staging+prod environments, higher API rate limits (10,000 req/h, 50 RPS), bigger volumes. Blows through the $20/seat credit similarly fast with 3+ services; per-seat pricing is the second surprise.

## 5. Cost traps for AI-agent usage patterns
- **Idle services still bill**: Railway charges per-minute while the container runs, traffic or not. Forgotten preview/test services from per-test provisioning accumulate at ~$30/mo per 1 vCPU/1 GB. Enable **Serverless (scale-to-zero)** under service Settings > Deploy > Serverless. (https://docs.railway.com/pricing/cost-control)
- **PR/preview environments**: each environment duplicates services and bills separately; agents that open many PRs with auto-deploy multiply compute.
- **Public-network DB connections**: connecting to your own database over its public URL bills $0.05/GB egress; use the private-network hostname (`*.railway.internal`) — private traffic is free.
- **Uploading from a service to a Bucket costs service egress** ($0.05/GB) even though bucket egress itself is free — buckets sit on the public network. (https://docs.railway.com/storage-buckets/billing)
- **Polling loops** keep serverless services from ever sleeping and keep CPU non-zero; a health-check pinger defeats scale-to-zero entirely.
- **Railway Agent tokens** bill LLM usage from the same credit pool — an agent loop can silently drain the Hobby $5; default caps ($5/$20) help but check them.
- **Bucket rounding**: GB-months round UP (5.1 → 6), so many tiny test buckets each add rounded charges.
- **Hard-limit minimum is $10**, and the hard limit takes ALL workloads offline when hit — set the email soft alert lower. Alerts fire at 75/90/100% of hard limit. (https://docs.railway.com/pricing/cost-control)
- **Trial volume deletion**: data on trial volumes is deleted 30 days after credit expiry.

## 6. Checking current usage/spend
- **Dashboard (primary)**: https://railway.com/workspace/usage — current billing-period usage, per-project breakdown, discounts/credits, "Current" and "Estimated" cost, and where you set soft/hard usage limits (workspace admin required). Also the Project Usage widget in the Observability dashboard (https://docs.railway.com/projects/project-usage).
- **CLI**: there is **no `railway usage`/billing command**. The CLI (`railway status`, `railway logs`, etc.) covers deploys, not spend. `railway agent` can be asked about your project in natural language but billing review is dashboard-first. (https://docs.railway.com/cli)
- **API**: GraphQL at `https://backboard.railway.com/graphql/v2` (legacy `backboard.railway.app`), header `Authorization: Bearer <API token>` (tokens: account settings → Tokens). The schema is introspectable and includes the usage/`estimatedUsage`-style queries powering the dashboard (measurements like `CPU_USAGE`, `MEMORY_USAGE_GB`, `NETWORK_TX_GB`); explore via https://railway.com/graphiql or replicate the dashboard's network request. (https://docs.railway.com/integrations/api)

## 7. Keyword triggers (shell)
`railway` (CLI: `railway up`, `railway login`, `railway link`, `railway init`, `railway run`, `railway deploy`, `railway logs`, `railway variables`, `railway service`, `railway agent`), `railway.app` / `railway.com` / `up.railway.app` (deployed URLs), `railway.internal` (private networking hostnames), `backboard.railway.com` / `backboard.railway.app` (API), `RAILWAY_` env-var prefix (e.g. `RAILWAY_TOKEN`, `RAILWAY_ENVIRONMENT`, `RAILWAY_PROJECT_ID`), `railway.json` / `railway.toml` (config-as-code), `nixpacks`/`railpack` (Railway's builders), `Project-Access-Token` header.

## Source URLs
- https://railway.com/pricing — plans, $5/$20, trial credit, buckets, seat pricing
- https://docs.railway.com/pricing — billing dimensions incl. Agent LLM billing
- https://docs.railway.com/pricing/plans — unit rates ($20/vCPU-mo, $10/GB-mo, $0.05/GB egress, $0.15/GB-mo volumes), per-plan limits table, Free $1 credit
- https://docs.railway.com/pricing/free-trial — $5/30-day trial, limits, volume deletion, verification tiers
- https://docs.railway.com/pricing/cost-control — usage limits ($10 min hard limit, 75/90/100% alerts), serverless, agent caps, private networking
- https://docs.railway.com/storage-buckets/billing — $0.015/GB-mo, free ops/egress, rounding, Free 10 GB-mo / Trial 50 GB-mo
- https://docs.railway.com/projects/project-usage — usage page behavior
- https://docs.railway.com/integrations/api — GraphQL endpoint and auth
- https://docs.railway.com/cli — CLI commands (no billing command)
- https://blog.railway.com/p/free-plan — Aug 2025 reinstatement of free plan / $1 monthly credit (recent-change context)
- https://railway.com/workspace/usage — live usage dashboard

## Engine B — grok CLI (raw)

# Railway pricing & quotas factsheet  
**As of July 2026** · Verified against official Railway pages (not third-party blogs)

---

## 1. Metered billing dimensions

Railway bills **subscription + usage**. You are charged for **allocated/active resources**, not HTTP request counts.[[1]](https://docs.railway.com/pricing)

| Dimension | What bills | Unit price (official) | Granularity |
|-----------|------------|----------------------|-------------|
| **Subscription** | Plan minimum commitment (counts toward usage) | Free $0 / Hobby $5 / Pro $20 | monthly |
| **CPU** | Active vCPU while service is running | **$20 / vCPU / month** · **$0.000463 / vCPU / min** · **$0.00000772 / vCPU / sec** | per minute/sec of runtime |
| **Memory (RAM)** | Allocated/used memory while running | **$10 / GB / month** · **$0.000231 / GB / min** · **$0.00000386 / GB / sec** | per minute/sec |
| **Volume storage** | Persistent disks | **$0.15 / GB / month** · ~**$0.00000006 / GB / sec** | per min/sec stored |
| **Network egress** | Outbound data from **services** | **$0.05 / GB** | per GB transferred |
| **Object storage (Buckets)** | Stored data only | **$0.015 / GB-month**; **ops free**; **bucket egress free** | averaged GB-month |
| **Railway Agent** | LLM tokens (pass-through Anthropic rates, no markup) | model token rates; draws from same plan credits; separate hard limit | tokens |
| **Seats** | Team members | Pro: **$0 / seat** (unlimited seats included) | N/A |
| **Requests / invocations** | Not billed | — | — |

**Sources:** [railway.com/pricing](https://railway.com/pricing) · [docs.railway.com/pricing](https://docs.railway.com/pricing) · [docs.railway.com/pricing/plans](https://docs.railway.com/pricing/plans) · [docs.railway.com/storage-buckets/billing](https://docs.railway.com/storage-buckets/billing)

**Important mechanics:**
- Idle always-on services still bill CPU/RAM (you pay for "plugged in," not traffic).[[2]](https://docs.railway.com/pricing/understanding-your-bill)
- Builds, replicas, PR/ephemeral environments, and sandboxes consume the same compute meters while running.
- Private-network traffic between services avoids **service egress**; public DB URLs count as egress.[[2]](https://docs.railway.com/pricing/understanding-your-bill)
- Bucket egress is free, but **service → bucket** uploads over the public network still bill **service** egress.[[3]](https://docs.railway.com/storage-buckets/billing)

---

## 2. Free tier — exact quotas

Railway has **two free stages**: Trial, then Free plan.

### Trial (new accounts)

| Item | Value |
|------|--------|
| Price | **$0** |
| Credits | **$5 one-time**, usable within **~30 days** |
| RAM / service | **up to 1 GB** |
| CPU / service | **up to 2 vCPU** (shared) |
| Replicas | **2** |
| Ephemeral disk | **1 GB** |
| Volume storage | **0.5 GB** |
| Image size | **4 GB** |
| Projects | **5** during trial |
| Services / project | **5** during trial |
| Volumes / project | **3** during trial |
| Buckets / project | **3** during trial (Full Trial only; Limited Trial: buckets unavailable) |
| Bucket storage max | **50 GB** during trial |
| Concurrent builds | **3** during trial |
| Build timeout | **20 min** during trial |
| Custom domains | **1** during trial |
| Log retention | **7 days** during trial |
| Credit card | Can try without card (trial path) |

Full vs Limited Trial depends on account verification (GitHub etc.); Limited Trial has restricted outbound networking. Volumes from Trial accounts are deleted **30 days after trial credits expire** if you don't upgrade.[[4]](https://docs.railway.com/pricing/free-trial)

### Free plan (after trial)

| Item | Value |
|------|--------|
| Price | **$0 / month** |
| Credits | **$1 free resource credit / month** (does **not** roll over) |
| RAM / service | **up to 0.5 GB** |
| CPU / service | **up to 1 vCPU** |
| Replicas | **1** |
| Ephemeral disk | **1 GB** |
| Volume storage | **0.5 GB** |
| Image size | **4 GB** |
| Projects | **1** |
| Services / project | **3** |
| Volumes / project | **1** |
| Buckets / project | **1** |
| Bucket max storage | **10 GB-month**; counts against the **$1** credit |
| Concurrent builds | **1** |
| Build timeout | **10 min** |
| Custom domains | **0** |
| Service domains | **2** |
| Global regions | **Unavailable** on Free (trial-only) |
| Log retention | **3 days** |

**Sources:** [railway.com/pricing](https://railway.com/pricing) · [docs.railway.com/pricing/plans](https://docs.railway.com/pricing/plans) · [docs.railway.com/pricing](https://docs.railway.com/pricing) · [docs.railway.com/storage-buckets/billing](https://docs.railway.com/storage-buckets/billing)

**Reality check:** **0.5 GB always-on RAM alone ≈ $5/mo** at $10/GB-month — already **5×** the Free plan's **$1** credit. Free is for tiny serverless-ish experiments, not always-on app + DB.

---

## 3. Paid plans — name, price, included credits, overage unit prices

Overage rates are **the same** on Hobby and Pro (and Free/Trial when usage is allowed). Plan differences are **subscription floor**, **included credits**, and **resource caps**.

| | **Hobby** | **Pro** |
|--|-----------|---------|
| **Monthly price** | **$5** minimum | **$20** minimum |
| **Included usage credit** | **$5 / month** | **$20 / month** |
| **Credit rollover** | No | No |
| **Seats** | Single-developer workspace | **Unlimited seats included ($0)** |
| **Max RAM / service** | **48 GB** | **1 TB** |
| **Max CPU / service** | **48 vCPU** | **1,000 vCPU** |
| **Replicas** | **6** (up to 8 vCPU / 8 GB per replica on marketing page) | **42** (up to 24 vCPU / 24 GB per replica) |
| **Volume storage** | **up to 5 GB** | **up to 1 TB** (self-serve resize) |
| **Ephemeral disk** | **100 GB** | **100 GB** |
| **Image size** | **100 GB** | Unlimited |
| **Projects** | **50** | **100** |
| **Services / project** | **50** | **100** |
| **Custom domains** | **2** | **20** |
| **Service domains** | **4** | **20** |
| **Concurrent builds** | **3** | **10** |
| **Build timeout** | **40 min** | **90 min** |
| **Log history** | **7 days** | **30 days** |
| **Default Agent hard limit** | **$5 / month** | **$20 / month** (cannot remove; can raise/lower) |
| **Bucket storage cap** | **1 TB** combined max | Unlimited |
| **Support** | Community | Railway Support |
| **Availability target** | 99.9% | 99.99% |

### How the bill is calculated

```
total ≈ max(subscription, resource_usage + agent_usage)
```

Equivalently: pay subscription + `max(0, usage − included_credit)`.  
Examples (Hobby): usage $3 → bill **$5**; usage $8 → bill **$8**.[[2]](https://docs.railway.com/pricing/understanding-your-bill)

### Overage / unit prices (all paid plans)

| Resource | Price |
|----------|--------|
| RAM | **$10 / GB / month** ($0.000231 / GB / min) |
| CPU | **$20 / vCPU / month** ($0.000463 / vCPU / min) |
| Network egress (services) | **$0.05 / GB** |
| Volume storage | **$0.15 / GB / month** |
| Object storage | **$0.015 / GB-month** (ops + bucket egress free) |
| Agent LLM | Anthropic list rates, pass-through |

**Sources:** [railway.com/pricing](https://railway.com/pricing) · [docs.railway.com/pricing/plans](https://docs.railway.com/pricing/plans) · [docs.railway.com/pricing/understanding-your-bill](https://docs.railway.com/pricing/understanding-your-bill) · [docs.railway.com/pricing/cost-control](https://docs.railway.com/pricing/cost-control)

**Enterprise** (out of focus): custom; higher limits (e.g. 2.4 TB RAM / 2,400 vCPU); spend unlocks (HIPAA ~$1k, SSO/RBAC ~$2k, etc. on pricing page).

---

## 4. Sweet spots & always-on monthly cost estimates

### Always-on cost math (resource only, before plan credit)

| Shape | Rough formula | Est. resource cost |
|-------|---------------|--------------------|
| **0.5 GB RAM**, ~0.1 vCPU, no disk | 0.5×$10 + 0.1×$20 | **~$7/mo** |
| **1 GB RAM**, ~0.25 vCPU | 1×$10 + 0.25×$20 | **~$15/mo** |
| **App 1 GB + Postgres 1 GB**, 0.5 vCPU total, **1 GB volume** | 2×$10 + 0.5×$20 + 1×$0.15 | **~$30/mo** |
| **+ 100 GB egress** | +100×$0.05 | **+$5** |
| **+ 1 TB egress** | +1000×$0.05 | **+$50** |

Hours/month used for "month" rates ≈ 720–744; Railway's published $/sec and $/min align with ~$10/GB-mo and ~$20/vCPU-mo.[[5]](https://railway.com/pricing)

### What each plan fits

| Plan | Fits | Breaks first on agent-built apps |
|------|------|----------------------------------|
| **Trial ($5 once)** | Spike demos, one weekend prototype | **Always-on multi-service stack** burns $5 in days (e.g. 2×1 GB always-on ≈ $20/mo burn rate) |
| **Free ($1/mo credit)** | Sleep-heavy serverless toy, single tiny service | **Always-on RAM** first (0.5 GB ≈ $5 > $1); also **custom domains = 0** |
| **Hobby ($5 min)** | Solo side project, **one** small always-on service **or** serverless multi-service under ~$5–15 | **Memory + multi-service always-on** first; then **public DB egress**; then **PR preview clones** |
| **Pro ($20 min)** | Production small/medium app, team, higher limits, previews | **Replica multiplication** (PR envs, staging always-on); **egress** at scale; **Agent LLM** if used heavily |

### Typical agent-built app (web + chatty DB + auto-deploys + sandboxed runs) — what blows first

1. **Always-on RAM (first wall on Free/Hobby)**  
   App + Postgres at ~1 GB each ≈ **$20/mo RAM alone** → Free impossible; Hobby's $5 credit gone; Pro's $20 credit roughly covers **RAM only** if both sit at 1 GB idle.

2. **Public database egress (silent second wall)**  
   App using `DATABASE_PUBLIC_URL` instead of private `DATABASE_URL`: every chatty query pays **$0.05/GB**. Continuous ORM chatter can add dollars/day before CPU does.[[2]](https://docs.railway.com/pricing/understanding-your-bill)

3. **PR / ephemeral environments (deploy-loop wall)**  
   Each open PR mirrors workloads → **N × production cost**. 3 open PRs with full stack ≈ **4×** baseline.[[2]](https://docs.railway.com/pricing/understanding-your-bill)

4. **Forgotten services / sandboxes (agent wall)**  
   Sandboxes are full VMs billed while `RUNNING`; agents that create and forget them stack compute like extra services.

5. **Volume 5 GB cap (Hobby structural limit)**  
   Not a $ wall—**hard cap**. Agent apps with local Postgres growth or large artifacts hit **5 GB volume** on Hobby before Pro's 1 TB.

**Rough "first breach" points for a chatty small stack:**
- Free: **hours–days** of always-on  
- Hobby credit ($5): often **&lt;1 week** of app+DB always-on  
- Pro credit ($20): often covers **~1 small always-on service** or **thin app+DB if RAM is tight and private net is used**; real agent stacks commonly land **$25–80+/mo**

---

## 5. Cost traps specific to AI-agent usage

| Trap | Why it hurts on Railway |
|------|-------------------------|
| **Polling loops** | Keep process awake → continuous CPU/RAM billing even with no user traffic |
| **Forgotten always-on services** | Staging, Redis, old agent workers keep billing until deleted or Serverless-slept |
| **Per-test / per-PR provisioning** | Ephemeral envs + sandbox VMs multiply full-stack cost; PR deploys called out officially |
| **Public DB URL** | Chatty agents + `DATABASE_PUBLIC_URL` = egress meter |
| **Service → bucket uploads** | Bucket egress free; **service** still pays egress for uploads |
| **Large response / log / artifact egress** | APIs returning big payloads, image gen, model weights over public net |
| **Railway Agent unbounded use** | Separate hard limit default $5/$20; compute can still run after agent limit; agent tokens still consume plan credits when under limit |
| **No request-based free tier** | Unlike serverless "1M requests free," Railway doesn't zero-cost idle compute unless Serverless sleep is on |
| **Memory leaks** | Bill rises with leak; officially listed as unexpected-charge cause |
| **Hard usage limit silence** | Hitting hard limit **shuts down workloads**; buckets become unreadable (data still stored/billed) |

**Mitigations (official):** Serverless sleep, usage hard limits + email alerts, private networking, delete unused services, close PRs / disable PR deploys, replica resource caps.[[6]](https://docs.railway.com/pricing/cost-control)

---

## 6. How to check current usage / spend

| Method | Exact path / command |
|--------|----------------------|
| **Dashboard (primary)** | [https://railway.com/workspace/usage](https://railway.com/workspace/usage) — current + estimated billing-period usage, by project/resource; set Compute & Agent limits |
| **Billing / invoices** | [https://railway.com/workspace/billing](https://railway.com/workspace/billing) |
| **Plans** | [https://railway.com/workspace/plans](https://railway.com/workspace/plans) |
| **CLI** | **No first-class `railway usage` / spend command** in official CLI docs. Useful ops: `railway whoami`, `railway status`, `railway metrics`, `railway logs`, `railway list`. Spend visibility is dashboard/API. |
| **GraphQL API** | `POST https://backboard.railway.com/graphql/v2` (also seen as `backboard.railway.app`) with `Authorization: Bearer <token>`. Community/employee-confirmed queries include **`usage`** and **`estimatedUsage`** (project/measurements/date range). Tokens: `RAILWAY_TOKEN` (project) or `RAILWAY_API_TOKEN` (account/workspace). |
| **Estimate method Railway recommends** | Deploy → run **1 week** → read **Estimated Usage** on workspace usage page and extrapolate. |

**Sources:** [docs.railway.com/projects/project-usage](https://docs.railway.com/projects/project-usage) · [docs.railway.com/pricing/faqs](https://docs.railway.com/pricing/faqs) · [docs.railway.com/pricing/cost-control](https://docs.railway.com/pricing/cost-control) · [docs.railway.com/cli](https://docs.railway.com/cli)

---

## 7. Keyword triggers (shell / config)

Short lowercase signals that Railway is in play:

```
railway
railway.app
railway.com
railway up
railway link
railway deploy
railway run
railway add
railway service
railway volume
railway bucket
railway sandbox
railway agent
railway open
railway whoami
railway logs
railway metrics
railway domain
RAILWAY_TOKEN
RAILWAY_API_TOKEN
RAILWAY_ENVIRONMENT
RAILWAY_PROJECT_ID
RAILWAY_SERVICE_ID
RAILWAY_PUBLIC_DOMAIN
RAILWAY_PRIVATE_DOMAIN
*.railway.app
*.up.railway.app
backboard.railway
DATABASE_PUBLIC_URL
railway.toml
railway.json
nixpacks
```

Related agent/automation surface: `railway-ts-sdk`, `Sandbox.create`, GraphQL against `backboard.railway`.

---

## Quick reference card

| | Trial | Free | Hobby | Pro |
|--|-------|------|-------|-----|
| **$ / month** | $0 (+ $5 once) | $0 + **$1 credit** | **$5 min** | **$20 min** |
| **Included usage** | $5 once | $1/mo | $5/mo | $20/mo |
| **Always-on 1 GB** | burns trial fast | exceeds credit | ≈$10 → overage | covered by credit if nothing else |
| **Always-on app+DB ~2 GB** | days | no | ~$20+ → overage | at/over credit edge |
| **Egress** | $0.05/GB | $0.05/GB | $0.05/GB | $0.05/GB |
| **CPU / RAM rates** | $20/vCPU-mo · $10/GB-mo | same | same | same |

### Primary source URLs (cite these, not blogs)

1. https://railway.com/pricing  
2. https://docs.railway.com/pricing  
3. https://docs.railway.com/pricing/plans  
4. https://docs.railway.com/pricing/understanding-your-bill  
5. https://docs.railway.com/pricing/cost-control  
6. https://docs.railway.com/pricing/free-trial  
7. https://docs.railway.com/pricing/faqs  
8. https://docs.railway.com/storage-buckets/billing  
9. https://docs.railway.com/projects/project-usage  
10. https://railway.com/workspace/usage  

---

**Caveats for July 2026 consumers:** Pricing pages quote both **per-second** (marketing) and **per-minute / per-month** (docs); they are consistent when annualized. Third-party pages still sometimes claim "Pro $20 **per seat**"—official docs show Pro seats at **$0** with unlimited members. Re-check [railway.com/pricing](https://railway.com/pricing) before any contract-sensitive decision; Railway has changed egress/disk rates historically with Metal rollout.
