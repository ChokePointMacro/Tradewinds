#!/usr/bin/env node
// CI guardrail (PRD §8, §23): fail if a server-only secret name appears in the
// built client bundle. Run AFTER `vite build` over dist/.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';

// Server-only identifiers that must never be referenced by client code.
const FORBIDDEN = [
  'SERVICE_ROLE',
  'PRICE_API_KEY',
  'COMTRADE_API_KEY',
  'CLERK_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
];

if (!existsSync(DIST)) {
  console.error(`[check-secrets] ${DIST}/ not found — run "npm run build" first.`);
  process.exit(1);
}

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) files.push(...walk(p));
    else files.push(p);
  }
  return files;
}

const textExt = /\.(js|mjs|cjs|css|html|map|json|txt)$/i;
const offenders = [];

for (const file of walk(DIST)) {
  if (!textExt.test(file)) continue;
  const content = readFileSync(file, 'utf8');
  for (const token of FORBIDDEN) {
    if (content.includes(token)) offenders.push({ file, token });
  }
}

if (offenders.length > 0) {
  console.error('[check-secrets] FAIL — server-only identifiers found in client bundle:');
  for (const o of offenders) console.error(`  ${o.file}: ${o.token}`);
  process.exit(1);
}

console.log('[check-secrets] OK — no server-only secrets in client bundle.');
