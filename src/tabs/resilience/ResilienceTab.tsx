import { useMemo } from 'react';
import { useAppState } from '@/app/appStateContext';
import {
  useClosedPassages,
  togglePassage as togglePassageGlobal,
  clearPassages,
} from '@/data/disruption/closedPassages';
import { Card } from '@/components/Card';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { getCommodity } from '@/data/commodities';
import { useProduction } from '@/hooks/useSupply';
import { track } from '@/lib/analytics';
import {
  computeResilienceScore,
  EIA_CHOKEPOINT_COMMODITIES,
  type ResilienceBand,
  type ResiliencePillar,
  type ProducerShare,
  type ChokepointDependency,
  type ProcessingDependency,
} from '@/data/resilience/resilienceScore';
import { LAYER_META } from '@/data/processing/processingConcentration';

// Band → palette (text/bg/border + a hex for bars/gauge).
const BAND_META: Record<
  ResilienceBand,
  { label: string; chip: string; hex: string; track: string }
> = {
  resilient: { label: 'Resilient', chip: 'bg-emerald-100 text-emerald-800 border-emerald-300', hex: '#059669', track: 'bg-emerald-100' },
  moderate: { label: 'Moderate', chip: 'bg-amber-100 text-amber-800 border-amber-300', hex: '#d97706', track: 'bg-amber-100' },
  exposed: { label: 'Exposed', chip: 'bg-orange-100 text-orange-800 border-orange-300', hex: '#ea580c', track: 'bg-orange-100' },
  fragile: { label: 'Fragile', chip: 'bg-red-100 text-red-800 border-red-300', hex: '#dc2626', track: 'bg-red-100' },
};

function scoreHex(score: number): string {
  if (score >= 70) return BAND_META.resilient.hex;
  if (score >= 55) return BAND_META.moderate.hex;
  if (score >= 40) return BAND_META.exposed.hex;
  return BAND_META.fragile.hex;
}

// Origin-risk colour for the concentration bars (low risk = teal → high = red).
function riskHex(risk: number): string {
  if (risk <= 25) return '#0d9488';
  if (risk <= 45) return '#d97706';
  if (risk <= 65) return '#ea580c';
  return '#dc2626';
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded bg-slate-100">
      <div
        className="h-2 rounded"
        style={{ width: `${Math.min(100, Math.max(0, score))}%`, backgroundColor: scoreHex(score) }}
      />
    </div>
  );
}

function PillarRow({ pillar }: { pillar: ResiliencePillar }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-slate-800">{pillar.label}</span>
        <span className="text-sm font-semibold tabular-nums" style={{ color: scoreHex(pillar.score) }}>
          {pillar.score}
          <span className="ml-0.5 text-[11px] font-normal text-slate-400">/100</span>
        </span>
      </div>
      <div className="mt-2">
        <ScoreBar score={pillar.score} />
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500">{pillar.summary}</p>
        <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-400">
          {Math.round(pillar.weight * 100)}% weight
        </span>
      </div>
    </div>
  );
}

function ProducerBars({ producers }: { producers: ProducerShare[] }) {
  const ranked = [...producers].sort((a, b) => b.sharePct - a.sharePct);
  return (
    <ul className="space-y-2">
      {ranked.map((p) => (
        <li key={p.country} className="text-xs">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-slate-700">{p.country}</span>
            <span className="tabular-nums text-slate-500">
              {p.sharePct.toFixed(0)}%
              <span className="ml-1.5 text-[10px] uppercase text-slate-400">risk {p.riskScore}</span>
            </span>
          </div>
          <div className="mt-0.5 h-1.5 w-full rounded bg-slate-100">
            <div
              className="h-1.5 rounded"
              style={{ width: `${Math.min(100, p.sharePct)}%`, backgroundColor: riskHex(p.riskScore), opacity: 0.85 }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ChokepointSimulator({
  chokepoints,
  onToggle,
}: {
  chokepoints: ChokepointDependency[];
  onToggle: (id: string) => void;
}) {
  if (chokepoints.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        Predominantly air-freighted or low-volume — negligible dependence on maritime chokepoints, so
        nothing to simulate.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {chokepoints.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onToggle(c.id)}
            aria-pressed={c.closed}
            className={`w-full rounded-lg border p-2.5 text-left transition ${
              c.closed
                ? 'border-red-400 bg-red-50 ring-1 ring-red-300'
                : 'border-slate-200 bg-white hover:border-teal-400'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-800">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    c.closed ? 'bg-red-500' : 'bg-emerald-400'
                  }`}
                />
                {c.name}
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    c.hasBypass
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : 'border-red-300 bg-red-50 text-red-700'
                  }`}
                >
                  {c.hasBypass ? 'Reroutable' : 'No bypass'}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    c.closed ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {c.closed ? 'Closed' : 'Open'}
                </span>
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">{c.note}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}

const SUB_LABEL: Record<ProcessingDependency['substitutability'], string> = {
  very_low: 'very low',
  low: 'low',
  medium: 'medium',
  high: 'high',
};

// Processing-concentration panel (Recommendation 1): the midstream chokepoint —
// "refining, not mining" — that gold/oil lack but rare earths and gallium live or
// die by. Shows the binding step, the leading processor's share, and the layer.
function ProcessingPanel({ processing }: { processing: ProcessingDependency }) {
  const share = processing.sharePct;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-slate-800">{processing.step}</span>
        <span className="text-sm font-semibold tabular-nums text-red-700">{share}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-100">
        <div
          className="h-2 rounded bg-red-500"
          style={{ width: `${Math.min(100, share)}%`, opacity: 0.85 }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">
        {processing.leadingCountry} controls ~{share}% of this midstream step. Substitutability{' '}
        {SUB_LABEL[processing.substitutability]}
        {processing.exportControlled ? ' · under active export control' : ''}.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {LAYER_META[processing.layer].label}
        </span>
        {processing.exportControlled && (
          <span className="inline-flex items-center rounded border border-red-300 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
            Export-controlled
          </span>
        )}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{processing.note}</p>
    </div>
  );
}

export function ResilienceTab() {
  const { commodityId } = useAppState();
  const commodity = getCommodity(commodityId)!;
  const { data: production, isLoading } = useProduction(commodityId);

  // Disruption simulator — shared, app-wide closed chokepoints (also drives the
  // Route Map route + trade lanes).
  const closed = useClosedPassages();

  const baseline = useMemo(
    () => computeResilienceScore(commodityId, production ?? []),
    [commodityId, production],
  );
  const result = useMemo(
    () => computeResilienceScore(commodityId, production ?? [], closed),
    [commodityId, production, closed],
  );

  const delta = result && baseline ? result.score - baseline.score : 0;

  function togglePassage(id: string) {
    togglePassageGlobal(id);
    track('resilience_disruption_sim', { commodity: commodityId, passage: id });
  }

  return (
    <div className="space-y-4 p-4">
      <Card
        title={`${commodity.name} — sourcing resilience`}
        subtitle="Composite of mine concentration, jurisdiction risk, processing concentration and chokepoint exposure"
        right={<ProvenanceBadge provenance="MODELED" />}
      >
        <p className="text-xs text-slate-500">
          A single 0–100 signal of how exposed this commodity&apos;s supply is to disruption — higher
          is more resilient. It is a model built from the production, jurisdiction and chokepoint data
          elsewhere in the app; it invents no underlying figures, so it is labelled MODELED throughout.
        </p>
      </Card>

      {isLoading && <p className="text-sm text-slate-400">Scoring resilience…</p>}

      {!isLoading && !result && (
        <Card>
          <p className="text-sm text-slate-500">
            Not enough production data to score {commodity.name} resilience yet.
          </p>
        </Card>
      )}

      {result && (
        <>
          {/* Headline gauge + pillar breakdown */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <div className="flex flex-col items-center justify-center py-2 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Resilience score
                </div>
                <div
                  className="mt-1 text-5xl font-bold tabular-nums leading-none"
                  style={{ color: scoreHex(result.score) }}
                >
                  {result.score}
                </div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span
                    className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${BAND_META[result.band].chip}`}
                  >
                    {BAND_META[result.band].label}
                  </span>
                  {result.underDisruption && (
                    <span className="inline-flex items-center rounded border border-red-300 bg-red-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-red-700">
                      {delta} vs {baseline?.score}
                    </span>
                  )}
                </div>
                <div className="mt-3 w-full">
                  <ScoreBar score={result.score} />
                  <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-slate-400">
                    <span>Fragile</span>
                    <span>Resilient</span>
                  </div>
                </div>
                {result.dataYear && (
                  <p className="mt-3 text-[11px] text-slate-400">
                    Based on {result.dataYear} top-producer data
                  </p>
                )}
              </div>
            </Card>

            <Card title="Pillar breakdown" className="lg:col-span-2">
              <div className="grid gap-3 sm:grid-cols-2">
                {result.pillars.map((p) => (
                  <PillarRow key={p.key} pillar={p} />
                ))}
              </div>
            </Card>
          </div>

          {/* Processing chokepoint — the "refining, not mining" axis */}
          {result.processing && (
            <Card
              title="Processing chokepoint"
              subtitle="Midstream concentration — the binding refining/separation step"
              right={<ProvenanceBadge provenance="SOURCED" source="ChokepointMacro report · IEA / USGS" />}
            >
              <ProcessingPanel processing={result.processing} />
            </Card>
          )}

          {/* Drivers */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card
              title="Mine concentration"
              subtitle={`HHI ${result.hhi.toLocaleString('en-US')} · top producer ${result.topProducerSharePct.toFixed(0)}%`}
              right={
                <ProvenanceBadge provenance="SOURCED" source={production?.[0]?.source ?? 'USGS / EIA'} />
              }
            >
              <ProducerBars producers={result.producers} />
              <p className="mt-3 text-[11px] text-slate-400">
                Bars show each origin&apos;s share of listed top-producer supply; colour reflects its
                World Bank WGI jurisdiction-risk score (teal = low → red = high).
              </p>
            </Card>

            <Card
              title="Disruption simulator"
              subtitle="Toggle a chokepoint shut to stress-test the score"
              right={
                result.underDisruption ? (
                  <button
                    type="button"
                    onClick={clearPassages}
                    className="rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50"
                  >
                    Reset
                  </button>
                ) : EIA_CHOKEPOINT_COMMODITIES.has(commodityId) && result.chokepoints.length > 0 ? (
                  <ProvenanceBadge provenance="SOURCED" source="EIA oil-transit flows" />
                ) : (
                  <ProvenanceBadge provenance="MODELED" />
                )
              }
            >
              {result.underDisruption && (
                <div className="mb-3 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <span className="font-semibold">
                    ~{result.disruptedFlowPct}% of seaborne flow disrupted
                  </span>
                  <span className="tabular-nums">
                    score {baseline?.score} → {result.score} ({delta})
                  </span>
                </div>
              )}
              <ChokepointSimulator chokepoints={result.chokepoints} onToggle={togglePassage} />
              <p className="mt-3 text-[11px] text-slate-400">
                Under normal operations a passage carries only its latent risk (0.5 no-bypass / 0.3
                reroutable). Closing it applies the active-closure severity — a full hit (1.0) where
                there is no maritime bypass (Hormuz), or 0.7 for a costly reroute (around the Cape, via
                Sunda/Lombok). The pillar breakdown and overall score above update live.
              </p>
            </Card>
          </div>

          <Card>
            <p className="text-[11px] leading-relaxed text-slate-400">
              <span className="font-semibold text-slate-500">Methodology.</span> For commodities with a
              known midstream chokepoint, Score = 25% mine concentration (100 − HHI/100) + 20%
              jurisdiction (100 − production-weighted origin risk) + 25% processing concentration (100 −
              leading-processor share × substitutability factor − export-control penalty) + 30%
              chokepoint (100 − Σ criticality × passage-severity). Commodities with no concentrated
              refining step keep the original three-pillar split (35/30/35). This operationalises the
              report&apos;s core correction — <em>refining, not mining, is the chokepoint</em>. The
              baseline reflects normal operations (latent passage severity); the disruption simulator
              overlays active closures.
              The country-risk index is sourced from the World Bank Worldwide Governance Indicators
              (risk = 100 − mean of the six WGI governance scores). Chokepoint criticality is grounded
              in EIA World Oil Transit Chokepoints flow data for crude &amp; diesel, and remains a
              modeled estimate for metals. Producer shares derive from USGS Mineral Commodity Summaries
              / EIA production data. Treat the score as a relative comparison across commodities, not an
              absolute risk figure.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
