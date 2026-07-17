# Research archive: hyperscalers

Raw dual-engine research output (2026-07-17). Engine A = Claude subagent with web search; Engine B = grok CLI (`grok -p`, web search enabled). The merged factsheet cross-checks both, preferring official pricing pages on conflicts.

## Merged factsheet (cross-checked)

```json
{
  "provider": "AWS / GCP / Azure (hyperscaler agent-relevant slice: serverless compute, storage, egress, VPC/NAT)",
  "billing_dimensions": [
    "AWS Lambda: requests (per-1M) + GB-seconds duration (1ms granularity; INIT/cold-start phase billed since Aug 2025) + ephemeral storage >512MB + provisioned concurrency (not free-tier covered)",
    "AWS S3: GB-month by class + PUT/LIST-class ($0.005/1k) vs GET-class ($0.0004/1k) requests + data transfer out",
    "AWS EC2: instance-seconds (60s min) + EBS GB-month + public IPv4 $0.005/hr (in-use OR idle)",
    "AWS NAT Gateway: $0.045/hr provisioned + $0.045/GB processed, both directions",
    "AWS egress: GB to internet aggregated account-wide, first 100 GB/mo free (excl. China/GovCloud); cross-AZ/region $0.01-0.02/GB; inbound free",
    "GCP Cloud Run request-based: vCPU-seconds + GiB-seconds while serving + per-1M requests + egress; instance-based: whole instance lifetime at lower unit rates; min-instances bill idle time",
    "GCP egress: per GB, Premium tier (default, pricier) vs Standard tier, by destination; collateral: Cloud Build minutes, Artifact Registry storage, Serverless VPC Access compute",
    "Azure Functions Consumption: executions (per-1M) + GB-s (memory rounded up to 128MB buckets, min 100ms/128MB); Flex: on-demand meters + optional always-ready baseline; co-created Storage Account bills separately and is NOT in the free grant",
    "Azure bandwidth: GB out to internet by zone, first 100 GB/mo free; inbound free"
  ],
  "free_tier": "AWS (accounts ≥2025-07-15): NO 12-mo free tier — $100 credit + up to $100 more ($20×5 tasks) = $200 max, expires at 6 months OR exhaustion, then account auto-closes (90-day recovery); always-free (all accounts, monthly): Lambda 1M requests + 400,000 GB-s, 100 GB internet egress, DynamoDB 25 GB, CloudFront 1 TB; legacy pre-2025-07-15 accounts keep 750 hr/mo t2/t3.micro EC2 + RDS 12-mo offers. GCP: $300 trial credit / 90 days (resources pause at expiry, 30-day upgrade window; no GPUs on trial); Cloud Run always-free per billing account/mo: 2M requests + 180,000 vCPU-s + 360,000 GiB-s + only 1 GB NA egress (instance-based mode: 240K vCPU-s + 450K GiB-s); Cloud Run functions 2M invocations + 400K GB-s; 1 e2-micro (us-west1/central1/east1) + 30 GB PD; Cloud Storage 5 GB + 100 GB NA egress; BigQuery 1 TiB query + 10 GiB; Cloud Build 2,500 min. Azure: $200 credit / 30 days (lost if unused; 12-mo free services only if converted to PAYG); Functions Consumption always-free per subscription/mo: 1M executions + 400,000 GB-s (Flex grant smaller: 250K executions + 100K GB-s; Premium: none); Container Apps 180K vCPU-s + 360K GiB-s + 2M requests; 100 GB/mo internet egress free.",
  "plans": [
    {
      "name": "AWS pay-as-you-go (no seat plans)",
      "price": "$0 base; new-account Free plan = $100-$200 credits, hard 6-month expiry then account auto-close",
      "included": "Always-free monthly: Lambda 1M req + 400K GB-s, 100 GB egress, DynamoDB 25 GB, CloudFront 1 TB",
      "overage": "Lambda $0.20/1M req + $0.0000166667/GB-s x86 (Arm $0.0000133334); S3 Standard $0.023/GB-mo, PUT $0.005/1k, GET $0.0004/1k; egress $0.09/GB first tier; NAT GW $0.045/hr + $0.045/GB (~$33/mo idle); public IPv4 $0.005/hr (~$3.60/mo)"
    },
    {
      "name": "GCP pay-as-you-go / Cloud Run (no seat plans)",
      "price": "$0 base; $300 trial credit / 90 days for new accounts",
      "included": "Cloud Run always-free/mo: 2M req + 180K vCPU-s + 360K GiB-s + 1 GB NA egress (request-based); 240K vCPU-s + 450K GiB-s (instance-based)",
      "overage": "Request-based: $0.000024/vCPU-s + $0.0000025/GiB-s + $0.40/1M req; instance-based: $0.000018/vCPU-s + $0.000002/GiB-s; idle min-instances $0.0000025 per vCPU-s and GiB-s; Premium egress $0.12/GB first 1 TB, Standard ~$0.085/GB"
    },
    {
      "name": "Azure Functions Consumption",
      "price": "$0 base",
      "included": "1M executions + 400,000 GB-s per subscription per month",
      "overage": "$0.20/1M executions + $0.000016/GB-s; co-created Storage Account and bandwidth bill separately"
    },
    {
      "name": "Azure Functions Flex Consumption (new default)",
      "price": "$0 base",
      "included": "250,000 executions + 100,000 GB-s/mo (on-demand meters only)",
      "overage": "$0.40/1M executions + ~$0.000026/GB-s on-demand + $0.000004/GB-s always-ready baseline (region-dependent)"
    },
    {
      "name": "Azure Functions Premium",
      "price": "Always ≥1 instance billed, ~$0.173/vCPU-hr + $0.0123/GB-hr — bills at zero traffic",
      "included": "No free grant; no cold start; VNET support",
      "overage": "vCPU-s + GB-s while allocated"
    }
  ],
  "first_quota_blown": "AWS new account: the $200-credit/6-month wall — one default VPC-with-NAT ($33/mo) + small RDS (~$15/mo) ≈ $50/mo burns credits in ~4 months at zero traffic, then the account auto-closes. GCP Cloud Run: the 1 GB NA free egress dies first if serving any assets; else 180K free vCPU-s (~360K req/mo at 500ms CPU each), or instantly with min-instances=1 (~$50+/mo, no free coverage). Azure: 400K GB-s grant (512MB × 1s × 800K executions), though the co-created Storage Account is usually the first nonzero line item; 1M free executions ≈ 0.4 RPS continuous — a 1s poller (2.6M/mo) blows every request grant.",
  "sweet_spots": "Hobby/demo apps: GCP Cloud Run has the most generous always-free compute (180K vCPU-s ≈ 50 vCPU-hrs/mo, forever) but near-zero free egress (1 GB); Lambda and Azure Functions Consumption have identical forever-free grants (1M req + 400K GB-s) plus 100 GB/mo egress — better for anything serving files. AWS new accounts are on a 6-month countdown: fine for prototypes, wrong for anything meant to keep running. Serverless WITHOUT VPC/NAT stays effectively free at hobby scale on all three; the moment an agent adds NAT, min-instances, Premium/Flex always-ready, or an always-on VM/DB, the bill starts regardless of traffic. Set a $5-20 budget alert day one; tear down agent-provisioned stacks in the same session.",
  "traps": [
    "AWS NAT Gateway: $0.045/hr forever + $0.045/GB (~$33/mo idle, 3x for 3 AZs); default 'private Lambda in VPC' CDK/Terraform templates create it; S3/DynamoDB traffic through NAT double-bills unless gateway endpoints added — #1 surprise line item",
    "AWS free-plan auto-close: at 6 months the whole account and its data are scheduled for deletion — fatal for agent-provisioned 'permanent' infra",
    "Forgotten per-test EC2/RDS: stopped RDS still bills storage and auto-restarts after 7 days; terminate don't stop; check all regions the agent touched; idle public IPv4s ($3.60/mo each) and EBS volumes/snapshots survive termination",
    "Cloud Run min-instances / CPU-always-allocated set 'to fix cold starts' converts a free app into ~$50+/mo; instance-based billing has no request free line",
    "GCP trial cliff: everything pauses at day 90/$300; Premium egress is the default and ~40% pricier than Standard; Serverless VPC Access connector for private Cloud SQL is never free",
    "Azure: Storage Account co-created with every Function App always bills (not in free grant); Application Insights ingestion keeps billing after function deletion; per-test resource groups left behind = Azure's forgotten-EC2",
    "Azure Flex Consumption is the pushed default for new Functions: 4x smaller free grant (250K/100K), 2x per-execution price, ~1.6x GB-s rate vs classic Consumption; Premium/always-ready bills while idle",
    "Polling loops: 1s-interval poller = 2.6M req/mo, past every free request grant; on Cloud Run it also keeps the instance warm burning vCPU-s; 1-min timers x N apps add up",
    "Egress amplification: agents piping logs/artifacts/model weights/docker layers out — 3-4 GB/day kills the 100 GB/mo free (AWS/Azure); on Cloud Run only 1 GB is free; cross-AZ/region transfer ($0.01-0.02/GB) hides inside 'internal' architectures",
    "CI thrash: image pushes bloat ECR/Artifact Registry (GCP free is only 0.5 GB) and Cloud Build/pipeline minutes beyond free"
  ],
  "usage_check": "AWS: `aws ce get-cost-and-usage --time-period Start=2026-07-01,End=2026-07-17 --granularity MONTHLY --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE` (Cost Explorer API, $0.01/call), `aws freetier get-free-tier-usage`, `aws budgets describe-budgets --account-id <id>`; console: https://console.aws.amazon.com/costmanagement/home (Free Tier page, 85% alerts). GCP: no first-class spend CLI — `gcloud billing accounts list`, `gcloud billing budgets list --billing-account=<id>`; real spend at https://console.cloud.google.com/billing/reports (trial credit on billing overview). Azure: `az consumption usage list --start-date 2026-07-01 --end-date 2026-07-17`, `az costmanagement query --type ActualCost --timeframe MonthToDate --scope subscriptions/<sub-id>`, `az consumption budget list`; portal: https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview",
  "keywords": [
    "aws",
    "awslocal",
    "s3://",
    "aws s3",
    "aws lambda",
    "sam deploy",
    "sam local",
    "cdk deploy",
    "cdk synth",
    "serverless deploy",
    "amplify",
    "eb deploy",
    "ec2",
    "rds",
    "ecs",
    "eks",
    "fargate",
    "ecr",
    "dynamodb",
    "sqs",
    "sns",
    "cloudformation",
    "boto3",
    ".amazonaws.com",
    "gcloud",
    "gsutil",
    "gs://",
    "gcloud run deploy",
    "gcloud functions deploy",
    "firebase deploy",
    "firestore",
    "bq ",
    "bigquery",
    "gcr.io",
    "pkg.dev",
    ".run.app",
    "appspot.com",
    "az ",
    "az functionapp",
    "az webapp",
    "az vm",
    "az storage",
    "func start",
    "func azure functionapp publish",
    "azd up",
    "azd deploy",
    "bicep",
    "containerapps",
    "cosmosdb",
    ".azurewebsites.net",
    ".blob.core.windows.net",
    "terraform",
    "pulumi"
  ],
  "hint": "Free/mo: Lambda & AzFunc 1M req+400K GB-s; Cloud Run 2M req+180K vCPU-s but only 1GB egress; AWS/Azure egress 100GB. New AWS accts: $200 credit, auto-close at 6mo. #1 trap: NAT GW $0.045/hr+/GB (~$33/mo idle); never set min-instances.",
  "conflicts": [
    "Azure account-wide free egress: A claims 100 GB/mo internet egress free for all customers citing the official bandwidth pricing page; B claims free bandwidth is product-specific only (e.g. Static Web Apps 100 GB). A wins (official pricing-page URL; Azure has offered first-100-GB-free since 2021). WebFetch verification attempted but timed out.",
    "Azure Flex Consumption on-demand rate: A says $0.000016/GB-s execution + $0.000004/GB-s always-ready; B says ~$0.000026/GB-s on-demand + $0.40/1M, citing the official Functions pricing page and learn.microsoft.com consumption-costs docs. B wins — A appears to have copied the classic Consumption GB-s rate into Flex; both agree on the $0.000004 always-ready baseline and the 250K/100K grant. Rate is region-dependent; unverified live (fetch timed out).",
    "AWS NAT idle monthly floor: A ~$32.40 (720 hr) vs B ~$32.85 (730 hr) — same official $0.045/hr rate, hours-per-month convention only; not a real disagreement.",
    "S3 free tier on new accounts: A asserts the classic 5 GB S3 offer is legacy-only (new accounts draw from credits); B hedges ('often 5 GB', verify in console). Merged as A's version since A cites the AWS billing free-tier doc; flagged as low-confidence.",
    "Only in one report (kept, not contradicted): A's GCP Standard-tier 200 GiB/mo free egress and Cloud Run functions grants; B's Cloud Run instance-based free tier (240K vCPU-s/450K GiB-s), T4g free trial until 2026-12-31, and Azure Container Apps free slice."
  ],
  "sources": [
    "https://aws.amazon.com/free/",
    "https://aws.amazon.com/blogs/aws/aws-free-tier-update-new-customers-can-get-started-and-explore-aws-with-up-to-200-in-credits/",
    "https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-free-tier.html",
    "https://aws.amazon.com/lambda/pricing/",
    "https://aws.amazon.com/s3/pricing/",
    "https://aws.amazon.com/ec2/pricing/on-demand/",
    "https://aws.amazon.com/vpc/pricing/",
    "https://cloud.google.com/free/docs/free-cloud-features",
    "https://cloud.google.com/run/pricing",
    "https://cloud.google.com/vpc/network-pricing",
    "https://cloud.google.com/network-tiers/pricing",
    "https://azure.microsoft.com/en-us/free/",
    "https://azure.microsoft.com/en-us/pricing/details/functions/",
    "https://azure.microsoft.com/en-us/pricing/details/bandwidth/",
    "https://learn.microsoft.com/en-us/azure/azure-functions/functions-consumption-costs",
    "https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/avoid-charges-free-account"
  ]
}
```

## Engine A — Claude web research (raw)

# Cloud Hyperscaler Pricing/Quota Factsheet — Agent-Relevant Slice (AWS / GCP / Azure)
Current as of 2026-07-17. Verified against official pricing pages where accessible; noted where numbers changed recently.

---

## 1. METERED BILLING DIMENSIONS

**AWS (agent slice):**
- Lambda: requests (per-1M) + duration (GB-seconds, 1ms granularity; since Aug 2025 the INIT/cold-start phase is also billed) + ephemeral storage >512MB.
- S3: storage GB-month + requests (PUT/LIST class vs GET class) + data transfer out.
- EC2: instance-hours (per-second billing, 60s min), EBS GB-month, public IPv4 addresses ($0.005/hr each, in use OR idle).
- Egress: GB out to internet, aggregated across all services; inbound free.
- NAT Gateway: hours provisioned + GB processed (both directions).
- Sources: https://aws.amazon.com/lambda/pricing/ , https://aws.amazon.com/s3/pricing/ , https://aws.amazon.com/vpc/pricing/ , https://aws.amazon.com/ec2/pricing/on-demand/

**GCP (agent slice):**
- Cloud Run (request-based billing): vCPU-seconds + GiB-seconds of memory (only while serving requests) + per-1M requests + egress. Instance-based billing: vCPU-s/GiB-s for the whole instance lifetime at lower unit rates. Min-instances bill idle time.
- Egress: per GB, Premium tier (default) vs Standard tier, priced by destination.
- Source: https://cloud.google.com/run/pricing , https://cloud.google.com/vpc/network-pricing

**Azure (agent slice):**
- Functions Consumption: executions (per-1M) + GB-seconds (memory rounded up to nearest 128MB, min 100ms/128MB per execution). The backing Storage Account bills separately and is NOT in the free grant.
- Bandwidth: GB out to internet by zone; inbound free.
- Sources: https://azure.microsoft.com/en-us/pricing/details/functions/ , https://azure.microsoft.com/en-us/pricing/details/bandwidth/

---

## 2. FREE TIERS — EXACT QUOTAS

**AWS — MAJOR CHANGE July 15, 2025** (https://aws.amazon.com/blogs/aws/aws-free-tier-update-new-customers-can-get-started-and-explore-aws-with-up-to-200-in-credits/ , https://aws.amazon.com/free/):
- New accounts (>= 2025-07-15): NO 12-month free tier. Instead: **$100 credit at signup + up to $100 more** ($20 per onboarding task: launch/terminate EC2, configure RDS, deploy Lambda, Bedrock prompt, set a budget) = up to $200. Free plan expires after **6 months or when credits run out**, then account auto-closes (90-day recovery window). Upgrading to Paid keeps unused credits up to 12 months from signup.
- The 750 hr/month EC2 t2/t3.micro and 750 hr/month RDS db.t3.micro 12-month offers exist ONLY on pre-2025-07-15 legacy accounts (https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-free-tier.html).
- Always-free (both plans, resets monthly): **Lambda 1M requests + 400,000 GB-s/mo** (https://aws.amazon.com/lambda/pricing/); DynamoDB 25 GB; CloudFront 1 TB out + 10M requests; SNS 1M publishes. S3's classic "5 GB + 20,000 GET + 2,000 PUT" was a 12-month legacy offer — on new accounts assume S3 draws from credits.
- **100 GB/month egress to internet free**, aggregated across all services/regions except China/GovCloud (https://aws.amazon.com/ec2/pricing/on-demand/).

**GCP** (https://cloud.google.com/free/docs/free-cloud-features):
- **$300 trial credit, 90 days**; unused credit forfeited; resources pause at expiry, 30-day window to upgrade.
- Cloud Run always-free (per billing account, monthly): **2M requests, 180,000 vCPU-seconds, 360,000 GiB-seconds memory, 1 GB egress from North America**.
- Cloud Run functions: 2M invocations, 400,000 GB-s, 200,000 GHz-s, 5 GB egress.
- Compute Engine: 1 e2-micro/mo (us-west1/us-central1/us-east1 only) + 30 GB standard PD.
- Cloud Storage: 5 GB-months regional (US regions), 5,000 Class A + 50,000 Class B ops, 100 GB NA egress (recently raised from 1 GB — https://cloud.google.com/storage/pricing-announce).
- BigQuery: 1 TiB query + 10 GiB storage/mo.
- Standard network tier: 200 GiB/mo free egress per region (Premium tier — the default — gets only 1 GiB) (https://cloud.google.com/blog/products/networking/standard-tier-network-now-includes-200-gb-data-transfer-per-month).

**Azure** (https://azure.microsoft.com/en-us/pricing/purchase-options/azure-account , https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/avoid-charges-free-account):
- Free account: **$200 credit, 30 days** (lost if unused); 12-month free services only if you convert to pay-as-you-go within 30 days; 55-65+ always-free services.
- Functions Consumption free grant (always, per subscription): **1M executions + 400,000 GB-s/month** (https://azure.microsoft.com/en-us/pricing/details/functions/). Flex Consumption grant is smaller: **250,000 executions + 100,000 GB-s**.
- **100 GB/month internet egress free**, all customers, aggregated (https://azure.microsoft.com/en-us/pricing/details/bandwidth/).

---

## 3. PAID PRICING (no seat plans — all pay-as-you-go; unit prices, cheapest US regions)

**AWS:**
- Lambda: $0.20/1M requests; $0.0000166667/GB-s x86 (Arm ~$0.0000133334); extra ephemeral storage $0.0000000309/GB-s (https://aws.amazon.com/lambda/pricing/).
- S3 Standard: $0.023/GB-mo first 50 TB ($0.022 next 450 TB, $0.021 beyond); PUT/COPY/POST/LIST $0.005/1k; GET $0.0004/1k (https://aws.amazon.com/s3/pricing/).
- Egress: $0.09/GB after the 100 GB free (first 10 TB tier).
- NAT Gateway: **$0.045/hr + $0.045/GB processed** (= ~$32.40/mo idle before any traffic). Public IPv4: $0.005/hr (~$3.60/mo each) (https://aws.amazon.com/vpc/pricing/).

**GCP Cloud Run (Tier 1 regions, request-based):**
- $0.000024/vCPU-s; $0.0000025/GiB-s; $0.40/1M requests past free tier. Instance-based: $0.000018/vCPU-s, $0.000002/GiB-s (https://cloud.google.com/run/pricing).
- Premium-tier internet egress: $0.12/GB first 1 TB, $0.11/GB 1-10 TB (increased Feb 2024); Standard tier ~$0.085/GB after 200 GiB free (https://cloud.google.com/vpc/network-pricing).

**Azure Functions:**
- Consumption: $0.20/1M executions; $0.000016/GB-s.
- Flex Consumption: $0.40/1M executions; $0.000016/GB-s execution + $0.000004/GB-s always-ready baseline.
- Premium: ~$0.173/vCPU-hr + $0.0123/GB-hr — bills continuously even at zero traffic.
- Egress Zone 1: $0.087/GB after 100 GB free (https://azure.microsoft.com/en-us/pricing/details/functions/ , https://azure.microsoft.com/en-us/pricing/details/bandwidth/).

---

## 4. SWEET SPOTS AND FIRST-QUOTA-BLOWN FOR AGENT-BUILT APPS

- Hobby/demo web app + sandboxed runs: GCP Cloud Run free tier is the most generous compute (50 vCPU-hours/mo free forever); Azure Functions free grant is the same forever-free size as Lambda's; AWS new accounts are effectively on a **6-month countdown** — fine for prototypes, wrong for anything meant to keep running.
- What a typical agent-built app blows FIRST:
  1. **AWS new account: the $200 credit / 6-month wall** — any always-on resource (t3.small ~$15/mo, RDS db.t3.micro ~$12-15/mo, NAT GW $32/mo, ALB ~$16/mo) eats it in weeks. One default VPC-with-NAT + one small RDS ~ $50/mo = credits gone in ~4 months with zero traffic.
  2. **Cloud Run free vCPU-seconds (180k)**: a chatty app holding ~500ms CPU per request clears it at ~360k requests/mo, or instantly if the agent sets `min-instances=1` with instance-based billing (1 vCPU + 512MiB always-on ~ $50+/mo, no free-tier coverage for idle).
  3. **Azure Functions GB-s (400k)**: a 512MB function averaging 1s/execution burns it at ~800k executions/mo — a 1-minute polling timer is harmless, but per-request fan-out from a chatty frontend is not. The separate Storage Account (bills for every queue/blob transaction the runtime makes) is usually the first nonzero line item.
  4. **Egress 100 GB/mo (AWS/Azure/GCP-Storage)**: fine for APIs; blown fast by serving images/models/artifacts or by agents downloading their own build artifacts repeatedly — 3-4 GB/day of downloads kills it.

---

## 5. COST TRAPS FOR AI-AGENT USAGE PATTERNS

- **NAT Gateway (AWS)**: agents that create a "standard" VPC put Lambda/ECS in private subnets behind NAT — $0.045/hr forever + $0.045/GB, and traffic to S3/DynamoDB through NAT double-bills unless VPC gateway endpoints are added. #1 surprise line item.
- **Forgotten EC2/RDS from per-test provisioning**: agents that spin up an instance per experiment and crash before teardown. RDS also keeps billing when "stopped" for storage, and auto-restarts after 7 days stopped. Terminate, don't stop; check `aws ec2 describe-instances` and `aws rds describe-db-instances` in ALL regions the agent touched.
- **Idle public IPv4s and EBS volumes/snapshots** survive instance termination unless delete-on-termination was set.
- **Cloud Run min-instances / CPU-always-allocated** set "to fix cold starts" converts a free app into a ~$50+/mo app.
- **GCP trial cliff**: everything pauses at day 90/$300 — agents should not park demo data only there; also Premium egress is default and 40% pricier than Standard.
- **Azure Premium/Flex Functions plans** bill while idle; the auto-created Storage Account + Application Insights (ingestion per GB) keep billing after the function is deleted; resource groups left behind by per-test deploys are the Azure version of forgotten EC2.
- **Polling loops**: cheap on requests (1M Lambda/Functions requests free) but a 1s-interval poller = 2.6M requests/mo, past every request grant; on Cloud Run it also keeps the instance warm, burning vCPU-seconds.
- **Egress amplification**: agents piping logs/artifacts/DB dumps out to CI or their own sandbox; cross-region and cross-AZ transfer (AWS $0.01-0.02/GB) inside "internal" architectures.
- **AWS free-plan auto-close**: at 6 months the whole account (and its data) is scheduled for deletion — a trap for agent-provisioned "permanent" infra.

---

## 6. CHECKING USAGE/SPEND

**AWS:**
- CLI: `aws ce get-cost-and-usage --time-period Start=2026-07-01,End=2026-07-17 --granularity MONTHLY --metrics UnblendedCost` (Cost Explorer API, $0.01/request); free-tier tracking: `aws freetier get-free-tier-usage`; budgets: `aws budgets describe-budgets --account-id <id>`.
- Dashboard: https://console.aws.amazon.com/costmanagement/home — Free Tier page: Billing console > Free Tier.

**GCP:**
- No first-class spend CLI; `gcloud billing accounts list` and `gcloud billing projects describe PROJECT_ID` show linkage; real spend needs the console or BigQuery billing export (`gcloud billing` + query the export table).
- Dashboard: https://console.cloud.google.com/billing (Reports; Free-trial credit status shown on billing overview).

**Azure:**
- CLI: `az consumption usage list --start-date 2026-07-01 --end-date 2026-07-17` ; `az costmanagement query --type ActualCost --timeframe MonthToDate --scope subscriptions/<sub-id>` ; budgets via `az consumption budget list`.
- Dashboard: https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview ; free-account credit: https://www.microsoftazuresponsorships.com/balance (credit-balance page linked from Cost Management).

---

## 7. KEYWORD TRIGGERS (shell)

- AWS: `aws `, `aws s3`, `s3://`, `aws lambda`, `sam deploy`, `sam local`, `cdk deploy`, `cdk synth`, `amplify`, `eb deploy`, `ecs`, `eks`, `ec2`, `dynamodb`, `cloudformation`, `boto3`, `serverless deploy` (with provider aws), `terraform` + `provider "aws"`, `AWS_ACCESS_KEY_ID`, `.amazonaws.com`
- GCP: `gcloud `, `gsutil`, `gs://`, `gcloud run deploy`, `gcloud functions deploy`, `firebase deploy`, `bq `, `kubectl` + gke context, `terraform` + `provider "google"`, `GOOGLE_APPLICATION_CREDENTIALS`, `.run.app`, `appspot.com`
- Azure: `az `, `az functionapp`, `func azure functionapp publish`, `func start`, `azd up`, `azd deploy`, `az webapp`, `az vm`, `az storage`, `bicep`, `terraform` + `provider "azurerm"`, `AZURE_SUBSCRIPTION_ID`, `.azurewebsites.net`, `.blob.core.windows.net`

---

## RECENT CHANGES TO FLAG
1. AWS free tier restructured 2025-07-15: credits ($100-$200, 6-month expiry) replaced the 12-month EC2/RDS free tier for new accounts; always-free Lambda/DynamoDB unchanged. (aws.amazon.com/blogs/aws + docs.aws.amazon.com/awsaccountbilling)
2. Lambda bills the INIT (cold start) phase since Aug 2025.
3. GCP Cloud Storage always-free egress raised 1 GB -> 100 GB/mo (cloud.google.com/storage/pricing-announce); Premium-tier egress SKUs increased Feb 2024; third-party reports of peering-egress increases ~May 2026 (unofficial).
4. Azure Flex Consumption is now the pushed default for new Functions — smaller free grant (250k/100k GB-s) and 2x per-execution price vs classic Consumption.

Key source URLs: https://aws.amazon.com/free/ | https://aws.amazon.com/lambda/pricing/ | https://aws.amazon.com/s3/pricing/ | https://aws.amazon.com/vpc/pricing/ | https://aws.amazon.com/ec2/pricing/on-demand/ | https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-free-tier.html | https://cloud.google.com/free/docs/free-cloud-features | https://cloud.google.com/run/pricing | https://cloud.google.com/vpc/network-pricing | https://cloud.google.com/network-tiers/pricing | https://azure.microsoft.com/en-us/pricing/details/functions/ | https://azure.microsoft.com/en-us/pricing/details/bandwidth/ | https://azure.microsoft.com/en-us/pricing/purchase-options/azure-account | https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/avoid-charges-free-account

## Engine B — grok CLI (raw)

# Hyperscaler pricing/quota factsheet (agent-relevant slice)
**As of July 2026** · Verified against official pricing pages (not blogs). All USD. Regional rates vary; numbers below use US East / common Tier‑1 regions where cited.

---

## Cross-provider cheat sheet

| Concern | AWS | GCP | Azure |
|---|---|---|---|
| New-customer money | Up to **$200 credits / 6 mo** (Free plan; auto-closes) | **$300 / 90 days** | **$200 / 30 days** |
| Serverless free compute | Lambda: **1M req + 400K GB‑s / mo** (always free) | Cloud Run (request-based): **2M req + 180K vCPU‑s + 360K GiB‑s / mo** | Functions Consumption: **1M exec + 400K GB‑s / mo** |
| Free egress (typical) | **100 GB/mo** DTO to internet (all services, excl. China/GovCloud) | Cloud Run: **1 GB** NA outbound; Cloud Storage: **100 GB** NA; Compute free tier: **1 GB** | Bandwidth billed; free amounts are product-specific (e.g. Static Web Apps **100 GB**) |
| Classic bill bombs | NAT Gateway hours, forgotten EC2/RDS, public IPv4 | Min instances, Serverless VPC Access, egress | Storage account always created w/ Functions, Premium plan always-on |

---

# 1. AWS (Lambda · S3 · EC2 trial · 100 GB egress · NAT)

## 1.1 Metered billing dimensions

| Dimension | What bills |
|---|---|
| **Lambda requests** | Per invocation; async events >256 KB count extra request chunks |
| **Lambda duration** | GB‑seconds (memory × wall time); x86/Arm tiers |
| **Lambda extras** | Ephemeral storage >512 MB, Provisioned Concurrency, SnapStart, response streaming, durable ops, MicroVMs |
| **S3** | Storage GB‑month by class; PUT/GET/LIST/lifecycle; retrievals; replication; transfer acceleration |
| **Egress (DTO)** | Internet / cross‑region; first **100 GB/mo free** aggregated account‑wide |
| **EC2** | Instance‑seconds (min 60s Linux), EBS, public IPv4, data transfer |
| **NAT Gateway** | **Hours provisioned** + **GB processed** + standard DTO |
| **Public IPv4** | **$0.005/hr** in‑use or idle |

Sources: [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [S3 pricing](https://aws.amazon.com/s3/pricing/), [EC2 on‑demand](https://aws.amazon.com/ec2/pricing/on-demand/), [VPC pricing](https://aws.amazon.com/vpc/pricing/).

## 1.2 Free tier — exact quotas

### A. New Free Tier (accounts created **on/after 15 Jul 2025**)

| Item | Quota | Notes |
|---|---|---|
| Credits | **$100** at signup + up to **$100** more ($20 × 5 explore activities: EC2, RDS, Lambda, Bedrock, Budgets) = **up to $200** | Free plan: **6 months** or credits exhausted, then account closes; 90 days to reopen via Paid plan |
| Always free | **30+ services** with monthly caps (includes Lambda free tier below) | Applies Free + Paid plans |
| Free plan guardrail | No charges unless upgrade / paid‑only services | Limited service catalog vs Paid |

Sources: [aws.amazon.com/free](https://aws.amazon.com/free/), [Free Tier update blog (15 Jul 2025)](https://aws.amazon.com/blogs/aws/aws-free-tier-update-new-customers-can-get-started-and-explore-aws-with-up-to-200-in-credits/).

### B. Always free (both new + legacy)

| Service | Exact free quota |
|---|---|
| **Lambda** | **1,000,000 requests/mo** + **400,000 GB‑seconds/mo** |
| **Data transfer out to internet** | **100 GB/mo** aggregated across AWS services & regions (not China, not GovCloud) |
| **Lambda response streaming** | Free tier includes **100 GB** streamed/mo; first **6 MB** per request free |

Sources: [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [S3 data transfer / EC2 DTO](https://aws.amazon.com/s3/pricing/), [EC2 data transfer](https://aws.amazon.com/ec2/pricing/on-demand/).

### C. Legacy Free Tier (accounts **before 15 Jul 2025**)

Still applies to those accounts: **12‑month** free trials + always free. Classic agent-relevant legacy numbers (verify in console for your account):

| Service | Legacy 12‑mo free (typical documented) |
|---|---|
| **EC2** | **750 hours/mo** t2.micro / t3.micro (Linux) — enough for 1 small box 24/7 |
| **S3** | Often **5 GB** Standard storage + request allotments (track in Free Tier usage) |
| **T4g trial** | Extended free trial **until 31 Dec 2026** (all customers, per EC2 FAQs) |

Sources: [Billing Free Tier (pre‑Jul 2025)](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-free-tier.html), [EC2 FAQs T4g](https://aws.amazon.com/ec2/faqs/).

## 1.3 Paid / overage (no fixed "plans" — pure PAYG)

| Meter (us‑east examples from official pages) | Unit price |
|---|---|
| Lambda requests (after free) | **$0.20 / million** |
| Lambda duration x86 (first tier, ~1 GB) | **$0.0000166667 / GB‑s** (pricing examples) |
| S3 Standard storage | Regional $/GB‑mo (see [S3 pricing tables](https://aws.amazon.com/s3/pricing/)) |
| S3 → internet DTO after 100 GB free | Tiered; example NAT doc uses **$0.09/GB** first tier internet out |
| **NAT Gateway (us‑east-2 Ohio example)** | **$0.045 / hour** + **$0.045 / GB processed** + DTO |
| Public IPv4 | **$0.005 / hour** (~$3.60/mo per address) |

**There is no "Pro plan" monthly seat fee for these services** — only usage + optional Savings Plans / RIs for EC2.

Monthly floor if you leave one NAT Gateway up and idle:  
`0.045 × 730 ≈ $32.85/mo` before any traffic. Three AZs × regional NAT ≈ **3×** that.

Sources: [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [VPC NAT pricing](https://aws.amazon.com/vpc/pricing/), [EC2 DTO](https://aws.amazon.com/ec2/pricing/on-demand/).

## 1.4 Sweet spots & what an agent app hits first

| Pattern | Fits | Blows through **first** | Rough trigger |
|---|---|---|---|
| Small static site + API on Lambda + S3 | Always-free Lambda + 100 GB egress | **Lambda GB‑s** if memory high / cold+warm long runs; or **request count** if chatty | 512 MB × 1 s × ~800k invokes ≈ 400K GB‑s free; 1M req free ≈ ~0.4 RPS continuous |
| Chatty DB via Lambda in VPC | Still free on Lambda compute | **NAT Gateway hours** (not free) the moment private subnets + NAT exist | Day 1 of NAT: ~$1/day floor |
| Auto-deploys (CodePipeline/SAM/CDK) | Credits absorb small CI | **S3/ECR storage + cross‑region copy + build minutes** (not always free) | Large image pushes repeatedly |
| Sandboxed code (Lambda MicroVMs / many envs) | MicroVM billed per baseline+peak | **Compute seconds + snapshot R/W** | Official example: ~$12/dev/mo style workloads (pricing page) |

**Typical agent-built app failure order:** (1) NAT left running, (2) forgotten EC2/RDS, (3) egress past 100 GB (artifact dumps, video, logs), (4) Lambda duration from polling/retry storms.

## 1.5 AI-agent cost traps

- **NAT Gateway forever** — CDK/Terraform "default private Lambda in VPC" templates; ~$33+/mo idle; +$0.045/GB processing; +DTO. Use **S3/DynamoDB Gateway Endpoints** (no NAT fee) when possible.
- **Forgotten EC2 / RDS** — agent "spun up a test box" and never `terminate`/`delete-db-instance`.
- **Polling loops** — EventBridge every 1 min × N functions burns request + duration free tier.
- **Per-PR / per-test envs** — full stack per agent run (ALB + NAT + RDS) multiplies hour-meters.
- **Large egress** — downloading model weights, docker layers, log dumps past **100 GB**.
- **Public IPv4** on every ENI/NAT/ELB at $0.005/hr.
- **Provisioned Concurrency / min instances** — free tier does **not** cover PC.

## 1.6 How to check usage / spend

| Method | Command / URL |
|---|---|
| **CLI (Cost Explorer)** | `aws ce get-cost-and-usage --time-period Start=2026-07-01,End=2026-07-18 --granularity MONTHLY --metrics UnblendedCost BlendedCost --group-by Type=DIMENSION,Key=SERVICE` |
| Free Tier usage | Billing console Free Tier; alerts at 85% |
| Budgets | `aws budgets describe-budgets --account-id ACCOUNT_ID` |
| Dashboard | https://console.aws.amazon.com/billing/home · Cost Explorer · Credits |
| API | Cost Explorer `GetCostAndUsage` |

Source: [aws ce get-cost-and-usage](https://docs.aws.amazon.com/cli/latest/reference/ce/get-cost-and-usage.html).

## 1.7 Keyword triggers (shell)

`aws `, `awslocal`, `sam `, `cdk `, `serverless`, `lambda`, `s3://`, `boto3`, `terraform aws`, `pulumi aws`, `ec2`, `rds`, `nat-gateway`, `vpc`, `cloudformation`, `amplify`, `ebs`, `dynamodb`, `sqs`, `sns`, `ecs`, `fargate`, `ecr`

---

# 2. GCP (Cloud Run free tier · $300 credit)

## 2.1 Metered billing dimensions

| Dimension | What bills |
|---|---|
| **vCPU‑seconds / GiB‑seconds** | Active (and idle min instances) depending on request- vs instance-based billing |
| **Requests** | Per million (request-based billing only) |
| **Jobs / Worker pools** | Instance lifetime (jobs min 1 minute) |
| **Egress** | Premium tier networking; free tiers by product |
| **GPU** | Per second (L4 / RTX Pro 6000) |
| **Collateral** | Cloud Build minutes, Artifact Registry storage, Eventarc, Serverless VPC Access compute |

Source: [Cloud Run pricing](https://cloud.google.com/run/pricing).

## 2.2 Free tier — exact quotas

### Free Trial

| Item | Exact |
|---|---|
| Credit | **$300 Welcome credit** |
| Window | **90 days** |
| Billing during trial | Not billed; resources **stopped** if credit/time ends without upgrade to Paid |
| Restrictions | No GPUs on Free Trial account, no Marketplace, no Windows Server images, no quota increases; **$300 cannot pay Gemini API in AI Studio or partner MaaS models** |

### Always Free — Cloud Run (per **billing account**, monthly)

| Config | Free quota |
|---|---|
| **Request-based billing** (default for many web APIs) | **2,000,000 requests/mo** · **180,000 vCPU‑seconds** · **360,000 GiB‑seconds** · **1 GB outbound data transfer from North America** |
| **Instance-based billing** | **240,000 vCPU‑s** · **450,000 GiB‑s** (no request free line on this mode) |
| **Jobs** | Same as instance-based free CPU/RAM |
| **Worker pools** | **384,204 vCPU‑s** · **728,744 GiB‑s** |

Free tier applied as Tier‑1 (e.g. us-central1) pricing discount; unused free **does not roll over**.

### Adjacent always-free (agent-adjacent)

| Product | Free |
|---|---|
| Cloud Storage | **5 GB‑months** regional US (`us-central1`/`us-east1`/`us-west1`) · **5k Class A / 50k Class B ops** · **100 GB** outbound NA (excl. China/Australia) |
| Compute Engine | **1 e2-micro** non-preemptible in us-west1/us-central1/us-east1 · **30 GB** standard PD · **1 GB** outbound NA |
| Cloud Build | **2,500 build-minutes/mo** (`e2-standard-2`) |
| Artifact Registry | **0.5 GB** storage |
| Cloud Run functions (1st gen) | **2M** invocations · **400K GB‑s** · **200K GHz‑s** · **5 GB** outbound |

Sources: [Free cloud features](https://docs.cloud.google.com/free/docs/free-cloud-features) (updated 2026‑07‑10), [Cloud Run pricing](https://cloud.google.com/run/pricing).

## 2.3 Paid overage (request-based, us-central1 defaults)

| Meter | Default unit price |
|---|---|
| CPU active | **$0.000024 / vCPU‑second** |
| Memory active | **$0.0000025 / GiB‑second** |
| CPU/memory idle (min instances) | **$0.0000025** per vCPU‑s and GiB‑s |
| Requests | **$0.40 / million** |
| Instance-based CPU / RAM | **$0.000018 / vCPU‑s** · **$0.000002 / GiB‑s** |
| Optional CUDs | Cloud Run 1y/3y and Compute Flexible CUD discounts on page |

No monthly seat fee — pure consumption + optional CUDs.

Source: [Cloud Run pricing](https://cloud.google.com/run/pricing).

## 2.4 Sweet spots & first quota blown

| Usage | Fits | First blow-through | Rough scale |
|---|---|---|---|
| Small web app / API | Request-based free tier | **1 GB NA egress** (very small) or **vCPU‑s** if slow/heavy handlers | 1 vCPU × 0.5 GiB × 200 ms avg: free CPU lasts tens of millions of short reqs if concurrency shares CPU; **egress** dies first if serving assets |
| Chatty DB | Free compute often OK | **Egress to external DB** or **Serverless VPC Access** hourly/compute | Private Cloud SQL via VPC connector ≠ free |
| Auto-deploys | Cloud Build 2,500 min | **Artifact Registry storage** (0.5 GB free) after many image tags | Layer bloat |
| Sandboxed runs (Cloud Run Jobs) | Free 240K vCPU‑s | **Job min 1 minute billing** × parallel tasks | 100 jobs × 1 min × 1 vCPU = 6,000 vCPU‑s |

Official example: public API 10M req/mo @ 400 ms, 1 vCPU, 512 MiB ≈ **~$13.69/mo** with free tier (europe-west1 calculator example on pricing page).

## 2.5 AI-agent cost traps

- **Min instances** — idle CPU/memory charged continuously.
- **Instance-based billing** ("CPU always allocated") for chatty/long-lived workers.
- **Egress** — free NA outbound for Cloud Run is only **1 GB**; agent log shipping / artifact download burns it instantly.
- **Forgotten GCE / Cloud SQL** after free trial upgrade.
- **Cloud Build + Artifact Registry** on every agent deploy beyond free storage.
- **GPU services** not coverable by $300 trial restrictions; L4 ~**$0.0001867/s** (~$0.67/hr) on pricing table.
- **$300 ends → resources stopped** if never upgraded to Paid.

## 2.6 How to check usage / spend

| Method | Command / URL |
|---|---|
| Billing reports | https://console.cloud.google.com/billing/reports |
| Welcome / credit remaining | https://console.cloud.google.com/welcome · Billing overview |
| Budgets CLI | `gcloud billing budgets list --billing-account=BILLING_ACCOUNT_ID` |
| Accounts | `gcloud billing accounts list` · `gcloud billing projects list --billing-account=...` |
| Cloud Run metrics | Cloud Monitoring `run.googleapis.com/container/billable_instance_time` |

Sources: [Free features FAQ / monitor costs](https://docs.cloud.google.com/free/docs/free-cloud-features), [Budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets).

## 2.7 Keyword triggers

`gcloud`, `gsutil`, `cloud run`, `cloudrun`, `run deploy`, `gcr.io`, `pkg.dev`, `artifactregistry`, `cloud build`, `gcp`, `google-cloud`, `firebase`, `firestore`, `bq `, `bigquery`, `gke`, `compute instances`

---

# 3. Azure (Functions free grant · free account)

## 3.1 Metered billing dimensions

| Dimension | What bills |
|---|---|
| **Executions** | Per function invocation (HTTP, queue, timer, etc.) |
| **Resource consumption** | GB‑s (memory rounded up to 128 MB buckets; min 100 ms / 128 MB on Consumption) |
| **Flex modes** | On‑demand execution + optional Always Ready baseline |
| **Premium / App Service / Container Apps** | vCPU + memory provisioned time (not free-grant style) |
| **Storage account** | Created by default with each Function App — **not in free grant** |
| **Bandwidth** | Networking rates separate |

Source: [Azure Functions pricing](https://azure.microsoft.com/en-us/pricing/details/functions/).

## 3.2 Free tier — exact quotas

### Azure free account (new customers)

| Item | Exact |
|---|---|
| Credit | **$200** for **30 days** |
| Protection | Card not charged unless you move to pay‑as‑you‑go |
| After | Upgrade to PAYG or account/services disabled |
| Also | **20+ services free for 12 months** + **65+ always-free** monthly amounts |

Source: [azure.microsoft.com/free](https://azure.microsoft.com/en-us/free/).

### Azure Functions free grants (always, on paid consumption subscriptions)

| Plan | Free grant (per **subscription** / mo, shared across all function apps) | Overage (official Consumption table) |
|---|---|---|
| **Consumption** | **1,000,000 executions** + **400,000 GB‑s** | **$0.000016 / GB‑s** · **$0.20 per million executions** |
| **Flex Consumption** | **250,000 executions** + **100,000 GB‑s** (on‑demand meters only) | Higher on‑demand rates (docs examples use ~**$0.000026 / GB‑s** and **$0.40 / million**; confirm region on pricing page — UI may show as `$‑` until region selected) |
| **Premium** | **No** free grant; always ≥1 instance billed | vCPU + memory / s |
| Free account marketing | "Azure Functions **1 million requests**" listed under always free | Aligns with Consumption grant |

**Notes from official page:** Free grants apply to **paid, consumption subscriptions only**. Storage + networking **extra**.

Sources: [Functions pricing](https://azure.microsoft.com/en-us/pricing/details/functions/), [Free services listing](https://azure.microsoft.com/en-us/free/), [Consumption cost estimation docs](https://learn.microsoft.com/en-us/azure/azure-functions/functions-consumption-costs).

### Related always-free (agent-adjacent, from free account page)

| Product | Free amount |
|---|---|
| Azure Container Apps | **180,000 vCPU‑s · 360,000 GiB‑s · 2M requests** |
| Static Web Apps | **100 GB** bandwidth / subscription · 0.5 GB storage / app |
| App Service (free tier) | Up to **10** apps · **1 GB** storage · **1 hour/day** compute |
| VMs (12 mo new) | **750 hours** each B1s / B2pts v2 / B2ats v2 |
| Azure SQL serverless | **100,000 vCore seconds/mo** + 32 GB storage |

## 3.3 Paid plans (agent-relevant)

| Plan | Monthly price | Included | Overage |
|---|---|---|---|
| **Consumption** | $0 base | 1M exec + 400K GB‑s | $0.000016/GB‑s + $0.20/M |
| **Flex Consumption** | $0 base | 250K exec + 100K GB‑s on‑demand | On‑demand + Always Ready baseline meters |
| **Premium** | Always-on instance floor (region-dependent) | No free grant; no cold start; VNET | vCPU‑s + GB‑s while allocated |
| **App Service / Container Apps host** | Per plan SKU | Hosting SKU quotas | Standard App Service / ACA rates |

## 3.4 Sweet spots & first quota blown

| Pattern | Fits | First blow-through | Rough trigger |
|---|---|---|---|
| Small HTTP API on Consumption | Free grant | **GB‑s** before executions if 512 MB–1.5 GB and multi‑second work | 512 MB × 1 s × 800k = 400K GB‑s; 1M free execs ≈ continuous ~0.4 RPS |
| Chatty timer / queue workers | Consumption free | **Execution count** if many small triggers (e.g. 1/s → 2.6M/mo) | ~**1.15 events/s** saturates 1M free execs |
| Always-warm low latency | Premium | **Always-on instance** immediately | Not free-tier friendly |
| Auto-deploys | Free DevOps (5 users) | Storage / ACR (12‑mo free registry has limits) | Image sprawl |
| Sandboxed code on Container Apps | ACA free slice similar to Cloud Run | vCPU‑s / GiB‑s | Same shape as GCP |

Official Consumption example on pricing page: 3M exec × 512 MB × 1 s → ~1.1M billable GB‑s after free → **~$17.6** resource cost + execution overage (at $0.000016/GB‑s).

## 3.5 AI-agent cost traps

- **Storage account** co-created with every Function App — always bills (not in free grant).
- **Timer triggers / polling** — agent health-check every minute × N apps.
- **Flex Always Ready** or **Premium** chosen by scaffolding "for no cold start."
- **Forgotten VMs / SQL / AKS nodes** after free $200 or 12‑mo VM hours end.
- **Egress / bandwidth** for large responses or cross-region replication.
- **Per-test resource groups** never deleted (`az group delete` forgotten).
- Free grants **per subscription**, not per app — many agent-created apps share one pool.

## 3.6 How to check usage / spend

| Method | Command / URL |
|---|---|
| Cost Management (portal) | https://portal.azure.com → Cost Management + Billing |
| Free service usage | [Check free service usage](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/check-free-service-usage) |
| CLI usage | `az consumption usage list --start-date YYYY-MM-DD --end-date YYYY-MM-DD` (preview; may need Cost Management export) |
| Cost Management export | `az costmanagement export create ...` |
| Remaining free credit | Cost Management / subscription overview during free account |

Sources: [az consumption](https://learn.microsoft.com/en-us/cli/azure/consumption), [Get usage data CLI](https://learn.microsoft.com/en-us/azure/cost-management-billing/automate/get-usage-data-azure-cli).

## 3.7 Keyword triggers

`az `, `azure`, `func `, `func start`, `functionapp`, `appservice`, `bicep`, `arm template`, `resource group`, `cosmosdb`, `blob`, `storage account`, `aks`, `containerapps`, `aca `, `staticwebapp`

---

# 4. Agent-pattern comparison (what dies first)

Assume: small web app, chatty DB, auto-deploys, occasional sandboxed runs.

| Failure mode | AWS | GCP | Azure |
|---|---|---|---|
| **#1 silent $ bill** | NAT Gateway ~$33/mo | Min instances / VPC connector | Storage + Premium floor |
| **#1 free-tier exhaust** | Lambda GB‑s or 1M req | Cloud Run **1 GB egress** | Functions **executions** (chatty) or **GB‑s** (heavy) |
| **Forgotten VM/DB** | EC2/RDS 24/7 | e2 + Cloud SQL after trial | B‑series VM after 12 mo / $200 |
| **CI thrash** | S3/ECR + pipeline minutes | Artifact Registry 0.5 GB + Build minutes | ACR + Actions runners elsewhere |
| **Egress cliff** | After **100 GB** (~$0.09/GB class rates) | After **1 GB** Cloud Run NA | Product bandwidth limits vary |

---

# 5. Source index (every major number)

| Claim | URL |
|---|---|
| AWS Free Tier $200 / 6 mo Free plan | https://aws.amazon.com/free/ · https://aws.amazon.com/blogs/aws/aws-free-tier-update-new-customers-can-get-started-and-explore-aws-with-up-to-200-in-credits/ |
| Lambda 1M + 400K GB‑s; $0.20/M; duration examples | https://aws.amazon.com/lambda/pricing/ |
| 100 GB free DTO | https://aws.amazon.com/s3/pricing/ · https://aws.amazon.com/ec2/pricing/on-demand/ |
| NAT $0.045/hr + $0.045/GB (Ohio example) | https://aws.amazon.com/vpc/pricing/ |
| Public IPv4 $0.005/hr | https://aws.amazon.com/vpc/pricing/ |
| GCP $300 / 90 days + Free Tier table | https://docs.cloud.google.com/free/docs/free-cloud-features |
| Cloud Run free + unit prices | https://cloud.google.com/run/pricing · https://cloud.google.com/free |
| Azure $200 / 30 days free account | https://azure.microsoft.com/en-us/free/ |
| Functions free grants + Consumption rates | https://azure.microsoft.com/en-us/pricing/details/functions/ |
| Functions cost model | https://learn.microsoft.com/en-us/azure/azure-functions/functions-consumption-costs |

---

**Practical agent rule of thumb:** Prefer serverless **without VPC/NAT** until you need private network access; set a **$5–$20 budget alert on day one** on every cloud; tear down agent-provisioned resource groups/stacks in the same session that created them.

Rates and free-tier program shapes change; re-check the linked official pages before quoting costs in production decisions.
