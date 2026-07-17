#!/usr/bin/env node
// Shared instruction builder: every host (Claude hooks, Codex, Copilot,
// OpenCode, pi) injects the same text through this one function.
//
// ponytail: inject AGENTS.md (compact rules, ~15 lines), NOT SKILL.md — the
// quota tables would tax every session's context while the PreToolUse hook
// already delivers the right provider's numbers just-in-time. Full tables
// stay in the skill for on-demand reads.

const fs = require('fs');
const path = require('path');

const RULES_PATH = path.join(__dirname, '..', 'AGENTS.md');
const HEADER = 'FRUGAL MODE ACTIVE — cloud cost awareness\n\n';

const FALLBACK =
  HEADER +
  'Metered cloud services (Vercel, Cloudflare, Neon, Railway, Fly.io, E2B, ' +
  'Browserbase, GitHub Actions/Codespaces, AWS/GCP/Azure, Supabase) bill by usage. ' +
  'First touch of one in a session: check or mention current usage. ' +
  'Before creating a paid resource: tell the user in one line. ' +
  'Kill sandboxes and delete test resources when done. ' +
  'Never silently make a spend decision for the user.\n';

function getFrugalInstructions() {
  try {
    const body = fs.readFileSync(RULES_PATH, 'utf8').replace(/^# Frugal\s*/, '');
    return HEADER + body +
      '\nFull quota/plan tables live in the frugal skill (references/providers.md) — read on demand, per-provider reminders arrive as you use billable CLIs.\n';
  } catch {
    return FALLBACK;
  }
}

module.exports = { getFrugalInstructions };
