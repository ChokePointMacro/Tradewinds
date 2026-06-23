import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppState } from '@/app/appStateContext';
import { Card } from '@/components/Card';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { getCommodity } from '@/data/commodities';
import {
  TECHNOLOGIES,
  DEMAND_WAVES,
  technologiesForCommodity,
} from '@/data/technology/technologies';
import { criticalityCurve, criticalityBand } from '@/data/criticality/criticality';
import { LAYER_META } from '@/data/processing/processingConcentration';
import { track } from '@/lib/analytics';
import type {
  DemandWave,
  GapRisk,
  Substitutability,
  Technology,
  TechMaturity,
} from '@/types';

// ── Tag palettes ────────────────────────────────────────────────────────────
const SUB_META: Record<Substitutability, { label: string; chip: string }> = {
  very_low: { label: 'Sub: very low', chip: 'bg-red-100 text-red-800 border-red-300' },
  low: { label: 'Sub: low', chip: 'bg-orange-100 text-orange-800 border-orange-300' },
  medium: { label: 'Sub: medium', chip: 'bg-amber-100 text-amber-800 border-amber-300' },
  high: { label: 'Sub: high', chip: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
};
const GAP_META: Record<GapRisk, { label: string; chip: string }> = {
  severe: { label: 'Gap: severe', chip: 'bg-red-100 text-red-800 border-red-300' },
  high: { label: 'Gap: high', chip: 'bg-orange-100 text-orange-800 border-orange-300' },
  medium: { label: 'Gap: medium', chip: 'bg-amber-100 text-amber-800 border-amber-300' },
  low: { label: 'Gap: low', chip: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
};
const MATURITY_META: Record<TechMaturity, string> = {
  rd: 'R&D',
  demo: 'Demo scale',
  pilot: 'Pilot',
  early_commercial: 'Early commercial',
  mature_capacity_short: 'Mature · capacity-short',
};

const CRIT_HEX: Record<string, string> = {
  severe: '#dc2626',
  high: '#ea580c',
  elevated: '#d97706',
  low: '#059669',
};

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}

// ── Criticality forward curve (Recommendation 4) ──────────────────────────────
function CriticalityCurveCard({ commodityId }: { commodityId: string }) {
  const commodity = getCommodity(commodityId);
  const curve = useMemo(() => criticalityCurve(commodityId), [commodityId]);

  if (!commodity) return null;
  if (!curve) {
    return (
      <Card
        title="Criticality forward curve"
        subtitle={`${commodity.name} has no modelled midstream chokepoint`}
        right={<ProvenanceBadge provenance="MODELED" />}
      >
        <p className="text-xs text-slate-500">
          This view models how a contested mineral&apos;s criticality bends over time as substitution,
          recycling and diversification mature. {commodity.name} carries no concentrated midstream step
          in the register, so there is nothing to phase down — pick a critical mineral, rare earth or
          uranium to see the curve.
        </p>
      </Card>
    );
  }

  const drop = curve.base - curve.end;
  const baseBand = criticalityBand(curve.base);
  const endBand = criticalityBand(curve.end);

  return (
    <Card
      title={`${commodity.name} — criticality forward curve`}
      subtitle="Static 2026 snapshot → 2035, bent down by substitution & recycling readiness"
      right={<ProvenanceBadge provenance="MODELED" source="concentration × tech-readiness" />}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={curve.curve} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <ReferenceLine y={curve.base} stroke="#cbd5e1" strokeDasharray="4 4" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(v: number) => [`${v}/100`, 'Criticality']}
              />
              <Line
                type="monotone"
                dataKey="criticality"
                stroke={CRIT_HEX[endBand]}
                strokeWidth={2.5}
                dot={{ r: 3, fill: CRIT_HEX[endBand] }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center gap-3">
          <div className="flex items-baseline justify-between rounded-lg border border-slate-200 px-3 py-2">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">2026</span>
            <span className="text-xl font-bold tabular-nums" style={{ color: CRIT_HEX[baseBand] }}>
              {curve.base}
            </span>
          </div>
          <div className="flex items-baseline justify-between rounded-lg border border-slate-200 px-3 py-2">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">2035</span>
            <span className="text-xl font-bold tabular-nums" style={{ color: CRIT_HEX[endBand] }}>
              {curve.end}
            </span>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
            <span className="text-[11px] text-slate-500">
              {drop > 0 ? (
                <>
                  <span className="font-semibold text-emerald-700 tabular-nums">−{drop}</span> as levers
                  mature
                </>
              ) : (
                'No near-term substitution lever'
              )}
            </span>
          </div>
        </div>
      </div>

      {curve.modifiers.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Tech-readiness modifiers
          </div>
          <ul className="mt-2 space-y-1.5">
            {curve.modifiers.map((m) => (
              <li
                key={m.driver}
                className="flex items-center justify-between gap-3 rounded border border-slate-100 bg-white px-2.5 py-1.5 text-xs"
              >
                <span className="min-w-0 truncate text-slate-700">
                  {m.advancementRank && (
                    <span className="mr-1.5 rounded bg-slate-100 px-1 text-[10px] font-semibold text-slate-500">
                      #{m.advancementRank}
                    </span>
                  )}
                  {m.driver}
                </span>
                <span className="shrink-0 tabular-nums text-slate-400">
                  {m.startYear}–{m.fullYear} · <span className="text-emerald-700">−{m.maxDeltaPct}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
        Base criticality = 0.45 × leading-processor share + substitutability + 2035-gap + export-control
        penalty (from the processing-concentration register, SOURCED to the report / IEA / USGS). The
        forward path is a MODELED scenario: each substitution / recycling / diversification lever ramps
        linearly from its start year to full effect, lowering criticality on the report&apos;s timeline.
      </p>
    </Card>
  );
}

// ── Technology card with its bill of materials ────────────────────────────────
function TechCard({
  tech,
  highlightCommodity,
}: {
  tech: Technology;
  highlightCommodity: string;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-900">{tech.name}</span>
            {tech.advancementRank && (
              <Chip className="border-teal-300 bg-teal-50 text-teal-700">#{tech.advancementRank}</Chip>
            )}
            {tech.isSubstitution && (
              <Chip className="border-emerald-300 bg-emerald-50 text-emerald-700">Substitution lever</Chip>
            )}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">{tech.sector}</div>
        </div>
        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
          {tech.scaleWindow}
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-600">{tech.thesis}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Chip className="border-slate-200 bg-slate-50 text-slate-500">{MATURITY_META[tech.maturity]}</Chip>
        {tech.waves.map((w) => (
          <Chip key={w} className="border-indigo-200 bg-indigo-50 text-indigo-700">
            {DEMAND_WAVES[w].short}
          </Chip>
        ))}
      </div>

      {tech.relieves && (
        <p className="mt-2 text-[11px] text-slate-400">
          Relieves: <span className="text-slate-600">{tech.relieves}</span>
        </p>
      )}

      {/* Bill of materials */}
      <div className="mt-3 border-t border-slate-100 pt-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Mineral → processing dependency
        </div>
        <ul className="mt-1.5 space-y-1.5">
          {tech.bom.map((b, i) => {
            const hit = b.commodityId && b.commodityId === highlightCommodity;
            return (
              <li
                key={`${b.mineral}-${i}`}
                className={`rounded border px-2 py-1.5 ${
                  hit ? 'border-teal-300 bg-teal-50' : 'border-slate-100 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800">{b.mineral}</span>
                  <span className="text-[10px] text-slate-400">{b.concentration}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {b.role} · <span className="italic">{b.processingStep}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Chip className={SUB_META[b.substitutability].chip}>{SUB_META[b.substitutability].label}</Chip>
                  <Chip className={GAP_META[b.gap2035].chip}>{GAP_META[b.gap2035].label}</Chip>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-2 flex items-center gap-2 pt-1">
        <ProvenanceBadge provenance="SOURCED" source={tech.source} />
        <a
          href={tech.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-medium text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-800"
        >
          source ↗
        </a>
      </div>
    </div>
  );
}

type Filter = 'all' | DemandWave;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  ...(Object.keys(DEMAND_WAVES) as DemandWave[]).map((w) => ({ id: w, label: DEMAND_WAVES[w].short })),
];

export function TechnologyTab() {
  const { commodityId } = useAppState();
  const commodity = getCommodity(commodityId)!;
  const [filter, setFilter] = useState<Filter>('all');

  const linked = useMemo(() => technologiesForCommodity(commodityId), [commodityId]);
  const linkedIds = useMemo(() => new Set(linked.map((t) => t.id)), [linked]);

  const shown = useMemo(() => {
    const list = filter === 'all' ? TECHNOLOGIES : TECHNOLOGIES.filter((t) => t.waves.includes(filter));
    // Surface technologies that pull on the selected commodity first.
    return [...list].sort((a, b) => {
      const aHit = linkedIds.has(a.id) ? 0 : 1;
      const bHit = linkedIds.has(b.id) ? 0 : 1;
      if (aHit !== bHit) return aHit - bHit;
      return (a.advancementRank ?? 99) - (b.advancementRank ?? 99);
    });
  }, [filter, linkedIds]);

  return (
    <div className="space-y-4 p-4">
      <Card
        title="Technology → Mineral → Processing"
        subtitle="A demand-driven lens: if a technology scales, which choke points tighten?"
        right={<ProvenanceBadge provenance="SOURCED" source="ChokepointMacro report · IEA / USGS" />}
      >
        <p className="text-xs text-slate-500">
          Each emerging demand-driver technology is mapped to the minerals — and the specific midstream
          processing steps — it depends on, tagged with concentration, substitutability and the 2035
          gap. This turns the static report into a queryable risk tool. Technologies that pull on{' '}
          <span className="font-semibold text-slate-700">{commodity.name}</span> (the selected
          commodity) are highlighted and sorted to the top.
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const active = f.id === filter;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFilter(f.id);
                  track('technology_filter', { wave: f.id });
                }}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  active
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </Card>

      <CriticalityCurveCard commodityId={commodityId} />

      {linked.length > 0 && (
        <Card>
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">{linked.length}</span> mapped technolog
            {linked.length === 1 ? 'y' : 'ies'} pull on{' '}
            <span className="font-semibold text-slate-800">{commodity.name}</span>:{' '}
            {linked.map((t) => t.name).join(', ')}.
          </p>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((t) => (
          <TechCard key={t.id} tech={t} highlightCommodity={commodityId} />
        ))}
      </div>

      <Card>
        <p className="text-[11px] leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-500">Layers.</span> The report stacks three
          chokepoint layers: {LAYER_META[1].label.replace('Layer 1 — ', '1) ')};{' '}
          {LAYER_META[2].label.replace('Layer 2 — ', '2) ')};{' '}
          {LAYER_META[3].label.replace('Layer 3 — ', '3) ')}. A diversified mine with no separation
          still ships ore to China; a permitted data center with no transformer cannot energize; a
          licensed SMR with no HALEU cannot fuel. Bill-of-materials figures are the report&apos;s
          synthesis of IEA / USGS data — analytical judgments to re-verify against primary sources.
        </p>
      </Card>
    </div>
  );
}
