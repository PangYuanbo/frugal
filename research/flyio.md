# Research archive: flyio

Raw dual-engine research output (2026-07-17). Engine A = Claude subagent with web search; Engine B = grok CLI (`grok -p`, web search enabled). The merged factsheet cross-checks both, preferring official pricing pages on conflicts.

## Merged factsheet (cross-checked)

```json
{
  "provider": "Fly.io",
  "billing_dimensions": [
    "Started Machines: per-second while in `started` state, priced by CPU/RAM preset, region-scaled (ams shared-cpu-1x 256MB = $2.02/mo 24/7; regions range $1.94 syd to $3.14 bom); extra RAM ~$5/GB per 30 days",
    "Stopped/suspended Machines: rootfs $0.15/GB per 30 days (stopped is not free)",
    "Volumes: $0.15/GB-month of PROVISIONED capacity, prorated hourly, billed even when detached or machine stopped",
    "Volume snapshots: $0.08/GB-month, first 10GB/mo free — new charge since Jan 1, 2026 (first invoice impact Feb 2026)",
    "Egress (public internet) per GB by region group: NA/EU $0.02, APAC/Oceania/SA $0.04, Africa/India $0.12; inbound free",
    "Private cross-region transfer (orgs created after 2024-07-18, 'granular rates'): $0.006 / $0.015 / $0.050 per GB by same region groups; same-region private free",
    "Dedicated IPv4: $2/mo per app; static egress IP $0.005/hr (~$3.60/mo); shared IPv4 + IPv6 free",
    "SSL certs: first 10 single-hostname free per org, then $0.10/mo each; wildcard $1/mo",
    "Fly Kubernetes (FKS): $75/mo per cluster + compute/storage",
    "Managed Postgres: plan fee ($38–$1,922/mo) + $0.28/GB-month storage (max 1TB)",
    "Extensions (Tigris, Upstash Redis): partner list price passed through on Fly invoice; transfer to them bills as Fly transfer",
    "Support subscriptions: Standard $29/mo, Premium $199/mo, Enterprise from $2,500/mo; compliance/HIPAA package $99/mo",
    "Machine reservation blocks: annual prepay for monthly compute credit, 40% effective discount (e.g. $36/yr → $5/mo shared credit)",
    "NOT billed: HTTP requests, seats (unlimited org members), inbound transfer, builds"
  ],
  "free_tier": "NO ongoing free tier for new accounts (plans/allowances deprecated Oct 7, 2024). One-time free trial only: 2 total VM-hours of runtime (per-second, shared across all machines) OR 7 days, whichever first; max 10 machines; max 2 vCPU / 4GB RAM per machine; 20GB volume storage; trial machines auto-stop after 5 min; no dedicated IPv4, performance CPUs, or GPUs. Adding a credit card ends the trial and starts metered billing; no card by day 7 → apps stop. Legacy grandfathered orgs (pre-Oct-2024 Hobby/Launch/Scale) keep: 3x shared-cpu-1x 256MB VMs, 3GB volumes, egress 100GB/mo NA+EU + 30GB APAC/Oceania/SA + 30GB Africa/India (lost permanently if org converts). Free for everyone: inbound transfer, same-region private transfer, shared IPv4 + IPv6, first 10 SSL certs, first 10GB/mo snapshot storage. Allowances never cap the bill; no billing alerts exist.",
  "plans": [
    {
      "name": "Pay As You Go (only plan for new orgs)",
      "price": "$0/mo base",
      "included": "Nothing after trial; unlimited seats; shared IPv4/IPv6, 10 SSL certs, 10GB snapshots free",
      "overage": "All usage at full metered rates; prepaid credits available (min $25) in lieu of card"
    },
    {
      "name": "Machine reservation blocks",
      "price": "$36/yr (shared) or $144/yr (performance), up to $14,400/yr",
      "included": "$5/mo shared or $20/mo performance compute credit per block (CPU+RAM only, no rollover)",
      "overage": "Usage beyond credit at normal rates; 40% effective discount on covered compute"
    },
    {
      "name": "Support Standard / Premium / Enterprise",
      "price": "$29 / $199 / from $2,500 per mo",
      "included": "Support only, no infra credits",
      "overage": "n/a"
    },
    {
      "name": "Compliance (HIPAA) package",
      "price": "$99/mo",
      "included": "Compliance features",
      "overage": "n/a"
    },
    {
      "name": "Managed Postgres (add-on): Basic/Starter/Launch/Scale/Performance",
      "price": "$38 / $72 / $282 / $962 / $1,922 per mo",
      "included": "Basic=shared-2x 1GB ... Performance=perf-8x 64GB; no free/hobby DB plan",
      "overage": "+$0.28/GB-month storage, max 1TB; cluster survives app deletion"
    },
    {
      "name": "Legacy Hobby/Launch/Scale (grandfathered only, closed to new orgs since 2024-10-07)",
      "price": "$0–$5+/mo",
      "included": "3x shared-cpu-1x 256MB, 3GB volumes, 100/30/30 GB regional egress",
      "overage": "Metered at normal rates; leaving is one-way"
    }
  ],
  "first_quota_blown": "The trial's 2 total VM-hours: a single always-on shared-cpu-1x exhausts it in 2 wall-clock hours (5-min auto-stop masks it briefly), and any real deploy/test/redeploy loop burns it in an afternoon — then all apps stop until a card is added. After a card: first surprise line items are (1) `fly launch` creating 2 machines by default (HA), (2) provisioned volume GB billing 24/7 even when stopped/detached, (3) Managed Postgres minimum $38/mo.",
  "sweet_spots": "Pure PAYG, nothing to outgrow. Cheapest always-on: 1x shared-cpu-1x 256MB, shared IPv4, no volume = $1.94–$3.14/mo by region ($2.02 ams; ~$1.20 effective with reservation block); auto-stop staging can be <$1/mo. Typical 2-machine app + small self-managed Postgres ~$13–20/mo; MPG jumps that to $38+ minimum. Per-second billing makes ephemeral sandboxes/CI machines very cheap (~$0.0000008/s for 256MB) as long as they're destroyed, not just stopped. Reservation blocks (40% off) worth it once steady compute exceeds ~$5/mo. Colocate app+DB in one region so private transfer is free.",
  "traps": [
    "Auto-stop defeated by polling: health checks, uptime monitors, or the agent's own loop restart machines — docs warn 'any random request might spin a machine up again'",
    "`fly launch` defaults to 2 machines (HA) — silently doubles compute on every scaffolded app; fix with `fly scale count 1`",
    "Stopped is not free: rootfs $0.15/GB-mo per stopped machine; a fleet of forgotten fat-image sandboxes adds up",
    "Volumes bill full provisioned size 24/7 even detached; deleting a machine does NOT always delete its volume — `fly volumes destroy` explicitly",
    "Deleting an app does NOT delete Managed Postgres ($38+/mo), Upstash Redis, or Tigris buckets — orphaned services keep billing",
    "No MPG free/hobby plan: 'add a database' per project = $38/mo each",
    "Snapshots bill since Jan 1, 2026: default daily snapshots across many volumes can exceed the 10GB free band",
    "Egress region multiplier: Africa/India $0.12/GB is 6x NA/EU; cross-region private app<->DB traffic bills $0.006–$0.05/GB",
    "No billing alerts and no spend caps — a runaway loop bills until you check the dashboard",
    "Dedicated IPv4 $2/mo per app: real money across 50 preview/agent-scaffolded apps",
    "Metrics-based autoscaler can CREATE machines (FAS_CREATED_MACHINE_COUNT) — cap counts",
    "GPU machines deprecated, unavailable after Aug 1, 2026 (were $0.70–$1.50/hr)"
  ],
  "usage_check": "No flyctl billing/usage command exists. Dashboard: https://fly.io/dashboard/personal/billing (replace `personal` with org slug) — month-to-date bill, invoices (Stripe portal), Trial Status panel. Inventory billable resources via `fly apps list`, `fly machine list`, `fly volumes list`, `fly ips list`, `fly scale show`; estimate with https://fly.io/calculator/; billing questions to billing@fly.io.",
  "keywords": [
    "fly",
    "flyctl",
    "fly.toml",
    "fly launch",
    "fly deploy",
    "fly machine",
    "fly machines",
    "fly scale",
    "fly volumes",
    "fly apps",
    "fly ips",
    "fly certs",
    "fly secrets",
    "fly proxy",
    "fly ssh",
    "fly logs",
    "fly status",
    "fly postgres",
    "fly mpg",
    "fly pg",
    "fly redis",
    "fly storage",
    "fly ext",
    "fly orgs",
    ".fly.dev",
    ".internal",
    "flycast",
    "registry.fly.io",
    "fly_api_token",
    "fly_app_name",
    "fly_region",
    "api.machines.dev",
    "litefs",
    "shared-cpu-",
    "performance-",
    "primary_region",
    "fly-replay",
    "fks"
  ],
  "hint": "Fly.io: NO free tier; trial=2 VM-hours or 7 days (10 machines, 20GB vol) — one always-on VM burns it in 2h. Then PAYG: shared-1x 256MB ~$2/mo; `fly launch` creates 2 machines; volumes+stopped rootfs $0.15/GB-mo; MPG min $38/mo; no billing alerts.",
  "conflicts": [
    "Cheapest-region attribution: Report B claimed $1.94/mo shared-cpu-1x 256MB is a US-region (iad/sjc) price; official pricing page says the range is $1.94 (Sydney/syd) to $3.14 (Mumbai/bom) with ams at $2.02 — official page won; $1.94 kept as floor, not as a US price",
    "FKS $75/mo per cluster appeared only in Report B — confirmed against official pricing page, kept",
    "GPU deprecation: Report A said only 'deprecated in 2026 docs'; Report B said unavailable after Aug 1, 2026 — official page confirms 'unavailable after August 1', B won",
    "Report A's per-second rate (~$0.00000075/s) implies $1.94/mo yet A labels its table $2.02 ams — internal rounding artifact in A; per-region monthly figures from the official page treated as authoritative",
    "Compliance $99/mo: A calls it 'HIPAA compliance package' (pricing docs), B calls it 'compliance package (community announcement)' — same price, A's HIPAA framing kept"
  ],
  "sources": [
    "https://fly.io/docs/about/pricing/",
    "https://fly.io/docs/about/free-trial/",
    "https://fly.io/docs/about/billing/",
    "https://fly.io/docs/about/cost-management/",
    "https://fly.io/docs/mpg/",
    "https://fly.io/pricing/",
    "https://fly.io/calculator/"
  ]
}
```

## Engine A — Claude web research (raw)

# Fly.io Pricing & Quota Factsheet — verified July 17, 2026

Primary sources (official, checked today):
- Resource pricing: https://fly.io/docs/about/pricing/
- Pricing landing: https://fly.io/pricing/ (and calculator: https://fly.io/calculator/)
- Free trial: https://fly.io/docs/about/free-trial/
- Billing: https://fly.io/docs/about/billing/
- Cost management: https://fly.io/docs/about/cost-management/
- Managed Postgres: https://fly.io/docs/mpg/

Headline: Fly.io is pure pay-as-you-go. Subscription plans (Hobby/Launch/Scale) were deprecated Oct 7, 2024 and are only honored for pre-existing purchasers. The old "free allowances" (3 free VMs, 160GB egress) exist ONLY on those legacy orgs. New accounts in 2026 get a 2-VM-hour / 7-day trial, nothing ongoing free except inbound transfer, 10 free SSL certs, and 10GB/mo of snapshot storage.

## 1. Metered billing dimensions
Billing is monthly per organization; everything is metered, no seats (unlimited org members free). Dimensions:
- Compute: started Machines billed per second in `started` state; price = CPU/RAM preset rate (+~$5/30 days per extra GB RAM). [pricing docs]
- Stopped-machine storage: $0.15 per GB of rootfs per 30 days (stopped/suspended Machines still bill for rootfs). [pricing docs, billing docs]
- Volumes: $0.15/GB-month of PROVISIONED capacity, billed hourly whether or not any machine is running/attached. [pricing docs]
- Volume snapshots: $0.08/GB-month, first 10GB/mo free — NEW charge effective Jan 1, 2026 (first billed on the early-Feb 2026 invoice). [pricing docs + 2026 change notice]
- Egress (outbound public internet) per GB, region-grouped; plus cross-region private-network transfer per GB for orgs created after July 18, 2024 ("granular rates"). Inbound: free. Same-region app-to-app: free (granular-rate orgs). [pricing docs]
- Network add-ons: dedicated IPv4 $2/mo per app; static egress IP $0.005/hr (~$3.60/mo); SSL certs $0.10/mo per hostname after first 10 free; wildcard $1/mo. [pricing docs]
- Managed services: Managed Postgres plans + $0.28/GB-month storage; extensions (Tigris, Upstash Redis) at partner list prices passed through on your Fly bill. [mpg docs, pricing docs]
- Support/compliance are the only "subscription" items: Standard $29/mo, Premium $199/mo, Enterprise from $2,500/mo; HIPAA compliance package $99/mo. [pricing docs, fly.io/pricing]
- NOT billed: requests, seats, builds (remote builder is just a machine), inbound data.

## 2. Free tier — exact numbers (2026)
There is NO ongoing free tier for new users. One-time free trial (https://fly.io/docs/about/free-trial/):
- 2 total VM hours (shared across all machines, tracked per second) OR 7 days, whichever first
- Trial machines auto-stop after 5 minutes of runtime
- Max 10 machines; max 2 vCPUs and 4GB RAM per machine; 20GB volume storage
- Excluded: dedicated IPv4, performance vCPUs, GPU machines
- Adding a credit card ends the trial immediately and starts metered billing; if no card by day 7 (or resources exhausted), apps stop.
Legacy only (orgs on pre-Oct-7-2024 Hobby/Launch/Scale plans): up to 3× shared-cpu-1x 256MB VMs, 3GB total volume storage, egress allowance 100GB/mo NA+EU, 30GB/mo APAC/Oceania/SA, 30GB/mo Africa/India. Lost permanently if the org converts to PAYG or removes its card. [pricing docs]
Ongoing freebies for everyone: inbound transfer, first 10 SSL certs, first 10GB/mo snapshot storage, shared IPv4 + IPv6.
Important: "Free allowances don't cap your bill… If you go over, we'll bill you." No billing alerts exist ("We don't support billing alerts (yet)"). [cost-management docs]

## 3. Paid "plans" and unit prices
Only plan: Pay As You Go ($0/mo base, usage-billed). Prepaid credits available (min $25 purchase) in lieu of a card. [billing docs]

Shared-CPU Machines, per month if running 24/7 — Amsterdam (ams) rates; prices VARY BY REGION (18 region price tables; US regions are a few % different — check https://fly.io/docs/about/pricing/ or /calculator for your region):
| Preset | RAM | $/mo (ams) |
|---|---|---|
| shared-cpu-1x | 256MB | $2.02 (~$0.00000075/s) |
| shared-cpu-1x | 512MB | $3.32 |
| shared-cpu-1x | 1GB | $5.92 |
| shared-cpu-1x | 2GB | $11.11 |
| shared-cpu-2x | 512MB | $4.04 |
| shared-cpu-2x | 1GB | $6.64 |
| shared-cpu-2x | 2GB | $11.83 |
| shared-cpu-2x | 4GB | $22.22 |
| shared-cpu-4x | 1GB | $8.08 |
| shared-cpu-4x | 2GB | $13.27 |
| shared-cpu-4x | 4GB | $23.66 |
| shared-cpu-4x | 8GB | $44.44 |
| shared-cpu-8x | 2GB | $16.15 |
| shared-cpu-8x | 4GB | $26.54 |
| shared-cpu-8x | 8GB | $47.32 |
| shared-cpu-8x | 16GB | $88.88 |
(performance-1x 2GB ≈ $32–35/mo for reference.) Extra RAM: ~$5/GB per 30 days.
Reservations: 40% off via prepaid compute blocks, e.g. $36/year buys $5/mo of shared-machine usage; $144/year buys $20/mo of performance usage. [pricing docs]

Egress per GB (granular rates, orgs created after 2024-07-18):
- NA/Europe: $0.02 public, $0.006 private cross-region
- APAC/Oceania/South America: $0.04 public, $0.015 private cross-region
- Africa/India: $0.12 public, $0.050 private cross-region
Inbound and same-region private transfer: $0. [pricing docs #network-prices]

Storage: Volumes $0.15/GB-mo provisioned; snapshots $0.08/GB-mo (10GB free); stopped-machine rootfs $0.15/GB-mo. Managed Postgres plans: Basic (shared-2x/1GB) $38/mo, Starter (shared-2x/2GB) $72/mo, Launch (perf-2x/8GB) $282/mo, Scale (perf-4x/32GB) $962/mo, Performance (perf-8x/64GB) $1,922/mo, + $0.28/GB-mo storage (max 1TB). [mpg docs]

Cheapest always-on config: 1× shared-cpu-1x 256MB, shared IPv4 + free IPv6, no volume ≈ $1.94–$2.02/mo depending on region (~$1.20/mo effective with a reservation block). Add $2/mo if you need dedicated IPv4. An auto-stop staging machine can be "less than $1/month". [pricing docs, cost-management docs]

## 4. Sweet spots & first quota an agent-built app blows through
- PAYG fits everything from $2/mo toys to production; no tier to outgrow. Typical 2-machine app + small Postgres: ~$13–20/mo.
- For a NEW org, the thing an agent blows through FIRST is the trial's 2 VM hours — a single always-on shared-cpu-1x exhausts it in 2 wall-clock hours (auto-stop-after-5-min masks this briefly). Any real dev loop (deploy, test, redeploy) burns it in an afternoon; then everything stops until a card is added.
- After a card is added, the first surprising line items in order: (1) Machines that `fly launch` created 2-of by default (HA default = 2 machines, doubling compute), (2) provisioned volume GB (billed even when machines are stopped), (3) Managed Postgres minimum $38/mo Basic plan — the single biggest jump for a "chatty DB" app; the DB machine also runs 24/7 unlike auto-stopping web machines. Egress at $0.02/GB is rarely first — 100GB is only $2.
- Sandboxed code runs / per-test provisioning: cheap per-second compute is the sweet spot (a 256MB machine costs $0.0000008/s), but each machine's rootfs bills $0.15/GB-mo while merely stopped — a fleet of forgotten stopped sandboxes with fat images adds up.

## 5. Cost traps for AI-agent usage patterns
- Auto-stop defeated by polling: any inbound request (health checks, uptime monitors, an agent's own polling loop) restarts auto-stopped machines; docs explicitly warn "any random request might spin a machine up again" and recommend fewer/smaller machines over auto-stop tuning. [cost-management]
- `fly launch` defaults to 2 machines for HA — agents that scaffold many test apps silently double compute. `fly scale count 1` to fix.
- Stopped ≠ free: rootfs $0.15/GB-mo per stopped machine; volumes bill at full provisioned size 24/7 even detached. Agents that provision a volume per test and never `fly volumes destroy` accumulate charges. Deleting a machine does NOT always delete its volume.
- Orphaned managed services: deleting an app does NOT delete its Managed Postgres cluster ($38+/mo), Upstash Redis, or Tigris buckets. [cost-management]
- Managed Postgres has no free/hobby plan — minimum $38/mo; agents that "add a database" per project multiply this.
- Snapshots now bill (since Jan 1, 2026): daily volume snapshots × many volumes can exceed the 10GB free band.
- Egress region multiplier: serving from Africa/India regions costs 6× NA/EU ($0.12 vs $0.02/GB); cross-region private traffic (e.g., app in `sjc` chatting with DB in `ams`) bills at $0.006–$0.05/GB — colocate app and DB in one region to make it free.
- No billing alerts and no hard caps whatsoever — a runaway loop bills until you notice the dashboard.
- Dedicated IPv4 $2/mo per app: trivial for one app, real money for 50 agent-scaffolded apps.

## 6. Checking usage/spend
- Dashboard (authoritative): https://fly.io/dashboard/personal/billing (replace `personal` with org slug) — invoices + "current month to date bill". Trial users: "Trial Status" panel on the dashboard. [billing docs]
- CLI: there is NO flyctl billing/usage command (confirmed in billing docs). Closest: `fly dashboard` (opens org dashboard in browser), `fly machine list` / `fly volumes list` / `fly apps list` to inventory billable resources, `fly scale show` for sizes.
- API: no documented public billing REST endpoint; resource inventory via Machines API `api.machines.dev` and GraphQL `https://api.fly.io/graphql`. Billing questions: billing@fly.io.

## 7. Keyword triggers (shell)
`flyctl`, `fly launch`, `fly deploy`, `fly apps`, `fly machine` / `fly machines` / `fly m `, `fly scale`, `fly volumes` / `fly vol`, `fly pg` / `fly mpg` / `fly postgres`, `fly secrets`, `fly ips`, `fly certs`, `fly proxy`, `fly ssh console`, `fly logs`, `fly status`, `fly.toml`, `.fly.dev` hostnames, `fly-replay` header, `FLY_API_TOKEN`, `api.machines.dev`, `litefs`, `fly redis`, `fly storage` (Tigris).

Recent-change flags: (a) plans → PAYG-only since Oct 7, 2024 — any doc mentioning Hobby/Launch/Scale free allowances is legacy-only; (b) trial changed from $5 credit to 2 VM hours / 7 days; (c) volume snapshot billing new as of Jan 1, 2026; (d) GPU Machines marked deprecated in 2026 docs; (e) machine prices are now published per-region (Amsterdam figures above; verify your region on the pricing page/calculator).

Sources: [fly.io/docs/about/pricing](https://fly.io/docs/about/pricing/), [fly.io/pricing](https://fly.io/pricing/), [fly.io/docs/about/free-trial](https://fly.io/docs/about/free-trial/), [fly.io/docs/about/billing](https://fly.io/docs/about/billing/), [fly.io/docs/about/cost-management](https://fly.io/docs/about/cost-management/), [fly.io/docs/mpg](https://fly.io/docs/mpg/), [fly.io/calculator](https://fly.io/calculator/)

## Engine B — grok CLI (raw)

# Fly.io pricing & quotas factsheet  
**As of July 2026** · Verified against official Fly docs (not third-party blogs)

**Primary sources:**  
- [Resource Pricing](https://fly.io/docs/about/pricing/)  
- [Billing](https://fly.io/docs/about/billing/)  
- [Free Trial](https://fly.io/docs/about/free-trial/)  
- [Cost Management](https://fly.io/docs/about/cost-management/)  
- [Managed Postgres](https://fly.io/docs/mpg/)  
- [Support](https://fly.io/docs/about/support/) · [Support marketing](https://fly.io/support/)  
- [Pricing calculator](https://fly.io/calculator/) · [Pricing landing](https://fly.io/pricing/)

---

## 1. Metered billing dimensions

Billing is **per organization**, monthly, **usage-only** for new orgs (no base platform subscription). Linked orgs roll usage up to a Billing Organization.

| Dimension | What bills | Unit / rate (official) |
|-----------|------------|-------------------------|
| **Started Machines** | Time in `started` state | Per **second**, by CPU/RAM preset (+ ~**$5 / 30 days / GB** extra RAM; region-scaled) |
| **Stopped / suspended Machines** | Rootfs only | **$0.15 / GB / 30 days** |
| **Volumes** | Provisioned size, attached or not | **$0.15 / GB / month**, pro-rated hourly |
| **Volume snapshots** | Stored snapshot data (incremental) | **$0.08 / GB / month**; **first 10 GB free / month** (charged from Jan 2026; first invoice impact Feb 2026) |
| **Egress (public internet)** | Outbound via edge | Per GB by **region group** (table below) |
| **Private cross-region transfer** | Machine↔edge↔Machine other region (granular orgs) | Per GB by region group (table below) |
| **Dedicated public IPv4** | Per app that has one | **$2 / month** |
| **Static egress IPs** | App-scoped outbound IPv4+IPv6 | **$0.005 / hour** (~**$3.60 / month**) |
| **SSL certs** | Hostnames / wildcards | **$0.10 / mo** single; **$1 / mo** wildcard; **first 10 single hostnames free** per org |
| **Fly Kubernetes (FKS)** | Per cluster | **$75 / month** + compute + volumes |
| **Managed Postgres (MPG)** | Plan + storage | Plan fee + **$0.28 / GB / 30 days** storage |
| **Extensions** (Tigris, Upstash Redis, etc.) | Provider list price, on Fly invoice | Pass-through; **data transfer to them is billed as Fly transfer** |
| **Support packages** | Optional; not usage | Standard / Premium / Enterprise (see §3) |
| **Machine reservation blocks** | Upfront annual for monthly compute credit | Shared or performance; **40% effective discount** |

**Does not bill (explicitly free where documented):**  
- **All inbound** data transfer  
- Same-region private transfer (granular orgs)  
- Shared IPv4 + unlimited Anycast IPv6 for apps  
- Community support  

**Not billed as seats/requests:** no per-seat, no per-HTTP-request platform fee. Compute is wall-clock while started, not request counts.

---

## 2. Free tier: exact quotas (2026)

### New customers (Pay As You Go) — **no recurring free tier**

Official cost-management doc: **“There is no free account/free tier on Fly.io.”** Only a **Free Trial**.

| Trial resource | Quota |
|----------------|--------|
| Duration | **2 total VM hours** of machine runtime **or 7 days**, whichever first |
| Machines | **10 max** |
| Volume storage | **20 GB** |
| CPU / RAM per machine | Up to **2 vCPUs**, **4 GB** RAM |
| Auto-stop during trial | Machines auto-stop after **5 minutes** |
| **Not in trial** | Dedicated IPv4; performance CPUs; GPUs |
| Credit card | Adding a card **ends the trial**; usage bills from then |

There are **no free resource allowances during the free trial** for legacy-credit language; trial is resource-capped, not a $ credit for PAYG.

### Legacy free allowances (still honored in 2026, **grandfathered only**)

Plans discontinued for **new** customers as of **7 Oct 2024**. Still applied if the org was on Hobby / Launch / Scale before sunset:

| Resource | Free allowance |
|----------|----------------|
| Compute | Up to **3 × shared-cpu-1x @ 256 MB** |
| Volumes | **3 GB** persistent storage **total** |
| Egress NA & Europe | **100 GB / month** |
| Egress Asia Pacific, Oceania, South America | **30 GB / month** |
| Egress Africa & India | **30 GB / month** |

Legacy free allowances **do not cap the bill**—overage is metered. No billing alerts.

**Legacy (Free) Hobby:** $0 subscription, free allowances only.  
**Deprecated paid Hobby ($5/mo):** included $5 usage + allowances; one-time $5 trial credit for some historical signups. Leaving these plans is **one-way**.

---

## 3. “Plans” for new customers (July 2026)

There is **no multi-tier compute plan ladder** for new orgs. Model:

| Offering | Monthly price | Included usage | Overage |
|----------|---------------|----------------|---------|
| **Pay As You Go** | **$0 base** | None (after trial) | Full resource rates |
| **Support – Standard** | **$29 / mo** | Email / portal support | N/A (support, not infra credits) |
| **Support – Premium** | **$199 / mo** | Higher support | N/A |
| **Support – Enterprise** | **from $2,500 / mo** | Enterprise support | N/A |
| **Compliance package** (optional add-on; announced with PAYG) | **$99 / mo** (community announcement) | Compliance features | N/A |

Community / billing@fly.io for invoices; support packages bought in dashboard **Support**.

### Shared-CPU started-machine prices (always-on ≈ 30-day month)

**Region-dependent.** Official matrices list every region; samples below from [pricing page](https://fly.io/docs/about/pricing/). Extra RAM ~**$5 / 30 days / GB** baseline, scaled by region markup.

**Cheapest US-class regions** (e.g. `iad` / `sjc`-class tables on docs — **shared-cpu-1x 256 MB ≈ $1.94 / mo**):

| Preset (shared) | RAM | ≈ $/month (low-cost regions) | ≈ $/hour |
|-----------------|-----|------------------------------|----------|
| 1 shared | 256 MB | **$1.94** | $0.0027 |
| 1 shared | 512 MB | **$3.19** | $0.0044 |
| 1 shared | 1 GB | **$5.70** | $0.0079 |
| 1 shared | 2 GB | **$10.70** | $0.0149 |
| 2 shared | 512 MB | **$3.89** | $0.0054 |
| 2 shared | 1 GB | **$6.39** | $0.0089 |
| 4 shared | 1 GB | **$7.78** | $0.0108 |

**Amsterdam (`ams`) baseline table** (slightly higher): shared-cpu-1x 256 MB **$2.02 / mo**; 512 MB **$3.32**; 1 GB **$5.92**.

Higher-cost regions (e.g. Johannesburg, Mumbai-class tables) push shared-cpu-1x 256 MB into ~**$2.5–$3.1+ / mo**. Always pick the region on the live pricing page.

**Stopped machine example:** 1 GB rootfs stopped 30 days → **$0.15**.

### Egress / private transfer (region groups)

| Region groups | Public egress | Private cross-region |
|---------------|---------------|----------------------|
| North America, Europe | **$0.02 / GB** | **$0.006 / GB** |
| Asia Pacific, Oceania, South America | **$0.04 / GB** | **$0.015 / GB** |
| Africa, India | **$0.12 / GB** | **$0.050 / GB** |

Orgs created **after 18 Jul 2024** use **granular** rates (private cross-region at the lower rate). Older orgs can opt in once (irreversible) from Organizations → **Switch to granular bandwidth pricing**. Non-granular: all billable transfer at public egress rates.

### Storage / networking / other unit prices

| Item | Price |
|------|--------|
| Volumes | **$0.15 / GB-mo** provisioned |
| Snapshots | **$0.08 / GB-mo**; **10 GB free / mo** |
| Dedicated IPv4 | **$2 / mo** |
| Static egress IP | **~$3.60 / mo** |
| Single hostname cert | **$0.10 / mo** (10 free) |
| Wildcard cert | **$1 / mo** |
| FKS cluster | **$75 / mo** + resources |

### Machine reservation blocks (40% off effective)

Pay yearly upfront → monthly compute credit (CPU + extra RAM only; no rollover):

| Class | Yearly pay | Monthly credit |
|-------|------------|----------------|
| Shared | $36 | $5 |
| Shared | $360 | $50 |
| Shared | $3,600 | $500 |
| Performance | $144 | $20 |
| Performance | $1,440 | $200 |
| Performance | $14,400 | $2,000 |

### Managed Postgres (optional; not shared-cpu Machines)

| Plan | CPU | Memory | Monthly |
|------|-----|--------|---------|
| Basic | Shared-2x | 1 GB | **$38** |
| Starter | Shared-2x | 2 GB | **$72** |
| Launch | Performance-2x | 8 GB | **$282** |
| Scale | Performance-4x | 32 GB | **$962** |
| Performance | Performance-8x | 64 GB | **$1,922** |

Storage: **$0.28 / provisioned GB / 30 days**. MPG lives **outside** apps (survives app delete).

Unmanaged Fly Postgres = normal Machines + volumes (~**$2 / mo** single-node dev preset if always-on; ~**$82–$164 / mo** three-node production presets).

### GPUs (deprecated)

Unavailable after **1 Aug 2026**. On-demand examples still listed: A10 **$0.75/hr**, L40S **$0.70/hr**, A100 40G **$1.25/hr**, A100 80G **$1.50/hr** + Machine cost.

---

## 4. Sweet spots & what an agent-built app burns first

### Sweet spots

| Pattern | Fit | Rough cost shape |
|---------|-----|------------------|
| Side project, auto-stop | PAYG + **shared-cpu-1x 256–512 MB**, `min_machines_running=0` | Often **&lt; $1–3 / mo** if mostly stopped (rootfs + volumes still charge) |
| Tiny always-on API | 1× shared-cpu-1x **256 MB**, shared IPv4, no volume | **~$1.94–2.32 / mo** compute (region-dependent) before egress |
| Small web + SQLite on volume | 256–512 MB + **1–3 GB volume** | Compute + **$0.15–0.45** volume + egress |
| Chatty DB, production | Avoid always-on fat Machines; MPG Basic already **$38 + storage** — or self-managed PG on small shared machines (~$2+) |
| Multi-region / HA | N machines × N regions; egress + private cross-region | First “surprise” is **machine count**, not plans |
| Steady predictable spend | Reservation blocks if CPU line &gt; ~$5/mo | 40% effective on CPU/RAM |

### Cheapest always-on config (new PAYG, July 2026)

1. Region: **lowest-cost region** on the pricing matrix (US tables ≈ **$1.94 / mo** for shared-cpu-1x **256 MB**).  
2. Size: **shared-cpu-1x @ 256 MB**, always started.  
3. Networking: **shared IPv4** (free); skip dedicated IPv4 (**+$2**).  
4. Storage: **no volume** if possible (SQLite on rootfs is ephemeral across destroy; for durable data, minimum volume = **$0.15 / GB-mo**).  
5. Certs: stay within **10 free** single hostnames.  

**Floor:** ~**$1.94–2.02 / mo** compute + egress.  
**Realistic minimal public app:** ~**$2–5 / mo** (slightly more RAM, small volume, light NA/EU egress).  
**With dedicated IPv4:** add **$2 / mo**.

### What a typical agent-built app hits **first**

| Quota / dimension | Why agents hit it | Rough trigger |
|-------------------|-------------------|---------------|
| **1. Started Machine seconds** | Health checks, webhooks, agents leave Machines **started**; auto-stop defeated by polling | **24/7** shared-1x 256 MB → ~**$2/mo** each; 3 forgotten machines → ~**$6/mo** |
| **2. Volume hours** | DB/SQLite volumes bill **even when Machine stopped** | Forgotten **3 GB** vol → **~$0.45/mo** forever |
| **3. Dedicated IPv4** | `fly ips allocate-v4` or per-preview apps | **N preview apps × $2** |
| **4. Egress** | Large artifacts, image proxies, log shipping, multi-region | **50 GB** NA egress → **$1**; **500 GB** → **$10**; Africa/India **6×** NA rate |
| **5. MPG / extension leftovers** | Agent provisions Redis/Tigris/MPG; deletes app only | MPG Basic alone **$38/mo** |
| **6. Snapshots** | Default daily snapshots (5-day retention) on new volumes | After free **10 GB**, **$0.08/GB-mo** |
| **7. Rootfs on stopped fleet** | Many stopped sandbox Machines | 10 × 1 GB stopped → **$1.50/mo** |

**Usually first for chatty small web + auto-deploys:** **always-on / never-stopping Machines**, not “requests.” Fly does not bill HTTP requests; idle started Machines still burn full compute.

---

## 5. Cost traps for AI-agent usage patterns

| Trap | Mechanism | Mitigation |
|------|-----------|------------|
| **Polling / keep-alive loops** | External pings or agent heartbeat → Machine never auto-stops | True idle stop; avoid synthetic traffic; prefer suspended/stopped |
| **Forgotten resources** | Volumes, stopped Machines rootfs, MPG, Upstash, Tigris, static egress IPs | Dashboard cleanup; volumes bill if unattached |
| **Per-test provisioning** | New app + Machine + volume + IPv4 per CI/PR | Reuse apps; shared IPv4; destroy volumes (`pending_destroy` stops charges) |
| **Large egress** | Model weights, build cache pulls, S3-via-proxy, cross-region replication | Cache in-region; granular private rates; put bulk on object storage carefully (transfer to Tigris still bills) |
| **Metrics autoscaler creating Machines** | `FAS_CREATED_MACHINE_COUNT` can **create** Machines | Prefer start/stop scaling; cap counts |
| **Preview / branch apps** | Each with dedicated IPv4 | Shared IPv4 or fewer previews |
| **Oversized defaults** | Agents pick 1–2 GB RAM “to be safe” | shared-1x 256–512 MB first |
| **No billing alerts** | Official: none yet | Check month-to-date often; email billing@fly.io for mistakes |
| **GPUs until Aug 2026** | High hourly rates if agent enables GPU | Don’t for toy workloads |

---

## 6. How to check usage / spend

| Method | Exact location / command |
|--------|---------------------------|
| **Month-to-date bill** | Dashboard → org → **“current month to date bill”** ([cost management](https://fly.io/docs/about/cost-management/)) |
| **Invoices / Stripe** | [https://fly.io/dashboard/personal/billing](https://fly.io/dashboard/personal/billing) (replace `personal` with org slug) → **View** → Stripe portal download |
| **Upcoming / preview invoice & Cost Explorer** | Same **Billing** section (snapshots usage also called out there) |
| **Trial remaining** | Dashboard → **Trial Status** |
| **Reservations** | Billing section of dashboard (self-service) |
| **CLI** | **No official `fly billing` / invoice CLI** in docs. Ops helpers: `fly status`, `fly machines list`, `fly volumes list`, `fly ips list`, `fly apps list`, `fly scale show`. Debug: `LOG_LEVEL=debug fly …` |
| **Calculator** | [https://fly.io/calculator/](https://fly.io/calculator/) |
| **Billing help** | [billing@fly.io](mailto:billing@fly.io) |
| **Tigris** | `fly storage dashboard` / `fly storage dashboard --org <org>` |

---

## 7. Keyword triggers (shell / config)

Short lowercase tokens that often mean Fly.io is in play:

`fly`, `flyctl`, `fly.io`, `fly.toml`, `[[services]]`, `[[vm]]`, `primary_region`, `fly deploy`, `fly launch`, `fly machines`, `fly machine`, `fly scale`, `fly volumes`, `fly ips`, `fly proxy`, `fly ssh`, `fly logs`, `fly secrets`, `fly apps`, `fly orgs`, `fly postgres`, `fly mpg`, `fly redis`, `fly storage`, `fly ext`, `flyctl`, `FLY_API_TOKEN`, `FLY_APP_NAME`, `FLY_REGION`, `FLY_ALLOC_ID`, `FAS_`, `shared-cpu-`, `performance-`, `.internal`, `.fly.dev`, `registry.fly.io`, `flycast`, `litefs`, `fks`

---

## Quick reference: legacy free allowances in 2026?

| Question | Answer |
|----------|--------|
| Do **new** signups get 3 free VMs / 160 GB egress? | **No.** Trial only (2 VM hours or 7 days). |
| Do **old** orgs still get free allowances? | **Yes**, if still on grandfathered Hobby/Launch/Scale with documented allowances (3×256 MB, 3 GB vol, regional egress caps). |
| Minimum real cost for always-on tiny app (new org)? | About **$1.94–2.50 / mo** for one smallest shared Machine in a cheap region, plus egress and any volume/IPv4. |

---

*Numbers above are transcribed from Fly’s live docs as of this research pass (July 2026). Region tables and MPG list prices can change; re-check [fly.io/docs/about/pricing/](https://fly.io/docs/about/pricing/) and [fly.io/docs/mpg/](https://fly.io/docs/mpg/) before budgeting.*
