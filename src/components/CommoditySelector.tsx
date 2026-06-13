import { COMMODITIES } from '@/data/commodities';
import { useAppState } from '@/app/appStateContext';
import { track } from '@/lib/analytics';
import type { CommodityCategory } from '@/types';

// Display label + render order per category (groups the dropdown).
const CATEGORY_META: { id: CommodityCategory; label: string }[] = [
  { id: 'energy', label: 'Energy' },
  { id: 'precious_metal', label: 'Precious metals' },
  { id: 'base_metal', label: 'Base metals' },
  { id: 'rare_earth', label: 'Rare earths' },
  { id: 'gas', label: 'Gas' },
  { id: 'chemical', label: 'Chemicals' },
  { id: 'agriculture', label: 'Food & agriculture' },
  { id: 'fertilizer', label: 'Fertilizer' },
];

export function CommoditySelector() {
  const { commodityId, setCommodityId } = useAppState();
  return (
    <label className="flex items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Commodity
      </span>
      <select
        value={commodityId}
        onChange={(e) => {
          setCommodityId(e.target.value);
          track('commodity_selected', { commodityId: e.target.value });
        }}
        aria-label="Commodity"
        className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:border-slate-400"
      >
        {CATEGORY_META.map((cat) => {
          const items = COMMODITIES.filter((c) => c.category === cat.id);
          if (items.length === 0) return null;
          return (
            <optgroup key={cat.id} label={cat.label}>
              {items.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </label>
  );
}
