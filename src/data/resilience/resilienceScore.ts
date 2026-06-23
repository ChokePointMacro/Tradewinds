import type { CountryProduction, ProcessingConcentration, Substitutability } from '@/types';
import { CHOKEPOINTS } from '@/data/geo/chokepoints';
import { processingFor } from '@/data/processing/processingConcentration';
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

export type ResiliencePillarKey =
  | 'concentration'
  | 'jurisdiction'
  | 'processing'
  | 'chokepoint';
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

export interface ProcessingDependency {
  step: string; // the binding midstream step
  layer: 1 | 2 | 3;
  leadingCountry: string;
  sharePct: number; // leading processor's capacity share
  substitutability: Substitutability;
  exportControlled: boolean;
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
  processing: ProcessingDependency | null; // midstream concentration, when known
  disruptedFlowPct: number; // Σ criticality of closed passages, as a % (0–100)
  underDisruption: boolean; // true when ≥1 passage is toggled shut
  dataYear?: number;
}

// Pillar weights (each set sums to 1). Two regimes:
//   • No midstream data → the original three-pillar split (concentration &
//     chokepoint dominate; jurisdiction nuances who the suppliers are).
//   • Midstream data present → processing concentration becomes its own scored
//     axis (Recommendation 1: "refining, not mining, is the chokepoint"). It
//     takes weight from MINE concentration, since a diversified mine with ~90%
//     Chinese separation is far more fragile than the mine score alone implies.
const WEIGHTS_BASE: Record<ResiliencePillarKey, number> = {
  concentration: 0.35,
  jurisdiction: 0.3,
  processing: 0,
  chokepoint: 0.35,
};
const WEIGHTS_WITH_PROCESSING: Record<ResiliencePillarKey, number> = {
  concentration: 0.25,
  jurisdiction: 0.2,
  processing: 0.25,
  chokepoint: 0.3,
};

// How a midstream monopoly's substitutability scales the penalty: a contested
// step that can be designed around (medium/high) hurts less than one with no
// near-term alternative (very_low/low). Multiplies the leading-processor share.
const SUB_FACTOR: Record<Substitutability, number> = {
  very_low: 1.15,
  low: 1.0,
  medium: 0.82,
  high: 0.65,
};

// Processing pillar: 100 − (leading-processor share × substitutability factor),
// with a small extra penalty when the step is under an active export control.
// Higher score = more resilient (diversified / substitutable midstream).
function processingScoreOf(p: ProcessingConcentration): number {
  const controlPenalty = p.exportControlled ? 8 : 0;
  return clamp(100 - p.sharePct * SUB_FACTOR[p.substitutability] - controlPenalty);
}

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
  // Food inputs — MODELED estimates (no free per-commodity transit source).
  wheat: [
    { id: 'suez', criticality: 0.15, note: 'Modeled: Black Sea / Mideast wheat into Asia.' },
    { id: 'babelmandeb', criticality: 0.12, note: 'Modeled: Red Sea routing toward Asia.' },
    { id: 'panama', criticality: 0.08, note: 'Modeled: US Gulf wheat to the Pacific.' },
  ],
  corn: [
    { id: 'panama', criticality: 0.2, note: 'Modeled: US Gulf corn to East Asia.' },
    { id: 'malacca', criticality: 0.1, note: 'Modeled: approach to Chinese / SE-Asian buyers.' },
  ],
  soybeans: [
    { id: 'panama', criticality: 0.22, note: 'Modeled: US Gulf soy to China.' },
    { id: 'malacca', criticality: 0.1, note: 'Modeled: approach to Chinese crushers.' },
  ],
  beef: [
    { id: 'panama', criticality: 0.12, note: 'Modeled: Americas reefer beef to Asia.' },
    { id: 'malacca', criticality: 0.1, note: 'Modeled: approach to East-Asian markets.' },
  ],
  pork: [
    { id: 'panama', criticality: 0.1, note: 'Modeled: Americas reefer pork to Asia.' },
    { id: 'malacca', criticality: 0.1, note: 'Modeled: approach to East-Asian markets.' },
  ],
  fertilizer: [
    { id: 'hormuz', criticality: 0.12, note: 'Modeled: Gulf urea / ammonia exports.' },
    { id: 'suez', criticality: 0.12, note: 'Modeled: Mideast / Black Sea fertilizer to Asia.' },
    { id: 'panama', criticality: 0.1, note: 'Modeled: US Gulf fertilizer flows.' },
  ],
  // Critical minerals — MODELED maritime exposure (most flows are origin- or
  // China-processing-bound through the Indian Ocean / Malacca approaches).
  lithium: [
    { id: 'malacca', criticality: 0.22, note: 'Modeled: Australian spodumene & Chilean brine into Chinese converters.' },
    { id: 'panama', criticality: 0.1, note: 'Modeled: South American brine to the Pacific.' },
  ],
  cobalt: [
    { id: 'malacca', criticality: 0.2, note: 'Modeled: DRC intermediate into Chinese refineries.' },
    { id: 'goodhope', criticality: 0.08, note: 'Modeled: Southern-African routing around the Cape.' },
  ],
  graphite: [
    { id: 'malacca', criticality: 0.18, note: 'Modeled: Chinese & East-African flake into Asian processors.' },
    { id: 'babelmandeb', criticality: 0.06, note: 'Modeled: Red Sea routing toward Europe.' },
  ],
  manganese: [
    { id: 'malacca', criticality: 0.2, note: 'Modeled: South African/Gabon ore into Chinese smelters.' },
    { id: 'goodhope', criticality: 0.1, note: 'Modeled: Cape routing from Southern Africa.' },
  ],
  titanium: [
    { id: 'malacca', criticality: 0.14, note: 'Modeled: ilmenite/sponge into East-Asian processors.' },
    { id: 'taiwan', criticality: 0.06, note: 'Modeled: East-Asian sponge/pigment flows.' },
  ],
  tungsten: [
    { id: 'malacca', criticality: 0.16, note: 'Modeled: Chinese APT/carbide exports into Asia.' },
    { id: 'taiwan', criticality: 0.06, note: 'Modeled: East-Asian routing.' },
  ],
  uranium: [
    { id: 'malacca', criticality: 0.06, note: 'Modeled: containerised U₃O₈ to Asian reactors.' },
    { id: 'babelmandeb', criticality: 0.04, note: 'Modeled: routing toward Europe.' },
  ],
  // Rare earths — China-origin, MODELED.
  re_compounds: [
    { id: 'malacca', criticality: 0.16, note: 'Modeled: Chinese RE compounds into Asian magnet/metal makers.' },
    { id: 'taiwan', criticality: 0.06, note: 'Modeled: East-Asian routing.' },
  ],
  ndfeb_magnets: [
    { id: 'malacca', criticality: 0.18, note: 'Modeled: Chinese magnets (~90%) into Asian/global OEMs.' },
    { id: 'taiwan', criticality: 0.08, note: 'Modeled: East-Asian electronics routing.' },
  ],
  // Semiconductor materials — MODELED (ICs/devices/equipment move by air; no
  // production rows, so no resilience score, so no exposure needed there).
  polysilicon: [
    { id: 'malacca', criticality: 0.16, note: 'Modeled: Chinese polysilicon & Asian wafers.' },
    { id: 'taiwan', criticality: 0.1, note: 'Modeled: wafer flows into Taiwan/Korea fabs.' },
  ],
  gallium: [
    { id: 'malacca', criticality: 0.18, note: 'Modeled: Chinese gallium (~98%) into Asian device makers.' },
    { id: 'taiwan', criticality: 0.08, note: 'Modeled: East-Asian semiconductor routing.' },
  ],
  germanium: [
    { id: 'malacca', criticality: 0.14, note: 'Modeled: Chinese germanium into fibre/optics makers.' },
    { id: 'taiwan', criticality: 0.08, note: 'Modeled: East-Asian routing.' },
  ],
  // Industrial chemicals — MODELED (gas-carrier / chemical-tanker lanes).
  ammonia: [
    { id: 'hormuz', criticality: 0.12, note: 'Modeled: Gulf ammonia exports; no maritime bypass.' },
    { id: 'suez', criticality: 0.1, note: 'Modeled: Mideast/Black Sea ammonia into Europe.' },
    { id: 'panama', criticality: 0.08, note: 'Modeled: US Gulf / Trinidad to the Pacific.' },
  ],
  methanol: [
    { id: 'hormuz', criticality: 0.12, note: 'Modeled: Mideast methanol exports.' },
    { id: 'malacca', criticality: 0.1, note: 'Modeled: into Chinese MTO units.' },
    { id: 'panama', criticality: 0.08, note: 'Modeled: US/Trinidad to the Pacific.' },
  ],
  ethylene: [
    { id: 'malacca', criticality: 0.08, note: 'Modeled: small merchant trade (mostly captive).' },
    { id: 'panama', criticality: 0.06, note: 'Modeled: US Gulf cargoes.' },
  ],
  sulfuric_acid: [
    { id: 'malacca', criticality: 0.1, note: 'Modeled: smelter/Mideast acid into Asia.' },
    { id: 'panama', criticality: 0.08, note: 'Modeled: Americas flows.' },
  ],
  caustic_soda: [
    { id: 'malacca', criticality: 0.12, note: 'Modeled: NE-Asian lye into SE Asia.' },
    { id: 'panama', criticality: 0.08, note: 'Modeled: US Gulf cargoes.' },
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

  // ── Processing pillar (midstream concentration — Recommendation 1) ──
  // Only scored when we have a cited midstream entry; otherwise the score keeps
  // its original three-pillar shape so commodities without a known refining
  // chokepoint (gold, oil…) are unaffected.
  const proc = processingFor(commodityId);
  const W = proc ? WEIGHTS_WITH_PROCESSING : WEIGHTS_BASE;
  const processingScore = proc ? processingScoreOf(proc) : null;

  const processing: ProcessingDependency | null = proc
    ? {
        step: proc.step,
        layer: proc.layer,
        leadingCountry: proc.leadingCountry,
        sharePct: proc.sharePct,
        substitutability: proc.substitutability,
        exportControlled: Boolean(proc.exportControlled),
        note: proc.note,
      }
    : null;

  const pillars: ResiliencePillar[] = [
    {
      key: 'concentration',
      label: 'Mine concentration',
      score: Math.round(concentrationScore),
      weight: W.concentration,
      summary: `Top producer ${topProducerSharePct.toFixed(0)}% of listed supply · HHI ${Math.round(hhi).toLocaleString('en-US')}`,
    },
    {
      key: 'jurisdiction',
      label: 'Jurisdiction risk',
      score: Math.round(jurisdictionScore),
      weight: W.jurisdiction,
      summary: `Production-weighted origin risk ${weightedRisk.toFixed(0)}/100`,
    },
    ...(proc && processingScore !== null
      ? [
          {
            key: 'processing' as const,
            label: 'Processing concentration',
            score: Math.round(processingScore),
            weight: W.processing,
            summary: `${proc.leadingCountry} ~${proc.sharePct}% of ${proc.step.toLowerCase()}${proc.exportControlled ? ' · export-controlled' : ''}`,
          },
        ]
      : []),
    {
      key: 'chokepoint',
      label: 'Chokepoint exposure',
      score: Math.round(chokepointScore),
      weight: W.chokepoint,
      summary:
        chokepoints.length === 0
          ? 'Negligible maritime chokepoint dependence'
          : `${chokepoints.length} critical passage${chokepoints.length > 1 ? 's' : ''}: ${chokepoints
              .map((c) => c.name)
              .join(', ')}`,
    },
  ];

  const score =
    concentrationScore * W.concentration +
    jurisdictionScore * W.jurisdiction +
    (processingScore ?? 0) * W.processing +
    chokepointScore * W.chokepoint;

  return {
    commodityId,
    score: Math.round(score),
    band: bandFor(score),
    pillars,
    producers,
    hhi: Math.round(hhi),
    topProducerSharePct,
    chokepoints,
    processing,
    disruptedFlowPct: Math.round(disruptedFlowPct),
    underDisruption: chokepoints.some((c) => c.closed),
    dataYear: production[0]?.year,
  };
}
