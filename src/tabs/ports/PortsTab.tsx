import { useEffect, useMemo, useState } from 'react';
import { useAppState } from '@/app/appStateContext';
import { Card } from '@/components/Card';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { getCommodity } from '@/data/commodities';
import { usePortActivity } from '@/hooks/useSupply';
import type { CommodityPortActivity, PortRole } from '@/types';

const ACCENT = '#0d9488';

const ROLE_STYLE: Record<PortRole, string> = {
  export: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  import: 'bg-sky-100 text-sky-800 border-sky-300',
  hub: 'bg-violet-100 text-violet-800 border-violet-300',
};

function fmtVol(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-US');
  return n.toLocaleString('en-US', { maximumFractionDigits: n < 10 ? 1 : 0 });
}

function RoleBadge({ role }: { role: PortRole }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ROLE_STYLE[role]}`}
    >
      {role}
    </span>
  );
}

function PortDetail({ port, onClose }: { port: CommodityPortActivity; onClose: () => void }) {
  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          {port.name}, {port.country} <RoleBadge role={port.role} />
        </span>
      }
      subtitle={`${port.cargoType} · ${port.year}`}
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
      <div className="flex flex-wrap items-end gap-8">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Throughput
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {fmtVol(port.volume)}{' '}
            <span className="text-sm font-normal text-slate-500">{port.volumeUnit}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <ProvenanceBadge provenance="SOURCED" source={port.source ?? 'Port rankings'} />
            {port.sourceUrl && (
              <a
                href={port.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-700 underline-offset-2 hover:underline"
              >
                View source ↗
              </a>
            )}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Primary cargo
          </div>
          <div className="mt-1 text-sm text-slate-700">{port.cargoType}</div>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        Headline throughput is curated from public port/exchange rankings. Declared value, cargo mix
        and partner shares were modeled estimates with no free source and have been removed.
      </p>
    </Card>
  );
}

export function PortsTab() {
  const { commodityId } = useAppState();
  const commodity = getCommodity(commodityId)!;
  const { data: ports, isLoading } = usePortActivity(commodityId);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Reset the open detail when the commodity changes.
  useEffect(() => {
    setSelectedId(null);
  }, [commodityId]);

  const ranked = useMemo(
    () => [...(ports ?? [])].sort((a, b) => b.volume - a.volume),
    [ports],
  );
  const maxVol = Math.max(...ranked.map((p) => p.volume), 0.0001);
  const selected = ranked.find((p) => p.id === selectedId) ?? null;
  const year = ranked[0]?.year;
  const source = ranked[0]?.source ?? 'Port rankings';

  return (
    <div className="space-y-4 p-4">
      <Card
        title={`${commodity.name} — busiest ports & hubs`}
        subtitle={
          year ? `Ranked by ${commodity.name.toLowerCase()} throughput · ${year}` : 'Ranked by throughput'
        }
        right={<ProvenanceBadge provenance="SOURCED" source={source} />}
      >
        <p className="text-xs text-slate-500">
          Tiles show each port&apos;s commodity-specific throughput from public rankings. Select a
          tile for its primary cargo and source link.
        </p>
      </Card>

      {selected && <PortDetail port={selected} onClose={() => setSelectedId(null)} />}

      {isLoading && <p className="text-sm text-slate-400">Loading ports…</p>}
      {!isLoading && ranked.length === 0 && (
        <Card>
          <p className="text-sm text-slate-500">No port data for {commodity.name} yet.</p>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ranked.map((port, i) => {
          const active = port.id === selectedId;
          const pct = (port.volume / maxVol) * 100;
          return (
            <button
              key={port.id}
              type="button"
              onClick={() => setSelectedId(active ? null : port.id)}
              className={`rounded-lg border bg-white p-3 text-left shadow-sm transition hover:border-teal-400 hover:shadow ${
                active ? 'border-teal-500 ring-1 ring-teal-500' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-400">#{i + 1}</span>
                    <span className="truncate text-sm font-semibold text-slate-900">{port.name}</span>
                  </div>
                  <div className="truncate text-xs text-slate-500">{port.country}</div>
                </div>
                <RoleBadge role={port.role} />
              </div>

              <div className="mt-3">
                <div className="text-lg font-semibold tabular-nums leading-none text-slate-900">
                  {fmtVol(port.volume)}
                </div>
                <div className="text-[11px] text-slate-400">{port.volumeUnit}</div>
              </div>

              <div className="mt-2 h-1.5 w-full rounded bg-slate-100">
                <div
                  className="h-1.5 rounded"
                  style={{ width: `${pct}%`, backgroundColor: ACCENT, opacity: 0.85 }}
                />
              </div>

              <div className="mt-2 truncate text-[11px] text-slate-500" title={port.cargoType}>
                {port.cargoType}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
