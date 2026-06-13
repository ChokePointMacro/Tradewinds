import { useMemo, useState } from 'react';
import { Card } from '@/components/Card';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { useBridgePower } from '@/hooks/useProjects';
import { track } from '@/lib/analytics';
import type { BridgePowerDeployment, BridgePowerType, ProjectStatus } from '@/types';

const TYPE_META: Record<BridgePowerType, { label: string; chip: string; dot: string }> = {
  mobile_gas_turbine: { label: 'Mobile turbine', chip: 'bg-amber-100 text-amber-800 border-amber-300', dot: '#d97706' },
  gas_turbine: { label: 'Gas turbine', chip: 'bg-rose-100 text-rose-800 border-rose-300', dot: '#e11d48' },
  gas_engine: { label: 'Gas engine', chip: 'bg-orange-100 text-orange-800 border-orange-300', dot: '#ea580c' },
  fuel_cell: { label: 'Fuel cell', chip: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: '#059669' },
  diesel_genset: { label: 'Diesel genset', chip: 'bg-slate-200 text-slate-700 border-slate-300', dot: '#475569' },
};

const STATUS_META: Record<ProjectStatus, { label: string; chip: string }> = {
  announced: { label: 'Announced', chip: 'bg-slate-100 text-slate-600 border-slate-300' },
  permitting: { label: 'Permitting', chip: 'bg-amber-100 text-amber-800 border-amber-300' },
  under_construction: { label: 'Under construction', chip: 'bg-blue-100 text-blue-800 border-blue-300' },
  partially_operational: { label: 'Partially operational', chip: 'bg-teal-100 text-teal-800 border-teal-300' },
  operational: { label: 'Operational', chip: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
};

// Live first, then build pipeline, then earliest-stage.
const STATUS_RANK: Record<ProjectStatus, number> = {
  operational: 0,
  partially_operational: 1,
  under_construction: 2,
  permitting: 3,
  announced: 4,
};

type Filter = 'all' | BridgePowerType;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mobile_gas_turbine', label: 'Mobile turbines' },
  { id: 'gas_turbine', label: 'Gas turbines' },
  { id: 'gas_engine', label: 'Gas engines' },
  { id: 'fuel_cell', label: 'Fuel cells' },
  { id: 'diesel_genset', label: 'Diesel gensets' },
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

function TypeChip({ type }: { type: BridgePowerType }) {
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

function RoleChip({ bridge }: { bridge: boolean }) {
  return bridge ? (
    <span className="inline-flex items-center rounded border border-violet-300 bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800">
      Bridge
    </span>
  ) : (
    <span className="inline-flex items-center rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
      Dedicated
    </span>
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

function DeploymentDetail({ d, onClose }: { d: BridgePowerDeployment; onClose: () => void }) {
  return (
    <Card
      title={
        <span className="flex flex-wrap items-center gap-2">
          {d.name} <TypeChip type={d.type} /> <StatusChip status={d.status} /> <RoleChip bridge={d.bridge} />
        </span>
      }
      subtitle={`${d.provider}${d.offtaker ? ` → ${d.offtaker}` : ''} · ${d.location ? `${d.location}, ` : ''}${d.state}`}
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
        <Metric label="Capacity">
          {d.capacityMw !== undefined ? (
            <span className="text-lg font-semibold tabular-nums text-slate-900">{fmtCapacity(d.capacityMw)}</span>
          ) : (
            <span className="text-sm text-slate-400">Not disclosed</span>
          )}
          {d.unitsNote && <p className="mt-1 text-[11px] text-slate-500">{d.unitsNote}</p>}
        </Metric>
        <Metric label="Status">
          <span className="text-sm font-medium text-slate-800">{STATUS_META[d.status].label}</span>
        </Metric>
        <Metric label="Timeline">
          <span className="text-sm font-medium text-slate-800">
            {d.announcedYear ? `Announced ${d.announcedYear}` : '—'}
            {d.onlineYear ? ` · Online ${d.onlineYear}` : ''}
          </span>
        </Metric>
        <Metric label="Investment">
          {d.investmentUsdB !== undefined ? (
            <span className="text-lg font-semibold tabular-nums text-slate-900">{fmtUsdB(d.investmentUsdB)}</span>
          ) : (
            <span className="text-sm text-slate-400">Not disclosed</span>
          )}
        </Metric>
      </div>

      {d.bridgeNote && (
        <div className="mt-4 rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-900">
          <span className="font-semibold">{d.bridge ? 'Bridge role: ' : 'Permanent: '}</span>
          {d.bridgeNote}
        </div>
      )}

      <p className="mt-3 text-sm text-slate-700">{d.note}</p>

      <div className="mt-3 flex items-center gap-2">
        <ProvenanceBadge provenance="SOURCED" source={d.source} />
        <a
          href={d.sourceUrl}
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

export function BridgePowerTab() {
  const { data: deployments, isLoading } = useBridgePower();
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const all = useMemo(() => deployments ?? [], [deployments]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    for (const d of all) c[d.type] = (c[d.type] ?? 0) + 1;
    return c;
  }, [all]);

  const shown = useMemo(() => {
    const list = filter === 'all' ? all : all.filter((d) => d.type === filter);
    return [...list].sort((a, b) => {
      const s = STATUS_RANK[a.status] - STATUS_RANK[b.status];
      if (s !== 0) return s;
      return (b.capacityMw ?? 0) - (a.capacityMw ?? 0);
    });
  }, [all, filter]);

  // Honest roll-ups: sum only disclosed capacity; count genuine bridges.
  const totals = useMemo(() => {
    let capacityMw = 0;
    let bridges = 0;
    for (const d of shown) {
      if (d.capacityMw !== undefined) capacityMw += d.capacityMw;
      if (d.bridge) bridges += 1;
    }
    return { capacityMw, bridges };
  }, [shown]);

  const selected = shown.find((d) => d.id === selectedId) ?? all.find((d) => d.id === selectedId) ?? null;

  return (
    <div className="space-y-4 p-4">
      <Card
        title="Bridge power for data centers"
        subtitle="On-site generation hyperscalers deploy to get electrons now — while the grid and big plants catch up."
        right={<ProvenanceBadge provenance="SOURCED" source="public filings / press" />}
      >
        <p className="text-xs text-slate-500">
          Grid interconnections and large permanent plants (see the Projects tab) take years, so data
          centers are increasingly &quot;bringing their own power&quot;: trailer-mounted and aeroderivative
          gas turbines, natural-gas reciprocating engines, and combustion-free fuel cells — plus
          dedicated co-located gas plants as the build-to destination. Figures are publicly reported;
          undisclosed numbers are left blank rather than estimated. Diesel gensets remain the standard
          on-site <em>backup</em>, but new <em>primary</em> bridge generation is overwhelmingly the gas
          and fuel-cell options tracked here. Select a tile for details and the source link.
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
                  track('bridge_power_filter', { type: f.id });
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
            <span className="font-semibold tabular-nums text-slate-800">{shown.length}</span> deployments
          </span>
          <span>
            <span className="font-semibold tabular-nums text-slate-800">{fmtCapacity(totals.capacityMw)}</span>{' '}
            reported capacity
          </span>
          <span>
            <span className="font-semibold tabular-nums text-slate-800">{totals.bridges}</span> temporary bridges
          </span>
        </div>
      </Card>

      {selected && <DeploymentDetail d={selected} onClose={() => setSelectedId(null)} />}

      {isLoading && <p className="text-sm text-slate-400">Loading deployments…</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((d) => {
          const active = d.id === selectedId;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedId(active ? null : d.id)}
              className={`flex flex-col rounded-lg border bg-white p-3 text-left shadow-sm transition hover:border-teal-400 hover:shadow ${
                active ? 'border-teal-500 ring-1 ring-teal-500' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 truncate text-sm font-semibold text-slate-900">{d.name}</span>
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: TYPE_META[d.type].dot }}
                  aria-hidden
                />
              </div>
              <div className="mt-0.5 truncate text-xs text-slate-500">
                {d.provider}
                {d.offtaker ? ` → ${d.offtaker}` : ''}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">
                {d.location ? `${d.location}, ` : ''}
                {d.state}
              </div>

              <div className="mt-2 flex items-end justify-between gap-2">
                <div>
                  <div className="text-base font-semibold tabular-nums leading-none text-slate-900">
                    {d.capacityMw !== undefined ? fmtCapacity(d.capacityMw) : '—'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {d.onlineYear ? `online ${d.onlineYear}` : d.announcedYear ? `announced ${d.announcedYear}` : ''}
                  </div>
                </div>
                {d.investmentUsdB !== undefined && (
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums text-slate-700">
                      {fmtUsdB(d.investmentUsdB)}
                    </div>
                    <div className="text-[11px] text-slate-400">deal</div>
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <TypeChip type={d.type} />
                <StatusChip status={d.status} />
                <RoleChip bridge={d.bridge} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
