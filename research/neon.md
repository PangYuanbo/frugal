# Research archive: neon

Raw dual-engine research output (2026-07-17). Engine A = Claude subagent with web search; Engine B = grok CLI (`grok -p`, web search enabled). The merged factsheet cross-checks both, preferring official pricing pages on conflicts.

## Merged factsheet (cross-checked)

```json
{
  "provider": "Neon (serverless Postgres, neon.com — formerly neon.tech; Databricks-owned)",
  "billing_dimensions": [
    "compute: CU-hours (1 CU ~= 1 vCPU/4 GB RAM; billed only while running, scale-to-zero = $0; every branch compute and each read replica counts)",
    "storage (root branches): GB-month, metered hourly, full logical size",
    "storage (child branches): GB-month, copy-on-write — min(delta, logical size)",
    "instant restore / history (WAL retention): GB-month",
    "snapshot storage (manual + scheduled): GB-month",
    "public network egress: GB above included allowance",
    "private network transfer (Scale only): GB, bidirectional",
    "extra branches beyond plan allowance: branch-month, prorated hourly (~$0.002/branch-hour)",
    "NOT billed: queries/requests, connections, seats/members, projects within limits; invoices under $0.50 not collected"
  ],
  "free_tier": "$0, no card, permanent (not a trial). Per org: 100 projects. Per project: 100 CU-hours compute/month (resets monthly), 0.5 GB storage, 10 branches (hard cap), autoscaling max 2 CU (8 GB RAM), autosuspend fixed at 5 min idle (cannot disable), instant restore 6 h (max 1 GB history), 1 manual snapshot, 1-day monitoring retention. 5 GB public egress/month. Enforcement: exceeding CU-hours or egress SUSPENDS compute until next billing month (no overage billing — dead DB); exceeding 0.5 GB storage makes writes (INSERT/UPDATE/DELETE) fail while reads keep working; data is never deleted. Auth: up to 60k MAU. Community support only.",
  "plans": [
    {
      "name": "Free",
      "price": "$0/mo",
      "included": "100 projects; per project: 100 CU-hrs/mo, 0.5 GB storage, 10 branches, 2 CU max, 5-min forced autosuspend, 6 h restore; 5 GB egress/mo; 60k MAU auth",
      "overage": "None — hard caps: compute/egress overrun suspends compute until next month; storage overrun fails writes"
    },
    {
      "name": "Launch",
      "price": "$0 base, pure pay-as-you-go (no monthly minimum since Dec 2025)",
      "included": "100 projects; 10 branches/project (max 5,000); autoscale to 16 CU (64 GB RAM); autosuspend default 5 min, CAN be disabled; instant restore up to 7 days; 100 manual + scheduled snapshots; 500 GB egress; 1M MAU auth; 3-day monitoring; spend limits (alerts ~80%/100%)",
      "overage": "$0.106/CU-hr compute; $0.35/GB-mo storage; $0.10/GB egress past 500 GB; $1.50/branch-mo extras; $0.20/GB-mo restore history; $0.09/GB-mo snapshots. Anchors: 0.25 CU always-on ~$19/mo, 1 CU always-on ~$77/mo compute"
    },
    {
      "name": "Scale",
      "price": "$0 base, pure pay-as-you-go (no monthly minimum)",
      "included": "1,000 projects (soft); 25 branches/project; autoscale to 16 CU, fixed computes to 56 CU (224 GB RAM); autosuspend configurable 1 min → always-on; instant restore up to 30 days; 500 GB egress; 99.95% SLA, SOC 2, HIPAA (BAA), SSO, IP Allow, Private Link at no platform fee; 14-day monitoring + metrics/logs export",
      "overage": "$0.222/CU-hr compute (2.1x Launch); $0.35/GB-mo storage; $0.10/GB egress past 500 GB; $0.01/GB private networking (bidirectional); $1.50/branch-mo extras; $0.20/GB-mo restore; $0.09/GB-mo snapshots. 1 CU always-on ~$162/mo"
    },
    {
      "name": "Agent plan (for platforms provisioning DBs for end users, e.g. Replit/v0 model)",
      "price": "Apply at neon.com/programs/agents; requires Scale org with card on file",
      "included": "Sponsored free org (Neon pays for your free-tier users, ~Free-plan limits per project, 30k projects default) + paid org at $0.106/CU-hr with Scale features; up to ~$25k-30k starting credits",
      "overage": "$0.106/CU-hr on the paid org"
    }
  ],
  "first_quota_blown": "Free plan: the 100 CU-hours/project/month compute budget. A chatty agent (polling, health checks, held-open connection pools) resets the 5-min idle timer so compute never suspends -> effectively always-on. At the 0.25 CU floor that burns 100 CU-hrs in ~400 h (~16-17 days); if autoscaling drifts to 0.5-1 CU, ~4-8 days. Then the project is hard-suspended until next month. Second: 5 GB egress (big SELECT dumps, embeddings export, pg_dump, logical replication) — also suspends compute. Third: 0.5 GB storage from chat history/vector tables — writes start failing. On paid plans the same pattern becomes a silent bill instead (~$77/mo per always-on CU on Launch).",
  "sweet_spots": "Free: prototypes, demos, per-test/per-preview DBs, side projects that truly idle (scale-to-zero makes 100 CU-hrs plenty). Launch: early production/startups, variable traffic, want always-on option — no cliff, just usage billing; official examples ~$2.31 light / ~$23 medium / ~$48 heavier per month. Scale: production needing SLA/SOC 2/HIPAA/private networking/>16 CU fixed computes or >10 branches per project — only move for the features, since compute is 2.1x Launch's rate.",
  "traps": [
    "Polling/health-check/cron loops defeat the 5-min autosuspend — any query resets the idle timer; a 1-min cron = 24/7 compute. #1 trap: Free dies mid-month, Launch silently accrues ~$77/mo per always-on CU",
    "Held-open connection pools / idle clients block scale-to-zero even without queries — use short pool timeouts and Neon's pooled endpoint",
    "Disabling scale-to-zero 'to fix cold starts' during debugging and leaving it off (Launch/Scale)",
    "Per-PR/per-test branch sprawl: branch #11+ (Launch) / #26+ (Scale) bills $1.50/branch-month each, plus each awake branch compute burns CU-hours and child storage grows — set branch TTL, delete after CI",
    "Forgotten projects keep billing $0.35/GB-month storage forever at zero compute",
    "Outbound logical replication: publisher compute never scales to zero while subscribers are connected, and replication traffic counts as egress",
    "Egress from chatty reads: SELECT *, full-table exports to agent context, vector scans returning whole documents, frequent pg_dump — Free suspends at 5 GB; paid $0.10/GB past 500 GB (prefer in-platform snapshots, which are not egress)",
    "Autoscaling spikes: parallel agent queries scale compute toward the 2/16 CU cap and CU-hours bill at the scaled size, not the floor",
    "Long instant-restore windows (7/30 days) on write-heavy/churny agent DBs bill $0.20/GB-month on WAL volume",
    "Read replicas are full extra computes billing their own CU-hours",
    "Mitigation: set org spend limits (Launch/Scale, alerts at ~80%/100%), cap autoscaling max CU, keep autosuspend at 5 min (1 min on Scale) for agent workloads"
  ],
  "usage_check": "Dashboard: https://console.neon.tech -> Organization -> Billing (charges to date; note network transfer only surfaces there after exceeding the included allowance) and Org -> Projects page for per-project Compute/Storage/History/Network metrics (~1 h lag). API (paid plans): GET https://console.neon.tech/api/v2/consumption_history/v2/projects?from=<RFC3339>&to=<RFC3339>&granularity=hourly|daily|monthly&org_id=<org>&metrics=compute_unit_seconds,root_branch_bytes_month,child_branch_bytes_month,instant_restore_bytes_month,snapshot_storage_bytes_month,public_network_transfer_bytes,extra_branches_month with Authorization: Bearer $NEON_API_KEY (per-branch variant: .../v2/branches, requires project_ids; poll >= ~15 min, does not wake compute). CLI (neon / alias neonctl): NO usage/billing command — use `neon projects list` / `neon branches list` to find forgotten resources, console or API for spend.",
  "keywords": [
    "neonctl",
    "neon projects",
    "neon branches",
    "neon connection-string",
    "neon auth",
    "npx neonctl",
    "neon.tech",
    "console.neon.tech",
    "@neondatabase",
    "neondatabase",
    "neon_api_key",
    "neon_project_id",
    "ep-",
    "-pooler.",
    "aws.neon.tech",
    "claimable postgres"
  ],
  "hint": "Neon free/project: 100 CU-hr/mo, 0.5GB storage, 5GB egress; compute/egress overrun SUSPENDS DB till next month. Polling defeats 5-min autosuspend: 0.25CU always-on kills quota in ~17d. Paid: $0.106/CU-hr, $0.35/GB-mo, $0 base; set spend limit.",
  "conflicts": [
    "Scheduled snapshots on Launch: Report A implied scheduled snapshots ($0.09/GB-mo) were Scale-only (listed 100 manual snapshots for Launch); Report B said Launch gets manual + scheduled. Official neon.com/pricing (fetched 2026-07-17) confirms scheduled snapshots on BOTH Launch and Scale at $0.09/GB-month — B wins.",
    "1 CU always-on Launch compute cost: A says ~$78/mo, B says ~$77/mo — pure rounding of 730 h x $0.106 = $77.38; used ~$77.",
    "Report A's '0.25 CU floor = ~186 CU-hours/month' is a small arithmetic slip (730 x 0.25 = 182.5); both reports agree on the load-bearing figure of ~400 h / ~16-17 days to exhaust the Free 100 CU-hrs, so A's 186 was dropped.",
    "All headline numbers (rates, quotas, caps, no-minimum) matched between both reports and were re-verified live against https://neon.com/pricing."
  ],
  "sources": [
    "https://neon.com/pricing (re-verified via WebFetch 2026-07-17)",
    "https://neon.com/docs/introduction/plans",
    "https://neon.com/faqs/free-plan-limits-and-quotas",
    "https://neon.com/docs/introduction/cost-optimization",
    "https://neon.com/docs/introduction/monitor-usage",
    "https://neon.com/docs/guides/consumption-metrics",
    "https://neon.com/docs/introduction/usage-calculations",
    "https://neon.com/docs/introduction/spending-limit",
    "https://neon.com/docs/changelog/2025-12-12 ($5 minimum removed; Launch cut to $0.106/CU-hr)",
    "https://neon.com/blog/new-usage-based-pricing",
    "https://neon.com/docs/introduction/agent-plan and https://neon.com/programs/agents",
    "https://neon.com/docs/cli and https://neon.com/docs/reference/neon-cli"
  ]
}
```

## Engine A — Claude web research (raw)

# Neon Pricing & Quota Factsheet — verified July 17, 2026

Verified against neon.com/pricing and neon.com/docs (neon.tech now 308-redirects to neon.com). **Major recent changes:** Aug 2025 moved Neon to fully usage-based plans (old $19 Launch / $69 Scale bundles are gone); Dec 12, 2025 removed the $5/month minimum and cut Launch compute from $0.14 to $0.106/CU-hour; storage was cut 80% ($1.75 → $0.35/GB-month) post-Databricks acquisition. Many third-party guides still show the old numbers — trust only neon.com.

## 1. Metered billing dimensions
(Sources: https://neon.com/pricing, https://neon.com/docs/introduction/plans)
- **Compute time**: CU-hours. 1 CU ≈ 1 vCPU + 4 GB RAM; billed only while compute is running (scale-to-zero = $0 compute).
- **Storage**: $/GB-month, metered hourly. Root branches billed on full logical data size; child branches are copy-on-write (only delta billed).
- **Public egress (network transfer)**: GB, above included allowance.
- **Private networking transfer**: $/GB bidirectional (Scale only).
- **Extra branches**: beyond the included per-project count, per branch-month (prorated hourly ≈ $0.002/hr).
- **Instant restore (WAL/history retention)**: $/GB-month.
- **Snapshot storage**: $/GB-month.
- NOT billed: requests/queries, connections, seats, projects (within limits). Invoices under $0.50 are not collected.

## 2. Free plan — exact quotas
(Sources: https://neon.com/docs/introduction/plans, https://neon.com/faqs/free-plan-limits-and-quotas)
- **$0, no credit card.** 100 projects; 10 branches/project.
- **Compute: 100 CU-hours per project per month** (doubled from 50 in Oct 2025). = ~400 hrs/month at the 0.25 CU minimum size — effectively 24/7 for one tiny DB only because autosuspend exists.
- **Autoscaling cap: 2 CU (8 GB RAM).**
- **Storage: 0.5 GB per project.** Exceeding it makes writes (INSERT/UPDATE/DELETE) fail; reads keep working.
- **Egress: 5 GB public network transfer / month.** Exceeding it (or CU-hours) **suspends compute until next billing month** — no overage billing on Free, just a dead database.
- **Autosuspend (scale-to-zero): fixed at 5 minutes idle, cannot be disabled.**
- **History/restore window: 6 hours (max 1 GB-month).** 1 manual snapshot. Community support only.

## 3. Paid plans (pure pay-as-you-go, $0 base, no minimums since Dec 2025)
(Sources: https://neon.com/pricing, https://neon.com/docs/introduction/plans, https://neon.com/blog/new-usage-based-pricing, https://neon.com/docs/changelog/2025-12-12)

**Launch** — $0/month base:
- Compute **$0.106/CU-hour**; autoscaling up to 16 CU (64 GB RAM)
- Storage **$0.35/GB-month**
- Egress: **500 GB included, then $0.10/GB**
- 100 projects; 10 branches/project included, extras **$1.50/branch-month**
- Autosuspend default 5 min, **can be disabled** (always-on allowed)
- Instant restore up to 7 days @ **$0.20/GB-month**; 100 manual snapshots
- Typical real-world bills: side project with scale-to-zero $1–5/mo; 0.25 CU always-on ≈ $19/mo compute; 1 CU always-on ≈ $78/mo.

**Scale** — $0/month base:
- Compute **$0.222/CU-hour**; autoscaling up to 16 CU, fixed computes up to 56 CU (224 GB RAM)
- Storage **$0.35/GB-month**; Egress **500 GB included, then $0.10/GB**
- Private Link networking **$0.01/GB** bidirectional
- 1,000 projects (soft); 25 branches/project, extras $1.50/branch-month
- Autosuspend configurable **1 minute → always-on**
- Instant restore up to 30 days @ $0.20/GB-month; scheduled snapshots @ **$0.09/GB-month**
- Includes 99.95% SLA, SOC 2, HIPAA available, SSO/Private Link at no platform fee.

**Agent plan** (for platforms provisioning DBs for end users — Replit/v0 model): sponsored free org (Neon pays for your free-tier users, ~Free-plan limits per project, 30k projects default) + paid org at **$0.106/CU-hour with Scale features** and up to $25k–30k starting credits; apply at https://neon.com/programs/agents (must be on Scale with card on file first). (Source: https://neon.com/docs/introduction/agent-plan)

## 4. Sweet spots & what an agent app blows first
- **Free**: demos, per-test/per-preview databases, one small app. **First quota blown by a chatty agent app: the 100 CU-hours/project/month compute budget.** Constant polling/queries keep the 5-min autosuspend from ever firing → compute runs 24/7. At the 0.25 CU floor that's ~186 CU-hours/month — you exhaust 100 CU-hours in **~16 days**; if autoscaling drifts to 0.5–1 CU, in **4–8 days**. Then the project is hard-suspended until next month. Second blown: **0.5 GB storage** if the agent logs chat history/embeddings into Postgres (writes start failing). 5 GB egress is third — SELECT-heavy loops and ORMs fetching full rows count against it.
- **Launch**: startups/small production. No cliff — the same chatty pattern becomes a **bill**: always-on 0.25 CU ≈ $19/mo, 1 CU ≈ $78/mo. Fits up to ~$700/mo spend or when you need >16 CU/SLA/HIPAA → Scale.
- **Scale**: production with compliance/SLA/big computes needs; note compute is 2.1× Launch's rate, so only move when you need the features.

## 5. Cost traps for AI-agent usage patterns
- **Polling/health-check loops defeat autosuspend.** Any query resets the 5-min idle timer; a 1-min cron keeps compute alive 24/7. This is the #1 trap: Free dies mid-month, paid silently accrues ~$78/mo per always-on CU.
- **Disabled scale-to-zero left on** (Launch/Scale) after "fixing cold starts" during a debug session.
- **Forgotten branches**: agents that create a branch per test/preview — branch #11+ (Launch) bills $1.50/branch-month each, and non-CoW root-like data growth bills storage. Delete branches after CI runs.
- **Forgotten projects**: paid-plan projects with data keep billing $0.35/GB-month storage forever even at zero compute.
- **History retention**: cranking instant-restore to 7/30 days on a write-heavy agent DB bills $0.20/GB-month on WAL volume — churn-heavy workloads (agents rewriting state constantly) generate lots of history.
- **Egress from chatty reads**: `SELECT *`, ORMs returning rows after UPDATE/DELETE, vector similarity scans returning full documents. Free = suspension at 5 GB; paid = $0.10/GB past 500 GB.
- **Autoscaling spikes**: an agent hammering with parallel queries scales compute toward the 2/16 CU cap; CU-hours burn at the scaled size, not the floor.
- **Mitigation**: paid plans support configurable **spend limits**; set one. Keep autosuspend at 5 min (or 1 min on Scale) for agent workloads.

## 6. Checking usage/spend
(Source: https://neon.com/docs/introduction/monitor-usage, https://neon.com/docs/guides/consumption-metrics, https://neon.com/docs/reference/neon-cli)
- **Dashboard**: https://console.neon.tech → Organization → **Billing** (charges, plan, network transfer); Org → Projects page for cross-project metrics; per-project Dashboard (~1 hr delay). Tracks Compute, Storage, History, Network transfer.
- **API** (paid plans): `GET https://console.neon.tech/api/v2/consumption_history/v2/projects?from=<RFC3339>&to=<RFC3339>&granularity=hourly|daily|monthly&org_id=<org>&metrics=compute_unit_seconds,root_branch_bytes_month,public_network_transfer_bytes,...` with `Authorization: Bearer $NEON_API_KEY`. Per-branch variant: `/api/v2/consumption_history/v2/branches` (requires `project_ids`).
- **CLI**: no dedicated usage command. `neon` (alias `neonctl`, `npm i -g neon`) offers `neon projects list`, `neon branches list`, `neon orgs list`, `neon me` — use these to find forgotten projects/branches; use the consumption API or console for spend.

## 7. Keyword triggers
`neonctl`, `neon projects`, `neon branches`, `npx neonctl`, `neon.tech` / `neon.com` (connection hosts like `*.aws.neon.tech`, `ep-...-pooler`), `@neondatabase/serverless`, `neondatabase`, `console.neon.tech`, `NEON_API_KEY`, `DATABASE_URL` containing `neon.tech`, `pg` connection strings with `-pooler.` hosts, `neon auth`, `neon connection-string`.

## Source URLs
- https://neon.com/pricing — plan rates, included egress, branch/restore/snapshot pricing
- https://neon.com/docs/introduction/plans — exact per-plan quota table
- https://neon.com/faqs/free-plan-limits-and-quotas — Free plan enforcement behavior (suspension vs write-fail)
- https://neon.com/blog/new-usage-based-pricing — usage-based model explanation, no-minimum
- https://neon.com/docs/changelog/2025-12-12 — removal of $5 minimum, Launch price cut to $0.106
- https://neon.com/docs/introduction/monitor-usage — usage monitoring surfaces
- https://neon.com/docs/guides/consumption-metrics — consumption API endpoints/metrics
- https://neon.com/docs/reference/neon-cli — CLI commands
- https://neon.com/docs/introduction/agent-plan and https://neon.com/programs/agents — Agent plan
- https://neon.com/blog/how-to-make-the-most-of-neons-free-plan — egress/ORM gotchas

## Engine B — grok CLI (raw)

# Neon pricing / quota factsheet  
**As of July 2026** · Verified against official Neon pages (not third-party blogs)

**Primary sources:** [neon.com/pricing](https://neon.com/pricing) · [Plans docs](https://neon.com/docs/introduction/plans) · [Cost optimization](https://neon.com/docs/introduction/cost-optimization) · [Monitor usage](https://neon.com/docs/introduction/monitor-usage) · [Consumption metrics API](https://neon.com/docs/guides/consumption-metrics)

---

## 1. Metered billing dimensions

Neon bills **usage**, not seats. Plans apply **per organization**. Invoices under **$0.50** are not collected.

| Dimension | Unit | What it measures | Free | Paid (Launch / Scale) |
|---|---|---|---|---|
| **Compute** | **CU-hour** = size × hours running | Active Postgres compute only; **suspended = $0** | Cap: 100 CU-hrs/project/mo | $0.106 / $0.222 per CU-hour |
| **Storage (root)** | **GB-month** (metered hourly) | Full logical data size of root branches | Cap: 0.5 GB/project | $0.35/GB-month |
| **Storage (child)** | **GB-month** | min(delta since branch create, logical size); starts ~$0 | Counts toward 0.5 GB | $0.35/GB-month |
| **Instant restore / History** | **GB-month** of WAL change history | Root branches only; PITR window length drives volume | Free: 6h, ≤1 GB history | $0.20/GB-month |
| **Snapshots** | **GB-month** | Manual + scheduled snapshot storage | 1 manual max | $0.09/GB-month (+ count limits) |
| **Public network transfer (egress)** | **GB**/month | Data **out** over public internet (incl. logical replication, dumps) | 5 GB included (hard cap) | 500 GB included, then **$0.10/GB** |
| **Private network transfer** | **GB** (bidirectional) | PrivateLink-style traffic | — | Scale only: **$0.01/GB** |
| **Extra branches** | **branch-month** (~$0.002/branch-hour) | Concurrent child branches **above** included count | No overage (hard 10) | **$1.50**/branch-month |
| **Auth (MAU)** | Monthly active users | Managed Better Auth | Up to 60k | Up to 1M (higher on request) |
| **Seats / requests** | — | **Not billed** | Unlimited members | Unlimited members |

**CU definition:** ~**4 GB RAM + associated CPU + local SSD** per CU. Sizes: 0.25 → 56 CU (plan-capped). Formula: `0.25 CU × 4 h = 1 CU-hour`.

**Also counts as compute:** every branch’s default compute + **read replicas** (each is a separate compute).

---

## 2. Free tier — exact quotas

| Quota | Exact number | Unit / scope | On exceed |
|---|---|---|---|
| Price | **$0**/month | Permanent free (not a trial); no card required | — |
| Projects | **100** | per org | — |
| Branches | **10**/project | hard cap | Create fails |
| Compute | **100 CU-hours**/project/**month** | resets monthly | Compute **suspended** until next period or upgrade |
| Autoscaling max | **2 CU** (8 GB RAM) | — | — |
| Scale-to-zero | **After 5 min** idle | **Cannot disable** | — |
| Storage | **0.5 GB**/project | continuous | Inserts/updates/deletes that grow storage **fail** |
| Public egress | **5 GB**/month | resets monthly | Compute **suspended** until next period or upgrade |
| Instant restore | **6 hours**, ≤ **1 GB** change history | free | — |
| Manual snapshots | **1** | per project | — |
| Auth | Up to **60k MAU** | — | — |
| Monitoring retention | **1 day** | — | — |
| Support | Community | — | — |

**Hitting any of** 100 CU-hrs / 0.5 GB storage / 5 GB egress on Free **suspends compute** (storage overage blocks growth ops; data is not deleted).

**CU-hour intuition (Free 100 CU-hrs):**
- 0.25 CU always awake ≈ **400 h** (~16.7 days) then hard stop  
- 0.5 CU always awake ≈ **200 h** (~8.3 days)  
- 1 CU always awake ≈ **100 h** (~4.2 days)  
- With real scale-to-zero (true idle), 100 CU-hrs covers most side projects.

---

## 3. Paid plans

**Model:** **no monthly platform fee** — pure pay-as-you-go on Launch and Scale.

### Free — $0/mo
See §2. Hard caps; not usage-overage.

### Launch — pay as you go (no minimum)

| Item | Included / rate |
|---|---|
| **Monthly price** | **$0 base** + usage |
| Members | Unlimited |
| Projects | **100** |
| Branches included | **10**/project (max 5,000) |
| Extra branches | **$1.50**/branch-month (~**$0.002**/branch-hour) |
| Compute | **$0.106 / CU-hour** (no included free pool on paid) |
| Autoscaling | Up to **16 CU** (64 GB RAM) |
| Scale-to-zero | Default **5 min**; **can disable** (always-on) |
| Storage | **$0.35 / GB-month** |
| Instant restore | Up to **7 days** history @ **$0.20 / GB-month** |
| Snapshots | 100 manual + scheduled; storage **$0.09 / GB-month** |
| Public egress | **500 GB** included, then **$0.10/GB** |
| Auth | Up to **1M MAU** |
| Monitoring | **3 days** |
| Spending limits | Yes (alerts ~80% / 100%) |
| Support | Billing support |
| Compliance extras | Protected branches |

### Scale — pay as you go (no minimum)

| Item | Included / rate |
|---|---|
| **Monthly price** | **$0 base** + usage |
| Members | Unlimited |
| Projects | **1,000** (raise on request) |
| Branches included | **25**/project (max 5,000) |
| Extra branches | **$1.50**/branch-month |
| Compute | **$0.222 / CU-hour** (higher rate; compliance/SLA baked in) |
| Autoscaling | Up to **16 CU** autoscale; **fixed** sizes up to **56 CU** (224 GB RAM) |
| Scale-to-zero | **1 min → always-on** (fully configurable) |
| Storage | **$0.35 / GB-month** (same as Launch) |
| Instant restore | Up to **30 days** @ **$0.20 / GB-month** |
| Snapshots | Same as Launch @ **$0.09 / GB-month** |
| Public egress | **500 GB** included, then **$0.10/GB** |
| Private networking | Available; transfer **$0.01/GB** bidirectional |
| Auth | Up to **1M MAU** |
| Monitoring | **14 days** + metrics/logs export |
| Security | IP Allow, Private Networking, SOC 2 / HIPAA (BAA), uptime SLA |
| Support | Standard; Business/Production available |

**Official Launch cost examples** (compute + storage + child + history only): ~**$2.31** light · ~**$23.47** medium · ~**$48** heavier — see plans docs for breakdowns.

---

## 4. Sweet spots & what a chatty agent app blows first

| Plan | Fits | Poor fit |
|---|---|---|
| **Free** | Prototypes, learning, intermittent side projects that truly idle | Always-on prod, chatty agents, >0.5 GB data, heavy dumps/replication |
| **Launch** | Early prod / startups, variable traffic, want always-on option, cost-sensitive | HIPAA / private net / SLA needs |
| **Scale** | Prod with compliance, larger compute, private networking, higher branch density | Cheap always-on mid-size DBs (CU rate is ~2.1× Launch) |

### Typical agent-built app pattern
Small web app + chatty agent/tool loop + auto-deploys (preview branches) + sandboxed test DBs.

| Quota | Free risk order | Rough “blow first” threshold |
|---|---|---|
| **1. Compute (CU-hours)** — **usually first** | **#1 on Free** | Agent polls / long-lived pool / no idle → never hits 5‑min autosuspend → acts like always-on. At **0.25 CU continuous**: ~**400 h** of Free quota (~**2 weeks** into the month). At **0.5–1 CU**: **~1–2 weeks** or less. |
| **2. Egress (5 GB Free)** | **#2 if** large SELECT dumps, embeddings export, logical replication, frequent `pg_dump` | Easy to hit with “export whole table to agent context” or backup scripts; Free **suspends compute** at 5 GB. Paid has **500 GB** cushion before $0.10/GB. |
| **3. Storage (0.5 GB Free)** | **#3** for chat/logs/vector tables | 0.5 GB fills fast with conversation history + vectors; paid is cheap ($0.35/GB-mo) so rarely the first paid bill driver. |
| **4. Branches** | **#4** with per-PR / per-sandbox DBs | Free hard-stops at **10**. Launch free allowance 10; each concurrent extra ≈ **$1.50/mo** (small vs compute if many long-lived branches also run compute). |
| **5. Instant restore history** | Paid surprise | High-write root + long history window → $0.20/GB-mo of WAL; not Free’s first wall. |

**Bottom line for Free agent apps:**  
**Compute hours from never autosuspending (chatty connections / polling) blow first**, not egress—*unless* the app streams big result sets or dumps. Egress is the close second on Free (only **5 GB**). Storage is the hard third if you keep history/embeddings.

**Always-on cost anchor (Launch, 1 CU, ~730 h/mo):**  
`730 × $0.106 ≈ $77/mo` compute alone (before storage/egress). Scale ≈ `730 × $0.222 ≈ $162/mo`. Min size 0.25 CU always-on Launch ≈ **~$19/mo** compute.

---

## 5. AI-agent cost traps

| Trap | Why it costs | Mitigation |
|---|---|---|
| **Polling / health checks / short-interval cron** | Keeps compute **out of scale-to-zero** → full CU-hour burn | Poll less often than suspend timeout; batch; use webhooks |
| **Connection pools held open** (serverless + pooler + idle clients) | Idle connections can **block suspend** | Short pool timeouts; Neon pooled endpoint; close idle |
| **Disable autosuspend “for latency” on Launch** | 24/7 CU-hours | Keep scale-to-zero on non-prod; only always-on true prod |
| **Per-PR / per-test branch + compute** | Each active branch has compute; extras beyond 10/25 → branch-months **+** CU **+** child storage | Branch TTL/expiration; delete after CI; don’t leave endpoints awake |
| **Per-sandbox project sprawl** | Free/Launch **100 projects**; each with its own Free CU/storage caps or paid meters | Reuse projects; Agent Plan if you’re a platform provisioning DBs at scale ([Agent plan](https://neon.com/docs/introduction/agent-plan)) |
| **Logical replication from Neon** | Publisher compute **won’t scale to zero** while subscribers connected; replication = egress | Avoid always-on external subs on free/dev |
| **Large agent context via SQL** (`SELECT *` blobs/vectors) | Burns **egress** (5 GB Free is tiny) | Paginate; project columns; store blobs outside Postgres |
| **Frequent `pg_dump` / full exports** | Counts as **public transfer** | Prefer Neon snapshots/schedules (in-platform; not egress) |
| **Forgotten preview branches (e.g. long Vercel retention)** | Child storage + possible extra branch fees + leftover compute | Branch expiration; cleanup Action |
| **Long PITR window on write-heavy root** | Instant restore GB-months @ $0.20 | Shorten history window on paid |
| **Read replicas “just in case”** | Full extra CU-hours | Scale-to-zero replicas; delete unused |
| **Assuming Free “unlimited always-on”** | 100 CU-hrs is **not** a month of continuous compute | Design for suspend or upgrade |

Neon’s own cost guide calls out **persistent connections, scheduled jobs, and outbound logical replication** as classic “won’t scale to zero” compute killers.

---

## 6. How to check current usage / spend

### Dashboard
| View | URL / path |
|---|---|
| Console home / projects usage | [https://console.neon.tech/app/](https://console.neon.tech/app/) |
| Org **Billing** (charges to date, plan) | Console → org → **Billing** ([monitor docs](https://neon.com/docs/introduction/monitor-usage)) |
| Org **Projects** (Compute, Storage, History, Network transfer) | Console → **Projects** |
| Project **Dashboard** | Project → **Dashboard** (metrics ~1 h lag; inactive projects may not update) |

Network transfer on Billing only surfaces once you **exceed included allowance**; use Projects panel or API to watch earlier.

### API (Launch / Scale / Agent / Enterprise)

```bash
# Project-level invoice-aligned metrics (poll ≥ ~15 min; does not wake compute)
curl --request GET \
  --url 'https://console.neon.tech/api/v2/consumption_history/v2/projects?from=2026-07-01T00:00:00Z&to=2026-07-17T00:00:00Z&granularity=daily&org_id=$ORG_ID&metrics=compute_unit_seconds,root_branch_bytes_month,child_branch_bytes_month,instant_restore_bytes_month,snapshot_storage_bytes_month,public_network_transfer_bytes,private_network_transfer_bytes,extra_branches_month' \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer $NEON_API_KEY'
```

- Base: `GET https://console.neon.tech/api/v2/consumption_history/v2/projects`  
- Per-branch: `GET https://console.neon.tech/api/v2/consumption_history/v2/branches`  
- Docs: [Consumption metrics](https://neon.com/docs/guides/consumption-metrics) · unit conversion: [Usage calculations](https://neon.com/docs/introduction/usage-calculations)

### CLI
- Install/run: `neon` (**`neonctl` is an alias**).  
- Auth: `neon auth` or `NEON_API_KEY` / `--api-key`.  
- Common ops: `neon projects list`, `neon connection-string`, branch create/delete.  
- **No first-class “bill total” CLI command** for usage-based plans in current docs — use **Console Billing** or **consumption API** above. ([CLI overview](https://neon.com/docs/cli))

### Controls
- Org [spending limits](https://neon.com/docs/introduction/spending-limit) (Launch/Scale): email at ~80% / 100%.  
- Cap autoscaling max CU; keep scale-to-zero on non-prod.

---

## 7. Keyword triggers (shell / config)

Short lowercase signals that Neon (or Neon-shaped Postgres hosting) is in play:

```
neon
neonctl
neon.tech
console.neon.tech
@neondatabase
neon-new
DATABASE_URL   # often *.neon.tech host
ep-            # neon endpoint hostname prefix, e.g. ep-cool-darkness-123456
-pooler.       # neon pooled host
neon_api_key
NEON_API_KEY
NEON_PROJECT_ID
neon branches
neon projects
claimable postgres
```

Hostname pattern: `*.neon.tech` / `*.aws.neon.tech` (and region variants).

---

## Quick Free vs Launch vs Scale matrix

| | Free | Launch | Scale |
|---|---|---|---|
| Base $/mo | $0 | $0 + usage | $0 + usage |
| CU-hrs | **100**/project/mo | $**0.106**/CU-hr | $**0.222**/CU-hr |
| Storage | **0.5 GB**/project | $**0.35**/GB-mo | $**0.35**/GB-mo |
| Egress | **5 GB**/mo | **500 GB** then $0.10/GB | **500 GB** then $0.10/GB |
| Branches | **10** hard | 10 incl. + $1.50 extra | 25 incl. + $1.50 extra |
| Autosuspend | **5 min forced** | 5 min, **can disable** | **1 min–always on** |
| Max CU | 2 | 16 | 16 autoscale / 56 fixed |
| Agent chatty DB | **CU-hrs first**, then 5 GB egress | Always-on compute $ dominates | Same + compliance; costlier CU |

---

**Sources (use these, not pre-2025 blog posts that still quote $19/$69 fixed Launch/Scale):**  
- https://neon.com/pricing  
- https://neon.com/docs/introduction/plans  
- https://neon.com/docs/introduction/cost-optimization  
- https://neon.com/docs/introduction/monitor-usage  
- https://neon.com/docs/guides/consumption-metrics  
- https://neon.com/docs/cli
