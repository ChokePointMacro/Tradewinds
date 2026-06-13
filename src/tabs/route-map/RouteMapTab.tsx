import { useEffect, useMemo, useState } from 'react';
import { MapView, type MapBubble, type MapMarker, type RouteLayer } from './MapView';
import { Card } from '@/components/Card';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { PORTS, getPort } from '@/data/geo/ports';
import { CHOKEPOINTS } from '@/data/geo/chokepoints';
import { getCentroid } from '@/data/geo/countryCentroids';
import { useRoute } from '@/hooks/useRoute';
import { useSpot } from '@/hooks/usePrices';
import { useProduction, useReserves, useNetTrade } from '@/hooks/useSupply';
import { useAppState } from '@/app/appStateContext';
import { getCommodity } from '@/data/commodities';
import { estimateFreight, type FreightEstimate } from '@/data/cost/freight';
import { VESSEL_SPEED_KN } from '@/lib/routing/vessels';
import type { Port, Provenance, RouteRequest, RouteResult, TransportMode, VesselType } from '@/types';
import { track } from '@/lib/analytics';

type SupplyMetric = 'production' | 'reserves' | 'netTrade';

interface SupplyRow {
  country: string;
  value: number;
  unit: string;
}

const METRIC_META: Record<
  SupplyMetric,
  { label: string; subtitle: string; provenance: Provenance; source?: string }
> = {
  production: {
    label: 'Production',
    subtitle: 'Annual output by country',
    provenance: 'SOURCED',
    source: 'USGS / EIA',
  },
  reserves: {
    label: 'Reserves',
    subtitle: 'Estimated reserves by country',
    provenance: 'SOURCED',
    source: 'USGS / EIA',
  },
  netTrade: {
    label: 'Net trade',
    subtitle: 'Net exporters (green) vs. importers (red)',
    provenance: 'MODELED',
  },
};

const BUBBLE_MIN_R = 6;
const BUBBLE_MAX_R = 26;

function fmtVal(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const COLOR_A = '#0d9488';
const COLOR_B = '#d97706';
const COLOR_BASELINE = '#94a3b8';
const VESSEL_TYPES = Object.keys(VESSEL_SPEED_KN) as VesselType[];
const CLOSABLE = CHOKEPOINTS.filter((c) => c.passageKey !== 'cape');

function portsFor(role: 'export' | 'import', mode: TransportMode): Port[] {
  return PORTS.filter((p) => p.role.includes(role) && (p.mode ?? ['sea']).includes(mode));
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function freightOf(
  commodityId: string,
  route: RouteResult | undefined,
  spotPrice: number | undefined,
): FreightEstimate | null {
  if (!route) return null;
  try {
    return estimateFreight({ commodityId, distanceNm: route.distanceNm, spotPrice });
  } catch {
    return null;
  }
}

export function RouteMapTab() {
  const { commodityId } = useAppState();
  const commodity = getCommodity(commodityId);
  const unit = commodity?.nativeUnit ?? 'bbl';
  const airAllowed =
    commodityId === 'gold' || commodityId === 'silver' || commodityId === 'palladium';

  const [mode, setMode] = useState<TransportMode>('sea');
  const [vesselType, setVesselType] = useState<VesselType>('VLCC');
  const [closed, setClosed] = useState<string[]>([]);
  const [compareOn, setCompareOn] = useState(false);
  const [overlayOn, setOverlayOn] = useState(false);
  const [metric, setMetric] = useState<SupplyMetric>('production');

  const exportPorts = useMemo(() => portsFor('export', mode), [mode]);
  const importPorts = useMemo(() => portsFor('import', mode), [mode]);

  const [fromPortId, setFromPortId] = useState('ras_tanura');
  const [toPortId, setToPortId] = useState('ningbo');
  const [fromPortIdB, setFromPortIdB] = useState('basra');
  const [toPortIdB, setToPortIdB] = useState('rotterdam');

  // Force sea for commodities with no air lane (crude oil).
  useEffect(() => {
    if (!airAllowed && mode === 'air') setMode('sea');
  }, [airAllowed, mode]);

  // Keep selections valid (and origin ≠ destination) when ports change with mode.
  useEffect(() => {
    if (!exportPorts.some((p) => p.id === fromPortId)) setFromPortId(exportPorts[0]?.id ?? '');
    if (!exportPorts.some((p) => p.id === fromPortIdB)) setFromPortIdB(exportPorts[0]?.id ?? '');
  }, [exportPorts, fromPortId, fromPortIdB]);
  useEffect(() => {
    if (!importPorts.some((p) => p.id === toPortId)) {
      setToPortId((importPorts.find((p) => p.id !== fromPortId) ?? importPorts[0])?.id ?? '');
    }
    if (!importPorts.some((p) => p.id === toPortIdB)) {
      setToPortIdB((importPorts.find((p) => p.id !== fromPortIdB) ?? importPorts[0])?.id ?? '');
    }
  }, [importPorts, toPortId, toPortIdB, fromPortId, fromPortIdB]);

  const vessel = mode === 'sea' ? vesselType : undefined;

  const reqA: RouteRequest = useMemo(
    () => ({ fromPortId, toPortId, closedPassages: closed, mode, vesselType: vessel }),
    [fromPortId, toPortId, closed, mode, vessel],
  );
  const reqBaseline: RouteRequest | null = useMemo(
    () =>
      closed.length && mode === 'sea'
        ? { fromPortId, toPortId, closedPassages: [], mode, vesselType: vessel }
        : null,
    [fromPortId, toPortId, closed.length, mode, vessel],
  );
  const reqB: RouteRequest | null = useMemo(
    () =>
      compareOn
        ? { fromPortId: fromPortIdB, toPortId: toPortIdB, closedPassages: closed, mode, vesselType: vessel }
        : null,
    [compareOn, fromPortIdB, toPortIdB, closed, mode, vessel],
  );

  const { data: routeA, isLoading: loadingA } = useRoute(reqA);
  const { data: baseline } = useRoute(reqBaseline);
  const { data: routeB } = useRoute(reqB);

  const spot = useSpot(commodityId).data;
  const freightA = useMemo(() => freightOf(commodityId, routeA, spot?.price), [commodityId, routeA, spot?.price]);
  const freightBase = useMemo(() => freightOf(commodityId, baseline, spot?.price), [commodityId, baseline, spot?.price]);
  const freightB = useMemo(() => freightOf(commodityId, routeB, spot?.price), [commodityId, routeB, spot?.price]);

  const mapRoutes: RouteLayer[] = useMemo(() => {
    const arr: RouteLayer[] = [];
    if (baseline && closed.length) arr.push({ id: 'baseline', feature: baseline.geojson, color: COLOR_BASELINE, dashed: true });
    if (routeA) arr.push({ id: 'routeA', feature: routeA.geojson, color: COLOR_A });
    if (routeB) arr.push({ id: 'routeB', feature: routeB.geojson, color: COLOR_B });
    return arr;
  }, [baseline, routeA, routeB, closed.length]);

  const production = useProduction(commodityId).data;
  const reserves = useReserves(commodityId).data;
  const netTrade = useNetTrade(commodityId).data;

  const supplyRows: SupplyRow[] = useMemo(() => {
    let rows: SupplyRow[];
    if (metric === 'production') {
      rows = (production ?? []).map((p) => ({ country: p.country, value: p.amount, unit: p.unit }));
    } else if (metric === 'reserves') {
      rows = (reserves ?? []).map((r) => ({ country: r.country, value: r.amount, unit: r.unit }));
    } else {
      rows = (netTrade ?? []).map((t) => ({ country: t.country, value: t.netExport, unit: t.unit }));
    }
    return [...rows].sort((a, b) => b.value - a.value);
  }, [metric, production, reserves, netTrade]);

  // Derive the badge from the actual rows so it matches what's shown: production
  // & reserves carry their real agency source (USGS MCS / EIA); net trade can be
  // live (SOURCED, UN Comtrade) or seed (MODELED) per the `live-trade` flag.
  const metricBadge = useMemo<{ provenance: Provenance; source?: string }>(() => {
    if (metric === 'production') {
      return { provenance: 'SOURCED', source: production?.[0]?.source ?? METRIC_META.production.source };
    }
    if (metric === 'reserves') {
      return { provenance: 'SOURCED', source: reserves?.[0]?.source ?? METRIC_META.reserves.source };
    }
    const first = netTrade?.[0];
    return {
      provenance: first?.provenance ?? METRIC_META.netTrade.provenance,
      source: first?.source ?? METRIC_META.netTrade.source,
    };
  }, [metric, production, reserves, netTrade]);

  const supplyMaxAbs = useMemo(
    () => Math.max(1, ...supplyRows.map((r) => Math.abs(r.value))),
    [supplyRows],
  );

  const mapBubbles: MapBubble[] = useMemo(() => {
    if (!overlayOn) return [];
    const out: MapBubble[] = [];
    for (const r of supplyRows) {
      const c = getCentroid(r.country);
      if (!c) continue;
      const radius =
        BUBBLE_MIN_R + Math.sqrt(Math.abs(r.value) / supplyMaxAbs) * (BUBBLE_MAX_R - BUBBLE_MIN_R);
      const color =
        metric === 'netTrade' ? (r.value >= 0 ? '#16a34a' : '#dc2626') : '#0d9488';
      out.push({
        id: `bub-${r.country}`,
        lng: c[0],
        lat: c[1],
        radius,
        color,
        label: `${r.country}: ${fmtVal(r.value)} ${r.unit}`,
      });
    }
    return out;
  }, [overlayOn, supplyRows, supplyMaxAbs, metric]);

  const mapMarkers: MapMarker[] = useMemo(() => {
    const ms: MapMarker[] = [];
    const pushPort = (id: string, port: Port | undefined, color: string, label: string) => {
      if (port) ms.push({ id, lng: port.lng, lat: port.lat, color, label });
    };
    pushPort('a-from', getPort(fromPortId), '#16a34a', `Origin: ${getPort(fromPortId)?.name ?? ''}`);
    pushPort('a-to', getPort(toPortId), '#dc2626', `Destination: ${getPort(toPortId)?.name ?? ''}`);
    if (compareOn) {
      pushPort('b-from', getPort(fromPortIdB), '#16a34a', `Origin B: ${getPort(fromPortIdB)?.name ?? ''}`);
      pushPort('b-to', getPort(toPortIdB), '#dc2626', `Destination B: ${getPort(toPortIdB)?.name ?? ''}`);
    }
    if (mode === 'sea') {
      for (const c of CLOSABLE) {
        const isClosed = closed.includes(c.passageKey);
        ms.push({
          id: `cp-${c.id}`,
          lng: c.lng,
          lat: c.lat,
          color: isClosed ? '#dc2626' : '#cbd5e1',
          label: `${c.name}${isClosed ? ' — closed' : ''}`,
        });
      }
    }
    return ms;
  }, [fromPortId, toPortId, fromPortIdB, toPortIdB, compareOn, mode, closed]);

  function togglePassage(passageKey: string) {
    setClosed((prev) =>
      prev.includes(passageKey) ? prev.filter((p) => p !== passageKey) : [...prev, passageKey],
    );
    track('chokepoint_toggled', { passageKey });
  }

  const showDiff = closed.length > 0 && mode === 'sea' && !!routeA && !!baseline;
  const money = (n: number) => `$${n.toFixed(2)}/${unit}`;

  return (
    <div className="grid h-full grid-cols-[340px_1fr]">
      <aside className="space-y-3 overflow-auto border-r border-slate-200 bg-slate-50 p-3">
        <Card title="Transport">
          <div className="mb-3 flex gap-2">
            {(['sea', 'air'] as TransportMode[]).map((m) => {
              const disabled = m === 'air' && !airAllowed;
              return (
                <button
                  key={m}
                  type="button"
                  disabled={disabled}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded border px-2 py-1 text-sm capitalize ${
                    mode === m
                      ? 'border-teal-500 bg-teal-50 font-medium text-teal-800'
                      : 'border-slate-300 bg-white text-slate-600'
                  } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
                  title={disabled ? 'Air freight applies to precious metals only' : undefined}
                >
                  {m}
                </button>
              );
            })}
          </div>
          {mode === 'sea' && (
            <label className="block text-xs font-medium text-slate-600">
              Vessel class
              <select
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={vesselType}
                onChange={(e) => setVesselType(e.target.value as VesselType)}
              >
                {VESSEL_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {v} ({VESSEL_SPEED_KN[v]} kn)
                  </option>
                ))}
              </select>
            </label>
          )}
        </Card>

        <Card title="Lane">
          <PortSelect label="Exporter" ports={exportPorts} value={fromPortId} onChange={setFromPortId} />
          <PortSelect label="Importer" ports={importPorts} value={toPortId} onChange={setToPortId} className="mt-2" />
        </Card>

        {mode === 'sea' && (
          <Card title="Disruption" subtitle="Toggle chokepoints closed">
            <ul className="space-y-1">
              {CLOSABLE.map((c) => (
                <li key={c.id}>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={closed.includes(c.passageKey)}
                      onChange={() => togglePassage(c.passageKey)}
                    />
                    {c.name}
                  </label>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card title="Result" right={routeA && <ProvenanceBadge provenance={routeA.provenance} source={commodity?.benchmark} />}>
          {loadingA && <p className="text-sm text-slate-500">Computing…</p>}
          {routeA && (
            <div className="space-y-1 text-sm">
              <Row label="Distance" value={`${routeA.distanceNm.toLocaleString()} nm`} />
              <Row label="Transit" value={`${routeA.transitDays} days`} />
              <Row
                label="Freight"
                value={freightA ? money(freightA.perUnit) : '—'}
                badge={freightA ? <ProvenanceBadge provenance="MODELED" /> : undefined}
              />
              {routeA.passagesUsed.length > 0 && (
                <Row label="Passages" value={routeA.passagesUsed.join(', ')} />
              )}
              {routeA.constrained && (
                <p className="mt-2 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">
                  ⚠ {routeA.note}
                </p>
              )}
              {!routeA.constrained && routeA.note && (
                <p className="mt-2 text-xs text-slate-500">{routeA.note}</p>
              )}
            </div>
          )}
        </Card>

        {showDiff && routeA && baseline && (
          <Card title="Disruption impact" subtitle="Disrupted vs. open-passage baseline">
            <div className="space-y-1 text-sm">
              <Row label="Δ Distance" value={fmtDelta(routeA.distanceNm - baseline.distanceNm, ' nm')} />
              <Row label="Δ Transit" value={fmtDelta(round(routeA.transitDays - baseline.transitDays), ' days')} />
              {freightA && freightBase && (
                <Row label="Δ Freight" value={fmtDelta(round(freightA.perUnit - freightBase.perUnit), `/${unit}`, '$')} />
              )}
              {routeA.constrained && (
                <p className="mt-1 text-xs text-red-700">No reroute exists — see warning above.</p>
              )}
            </div>
          </Card>
        )}

        <Card
          title="Compare lane"
          right={
            <label className="flex items-center gap-1 text-xs text-slate-600">
              <input type="checkbox" checked={compareOn} onChange={(e) => setCompareOn(e.target.checked)} />
              on
            </label>
          }
        >
          {compareOn ? (
            <div className="space-y-2">
              <PortSelect label="Exporter B" ports={exportPorts} value={fromPortIdB} onChange={setFromPortIdB} />
              <PortSelect label="Importer B" ports={importPorts} value={toPortIdB} onChange={setToPortIdB} />
              <table className="mt-2 w-full text-xs">
                <thead>
                  <tr className="text-slate-500">
                    <th className="text-left font-medium">Lane</th>
                    <th className="text-right font-medium">Dist</th>
                    <th className="text-right font-medium">Days</th>
                    <th className="text-right font-medium">Freight</th>
                  </tr>
                </thead>
                <tbody>
                  <CompareRow color={COLOR_A} label="A" route={routeA} freight={freightA} unit={unit} />
                  <CompareRow color={COLOR_B} label="B" route={routeB} freight={freightB} unit={unit} />
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Enable to overlay a second lane and compare.</p>
          )}
        </Card>

        <Card
          title="Production map"
          subtitle={METRIC_META[metric].subtitle}
          right={
            <label className="flex items-center gap-1 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={overlayOn}
                onChange={(e) => {
                  setOverlayOn(e.target.checked);
                  track('production_overlay_toggled', { on: e.target.checked, metric });
                }}
              />
              on
            </label>
          }
        >
          <div className="mb-3 flex gap-1">
            {(Object.keys(METRIC_META) as SupplyMetric[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMetric(m);
                  track('production_metric_selected', { metric: m });
                }}
                className={`flex-1 rounded border px-2 py-1 text-xs ${
                  metric === m
                    ? 'border-teal-500 bg-teal-50 font-medium text-teal-800'
                    : 'border-slate-300 bg-white text-slate-600'
                }`}
              >
                {METRIC_META[m].label}
              </button>
            ))}
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Top {METRIC_META[metric].label.toLowerCase()} — {commodity?.name ?? commodityId}
            </span>
            <ProvenanceBadge provenance={metricBadge.provenance} source={metricBadge.source} />
          </div>

          {supplyRows.length === 0 ? (
            <p className="text-xs text-slate-500">No data for this commodity.</p>
          ) : (
            <ul className="space-y-1.5">
              {supplyRows.map((r) => {
                const pct = (Math.abs(r.value) / supplyMaxAbs) * 100;
                const barColor =
                  metric === 'netTrade'
                    ? r.value >= 0
                      ? '#16a34a'
                      : '#dc2626'
                    : '#0d9488';
                return (
                  <li key={r.country} className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-700">{r.country}</span>
                      <span className="font-medium text-slate-900">
                        {fmtVal(r.value)} {r.unit}
                      </span>
                    </div>
                    <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded bg-slate-100">
                      <div
                        className="h-full rounded"
                        style={{ width: `${pct}%`, background: barColor }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {!overlayOn && (
            <p className="mt-2 text-[11px] text-slate-400">
              Toggle “on” to plot these on the map as proportional bubbles.
            </p>
          )}
        </Card>

        <p className="px-1 text-[11px] leading-snug text-slate-400">
          Canal/strait-aware routing via the Eurostat maritime network (searoute). Distances and
          freight are estimates for visualization only — not for navigation.
        </p>
      </aside>

      <div className="relative">
        <MapView routes={mapRoutes} markers={mapMarkers} bubbles={mapBubbles} />
      </div>
    </div>
  );
}

function PortSelect({
  label,
  ports,
  value,
  onChange,
  className = '',
}: {
  label: string;
  ports: Port[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <label className={`block text-xs font-medium text-slate-600 ${className}`}>
      {label}
      <select
        className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {ports.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — {p.country}
          </option>
        ))}
      </select>
    </label>
  );
}

function Row({ label, value, badge }: { label: string; value: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="flex items-center gap-1.5 font-medium text-slate-900">
        {value}
        {badge}
      </span>
    </div>
  );
}

function CompareRow({
  color,
  label,
  route,
  freight,
  unit,
}: {
  color: string;
  label: string;
  route: RouteResult | undefined;
  freight: FreightEstimate | null;
  unit: string;
}) {
  return (
    <tr className="border-t border-slate-100 text-slate-800">
      <td className="py-1">
        <span className="inline-block h-2 w-3 rounded-sm" style={{ background: color }} /> {label}
      </td>
      <td className="text-right">{route ? `${route.distanceNm.toLocaleString()}` : '—'}</td>
      <td className="text-right">{route ? route.transitDays : '—'}</td>
      <td className="text-right">{freight ? `$${freight.perUnit.toFixed(2)}/${unit}` : '—'}</td>
    </tr>
  );
}

function fmtDelta(n: number, suffix = '', prefix = ''): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${prefix}${n.toLocaleString()}${suffix}`;
}
