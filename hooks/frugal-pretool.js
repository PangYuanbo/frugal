#!/usr/bin/env node
// PreToolUse(Bash) hook: when a command touches a metered cloud provider,
// inject a mode-scaled cost reminder. Once per provider per session; after
// 5 reminders in a day FOR THAT PROVIDER (quotas are per provider, not
// pooled), it still gets a numbers-only brief.
// Never blocks the command, never hangs, fails silent.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { detectProviders, formatReminder, formatAuditReminder } = require('./providers');
const { getDefaultMode } = require('./frugal-config');
const { writeHookOutput } = require('./frugal-runtime');

const DAILY_CAP = 5;

function finish(context) {
  if (context) writeHookOutput('PreToolUse', context);
  process.exit(0);
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

let raw = '';
setTimeout(() => finish(), 1000).unref(); // stdin may never emit 'end' on some hosts
process.stdin.on('error', () => finish());
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw.replace(/^\uFEFF/, ''));
  } catch {
    return finish();
  }
  const command = input && input.tool_input && input.tool_input.command;
  if (!command) return finish();

  const mode = getDefaultMode();
  if (mode === 'off') return finish();

  const hits = detectProviders(command, input);
  if (!hits.length) return finish();

  // ponytail: throttle state lives in tmpdir — the OS cleans it up.
  const sid = String(input.session_id || 'unknown').replace(/[^\w-]/g, '');
  const sessionFile = path.join(os.tmpdir(), 'frugal-' + sid + '.json');
  const dailyFile = path.join(os.tmpdir(), 'frugal-daily.json');

  const today = new Date().toISOString().slice(0, 10);
  let daily = readJson(dailyFile, {});
  if (daily.date !== today || !daily.providers) daily = { date: today, providers: {} };

  let seen = readJson(sessionFile, []);
  if (!Array.isArray(seen)) seen = [];
  const fresh = hits.filter((h) => !seen.includes(h.name));
  if (!fresh.length) return finish();

  for (const h of fresh) daily.providers[h.name] = (daily.providers[h.name] || 0) + 1;
  try { fs.writeFileSync(sessionFile, JSON.stringify(seen.concat(fresh.map((h) => h.name)))); } catch {}
  try { fs.writeFileSync(dailyFile, JSON.stringify(daily)); } catch {}

  // Past a provider's own daily cap, degrade it to quiet (numbers only)
  // instead of going silent — first touch never passes with zero notice.
  // On the reminder that spends the cap, append a billing-audit task: five
  // reminder-worthy touches in one day is heavy enough to go check the bill.
  const lines = fresh
    .map((h) => {
      const n = daily.providers[h.name];
      const line = formatReminder(h, n > DAILY_CAP ? 'quiet' : mode);
      return line && n === DAILY_CAP ? line + '\n' + formatAuditReminder(h) : line;
    })
    .filter(Boolean);
  if (!lines.length) return finish();

  finish(lines.join('\n'));
});
