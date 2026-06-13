import { useMemo, useState, type ReactNode } from 'react';
import { COMMODITIES } from '@/data/commodities';
import { AppStateContext } from './appStateContext';

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [commodityId, setCommodityId] = useState<string>(COMMODITIES[0]!.id);
  const value = useMemo(() => ({ commodityId, setCommodityId }), [commodityId]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
