import { useMemo, useState } from 'react';
import type { Feature, LineString } from 'geojson';
import { Card } from '@/components/Card';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { MapView, type RouteLayer, type MapMarker } from '@/tabs/route-map/MapView';
import {
  MAGNET_CHAIN,
  MAGNET_ROUTES,
  totalMagnetCostUsdPerKg,
  midstreamCostSharePct,
  MAGNET_CHAIN_SOURCE,
} from '@/data/magnetchain/magnetChain';
import type { MagnetChainStage } from '@/types';

function chinaHex(share: number): string {
  if (share >= 90) return '#dc2626';
  if (share >= 70) return '#ea580c';
  if (share >= 40) return '#d97706';
  return '#0d9488';
}

function StageCard({
  stage,
  total,
  active,
  onClick,
}: {
  stage: MagnetChainStage;
  total: number;
  active: boolean;
  onClick: () => void;
}) {
  const costPct = Math.round((stage.costUsdPerKg / total) * 100);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col rounded-lg border bg-white p-3 text-left shadow-sm transition hover:border-teal-400 ${
        active ? 'border-teal-500 ring-1 ring-teal-500' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
            {stage.order}
          </span>
          <span className="text-sm font-semibold text-slate-900">{stage.stage}</span>
        </span>
        {stage.exportControlled && (
          <span className="rounded border border-red-300 bg-red-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-700">
            Controlled
          </span>
        )}
      </div>

      <div className="mt-1 text-[11px] text-slate-500">{stage.output}</div>

      {/* China share bar */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="uppercase tracking-wide text-slate-400">China share</span>
          <span className="font-semibold tabular-nums" style={{ color: chinaHex(stage.chinaSharePct) }}>
            {stage.chinaSharePct}%
          </span>
        </div>
        <div className="mt-0.5 h-1.5 w-full rounded bg-slate-100">
          <div className="h-1.5 rounded" style={{ width: `${stage.chinaSharePct}%`, backgroundColor: chinaHex(stage.chinaSharePct) }} />
        </div>
      </div>

      {/* Cost contribution */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="uppercase tracking-wide text-slate-400">Cost added</span>
          <span className="font-semibold tabular-nums text-slate-600">
            ${stage.costUsdPerKg}/kg · {costPct}%
          </span>
        </div>
        <div className="mt-0.5 h-1.5 w-full rounded bg-slate-100">
          <div className="h-1.5 rounded bg-slate-400" style={{ width: `${costPct}%` }} />
        </div>
      </div>
    </button>
  );
}

export function MagnetChainTab() {
  const [selectedId, setSelectedId] = useState<string>('magnet_making');
  const total = useMemo(() => totalMagnetCostUsdPerKg(), []);
  const midstream = useMemo(() => midstreamCostSharePct(), []);
  const selected = MAGNET_CHAIN.find((s) => s.id === selectedId) ?? MAGNET_CHAIN[0]!;

  // Build map routes + markers from the geographic chain paths.
  const { routes, markers } = useMemo(() => {
    const routes: RouteLayer[] = MAGNET_ROUTES.map((r) => {
      const feature: Feature<LineString> = {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: r.nodes.map((n) => [n.lng, n.lat]) },
      };
      return { id: r.id, feature, color: r.color, dashed: !r.dominant };
    });
    const markers: MapMarker[] = MAGNET_ROUTES.flatMap((r) =>
      r.nodes.map((n, i) => ({
        id: `${r.id}-${i}`,
        lng: n.lng,
        lat: n.lat,
        color: r.color,
        label: `${n.name} — ${n.country}`,
      })),
    );
    return { routes, markers };
  }, []);

  return (
    <div className="space-y-4 p-4">
      <Card
        title="Source → finished magnet — the rare-earth value chain"
        subtitle="Ore to a coated, magnetised NdFeB magnet on the open market: cost, dominant companies, countries and route"
        right={<ProvenanceBadge provenance="SOURCED" source={MAGNET_CHAIN_SOURCE} />}
      >
        <p className="text-xs text-slate-500">
          Every stage from rare-earth ore to a graded magnet (e.g. <span className="font-semibold">N42SH</span>),
          with the cost it adds and the companies and countries that dominate it. The decisive truth: the
          magnet, not the mine, is the chokepoint — China holds ~90% of separation and ~90–94% of
          magnet-making, and roughly <span className="font-semibold tabular-nums">{midstream}%</span> of the
          finished value is captured from the separation step onward. Representative finished cost ≈{' '}
          <span className="font-semibold tabular-nums">${total}/kg</span>.
        </p>
      </Card>

      {/* Stage flow */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {MAGNET_CHAIN.map((s) => (
          <StageCard key={s.id} stage={s} total={total} active={s.id === selectedId} onClick={() => setSelectedId(s.id)} />
        ))}
      </div>

      {/* Selected stage detail */}
      <Card
        title={`${selected.order}. ${selected.stage}`}
        subtitle={selected.output}
        right={
          selected.exportControlled ? (
            <span className="rounded border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
              Export-controlled
            </span>
          ) : undefined
        }
      >
        <p className="text-sm text-slate-700">{selected.description}</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">China share</div>
            <div className="mt-0.5 text-2xl font-bold tabular-nums" style={{ color: chinaHex(selected.chinaSharePct) }}>
              {selected.chinaSharePct}%
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Dominant companies</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {selected.dominantCompanies.map((c) => (
                <span key={c} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-600">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Countries</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {selected.dominantCountries.map((c) => (
                <span key={c} className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] text-slate-600">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Route map */}
      <Card
        title="Route map — mine to magnet to market"
        subtitle="The dominant ~90% China path (solid red) vs the emerging Western MP path (dashed teal)"
        right={<ProvenanceBadge provenance="MODELED" source="indicative facility routing" />}
      >
        <div className="h-[380px] w-full overflow-hidden rounded-lg border border-slate-200">
          <MapView routes={routes} markers={markers} />
        </div>
        <div className="mt-3 space-y-2">
          {MAGNET_ROUTES.map((r) => (
            <div key={r.id} className="flex items-start gap-2 text-[11px]">
              <span className="mt-1 h-2 w-6 shrink-0 rounded" style={{ backgroundColor: r.color, opacity: r.dominant ? 1 : 0.6 }} aria-hidden />
              <span>
                <span className="font-semibold text-slate-700">{r.label}.</span>{' '}
                <span className="text-slate-500">{r.note}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-[11px] leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-500">Methodology.</span> Concentration shares are
          sourced to the ChokepointMacro magnet briefings (IEA / IDTechEx / MP Materials). Per-stage
          USD/kg costs are MODELED illustrative splits of a representative ~${total}/kg finished
          sintered-NdFeB value and will vary with NdPr/Dy/Tb prices, grade and scale — directional, not a
          quote. Route nodes are approximate facility locations for visualisation. The heavy rare earths
          (Dy/Tb) that the best grades need are the scarcest, most export-controlled inputs, which is why
          thrifting (grain-boundary diffusion) and recycling are front-line priorities.
        </p>
      </Card>
    </div>
  );
}
