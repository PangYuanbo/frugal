# Research archive: cloudflare

Raw dual-engine research output (2026-07-17). Engine A = Claude subagent with web search; Engine B = grok CLI (`grok -p`, web search enabled). The merged factsheet cross-checks both, preferring official pricing pages on conflicts.

## Merged factsheet (cross-checked)

```json
{
  "provider": "Cloudflare (Developer Platform: Workers, KV, D1, Durable Objects, Queues, R2, Pages, Containers, Workers Builds)",
  "billing_dimensions": [
    "Workers/Pages Functions: requests (per M) + CPU time (per M CPU-ms); wall-clock duration NOT billed; egress free; static asset requests free",
    "R2: storage GB-month, Class A ops (writes/lists) per M, Class B ops (reads) per M, Infrequent Access retrieval $/GB; egress always $0; deletes free",
    "KV: keys read/written/deleted + list requests (per M each), storage GB-month",
    "D1: rows read + rows written (per M), storage GB-month; rows read = rows SCANNED not returned",
    "Durable Objects: requests, duration GB-s wall-clock while active (unlike Workers), SQLite rows read/written + stored GB (billed since Jan 7 2026), legacy KV-backend read/write units",
    "Queues: operations (1 op per 64 KB written/read/deleted; ~3 ops per delivered message)",
    "Workers Builds: build minutes over included; Pages: builds/month (plan-gated)",
    "Containers (Paid only): memory GiB-s, vCPU-s, disk GB-s while running + regional network egress (NOT free, unlike R2/Workers)",
    "Workers Logs: events per M; Hyperdrive: queries/day cap on free",
    "No per-seat billing on the developer platform"
  ],
  "free_tier": "Daily, reset 00:00 UTC, HARD-FAIL (429/errors, never auto-bills): Workers 100,000 req/day + 10 ms CPU/invocation. KV: 100k reads, 1,000 writes, 1,000 deletes, 1,000 lists/day; 1 GB. D1: 5M rows read, 100k rows written/day; 5 GB total, 10 DBs, 500 MB/DB. DO (SQLite backend only): 100k req/day, 13,000 GB-s/day, 5M rows read/100k written/day, 5 GB. Queues: 10,000 ops/day (~3,300 msgs), 24h retention. Workers Logs 200k events/day. Hyperdrive 100k queries/day. Monthly: R2 10 GB-month + 1M Class A + 10M Class B, egress $0 (Standard only; IA has no free tier). Workers Builds 3,000 min/mo (1 concurrent, 20-min timeout). Pages: 500 builds/mo, 1 concurrent, unlimited static requests. Containers: not available on free.",
  "plans": [
    {
      "name": "Workers Free",
      "price": "$0",
      "included": "100k req/day, 10 ms CPU/invocation; KV 1k writes/100k reads/day; D1 5M reads/100k writes/day, 5 GB; DO 100k req + 13k GB-s/day (SQLite only); Queues 10k ops/day; Builds 3,000 min/mo",
      "overage": "None — limits hard-fail with errors instead of billing"
    },
    {
      "name": "Workers Paid",
      "price": "$5/month minimum (covers Workers, Pages Functions, KV, D1, DO, Queues, Containers, Hyperdrive)",
      "included": "10M requests + 30M CPU-ms/mo (CPU cap 30 s default, up to 5 min); KV 10M reads/1M writes/1M deletes/1M lists, 1 GB; D1 25B rows read/50M written, 5 GB; DO 1M req + 400k GB-s + 25B rows read/50M written + 5 GB; Queues 1M ops, retention to 14 d; Builds 6,000 min, 6 concurrent; Logs 20M events; Containers 25 GiB-h mem + 375 vCPU-min + 200 GB-h disk",
      "overage": "Req $0.30/M; CPU $0.02/M CPU-ms; KV reads $0.50/M, writes/deletes/lists $5.00/M, $0.50/GB-mo; D1 $0.001/M read, $1.00/M written, $0.75/GB-mo; DO req $0.15/M, duration $12.50/M GB-s, SQL storage $0.20/GB-mo (KV-backend: reads $0.20/M, writes $1.00/M); Queues $0.40/M; Builds $0.005/min; Logs $0.60/M; Container egress $0.025–0.05/GB by region"
    },
    {
      "name": "R2 (pay-as-you-go, no subscription)",
      "price": "$0 base, usage beyond free tier",
      "included": "10 GB-mo + 1M Class A + 10M Class B free monthly; egress always $0",
      "overage": "Standard: $0.015/GB-mo, Class A $4.50/M, Class B $0.36/M. Infrequent Access: $0.01/GB-mo + 30-day minimum, Class A $9/M, Class B $0.90/M, retrieval $0.01/GB. Usage rounds UP to next billing unit"
    },
    {
      "name": "Pages (zone Pro / Business)",
      "price": "Pro $25/mo; Business $250/mo",
      "included": "Pro: 5,000 builds/mo, 5 concurrent; Business: 20,000 builds/mo, 20 concurrent (free: 500/mo)",
      "overage": "Builds are plan-gated counts, not metered; Pages Functions bill as Workers requests"
    }
  ],
  "first_quota_blown": "Free tier: KV writes (1,000/day) blow first for any app writing session/state per request — dead at ~1k daily page views, often within minutes under load. Runners-up: Workers 100k req/day under polling (one 5s-poll client = 17,280 req/day), D1 100k rows written/day (indexes multiply writes; unindexed scans burn the 5M reads/day), Queues ~3,300 msgs/day, Pages 500 builds/mo at ~16 commits/day. Paid tier: the $5 floor holds until DO duration (400k GB-s ≈ one 128 MB object awake ~36 days) from non-hibernating WebSockets, or KV writes at $5/M.",
  "sweet_spots": "Free fits prototypes/hobby APIs under ~1.1 req/s sustained with few writes. Workers Paid $5 fits nearly all small-to-medium production apps — 10M req + 30M CPU-ms is huge headroom; docs examples: 15M req @7ms ≈ $8/mo, 100M req @7ms ≈ $45/mo; most real bills stay $5–10. D1 paid inclusions (25B reads/50M writes) are effectively never the bottleneck. R2's $0 egress makes it the right home for large downloads (vs S3). Containers require Paid from request one.",
  "traps": [
    "KV write amplification: writes/deletes/lists cost $5.00/M on paid (reads 10x cheaper); a 1/sec heartbeat writer = 2.6M writes/mo ≈ $13. Free tier: 1,000 writes/day dies in minutes under load",
    "Durable Objects kept awake bill wall-clock GB-s at $12.50/M: WebSockets accepted without the Hibernation API, or tight setAlarm loops (each alarm = request + row written), accumulate silently",
    "DO SQLite storage bills since Jan 7 2026 (older estimates omit it): deleting rows isn't enough — call storage.deleteAll() or residual metadata keeps billing GB-month; forgotten per-test DOs charge forever",
    "D1 rows read = rows SCANNED, not returned: an unindexed SELECT in a polling loop reads millions of rows/hour; every index multiplies rows written per INSERT",
    "Per-test provisioning is billable: real wrangler d1 execute / KV put / R2 put in CI burns quota — use --local / Miniflare; R2 bucket churn and multipart parts each count as Class A ops ($4.50/M)",
    "R2 Infrequent Access is wrong for hot agent scratch data: no free tier, 30-day minimum charged even if deleted early, $0.01/GB retrieval",
    "Queues poison messages: each retry re-bills read ops on the 3-ops/message baseline at $0.40/M; tune max retries + DLQ",
    "Auto-deploy on every agent commit: eats Pages 500 free builds/mo (preview+prod each consume one) and Workers Builds 3,000 free min/mo (5-min builds x 20/day exhausts it); build main only",
    "Containers egress is NOT free ($0.025–0.05/GB by region) — don't assume R2's zero-egress applies platform-wide; don't route large downloads through Containers",
    "Cache hits and run_worker_first routes still count as Workers requests on the free 100k/day meter",
    "Free-tier limits hard-fail (429/errors) rather than auto-billing — good for cost control, bad for uptime"
  ],
  "usage_check": "Dashboard (authoritative for spend): dash.cloudflare.com -> Manage Account -> Billing -> Billable Usage (deep link https://dash.cloudflare.com/?to=/:account/billing) + Budget Alerts; per-product metrics under /:account/workers-and-pages, /:account/workers/d1, /:account/r2/overview. No first-class `wrangler billing` command; partial CLI: `wrangler d1 info <DB>` (size, rows read/written this period), `wrangler r2 bucket info <bucket>`, `wrangler pages deployment list`, plus meta.rows_read/rows_written on every D1 response. API: GraphQL Analytics at POST https://api.cloudflare.com/client/v4/graphql (datasets workersInvocationsAdaptive, r2StorageAdaptiveGroups, d1AnalyticsAdaptiveGroups, durableObjectsInvocationsAdaptiveGroups, queueConsumerMetricsAdaptiveGroups); billing history: GET /client/v4/accounts/{account_id}/billing/history.",
  "keywords": [
    "wrangler",
    "npx wrangler",
    "cloudflared",
    "workerd",
    "miniflare",
    "wrangler.toml",
    "wrangler.jsonc",
    "workers.dev",
    "pages.dev",
    "r2.cloudflarestorage.com",
    "wrangler r2",
    "wrangler kv",
    "wrangler d1",
    "wrangler pages",
    "wrangler queues",
    "durable_objects",
    "kv_namespaces",
    "hyperdrive",
    "compatibility_date",
    "cloudflare_api_token",
    "cloudflare_account_id",
    "cf_api_token",
    "dash.cloudflare.com",
    "api.cloudflare.com",
    "getplatformproxy",
    "@cloudflare/vitest-pool-workers"
  ],
  "hint": "CF free (daily, hard-fails): 100k req + 10ms CPU; KV 1k writes (blows first); D1 100k writes, scans bill every row; R2 10GB, $0 egress. Paid $5/mo = 10M req + 30M CPU-ms. Traps: KV writes $5/M; non-hibernated DOs $12.50/M GB-s.",
  "conflicts": [
    "No numeric contradictions found: every quota/price present in both reports matched exactly, and all core figures were re-verified 2026-07-17 against the live official pages (developers.cloudflare.com/workers/platform/pricing/ and /r2/pricing/)",
    "Usage-via-CLI: Report A implied wrangler covers usage checks; Report B (and docs) correct that there is no wrangler billing/spend command — resolved as B for spend (Billable Usage dashboard/GraphQL), keeping A's per-resource commands (wrangler d1 info etc.) as partial signals",
    "Builds coverage gap, not a conflict: A reported Pages builds (500 free/mo; Pro 5,000/Business 20,000) while B reported Workers Builds minutes (3,000 free / 6,000 paid + $0.005/min) — separate products, both retained",
    "Single-source items accepted after live verification on the official Workers pricing page: Containers, Workers Logs (200k/day free; 20M + $0.60/M paid), Hyperdrive 100k queries/day (all B-only); DO SQLite storage billing effective Jan 7 2026 and DO KV-backend unit rates (A-only, backed by official changelog URL)",
    "Minor omission noted: the live page summary listed KV free writes/deletes but both reports agree list requests are also 1,000/day — kept per both reports' citation of the KV pricing page"
  ],
  "sources": [
    "https://developers.cloudflare.com/workers/platform/pricing/",
    "https://developers.cloudflare.com/r2/pricing/",
    "https://developers.cloudflare.com/kv/platform/pricing/",
    "https://developers.cloudflare.com/d1/platform/pricing/",
    "https://developers.cloudflare.com/durable-objects/platform/pricing/",
    "https://developers.cloudflare.com/queues/platform/pricing/",
    "https://developers.cloudflare.com/pages/functions/pricing/",
    "https://developers.cloudflare.com/pages/platform/limits/",
    "https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/",
    "https://developers.cloudflare.com/changelog/post/2025-12-12-durable-objects-sqlite-storage-billing/",
    "https://developers.cloudflare.com/billing/manage/billable-usage/",
    "https://developers.cloudflare.com/analytics/graphql-api/"
  ]
}
```

## Engine A — Claude web research (raw)

CLOUDFLARE PRICING/QUOTA FACTSHEET — verified 2026-07-17 against official developers.cloudflare.com pricing pages

=== 1. METERED BILLING DIMENSIONS ===
- Workers: requests (per million) + CPU time (per million CPU-milliseconds). Wall-clock duration is NOT billed on the standard model; egress from Workers is free. (https://developers.cloudflare.com/workers/platform/pricing/)
- R2: storage (GB-month), Class A ops (writes/lists, per million), Class B ops (reads, per million), Infrequent Access data retrieval (per GB). EGRESS IS $0 — this is R2's headline feature. (https://developers.cloudflare.com/r2/pricing/)
- KV: per-key reads, writes, deletes, list requests (per million each) + storage GB-month. (https://developers.cloudflare.com/kv/platform/pricing/)
- D1: rows read, rows written (per million), storage GB-month. No compute or transfer fees. (https://developers.cloudflare.com/d1/platform/pricing/)
- Durable Objects: requests, duration (GB-seconds of wall-clock while active — this DOES bill duration, unlike Workers), plus SQLite rows read/written and stored GB. (https://developers.cloudflare.com/durable-objects/platform/pricing/)
- Queues: operations, where 1 op = each 64 KB written/read/deleted; a normal message lifecycle = 3 ops (write+read+delete). (https://developers.cloudflare.com/queues/platform/pricing/)
- Pages: builds per month (plan-gated count, not metered); Pages Functions bill as Workers requests; static asset requests free/unlimited. (https://developers.cloudflare.com/pages/functions/pricing/, https://developers.cloudflare.com/pages/platform/limits/)
- No per-seat billing on the developer platform.

=== 2. FREE TIER — EXACT QUOTAS ===
Workers Free (daily, reset 00:00 UTC; hard-fail when exceeded):
- 100,000 requests/day; 10 ms CPU per invocation
- KV: 100,000 reads/day; 1,000 writes/day; 1,000 deletes/day; 1,000 lists/day; 1 GB storage
- D1: 5,000,000 rows read/day; 100,000 rows written/day; 5 GB total storage
- Durable Objects (SQLite backend only on free): 100,000 requests/day; 13,000 GB-s duration/day; 5M SQLite rows read/day; 100K rows written/day; 5 GB total
- Queues: 10,000 operations/day, 24-hour retention
R2 free (monthly, Standard class only): 10 GB-month storage; 1,000,000 Class A ops/month; 10,000,000 Class B ops/month; egress free. 
Pages free: 500 builds/month, 1 concurrent build, 20,000 files/site, 100 custom domains, unlimited preview deployments and static requests.
Sources: workers/platform/pricing, kv/platform/pricing, d1/platform/pricing, durable-objects/platform/pricing, r2/pricing, queues/platform/pricing, pages/platform/limits (all under https://developers.cloudflare.com/).

=== 3. PAID PLANS ===
Workers Paid — $5/month minimum (single plan covering Workers, KV, D1, DO, Queues; monthly quotas):
- Requests: 10M included, then $0.30/million
- CPU: 30,000,000 CPU-ms included, then $0.02 per additional million CPU-ms; no duration charge or 10 ms cap (default limit 30 s CPU, configurable up to 5 min)
- KV: 10M reads incl (+$0.50/M); 1M writes (+$5.00/M); 1M deletes (+$5.00/M); 1M lists (+$5.00/M); 1 GB storage (+$0.50/GB-mo)
- D1: 25 billion rows read/mo incl (+$0.001/M); 50M rows written/mo (+$1.00/M); 5 GB storage (+$0.75/GB-mo)
- Durable Objects: 1M requests (+$0.15/M); 400,000 GB-s duration (+$12.50/M GB-s); SQLite storage: 25B rows read (+$0.001/M), 50M rows written (+$1.00/M), 5 GB-month (+$0.20/GB-mo). KV-backend DOs: 1M read units (+$0.20/M), 1M write units (+$1.00/M), 1 GB (+$0.20/GB-mo)
- Queues: 1M operations/mo included, then $0.40/million; retention 4 days default, up to 14
R2 (pay-as-you-go, no subscription; beyond free tier):
- Standard: $0.015/GB-month; Class A $4.50/M; Class B $0.36/M
- Infrequent Access: $0.01/GB-month; Class A $9.00/M; Class B $0.90/M; retrieval $0.01/GB; 30-day minimum storage duration. Usage rounds UP to next billing unit.
Pages Pro $25/mo: 5,000 builds, 5 concurrent; Business $250/mo: 20,000 builds, 20 concurrent (these are the zone Pro/Business plans).
RECENT CHANGE TO NOTE: Durable Objects SQLite STORAGE billing (rows read/written + GB) only started being charged Jan 7, 2026 — older cost estimates omit it (https://developers.cloudflare.com/changelog/post/2025-12-12-durable-objects-sqlite-storage-billing/). Rates match D1 by design.

=== 4. SWEET SPOTS & FIRST QUOTA BLOWN ===
- Free tier fits: hobby site, low-traffic API (<100K req/day ≈ 1.1 req/s sustained), static Pages site.
- $5 Workers Paid fits: nearly every small-to-medium production app; 10M req + 30M CPU-ms is enormous headroom. Most real bills stay $5–10/mo.
- For a typical agent-built app, the FIRST quota blown on FREE tier is almost always KV writes (1,000/day) — a session store or counter writing per-request dies at ~1K daily page views; second is D1 rows written (100K/day) — an ORM writing logs/sessions, or a chatty seed script, hits this in one busy afternoon (note: one INSERT can count many rows written due to indexes). Third: Workers 10 ms CPU cap breaks anything doing JSON-heavy transforms or crypto.
- On PAID, the first surprise line item is usually DO duration GB-s (400K included ≈ one 128 MB DO active 24/7 for ~36 days; a few always-awake WebSocket/agent DOs exceed it) or KV writes at $5/million.
- R2 free 10 GB is blown first by storing build artifacts/model files; Class A 1M/month is blown by per-test bucket churn or multipart uploads (each part = Class A op).
- Pages free 500 builds/month is blown by auto-deploy-on-every-commit agents at ~16 commits/day (preview + prod each consume a build).

=== 5. COST TRAPS FOR AI-AGENT USAGE ===
- Polling loops against KV: writes/deletes/lists are $5.00/million on paid — an agent poll-writing a heartbeat every second = 2.6M writes/mo ≈ $13. Reads are 10x cheaper; restructure to read-mostly.
- Durable Objects kept awake: any in-flight request/WebSocket (without hibernation API) bills wall-clock GB-s at $12.50/M GB-s. Agents that open WebSockets and never close them, or setAlarm() tight loops (each setAlarm = 1 row written), accumulate silently. Use WebSocket Hibernation.
- DO SQLite storage now bills (since Jan 2026): deleting rows isn't enough — must call storage.deleteAll() or residual metadata keeps billing storage. Forgotten per-test DOs = permanent GB-month charges.
- D1 "rows read" ≠ rows returned: full-table scans bill every row scanned. An unindexed SELECT in a polling loop can read millions of rows per hour. Also every index write multiplies rows written.
- R2: zero egress is safe for big downloads, BUT per-test bucket provisioning churns Class A ops ($4.50/M), and Infrequent Access has a 30-day minimum + $0.01/GB retrieval — don't put hot agent scratch data there. Multipart upload parts round up per-GB-unit.
- Queues: retries and DLQ re-drives multiply the 3-ops-per-message baseline; a poison message retrying forever burns ops at $0.40/M.
- Pages auto-deploy on every agent commit eats the 500 free builds/month; disable preview builds for bot branches.
- Free tier failure mode: limits HARD-FAIL (errors), they don't auto-bill — good for cost, bad for uptime.

=== 6. CHECKING USAGE/SPEND ===
- Dashboard: https://dash.cloudflare.com/?to=/:account/billing (invoices/spend); per-product usage under https://dash.cloudflare.com/?to=/:account/workers-and-pages (Workers metrics), /:account/r2/overview, /:account/workers/d1, /:account/workers/kv/namespaces.
- CLI: no single "usage" command, but: `wrangler d1 info <DB_NAME>` (shows DB size, rows read/written this period); `npx wrangler r2 bucket info <bucket>`; `wrangler queues list`; `wrangler pages deployment list`.
- API: GraphQL Analytics API at POST https://api.cloudflare.com/client/v4/graphql — datasets `workersInvocationsAdaptive` (requests/CPU), `r2OperationsAdaptiveGroups` / `r2StorageAdaptiveGroups`, `d1AnalyticsAdaptiveGroups`, `durableObjectsInvocationsAdaptiveGroups`, `queueConsumerMetricsAdaptiveGroups` (https://developers.cloudflare.com/analytics/graphql-api/). Billing REST: GET https://api.cloudflare.com/client/v4/accounts/{account_id}/billing/history.

=== 7. KEYWORD TRIGGERS (shell) ===
`wrangler`, `npx wrangler`, `cloudflared`, `r2` (wrangler r2 / .r2.cloudflarestorage.com endpoints), `kv` (wrangler kv namespace/key), `d1` (wrangler d1 execute/migrations), `pages` (wrangler pages deploy), `queues`, `durable_objects` / `durable-objects` (wrangler.toml/wrangler.jsonc bindings), `workers.dev`, `pages.dev`, `wrangler.toml`, `wrangler.jsonc`, `CLOUDFLARE_API_TOKEN`, `CF_ACCOUNT_ID`, `dash.cloudflare.com`, `api.cloudflare.com`.

SOURCES
- Workers: https://developers.cloudflare.com/workers/platform/pricing/
- R2: https://developers.cloudflare.com/r2/pricing/
- KV: https://developers.cloudflare.com/kv/platform/pricing/
- D1: https://developers.cloudflare.com/d1/platform/pricing/
- Durable Objects: https://developers.cloudflare.com/durable-objects/platform/pricing/
- DO SQLite storage billing changelog (Jan 2026 change): https://developers.cloudflare.com/changelog/post/2025-12-12-durable-objects-sqlite-storage-billing/
- Queues: https://developers.cloudflare.com/queues/platform/pricing/
- Pages Functions pricing: https://developers.cloudflare.com/pages/functions/pricing/
- Pages limits (builds): https://developers.cloudflare.com/pages/platform/limits/
- GraphQL Analytics API: https://developers.cloudflare.com/analytics/graphql-api/

## Engine B — grok CLI (raw)

# Cloudflare pricing & quotas factsheet (as of July 2026)

**Sources:** official docs only — [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/), [KV](https://developers.cloudflare.com/kv/platform/pricing/), [D1](https://developers.cloudflare.com/d1/platform/pricing/), [Durable Objects](https://developers.cloudflare.com/durable-objects/platform/pricing/), [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/), [Pages Functions](https://developers.cloudflare.com/pages/functions/pricing/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [Billable usage](https://developers.cloudflare.com/billing/manage/billable-usage/).

**Model summary:** There is no multi-tier seat catalog for these products. Developer Platform is **Workers Free (default)** vs **Workers Paid ($5/mo minimum)**, plus **R2’s independent free monthly allotment**. Most storage/compute overages are usage-based on top of Paid.

---

## 1. Metered billing dimensions

| Sub-service | What bills | What does **not** bill |
|-------------|------------|-------------------------|
| **Workers / Pages Functions** | Inbound **requests**; **CPU time** (ms) | Duration/wall clock (Workers); **egress/bandwidth**; subrequests out of a Worker; static asset requests |
| **Workers Builds (CI)** | **Build minutes** (over included) | — |
| **R2** | **Storage** (GB-month); **Class A** ops; **Class B** ops; Infrequent Access **data retrieval** ($/GB) | **Egress to Internet** (always free from R2 itself); DeleteObject / DeleteBucket / AbortMultipartUpload |
| **KV** | Keys **read / written / deleted**; **list** requests; **stored data** (GB-month) | Egress |
| **D1** | **Rows read**; **rows written**; **storage** (GB-month) | Egress; idle compute |
| **Durable Objects** | **Requests** (HTTP, RPC session, WS messages w/ 20:1, alarms); **duration** (GB-s wall-clock while active/not hibernating); SQLite **rows read/written** + **SQL storage**; legacy KV backend request units | Idle hibernated objects (no duration) |
| **Queues** | **Operations** (write/read/delete per 64 KB message chunk); ~3 ops per delivered message | Egress/bandwidth |
| **Containers** (sandbox code; Paid only) | **Memory** (GiB-s), **CPU** (vCPU-s), **Disk** (GB-s) while running; **network egress** by region | Idle after sleep |
| **Hyperdrive** | Free: **queries/day** cap; Paid: unlimited | — |
| **Seats / users** | Not a dimension for these products | — |

Workers Paid is a **separate** product from Cloudflare zone plans (Free/Pro/Business).

---

## 2. Free tier — exact quotas

### Workers Free (default account)

| Metric | Free quota | Notes |
|--------|------------|--------|
| Workers / Pages Functions **requests** | **100,000 / day** | Shared Free pool (Workers + Pages Functions). Resets **00:00 UTC**. |
| **CPU time / invocation** | **10 ms** max | Hard limit, not just a bill |
| **Duration** | No charge | Free has no duration bill |
| **Static assets** | Free & unlimited | Only dynamic Worker invocations count |
| Workers Logs | **200,000 events/day**, 3-day retention | |
| Hyperdrive queries | **100,000 / day** | |

Sources: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [limits](https://developers.cloudflare.com/workers/platform/limits/), [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/).

### KV (on Workers Free)

| Metric | Free |
|--------|------|
| Keys read | **100,000 / day** |
| Keys written | **1,000 / day** |
| Keys deleted | **1,000 / day** |
| List requests | **1,000 / day** |
| Stored data | **1 GB** |

Daily reset **00:00 UTC**; exceeding a dimension **fails** that op type.  
Source: [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/).

### D1 (on Workers Free)

| Metric | Free |
|--------|------|
| Rows read | **5 million / day** |
| Rows written | **100,000 / day** |
| Storage | **5 GB total** (account) |
| Databases / account | **10** |
| Max DB size | **500 MB** |

Sources: [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/).

### Durable Objects (Free = SQLite-backed only)

| Metric | Free |
|--------|------|
| Requests | **100,000 / day** |
| Duration | **13,000 GB-s / day** |
| Rows read | **5 million / day** |
| Rows written | **100,000 / day** |
| SQL stored data | **5 GB total** |

Source: [Workers pricing → Durable Objects](https://developers.cloudflare.com/workers/platform/pricing/).

### Queues (on Free)

| Metric | Free |
|--------|------|
| Standard operations | **10,000 / day** |
| Message retention | **24 hours** (fixed) |

Source: [Workers pricing → Queues](https://developers.cloudflare.com/workers/platform/pricing/).

### R2 free tier (monthly; Standard storage only)

| Metric | Free / month |
|--------|----------------|
| Storage | **10 GB-month** |
| Class A ops | **1 million** |
| Class B ops | **10 million** |
| Egress | **Free** (always) |

Infrequent Access has **no** free tier.  
Source: [R2 pricing](https://developers.cloudflare.com/r2/pricing/).

### Workers Builds (CI)

| Metric | Free |
|--------|------|
| Build minutes | **3,000 / month** |
| Concurrent builds | **1** |
| Build timeout | **20 minutes** |

Source: [Workers Builds limits & pricing](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/).

### Containers

**Not available on Free** (N/A for memory/CPU/disk inclusions).  
Source: [Workers pricing → Containers](https://developers.cloudflare.com/workers/platform/pricing/).

---

## 3. Paid plan

### Workers Paid

| | |
|--|--|
| **Name** | Workers Paid (Standard usage model) |
| **Price** | **$5 USD / month minimum** per account |
| **Includes** | Workers, Pages Functions, KV, Hyperdrive, Durable Objects usage allotments; enables paid overages across the platform |

#### Workers / Pages Functions (Standard)

| Dimension | Included / month | Overage |
|-----------|------------------|---------|
| Requests | **10 million** | **+$0.30 / million** |
| Duration | No charge / no limit for duration billing | — |
| CPU time | **30 million CPU-ms** | **+$0.02 / million CPU-ms** |
| Max CPU / invocation | Default 30 s; max **5 min** (cron/queue consumer up to **15 min**) | — |

Static assets remain free/unlimited. Cache hits still bill as **requests**, not CPU.

#### KV (Paid)

| Dimension | Included | Overage |
|-----------|----------|---------|
| Keys read | **10 M / month** | **+$0.50 / million** |
| Keys written | **1 M / month** | **+$5.00 / million** |
| Keys deleted | **1 M / month** | **+$5.00 / million** |
| List | **1 M / month** | **+$5.00 / million** |
| Storage | **1 GB** | **+$0.50 / GB-month** |

#### D1 (Paid)

| Dimension | Included | Overage |
|-----------|----------|---------|
| Rows read | **25 billion / month** | **+$0.001 / million rows** |
| Rows written | **50 million / month** | **+$1.00 / million rows** |
| Storage | **5 GB** | **+$0.75 / GB-month** |

Limits (not pure price): up to **50,000** DBs/account, **10 GB**/DB, **1 TB** account storage (increasable).

#### Durable Objects compute (Paid)

| Dimension | Included | Overage |
|-----------|----------|---------|
| Requests | **1 M / month** | **+$0.15 / million** |
| Duration | **400,000 GB-s / month** | **+$12.50 / million GB-s** |

SQLite storage (Paid): same row rates as D1; stored data **5 GB-month** then **+$0.20 / GB-month**.

#### Queues (Paid)

| Dimension | Included | Overage |
|-----------|----------|---------|
| Ops | **1 M / month** | **+$0.40 / million** |
| Retention | 4 days default, up to **14 days** | — |

Rough bill: `((messages × 3) − 1,000,000) / 1,000,000 × $0.40`.

#### R2 (after free tier; no separate “R2 plan”)

| Dimension | Standard | Infrequent Access |
|-----------|----------|-------------------|
| Storage | **$0.015 / GB-month** | **$0.01 / GB-month** (+ 30-day min) |
| Class A | **$4.50 / million** | **$9.00 / million** |
| Class B | **$0.36 / million** | **$0.90 / million** |
| Retrieval | None | **$0.01 / GB** |
| Egress | Free | Free |

Rounding: ops and GB-month round **up** to next whole billing unit.

#### Workers Builds (Paid)

| Metric | Included | Overage |
|--------|----------|---------|
| Build minutes | **6,000 / month** | **+$0.005 / minute** |
| Concurrent builds | **6** | — |

#### Containers (Workers Paid only)

| Resource | Included / month | Overage |
|----------|------------------|---------|
| Memory | **25 GiB-hours** | **+$0.0000025 / GiB-second** |
| CPU | **375 vCPU-minutes** | **+$0.000020 / vCPU-second** |
| Disk | **200 GB-hours** | **+$0.00000007 / GB-second** |

**Container egress:** NA/EU **$0.025/GB** (1 TB included); Oceania/KR/TW **$0.05/GB** (500 GB); elsewhere **$0.04/GB** (500 GB).

#### Workers Logs (Paid)

| | Included | Overage |
|--|----------|---------|
| Log events | **20 M / month** | **+$0.60 / million** |
| Retention | 7 days | — |

Sources: all figures above from [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) and linked product pages.

---

## 4. Sweet spots & what blows first (agent-built app)

**App profile:** small web app, chatty D1, auto-deploys, optional sandboxed runs (Containers).

| Plan | Fits when | Usually first bottleneck |
|------|-----------|---------------------------|
| **Workers Free** | Prototypes, demos, low-traffic apps under ~**3k req/day** average with light CPU and few KV writes | **Workers requests (100k/day)** if traffic or polling; or **KV writes (1k/day)** if every request writes session/state; or **D1 writes (100k/day)** on chatty logs; or **Queues (10k ops/day ≈ ~3.3k messages)** |
| **Workers Paid $5** | Production small/medium apps; needs DO, Containers, or headroom past daily Free caps | **$5 floor** until you exceed **10M req** or **30M CPU-ms**; next: **Builds minutes** if every PR redeploys; **DO duration** if WebSockets never hibernate; **R2 Class B** only at high read volume |
| **R2 free alone** | Asset/object storage without Paid | **10 GB storage** or **1M Class A** before Class B (10M is generous) |

### Rough “first to break” math (Free)

| Pattern | Hits Free limit around… |
|---------|-------------------------|
| API/chat Worker, ~1 req per user action | **~100k requests/day** (~1.15 req/s steady) — often **first** |
| Polling client every 5s × 50 users | **50 × 17,280 ≈ 864k req/day** → blows Free **same day** |
| KV write per request | **1,000 writes/day** → dies in **minutes** under load (often **before** request cap if write-heavy) |
| D1: insert log row + index per action | **100k writes/day**; full-table scans burn **5M rows read/day** fast |
| CI: 5 min build × 20 deploys/day | **~3,000 min/month** → Free Builds exhausted in **~1 month of aggressive deploys** |
| Queue: 1 msg = ~3 ops | Free **~3,300 msgs/day** |
| Containers sandbox | **Requires Paid** immediately |

### Paid: when $5 is enough vs overage

| Usage | Est. cost (Workers only) |
|-------|---------------------------|
| ≤10M req, ≤30M CPU-ms, light storage | **$5** |
| 15M req @ 7 ms CPU (docs Example 1) | **~$8** |
| 100M req @ 7 ms (docs Example 4) | **~$45** |

D1 paid inclusions (25B reads / 50M writes) are huge — a “chatty” app almost always hits **Workers requests/CPU** or **KV writes** before D1 overage.  
R2 egress is free, so “large media downloads from R2” do **not** create R2 egress bills (unlike S3); high **Class B** volume still can (docs asset-hosting example: 300M Class B/month ≈ **$104** after free tier).

---

## 5. Cost traps specific to AI-agent usage

| Trap | Why it hurts | Mitigation |
|------|--------------|------------|
| **Polling loops** (`setInterval` fetch, health checks, agent “is it done?”) | Burns Free **100k req/day** or Paid **request + CPU**; cron/queue consumers burn CPU-ms | Webhooks, Queues, DO alarms, SSE/WS with hibernation |
| **Forgotten Durable Objects / open WebSockets** | **Duration billed in GB-s** while active; WS `accept()` without hibernation keeps object hot | WebSocket Hibernation API; ensure objects can hibernate |
| **Per-test provisioning** | Every `wrangler d1 execute`, KV put, R2 put, dashboard query is **billable**; test matrices × CI | Prefer `--local` / Miniflare; share fixtures; don’t create real D1/R2 per PR |
| **Agent “cleanup later”** | R2 GB-month accrues; empty D1 tables still use **~KB+**; DO storage billed until deleted | Lifecycle rules; delete test buckets/DBs; script teardown |
| **Unindexed D1 + `SELECT *`** | **Rows read** = scanned rows, not returned rows; Free 5M/day evaporates | Indexes; avoid full scans in agent tools |
| **KV write amplification** | Free **1k writes/day**; Paid **$5/M writes** | Cache in memory/DO; batch; don’t write every poll |
| **Queues retries + DLQ** | Each retry = read ops; DLQ = extra write | Fix poison messages; tune max retries |
| **Auto-deploy on every commit** | Builds minutes (3k free / 6k paid then **$0.005/min**) | Build only main; cache deps; shorter builds |
| **Containers left running** | Memory/CPU/disk seconds + **regional egress** (unlike R2) | Short TTL; sleep; cap max instances |
| **Assuming “no egress” everywhere** | R2/D1/KV/Workers egress free; **Containers egress is not** | Don’t route large downloads through Containers |
| **run_worker_first on Free** | Forces Worker invocation → Free 429 when request cap hit (no static fallback for those routes) | Narrow patterns; cache |
| **Workers Caching** | Cache hits still count as **requests** | Still good for CPU; not free on request meter |
| **R2 Infrequent Access** | No free tier; 30-day min storage; retrieval fees | Use Standard for agent scratch data |

---

## 6. How to check current usage / spend

| Method | Exact path / command |
|--------|----------------------|
| **Billable Usage dashboard** | [dash.cloudflare.com](https://dash.cloudflare.com/) → **Manage Account → Billing → Billable Usage** · deep link pattern: `https://dash.cloudflare.com/?to=/:account/billing` then **Billable Usage** |
| **Budget alerts** | Same Billable Usage page → **Set Budget Alert** / **Create budget alert**; or **Notifications → Add → Budget Alert** |
| **Per-product sidebar** | Product overviews (Workers & Pages, D1, R2, KV, Queues, DO, Containers) show period spend + budget button (as of mid-2026) |
| **D1 row metrics** | Dashboard: `https://dash.cloudflare.com/?to=/:account/workers/d1/` → database → **Metrics → Row Metrics**; or query `meta.rows_read` / `rows_written` on each response; [GraphQL Analytics API](https://developers.cloudflare.com/d1/observability/metrics-analytics/#query-via-the-graphql-api) |
| **Workers metrics** | Dashboard Workers & Pages → Worker → Metrics; [Workers metrics docs](https://developers.cloudflare.com/workers/observability/metrics-and-analytics/) |
| **Wrangler CLI** | **No first-class `wrangler billing` / spend command** documented. Wrangler manages resources (`wrangler whoami`, `wrangler d1`, `wrangler r2`, `wrangler kv`, `wrangler deploy`) but usage/spend is dashboard/GraphQL/invoice. |
| **API** | Product GraphQL analytics endpoints (Workers, D1, etc.); billing line items are invoice/dashboard-oriented for PAYG — use Billable Usage for cost, not invent a secret CLI |

Docs: [Monitor billable usage](https://developers.cloudflare.com/billing/manage/billable-usage/), [Budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/), [changelog Apr 2026](https://developers.cloudflare.com/changelog/post/2026-04-13-billable-usage-dashboard-and-budget-alerts/).

---

## 7. Keyword triggers (shell / config)

Short lowercase tokens that signal this stack is in play:

| Keywords | Product |
|----------|---------|
| `wrangler`, `workers`, `workerd`, `miniflare`, `cloudflare:workers` | Workers |
| `r2`, `r2://`, `--r2`, `R2_BUCKET` | R2 |
| `kv`, `kv_namespaces`, `wrangler kv` | KV |
| `d1`, `wrangler d1`, `D1Database` | D1 |
| `pages`, `pages.dev`, `functions/` (Pages) | Pages |
| `durable_objects`, `DurableObject`, `new_sqlite_classes` | Durable Objects |
| `queues`, `queue_consumers`, `message_batch` | Queues |
| `hyperdrive` | Hyperdrive |
| `containers`, `cloudflare containers` | Containers / sandbox |
| `wrangler.toml`, `wrangler.jsonc`, `compatibility_date` | CF project config |
| `npx wrangler deploy`, `wrangler pages deploy` | Deploy path |
| `workers.dev`, `.workers.dev` | Hosting |
| `CF_API_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | Auth env |
| `getPlatformProxy`, `@cloudflare/vitest-pool-workers` | Local/test CF |

---

## Quick reference card

```
Workers Free:  100k req/day · 10 ms CPU/invocation · no DO key-value · no Containers
Workers Paid:  $5/mo · 10M req + 30M CPU-ms included · $0.30/M req · $0.02/M CPU-ms
R2 free:       10 GB · 1M Class A · 10M Class B · $0 egress always
KV free:       100k read/day · 1k write/day · 1 GB
D1 free:       5M rows read/day · 100k write/day · 5 GB · 10 DBs
Queues free:   10k ops/day
Builds free:   3,000 min/mo (Paid: 6,000 then $0.005/min)
```

**Primary source of truth (re-verify anytime):**  
https://developers.cloudflare.com/workers/platform/pricing/ · https://developers.cloudflare.com/r2/pricing/

*Numbers verified against Cloudflare official docs crawled July 2026; Workers pricing page `dateModified` 2026-07-07; R2 pricing `dateModified` 2026-05-28.*
