import type { CountryProduction } from '@/types';
import { CHOKEPOINTS } from '@/data/geo/chokepoints';
import { COUNTRY_RISK, DEFAULT_COUNTRY_RISK } from './countryRisk';

// ─────────────────────────────────────────────────────────────────────────────
// Sourcing Resilience Score — the platform's headline summary metric.
//
// A per-commodity composite (0–100, higher = more resilient) built ENTIRELY from
// data already in the app: production-by-country (concentration + jurisdiction)
// and the maritime chokepoint network (route fragility). The score is a model,
// so it is MODELED by construction — every figure it produces is badged MODELED
// and its inputs are shown transparently in the UI. It does not invent any
// underlying numbers; it only combines existing ones.
//
// Three pillars, each normalised to 0–100 (higher = more resilient):
//   • concentration  — HHI of top producers; diverse supply scores higher.
//   • jurisdiction   — production-weighted country-risk; stable/aligned suppliers
//                       score higher.
//   • chokepoint     — exposure to maritime passages, penalised harder where no
//                       bypass exists (Hormuz). Air-freighted metals score high.
// ─────────────────────────────────────────────────────────────────────────────

export type ResiliencePillarKey = 'concentration' | 'jurisdiction' | 'chokepoint';
export type ResilienceBand = 'fragile' | 'exposed' | 'moderate' | 'resilient';

export interface ProducerShare {
  country: string;
  amount: number;
  sharePct: number; // share of the listed top producers
  riskScore: number; // country-risk 0–100 (higher = riskier)
}

export interface ChokepointDependency {
  id: string;
  name: string;
  criticality: number; // 0–1: share of seaborne flow exposed to this passage
  hasBypass: boolean;
  severity: number; // effective severity applied in the score (see below)
  closed: boolean; // true when toggled shut in the disruption simulator
  note: string;
}

export interface ResiliencePillar {
  key: ResiliencePillarKey;
  label: string;
  score: number; // 0–100, higher = more resilient
  weight: number;
  summary: string;
}

export interface ResilienceScore {
  commodityId: string;
  score: number; // 0–100 overall (weighted mean of pillars)
  band: ResilienceBand;
  pillars: ResiliencePillar[];
  producers: ProducerShare[];
  hhi: number; // 0–10,000 Herfindahl index of top-producer shares
  topProducerSharePct: number;
  chokepoints: ChokepointDependency[];
  disruptedFlowPct: number; // Σ criticality of closed passages, as a % (0–100)
  underDisruption: boolean; // true when ≥1 passage is toggled shut
  dataYear?: number;
}

// Pillar weights (sum to 1). Concentration and chokepoint dominate because they
// are the two failure modes the platform exists to surface; jurisdiction nuances
// who the suppliers are.
const WEIGHTS: Record<ResiliencePillarKey, number> = {
  concentration: 0.35,
  jurisdiction: 0.3,
  chokepoint: 0.35,
};

// Country-risk index is now SOURCED from the World Bank WGI (see countryRisk.ts):
// risk = 100 − mean WGI governance score. The composite resilience SCORE remains
// MODELED, but this jurisdiction input is no longer a guess.

// Per-commodity maritime chokepoint dependence. `criticality` is the share of
// seaborne flow that transits the passage; the bypass-derived severity scales
// how damaging a closure is. For OIL (crude & diesel) the weights are grounded in
// EIA "World Oil Transit Chokepoints" total-petroleum-liquids flows, 2023 Mb/d:
// Malacca 23.7 · Hormuz 21.0 · Suez+SUMED 9.2 · Bab-el-Mandeb 8.8 · Panama 0.9
// (eia.gov/international/analysis/special-topics/World_Oil_Transit_Chokepoints).
// Metals have no free per-commodity transit source, so their weights remain
// MODELED estimates. Gold, silver and palladium move mostly by air / in low
// volume → negligible maritime exposure (empty/small list, not fabricated).
const CHOKEPOINT_EXPOSURE: Record<string, { id: string; criticality: number; note: string }[]> = {
  // crude_oil — EIA-derived (Malacca & Hormuz are the two largest oil chokepoints)
  crude_oil: [
    { id: 'malacca', criticality: 0.3, note: 'EIA: ~23.7 Mb/d oil — Mideast/Atlantic crude into East Asia.' },
    { id: 'hormuz', criticality: 0.3, note: 'EIA: ~21 Mb/d oil — Gulf crude exports; no maritime bypass.' },
    { id: 'babelmandeb', criticality: 0.1, note: 'EIA: ~8.8 Mb/d oil — Red Sea routing toward Suez/Europe.' },
  ],
  // diesel — EIA-derived (refined-product flows on the same lanes)
  diesel: [
    { id: 'malacca', criticality: 0.18, note: 'EIA: Asian refinery distillate flows.' },
    { id: 'suez', criticality: 0.15, note: 'EIA: ~9.2 Mb/d oil — Mideast/India distillate into Europe.' },
    { id: 'hormuz', criticality: 0.15, note: 'EIA: Gulf refinery exports.' },
  ],
  // metals — MODELED estimates (no free per-commodity transit dataset)
  copper: [
    { id: 'panama', criticality: 0.18, note: 'Modeled: west-coast Americas concentrate to Atlantic/Asia.' },
    { id: 'malacca', criticality: 0.12, note: 'Modeled: concentrate into Chinese smelters.' },
  ],
  nickel: [{ id: 'malacca', criticality: 0.32, note: 'Modeled: Indonesian/Philippine ore & NPI into China.' }],
  silver: [
    { id: 'malacca', criticality: 0.06, note: 'Modeled: some industrial flows into Asia.' },
    { id: 'panama', criticality: 0.05, note: 'Modeled: Latin American flows.' },
  ],
  gold: [],
  palladium: [],
};

// Commodities whose chokepoint weights are grounded in EIA transit data (vs modeled).
export const EIA_CHOKEPOINT_COMMODITIES = new Set(['crude_oil', 'diesel']);

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

function bandFor(score: number): ResilienceBand {
  if (score >= 70) return 'resilient';
  if (score >= 55) return 'moderate';
  if (score >= 40) return 'exposed';
  return 'fragile';
}

// A passage's steady-state (latent) severity under NORMAL operations: it captures
// structural vulnerability while the passage is open. A no-bypass passage (Hormuz
// pipeline-only, Gibraltar none) carries more latent risk than a reroutable one,
// but neither is a full hit in normal times — that is what the simulator is for.
function severityOf(bypass: string | undefined): number {
  if (!bypass || bypass === 'none' || bypass === 'limited_pipeline_only') return 0.5;
  return 0.3;
}

// Severity under an ACTIVE closure (disruption simulator). A no-bypass passage is
// a total loss (1.0); a reroutable one still delivers via a costly detour, so it
// bites hard (0.7) but is not a full loss. Both exceed their latent severity, so
// closing any dependent passage always lowers the score.
function closedSeverityOf(bypass: string | undefined): number {
  if (!bypass || bypass === 'none' || bypass === 'limited_pipeline_only') return 1;
  return 0.7;
}

/**
 * Compute the MODELED sourcing-resilience score for a commodity from its
 * top-producer breakdown. Returns null when no production rows are available
 * (we never fabricate a score from nothing).
 *
 * Pass `closedPassageIds` (chokepoint ids) to stress-test the score under a
 * simulated disruption: any of the commodity's dependent passages that are
 * closed apply their active-closure severity instead of the steady-state one.
 */
export function computeResilienceScore(
  commodityId: string,
  production: CountryProduction[],
  closedPassageIds: string[] = [],
): ResilienceScore | null {
  if (production.length === 0) return null;

  const total = production.reduce((s, p) => s + p.amount, 0);
  if (total <= 0) return null;

  // ── Producer shares + per-origin risk ──
  const producers: ProducerShare[] = production.map((p) => ({
    country: p.country,
    amount: p.amount,
    sharePct: (p.amount / total) * 100,
    riskScore: COUNTRY_RISK[p.country] ?? DEFAULT_COUNTRY_RISK,
  }));

  // ── Concentration pillar (HHI of listed top producers) ──
  const hhi = producers.reduce((s, p) => s + p.sharePct * p.sharePct, 0);
  const topProducerSharePct = Math.max(...producers.map((p) => p.sharePct));
  const concentrationScore = clamp(100 - hhi / 100);

  // ── Jurisdiction pillar (share-weighted country risk) ──
  const weightedRisk = producers.reduce((s, p) => s + (p.sharePct / 100) * p.riskScore, 0);
  const jurisdictionScore = clamp(100 - weightedRisk);

  // ── Chokepoint pillar (maritime passage exposure) ──
  const closedSet = new Set(closedPassageIds);
  const deps = CHOKEPOINT_EXPOSURE[commodityId] ?? [];
  const chokepoints: ChokepointDependency[] = deps.map((d) => {
    const cp = CHOKEPOINTS.find((c) => c.id === d.id);
    const closed = closedSet.has(d.id);
    const severity = closed ? closedSeverityOf(cp?.bypass) : severityOf(cp?.bypass);
    const noBypass = !cp?.bypass || cp.bypass === 'none' || cp.bypass === 'limited_pipeline_only';
    return {
      id: d.id,
      name: cp?.name ?? d.id,
      criticality: d.criticality,
      hasBypass: !noBypass,
      severity,
      closed,
      note: d.note,
    };
  });
  const exposure = chokepoints.reduce((s, c) => s + c.criticality * c.severity * 100, 0);
  const chokepointScore = clamp(100 - exposure);
  const disruptedFlowPct = clamp(
    chokepoints.filter((c) => c.closed).reduce((s, c) => s + c.criticality * 100, 0),
  );

  const pillars: ResiliencePillar[] = [
    {
      key: 'concentration',
      label: 'Supplier concentration',
      score: Math.round(concentrationScore),
      weight: WEIGHTS.concentration,
      summary: `Top producer ${topProducerSharePct.toFixed(0)}% of listed supply · HHI ${Math.round(hhi).toLocaleString('en-US')}`,
    },
    {
      key: 'jurisdiction',
      label: 'Jurisdiction risk',
      score: Math.round(jurisdictionScore),
      weight: WEIGHTS.jurisdiction,
      summary: `Production-weighted origin risk ${weightedRisk.toFixed(0)}/100`,
    },
    {
      key: 'chokepoint',
      label: 'Chokepoint exposure',
      score: Math.round(chokepointScore),
      weight: WEIGHTS.chokepoint,
      summary:
        chokepoints.length === 0
          ? 'Negligible maritime chokepoint dependence'
          : `${chokepoints.length} critical passage${chokepoints.length > 1 ? 's' : ''}: ${chokepoints
              .map((c) => c.name)
              .join(', ')}`,
    },
  ];

  const score =
    concentrationScore * WEIGHTS.concentration +
    jurisdictionScore * WEIGHTS.jurisdiction +
    chokepointScore * WEIGHTS.chokepoint;

  return {
    commodityId,
    score: Math.round(score),
    band: bandFor(score),
    pillars,
    producers,
    hhi: Math.round(hhi),
    topProducerSharePct,
    chokepoints,
    disruptedFlowPct: Math.round(disruptedFlowPct),
    underDisruption: chokepoints.some((c) => c.closed),
    dataYear: production[0]?.year,
  };
}
