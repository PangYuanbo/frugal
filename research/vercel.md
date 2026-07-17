# Research archive: vercel

Raw dual-engine research output (2026-07-17). Engine A = Claude subagent with web search; Engine B = grok CLI (`grok -p`, web search enabled). The merged factsheet cross-checks both, preferring official pricing pages on conflicts.

## Merged factsheet (cross-checked)

```json
{
  "provider": "Vercel",
  "billing_dimensions": [
    "edge requests (CDN requests, every request incl. static)",
    "edge request CPU duration (routing CPU, $/hr)",
    "fast data transfer (CDN<->visitor egress, both directions)",
    "fast origin transfer (CDN<->functions/blob/ISR, both directions)",
    "function invocations",
    "active CPU (CPU-hrs, pauses during I/O)",
    "provisioned memory (GB-hrs, bills through I/O waits)",
    "ISR reads/writes (8 KB units, regional)",
    "runtime cache reads/writes (8 KB units)",
    "image transformations + image cache reads/writes",
    "build CPU-minutes (Elastic/Enhanced/Turbo or on-demand concurrency)",
    "blob (storage GB-mo, simple/advanced ops, transfer)",
    "edge config reads/writes",
    "sandbox (active CPU, memory GB-hrs, creations, network GB, snapshot storage)",
    "deploying seats ($20/mo each; viewers free)",
    "web analytics / speed insights / observability events",
    "drains ($/GB)",
    "workflow events + data written/retained",
    "WAF rate limiting / OWASP inspection",
    "queues + service requests (beta SKUs)",
    "fixed DX add-ons (SAML, HIPAA, static IPs, etc.)"
  ],
  "free_tier": "Hobby $0, non-commercial only; hard caps — exceeded feature pauses/402s until 30-day window resets, no overage billing. Monthly: 1M edge requests; 1M function invocations; 4 active-CPU-hrs; 360 GB-hrs provisioned memory; 100 GB fast data transfer; 10 GB fast origin transfer; 1M ISR reads / 200K ISR writes (8 KB units); 5K image transformations, 300K/100K image cache reads/writes; 100K/100 edge config reads/writes; blob 1 GB storage, 10K simple + 2K advanced ops, 10 GB transfer; 50K web analytics events; 10K speed insights events (1 project); sandbox 5 CPU-hrs, 420 GB-hrs memory, 5K creations, 20 GB network, 10 concurrent, 45-min max runtime. Platform limits: 100 deployments/day, 200 projects, 1 concurrent build, 45-min max build, 300 s max function duration, 50 domains/project, 1-hr log retention. No monthly build-minute meter exists (old '6,000 build minutes' numbers are stale).",
  "plans": [
    {
      "name": "Hobby",
      "price": "$0/mo",
      "included": "Quotas above; non-commercial only; hard caps with ~30-day pause on overage",
      "overage": "None — feature pauses or returns 402 until cycle resets"
    },
    {
      "name": "Pro",
      "price": "$20/mo platform fee (includes 1 deploying seat) + $20/mo usage credit (expires monthly); extra deploying seats $20/mo; viewer seats free; 14-day trial",
      "included": "10M edge requests + 1 TB fast data transfer per month; everything else is pure on-demand drawn against the $20 credit first. Limits: unlimited projects, 6,000 deploys/day, function duration 300 s default / 800 s max (1,800 s beta), up to 500 concurrent builds on-demand, build machines to 30 vCPU/60 GB, 2,000 concurrent sandboxes (24 h max runtime), 1-day log retention",
      "overage": "On-demand, regional (cheapest US iad1/cle1/pdx1): invocations $0.60/1M; active CPU $0.128–0.221/CPU-hr; provisioned memory $0.0106–0.0183/GB-hr; edge requests $2.00–3.20/1M; edge request CPU $0.30–0.48/hr; FDT $0.15–0.35/GB; FOT $0.06–0.43/GB; ISR reads $0.40–0.64/1M units, writes $4.00–6.40/1M units; image transforms $0.05–0.0812/1K, cache reads $0.40–0.64/1M, writes $4.00–6.40/1M; builds $0.0035/CPU-min (rounded up per min x vCPUs; Elastic is DEFAULT for new Pro teams so builds bill by default; Standard=4 vCPU/8GB, Enhanced=8/16, Turbo=30/60); blob storage $0.023–0.041/GB-mo, simple ops $0.35–0.56/1M, advanced $4.50–7.00/1M, transfer $0.05–0.117/GB; sandbox CPU $0.128/hr, memory $0.0212/GB-hr, creations $0.60/1M, network $0.15/GB, snapshots $0.08/GB-mo; web analytics $0.03/1K (0 included); observability plus $1.20/1M; drains $0.50/GB; edge config reads $3.00/1M, writes $5.00 (per docs/pricing). Add-ons: Speed Insights $10/project, Web Analytics Plus $10, Preview Suffix $100, Adv. Deployment Protection $150, Flags Explorer $250, SAML $300, HIPAA $350, Static IPs $100/project"
    },
    {
      "name": "Enterprise",
      "price": "Custom (unofficially ~$25k+/yr entry)",
      "included": "Custom quotas, 99.99% SLA, multi-region, SCIM, managed WAF, custom concurrency",
      "overage": "Negotiated"
    }
  ],
  "first_quota_blown": "During agent iteration: Hobby 100 deployments/day (push->deploy->fix loops at ~3-4 deploys/hr hit it in a workday; on Pro every push instead bills build CPU-minutes since Elastic is default). Once the app serves traffic: Provisioned Memory 360 GB-hrs — it bills through I/O waits, so a 2 GB instance kept warm by polling or 30-60 s LLM streams burns 360 GB-hrs in ~180 instance-hours (~6 hrs/day); 1M invocations + 1M edge requests fall next (8 browser tabs polling every 5 s ~= 1.4M req/mo). Smallest absolute quota: 5K image transformations, gone almost immediately on any image-heavy page.",
  "sweet_spots": "Hobby: personal/demo Next.js, <~30k visitors/mo, light API traffic, strictly non-commercial (fair-use ban on commercial apps is itself the first wall for shipped products). Pro at $20-40/mo: small production SaaS staying near included 10M edge requests + 1 TB FDT with functions/ISR/images covered by the $20 credit; watch $20/seat stacking. Enterprise: compliance/multi-region/negotiated egress — cost not the constraint.",
  "traps": [
    "Provisioned Memory bills during I/O waits while Active CPU pauses — long LLM streaming/proxy routes rack GB-hrs with near-zero CPU; this is the signature Vercel-agent cost trap",
    "Polling loops hit three meters at once (edge requests $2/1M + invocations $0.60/1M + permanently-warm memory); poll-every-2s status endpoint ~= 1.3M req/mo per client",
    "ISR write storms: short revalidate + non-deterministic output (new Date(), Math.random()) forces a write every revalidation, in 8 KB units at $4+/1M — one 80 KB page = 10 write units",
    "Every push bills a build on Pro: Elastic machines are the default for new teams, $0.0035/CPU-min rounded UP per minute x vCPUs (4-30); preview deploys count; ~200 commits/day at 2 min on 4 vCPU ~= $5.60/day",
    "Sandbox leaks: no sandbox.stop() bills memory until timeout (up to 24 h on Pro, ~$2.73+/instance at 8 vCPU/16 GB); per-test sandbox provisioning burns Hobby's 5K creations and 5 CPU-hrs in an afternoon",
    "Spend Management is a $200 NOTIFICATION by default, not a cap; auto-pause is opt-in, checks run every few minutes, and paused projects never auto-unpause",
    "Hobby overage = hard stop: image optimization 402s, sandbox creation pauses, ~30-day lockout on the exceeded feature",
    "Hobby fair-use: commercial apps risk suspension",
    "Catch-all middleware without a matcher runs on static assets and can double Fast Origin Transfer",
    "Verbose JSON/streaming/base64 egress bills FDT $0.15-0.35/GB AND FOT $0.06-0.43/GB; unoptimized 3 MB heroes x 30k views ~= 90 GB of Hobby's 100",
    "Forgotten preview deployments keep accruing edge/transfer/build usage per agent branch",
    "Regional multipliers: same traffic costs ~1.7x in gru1 ($0.221/CPU-hr) vs iad1 ($0.128)"
  ],
  "usage_check": "CLI: `vercel usage` (current cycle), `vercel usage --from 2026-07-01 --to 2026-07-31 --breakdown daily --format json`, `--scope <team>`. Dashboard: https://vercel.com/[team]/~/usage (charts per resource) and https://vercel.com/[team]/~/settings/billing (spend management). API: GET https://api.vercel.com/v1/billing/charges?teamId=...&from=...&to=... with Bearer token (FOCUS JSONL). Spend-management webhook fires at 50/75/100% of set amount.",
  "keywords": [
    "vercel",
    "vc",
    "vercel deploy",
    "vercel dev",
    "vercel build",
    "vercel logs",
    "vercel env",
    "vercel pull",
    "vercel link",
    "vercel usage",
    "vercel whoami",
    "vercel redeploy",
    "vercel promote",
    "vercel rollback",
    "vercel sandbox",
    "vercel blob",
    "vercel edge-config",
    "vercel crons",
    "npx vercel",
    "vercel deploy --prebuilt",
    "vercel --prod",
    "next build",
    "next dev",
    ".vercel",
    "vercel.json",
    "vercel_token",
    "vercel_org_id",
    "vercel_project_id",
    "api.vercel.com",
    ".vercel.app",
    "@vercel/sdk",
    "@vercel/blob",
    "@vercel/edge-config",
    "@vercel/sandbox",
    "@vercel/functions",
    "@vercel/og",
    "@vercel/kv",
    "next/image",
    "revalidate",
    "revalidatetag",
    "revalidatepath",
    "unstable_cache",
    "use cache",
    "fluid compute",
    "ai gateway",
    "spend management"
  ],
  "hint": "Vercel Hobby (non-commercial): 1M invocations+edge reqs, 360 GB-hr memory, 4 CPU-hr, 100 GB egress, 100 deploys/day, 5K image transforms; caps hard-pause ~30d. #1 trap: polling/LLM streams bill Provisioned Memory during I/O waits. Pro=$20+$20 credit; builds bill by default.",
  "conflicts": [
    "Edge Request CPU Duration: Report B claimed Pro includes 1 free hour then $0.30/hr; official regional-pricing page (WebFetch-verified) lists it purely as '1 Hour for $0.30-$0.48' with no included allotment — Report A wins",
    "Edge Config write pricing: Report B said $1.00 per 100 writes; official docs/pricing lists Edge Config Writes at $5.00 (unit not shown on page) — official page wins on price, exact unit denominator unresolved",
    "Standard build machine size: Report A said 2 vCPU/8 GB (citing a Hobby comparison table); official managing-builds doc (WebFetch-verified) lists Standard at 4 vCPU/8 GB/32 GB disk — official doc wins",
    "Build billing default: Report B framed Standard-machine builds as free unless you opt into Elastic/on-demand; Report A said Elastic is the default for new Pro teams so builds bill by default — WebFetch confirmed 'By default, we enable elastic builds for paid teams'; both statements true, A's practical framing wins",
    "First-quota-blown ranking: A ranked Provisioned Memory #1, B ranked 100 deploys/day #1 — judgment difference, merged as phase-dependent (deploy thrash during iteration, memory once serving traffic)",
    "Hobby items only in Report B (10 GB fast origin transfer, blob 1GB/10K/2K/10GB, 15 GB snapshot storage, workflow 50K events/1 GB, WAF 1M) — not contradicted by A, kept with B's docs/limits sourcing but single-sourced"
  ],
  "sources": [
    "https://vercel.com/pricing",
    "https://vercel.com/docs/pricing (fetched 2026-07-17, last_updated 2026-06-16)",
    "https://vercel.com/docs/pricing/regional-pricing (fetched 2026-07-17)",
    "https://vercel.com/docs/builds/managing-builds (fetched 2026-07-17, last_updated 2026-06-24)",
    "https://vercel.com/docs/plans/hobby",
    "https://vercel.com/docs/plans/pro-plan",
    "https://vercel.com/docs/limits",
    "https://vercel.com/docs/functions/usage-and-pricing",
    "https://vercel.com/docs/manage-cdn-usage",
    "https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing",
    "https://vercel.com/docs/image-optimization/limits-and-pricing",
    "https://vercel.com/docs/sandbox/pricing",
    "https://vercel.com/docs/spend-management",
    "https://vercel.com/docs/cli/usage",
    "https://vercel.com/docs/limits/fair-use-guidelines",
    "https://vercel.com/changelog/access-billing-usage-cost-data-api"
  ]
}
```

## Engine A — Claude web research (raw)

# Vercel Pricing & Quota Factsheet — verified July 2026

All numbers verified against official Vercel pricing/docs pages (docs last_updated stamps June–July 2026). Vercel's model changed materially in 2025–2026: functions moved from "GB-hours + invocations" to **Fluid Compute (Active CPU + Provisioned Memory + Invocations)**, ISR/image-cache moved to **8 KB read/write units priced regionally**, and Pro became a **$20 platform fee + $20 usage credit** model. Old blog posts citing "1,000 GB-hrs" or "6,000 build minutes" are stale.

---

## 1. Metered billing dimensions

Vercel bills on (per https://vercel.com/docs/pricing and https://vercel.com/docs/pricing/regional-pricing):

- **Edge Requests** (called "CDN Requests" in docs; every request to CDN — static, function, everything) + **Edge Request CPU Duration** (routing CPU >10 ms per request)
- **Fast Data Transfer** (CDN ↔ visitor egress, both directions, headers included)
- **Fast Origin Transfer** (CDN ↔ your functions/middleware/blob, both directions)
- **Functions (Fluid Compute)**: **Active CPU** (CPU-hours, pauses during I/O), **Provisioned Memory** (GB-hours, runs the whole instance lifetime incl. I/O waits), **Invocations** (per request)
- **ISR Reads / ISR Writes** (durable ISR cache, metered in **8 KB units**; CDN-level cache hits are free) — same units for **Runtime Cache reads/writes**
- **Image Optimization**: transformations (per 1K), image cache reads/writes (8 KB units)
- **Builds**: **$/CPU-minute** (only on Elastic/Enhanced/Turbo machines or with on-demand concurrency) — there is no "included build minutes" pool anymore
- **Blob**: storage GB-month, simple ops, advanced ops, blob data transfer
- **Sandbox**: Active CPU hrs, Provisioned Memory GB-hrs, creations, network GB, snapshot storage
- **Seats**: $20/mo per deploying (Owner/Member) seat; Viewer seats free
- **DX add-ons** (flat monthly): Observability Plus ($1.20/1M events), Web Analytics ($0.03/1K events), Speed Insights, SAML, etc.
- New BETA SKUs appearing in 2026: Queues ($0.60–0.96/1M operations), Service Requests, Container Registry, Vercel Agent (token-metered)

Sources: https://vercel.com/docs/pricing, https://vercel.com/docs/pricing/regional-pricing, https://vercel.com/docs/manage-cdn-usage, https://vercel.com/docs/functions/usage-and-pricing

## 2. Free tier (Hobby) — exact quotas per month

Non-commercial use only. No overage billing — features **pause/error until the 30-day window resets** when you hit a cap.

| Resource | Hobby included |
|---|---|
| Function Invocations | 1,000,000 |
| Active CPU | 4 CPU-hours |
| Provisioned Memory | 360 GB-hrs |
| Edge Requests | 1,000,000 |
| Fast Data Transfer | 100 GB |
| ISR Reads | 1,000,000 read units (8 KB each) |
| ISR Writes | 200,000 write units (8 KB each) |
| Image Transformations | 5,000 |
| Image Cache Reads / Writes | 300,000 / 100,000 |
| Edge Config Reads / Writes | 100,000 / 100 |
| Web Analytics Events | 50,000 |
| Speed Insights Events | 10,000 (1 project) |
| Sandbox | 5 CPU-hrs, 420 GB-hrs memory, 5,000 creations, 20 GB network, 10 concurrent, 45-min max runtime |
| Builds | Free on Standard machine (2 vCPU/8 GB per Hobby comparison table); 1 concurrent build; **100 deployments/day**; 200 projects; function max duration 300 s |

Sources: https://vercel.com/docs/plans/hobby, https://vercel.com/pricing, https://vercel.com/docs/functions/usage-and-pricing, https://vercel.com/docs/image-optimization/limits-and-pricing, https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing, https://vercel.com/docs/sandbox/pricing

Hobby overage behavior: image optimization returns 402 errors on new optimizations; sandbox creation pauses; generally 30-day lockout on the exceeded feature (https://vercel.com/docs/plans/hobby#hobby-billing-cycle, https://vercel.com/docs/image-optimization/limits-and-pricing#hobby).

## 3. Paid plans

### Pro — $20/month platform fee (includes 1 deploying seat) + $20/month usage credit
- Extra deploying seats $20/mo each; Viewer seats free & unlimited.
- **Included allocations**: 10,000,000 Edge Requests + 1 TB Fast Data Transfer. Everything else has **no included pool** — usage bills on-demand, drawn against the $20 monthly credit first, then charged. Credit expires monthly, doesn't roll over.
- Limits: unlimited projects, 6,000 deployments/day, function duration up to 800 s (1,800 s beta), up to 500 concurrent builds (on-demand), build machines up to 30 vCPU/60 GB.

**On-demand rates** (cheapest = US regions iad1/cle1/pdx1; ranges are regional, per https://vercel.com/docs/pricing/regional-pricing and https://vercel.com/docs/functions/usage-and-pricing):

| Resource | On-demand price |
|---|---|
| Function Invocations | $0.60 per 1M (now metered per-unit at $0.0000006 each) |
| Active CPU | $0.128/CPU-hr (iad1) — up to $0.221/hr (gru1) |
| Provisioned Memory | $0.0106/GB-hr (iad1) — up to $0.0183 (gru1) |
| Edge Requests | $2.00–$3.20 per 1M (after 10M included) |
| Edge Request CPU Duration | $0.30–$0.48 per hour |
| Fast Data Transfer | $0.15–$0.35 per GB (after 1 TB included) |
| Fast Origin Transfer | $0.06–$0.43 per GB |
| ISR Reads | $0.40–$0.64 per 1M 8-KB read units |
| ISR Writes | $4.00–$6.40 per 1M 8-KB write units |
| Image Transformations | $0.05–$0.0812 per 1K |
| Image Cache Reads / Writes | $0.40–$0.64 per 1M / $4.00–$6.40 per 1M |
| Builds | $0.0035 per CPU-minute (rounded up per minute × machine vCPUs; e.g. 3 min on 8-vCPU Enhanced = $0.084). Standard machine builds free unless on-demand concurrency/Elastic enabled — but **Elastic is the default for new Pro teams**, so builds bill by default |
| Blob | storage $0.023–$0.041/GB-mo; simple ops $0.35–$0.56/1M; advanced ops $4.50–$7.00/1M; blob transfer $0.05–$0.117/GB |
| Sandbox | CPU $0.128/hr; memory $0.0212/GB-hr; creations $0.60/1M; network $0.15/GB; snapshots $0.08/GB-mo; 2,000 concurrent; 24 h max runtime |
| Web Analytics | $0.03 per 1K events (0 included on Pro) |
| Observability Plus | $1.20 per 1M events |
| Add-ons | SAML $300/mo, HIPAA $350/mo, Adv. Deployment Protection $150/mo, Flags Explorer $250/mo, Preview Suffix $100/mo, Static IPs $100/mo/project, Web Analytics Plus $10/mo, Speed Insights $10/mo/project |

Sources: https://vercel.com/docs/plans/pro-plan, https://vercel.com/docs/pricing, https://vercel.com/docs/pricing/regional-pricing, https://vercel.com/docs/builds/managing-builds, https://vercel.com/docs/sandbox/pricing, https://vercel.com/pricing

### Enterprise — custom pricing (commonly cited ~$25k+/yr entry, unofficial). Custom concurrency, regions, terms. https://vercel.com/pricing

**Recent changes to flag (2025–2026):** Active CPU/Fluid pricing became the default for all plans by early 2026 (replacing pure GB-hr duration billing); invocations shifted from bundled $0.60/1M packages to per-unit $0.0000006 metering (same effective rate); ISR & image cache moved to regional 8 KB-unit pricing; Elastic build machines (billed per CPU-minute) became the Pro default. Blog reference: https://vercel.com/blog/improved-infrastructure-pricing

## 4. Sweet spots & what an agent-built Next.js app blows through FIRST

- **Hobby fits**: a personal Next.js app with <~30k visitors/mo, light API traffic, modest images. Non-commercial only (fair-use policy).
- **Pro at $20–40/mo fits**: small production SaaS staying near the included 10M edge requests / 1 TB FDT, with functions/ISR covered by the $20 credit.

**First-blown quotas for an agent-built app (small Next.js + chatty DB + auto-deploys + sandboxed runs), in likely order:**

1. **Provisioned Memory GB-hrs (Hobby: 360)** — the classic killer for "chatty DB" apps. Memory bills for the whole instance lifetime *including* I/O waits. A 2 GB function instance kept warm by steady traffic burns 360 GB-hrs in ~180 instance-hours (~6 hrs/day). A polling endpoint hit every few seconds keeps the instance alive nearly 24/7 → ~1,440 GB-hrs/mo at 2 GB. (https://vercel.com/docs/functions/usage-and-pricing)
2. **Function Invocations + Edge Requests (Hobby: 1M each)** — a dashboard polling an API route every 5 s from just 8 concurrent browser tabs ≈ 1.4M requests/mo. Client-side SWR/React Query refetch-on-focus multiplies this (Vercel explicitly calls out polling as the top Edge Request driver: https://vercel.com/docs/manage-cdn-usage#optimizing-cdn-requests).
3. **ISR Writes (Hobby: 200k units)** — agents love `revalidate: 10` (or 1). Note units are 8 KB: one 80 KB page write = 10 write units. 50 pages × 100 KB × revalidating every 60 s with changing content ≈ 1.1M write units/day. Also: **non-deterministic output (`new Date()`, `Math.random()`) in a page forces a write on every revalidation** — a signature AI-generated-code bug (https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing).
4. **Fast Data Transfer (Hobby: 100 GB)** — unoptimized hero images/videos: 30k page views × 3 MB = 90 GB. On Pro, 1 TB included is generous; on Hobby this goes fast.
5. **Image Transformations (Hobby: 5,000)** — smallest quota on the list. A gallery page with 50 remote images × a few `sizes` variants × a handful of deploys of changed URLs exhausts 5K almost immediately; then `next/image` starts returning 402s.
6. **Deployments/day (Hobby: 100)** — an agent auto-deploying on every commit in a tight fix loop can hit 100/day; on Pro, every push also bills build CPU-minutes since Elastic is default.
7. **Sandbox Active CPU (Hobby: 5 hrs)** — an agent running test suites in sandboxes at 2–4 vCPU burns 5 CPU-hrs in a single afternoon of CI-style runs; then creation pauses for 30 days.

## 5. Cost traps specific to AI-agent usage patterns

- **Polling loops** hit *three* meters at once: Edge Requests ($2/1M), Invocations ($0.60/1M), and — worst — Provisioned Memory, because continuous traffic never lets the instance pause. A "poll every 2 s" status endpoint an agent writes casually ≈ 1.3M req/mo per client *and* a permanently-warm instance.
- **Memory bills during I/O; CPU doesn't.** Long `await fetch()` to an LLM (30–60 s streaming responses) is cheap on Active CPU but racks up Provisioned Memory GB-hrs and holds instances open. Agents building LLM proxy routes on Vercel hit this hard. (https://vercel.com/docs/functions/usage-and-pricing)
- **ISR write storms**: short `revalidate` values + non-deterministic page output (timestamps, random IDs) = a write on every revalidation, in 8 KB units, at $4+/1M units. Debug checklist is literally in the docs (https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing#optimizing-isr-reads-and-writes).
- **Every push = a billed build** on Pro (Elastic machines default, $0.0035/CPU-min, rounded up per minute, × up to 30 vCPUs). An agent that commits 200 times/day on a 4-vCPU machine at 2 min/build ≈ $5.60/day just in builds; preview deployments count too. (https://vercel.com/docs/builds/managing-builds)
- **Sandbox leaks**: forgetting `sandbox.stop()` bills memory until the timeout (default 5 min, configurable to 24 h on Pro). A 8-vCPU/16 GB sandbox left at a 24 h timeout ≈ $2.73+ per instance; per-test sandbox provisioning multiplies creations and CPU. (https://vercel.com/docs/sandbox/pricing)
- **Double middleware transfer**: middleware + function on the same request can incur Fast Origin Transfer twice; agents that scaffold catch-all middleware without a `matcher` pay this on every asset. (https://vercel.com/docs/manage-cdn-usage#middleware)
- **Large egress**: verbose JSON API responses and unoptimized assets bill FDT at $0.15–0.35/GB *and* Fast Origin Transfer at $0.06–0.43/GB.
- **Spend Management is not a hard cap by default**: default is a $200 *notification*. Auto-pause must be explicitly enabled, checks run "every few minutes," and paused projects **do not auto-unpause** — traffic can accrue past the threshold. (https://vercel.com/docs/spend-management)
- **Hobby fair-use**: agents deploying commercial-ish apps on Hobby risk suspension (non-commercial only). (https://vercel.com/docs/limits/fair-use-guidelines)

## 6. How to check current usage/spend

- **CLI (exists as of 2026)**: `vercel usage`, `vercel usage --from 2026-07-01 --to 2026-07-17`, `vercel usage --breakdown daily` — "View billing usage and costs for your Vercel account." Also `vercel metrics <metric-id> --since 7d` for metric queries, and `vercel api <endpoint>` (beta) for raw REST calls. (https://vercel.com/docs/cli#usage, https://vercel.com/docs/cli/usage)
- **Dashboard**: `https://vercel.com/[team-slug]/~/usage` (Usage in sidebar; charts per resource with project/region filters); billing & spend management at `https://vercel.com/[team-slug]/~/settings/billing`. (https://vercel.com/docs/pricing/manage-and-optimize-usage, https://vercel.com/docs/spend-management)
- **Programmatic**: Spend Management webhook fires at 50/75/100% of your set amount with `{budgetAmount, currentSpend, teamId, thresholdPercent}` payload; REST API at `api.vercel.com` (e.g. project unpause endpoint) with bearer token. (https://vercel.com/docs/spend-management#configuring-a-webhook, https://vercel.com/docs/rest-api)
- Defaults: spend notification at $200/cycle auto-enabled for new Pro customers; 75%-of-credit alert built in.

## 7. Keyword triggers (shell/command indicators)

`vercel`, `vc` (CLI alias), `vercel deploy`, `vercel dev`, `vercel env pull`, `vercel build`, `vercel logs`, `vercel usage`, `vercel sandbox`, `vercel blob`, `vercel edge-config`, `vercel crons`, `vercel redeploy`, `vercel promote`, `vercel rollback`, `next build`/`next dev` (Next.js strongly implies Vercel deploy target), `.vercel/` directory, `vercel.json`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `api.vercel.com`, `*.vercel.app` URLs, `@vercel/sdk`, `@vercel/blob`, `@vercel/edge-config`, `@vercel/sandbox`, `next/image` (image optimization meter), `revalidate`/`revalidateTag`/`revalidatePath` (ISR meter), `unstable_cache`/`use cache` (runtime cache meter), `vercel vcr` (container registry), `vercel ai-gateway`.

---

### Primary sources
- https://vercel.com/pricing (plan overview, Hobby/Pro quotas, overage rates)
- https://vercel.com/docs/pricing (billable resources master list; builds $0.0035/CPU-min)
- https://vercel.com/docs/plans/hobby (Hobby quota table, 30-day pause behavior; updated 2026-06-16)
- https://vercel.com/docs/plans/pro-plan ($20 platform fee, $20 credit, 10M edge req + 1 TB FDT included, seats, add-ons; updated 2026-07-01)
- https://vercel.com/docs/functions/usage-and-pricing (Fluid compute: Active CPU/Provisioned Memory/Invocations, per-region rate table)
- https://vercel.com/docs/pricing/regional-pricing (all on-demand price ranges: FDT, edge requests, ISR, blob, sandbox-adjacent SKUs)
- https://vercel.com/docs/manage-cdn-usage (FDT/FOT/edge request definitions, polling warning)
- https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing (8 KB units, ISR write-storm debugging)
- https://vercel.com/docs/image-optimization/limits-and-pricing (5K/300K/100K Hobby, 402 behavior)
- https://vercel.com/docs/builds/managing-builds (Elastic default, machine tiers, concurrency)
- https://vercel.com/docs/sandbox/pricing (sandbox meters, Hobby allotments, examples)
- https://vercel.com/docs/spend-management (default $200 alert, pause semantics, webhook)
- https://vercel.com/docs/cli / https://vercel.com/docs/cli/usage (`vercel usage` command)
- Secondary (2026 change context, treat with caution): https://www.usagepricing.com/blueprint/vercel, https://makerkit.dev/blog/saas/vercel-cost

## Engine B — grok CLI (raw)

# Vercel pricing & quota factsheet  
**As of July 2026** · Official sources only (pricing page last checked mid‑July 2026)

---

## 1. Metered billing dimensions

Vercel bills in two buckets: **Managed Infrastructure** (usage) and **Developer Experience Platform** (seats / fixed add‑ons).

| Dimension | What it meters | Bills when |
|---|---|---|
| **Edge Requests** (CDN Requests) | Every request the CDN handles (static + functions + middleware) | Per request |
| **Fast Data Transfer** | Bytes CDN ↔ client (request + response, headers included) | Per GB, regional |
| **Fast Origin Transfer** | Bytes CDN ↔ Functions / Blob / ISR origin | Per GB, regional |
| **Edge Request CPU Duration** | CPU on the CDN edge for routing (Pro: first 1 hr included) | Per CPU‑hour after free band |
| **Function Invocations** | Each request that hits a Vercel Function | Per million |
| **Active CPU** | CPU time your function code *actually runs* (I/O wait excluded) | Per CPU‑hour, regional |
| **Provisioned Memory** | Memory × instance lifetime (includes I/O wait) | Per GB‑hour, regional |
| **ISR Reads / Writes** | Durable ISR cache in 8 KB units | Per million units, regional |
| **Image transformations / cache R/W** | `next/image` style optimization | Per 1K transforms; per 1M cache R/W |
| **Build CPU minutes** | Build wall time × vCPUs (rounded up per minute) | Per CPU‑minute (Pro on‑demand) |
| **Blob** | Storage size, simple/advanced ops, data transfer | GB / ops / GB |
| **Edge Config** | Reads / writes | Per 1M reads; per 100 writes |
| **Sandbox** | Active CPU, provisioned memory, creations, network, snapshots | Same style as Functions + extras |
| **Seats** | Deploying team members | Fixed $/seat/mo |
| **Add‑ons** | SSO, HIPAA, Static IPs, Speed Insights, etc. | Fixed $/mo |

Sources: [vercel.com/pricing](https://vercel.com/pricing), [docs/pricing](https://vercel.com/docs/pricing), [functions/usage-and-pricing](https://vercel.com/docs/functions/usage-and-pricing), [manage-cdn-usage](https://vercel.com/docs/manage-cdn-usage).

**Billing model difference**

| | Hobby | Pro |
|---|---|---|
| Overage | **Hard caps** → pause / 402 / wait ~30 days (no overage invoices) | **Included allotments + $20 credit**, then **on‑demand** |
| Commercial use | **Not allowed** | Allowed |

Sources: [Hobby plan](https://vercel.com/docs/plans/hobby), [Pro plan](https://vercel.com/docs/plans/pro-plan), [Fair use](https://vercel.com/docs/limits/fair-use-guidelines).

---

## 2. Free tier (Hobby) — exact quotas

**Price:** **$0 / month**  
**Constraint:** Non‑commercial personal use only.

| Resource | Included (per month unless noted) | Unit |
|---|---|---|
| Edge Requests | **1,000,000** | requests |
| Fast Data Transfer | **100 GB** | GB |
| Fast Origin Transfer | **10 GB** | GB |
| Function Invocations | **1,000,000** | invocations |
| Active CPU | **4** | CPU‑hours |
| Provisioned Memory | **360** | GB‑hours |
| ISR Reads | **1,000,000** | units (8 KB each) |
| ISR Writes | **200,000** | units (8 KB each) |
| Image transformations | **5,000** | transformations |
| Image cache reads | **300,000** | units |
| Image cache writes | **100,000** | units |
| Edge Config reads | **100,000** | reads |
| Edge Config writes | **100** | writes |
| Blob storage | **1 GB** | GB‑month |
| Blob simple ops | **10,000** | ops |
| Blob advanced ops | **2,000** | ops |
| Blob data transfer | **10 GB** | GB |
| Web Analytics | **50,000** events | events |
| Speed Insights | **10,000** events, **1** project | events |
| Workflow events | **50,000** | events |
| Workflow data written | **1 GB** | GB |
| Sandbox Active CPU | **5** hours | CPU‑hours |
| Sandbox Provisioned Memory | **420** GB‑hrs | GB‑hours |
| Sandbox creations | **5,000** | creations |
| Sandbox network | **20 GB** | GB |
| Concurrent sandboxes | **10** | concurrent |
| Snapshot storage | **15 GB** | GB |
| Rate limiting (WAF) allowed | **1,000,000** | requests |
| Projects | **200** | projects |
| Deployments / day | **100** | deploys |
| Concurrent builds | **1** | build |
| Max build time / deploy | **45** minutes | wall clock |
| Function max duration | **300 s** (5 min) | seconds |
| Domains / project | **50** | domains |
| Runtime logs retention | **1 hour** | time |

Sources: [vercel.com/pricing](https://vercel.com/pricing), [docs/plans/hobby](https://vercel.com/docs/plans/hobby), [docs/limits](https://vercel.com/docs/limits), [manage-cdn-usage](https://vercel.com/docs/manage-cdn-usage).

**Note on “build minutes”:** Current official pages do **not** list a monthly Hobby build‑minute bucket (older “~100 min” blog numbers are stale). Hobby is constrained by **1 concurrent build**, **100 deploys/day**, and **45 min/build**, not a published monthly minute meter.

---

## 3. Paid plans

### Hobby → already above ($0)

### Pro

| Item | Value |
|---|---|
| **Name** | Pro |
| **Platform fee** | **$20 / month** |
| **Includes** | 1 deploying seat + **$20 monthly usage credit** |
| **Extra deploying seats** | **$20 / seat / month** (Owner/Member) |
| **Viewer seats** | Unlimited free (read‑only) |
| **Trial** | 14 days + $20 credit |

**Included infrastructure (do not consume credit until exceeded):**

| Resource | Included |
|---|---|
| Fast Data Transfer | **1 TB** / month |
| Edge Requests | **10,000,000** / month |

Source: [Pro plan – monthly credit](https://vercel.com/docs/plans/pro-plan).

**Starting on‑demand rates** (after included allotments and the $20 credit; many are regional — “starting at” = cheapest US regions):

| Resource | Overage (starting rates) |
|---|---|
| Edge Requests | **$2.00 / 1M** |
| Fast Data Transfer | **$0.15 / GB** |
| Fast Origin Transfer | **$0.06 / GB** |
| Edge Request CPU Duration | **1 hour** included, then **$0.30 / hour** |
| Function Invocations | **$0.60 / 1M** |
| Active CPU | **from $0.128 / CPU‑hour** (e.g. iad1/cle1/pdx1) |
| Provisioned Memory | **from $0.0106 / GB‑hour** |
| ISR Reads | **from $0.40 / 1M** (also listed as $0.0004 / 1K) |
| ISR Writes | **from $4.00 / 1M** (also listed as $0.004 / 1K) |
| Image transformations | **$0.05 – $0.0812 / 1K** |
| Image cache reads | **$0.40 – $0.64 / 1M** |
| Image cache writes | **$4.00 – $6.40 / 1M** |
| Edge Config reads | **$3.00 / 1M** |
| Edge Config writes | **$1.00 / 100** (≡ $10 / 1K) |
| Build Standard | **$0.014 / min** (only when on‑demand concurrency or Elastic machines) |
| Build Enhanced | **$0.028 / min** |
| Build Turbo | **$0.105 / min** |
| Build (CPU‑minute formula) | **$0.0035 × minutes × vCPUs** |
| Blob storage | **$0.023 / GB** |
| Blob simple ops | **$0.40 / 1M** |
| Blob advanced ops | **$5.00 / 1M** |
| Blob transfer | **from $0.05 / GB** |
| Sandbox Active CPU | **from $0.128 / hour** |
| Sandbox memory | **from $0.0212 / GB‑hour** |
| Sandbox creation | **from $0.60 / 1M** |
| Sandbox network | **from $0.15 / GB** |
| Concurrent sandboxes (Pro) | **2,000** |
| Web Analytics | **$0.03 / 1K** events (Pro has no free event allotment) |
| Observability Plus | **$1.20 / 1M** events |
| Drains | **$0.50 / GB** |
| Workflow events | **$20 / 1M** (or $0.02 / 1K) |
| Workflow data written | **$0.50 / GB** |
| Workflow data retained | **$0.50 / GB‑month** |

Sources: [vercel.com/pricing](https://vercel.com/pricing), [docs/limits on‑demand table](https://vercel.com/docs/limits), [functions regional table](https://vercel.com/docs/functions/usage-and-pricing), [docs/pricing builds](https://vercel.com/docs/pricing).

**Pro platform limits (not $ usage):**

| Limit | Pro |
|---|---|
| Deployments / day | **6,000** |
| Projects | Unlimited |
| Concurrent builds | Up to **500** (fair use) |
| Function max duration | **300 s** default; configurable to **800 s**; extended beta **1800 s** |
| Runtime logs | **1 day** (30 days with Observability Plus) |

**Common Pro add‑ons (fixed):**

| Add‑on | Price |
|---|---|
| Speed Insights | $10 / project / month |
| Web Analytics Plus | $10 / month |
| Preview Deployment Suffix | $100 / month |
| Advanced Deployment Protection | $150 / month |
| Static IPs | $100 / project / month + private transfer |
| Flags Explorer unlimited | $250 / month |
| SAML SSO | $300 / month |
| HIPAA BAA | $350 / month |

Source: [Pro plan](https://vercel.com/docs/plans/pro-plan), [docs/pricing DX Platform](https://vercel.com/docs/pricing).

### Enterprise

**Custom** pricing, SLAs (99.99%), multi‑region, SCIM, managed WAF, advanced support. Contact sales.

---

## 4. Sweet spots & what an agent‑built Next.js app burns first

### Plan fit

| Plan | Fits | Breaks when |
|---|---|---|
| **Hobby** | Solo demos, personal Next.js, low traffic, no monetization | Any commercial use; ~1M edge/invocations; 100 GB egress; agent auto‑deploy thrash |
| **Pro ($20 + seats)** | Real product / client work, team previews, moderate traffic, pay‑as‑you‑go safety | Seats stack; AI long‑poll memory; image/ISR/build overages; no spend cap |
| **Enterprise** | Compliance, multi‑region, high support, negotiated egress | Cost not the constraint |

### What a **typical AI‑agent‑deployed** app hits first

Assumptions: small Next.js app, Route Handlers + chatty DB (e.g. Neon/Supabase via API routes), auto‑deploy on every PR/push, optional **Sandbox** for code exec, some `next/image`, maybe short ISR revalidate.

| Rank | Quota (Hobby hard cap / Pro cost) | Why agent patterns hit it | Rough trigger |
|---|---|---|---|
| **1** | **Deployments / day = 100 (Hobby)** | Agent loops: push → deploy → fix → push; PR previews per branch | ~3–4 deploys/hour all day, or many PR previews |
| **2** | **Edge Requests 1M (Hobby) / cheap on Pro until 10M** | Every HTML/JS/CSS asset + API call + middleware; polling UIs multiply fast | ~1 req/s average sustained (~2.6M/mo) or chatty SPA + 10 assets/page |
| **3** | **Function Invocations 1M** | One invocation per API/chat/DB proxy call; no batching | ~0.4 RPS of API traffic, or agent health‑checks every few seconds |
| **4** | **Provisioned Memory 360 GB‑hrs (Hobby)** | LLM/proxy routes **wait on I/O** → memory still bills; Active CPU often looks fine | e.g. 1 GB instance open 1 s average × ~360k invocations ≈ 100 GB‑hrs; long streams burn faster |
| **5** | **Active CPU 4 hrs** | CPU‑heavy work *on* Vercel (token post‑processing, PDF, image transform in function) | Rarely first if functions mostly await external AI APIs |
| **6** | **Fast Data Transfer 100 GB (Hobby)** | Streaming AI responses, large JS bundles, unoptimized images, downloads | ~3 GB/day or a few viral image pages |
| **7** | **Image transformations 5K** | Agent scaffolds `next/image` with many sizes/remote patterns | Catalog / UGC / many avatar sizes |
| **8** | **ISR Writes 200K** | `revalidate: 1` or frequent on‑demand revalidate on dynamic content | High write unit volume (8 KB units) on chatty pages |
| **9** | **Sandbox creations 5K / Sandbox CPU 5 hrs** | One sandbox per agent test / eval / user code run | CI‑style agent evals, unattended loops |
| **10** | **Pro $20 usage credit** | After free 1 TB / 10M edge, **builds + functions + ISR + images** eat credit | Heavy preview CI + AI routes can exhaust credit in days |

**Practical first‑to‑fail for agent workflows**

1. **Hobby commercial‑use ban** if you ship a product.  
2. Else **deploy thrash (100/day)** during agent iteration.  
3. Else **edge requests / invocations** from polling + chatty APIs.  
4. Else **provisioned memory** on long LLM proxy routes (not Active CPU).  
5. On **Pro with Sandbox/code runs**: **sandbox creations + sandbox network** before main site traffic.

---

## 5. Cost traps specific to AI‑agent usage

| Trap | Mechanism | Impact |
|---|---|---|
| **Polling loops** | `setInterval` / SWR focus refetch / agent status poll → Edge Requests + Invocations | Burns 1M edge/invocations quietly |
| **LLM proxy on Functions** | Active CPU pauses on I/O, **Provisioned Memory does not** | Long streams = high GB‑hrs with low CPU hours |
| **Forgotten preview deploys** | Every PR/agent branch stays live; assets still get crawled/hit | Edge + transfer + build accumulation |
| **Auto‑deploy on every commit** | Hobby 100 deploys/day; Pro bills build CPU minutes with Elastic/on‑demand | Build bill + concurrency queue |
| **Per‑test Sandbox provisioning** | Create sandbox per agent tool call | Hits 5K Hobby creations; Pro creations + CPU + network |
| **Large egress** | Streaming tokens, base64 images, fat JSON from tools | Fast Data Transfer $0.15/GB after 1 TB (Pro) or hard stop at 100 GB (Hobby) |
| **`next/image` defaults** | Many transforms + cache writes for generated assets | 5K transform Hobby wall; Pro $ on transforms + cache W |
| **Aggressive ISR** | Short `revalidate`, non‑deterministic HTML (`Date.now()`, random) forces writes | ISR write units at $4/1M |
| **Middleware matcher too broad** | Middleware runs on static assets → extra origin/edge work | Edge Request CPU + double origin transfer risk |
| **No Spend Management** | Pro default notify at **$200**; pause not instant (checked every few minutes) | Runaway agent can overshoot cap |
| **Seat multiplication** | Each agent human who deploys = $20 seat | Not usage, but fixed cost trap for “team of bots + humans” |
| **Regional multipliers** | Non‑US Active CPU up to ~$0.22/hr (e.g. gru1) | Same traffic, higher bill |

Sources: [functions Active CPU vs memory](https://vercel.com/docs/functions/usage-and-pricing), [CDN optimize polling note](https://vercel.com/docs/manage-cdn-usage), [spend management](https://vercel.com/docs/spend-management), [ISR non‑deterministic writes](https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing).

---

## 6. How to check current usage / spend

### CLI

```bash
# Current billing period (team context)
vercel usage

# Custom range (Pacific midnight / end-of-day)
vercel usage --from 2026-07-01 --to 2026-07-31

# Daily breakdown
vercel usage --breakdown daily

# Machine-readable
vercel usage --format json

# Scope to a team
vercel usage --scope <team-slug>
# or
vercel usage --team <team-id>
```

Source: [vercel usage CLI](https://vercel.com/docs/cli/usage).

### REST API (FOCUS JSONL)

```bash
curl -N --request GET \
  --url 'https://api.vercel.com/v1/billing/charges?teamId=<team>&from=2026-07-01T00:00:00.000Z&to=2026-07-31T23:59:59.000Z' \
  --header 'Authorization: Bearer <token>' \
  --header 'Accept-Encoding: gzip' \
  --compressed
```

Source: [changelog – billing charges API](https://vercel.com/changelog/access-billing-usage-cost-data-api) · [API reference](https://docs.vercel.com/docs/rest-api/reference/endpoints/billing/list-focus-billing-charges).

### Dashboard URLs

| What | URL |
|---|---|
| Usage charts | `https://vercel.com/[team]/~/usage` (or sidebar **Usage**) |
| Billing / plan / spend caps | `https://vercel.com/[team]/~/settings/billing` |
| Deep link helper | [Open Billing](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fsettings%2Fbilling&title=Go+to+Billing) |
| Observability | `https://vercel.com/[team]/[project]/observability` |

Pro: set **Spend Management** alerts / pause at a $ threshold (default notify path often $200 for new teams).

---

## 7. Keyword triggers (shell / CI)

Short lowercase tokens that usually mean **this provider / sub‑service is in play**:

```
vercel
vc 
vercel deploy
vercel env
vercel usage
vercel whoami
vercel link
vercel pull
vercel build
vercel logs
vercel dev
vercel --prod
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
.vercel
vercel.json
@vercel/sdk
@vercel/blob
@vercel/edge-config
@vercel/functions
@vercel/og
@vercel/kv
fluid compute
next start          # often with vercel adapter, weaker signal
```

Sub‑product / usage‑dimension signals:

```
edge request
fast data transfer
isr
revalidate
next/image
image optimization
edge config
vercel blob
vercel sandbox
vercel queues
ai gateway
observability plus
spend management
```

CI / agent deploy signals:

```
vercel deploy --prebuilt
vercel pull --yes
npx vercel
```

---

## Quick reference: focus metrics you asked for

| Metric | Hobby included | Pro included / overage |
|---|---|---|
| Function invocations | 1M | On‑demand **$0.60 / 1M** (after credit) |
| Function duration model | Active CPU **4 h** + Memory **360 GB‑hrs** | **from $0.128/CPU‑h** + **from $0.0106/GB‑h** (not legacy single “GB‑hours” only) |
| Edge requests | 1M | **10M** then **$2 / 1M** |
| Fast Data Transfer | 100 GB | **1 TB** then **from $0.15 / GB** |
| Image optimization | 5K transform / 300K cache R / 100K cache W | Same meters, regional $/unit |
| ISR | 1M reads / 200K writes | **from $0.40 / 1M** reads, **from $4 / 1M** writes |
| Build minutes | No monthly $ meter; 1 concurrent, 100 deploys/day, 45 min max | **$0.0035/CPU‑min** (machine rates $0.014–$0.105/min) |

---

### Source index (primary)

1. https://vercel.com/pricing  
2. https://vercel.com/docs/pricing  
3. https://vercel.com/docs/plans/hobby  
4. https://vercel.com/docs/plans/pro-plan  
5. https://vercel.com/docs/limits  
6. https://vercel.com/docs/limits/fair-use-guidelines  
7. https://vercel.com/docs/functions/usage-and-pricing  
8. https://vercel.com/docs/manage-cdn-usage  
9. https://vercel.com/docs/image-optimization/limits-and-pricing  
10. https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing  
11. https://vercel.com/docs/cli/usage  
12. https://vercel.com/changelog/access-billing-usage-cost-data-api  

**Re‑verify before large spend:** rates are regional and Vercel updates credit/allotment tables; always confirm on [vercel.com/pricing](https://vercel.com/pricing) and [docs/pricing/regional-pricing](https://vercel.com/docs/pricing/regional-pricing) for the region you deploy to.
