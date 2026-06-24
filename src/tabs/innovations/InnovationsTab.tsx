import { useMemo, useState } from 'react';
import { Card } from '@/components/Card';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import {
  VENTURES,
  CATEGORY_META,
  STAGE_META,
  disclosedFunding,
} from '@/data/innovations/innovations';
import { fmtUsdB } from '@/lib/format';
import { track } from '@/lib/analytics';
import type {
  InnovationVenture,
  VentureCategory,
  VentureStage,
  FundingKind,
} from '@/types';

const STAGE_AXIS: VentureStage[] = [
  'research',
  'pilot',
  'demo',
  'construction',
  'early_commercial',
  'commercial',
];

const FUNDING_META: Record<FundingKind, { label: string; chip: string }> = {
  equity: { label: 'Equity', chip: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  debt: { label: 'Debt', chip: 'bg-rose-100 text-rose-700 border-rose-300' },
  government: { label: 'Gov’t', chip: 'bg-blue-100 text-blue-700 border-blue-300' },
  offtake: { label: 'Offtake', chip: 'bg-teal-100 text-teal-700 border-teal-300' },
  grant: { label: 'Grant', chip: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
};

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${className}`}>
      {children}
    </span>
  );
}

// 6-stop progress rail across the venture lifecycle.
function StageRail({ stage, color }: { stage: VentureStage; color: string }) {
  const idx = STAGE_META[stage].rank;
  return (
    <div className="relative py-2">
      <div className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-slate-200" style={{ left: '8%', right: '8%' }} aria-hidden />
      <div className="absolute top-1/2 h-0.5 -translate-y-1/2" style={{ left: '8%', width: `${(idx / (STAGE_AXIS.length - 1)) * 84}%`, backgroundColor: color }} aria-hidden />
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${STAGE_AXIS.length}, 1fr)` }}>
        {STAGE_AXIS.map((s, i) => {
          const reached = i <= idx;
          const current = i === idx;
          return (
            <span key={s} className="flex justify-center">
              <span
                className="rounded-full border-2"
                style={{
                  height: current ? 13 : 8,
                  width: current ? 13 : 8,
                  backgroundColor: reached ? color : '#fff',
                  borderColor: reached ? color : '#cbd5e1',
                  boxShadow: current ? `0 0 0 3px ${color}22` : undefined,
                }}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}

function VentureCard({ v }: { v: InnovationVenture }) {
  const cat = CATEGORY_META[v.category];
  const disclosed = disclosedFunding(v);
  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-900">{v.company}</span>
            {v.ticker && <span className="text-[10px] font-medium text-slate-400">{v.ticker}</span>}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">{v.name}</div>
        </div>
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cat.dot }} aria-hidden />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Chip className={cat.chip}>{cat.label}</Chip>
        <Chip className="border-slate-200 bg-slate-50 text-slate-600">{STAGE_META[v.stage].label}</Chip>
        {v.advancementRank && <Chip className="border-teal-300 bg-teal-50 text-teal-700">#{v.advancementRank}</Chip>}
      </div>

      <p className="mt-2 text-xs text-slate-600">{v.thesis}</p>

      <div className="mt-2.5">
        <StageRail stage={v.stage} color={cat.dot} />
      </div>

      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
        <div>
          <div className="font-semibold uppercase tracking-wide text-slate-400">Location</div>
          <div className="text-slate-600">{v.location ? `${v.location}` : v.country}</div>
        </div>
        <div>
          <div className="font-semibold uppercase tracking-wide text-slate-400">Capacity</div>
          <div className="text-slate-600">{v.capacity ?? '—'}</div>
        </div>
      </div>

      <div className="mt-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Ownership</div>
        <p className="text-[11px] text-slate-600">{v.ownership}</p>
      </div>

      {/* Financing */}
      <div className="mt-2.5 border-t border-slate-100 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Financing</span>
          {disclosed > 0 && (
            <span className="text-[11px] font-semibold tabular-nums text-slate-700">{fmtUsdB(disclosed)} disclosed</span>
          )}
        </div>
        <ul className="mt-1.5 space-y-1">
          {v.funding.map((f, i) => (
            <li key={`${f.label}-${i}`} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="flex min-w-0 items-center gap-1.5">
                <Chip className={FUNDING_META[f.kind].chip}>{FUNDING_META[f.kind].label}</Chip>
                <span className="truncate text-slate-600">{f.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-slate-500">
                {f.amountUsdB !== undefined ? fmtUsdB(f.amountUsdB) : <span className="text-slate-400">n/d</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Updates */}
      <div className="mt-2.5 border-t border-slate-100 pt-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Progress updates</div>
        <ul className="mt-1.5 space-y-1.5">
          {v.updates.map((u, i) => (
            <li key={i} className="flex gap-2 text-[11px]">
              <span className="shrink-0 font-semibold tabular-nums text-slate-500">{u.dateISO}</span>
              <span className="text-slate-600">{u.note}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-2 pt-1">
        <ProvenanceBadge provenance="SOURCED" source={v.source} />
      </div>
    </div>
  );
}

type Filter = 'all' | VentureCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  ...(Object.keys(CATEGORY_META) as VentureCategory[]).map((c) => ({ id: c, label: CATEGORY_META[c].label })),
];

export function InnovationsTab() {
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: VENTURES.length };
    for (const v of VENTURES) c[v.category] = (c[v.category] ?? 0) + 1;
    return c;
  }, []);

  const shown = useMemo(() => {
    const list = filter === 'all' ? VENTURES : VENTURES.filter((v) => v.category === filter);
    return [...list].sort((a, b) => STAGE_META[b.stage].rank - STAGE_META[a.stage].rank);
  }, [filter]);

  const totalDisclosed = useMemo(() => shown.reduce((s, v) => s + disclosedFunding(v), 0), [shown]);

  return (
    <div className="space-y-4 p-4">
      <Card
        title="Innovations & ventures — breaking the chokepoints"
        subtitle="The companies racing to onshore separation, magnets, HALEU, batteries and recycling — stage, ownership, financing, milestones"
        right={<ProvenanceBadge provenance="SOURCED" source="ChokepointMacro reports + disclosures" />}
      >
        <p className="text-xs text-slate-500">
          A tracker of the flagship projects targeting the report&apos;s highest-leverage advancements —
          rare-earth separation and magnet-making, HALEU enrichment and the SMRs that need it, sodium-ion
          batteries, and recycling. Each card shows lifecycle stage, who owns and backs it, the financing
          raised (equity / debt / government / offtake), and dated progress updates. Where a deal value
          isn&apos;t disclosed it is marked <span className="font-semibold">n/d</span> rather than estimated.
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const active = f.id === filter;
            const n = counts[f.id] ?? 0;
            if (f.id !== 'all' && n === 0) return null;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFilter(f.id);
                  track('innovations_filter', { category: f.id });
                }}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  active
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {f.label} <span className="tabular-nums opacity-60">{n}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
          <span>
            <span className="font-semibold tabular-nums text-slate-800">{shown.length}</span> ventures
          </span>
          <span>
            <span className="font-semibold tabular-nums text-slate-800">{fmtUsdB(totalDisclosed)}</span> disclosed financing
          </span>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((v) => (
          <VentureCard key={v.id} v={v} />
        ))}
      </div>

      <Card>
        <p className="text-[11px] leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-500">Note.</span> Stage, capacity and milestone facts
          are sourced to the ChokepointMacro briefings and each company&apos;s public disclosures.
          Financing figures are point-in-time public deal values and should be re-verified against primary
          filings before any investment use; undisclosed amounts are shown as <span className="font-semibold">n/d</span>.
          This is a research tracker, not investment advice.
        </p>
      </Card>
    </div>
  );
}
