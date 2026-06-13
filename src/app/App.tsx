import { useState } from 'react';
import { AppStateProvider } from './AppState';
import { CommoditySelector } from '@/components/CommoditySelector';
import { RouteMapTab } from '@/tabs/route-map/RouteMapTab';
import { SupplyChainTab } from '@/tabs/supply-chain/SupplyChainTab';
import { RatesTab } from '@/tabs/rates/RatesTab';
import { PortsTab } from '@/tabs/ports/PortsTab';
import { ResilienceTab } from '@/tabs/resilience/ResilienceTab';
import { ProjectsTab } from '@/tabs/projects/ProjectsTab';
import { BridgePowerTab } from '@/tabs/bridgepower/BridgePowerTab';
import { DATA_MODE } from '@/data/adapters';
import { track } from '@/lib/analytics';

type TabId = 'route' | 'supply' | 'ports' | 'rates' | 'resilience' | 'projects' | 'bridge';

const TABS: { id: TabId; label: string }[] = [
  { id: 'route', label: 'Route Map' },
  { id: 'supply', label: 'Supply Chain' },
  { id: 'ports', label: 'Ports' },
  { id: 'rates', label: 'Rates' },
  { id: 'resilience', label: 'Resilience' },
  { id: 'projects', label: 'Projects' },
  { id: 'bridge', label: 'Bridge Power' },
];

export function App() {
  const [tab, setTab] = useState<TabId>('route');

  return (
    <AppStateProvider>
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight text-slate-900">Tradewinds</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {DATA_MODE} data
            </span>
          </div>
          <CommoditySelector />
        </header>

        <nav className="flex gap-1 border-b border-slate-200 bg-white px-4">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  track('tab_viewed', { tab: t.id });
                }}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        <main className="min-h-0 flex-1 overflow-auto">
          {tab === 'route' && <RouteMapTab />}
          {tab === 'supply' && <SupplyChainTab />}
          {tab === 'ports' && <PortsTab />}
          {tab === 'rates' && <RatesTab />}
          {tab === 'resilience' && <ResilienceTab />}
          {tab === 'projects' && <ProjectsTab />}
          {tab === 'bridge' && <BridgePowerTab />}
        </main>
      </div>
    </AppStateProvider>
  );
}
