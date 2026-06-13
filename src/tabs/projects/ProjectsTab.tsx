import { useMemo, useState } from 'react';
import { Card } from '@/components/Card';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { useEnergyProjects } from '@/hooks/useProjects';
import { track } from '@/lib/analytics';
import type { EnergyProject, EnergyProjectType, ProjectStatus } from '@/types';

const TYPE_META: Record<EnergyProjectType, { label: string; chip: string; dot: string }> = {
  nuclear: { label: 'Nuclear', chip: 'bg-violet-100 text-violet-800 border-violet-300', dot: '#7c3aed' },
  data_center: { label: 'Data center', chip: 'bg-indigo-100 text-indigo-800 border-indigo-300', dot: '#4f46e5' },
  solar: { label: 'Solar', chip: 'bg-amber-100 text-amber-800 border-amber-300', dot: '#d97706' },
  wind: { label: 'Wind', chip: 'bg-sky-100 text-sky-800 border-sky-300', dot: '#0284c7' },
  storage: { label: 'Storage', chip: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: '#059669' },
  geothermal: { label: 'Geothermal', chip: 'bg-orange-100 text-orange-800 border-orange-300', dot: '#ea580c' },
  gas: { label: 'Gas', chip: 'bg-slate-200 text-slate-700 border-slate-300', dot: '#475569' },
};

const STATUS_META: Record<ProjectStatus, { label: string; chip: string }> = {
  announced: { label: 'Announced', chip: 'bg-slate-100 text-slate-600 border-slate-300' },
  permitting: { label: 'Permitting', chip: 'bg-amber-100 text-amber-800 border-amber-300' },
  under_construction: { label: 'Under construction', chip: 'bg-blue-100 text-blue-800 border-blue-300' },
  partially_operational: { label: 'Partially operational', chip: 'bg-teal-100 text-teal-800 border-teal-300' },
  operational: { label: 'Operational', chip: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
};

// Render order: live first, then build pipeline, then earliest-stage.
const STATUS_RANK: Record<ProjectStatus, number> = {
  operational: 0,
  partially_operational: 1,
  under_construction: 2,
  permitting: 3,
  announced: 4,
};

type Filter = 'all' | EnergyProjectType;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'nuclear', label: 'Nuclear' },
  { id: 'data_center', label: 'Data centers' },
  { id: 'solar', label: 'Solar' },
  { id: 'wind', label: 'Wind' },
  { id: 'storage', label: 'Storage' },
  { id: 'geothermal', label: 'Geothermal' },
  { id: 'gas', label: 'Gas' },
];

function fmtCapacity(mw: number): string {
  if (mw >= 1000) {
    const gw = mw / 1000;
    return `${gw.toLocaleString('en-US', { maximumFractionDigits: gw % 1 === 0 ? 0 : 1 })} GW`;
  }
  return `${mw.toLocaleString('en-US')} MW`;
}

function fmtUsdB(n: number): string {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: n < 10 ? 1 : 0 })}B`;
}

function TypeChip({ type }: { type: EnergyProjectType }) {
  const m = TYPE_META[type];
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${m.chip}`}>
      {m.label}
    </span>
  );
}

function StatusChip({ status }: { status: ProjectStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${m.chip}`}>
      {m.label}
    </span>
  );
}

function ProjectDetail({ project, onClose }: { project: EnergyProject; onClose: () => void }) {
  const p = project;
  return (
    <Card
      title={
        <span className="flex flex-wrap items-center gap-2">
          {p.name} <TypeChip type={p.type} /> <StatusChip status={p.status} />
        </span>
      }
      subtitle={`${p.developer} · ${p.location ? `${p.location}, ` : ''}${p.state}`}
      right={
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50"
          aria-label="Close detail"
        >
          Close ✕
        </button>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Capacity / power">
          {p.capacityMw !== undefined ? (
            <span className="text-lg font-semibold tabular-nums text-slate-900">{fmtCapacity(p.capacityMw)}</span>
          ) : (
            <span className="text-sm text-slate-400">Not disclosed</span>
          )}
          {p.capacityNote && <p className="mt-1 text-[11px] text-slate-500">{p.capacityNote}</p>}
        </Metric>
        <Metric label="Status">
          <span className="text-sm font-medium text-slate-800">{STATUS_META[p.status].label}</span>
        </Metric>
        <Metric label="Timeline">
          <span className="text-sm font-medium text-slate-800">
            {p.announcedYear ? `Announced ${p.announcedYear}` : '—'}
            {p.onlineYear ? ` · Online ${p.onlineYear}` : ''}
          </span>
        </Metric>
        <Metric label="Investment">
          {p.investmentUsdB !== undefined ? (
            <span className="text-lg font-semibold tabular-nums text-slate-900">{fmtUsdB(p.investmentUsdB)}</span>
          ) : (
            <span className="text-sm text-slate-400">Not disclosed</span>
          )}
          {p.investmentNote && <p className="mt-1 text-[11px] text-slate-500">{p.investmentNote}</p>}
        </Metric>
      </div>

      <p className="mt-4 text-sm text-slate-700">{p.note}</p>

      <div className="mt-3 flex items-center gap-2">
        <ProvenanceBadge provenance="SOURCED" source={p.source} />
        <a
          href={p.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-800"
        >
          View source ↗
        </a>
      </div>
    </Card>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function ProjectsTab() {
  const { data: projects, isLoading } = useEnergyProjects();
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const all = useMemo(() => projects ?? [], [projects]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    for (const p of all) c[p.type] = (c[p.type] ?? 0) + 1;
    return c;
  }, [all]);

  const shown = useMemo(() => {
    const list = filter === 'all' ? all : all.filter((p) => p.type === filter);
    return [...list].sort((a, b) => {
      const s = STATUS_RANK[a.status] - STATUS_RANK[b.status];
      if (s !== 0) return s;
      return (b.capacityMw ?? 0) - (a.capacityMw ?? 0);
    });
  }, [all, filter]);

  // Honest roll-ups: sum only the figures that are actually reported.
  const totals = useMemo(() => {
    let capacityMw = 0;
    let investment = 0;
    for (const p of shown) {
      if (p.capacityMw !== undefined) capacityMw += p.capacityMw;
      if (p.investmentUsdB !== undefined) investment += p.investmentUsdB;
    }
    return { capacityMw, investment };
  }, [shown]);

  const selected = shown.find((p) => p.id === selectedId) ?? all.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="space-y-4 p-4">
      <Card
        title="US energy projects — 2022 forward"
        subtitle="Nuclear, data centers and other generation. Every tile links to a public source."
        right={<ProvenanceBadge provenance="SOURCED" source="public filings / press" />}
      >
        <p className="text-xs text-slate-500">
          A tracker of notable United States energy-infrastructure projects announced, under
          construction, or brought online since 2022 (plus Vogtle 3&amp;4 as a recently-completed
          flagship). Figures are publicly reported; where a number isn&apos;t disclosed the field is
          left blank rather than estimated. Select a tile for details and the source link.
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
                  track('projects_filter', { type: f.id });
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
            <span className="font-semibold tabular-nums text-slate-800">{shown.length}</span> projects
          </span>
          <span>
            <span className="font-semibold tabular-nums text-slate-800">
              {fmtCapacity(totals.capacityMw)}
            </span>{' '}
            reported capacity / power
          </span>
          <span>
            <span className="font-semibold tabular-nums text-slate-800">
              {fmtUsdB(totals.investment)}
            </span>{' '}
            reported investment
          </span>
        </div>
      </Card>

      {selected && <ProjectDetail project={selected} onClose={() => setSelectedId(null)} />}

      {isLoading && <p className="text-sm text-slate-400">Loading projects…</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((p) => {
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(active ? null : p.id)}
              className={`flex flex-col rounded-lg border bg-white p-3 text-left shadow-sm transition hover:border-teal-400 hover:shadow ${
                active ? 'border-teal-500 ring-1 ring-teal-500' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 truncate text-sm font-semibold text-slate-900">{p.name}</span>
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: TYPE_META[p.type].dot }}
                  aria-hidden
                />
              </div>
              <div className="mt-0.5 truncate text-xs text-slate-500">
                {p.developer}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">
                {p.location ? `${p.location}, ` : ''}
                {p.state}
              </div>

              <div className="mt-2 flex items-end justify-between gap-2">
                <div>
                  <div className="text-base font-semibold tabular-nums leading-none text-slate-900">
                    {p.capacityMw !== undefined ? fmtCapacity(p.capacityMw) : '—'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {p.onlineYear ? `online ${p.onlineYear}` : p.announcedYear ? `announced ${p.announcedYear}` : ''}
                  </div>
                </div>
                {p.investmentUsdB !== undefined && (
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums text-slate-700">
                      {fmtUsdB(p.investmentUsdB)}
                    </div>
                    <div className="text-[11px] text-slate-400">capex</div>
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <TypeChip type={p.type} />
                <StatusChip status={p.status} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
