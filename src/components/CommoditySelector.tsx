import { COMMODITIES } from '@/data/commodities';
import { useAppState } from '@/app/appStateContext';
import { track } from '@/lib/analytics';

export function CommoditySelector() {
  const { commodityId, setCommodityId } = useAppState();
  return (
    <div className="flex items-center gap-1 rounded-md bg-slate-100 p-1">
      {COMMODITIES.map((c) => {
        const active = c.id === commodityId;
        return (
          <button
            key={c.id}
            onClick={() => {
              setCommodityId(c.id);
              track('commodity_selected', { commodityId: c.id });
            }}
            className={`rounded px-3 py-1 text-sm font-medium transition ${
              active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
