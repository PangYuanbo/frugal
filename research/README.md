# Research archive

Raw output of the 2026-07-17 pricing research that produced
[`skills/frugal/references/providers.md`](../skills/frugal/references/providers.md)
and the hint lines in [`hooks/providers.js`](../hooks/providers.js).

Method: 30 agents — for each of 10 providers, two independent engines ran the
same research brief in parallel (**Engine A**: Claude subagent with web
search; **Engine B**: grok CLI headless with web search), then a merge agent
cross-checked the two reports, resolving number conflicts in favor of
official pricing pages.

Per provider: `<provider>.md` holds the merged factsheet (JSON) plus both raw
engine reports with their source URLs. `factsheets.json` is the merged data
for all 10, machine-readable.

| File | Provider |
|---|---|
| [vercel.md](vercel.md) | Vercel |
| [cloudflare.md](cloudflare.md) | Cloudflare (Workers/R2/KV/D1/DO/Pages) |
| [neon.md](neon.md) | Neon |
| [railway.md](railway.md) | Railway |
| [flyio.md](flyio.md) | Fly.io |
| [e2b.md](e2b.md) | E2B |
| [browserbase.md](browserbase.md) | Browserbase |
| [github.md](github.md) | GitHub (Actions/Codespaces/Packages/LFS) |
| [supabase.md](supabase.md) | Supabase |
| [hyperscalers.md](hyperscalers.md) | AWS / GCP / Azure (agent-relevant slice) |

Pricing rots. When re-verifying a number, start from the source URLs in the
engine reports, not from the archived numbers themselves.
