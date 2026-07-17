# Research archive: github

Raw dual-engine research output (2026-07-17). Engine A = Claude subagent with web search; Engine B = grok CLI (`grok -p`, web search enabled). The merged factsheet cross-checks both, preferring official pricing pages on conflicts.

## Merged factsheet (cross-checked)

```json
{
  "provider": "GitHub (Actions / Codespaces / Packages / Git LFS)",
  "billing_dimensions": [
    "Seats: $/user/month (Team, Enterprise; Pro is personal)",
    "Actions minutes: per-minute on GitHub-hosted runners for private repos, each job rounded UP to nearest whole minute; billed to repo owner; public repos free on standard runners; self-hosted free",
    "Actions larger runners: $/minute always billed, even on public repos; no included-minute pool",
    "Shared storage (Actions artifacts + Packages): GB-month, hourly accrual, $0.25/GB-month overage ($0.008/GB/day)",
    "Actions cache: $0.07/GB-month above 10 GB per repo",
    "Packages data transfer (egress): per GB downloaded, ~$0.50/GB; free via GITHUB_TOKEN inside Actions; GHCR container storage/bandwidth currently free (subject to 1-month-notice change)",
    "Codespaces compute: core-hours (wall time x cores), e.g. 2-core $0.18/hr up to 32-core $2.88/hr; storage $0.07/GB-month accrues even while stopped; prebuilds burn Actions minutes + storage",
    "Git LFS: metered storage $0.07/GiB-month + bandwidth $0.0875/GiB ($5 data packs discontinued)",
    "Copilot premium requests: separate per-request meter",
    "Default spending limit is $0 for metered products: overage is silently BLOCKED, not billed, until raised"
  ],
  "free_tier": "GitHub Free (personal & orgs): 2,000 Actions min/mo for private repos on standard hosted runners (UNLIMITED free on public repos; larger runners always paid); 500 MB shared Actions-artifact+Packages storage; 10 GB Actions cache per repo; 1 GB Packages data transfer/mo; Codespaces 120 core-hours/mo (= 60 h 2-core / 30 h 4-core / 15 h 8-core) + 15 GB-month storage — PERSONAL accounts only, orgs get zero free Codespaces; Git LFS 10 GiB storage + 10 GiB bandwidth/mo. Overage rates: Linux 2-core $0.006/min, Windows 2-core $0.010/min, macOS $0.062/min, storage $0.25/GB-mo — but blocked at default $0 budget.",
  "plans": [
    {
      "name": "GitHub Free",
      "price": "$0 (personal + orgs)",
      "included": "2,000 private Actions min/mo; 500 MB shared artifact+Packages storage; 10 GB cache/repo; 1 GB Packages transfer/mo; Codespaces 120 core-h + 15 GB-mo (personal only, orgs none); LFS 10 GiB storage + 10 GiB bandwidth",
      "overage": "Blocked at default $0 budget until raised; then Linux 2c $0.006/min, Win 2c $0.010/min, macOS $0.062/min, storage $0.25/GB-mo, Packages egress $0.50/GB, Codespaces 2c $0.18/hr, LFS $0.07/GiB-mo + $0.0875/GiB"
    },
    {
      "name": "GitHub Pro",
      "price": "$4/mo (personal only)",
      "included": "3,000 private Actions min/mo; 2 GB shared storage (official product-usage-included page; some Actions docs said 1 GB — 2 GB confirmed); 10 GB Packages transfer/mo; Codespaces 180 core-h + 20 GB-mo; LFS 10 GiB / 10 GiB",
      "overage": "Same unit rates as Free"
    },
    {
      "name": "GitHub Team",
      "price": "$4/user/mo (pricing page labels it 'first 12 months' — verify renewal)",
      "included": "3,000 private Actions min/mo; 2 GB shared storage; 10 GB Packages transfer/mo; NO free Codespaces (org-metered from $0 default budget); LFS 250 GiB / 250 GiB; larger runners available; 75 GB custom runner-image storage",
      "overage": "Same unit rates; worked official example: 5,000 extra min (3k Linux + 2k Windows) = $38"
    },
    {
      "name": "GitHub Enterprise Cloud",
      "price": "from $21/user/mo ('first 12 months' framing on pricing page)",
      "included": "50,000 Actions min/mo; 50 GB shared storage; 100 GB Packages transfer/mo; no free Codespaces; LFS 250 GiB / 250 GiB; 150 GB custom image storage",
      "overage": "Same unit rates"
    }
  ],
  "first_quota_blown": "Actions minutes (2,000/mo private on Free). An auto-deploy pipeline of 8-15 min per push at ~10-12 pushes/day burns the whole month in ~2-3 weeks (~130-250 deploys total); one agent session of 20 CI re-run iterations x 10 min = 200 min. macOS jobs at $0.062/min (~10x Linux) make it far worse. Second casualty: 500 MB shared artifact/Packages storage — a 100 MB artifact per build at default 90-day retention blows it within a week of daily builds. Then Codespaces 120 core-hours (an 8-core box running 24/7 exhausts it in 15 hours) and LFS 10 GiB bandwidth if CI pulls large LFS files each run.",
  "sweet_spots": "Free: public-repo OSS (unlimited standard-runner minutes) and light private CI (~1-2 short Linux deploys/day). Pro ($4): solo dev with private repos + moderate Codespaces (180 core-h). Team ($4/user): small teams needing larger runners and 250 GiB LFS — but still only 3,000 Actions min, and org Codespaces bill from $0 with no free quota. Enterprise ($21/user): heavy CI/monorepos needing 50k min. High-frequency agent CI on private repos outgrows Free/Pro/Team minutes fast; consider public repos or self-hosted runners (still free) before upgrading.",
  "traps": [
    "Cron/polling workflows: '*/5 * * * *' running a 1-min private job = ~8,640 min/mo = 4.3x the entire Free quota; a 5-second job bills a full 60 seconds (per-job round-up)",
    "Matrix explosions: 3 OS x 4 versions = 12x minutes, with macOS legs at $0.062/min (~10x Linux) and Windows ~1.7x",
    "Larger runners have NO free pool and bill even on public repos — 'spin a big box per PR' is pure spend",
    "Re-run loops: failed 5-min + successful 10-min run = 15 min charged; agents re-run CI constantly",
    "Forgotten Codespaces: compute stops at 30-min idle timeout but storage bills continuously ($0.07/GB-mo) until DELETED; prebuilds burn Actions minutes + storage per region",
    "Artifact hoarding: upload-artifact default 90-day retention accrues GB-hours at $0.008/GB/day; deleting doesn't refund past accrual — set retention-days: 1-7",
    "LFS in CI: every checkout with lfs:true / git lfs pull burns the OWNER's LFS bandwidth ($0.0875/GiB metered; data packs are gone); a 500 MB file pulled 20x kills the 10 GiB Free quota",
    "Private package/image pulls with a PAT (self-hosted runner, external server) bill ~$0.50/GB; the same pull with GITHUB_TOKEN inside Actions is free",
    "$0 default spending limit = silent outage: when Free quota exhausts mid-month, workflows just fail/queue until the 1st — no bill, no warning beyond 90%/100% emails",
    "Org accounts get ZERO free Codespaces core-hours — every core-hour bills (or blocks) from day one",
    "Copilot code review on private repos consumes Actions minutes + premium requests",
    "Copilot agent cloud sandboxes are a separate meter (compute-seconds/GiB-seconds), not Actions free minutes"
  ],
  "usage_check": "CLI: `gh api /users/USERNAME/settings/billing/usage` or `gh api /organizations/ORG/settings/billing/usage` (enhanced billing platform; returns usageItems with product/sku/quantity/pricePerUnit/netAmount; fine-grained PAT needs 'Plan: read' / org 'Administration: read'). Also `/…/usage/summary` (public preview), per-workflow `gh api repos/OWNER/REPO/actions/workflows/FILE.yml/timing`, cache `gh api repos/OWNER/REPO/actions/cache/usage`. Dashboard: https://github.com/settings/billing (org: /organizations/ORG/settings/billing). Legacy /settings/billing/actions endpoints are deprecated. Alert emails at 90% and 100% of included usage.",
  "keywords": [
    "gh ",
    "gh api",
    "gh workflow",
    "gh run",
    "gh codespace",
    "gh cs",
    "gh package",
    "gh release",
    "gh actions-cache",
    "actions/checkout",
    "actions/cache",
    "actions/upload-artifact",
    ".github/workflows",
    "workflow_dispatch",
    "runs-on",
    "ubuntu-latest",
    "macos-latest",
    "windows-latest",
    "self-hosted",
    "actions-runner",
    "github_token",
    "github.token",
    "github_actions",
    "ghcr.io",
    "docker push ghcr",
    "npm.pkg.github.com",
    "maven.pkg.github.com",
    "nuget.pkg.github.com",
    "docker.pkg.github.com",
    "git lfs",
    "git-lfs",
    "codespaces",
    "devcontainer",
    "devcontainer.json",
    "prebuild",
    "act ",
    "copilot"
  ],
  "hint": "GitHub Free: 2000 private Actions min/mo (public repos unlimited), 500MB artifact/pkg storage, 120 Codespaces core-h, 10GiB LFS. #1 trap: auto-deploy/cron CI eats 2k min in weeks; macOS $0.062/min ~10x Linux; $0 budget = silent block.",
  "conflicts": [
    "Pro shared storage: Report B flagged Actions docs saying 1 GB vs Packages docs saying 2 GB. Resolved via WebFetch of official https://docs.github.com/en/billing/reference/product-usage-included (2026-07-17): Pro = 2 GB shared Actions+Packages storage. Report A's 2 GB wins.",
    "Included-minute consumption: Report A claims Windows 2x / macOS 10x multipliers deplete included minutes (2,000 min = 200 macOS min); Report B says 2026 docs count minutes 1:1 wall-clock with per-OS rates only applying to paid overage. WebFetch of the current runner-pricing page (A's own multiplier URL now serves 'Actions Runner Billing' with no multiplier language) and the Actions billing page found NO multiplier statements — Report B's 1:1 framing wins for current docs, though macOS overage is still ~10x Linux by price ($0.062 vs $0.006/min).",
    "Report A's claim that 200 real macOS minutes exhausts the whole Free month depends on the disproven multiplier model — dropped from merged facts.",
    "Non-conflicts confirmed by both + officially: 2,000/3,000/50,000 min tiers, LFS 10/250 GiB, Codespaces 120/180 core-h personal-only, Team $4 & Enterprise $21 with 'first 12 months' promo framing, LFS data packs discontinued."
  ],
  "sources": [
    "https://github.com/pricing",
    "https://docs.github.com/en/billing/reference/product-usage-included",
    "https://docs.github.com/en/billing/reference/actions-runner-pricing",
    "https://docs.github.com/en/billing/managing-billing-for-your-products/about-billing-for-github-actions",
    "https://docs.github.com/en/billing/concepts/product-billing/github-codespaces",
    "https://docs.github.com/en/billing/concepts/product-billing/github-packages",
    "https://docs.github.com/billing/managing-billing-for-git-large-file-storage/about-billing-for-git-large-file-storage",
    "https://docs.github.com/en/rest/billing/usage",
    "https://github.com/pricing/calculator",
    "https://github.blog/changelog/2026-02-17-api-access-to-billing-usage-reports-in-public-preview/"
  ]
}
```

## Engine A — Claude web research (raw)

GITHUB PRICING/QUOTA FACTSHEET — verified against official GitHub docs/pricing pages, current as of 2026-07-17

=== 1. METERED BILLING DIMENSIONS ===
GitHub bills on:
- Seats: per-user/month for Team and Enterprise plans (source: https://github.com/pricing)
- Actions compute time: per-minute, rounded UP to the nearest whole minute per job, rate varies by OS/core count/architecture. Only private repos consume paid minutes on standard runners; larger runners bill always (source: https://docs.github.com/en/billing/managing-billing-for-your-products/about-billing-for-github-actions)
- Actions/Packages storage: GB-month (billed at $0.008/GB/day ≈ $0.25/GB per 31-day month); Actions cache storage $0.07/GB-month over 10 GB/repo
- Packages data transfer (egress): per GB downloaded ($0.50/GB), except downloads via GITHUB_TOKEN inside Actions workflows which are free
- Codespaces: compute per hour (proportional to cores) + storage GB-month (includes prebuild storage); prebuild GENERATION burns Actions minutes
- Git LFS: metered storage per GiB-month + download bandwidth per GiB (data packs were RECENTLY REMOVED — this is a change from the old $5/50GB model; accounts on the new billing platform are pay-as-you-go) (source: https://docs.github.com/billing/managing-billing-for-git-large-file-storage/about-billing-for-git-large-file-storage)
- Copilot premium requests: per-request metering (separate product, has its own usage endpoint)
Default spending limit/budget is $0 for metered products on personal/Free org accounts: overage is BLOCKED, not billed, until you raise it.

=== 2. FREE TIER (GitHub Free) — EXACT QUOTAS ===
- Actions: 2,000 min/month for private repos (Linux 2-core basis; Windows burns at 2x multiplier, macOS at 10x — so 2,000 min = 1,000 Windows min = 200 macOS min). UNLIMITED free minutes on standard runners for PUBLIC repos. Self-hosted runners: free.
- Actions artifact/log storage: 500 MB. Cache: 10 GB per repository free on all plans.
- Packages: 500 MB storage + 1 GB data transfer out/month (GHCR container storage/bandwidth still flagged "currently free" in docs, subject to one-month notice).
- Codespaces (personal accounts only): 120 core-hours/month (= 60 hrs on 2-core, 30 hrs on 4-core; 2-core has "included usage multiplier 2") + 15 GB-month storage.
- Git LFS: 10 GiB storage + 10 GiB bandwidth/month.
Sources: https://docs.github.com/en/billing/managing-billing-for-your-products/about-billing-for-github-actions ; https://docs.github.com/en/billing/concepts/product-billing/github-codespaces ; https://docs.github.com/en/billing/managing-billing-for-your-products/about-billing-for-github-packages ; https://docs.github.com/billing/managing-billing-for-git-large-file-storage/about-billing-for-git-large-file-storage

=== 3. PAID PLANS ===
- GitHub Pro — $4/mo (personal): 3,000 Actions min, 2 GB Packages storage + 10 GB transfer, Codespaces 180 core-hours (= 90 hrs 2-core) + 20 GB-month, LFS 10 GiB/10 GiB.
- GitHub Team — $4/user/mo: 3,000 Actions min, 2 GB Packages storage + 10 GB transfer, LFS 250 GiB storage + 250 GiB bandwidth. NO free Codespaces quota for orgs (org pays metered from $0 default budget). Custom larger-runner image storage 75 GB.
- GitHub Enterprise Cloud — $21/user/mo: 50,000 Actions min, 50 GB Packages storage + 100 GB transfer, 50 GB artifact storage, LFS 250 GiB/250 GiB, custom image storage 150 GB.
(Pricing page currently labels Team/Enterprise prices "first 12 months" — a recent promotional framing; verify renewal pricing.)
Overage unit prices (same on all plans):
- Actions standard runners: Linux 2-core $0.006/min, Linux arm64 2-core $0.005/min, Linux 1-core $0.002/min, Windows 2-core $0.010/min, macOS 3–4 core $0.062/min
- Larger runners x64/min: Linux 4c $0.012, 8c $0.022, 16c $0.042, 32c $0.082, 64c $0.162, 96c $0.252; Windows 4c $0.022, 8c $0.042, 16c $0.082, 32c $0.162, 64c $0.322; macOS 12c Large $0.077, macOS XLarge M2 Pro $0.102. arm64 larger: Linux 4c $0.008, 8c $0.014, 16c $0.026, 32c $0.050, 64c $0.098. GPU: Linux 4c $0.052, Windows 4c $0.102 (source: https://docs.github.com/en/billing/reference/actions-minute-multipliers)
- Storage (Actions artifacts + Packages): $0.008/GB/day ≈ $0.25/GB-month; Actions cache overage $0.07/GB-month
- Packages data transfer: $0.50/GB (free via GITHUB_TOKEN inside Actions)
- Codespaces: 2c $0.18/hr, 4c $0.36/hr, 8c $0.72/hr, 16c $1.44/hr, 32c $2.88/hr; storage $0.07/GB-month
- Git LFS metered: storage $0.07/GiB-month, bandwidth $0.0875/GiB (changelog: https://github.blog/changelog/2024-06-03-new-enterprise-accounts-have-metered-billing-for-git-lfs/)
Sources: https://github.com/pricing ; https://github.com/pricing/calculator ; https://docs.github.com/en/billing/managing-billing-for-your-products/about-billing-for-github-actions

=== 4. SWEET SPOTS / FIRST QUOTA BLOWN ===
- Free: solo dev, public-repo OSS (unlimited standard-runner minutes), light private CI. Fine up to ~65 Linux CI min/day private.
- Pro ($4): individual with private repos + moderate Codespaces use.
- Team ($4/user): small teams; note Codespaces becomes org-metered with $0 default budget (silently blocked until enabled).
- Enterprise: 50k min fits heavy CI/monorepos.
For a typical agent-built app (small private web app, auto-deploy on every push, tests in CI):
- FIRST quota blown: the 2,000 Actions minutes/month. An auto-deploy workflow (build+test+deploy) of ~8 min per push, triggered ~12x/day, burns ~2,880 min/month — over quota in ~3 weeks. If any job runs on macOS (10x multiplier), 200 real minutes exhausts the entire month.
- SECOND: Actions artifact storage (500 MB Free) — one 100 MB build artifact retained 90 days (default retention) across daily builds blows it in under a week of builds.
- Codespaces-as-sandbox: 120 core-hours goes in 15 days of 4-hour/day 2-core sessions; an agent leaving an 8-core codespace running 24/7 exhausts it in 15 hours and then either blocks or bills $0.72/hr (~$518/month).
- Chatty DB does not bill here (GitHub has no DB product) but LFS bandwidth (10 GiB) dies fast if the app pulls LFS-tracked model/data files in every CI run: a 500 MB LFS file cloned in CI 20x = quota gone.

=== 5. AI-AGENT COST TRAPS ===
- Cron/polling workflows: a schedule of "*/5 * * * *" running a 1-min private-repo job = ~8,640 min/month = 4.3x the entire Free quota. Minimum billing granularity is 1 minute — a 5-second job bills 60 seconds.
- Matrix explosions: an agent adding a test matrix (3 OS x 4 versions) multiplies minutes 12x, and the macOS legs bill at 10x multiplier / $0.062/min.
- Per-test provisioning: spinning a fresh Codespace or larger runner per test run; larger runners bill even on PUBLIC repos and have no free allotment.
- Forgotten Codespaces: default idle timeout stops compute after 30 min, but STORAGE bills continuously until the codespace is deleted ($0.07/GB-month, plus prebuild storage per region).
- Artifact hoarding: upload-artifact with default 90-day retention; agents that upload node_modules or docker tarballs each run stack GB-days at $0.008/GB/day. Fix: retention-days: 1-7.
- LFS accidental tracking: agent commits large binaries via LFS, then every CI checkout with lfs: true burns bandwidth at $0.0875/GiB. (Data packs are gone; it meters now.)
- Packages egress: pulling your own private package/image WITHOUT GITHUB_TOKEN (e.g., PAT from a self-hosted runner or external server) bills $0.50/GB; with GITHUB_TOKEN in Actions it is free.
- $0 spending limit is a silent outage trap: when Free quota exhausts mid-month, workflows just stop failing/queueing until the 1st.

=== 6. CHECK USAGE/SPEND ===
- Dashboard: personal https://github.com/settings/billing/summary (usage: https://github.com/settings/billing/usage); org: https://github.com/organizations/ORG/settings/billing
- API (enhanced billing platform, current): GET /organizations/{org}/settings/billing/usage and GET /users/{username}/settings/billing/usage — returns usageItems with product, sku, quantity, unitType, pricePerUnit, netAmount. Premium requests: GET /organizations/{org}/settings/billing/premium_request/usage. Enterprise: GET /enterprises/{enterprise}/settings/billing/usage. Docs: https://docs.github.com/en/rest/billing/usage and https://docs.github.com/en/rest/billing/enhanced-billing. CSV usage-report API in public preview as of Feb 2026: https://github.blog/changelog/2026-02-17-api-access-to-billing-usage-reports-in-public-preview/
- CLI (no dedicated gh billing subcommand): `gh api /users/USERNAME/settings/billing/usage` or `gh api /organizations/ORG/settings/billing/usage` (fine-grained PAT needs org "Administration: read" / user "Plan: read"). Legacy per-product endpoints (/settings/billing/actions, /shared-storage) are deprecated on the new platform.
- Workflow-level: `gh run list`, `gh run view RUN_ID` for durations; `gh api repos/OWNER/REPO/actions/cache/usage` for cache.

=== 7. KEYWORD TRIGGERS ===
"gh ", "gh workflow", "gh run", "gh actions-cache", "gh codespace", "gh cs", "actions/checkout", "actions/upload-artifact", ".github/workflows", "workflow_dispatch", "runs-on:", "ubuntu-latest", "macos-latest", "windows-latest", "ghcr.io", "docker push ghcr", "git lfs", "git-lfs", "codespaces", "devcontainer", "gh api", "GITHUB_TOKEN", "npm publish --registry=https://npm.pkg.github.com", "maven.pkg.github.com", "nuget.pkg.github.com", "act " (local Actions runner — costs nothing, signals Actions work).

RECENT CHANGES TO NOTE: (1) Git LFS $5 data packs discontinued — replaced by metered $0.07/GiB-mo storage + $0.0875/GiB bandwidth on the enhanced billing platform; (2) LFS free quotas raised to 10 GiB (Free/Pro) and 250 GiB (Team/Enterprise), up from the old 1 GiB; (3) Team $4 and Enterprise $21 currently shown as "first 12 months" pricing on github.com/pricing; (4) billing usage-report CSV API entered public preview Feb 2026. Core Actions minute quotas (2,000/3,000/50,000) and standard runner per-minute rates are unchanged.

## Engine B — grok CLI (raw)

# GitHub pricing & quotas factsheet  
**As of July 2026** · Focus: Actions · Codespaces · Packages · LFS · auto-deploy burn

Verified against official GitHub Docs and [github.com/pricing](https://github.com/pricing). Not blog posts.

---

## 1. Metered billing dimensions

| Product | What bills | Unit | Notes |
|--------|------------|------|--------|
| **GitHub Actions** | Job runtime on **GitHub-hosted** runners (private repos) | **Minutes** (rounded up per job) | Billed to **repo owner**, not the actor who triggered the run |
| | Artifact + Packages **shared storage** | **GB-month** (hourly accrual → GB-hours) | Shared pool with Packages |
| | Actions **cache** (per repo) | **GB-month** above 10 GB/repo peak | Separate from artifacts |
| | **Custom image** storage (larger runners) | **GB-month** | Team/Enterprise larger-runner images |
| | **Larger runners** | **$/minute** always | **Never** free, even on public repos; **do not** use included minutes |
| **Codespaces** | Active **compute** | **Core-hours** (wall time × core multiplier) | Free quota only on **personal** Free/Pro |
| | Disk while codespace/prebuild exists | **GB-month** | Stopped codespaces still store |
| | Prebuild **build** | **Actions minutes** | Prebuilds burn Actions + storage |
| **Packages** | Private package **storage** | **GB-month** | Public packages free; **GHCR container storage/bandwidth currently free** (subject to change with notice) |
| | Private package **data transfer (downloads)** | **GB/month** | Inbound free; Actions download with `GITHUB_TOKEN` free |
| **Git LFS** | Object **storage** | **GiB-month** (hourly accrual) | Every LFS push version counts |
| | **Bandwidth** (downloads) | **GiB/month** | Actions LFS pulls **count** against owner bandwidth |
| **Seats** | Plan subscription | **$/user/month** | Team / Enterprise; Pro is personal |

**Free / not billed (important):**

- **Public repos**: standard GitHub-hosted Actions minutes free; public Packages free.
- **Self-hosted runners**: still free per current Actions billing docs (Mar 2026 platform fee was **postponed** after backlash—do not assume it is live).
- **GitHub Pages**, **Dependabot** on standard hosted runners: free.
- Logs / job summaries: do **not** count as artifact storage.

Sources: [Actions billing](https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions), [Codespaces billing](https://docs.github.com/billing/managing-billing-for-github-codespaces/about-billing-for-github-codespaces), [Packages billing](https://docs.github.com/en/billing/concepts/product-billing/github-packages), [LFS billing](https://docs.github.com/billing/managing-billing-for-git-large-file-storage/about-billing-for-git-large-file-storage).

---

## 2. Free tier — exact quotas

### GitHub Free (personal) & Free for organizations

| Product | Quota | Unit |
|--------|-------|------|
| **Actions minutes** (private, standard hosted) | **2,000** | minutes / month |
| **Actions artifact storage** | **500 MB** | shared with Packages (see note) |
| **Actions cache** | **10 GB** | per repository |
| **Packages storage** | **500 MB** | private |
| **Packages data transfer** | **1 GB** | / month |
| **Codespaces compute** | **120** | core-hours / month (**personal only**; org Free = **none**) |
| **Codespaces storage** | **15 GB-month** | personal only |
| **LFS storage** | **10 GiB** | |
| **LFS bandwidth** | **10 GiB** | / month |

Yes: private free minutes are **2,000/month** on Free (not a rumor).

### Public repos

- Standard GitHub-hosted Actions: **unlimited free minutes**  
- Public Packages: **free**  
- Larger runners on public: **still paid**  

Sources: [product usage included](https://docs.github.com/en/billing/reference/product-usage-included), [Actions billing](https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions), [Codespaces billing](https://docs.github.com/billing/managing-billing-for-github-codespaces/about-billing-for-github-codespaces).

**Pro storage quirk:** Actions docs list Pro **artifact storage = 1 GB**; Packages / products page list Pro **Packages storage = 2 GB**. Docs also say Actions artifacts and Packages **share one pool**. Treat Pro private storage as tight either way; prefer the billing UI for the effective ceiling.

---

## 3. Paid plans — price, included quotas, overages

### Seat / plan prices ([github.com/pricing](https://github.com/pricing))

| Plan | Monthly price | Who |
|------|---------------|-----|
| **Free** | **$0** | Personal + orgs |
| **GitHub Pro** | **~$4 / month** (personal; FAQ documents reduced Pro price) | Personal only |
| **GitHub Team** | **$4 / user / month** | Orgs |
| **GitHub Enterprise Cloud** | **from $21 / user / month** | Enterprise |

Promo copy on pricing may say “first 12 months”; list prices above are the published card rates.  
Sources: [github.com/pricing](https://github.com/pricing), [FAQ plan changes](https://docs.github.com/en/get-started/learning-about-github/faq-about-changes-to-githubs-plans), [GitHub’s plans](https://docs.github.com/get-started/learning-about-github/githubs-products).

### Included metered quotas by plan

| | Free (personal) | Pro | Free org | Team | Enterprise Cloud |
|--|-----------------|-----|----------|------|------------------|
| **Actions minutes/mo** | 2,000 | 3,000 | 2,000 | 3,000 | **50,000** |
| **Actions artifact storage** | 500 MB | 1 GB | 500 MB | 2 GB | 50 GB |
| **Cache / repo** | 10 GB | 10 GB | 10 GB | 10 GB | 10 GB |
| **Custom image storage** | n/a | n/a | n/a | 75 GB | 150 GB |
| **Packages storage** | 500 MB | 2 GB | 500 MB | 2 GB | 50 GB |
| **Packages transfer/mo** | 1 GB | 10 GB | 1 GB | 10 GB | 100 GB |
| **Codespaces core-hours** | 120 | 180 | **None** | **None** | **None** |
| **Codespaces storage** | 15 GB-mo | 20 GB-mo | None | None | None |
| **LFS storage** | 10 GiB | 10 GiB | 10 GiB | **250 GiB** | **250 GiB** |
| **LFS bandwidth** | 10 GiB | 10 GiB | 10 GiB | **250 GiB** | **250 GiB** |

Source: [product usage included](https://docs.github.com/en/billing/reference/product-usage-included), [Actions free table](https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions), [LFS free table](https://docs.github.com/billing/managing-billing-for-git-large-file-storage/about-billing-for-git-large-file-storage).

Org/Enterprise **do not** get free Codespaces quota; compute is pay-as-you-go (or $0 spend limit until you raise it).

### Actions overage — per-minute by runner (after included minutes)

**Standard hosted (private overage):**

| Runner | SKU | **$/minute** |
|--------|-----|--------------|
| Linux 1-core x64 | `actions_linux_slim` | **$0.002** |
| Linux 2-core x64 | `actions_linux` | **$0.006** |
| Linux 2-core arm64 | `actions_linux_arm` | **$0.005** |
| Windows 2-core x64/arm64 | `actions_windows` / `_arm` | **$0.010** |
| macOS 3/4-core | `actions_macos` | **$0.062** |

**Larger runners (always billed; no free-minute pool):** examples  
Linux 4-core **$0.012**, 8-core **$0.022**, 16-core **$0.042**, 32-core **$0.082**, 64-core **$0.162**, 96-core **$0.252**; Windows roughly ~2× Linux at same core count; macOS 12-core **$0.077**, macOS M2 Pro 5-core **$0.102**; GPU Linux 4-core **$0.052**.

Source: [Actions runner pricing](https://docs.github.com/en/billing/reference/actions-runner-pricing).

**Included-minute model (2026 docs):** wall-clock minutes count 1:1 against the monthly minute pool for standard runners (example: 10 min Linux job = 10 min of allowance). Overage is charged at the OS rate above—not the old “1×/2×/10× multiplier” framing.

**Worked overage example (official):** Team plan, 5,000 minutes past included: 3,000 Linux × $0.006 + 2,000 Windows × $0.010 = **$38**.

### Storage overages (Actions / Packages shared)

| Meter | Overage price |
|-------|----------------|
| Shared storage (artifacts + Packages) | **$0.25 / GB-month** |
| Actions cache | **$0.07 / GB-month** |
| Custom image storage | **$0.07 / GB-month** |

Source: [Actions storage pricing](https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions).

### Packages data transfer overage

Official Packages docs: “Data transfer is billed for each GB… use the [pricing calculator](https://github.com/pricing/calculator?feature=packages).” They **do not** print a unit price on the billing page itself.  
Azure’s GitHub Enterprise listing (Microsoft) states **$0.50 / GB** additional egress outside Actions; storage **$0.25 / GB**—aligned with shared storage. Treat **$0.50/GB transfer** as the widely published overage; confirm on calculator before budgeting.

**GHCR containers:** storage + bandwidth **currently free** (GitHub will give ≥1 month notice before changing).

### Codespaces overage (pay-as-you-go rates)

| Machine | Core multiplier | **$/hour** |
|---------|-----------------|------------|
| 2-core | 2 | **$0.18** |
| 4-core | 4 | **$0.36** |
| 8-core | 8 | **$0.72** |
| 16-core | 16 | **$1.44** |
| 32-core | 32 | **$2.88** |
| Storage | — | **$0.07 / GB-month** |

Free 120 core-hours ≈ **60 hours** on 2-core, **30 hours** on 4-core, **15 hours** on 8-core.  
Source: [Codespaces billing](https://docs.github.com/billing/managing-billing-for-github-codespaces/about-billing-for-github-codespaces).

### LFS overage

Data packs removed → pure metered billing. Docs: use [pricing calculator](https://github.com/pricing/calculator?feature=lfs). Calculator states: **additional storage $0.07 / GiB**, **additional transfer out $0.0875 / GiB**. Pricing page still mentions legacy “$5 / 50 GB” language in add-ons—prefer docs + calculator for live rates.

---

## 4. Sweet spots & what agent-built apps blow first

### Plan fit

| Plan | Fits | Poor fit |
|------|------|----------|
| **Free** | Public OSS; light private CI (~1–2 deploys/day Linux, short jobs); hobby agents | Private monorepo + deploy-on-every-push; org Codespaces; many packages |
| **Pro ($4)** | Solo private app, +1k minutes, more Codespaces (180 core-h), better PR tools | Multi-dev orgs; heavy CI matrix |
| **Team ($4/user)** | Small team collab, 3k Actions min, larger runners available, 250 GiB LFS | High-frequency agent CI (still only 3k min); need 50k min |
| **Enterprise ($21+/user)** | 50k Actions min, 50 GB Packages, compliance/SSO | Solo vibe-coding (overkill) |

### Typical agent-built app (small web app, chatty DB, auto-deploys, sandboxed code runs)

**First quota you hit (rough order):**

1. **Actions minutes (private Free: 2,000)** — almost always #1  
   - Auto-deploy on every push/PR: assume **8–15 min/job** (build + test + deploy).  
   - **~130–250 deploys/month** → Free gone; **~200–375** → Pro/Team gone.  
   - Agent that opens PRs + re-runs CI on each fix: 20 agent iterations × 10 min = **200 min in one session**.  
   - Matrix (node 18/20 × linux/mac) multiplies fast; macOS overage is **~$0.062/min**.

2. **Packages storage (500 MB Free)** — if you publish private container/npm on every build and never prune.  
   - GHCR itself currently free for containers; non-container registries + Actions **artifacts** still hit shared storage.  
   - Long artifact retention (30–90 day logs/binaries) accrues **GB-hours** even after delete stops *future* accrual.

3. **Packages bandwidth (1 GB Free)** — if clients/CI pull private packages **without** `GITHUB_TOKEN` (PAT/npm token from outside Actions).

4. **Codespaces core-hours (120 Free personal)** — if the agent develops *inside* Codespaces full-time on 4–8 core:  
   - 4-core × 4 h/day × 20 days = **320 core-hours** → Free blown ~week 2.  
   - Org accounts: **$0 free** from day one.

5. **LFS bandwidth (10 GiB)** — model weights, datasets, large binaries pulled in every CI job (Actions LFS download **counts**).

6. **Larger runners / sandboxes** — no free pool; agent “spin big box for each PR” is pure spend.

**Sandboxed code runs:** GitHub **cloud sandboxes** (Copilot agent preview) are a **separate** meter (compute second / memory GiB-second / snapshot storage)—not Actions free minutes. See [sandbox billing](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/product-billing/cloud-and-local-sandboxes). Local sandboxing with Copilot seat has no extra compute charge.

---

## 5. Cost traps specific to AI-agent patterns

| Trap | Why it burns GitHub $ |
|------|------------------------|
| **Deploy-on-every-commit / agent PR spam** | Each push restarts full pipeline; Free 2k min ≈ weeks of agent thrash |
| **Re-run loops** | Failed 5 min + success 10 min = **15 min** charged; agents re-run often |
| **macOS / Windows default** | Overage ~**1.7×** (Win) to **~10×** (mac) vs Linux $0.006 |
| **Larger runners “to go faster”** | **No included minutes**; public repos still pay |
| **Forgotten Codespaces** | Storage accrues while stopped; prebuilds = Actions + storage |
| **Org Codespaces with no free tier** | Every core-hour is billable immediately |
| **Artifact hoarding** | Hourly GB accrual; delete does **not** refund past GB-hours this cycle |
| **LFS in CI** | Every workflow `git lfs pull` burns **owner** LFS bandwidth |
| **Private package pull with PAT** | Counts as paid transfer; `GITHUB_TOKEN` in Actions does not |
| **Copilot code review on private** | Consumes **Actions minutes + AI credits** |
| **Matrix × agents** | 4 OS × 3 Node × 10 agent PRs = 120 jobs |
| **No budget / $0 spend limit** | Soft-block or surprise bill; set budgets early |
| **Self-hosted “free forever” assumption** | Still free in docs today; platform fee was announced then **postponed**—watch changelog |

---

## 6. How to check usage / spend

### Dashboard

| Account | URL |
|---------|-----|
| Personal | [https://github.com/settings/billing](https://github.com/settings/billing) |
| Org / Enterprise | Org/Enterprise → **Billing & Licensing** → **Usage / Metered usage** |
| Pricing calculator | [https://github.com/pricing/calculator](https://github.com/pricing/calculator) |

Alerts: email at **90% and 100%** of included usage for Actions, Packages, LFS, Codespaces.  
Budgets: [Set up budgets](https://docs.github.com/en/billing/how-tos/set-up-budgets).

### CLI (`gh`)

```bash
# Org usage report (enhanced billing platform)
gh api /organizations/ORG/settings/billing/usage

# Org usage summary (public preview)
gh api /organizations/ORG/settings/billing/usage/summary

# User usage
gh api /users/USERNAME/settings/billing/usage
gh api /users/USERNAME/settings/billing/usage/summary

# Per-workflow billable ms (repo)
gh api /repos/OWNER/REPO/actions/workflows/WORKFLOW_FILE.yml/timing
```

Sources: [REST billing usage](https://docs.github.com/en/rest/billing/usage), [view product usage](https://docs.github.com/en/billing/how-tos/products/view-productlicense-use), [automate usage reporting](https://docs.github.com/enterprise-cloud@latest/billing/tutorials/automate-usage-reporting).

Legacy endpoints like `/users/USER/settings/billing/actions` may still exist in the wild; prefer **`.../settings/billing/usage`** on the enhanced platform.

---

## 7. Keyword triggers (shell / config)

Short lowercase tokens that usually mean this stack is in play:

```
gh
gh api
gh workflow
gh run
gh codespace
gh cs
gh package
gh release
actions/checkout
actions/cache
runs-on
ubuntu-latest
windows-latest
macos-latest
workflow_dispatch
github.token
GITHUB_TOKEN
GITHUB_ACTIONS
.github/workflows
act 
self-hosted
actions-runner
arc
github packages
ghcr.io
docker.pkg.github.com
npm.pkg.github.com
git-lfs
git lfs
lfs
codespaces
devcontainer
devcontainer.json
prebuild
copilot
```

---

## Auto-deploy workflows: what they burn (cheat sheet)

| Step | Burns |
|------|--------|
| Checkout + build + test on `ubuntu-latest` | **Actions minutes** (private) |
| Cache restore/save over 10 GB/repo | **Cache storage $** |
| Upload artifacts / keep forever | **Shared storage $** (accrual) |
| Deploy to external host (SSH/API) | Minutes only (egress not Actions-metered the same way Packages is) |
| Pull private npm/container with PAT | **Packages bandwidth** |
| Pull private package with `GITHUB_TOKEN` | Free transfer |
| `git lfs pull` in job | **LFS bandwidth** |
| Publish image to **GHCR** | Container storage currently **free** |
| Publish to non-container Packages | **Packages storage** |
| Codespaces prebuild on push | **Actions minutes + Codespaces storage** |
| Larger runner / GPU | **Always $/min** |

---

## Quick reference numbers (copy block)

```
Actions private free minutes:  Free 2000 | Pro 3000 | Team 3000 | Ent 50000 / mo
Public Actions (standard):     free
Self-hosted:                   free (per current docs; watch pricing changelog)
Overage Linux 2-core:          $0.006/min
Overage Windows 2-core:        $0.010/min
Overage macOS:                 $0.062/min
Shared storage overage:        $0.25/GB-mo
Cache overage:                 $0.07/GB-mo
Codespaces free (personal):    120 core-h + 15 GB-mo (Free) | 180 + 20 (Pro)
Codespaces 2-core:             $0.18/h | storage $0.07/GB-mo
Packages free transfer:        1 GB Free | 10 GB Pro/Team | 100 GB Ent
LFS free:                      10 GiB Free/Pro | 250 GiB Team/Ent (storage + bandwidth)
Seats:                         Team $4/user | Enterprise from $21/user
```

### Primary sources (bookmark these)

1. https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions  
2. https://docs.github.com/en/billing/reference/actions-runner-pricing  
3. https://docs.github.com/en/billing/reference/product-usage-included  
4. https://docs.github.com/billing/managing-billing-for-github-codespaces/about-billing-for-github-codespaces  
5. https://docs.github.com/en/billing/concepts/product-billing/github-packages  
6. https://docs.github.com/billing/managing-billing-for-git-large-file-storage/about-billing-for-git-large-file-storage  
7. https://github.com/pricing  
8. https://docs.github.com/en/billing/how-tos/products/view-productlicense-use  
9. https://docs.github.com/en/rest/billing/usage  

**Caveat:** GitHub cut hosted-runner prices Jan 1 2026 and postponed a self-hosted platform fee; re-check runner pricing + Actions billing pages if you are reading this months later.
