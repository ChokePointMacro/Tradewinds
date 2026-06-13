import { useQuery } from '@tanstack/react-query';
import { supplyDataSource } from '@/data/adapters';

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
