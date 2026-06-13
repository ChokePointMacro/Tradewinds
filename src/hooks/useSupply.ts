import { useQuery } from '@tanstack/react-query';
import { supplyDataSource } from '@/data/adapters';
import type { PortTradeDetail } from '@/types';

export function useProduction(commodityId: string) {
  return useQuery({
    queryKey: ['production', commodityId],
    queryFn: () => supplyDataSource.getProductionByCountry(commodityId),
  });
}

export function useReserves(commodityId: string) {
  return useQuery({
    queryKey: ['reserves', commodityId],
    queryFn: () => supplyDataSource.getReserves(commodityId),
  });
}

export function useNetTrade(commodityId: string) {
  return useQuery({
    queryKey: ['netTrade', commodityId],
    queryFn: () => supplyDataSource.getNetTrade(commodityId),
  });
}

export function usePortActivity(commodityId: string) {
  return useQuery({
    queryKey: ['portActivity', commodityId],
    queryFn: () => supplyDataSource.getPortActivity(commodityId),
  });
}

// Port "Trade detail" — fetched live-or-error from the Comtrade proxy (no seed
// fallback). Without a connected key the proxy 503s and the UI shows a picker.
export function usePortTrade(commodityId: string, country: string) {
  return useQuery({
    queryKey: ['portTrade', commodityId, country],
    enabled: country.length > 0,
    retry: 1,
    queryFn: async (): Promise<PortTradeDetail> => {
      const qs = new URLSearchParams({ commodity: commodityId, country });
      const res = await fetch(`/api/comtrade/port-trade?${qs.toString()}`);
      if (!res.ok) throw new Error(`port-trade HTTP ${res.status}`);
      return (await res.json()) as PortTradeDetail;
    },
  });
}
