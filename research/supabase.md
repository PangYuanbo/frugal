# Research archive: supabase

Raw dual-engine research output (2026-07-17). Engine A = Claude subagent with web search; Engine B = grok CLI (`grok -p`, web search enabled). The merged factsheet cross-checks both, preferring official pricing pages on conflicts.

## Merged factsheet (cross-checked)

```json
{
  "provider": "Supabase",
  "billing_dimensions": [
    "plan subscription (per ORGANIZATION, not per project; no seats — Team $599 is flat)",
    "compute hours: dedicated Postgres per ACTIVE project, billed hourly with partial hours rounded UP; Nano free on Free plan but billed at Micro rate (~$10/mo) on paid orgs; Micro $0.01344/hr (~$10/mo) up to 16XL $5.12/hr (~$3,730/mo); paused projects bill $0; NOT covered by Spend Cap",
    "disk size: 8 GB included per project (paid), then gp3 $0.125/GB-mo; io2 $0.195/GB-mo from first byte; does not auto-shrink",
    "disk IOPS/throughput: 3,000 IOPS + 125 MB/s included (gp3), then $0.024/IOPS, $0.095/MB-s",
    "egress (uncached, unified across DB/Auth/Storage/Realtime/Functions/Supavisor): $0.09/GB overage",
    "cached egress (Storage CDN hits, separate quota since Jul 2025): $0.03/GB overage",
    "file storage: $0.0213/GB-mo overage",
    "Auth MAU: $0.00325/MAU overage; third-party MAU billed similarly; SSO MAU $0.015/MAU over 50 (Pro+)",
    "Edge Function invocations: $2 per 1M overage (OPTIONS free; failed invokes count)",
    "Realtime messages: $2.50 per 1M overage; Realtime peak concurrent connections: $10 per 1,000 overage",
    "branching compute: each preview/persistent branch is its own hourly instance from $0.01344/hr + disk/egress; NOT covered by compute credits or Spend Cap",
    "read replica compute: hourly like a project",
    "image transforms: $5 per 1,000 origin images over 100 (Pro)",
    "add-ons (flat/hourly per project): PITR ~$100/mo per 7d retention, custom domain $10/mo, IPv4 ~$4/mo ($0.0055/hr), Advanced MFA phone $75/mo first project then $10, log drains $60/drain/mo + $0.20/M events + $0.09/GB, pipelines $39/mo + $3/GB replicated",
    "NOT metered: Data API request count (unlimited on all plans)"
  ],
  "free_tier": "$0/mo. 2 ACTIVE projects (paused don't count; pricing page says 'Limit of 2 active projects'). Projects AUTO-PAUSE after 7 days of inactivity, manual restore only. Nano-class shared compute (~500 MB RAM). 500 MB database per project. 50,000 Auth MAU (+50k third-party MAU). 5 GB egress + 5 GB cached egress/mo. 1 GB file storage, 50 MB max upload. 500,000 Edge Function invocations/mo. Realtime: 200 peak concurrent connections, 2M messages/mo (256 KB max message). No backups/PITR/branching; 1-day log retention; unlimited API requests; unlimited team members. Over quota: email warning (within ~20% of limits) + grace period, then requests rejected with 402 until next cycle or upgrade.",
  "plans": [
    {
      "name": "Free",
      "price": "$0/mo per org",
      "included": "2 active projects (7-day inactivity auto-pause), Nano compute, 500 MB DB/project, 50k MAU, 5 GB egress + 5 GB cached, 1 GB storage (50 MB uploads), 500k edge invocations, 200 realtime conns / 2M msgs, 1-day logs, no backups",
      "overage": "None — grace period then 402 rejections until upgrade/next cycle"
    },
    {
      "name": "Pro",
      "price": "$25/mo per org",
      "included": "$10/mo compute credits (covers exactly ONE Micro instance; no rollover; not applicable to branches), 100k MAU, 8 GB disk/project, 250 GB egress + 250 GB cached, 100 GB storage (500 GB max upload), 2M edge invocations, 500 realtime peak conns / 5M msgs, 50 SSO MAU, 100 image transforms, daily backups 7d, 7-day logs, no pausing, Spend Cap ON by default",
      "overage": "MAU $0.00325; disk $0.125/GB; egress $0.09/GB; cached egress $0.03/GB; storage $0.0213/GB; edge $2/1M; realtime $2.50/1M msgs, $10/1k conns; SSO MAU $0.015; transforms $5/1k; extra project compute ~$10+/mo each (Micro $0.01344/hr, hours rounded up) — compute/disk/branching NOT blocked by Spend Cap"
    },
    {
      "name": "Team",
      "price": "$599/mo per org",
      "included": "Same usage quotas/overage rates as Pro + SOC2 & ISO 27001, HIPAA add-on path, SSO for dashboard, project-scoped/read-only roles, 14-day backups, 28-day logs, priority support/SLAs, AWS PrivateLink",
      "overage": "Same rates as Pro"
    },
    {
      "name": "Enterprise",
      "price": "Custom",
      "included": "Custom quotas, SLAs, BYO cloud, 24x7 support",
      "overage": "Custom"
    }
  ],
  "first_quota_blown": "Free plan: the 7-day inactivity AUTO-PAUSE kills 'deploy and forget' agent apps before any quota is touched (restore is manual). Next: 500 MB DB (~50-70k pgvector 1536-dim rows fills it) or the 2-active-project cap on the agent's 3rd project. On Pro the first real dollar surprise is compute: every extra project or forgotten branch is its own ~$10/mo (Micro, $0.01344/hr rounded up) instance, uncapped by Spend Cap — 10 stale branches ≈ $100/mo.",
  "sweet_spots": "Free: prototypes/demos with <500 MB data and traffic most days (to dodge the 7-day pause); fine for 1-2 toy apps. Pro $25: one small-to-mid production app; $25 all-in only at 1 Micro project inside quotas — realistic bill with 2-3 always-on projects is $35-$75 before overages (each extra Micro +$10/mo). Team $599: buy for compliance/SSO/RBAC, not usage. Enterprise: scale/custom SLAs.",
  "traps": [
    "Spend Cap illusion: cap only gates metered items (egress, MAU, edge, storage, realtime); COMPUTE, DISK, BRANCHING, read replicas, and add-ons (IPv4, PITR, custom domain) bill without limit even with the cap on",
    "Per-test provisioning: every `supabase projects create` on a paid org = new instance ≥$10/mo (Nano billed at Micro rate); every branch = $0.01344/hr; compute credits cover only ONE Micro — delete/pause after tests",
    "Round-up hourly billing: a branch/project alive 5 minutes bills a full hour; branch-per-PR CI stacks up",
    "Free-tier zombie: 7-day inactivity pause silently breaks deployed-and-forgotten demos; restore is manual",
    "Disk ratchet: autoscaled disk never shrinks automatically; a bulk-load spike keeps billing $0.125/GB-mo until manually reduced",
    "Polling loops: fat SELECTs/REST polls burn unified egress (100 KB polled every 5s ≈ 2.5 GB/mo per loop vs 5 GB free); use narrow selects, counts, or Realtime",
    "Storage without CDN cache (cache-busting params, private buckets) pays $0.09/GB uncached instead of $0.03/GB cached",
    "Auth in tests: each distinct/anonymous user authenticating in a cycle is an MAU; throwaway test users chew the 50k/100k quota",
    "Edge Functions as agent runtime: every tool call = 1 invocation; 1 invoke per 5s ≈ 500k/mo = entire free quota (cheap overage though: $2/1M)",
    "Vector/chat history without retention: embeddings + agent traces fill 500 MB free / 8 GB Pro disk far faster than normal CRUD",
    "Log drains and log queries count as egress/metered usage too"
  ],
  "usage_check": "Dashboard (authoritative): https://supabase.com/dashboard/org/_/usage and .../org/_/billing (Upcoming Invoice, Spend Cap toggle). No `supabase billing`/`supabase usage` CLI exists — closest: `supabase projects list`, `supabase inspect db table-sizes|bloat`. Management API: `curl -H \"Authorization: Bearer sbp_...\" https://api.supabase.com/v1/projects` (v0 analytics endpoints like /v0/projects/{ref}/analytics/endpoints/usage.api-counts are experimental). DB size via SQL: select pg_size_pretty(pg_database_size('postgres')); Supabase emails the billing contact when within 20% of plan limits.",
  "keywords": [
    "supabase",
    "npx supabase",
    "supabase start",
    "supabase db push",
    "supabase functions deploy",
    "supabase projects create",
    "supabase branches",
    "supabase link",
    "supabase migration",
    "supabase gen types",
    ".supabase.co",
    "api.supabase.com",
    "pooler.supabase.com",
    "supabase_url",
    "supabase_anon_key",
    "supabase_service_role_key",
    "supabase_access_token",
    "next_public_supabase",
    "@supabase/supabase-js",
    "@supabase/ssr",
    "sbp_",
    "postgrest",
    "pgrst",
    "supavisor",
    "gotrue",
    "service_role",
    "storage.from(",
    "project-ref"
  ],
  "hint": "Supabase free: 2 active projects, AUTO-PAUSES after 7 idle days, 500MB DB, 5GB egress, 50k MAU, 500k edge invokes. Pro $25 covers ONE Micro ($10 credit); every extra project/branch bills ~$10/mo compute that Spend Cap does NOT block — delete test projects/branches.",
  "conflicts": [
    "File storage overage: Report A said $0.021/GB, Report B said $0.0213/GB — live fetch of https://supabase.com/pricing (2026-07-17) confirms $0.0213/GB; B wins",
    "Free 2-active-project scope: A said per organization, B said across all orgs where the user is Owner/Admin — pricing page only says 'Limit of 2 active projects' (per-org reading confirmed by the fetched page section); B's cross-org nuance matches billing docs but is unresolved from the pricing page alone",
    "Report B alone lists add-on prices (PITR ~$100/7d, custom domain $10, IPv4 ~$4, MFA $75, log drains $60, pipelines $39), image transforms (100 incl / $5 per 1k), SSO MAU (50 incl / $0.015) and 256 KB realtime message cap — image transforms and SSO MAU verified against the live pricing page; add-on prices kept from B unverified but uncontested",
    "Report A alone gives io2 disk $0.195/GB-mo, over-quota 402 behavior, and the July 2025 cached-egress split — uncontested, kept with A's official doc URLs"
  ],
  "sources": [
    "https://supabase.com/pricing (fetched live 2026-07-17 to break ties)",
    "https://supabase.com/docs/guides/platform/billing-on-supabase",
    "https://supabase.com/docs/guides/platform/manage-your-usage/compute",
    "https://supabase.com/docs/guides/platform/manage-your-usage/disk-size",
    "https://supabase.com/docs/guides/platform/manage-your-usage/branching",
    "https://supabase.com/docs/guides/platform/manage-your-usage/egress",
    "https://supabase.com/docs/guides/platform/cost-control",
    "https://supabase.com/docs/guides/platform/billing-faq",
    "https://supabase.com/docs/guides/functions/pricing",
    "https://supabase.com/docs/guides/platform/manage-your-usage/monthly-active-users",
    "https://supabase.com/blog/storage-500gb-uploads-cheaper-egress-pricing",
    "https://supabase.com/docs/reference/cli/introduction",
    "https://supabase.com/docs/reference/api/introduction"
  ]
}
```

## Engine A — Claude web research (raw)

SUPABASE PRICING/QUOTA FACTSHEET — verified against official pages, current as of 2026-07-17

=== 1. METERED BILLING DIMENSIONS ===
Billing is PER ORGANIZATION (plan + payment method attach to the org, not the project). Monthly bill = fixed plan fee + metered overages. Metered dimensions:
- Compute hours: every ACTIVE project runs a dedicated Postgres instance billed hourly, partial hours rounded UP. Nano free ($0 on Free plan; billed at Micro rate ~$10/mo on paid orgs), Micro $0.01344/hr (~$10/mo) up to 16XL $5.12/hr (~$3,730/mo). Paused projects don't bill compute. Compute is NOT covered by the Spend Cap. (https://supabase.com/docs/guides/platform/manage-your-usage/compute)
- Disk size: gp3 $0.000171/GB-hr ($0.125/GB-mo) beyond 8 GB included per project; io2 $0.195/GB-mo from first byte. (https://supabase.com/docs/guides/platform/manage-your-usage/disk-size)
- Egress ("Unified Egress Quota" shared across DB, Auth, Storage, Realtime, Functions, Supavisor): uncached $0.09/GB overage; cached (Storage CDN hits only) $0.03/GB overage — separate quotas since the July 2025 change ("3x cheaper cached egress, 2x quota", https://supabase.com/blog/storage-500gb-uploads-cheaper-egress-pricing).
- File storage: $0.021/GB-mo overage.
- Auth MAU: $0.00325/MAU overage (also separate rates for third-party MAU/SSO MAU on higher tiers).
- Edge Function invocations: $2 per 1M overage (https://supabase.com/docs/guides/functions/pricing).
- Realtime: peak concurrent connections $10 per 1,000 over quota; messages $2.50 per 1M over quota.
- Branching: each preview/persistent branch is a separate hourly-billed instance from $0.01344/hr + its own disk/egress; NOT covered by compute credits, NOT covered by Spend Cap (https://supabase.com/docs/guides/platform/manage-your-usage/branching).
- Add-ons (flat monthly per project): PITR, custom domains, IPv4, read replicas, log drains, Advanced MFA.
- Seats: none — plans are flat per org (Team $599 is not per-seat).
Sources: https://supabase.com/pricing, https://supabase.com/docs/guides/platform/billing-on-supabase, https://supabase.com/docs/guides/platform/manage-your-usage

=== 2. FREE TIER — EXACT QUOTAS ===
$0/mo, per org (source: https://supabase.com/pricing):
- Projects: 2 ACTIVE (paused ones don't count toward the limit)
- Pausing: project auto-PAUSES after 1 week (7 days) of inactivity; must be manually restored from dashboard
- Compute: shared Nano instance (~500 MB RAM), $0
- Database size: 500 MB per project
- Auth MAU: 50,000
- Egress: 5 GB uncached + 5 GB cached per month
- File storage: 1 GB (50 MB max file size)
- Edge Function invocations: 500,000/mo
- Realtime: 200 concurrent connections, 2M messages/mo
- No daily backups, no SLA, log retention 1 day
- Over-quota behavior: email notice + grace period, then requests can be rejected with 402 errors until the next billing cycle or upgrade (https://supabase.com/docs/guides/platform/cost-control)

=== 3. PAID PLANS ===
PRO — $25/mo per org (source: https://supabase.com/pricing):
- $10/mo Compute Credits (covers exactly one Micro instance; each ADDITIONAL project adds ≥$10/mo compute; credits don't roll over, don't apply to branches)
- 100,000 MAU, then $0.00325/MAU
- 8 GB disk per project, then $0.125/GB (gp3)
- 250 GB egress, then $0.09/GB; 250 GB cached egress, then $0.03/GB
- 100 GB file storage, then $0.021/GB
- 2M Edge Function invocations, then $2/1M
- 500 realtime peak connections, then $10/1,000; 5M realtime messages, then $2.50/1M
- Daily backups 7 days, log retention 7 days, no project pausing
- Spend Cap: ON by default on Pro — blocks metered overages (grace period then restrictions) but does NOT cap compute hours, disk, or branching (https://supabase.com/docs/guides/platform/cost-control, https://supabase.com/docs/guides/platform/billing-faq)
TEAM — $599/mo: same usage quotas/overage rates as Pro + SOC2/HIPAA-track compliance, SSO, 14-day backups, 28-day logs, priority support.
ENTERPRISE — custom.
Recent changes to note: cached-egress split + quota doubling shipped July 2025 (blog above); international tax collection rolling out May 1–Jun 30, 2026 (billing FAQ). Core prices ($0/$25/$599) unchanged.

=== 4. SWEET SPOTS & WHAT AGENT APPS BLOW FIRST ===
- Free: hobby/demo apps with <500 MB data and traffic most days (to dodge the 7-day pause). Fine for 1–2 toy apps.
- Pro ($25): one production small-to-mid app; ~$25 all-in only if you stay at 1 project on Micro and inside quotas. Realistic Pro bill with 2–3 projects: $45–$75 before overages.
- Team ($599): compliance/SSO need, not usage need.
What an agent-built app blows FIRST, in order of likelihood:
1. FREE: the 7-day PAUSE — an agent deploys, moves on, project is dead a week later (most common failure, before any quota).
2. FREE: 500 MB database size — a chatty agent logging conversations/embeddings (pgvector embeddings at 1536-dim float32 ≈ 6 KB/row + indexes) hits 500 MB around ~50–70k embedding rows.
3. FREE: 5 GB egress — a polling loop doing fat SELECTs; e.g. a 100 KB response polled every 5 s ≈ 2.5 GB/mo per poller; two such loops kill the quota. Realtime and Auth traffic count against the same unified quota.
4. FREE: 2-active-project cap — agents that provision a project per experiment hit this on project #3.
5. PRO: compute hours — each per-test/per-preview project or branch is a separate ~$10/mo (Micro) instance billed hourly with round-up; 10 forgotten branches ≈ $100/mo, uncapped by Spend Cap.
6. PRO: 250 GB egress at scale (~$9 per extra 100 GB) — usually well after compute surprises.
Edge Function invocations (500k free / 2M Pro) are rarely first — $2/1M is cheap.

=== 5. COST TRAPS FOR AI-AGENT PATTERNS ===
- Spend Cap illusion: Spend Cap only gates metered line items; COMPUTE, DISK, and BRANCHING bill without limit even with the cap on. An agent that spins up projects/branches can run up an uncapped bill on a "capped" Pro org. (https://supabase.com/docs/guides/platform/cost-control)
- Per-test provisioning: every `supabase projects create` on a paid org = new instance ≥$10/mo (Nano billed at Micro rate on paid orgs); every branch = $0.01344/hr. Compute credits cover only ONE Micro. Delete or pause after tests.
- Round-up hourly billing: a branch/project alive for 5 minutes bills a full hour; CI that creates a branch per commit adds up.
- Disk ratchet: autoscaling disk grows but does NOT shrink automatically; a bulk-load test that balloons disk to 50 GB keeps billing $0.125/GB/mo until you manually reduce/recreate.
- Polling loops through PostgREST/Realtime: all response bytes are unified egress; prefer `select=col1,col2` narrow columns, HEAD/count requests, and Realtime instead of tight polling.
- Serving files from Storage without the CDN cache (cache-busting query strings, private buckets) pays $0.09/GB instead of $0.03/GB.
- Auth in tests: every distinct user that authenticates in a billing cycle is an MAU; load tests creating thousands of throwaway users chew the 50k/100k MAU quota.
- Free-tier zombie: pause-after-7-days silently breaks "deployed and forgotten" agent demos; restore is manual.
- Logging/observability egress: log drains count toward egress too.

=== 6. CHECKING USAGE/SPEND ===
- Dashboard (authoritative): https://supabase.com/dashboard/org/_/usage (per-org usage, per-project dropdown, daily breakdown); billing at https://supabase.com/dashboard/org/_/billing
- CLI: NO dedicated billing/usage command exists. Closest: `supabase inspect db` subcommands (db stats only, e.g. `supabase inspect db cache-hit`, `supabase inspect db table-sizes`). Project list: `supabase projects list`. (https://supabase.com/docs/reference/cli/introduction)
- Management API (with personal access token, `Authorization: Bearer sbp_...`): stable v1 at https://api.supabase.com/v1/... (e.g. GET /v1/projects); experimental v0 usage endpoints: `GET https://api.supabase.com/v0/projects/{ref}/analytics/endpoints/usage.api-counts`, `usage.api-requests-count`, `functions.resource-usage` (experimental, may change). (https://supabase.com/docs/reference/api/introduction, https://api.supabase.com/api/v0)
- DB size from SQL: `select pg_size_pretty(pg_database_size('postgres'));`

=== 7. KEYWORD TRIGGERS ===
shell/code keywords indicating Supabase is in play: "supabase" (CLI), "supabase start", "supabase db push", "supabase functions deploy", "supabase projects create", "supabase branches", "npx supabase", "sbp_" (personal access token prefix), "api.supabase.com", ".supabase.co" (project URLs), "supabase.co/storage/v1", "postgrest", "pgrst", "supavisor", "pooler.supabase.com", "anon key"/"service_role", "createClient(" with @supabase/supabase-js, "@supabase/ssr", "supabase-js", "gotrue"/"supabase auth", "edge function" + deno, "SUPABASE_URL"/"SUPABASE_ANON_KEY"/"SUPABASE_SERVICE_ROLE_KEY" env vars.

SOURCES
- https://supabase.com/pricing (all plan prices/quotas/overages)
- https://supabase.com/docs/guides/platform/billing-on-supabase (org billing model, metered table)
- https://supabase.com/docs/guides/platform/manage-your-usage/compute (hourly compute rates, credits, round-up, paused projects)
- https://supabase.com/docs/guides/platform/manage-your-usage/disk-size (gp3/io2 disk rates, 8 GB included)
- https://supabase.com/docs/guides/platform/manage-your-usage/branching (branch $0.01344/hr, no credits, no spend cap)
- https://supabase.com/docs/guides/platform/manage-your-usage/egress (unified egress quota)
- https://supabase.com/docs/guides/platform/cost-control (Spend Cap scope, grace/402 behavior)
- https://supabase.com/docs/guides/platform/billing-faq (cached vs uncached egress, 2026 tax rollout)
- https://supabase.com/blog/storage-500gb-uploads-cheaper-egress-pricing (July 2025 egress pricing change)
- https://supabase.com/docs/guides/functions/pricing (edge function rates)
- https://supabase.com/docs/guides/platform/manage-your-usage/monthly-active-users (MAU counting)
- https://supabase.com/docs/reference/cli/introduction and https://supabase.com/docs/reference/api/introduction (CLI/API usage checking)

## Engine B — grok CLI (raw)

# Supabase Pricing / Quota Factsheet  
**Current as of July 2026** — numbers from official Supabase pages (not third-party blogs).

**Primary sources:**  
[supabase.com/pricing](https://supabase.com/pricing) · [Billing overview](https://supabase.com/docs/guides/platform/billing-on-supabase) · [Manage usage](https://supabase.com/docs/guides/platform/manage-your-usage) · [Cost control](https://supabase.com/docs/guides/platform/cost-control) · [Compute usage](https://supabase.com/docs/guides/platform/manage-your-usage/compute)

---

## 1. Metered billing dimensions

Billing is **organization-based**: one plan per org; usage summed across all projects in the org.

| Dimension | What bills | Unit | Notes |
|-----------|------------|------|--------|
| **Plan subscription** | Free / Pro / Team / Enterprise | $/month | Platform features + quota pool |
| **Compute** | Dedicated Postgres server per project | Hourly ($/hr → ~$/mo) | **Not** covered by Spend Cap; paused projects = $0 compute |
| **Disk size** | Provisioned DB disk | GB (over included) | Free: hard cap 500 MB; Pro+: 8 GB then $0.125/GB |
| **Disk IOPS / throughput** | Extra provisioned IOPS/throughput | per IOPS / per MB/s | GP SSD defaults included |
| **Egress (uncached)** | Data out (API, DB, Storage, etc.) | GB | Org quota |
| **Cached egress** | CDN/cached Storage | GB | Separate quota & cheaper overage |
| **File Storage size** | Objects in buckets | GB-Hrs (avg over month) | |
| **Edge Function invocations** | Each invoke (any status; OPTIONS free) | per 1M package | |
| **MAU** | Auth monthly active users | per user over quota | |
| **Third-party MAU** | External auth MAUs | same as MAU | |
| **SSO MAU** | SAML SSO users | per MAU over 50 | Pro+ only |
| **Realtime messages** | Messages/month | per million | |
| **Realtime peak connections** | Concurrent peak | per 1,000 | |
| **Branching compute** | Preview branch servers | Hours @ Micro+ | **Not** under Spend Cap; credits don’t apply |
| **Read replica compute** | Replica servers | Hours | |
| **Image transforms** | Origin images transformed | per 1,000 | |
| **Log drains** | Drain hours + events + egress | fixed + usage | |
| **Logs ingest / logs query** | Log volume ingested / scanned | GB | Newer usage items |
| **Add-ons** | PITR, custom domain, IPv4, MFA phone, pipelines | fixed or hourly | Opt-in; mostly not Spend-Cap covered |

**Not metered (unlimited on all plans):** API request count (Data API).

**Spend Cap (Pro only, on by default):** blocks overages on variable quotas (egress, MAU, edge, storage, realtime, disk size, etc.). Does **not** cover compute, branching compute, replicas, custom domains, IPv4, PITR, MFA phone, extra IOPS/throughput, log-drain hours.

---

## 2. Free tier — exact quotas

| Item | Quota | Unit / constraint |
|------|-------|-------------------|
| Price | **$0**/month | |
| Active projects | **2** | Across orgs where you’re Owner/Admin; paused don’t count |
| Pausing | **After 1 week of inactivity** | Pro+ never pause |
| API requests | Unlimited | |
| Database size | **500 MB** per project | Shared CPU · 500 MB RAM (Nano-class) |
| MAU | **50,000** | |
| Third-party MAU | **50,000** | |
| Egress | **5 GB** | |
| Cached egress | **5 GB** | |
| File storage | **1 GB** | Max upload **50 MB** |
| Edge Function invocations | **500,000** / month | |
| Realtime peak connections | **200** | |
| Realtime messages | **2 million** / month | Max message **256 KB** |
| Auth audit logs | **1 hour** | |
| Log retention (API & DB) | **1 day** | |
| Backups / PITR / branching | Not included | |
| Team members | Unlimited | Community support only |

Sources: [Pricing](https://supabase.com/pricing), [Billing overview](https://supabase.com/docs/guides/platform/billing-on-supabase).

---

## 3. Paid plans

### Pro — **$25/month** (org)

Includes **$10/month compute credits** (covers one Micro ≈ $10). Extra projects each add full compute. Example: 2× Micro → **$25 + $10 + $10 − $10 credits = $35/mo**.

| Item | Included | Overage |
|------|----------|---------|
| MAU | **100,000** | **$0.00325** per MAU |
| Disk | **8 GB** / project | **$0.125** / GB |
| Egress | **250 GB** | **$0.09** / GB |
| Cached egress | **250 GB** | **$0.03** / GB |
| File storage | **100 GB** | **$0.0213** / GB (~$0.00002919/GB-Hr) |
| Edge invocations | **2 million** | **$2** per 1 million (package rounding) |
| Realtime messages | **5 million** | **$2.50** per million |
| Realtime peak connections | **500** | **$10** per 1,000 |
| SSO MAU | **50** | **$0.015** per MAU |
| Image transforms | **100** origin images | **$5** per 1,000 |
| Max file upload | **500 GB** | |
| Backups | Daily, **7 days** | |
| Log retention | **7 days** | |
| Auth audit logs | **7 days** | |
| Pausing | **Never** | |
| Support | Email | |
| Spend Cap | **On by default** | Toggle on billing page |

**Compute (per project, hourly; ~730 hrs/mo):**

| Size | ~$/mo | Hourly |
|------|-------|--------|
| Micro | ~$10 | $0.01344 |
| Small | ~$15 | $0.0206 |
| Medium | ~$60 | $0.0822 |
| Large | ~$110–111 | $0.1517 |
| XL → 16XL | $210 → $3,730 | see pricing |

Sources: [Pricing](https://supabase.com/pricing), [Compute usage](https://supabase.com/docs/guides/platform/manage-your-usage/compute).

### Team — **$599/month**

Same usage quotas/overages as Pro for the table above, plus: SOC2 & ISO 27001, project-scoped/read-only roles, HIPAA add-on, SSO for dashboard, priority email + SLAs, **14-day** backups, **28-day** logs, AWS PrivateLink, platform audit logs.

### Enterprise — custom

Custom quotas, SLAs, BYO cloud, 24×7 support, private Slack, etc.

### Common add-ons (all paid where available)

| Add-on | Price |
|--------|-------|
| PITR | **~$100/mo** per 7 days retention ($0.137/hr); 14d ~$200; 28d ~$400 |
| Custom domain | **$10**/domain/month/project |
| Branching | No fixed fee; Micro branch **$0.01344/hr** + all usage |
| Advanced MFA (phone) | **$75**/mo first project, then **$10**/mo each |
| Log drains | **$60**/drain/mo + **$0.20**/M events + **$0.09**/GB egress |
| IPv4 | **$0.0055/hr (~$4/mo)** per address |
| Pipelines | **$39**/pipeline/mo + **$3**/GB replicated + **$0.60**/GB backfill |
| Disk IOPS (GP) | 3,000 included, then **$0.024**/IOPS |
| Disk throughput (GP) | 125 MB/s included, then **$0.095**/MB/s |

---

## 4. Sweet spots & what agent apps blow first

| Plan | Fits | Poor fit |
|------|------|----------|
| **Free** | Prototypes, demos, weekend side projects, 1–2 envs that can tolerate pause | Anything production, always-on agents, CI that needs DB up after idle week |
| **Pro $25** (+ ~$0–15 compute after credits) | Small production apps, indie SaaS, agent backends with real users | Multi-env org with many always-on projects; heavy branching CI; compliance |
| **Team $599** | Startups needing SOC2/ISO, RBAC, HIPAA path | Cost-sensitive early agents |
| **Enterprise** | Scale, custom SLAs, private cloud | — |

### What a **typical agent-built app** hits first

Pattern: small web app + chatty DB + auto-deploys + sandboxed edge/code paths.

| Failure mode | Usually first? | Rough threshold |
|--------------|----------------|-----------------|
| **Free: inactivity pause** | **#1 for hobby agents** | **1 week** no activity → project sleeps (dev breaks on Monday) |
| **Free: 2-project limit** | **#1 for multi-env agents** | Agent creates staging + prod + “test-…” → third active project blocked |
| **Free: DB 500 MB** | **#1 for chatty / vector / log-heavy agents** | Embeddings, conversation history, agent traces fill **~hundreds of MB in days–weeks** |
| **Free: 5 GB egress** | **#1 for polling / large responses** | Agent polls REST every few seconds or dumps big rows: **~5 GB ≈ 50–200k medium JSON responses** (order-of-magnitude; payload-dependent) |
| **Free: 500k edge invocations** | **#1 for “everything in Edge Functions” agents** | Cron every 1 min ≈ **43k/mo**; every 5s ≈ **~500k/mo** — hits free cap |
| **Pro: compute × N projects** | **#1 real $ surprise** | 2nd always-on Micro = **+$10/mo**; 3 Smalls ≈ **$25 + $15×3 − $10 = $60** |
| **Pro: branching compute** | **#1 CI/agent trap** | Preview branch Micro **~$0.01344/hr ≈ $10/mo** if left up; **not** under Spend Cap or compute credits |
| **Pro: disk 8 GB** | Chatty agent memory / RAG | Overage **$0.125/GB** (cheap vs compute; often second-order) |
| **Pro: 250 GB egress** | Bulk export, embedding sync, storage CDN miss | Overage **$0.09/GB** |
| **Pro: 2M edge invokes** | Tool-call fanout | Overage **$2/M** (cheap; rarely the bill) |
| **MAU 50k free / 100k Pro** | Usually **last** for agent demos | Unless anonymous sign-ins per session explode MAU |

**Agent ranking (most common blow-ups first):**  
1) Free pause / project cap → 2) DB size → 3) egress or edge invokes (tie, pattern-dependent) → 4) on Pro, **extra project + branching compute** → 5) storage/MAU much later.

---

## 5. Cost traps specific to AI-agent usage

1. **Polling loops** — agent `select *` / REST poll every N seconds → burns **egress** (and edge invokes if functions mediate). Free 5 GB is thin.  
2. **Forgotten resources** — agent `supabase projects create` / branching per PR and never deletes → **compute hours** stack ($10+/project/mo on Pro; free hits 2-project wall). Branching **not** Spend-Cap protected.  
3. **Per-test provisioning** — ephemeral project or branch per CI run left running overnight = full hourly compute.  
4. **Large egress** — dumping conversation blobs, embeddings, or full table scans to the agent host; Storage downloads without CDN cache (uncached **$0.09/GB** vs cached **$0.03**).  
5. **Edge as the agent runtime** — every tool call = 1 invocation; tight loops hit free **500k** / Pro **2M**. OPTIONS free; failed invokes still count.  
6. **Spend Cap false safety** — caps egress/MAU/edge but **not** compute, branching, IPv4, PITR — agents that “only create projects” still run a bill.  
7. **Nano → Micro after Free upgrade** — paid orgs bill Nano as Micro; multiple upgraded free projects = multiple compute lines.  
8. **Log noise** — agents that spam Studio/CLI log queries or high ingest can hit **logs query/ingest** meters.  
9. **Anonymous auth per agent session** — each unique anon user can inflate **MAU** if not reused carefully.  
10. **Vector / chat history without retention** — DB **500 MB free / 8 GB Pro included** fills with embeddings faster than “normal” CRUD apps.

---

## 6. How to check current usage / spend

| Method | How |
|--------|-----|
| **Usage dashboard (primary)** | `https://supabase.com/dashboard/org/_/usage` — all projects, filter by project/time |
| **Billing / invoice estimate** | `https://supabase.com/dashboard/org/_/billing` — Upcoming Invoice + Spend Cap / Cost Control |
| **Project pause / availability** | Project → Settings → General → Project availability |
| **CLI (disk bloat, not $)** | `npx supabase inspect db bloat --linked` — dead tuples vs reported disk |
| **CLI project delete** | `supabase projects delete <project-ref>` — stops future compute |
| **Management API** | `https://api.supabase.com/v1/...` with `Authorization: Bearer <access-token>` (tokens: Account → Access Tokens). Project lifecycle/addons documented; **no single first-class “get my $ invoice” CLI** — use dashboard billing/usage |
| **Email** | Within **20%** of plan limits Supabase emails billing contact |

There is **no** widely documented `supabase billing` / `supabase usage` CLI that prints dollar spend; usage is dashboard-first.

---

## 7. Keyword triggers (shell / repo signals)

Short lowercase tokens that usually mean Supabase is in play:

```
supabase
supabase.co
supabase.com
npx supabase
supabase db
supabase link
supabase start
supabase stop
supabase functions
supabase gen types
supabase migration
supabase branches
supabase projects
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ACCESS_TOKEN
NEXT_PUBLIC_SUPABASE
@supabase/supabase-js
@supabase/ssr
createClient
postgrest
realtime.supabase
storage.from(
.auth.getSession
.auth.signIn
project-ref
sbp_
eyJ  # JWT-shaped anon/service keys (weak alone)
```

Also common in agent scripts: `api.supabase.com/v1/projects`, `supabase functions deploy`, `supabase db push`.

---

## Quick reference: Free vs Pro numbers agents care about

| | Free | Pro $25 |
|--|------|---------|
| Projects | 2 active | Unlimited (each pays compute) |
| Pause | 1 week idle | Never |
| DB | 500 MB | 8 GB then $0.125/GB |
| Egress | 5 GB | 250 GB then $0.09/GB |
| Storage | 1 GB | 100 GB then $0.0213/GB |
| Edge | 500k | 2M then $2/M |
| MAU | 50k | 100k then $0.00325 |
| Compute | Free Nano-class | $10 credit → 1× Micro; then hourly |

---

**Verify live before quoting in a contract or agent budget tool:** [https://supabase.com/pricing](https://supabase.com/pricing) — Supabase still notes pricing is in Beta and may change.
