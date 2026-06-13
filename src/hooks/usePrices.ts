import { useQuery } from '@tanstack/react-query';
import { priceSource } from '@/data/adapters';

export function useSpot(commodityId: string) {
  return useQuery({
    queryKey: ['spot', commodityId],
    queryFn: () => priceSource.getSpot(commodityId),
  });
}

export function useHistory(commodityId: string, fromISO: string, toISO: string) {
  return useQuery({
    queryKey: ['history', commodityId, fromISO, toISO],
    queryFn: () => priceSource.getHistory(commodityId, fromISO, toISO),
  });
}
