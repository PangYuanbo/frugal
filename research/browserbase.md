# Research archive: browserbase

Raw dual-engine research output (2026-07-17). Engine A = Claude subagent with web search; Engine B = grok CLI (`grok -p`, web search enabled). The merged factsheet cross-checks both, preferring official pricing pages on conflicts.

## Merged factsheet (cross-checked)

```json
{
  "provider": "Browserbase",
  "billing_dimensions": [
    "browser time (wall-clock, billed per minute, 1-minute minimum per session; allocated as browser hours/month, $/hr overage)",
    "proxy bandwidth (billed per MB, 1-MB minimum per session; allocated as GB/month, $/GB overage)",
    "Search API calls (per 1k over included quota, $7/1k)",
    "Fetch API calls (per 1k over included quota; higher rate when proxied)",
    "Extract API calls (per 1k; $4/1k, $7/1k with proxies)",
    "Agent runs (fixed monthly call allocation per plan)",
    "Model Gateway LLM tokens (pay-as-you-go at market price; $5 credit on Free)",
    "NOT meters (hard limits, return 429s not charges): concurrent browsers, max session duration, session-creation rate/min, data retention days, project count"
  ],
  "free_tier": "$0/mo, no credit card. 1 browser hour/month (60 min), 3 concurrent browsers, 15-min max session, 5 session creations/min, 0 GB proxy (proxies unavailable), no CAPTCHA solving/Stealth/keepAlive, 1,000 Search calls (2/sec), 1,000 Fetch calls (5/sec), 3 agent runs, $5 Model Gateway token credit, 7-day data retention, 1 project. No pay-as-you-go overage path: hitting 1 hr is a hard stop, not a charge.",
  "plans": [
    {
      "name": "Free",
      "price": "$0/mo",
      "included": "1 browser hr, 3 concurrent, 15-min max session, 5 creates/min, 0 GB proxy, 1k Search, 1k Fetch, 3 agent runs, $5 model-token credit, 7-day retention, 1 project",
      "overage": "None — hard stop at allocation (no pay-as-you-go on Free)"
    },
    {
      "name": "Developer",
      "price": "$20/mo",
      "included": "100 browser hrs, 25 concurrent, 6-hr max session, 25 creates/min, 1 GB proxy, 1k Search, 1k Fetch, 15 agent runs, Basic Stealth + auto CAPTCHA, up to 2 projects, retention 30d per pricing page (docs table says 7d)",
      "overage": "$0.12/browser hr (~$0.002/min); $12/GB proxy; Search $7/1k; Fetch $1/1k ($4/1k proxied); Extract $4/1k ($7/1k proxied)"
    },
    {
      "name": "Startup",
      "price": "$99/mo (labeled Most Popular on pricing page)",
      "included": "500 browser hrs, 100 concurrent, 6-hr max session, 50 creates/min, 5 GB proxy, 1k Search, 10k Fetch, 50 agent runs, 30-day retention, up to 5 projects, priority support",
      "overage": "$0.10/browser hr; $10/GB proxy; Search $7/1k; Fetch $0.5/1k ($4/1k proxied); Extract $4/1k ($7/1k proxied)"
    },
    {
      "name": "Scale",
      "price": "Custom (contact sales)",
      "included": "250+ concurrent, 150+ creates/min, 6+ hr sessions, flexible/usage-based hours and proxy, Advanced Stealth + Verified Identity, HIPAA BAA/DPA/SSO, 30+ day retention, Slack/high-priority support",
      "overage": "Custom / usage-based"
    }
  ],
  "first_quota_blown": "Free: browser hours — 1 hr/mo dies in one afternoon of agent dev (~30-60 short sessions at the 1-min floor, or 4 max-length 15-min sessions); the 15-min session cap also breaks any long agent task. Developer $20: browser hours (100) if agents loop or leak sessions, or proxy GB first if proxies are on by default (1 GB ≈ 200-500 proxied page loads at 2-5 MB/page — gone in days); parallel test suites hit the 25-concurrent cap (429s) before any dollar overage. Startup $99: proxy GB (5) for scraping-heavy agents, or browser hours for always-on keepAlive fleets.",
  "sweet_spots": "Free = demo/eval only. Developer $20 = solo dev / one production agent: 100 hrs ≈ 3,000 sub-2-min page tasks (Browserbase's own FAQ math) or ~200 half-hour agent sessions. Startup $99 = small team / production agent fleet / CI browser tests: 500 hrs ≈ 15k short tasks, 100 concurrent for parallel runs. Hour overage is cheap ($0.10-0.12/hr) so rarely upgrade for hours alone — upgrade Dev→Startup for concurrency (25→100), proxy volume (1→5 GB, $12→$10/GB), or 10x Fetch quota; break-even on hours alone is ~660 extra hrs/mo. Scale = 250+ concurrency, Verified Identity, compliance (HIPAA/SSO).",
  "traps": [
    "Leaked sessions run to the 6-hr max duration billing wall-clock the whole time ($0.72/leak Dev, $0.60 Startup); silent volume is the killer: 25 leaked sessions/day = ~4,500 hrs/mo ≈ $540 overage on Developer",
    "keepAlive sessions do NOT die on disconnect — a crashed agent with keepAlive:true bills until explicitly released; always sessions.update(id,{status:'REQUEST_RELEASE'}) in a finally block",
    "1-minute billing minimum per session: 10,000 five-second CI/micro-sessions bill as ~167 hrs; reuse sessions instead of session-per-action/per-poll",
    "proxies:true globally meters every page load at $10-12/GB residential bandwidth (plus 1-MB per-session minimum inflating tiny sessions); media-heavy pages can burn 1 GB in one session — block images, enable proxies selectively",
    "Proxied Fetch API is $4/1k vs $0.5-1/1k unproxied — 4-8x for one flag; Extract $7/1k proxied vs $4/1k",
    "Concurrency ceiling (3 Free / 25 Dev) makes parallel agent swarms 429 and retry-storm into the session-creation rate limit (5/25/50 per min)",
    "Raising the project-wide default timeout in dashboard settings multiplies every leak's cost across all sessions",
    "Model Gateway is a separate market-price LLM bill, easy to miss next to browser hours; 'Runtime/Functions free' still consumes browser minutes via auto-created sessions",
    "Free plan has no overage path: prototypes hard-stop mid-month at 1 hr"
  ],
  "usage_check": "No official spend CLI. API: GET https://api.browserbase.com/v1/projects/{project_id}/usage with header X-BB-API-Key (returns browserMinutes, proxyBytes); SDK: bb.projects.usage(projectId) (Node/Python). Dashboard: https://www.browserbase.com/overview (sessions, browser minutes, proxy data; 24h/7d/30d/billing-cycle ranges); plan/billing under Settings → Usage & billing. Find runaway sessions: GET /v1/sessions?status=RUNNING; kill with POST /v1/sessions/{id} body {\"status\":\"REQUEST_RELEASE\"}. Segment by tagging userMetadata on sessions.",
  "keywords": [
    "browserbase",
    "browserbasehq",
    "@browserbasehq/sdk",
    "@browserbasehq/stagehand",
    "@browserbasehq/cli",
    "@browserbasehq/mcp",
    "stagehand",
    "bb.sessions",
    "browserbase_api_key",
    "browserbase_project_id",
    "x-bb-api-key",
    "api.browserbase.com",
    "connect.browserbase.com",
    "wss://connect.browserbase",
    "pip install browserbase",
    "connectovercdp",
    "session.connecturl",
    "keepalive",
    "browse-cli",
    "bb publish",
    "bb dev"
  ],
  "hint": "Browserbase free: 1 browser-hr/mo (hard stop), 3 concurrent, 15-min max session, no proxies. Dev $20=100hrs/25conc, Startup $99=500hrs/100conc. 1-min billing floor per session; #1 trap: leaked/keepAlive sessions bill to 6-hr cap and survive disconnect — always REQUEST_RELEASE in finally.",
  "conflicts": [
    "'Most popular' plan label: Report A said Developer, Report B said Startup — pricing page fetch confirms it is on Startup ($99). B wins.",
    "Developer data retention: pricing page says 30 days, docs plan table says 7 days (verified by live fetch of both official pages; genuinely inconsistent between Browserbase's own sources). Per tie-break rule the pricing page (30 days) wins, but docs' 7 days is noted since retention is a limit, not a charge.",
    "Startup Fetch overage: A said $0.50/1k, B noted a $1/1k bullet on marketing copy — both live fetches (pricing page and docs) confirm $0.5/1k. Resolved: $0.5/1k.",
    "Free concurrent browsers: A noted a third-party tracker showing 1 — both official pages confirm 3. Resolved: 3.",
    "Scale plan hours: pricing page shows '500+ usage-based', docs say 'Flexible' — no material conflict, kept as flexible/usage-based."
  ],
  "sources": [
    "https://www.browserbase.com/pricing (fetched 2026-07-17)",
    "https://docs.browserbase.com/account/billing/plans (fetched 2026-07-17)",
    "https://docs.browserbase.com/reference/api/get-project-usage",
    "https://docs.browserbase.com/optimizations/cost/measuring-usage",
    "https://docs.browserbase.com/optimizations/cost/cost-optimization",
    "https://docs.browserbase.com/platform/browser/long-sessions/keep-alive",
    "https://docs.browserbase.com/platform/browser/long-sessions/timeouts",
    "https://docs.browserbase.com/account/billing/plan-management",
    "https://www.browserbase.com/changelog/massive-price-decrease",
    "https://www.browserbase.com/blog/series-b-and-beyond"
  ]
}
```

## Engine A — Claude web research (raw)

BROWSERBASE PRICING/QUOTA FACTSHEET — verified 2026-07-17 against official pricing page and docs

## 1. Metered billing dimensions
Browserbase bills a flat monthly plan fee plus usage overages on these meters (no per-seat fees):
- **Browser time** ("browser hours") — wall-clock time sessions are RUNNING (not CPU time). Billed per minute with a **1-minute minimum per session**. A 30-min session = 0.5 browser hours; a thousand 30-second sessions ≈ 8.3 hrs (each rounds up to 1 min). Source: https://docs.browserbase.com/account/billing/plans, https://www.browserbase.com/pricing
- **Proxy bandwidth** — billed per MB with a **1-MB minimum per session** when proxies are enabled; sold in GB. Source: https://docs.browserbase.com/account/billing/plans
- **Search API calls** (per 1,000), **Fetch API calls** (per 1,000, higher rate if proxied), **Extract API calls** (per 1,000). Source: https://www.browserbase.com/pricing
- **Agent runs** (Director/agent calls) — fixed included counts per plan.
- **Model Gateway tokens** — LLM tokens at market/pass-through price ($5 token credit on Free). Source: https://www.browserbase.com/pricing
- Concurrency, session-creation rate, session duration, data retention, and project count are plan LIMITS, not meters. Browser hours and proxy GB are ALLOCATIONS — exceed them and pay-as-you-go overage kicks in automatically (no hard stop on paid plans).

## 2. Free plan — exact quotas
- $0/mo, **1 browser hour/month**, **3 concurrent browsers** (pricing page; docs plan table showed 3, one tracker shows 1 — official page says 3)
- **15 minutes max per session**, **5 session creations/min**
- **0 GB proxy** (no proxies), no CAPTCHA solving, no Stealth, no keepAlive (keepAlive is paid-only)
- 1,000 Search API calls, 1,000 Fetch API calls, 3 agent runs, $5 Model Gateway token credit
- 7-day data retention, 1 project
Sources: https://www.browserbase.com/pricing, https://docs.browserbase.com/account/billing/plans

## 3. Paid plans (current July 2026)
NOTE ON RECENCY: the $20 "Developer" plan replaced the old $39 "Hobby" plan (~June 2025, alongside Series B); concurrency was also raised (Dev 3→25, Startup later to 100). Numbers below are the current post-change rates. Sources: https://www.browserbase.com/changelog/massive-price-decrease, https://www.browserbase.com/blog/series-b-and-beyond

**Developer — $20/mo** ("most popular")
- 100 browser hrs included, overage **$0.12/hr** (= $0.002/min)
- 25 concurrent browsers; 25 session creations/min; **6 hr max session duration**
- 1 GB proxy included, overage **$12/GB**
- 1,000 Search calls (then $7/1k), 1,000 Fetch calls (then $1/1k, $4/1k with proxies), Extract ~$4/1k ($7/1k proxied)
- 15 agent runs, Basic Stealth + auto CAPTCHA solving, up to 2 projects
- Data retention: pricing page says 30 days, docs plan table says 7 days (discrepancy; assume 7–30)

**Startup — $99/mo**
- 500 browser hrs included, overage **$0.10/hr**
- 100 concurrent browsers; 50 session creations/min; 6 hr max session
- 5 GB proxy included, overage **$10/GB**
- 10,000 Fetch calls (then $0.50/1k; $4/1k proxied), 1,000 Search calls ($7/1k), 50 agent runs
- 30-day retention, up to 5 projects, priority support

**Scale — custom**
- 250+ concurrent, 150+ creations/min, 6+ hr sessions, flexible usage-based hours/proxy, Advanced Stealth, Verified Identity, HIPAA BAA/DPA/SSO, Slack support
Sources: https://www.browserbase.com/pricing, https://docs.browserbase.com/account/billing/plans

## 4. Sweet spots & first-quota-to-blow
- **Free**: demo/eval only. 1 hr/mo = ~60 one-minute scrapes or a handful of agent test runs; a single afternoon of agent dev exhausts it. First blown: **browser hours** (and the 15-min session cap breaks any long agent task).
- **Developer $20**: solo dev / one production agent. 100 hrs ≈ 3,000 sub-2-min page tasks (Browserbase's own math) or ~200 half-hour agent sessions. First blown for agent workloads: usually **proxy GB** (1 GB is tiny — heavy JS pages average 2–5 MB/page ⇒ 1 GB ≈ 200–500 proxied page loads, gone in days if proxies are on by default), then browser hours. A parallel test suite blows the **25-concurrent** cap first.
- **Startup $99**: small team / production agent fleet or CI browser tests. 500 hrs supports ~15k short tasks/mo; 100 concurrent handles parallel eval runs. First blown: **proxy GB** again (5 GB) for scraping-heavy agents, or **browser hours** if agents idle (10 always-on 6-hr keepAlive sessions/day = 1,800 hrs/mo ⇒ +$130 overage).
- Overage is cheap enough ($0.10–0.12/hr) that hours rarely justify upgrading; upgrade Dev→Startup for **concurrency (25→100)** or proxy volume ($12→$10/GB and 5 GB included). Break-even Dev+overage vs Startup: ~$79/0.12 ≈ +660 extra browser hrs.

## 5. Cost traps for AI-agent usage
- **Leaked long-running sessions**: a session nobody closes runs to its timeout — up to the **6-hour max** — billing the whole time. Cost per leaked session: 6 hr × $0.12 = **$0.72** (Dev) / $0.60 (Startup). The real damage is silent volume: an agent loop leaking 25 sessions/day to the 6-hr cap = 4,500 hrs/mo ≈ **$540/mo** overage on Developer. Worse: **keepAlive sessions do NOT die on disconnect** — they run until explicitly stopped via API/dashboard or timeout, so a crashed agent with `keepAlive: true` keeps billing. Always `sessions.update(id, {status:"REQUEST_RELEASE"})` in a finally block. Sources: https://docs.browserbase.com/platform/browser/long-sessions/timeouts, https://docs.browserbase.com/platform/browser/long-sessions/keep-alive, https://www.browserbase.com/changelog/increased-reliability-for-keepalive
- **Raising the project-wide default timeout** in dashboard settings multiplies every leak's cost across all sessions.
- **Proxies left on globally**: `proxies: true` on every session turns each page load into metered residential bandwidth at $12/GB; video/streaming pages or downloading assets through the proxy can burn 1 GB in one session (1-MB per-session minimum also inflates thousands of tiny sessions).
- **Per-test provisioning**: 1-minute billing minimum means 10,000 five-second CI sessions bill as 10,000 minutes ≈ 167 hrs. Reuse sessions via keepAlive (docs explicitly recommend this to avoid the minimum) — but then remember to kill them.
- **Polling loops that create a session per poll**: hits both the 1-min minimum and the session-creation rate limit (25/min Dev), then queues/fails.
- **Proxied Fetch API**: $4/1k vs $0.50–1/1k unproxied — 4–8x for one flag.
- **Concurrency ceiling** (3 free / 25 Dev) makes parallel agent swarms fail with session-create errors, prompting retry storms that eat the creation rate limit.

## 6. Checking usage/spend
- **No official CLI.** Use API or dashboard.
- **API**: `GET https://api.browserbase.com/v1/projects/{project_id}/usage` with header `X-BB-API-Key: $BROWSERBASE_API_KEY`. Returns `browserMinutes` (integer, minutes) and `proxyBytes` (integer, bytes). Source: https://docs.browserbase.com/reference/api/get-project-usage
- SDK: `await bb.projects.usage(projectId)` (Node) / `bb.projects.usage(project_id)` (Python). Source: https://docs.browserbase.com/optimizations/cost/measuring-usage
- **Dashboard**: https://www.browserbase.com/overview (total sessions, browser minutes, avg duration, proxy data, status breakdown); billing/plan under dashboard Settings → Billing.
- List runaway sessions: `GET https://api.browserbase.com/v1/sessions?status=RUNNING` (same auth); kill with `POST /v1/sessions/{id}` body `{"status":"REQUEST_RELEASE","projectId":...}`. Source: https://docs.browserbase.com/reference/api/update-session

## 7. Keyword triggers (shell/command indicators)
`browserbase`, `browserbasehq`, `@browserbasehq/sdk`, `@browserbasehq/stagehand`, `stagehand`, `bb.sessions`, `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID`, `X-BB-API-Key`, `api.browserbase.com`, `connect.browserbase.com` (CDP websocket URL), `wss://connect.browserbase`, `browserbase/mcp` / `@browserbasehq/mcp` (MCP server), `pip install browserbase`, `keepAlive` + `proxies: true` in session-create payloads.

Primary sources: https://www.browserbase.com/pricing | https://docs.browserbase.com/account/billing/plans | https://docs.browserbase.com/reference/api/get-project-usage | https://docs.browserbase.com/optimizations/cost/measuring-usage | https://docs.browserbase.com/platform/browser/long-sessions/timeouts | https://docs.browserbase.com/platform/browser/long-sessions/keep-alive | https://www.browserbase.com/blog/series-b-and-beyond

## Engine B — grok CLI (raw)

# Browserbase Pricing / Quota Factsheet  
**As of July 2026** · Verified against official pages (not third-party blogs)

Primary sources: [Pricing](https://www.browserbase.com/pricing) · [Plans docs](https://docs.browserbase.com/account/billing/plans) · [Cost optimization](https://docs.browserbase.com/optimizations/cost/cost-optimization) · [Usage tracking](https://docs.browserbase.com/optimizations/cost/measuring-usage) · [Concurrency](https://docs.browserbase.com/optimizations/concurrency/overview) · [Project Usage API](https://docs.browserbase.com/reference/api/get-project-usage)

---

## 1. Metered billing dimensions

| Dimension | How it bills | Notes |
|-----------|--------------|--------|
| **Browser time** | By the **minute**, rounded; **1-minute minimum per session** | Allocated as **browser hours**/month; overages in $/browser hr |
| **Proxy bandwidth** | By the **MB**, rounded; **1 MB minimum per session** | Allocated as **GB**/month; overages in $/GB |
| **Search API** | Per **1,000 calls** after included quota | Overage **$7/1k** |
| **Fetch API** | Per **1,000 calls** after included quota | Base vs proxy rates differ |
| **Extract** | Per **1,000 calls** (overage) | Higher with proxies |
| **Agents (Agent runs)** | Monthly **call** allocation | Custom on Scale |
| **Model Gateway** | **Pay-as-you-go at market price** (paid plans); Free includes **$5** token credit | Separate from browser hours |
| **Runtime / Functions** | **Included free** on every plan (Functions auto-create sessions that still consume browser minutes) | No separate Functions seat fee |
| **Seats / users** | **Not** the primary meter | Org/plan features, not per-seat browser billing |
| **Storage / data retention** | **Retention window** by plan (7 or 30+ days), not a GB storage line item | Longer retention on higher plans |

**Hard capacity limits (not pure meters):** concurrent browsers, max session duration, session-create rate (/min). Hitting them yields **429**, not an overage charge.

---

## 2. Free tier — exact quotas

| Item | Quota | Unit |
|------|--------|------|
| Price | **$0** | /month (no credit card) |
| Concurrent browsers | **3** | sessions at once |
| Browser hours | **1 hr** (60 minutes) | /month |
| Proxy | **0 GB** | proxies not available |
| Session duration max | **15 minutes** | per session |
| Session creation rate | **5 / min** | |
| Agent runs | **3** | calls / month |
| Search | **1,000** | calls / month |
| Search rate limit | **2 / sec** | |
| Fetch | **1,000** | calls / month |
| Fetch rate limit | **5 / sec** | |
| Data retention | **7 days** | |
| Projects | **1** | |
| Models | **$5** in tokens | one-time-style credit on Free |
| Runtime | Included | |
| Captcha / Verified identity | **No** | |
| Hours / proxy overage | **N/A** (no pay-as-you-go on Free for hours/proxy) | Soft cap behavior: use allocation only |

Sources: [pricing](https://www.browserbase.com/pricing), [plans](https://docs.browserbase.com/account/billing/plans).

> Note: A Feb 2025 free-plan blog said “60 minutes/month”; that matches the current **1 browser hour** on official pricing/docs. Prefer the live pricing/docs tables over older blog copy.

---

## 3. Paid plans

### Developer — **$20 / month**

| | Included | Overage |
|--|----------|---------|
| Concurrent browsers | **25** | (hard limit; upgrade for more) |
| Browser hours | **100 hrs** | **$0.12 / browser hr** ≈ **$0.002 / min** |
| Proxy | **1 GB** | **$12 / GB** |
| Agent runs | **15** | — |
| Search | **1,000** | **$7 / 1k** |
| Fetch | **1,000** | **$1 / 1k**; **$4 / 1k with proxies** |
| Extract | — | **$4 / 1k**; **$7 / 1k with proxies** |
| Session duration | **6 hrs** max | |
| Session create rate | **25 / min** | |
| Data retention | **7 days** | |
| Projects | **Up to 2** | |
| Captcha | Auto | |
| Identity | Basic stealth | |
| Models | Model Gateway, market price | |
| Runtime | Included | |

### Startup — **$99 / month** (“Most popular”)

| | Included | Overage |
|--|----------|---------|
| Concurrent browsers | **100** | hard limit |
| Browser hours | **500 hrs** | **$0.10 / browser hr** ≈ **$0.00167 / min** |
| Proxy | **5 GB** | **$10 / GB** |
| Agent runs | **50** | — |
| Search | **1,000** | **$7 / 1k** |
| Fetch | **10,000** | Docs: **$0.5 / 1k** overage; **$4 / 1k with proxies** (marketing page sometimes lists $1/1k in one bullet — **docs comparison table / plans page use $0.5**) |
| Extract | — | **$4 / 1k**; **$7 / 1k with proxies** |
| Session duration | **6 hrs** max | |
| Session create rate | **50 / min** | |
| Data retention | **30 days** | |
| Projects | **Up to 5** | |
| Support | Priority | |
| Captcha / identity | Auto + Basic | |
| Models / Runtime | Gateway market price / included | |

### Scale — **Custom (contact sales)**

| | Directional |
|--|-------------|
| Concurrent | **250+** |
| Browser hours | Flexible / usage-based |
| Proxy | Usage-based |
| Agent / Search / Fetch | Custom / usage-based |
| Session duration | **6+ hrs** |
| Session create | **150+ / min** |
| Identity | **Verified** + captcha |
| Compliance | HIPAA BAA, DPA, SSO, pen tests |

Sources: [pricing](https://www.browserbase.com/pricing), [plans](https://docs.browserbase.com/account/billing/plans).

---

## 4. Sweet spots & what an agent-built app burns first

Browserbase’s own rule of thumb: *“A typical web scrape runs in under 2 minutes. 100 hours is roughly 3,000 page-level tasks.”* ([pricing FAQ](https://www.browserbase.com/pricing))

| Plan | Fits | Typical first blow-through for agent apps |
|------|------|-------------------------------------------|
| **Free** | Prototyping, demos, local agent experiments | **Browser hours (1 hr)** first — ~30–60 short sessions (1-min floor) or ~4 full 15-min max sessions. **Concurrency (3)** if multi-agent. **Proxies = 0** so geo/stealth work is a hard wall. **Agent runs (3)** if using their Agents product. |
| **Developer $20** | Solo/hobby production, low-volume agents, CI smoke | **Browser hours (100)** if sessions stay open or agents loop. **Proxy GB (1)** if residential proxies on media-heavy sites. **Fetch (1k)** if agent prefers Fetch/Search over full browser. **Concurrency (25)** under parallel CI/agent fleets. |
| **Startup $99** | Production multi-agent / customer-facing browse | **Browser hours (500)** under long-lived or always-on agents. **Proxy (5 GB)** under image-heavy scrapes with proxies on. **Fetch (10k)** lasts longer than Dev. **Concurrency (100)** for burst parallel jobs. |
| **Scale** | High concurrency, Verified identity, compliance | Custom — usually concurrency + verified access + volume discounts |

### Agent-app profile (small web app + chatty DB + auto-deploys + sandboxed code)

Browserbase is **browser infrastructure**, not the DB/deploy/sandbox bill. For the BB slice only:

1. **Usually first: browser minutes** — every Playwright/Stagehand session bills wall-clock (min 1 min). Agent think-time + page waits count.  
2. **Second: concurrency** — parallel tool calls / CI matrix → 429s before dollar overages.  
3. **Third: proxy GB** — if proxies enabled for anti-bot; images/fonts/media inflate MB.  
4. **Fetch/Search** — only if the app uses those APIs instead of (or in addition to) full browser sessions.  
5. **Agent runs (3 / 15 / 50)** — only if using Browserbase Agents product; can cap before hours if agents are chatty.

**Rough hour math (Developer, 100 hrs included):**  
- ~**1–2 min** avg task → ~3,000–6,000 tasks/mo inside quota  
- **5 min** agent steps → ~1,200 tasks  
- **Keep-alive / poll every minute** with new session each time → 1 min minimum × N burns hours *fast*  
- Overage after 100 hrs: **$0.12/hr** → e.g. +50 hrs = **+$6**

---

## 5. Cost traps (AI-agent patterns) + leaked long sessions

| Trap | Why it hurts | Ballpark impact |
|------|----------------|-----------------|
| **Leaked / forgotten sessions** | Billed until close or plan **max duration** | **Free:** hard stop at **15 min** (burns ≤15 of 60 min). **Dev/Startup:** up to **6 hrs/session** → **6 browser hours** each. At overage: Dev **6 × $0.12 = $0.72**; Startup **6 × $0.10 = $0.60**. Ten leaked full sessions ≈ **$6–7** overage + concurrency slots held. |
| **1-minute minimum per session** | Open/close for a 5s check still bills **1 min** | 1,000 micro-sessions → **≥1,000 min ≈ 16.7 hrs** even if real work was seconds |
| **New session per tool call / per agent step** | Agents often “session-per-action” | Multiplies min floors; docs push **reuse session** / reconnect with `sessionId` |
| **Polling loops with live browser** | Page open while LLM thinks | Wall-clock minutes = $$; prefer disconnect/reconnect or shorter sessions |
| **Proxies always-on** | Proxy MB + higher Fetch/Extract rates | **$10–12/GB**; Fetch **$4/1k** with proxies vs **$0.5–1/1k** without |
| **Loading images/media through proxies** | Bandwidth waste | Docs: block images when visual not needed |
| **CI: new browser per test** | Matrix × retries × PRs | Hits **create rate** and **concurrency**; burns hours with 1-min floors |
| **Keep-alive without reuse strategy** | Long sessions hold concurrency | Good for reuse; disaster if never released |
| **Functions still create sessions** | “Runtime free” ≠ free minutes | Function invocations appear in usage metrics |
| **Model Gateway** | Separate market-price LLM bill | Easy to miss next to browser hours |
| **Free has no hour overage path** | Hit 1 hr → stop, not pay | Agent prototypes die mid-month |

Official mitigation: reuse sessions (1-min floor), selective proxies, block images when safe, use Functions for short event-driven jobs ([cost optimization](https://docs.browserbase.com/optimizations/cost/cost-optimization)).

---

## 6. How to check current usage / spend

| Method | Exact path |
|--------|------------|
| **Dashboard** | [https://www.browserbase.com/overview](https://www.browserbase.com/overview) — sessions, browser minutes, proxy; ranges: 24h / 7d / 30d / billing cycle |
| **Billing / plan change** | Settings → **Usage & billing** → Change plan ([plan management](https://docs.browserbase.com/account/billing/plan-management)) |
| **API** | `GET https://api.browserbase.com/v1/projects/{id}/usage` · Header: `X-BB-API-Key` · Response: `browserMinutes`, `proxyBytes` |
| **SDK** | Node: `bb.projects.usage(projectId)` · Python: `bb.projects.usage(project_id)` |
| **CLI for usage** | No dedicated “show spend” CLI documented; product CLIs are for browse/sessions/functions (`browse`, `@browserbasehq/cli`, `bb` via Functions SDK). **Usage = dashboard or Usage API.** |
| **Segmentation** | Tag `userMetadata` on sessions; filter via sessions list `q=user_metadata['key']:'value'` |

---

## 7. Keyword triggers (shell / codebase)

Short lowercase signals that Browserbase (or its stack) is in play:

```
browserbase
browserbasehq
@browserbasehq
bb.sessions
BROWSERBASE_API_KEY
BROWSERBASE_PROJECT_ID
X-BB-API-Key
stagehand
@browserbasehq/sdk
@browserbasehq/cli
browse-cli
npm i -g browse
bb publish
bb dev
sdk-functions
connectOverCDP
session.connectUrl
```

Related (often co-present, not BB-only): `playwright-core`, `puppeteer`, `chromium.connect_over_cdp`.

---

## Quick reference card

| Plan | $/mo | Concurrent | Browser hours | Proxy | Max session | Hour overage | Proxy overage |
|------|------|------------|---------------|-------|-------------|--------------|---------------|
| Free | $0 | 3 | 1 | 0 GB | 15 min | — | — |
| Developer | $20 | 25 | 100 | 1 GB | 6 hr | $0.12/hr | $12/GB |
| Startup | $99 | 100 | 500 | 5 GB | 6 hr | $0.10/hr | $10/GB |
| Scale | Custom | 250+ | Flexible | Usage | 6+ hr | Custom | Custom |

**Leaked long session ceiling (paid):** 6 hours × overage rate ≈ **$0.60–$0.72** per abandoned full-length session, plus locked concurrency until timeout.

---

**Sources (every number above):**  
- https://www.browserbase.com/pricing  
- https://docs.browserbase.com/account/billing/plans  
- https://docs.browserbase.com/optimizations/cost/cost-optimization  
- https://docs.browserbase.com/optimizations/cost/measuring-usage  
- https://docs.browserbase.com/optimizations/concurrency/overview  
- https://docs.browserbase.com/reference/api/get-project-usage  
- https://docs.browserbase.com/account/billing/plan-management
