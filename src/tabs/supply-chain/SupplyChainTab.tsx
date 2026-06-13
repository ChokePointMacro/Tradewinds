import { useEffect, useMemo, useState } from 'react';
import { useAppState } from '@/app/appStateContext';
import { Card } from '@/components/Card';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { getChain, getCommodity } from '@/data/commodities';
import { paramMap } from '@/data/cost/parameters';
import { computeLandedCost } from '@/data/cost/landedCost';
import { useProduction } from '@/hooks/useSupply';
import { useSpot } from '@/hooks/usePrices';
import type { SupplyChainStep } from '@/types';

const ACCENT = '#0d9488';

function fmtUsd(n: number): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: n < 100 ? 2 : 0,
    maximumFractionDigits: n < 100 ? 2 : 0,
  });
}

/** Default selection for a step = its first non-toggle configurable's default. */
function defaultSelections(chain: SupplyChainStep[]): Record<string, string> {
  const sel: Record<string, string> = {};
  for (const step of chain) {
    const priced = (step.configurable ?? []).find((c) => c.type !== 'toggle');
    if (priced) sel[step.id] = priced.default;
  }
  return sel;
}

export function SupplyChainTab() {
  const { commodityId } = useAppState();
  const commodity = getCommodity(commodityId)!;
  const chain = getChain(commodityId);
  const params = paramMap(commodityId);
  const { data: production } = useProduction(commodityId);
  const { data: spot } = useSpot(commodityId);

  // Editable cost-parameter overrides and configurable selections. Both are
  // local scenario state and reset whenever the active commodity changes.
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    defaultSelections(chain),
  );

  useEffect(() => {
    setOverrides({});
    setSelections(defaultSelections(chain));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commodityId]);

  const dirty = Object.keys(overrides).length > 0;

  const landed = useMemo(
    () => computeLandedCost(chain, params, overrides, selections, commodity.nativeUnit, spot?.price),
    [chain, params, overrides, selections, commodity.nativeUnit, spot?.price],
  );

  const maxStep = Math.max(...landed.steps.map((s) => s.cost), 0.0001);
  const margin = spot ? spot.price - landed.total : undefined;
  const marginPct = spot && spot.price > 0 ? (spot.price - landed.total) / spot.price : undefined;

  return (
    <div className="space-y-4 p-4">
      <Card
        title={`${commodity.name} — supply chain`}
        subtitle={`Benchmark: ${commodity.benchmark}`}
        right={
          spot && (
            <div className="text-right">
              <div className="text-lg font-semibold text-slate-900">
                ${spot.price.toLocaleString()}{' '}
                <span className="text-xs text-slate-500">/{spot.unit}</span>
              </div>
              <ProvenanceBadge provenance="SOURCED" source={spot.source} />
            </div>
          )
        }
      >
        <div className="text-xs text-slate-500">
          Top producing countries{' '}
          <ProvenanceBadge provenance="SOURCED" source="USGS/EIA (seed)" />
        </div>
        <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
          {(production ?? []).map((p) => (
            <li key={p.country} className="flex justify-between">
              <span className="text-slate-700">{p.country}</span>
              <span className="text-slate-500">
                {p.amount} {p.unit}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Landed-cost build-up (waterfall) */}
      <Card
        title="Modeled landed cost"
        subtitle={`Cost structure rolled up the chain — $/${landed.unit}`}
        right={<ProvenanceBadge provenance="MODELED" />}
      >
        <div className="space-y-1.5">
          {landed.steps.map((s) => {
            const pct = (s.cost / maxStep) * 100;
            const share = landed.total > 0 ? (s.cost / landed.total) * 100 : 0;
            return (
              <div key={s.stepId} className="flex items-center gap-3 text-xs">
                <div className="w-40 shrink-0 truncate text-slate-600" title={s.label}>
                  {s.order}. {s.label}
                </div>
                <div className="relative h-4 flex-1 rounded bg-slate-100">
                  <div
                    className="absolute inset-y-0 left-0 rounded"
                    style={{ width: `${pct}%`, backgroundColor: ACCENT, opacity: 0.85 }}
                  />
                </div>
                <div className="w-28 shrink-0 text-right tabular-nums text-slate-700">
                  ${fmtUsd(s.cost)}
                  <span className="ml-1 text-slate-400">{share.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Total landed cost</span>
            <span className="font-semibold tabular-nums text-slate-900">
              ${fmtUsd(landed.total)} <span className="text-xs text-slate-400">/{landed.unit}</span>
            </span>
          </div>
          {spot && (
            <>
              <div className="flex items-center justify-between text-slate-600">
                <span>
                  Live spot <ProvenanceBadge provenance="SOURCED" source={spot.source} />
                </span>
                <span className="tabular-nums">
                  ${spot.price.toLocaleString()} <span className="text-xs text-slate-400">/{spot.unit}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Implied margin (spot − landed)</span>
                <span
                  className={`font-semibold tabular-nums ${
                    (margin ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {(margin ?? 0) >= 0 ? '+' : '−'}${fmtUsd(Math.abs(margin ?? 0))}
                  {marginPct != null && (
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      ({(marginPct * 100).toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>
            </>
          )}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          A cost-structure estimate, not a sourced quote. Adjust the sliders and step options below to
          stress-test the build-up.
        </p>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Chain steps &amp; cost inputs
        </h2>
        {dirty && (
          <button
            type="button"
            onClick={() => setOverrides({})}
            className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
          >
            Reset to seed values
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {chain.map((step) => {
          const stepCost = landed.steps.find((s) => s.stepId === step.id)?.cost ?? 0;
          return (
            <Card
              key={step.id}
              title={`${step.order}. ${step.label}`}
              right={
                <span className="text-right text-xs tabular-nums font-semibold text-slate-900">
                  ${fmtUsd(stepCost)}
                  <span className="ml-0.5 text-[10px] font-normal text-slate-400">
                    /{landed.unit}
                  </span>
                </span>
              }
            >
              <p className="text-xs leading-snug text-slate-600">{step.description}</p>

              {/* Configurable step options (location / vessel / vault / toggles) */}
              {(step.configurable ?? []).map((cfg) => (
                <div key={cfg.label} className="mt-2">
                  <label className="block text-[11px] font-medium text-slate-500">{cfg.label}</label>
                  {cfg.type === 'toggle' ? (
                    <div className="mt-1 inline-flex overflow-hidden rounded border border-slate-200">
                      {cfg.options.map((opt) => {
                        const cur = selections[`${step.id}:${cfg.label}`] ?? cfg.default;
                        const active = cur === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setSelections((s) => ({ ...s, [`${step.id}:${cfg.label}`]: opt }))
                            }
                            className={`px-2 py-0.5 text-[11px] ${
                              active ? 'bg-slate-700 text-white' : 'bg-white text-slate-600'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                      <span className="self-center px-2 text-[10px] text-slate-400">scenario flag</span>
                    </div>
                  ) : (
                    <select
                      value={selections[step.id] ?? cfg.default}
                      onChange={(e) =>
                        setSelections((s) => ({ ...s, [step.id]: e.target.value }))
                      }
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
                    >
                      {cfg.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}

              {/* Editable cost-parameter sliders */}
              {step.costParamKeys.length > 0 && (
                <div className="mt-3 border-t border-slate-100 pt-2">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Cost inputs <ProvenanceBadge provenance="MODELED" />
                  </div>
                  <ul className="space-y-2.5 text-xs">
                    {step.costParamKeys.map((key) => {
                      const p = params[key];
                      if (!p) return null;
                      const value = overrides[key] ?? p.value;
                      const min = p.min ?? 0;
                      const max = p.max ?? Math.max(p.value * 2, 1);
                      const span = max - min;
                      const stepSize = span > 50 ? 1 : span > 5 ? 0.1 : 0.01;
                      const edited = overrides[key] != null && overrides[key] !== p.value;
                      return (
                        <li key={key}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-slate-600" title={p.sourceNote}>
                              {p.label}
                              {edited && <span className="ml-1 text-[10px] text-amber-600">edited</span>}
                            </span>
                            <span className="font-medium tabular-nums text-slate-900">
                              {value} <span className="text-slate-400">{p.unit}</span>
                            </span>
                          </div>
                          <input
                            type="range"
                            min={min}
                            max={max}
                            step={stepSize}
                            value={value}
                            onChange={(e) =>
                              setOverrides((o) => ({ ...o, [key]: Number(e.target.value) }))
                            }
                            className="mt-1 w-full accent-teal-600"
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
