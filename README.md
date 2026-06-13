# Tradewinds — Sourcing Resilience Platform

Interactive commodity supply-chain, routing & pricing tool (MVP: Crude Oil, Gold, Silver).
Built from the v1.0 PRD. Stack: React 18 + Vite + TypeScript + Tailwind · MapLibre GL · Recharts ·
React Query · Supabase · Vercel · PostHog.

## Status: Phase 0 (scaffold & infra)

- Three-tab shell (Route Map / Supply Chain / Rates) running on **mock data** behind the adapter layer.
- MapLibre mounted with free OpenFreeMap tiles; mock great-circle routing with the Hormuz
  no-bypass special case encoded.
- Domain types, tailored per-commodity supply chains, and seed cost parameters.
- Supabase migration + seed SQL (`supabase/`).
- PostHog init (no-ops without a key), `.env.example`, and a CI secret-leak guard.

Live price/routing adapters, the parametric cost roll-up, and the forecast fan arrive in Phases 1–3.

## Quick start

```bash
cp .env.example .env        # mock mode works with no keys
npm install
npm run dev                 # http://localhost:5173
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run typecheck` | TS project typecheck |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run check:secrets` | Fail if a server-only secret leaks into `dist/` (run after build) |

## Data mode

`VITE_DATA_MODE=mock` (default) selects deterministic mock adapters. `live` is reserved for
Phase 1+; until then it falls back to mock with a console warning. Components never call `fetch`
directly — all external data flows through `src/data/adapters` via React Query hooks.

## Supabase

```bash
# with the Supabase CLI and a linked project:
supabase db push                        # apply supabase/migrations
psql "$DATABASE_URL" -f supabase/seed/seed.sql
```

The TypeScript modules under `src/data` are the runtime source of truth in mock mode; the seed
SQL mirrors them for the database.

## Project layout

See the PRD Section 7. Key dirs: `src/tabs` (the three tabs), `src/data/adapters` (mock/live
sources), `src/data/commodities` (tailored chains), `src/data/cost` (parameters), `api/` (Vercel
serverless proxy, Phase 1), `supabase/` (schema + seed).
