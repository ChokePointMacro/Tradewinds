import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppState } from '@/app/appStateContext';
import { Card } from '@/components/Card';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { SourcedValue, type SourcedStatus } from '@/components/SourcedValue';
import { COMMODITIES, getCommodity } from '@/data/commodities';
import { priceSource } from '@/data/adapters';
import { useHistory, useSpot } from '@/hooks/usePrices';
import { fmtPrice } from '@/lib/format';
import { forecast } from '@/lib/forecast';
import { RANGE_DAYS, RANGE_KEYS, type RangeKey, isoDaysAgo, todayISO } from '@/lib/ranges';

const COLORS: Record<string, string> = {
  crude_oil: '#0d9488',
  diesel: '#b45309',
  gold: '#d97706',
  silver: '#64748b',
  palladium: '#7c3aed',
  copper: '#c2410c',
  nickel: '#0369a1',
};

const FORECAST_HORIZON_DAYS = 90;

interface ChartRow {
  dateISO: string;
  close?: number;
  median?: number;
  band80?: [number, number];
  band95?: [number, number];
}

/** Spot price card for a single commodity. Owns its own query to avoid hooks-in-loop. */
function SpotCard({ commodityId }: { commodityId: string }) {
  const commodity = getCommodity(commodityId)!;
  const { data: spot, isLoading } = useSpot(commodityId);
  const status: SourcedStatus = isLoading ? 'loading' : spot ? 'live' : 'unavailable';
  return (
    <Card title={`${commodity.name} spot`} subtitle={commodity.benchmark}>
      <SourcedValue
        status={status}
        domain="price"
        source={spot?.source}
        asOfISO={spot?.asOfISO}
        reason={`No connected source provides a ${commodity.name} price.`}
      >
        {spot && (
          <div className="text-2xl font-bold text-slate-900">
            ${fmtPrice(spot.price)}
            <span className="ml-1 text-sm font-normal text-slate-500">/{spot.unit}</span>
            {spot.stale && (
              <span className="ml-2 align-middle text-[10px] font-semibold uppercase text-amber-600">
                stale
              </span>
            )}
          </div>
        )}
      </SourcedValue>
    </Card>
  );
}

function RangeSelector({ value, onChange }: { value: RangeKey; onChange: (r: RangeKey) => void }) {
  return (
    <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5">
      {RANGE_KEYS.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`rounded px-2.5 py-1 text-xs font-medium transition ${
            r === value ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function AssumptionsPopover({
  windowDays,
  muAnnual,
  sigmaAnnual,
  horizonDays,
}: {
  windowDays: number;
  muAnnual: number;
  sigmaAnnual: number;
  horizonDays: number;
}) {
  return (
    <details className="group relative text-xs">
      <summary className="cursor-pointer list-none rounded border border-slate-200 px-2 py-1 font-medium text-slate-600 hover:bg-slate-100">
        Assumptions
      </summary>
      <div className="absolute right-0 z-10 mt-1 w-64 rounded-md border border-slate-200 bg-white p-3 text-slate-600 shadow-lg">
        <dl className="space-y-1">
          <div className="flex justify-between">
            <dt>History window</dt>
            <dd className="font-medium text-slate-900">{windowDays} pts</dd>
          </div>
          <div className="flex justify-between">
            <dt>Annualized drift μ</dt>
            <dd className="font-medium text-slate-900">{(muAnnual * 100).toFixed(1)}%</dd>
          </div>
          <div className="flex justify-between">
            <dt>Annualized vol σ</dt>
            <dd className="font-medium text-slate-900">{(sigmaAnnual * 100).toFixed(1)}%</dd>
          </div>
          <div className="flex justify-between">
            <dt>Horizon</dt>
            <dd className="font-medium text-slate-900">{horizonDays} days</dd>
          </div>
        </dl>
        <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] leading-snug text-slate-400">
          GBM fan from historical volatility. Bands are 80% / 95% confidence. Illustrative only —
          not investment advice or a price prediction.
        </p>
      </div>
    </details>
  );
}

/** Normalized %-change overlay across all three commodities for the selected range. */
function NormalizedOverlay({ fromISO, toISO }: { fromISO: string; toISO: string }) {
  const histories = useQueries({
    queries: COMMODITIES.map((c) => ({
      queryKey: ['history', c.id, fromISO, toISO],
      queryFn: () => priceSource.getHistory(c.id, fromISO, toISO),
    })),
  });

  const data = useMemo(() => {
    const map = new Map<string, ChartRow & Record<string, number | string>>();
    COMMODITIES.forEach((c, i) => {
      const series = histories[i]?.data;
      if (!series || series.length === 0) return;
      const first = series[0]!.close;
      if (first <= 0) return;
      for (const p of series) {
        const row = map.get(p.dateISO) ?? ({ dateISO: p.dateISO } as ChartRow & Record<string, number | string>);
        row[c.id] = (p.close / first - 1) * 100;
        map.set(p.dateISO, row);
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [histories.map((h) => h.dataUpdatedAt).join(','), fromISO, toISO]);

  return (
    <Card
      title="Relative performance"
      subtitle="Normalized % change from range start"
      right={<ProvenanceBadge provenance="MODELED" />}
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="dateISO" tick={{ fontSize: 11 }} minTickGap={48} stroke="#94a3b8" />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
              width={48}
              tickFormatter={(v: number) => `${v.toFixed(0)}%`}
            />
            <Tooltip formatter={(v: number, name) => [`${v.toFixed(1)}%`, getCommodity(name as string)?.name ?? name]} />
            <Legend formatter={(name) => getCommodity(name as string)?.name ?? name} />
            {COMMODITIES.map((c) => (
              <Line
                key={c.id}
                type="monotone"
                dataKey={c.id}
                stroke={COLORS[c.id] ?? '#0f172a'}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/** Gold:silver ratio — computed from the two spot quotes, hence MODELED. */
function GoldSilverRatio() {
  const { data: gold } = useSpot('gold');
  const { data: silver } = useSpot('silver');
  const ratio = gold && silver && silver.price > 0 ? gold.price / silver.price : null;
  return (
    <Card
      title="Gold : Silver ratio"
      subtitle="Ounces of silver per ounce of gold"
      right={<ProvenanceBadge provenance="MODELED" />}
    >
      {ratio != null ? (
        <div className="text-2xl font-bold text-slate-900">{ratio.toFixed(1)}</div>
      ) : (
        <p className="text-sm text-slate-500">Loading…</p>
      )}
    </Card>
  );
}

export function RatesTab() {
  const { commodityId } = useAppState();
  const commodity = getCommodity(commodityId)!;
  const [range, setRange] = useState<RangeKey>('1Y');
  const [showForecast, setShowForecast] = useState(true);

  const { fromISO, toISO } = useMemo(
    () => ({ fromISO: isoDaysAgo(RANGE_DAYS[range]), toISO: todayISO() }),
    [range],
  );

  const { data: history, isLoading: historyLoading } = useHistory(commodityId, fromISO, toISO);

  const fc = useMemo(
    () => (history && history.length > 1 ? forecast(history, FORECAST_HORIZON_DAYS) : null),
    [history],
  );

  const chartData = useMemo<ChartRow[]>(() => {
    const rows: ChartRow[] = (history ?? []).map((p) => ({ dateISO: p.dateISO, close: p.close }));
    if (showForecast && fc && rows.length > 0) {
      const last = rows[rows.length - 1]!;
      const anchor = last.close!;
      last.median = anchor;
      last.band80 = [anchor, anchor];
      last.band95 = [anchor, anchor];
      for (const fp of fc.points) {
        rows.push({
          dateISO: fp.dateISO,
          median: fp.median,
          band80: [fp.lo80, fp.hi80],
          band95: [fp.lo95, fp.hi95],
        });
      }
    }
    return rows;
  }, [history, fc, showForecast]);

  const color = COLORS[commodityId] ?? '#0d9488';
  const histStatus: SourcedStatus = historyLoading
    ? 'loading'
    : history && history.length > 0
      ? 'live'
      : 'unavailable';

  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COMMODITIES.map((c) => (
          <SpotCard key={c.id} commodityId={c.id} />
        ))}
        <GoldSilverRatio />
      </div>

      <Card
        title={`${commodity.name} — price & forecast`}
        subtitle={`Daily close · ${range}`}
        right={
          <div className="flex items-center gap-2">
            {fc && (
              <AssumptionsPopover
                windowDays={fc.assumptions.windowDays}
                muAnnual={fc.assumptions.muAnnual}
                sigmaAnnual={fc.assumptions.sigmaAnnual}
                horizonDays={fc.assumptions.horizonDays}
              />
            )}
            <RangeSelector value={range} onChange={setRange} />
          </div>
        }
      >
        {histStatus === 'live' ? (
          <>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={showForecast}
              onChange={(e) => setShowForecast(e.target.checked)}
            />
            Show {FORECAST_HORIZON_DAYS}-day forecast fan
          </label>
          <ProvenanceBadge provenance="MODELED" />
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="px" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="dateISO" tick={{ fontSize: 11 }} minTickGap={48} stroke="#94a3b8" />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                domain={['auto', 'auto']}
                width={56}
                tickFormatter={(v: number) => fmtPrice(v)}
              />
              <Tooltip formatter={(v: number) => fmtPrice(v)} />
              {showForecast && (
                <Area
                  type="monotone"
                  dataKey="band95"
                  stroke="none"
                  fill={color}
                  fillOpacity={0.1}
                  connectNulls
                  isAnimationActive={false}
                  name="95% band"
                />
              )}
              {showForecast && (
                <Area
                  type="monotone"
                  dataKey="band80"
                  stroke="none"
                  fill={color}
                  fillOpacity={0.18}
                  connectNulls
                  isAnimationActive={false}
                  name="80% band"
                />
              )}
              <Area
                type="monotone"
                dataKey="close"
                stroke={color}
                fill="url(#px)"
                strokeWidth={2}
                connectNulls
                isAnimationActive={false}
                name="Close"
              />
              {showForecast && (
                <Line
                  type="monotone"
                  dataKey="median"
                  stroke={color}
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                  name="Forecast median"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-slate-400">
          Probabilistic forecast (geometric Brownian motion) derived from historical volatility.
          Illustrative scenario bands only — not investment advice or a guaranteed prediction.
        </p>
          </>
        ) : (
          <SourcedValue
            status={histStatus}
            domain="price"
            reason={`No connected source provides ${commodity.name} price history.`}
          />
        )}
      </Card>

      <NormalizedOverlay fromISO={fromISO} toISO={toISO} />
    </div>
  );
}
