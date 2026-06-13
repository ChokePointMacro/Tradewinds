import { useQuery } from '@tanstack/react-query';
import { priceSource } from '@/data/adapters';

// Prices are live-or-error now (no mock fallback). Keep retries low so an
// uncovered commodity (e.g. nickel on the keyless feed) surfaces its no-source
// state promptly instead of spinning through the default retry budget.
export function useSpot(commodityId: string) {
  return useQuery({
    queryKey: ['spot', commodityId],
    queryFn: () => priceSource.getSpot(commodityId),
    retry: 1,
  });
}

export function useHistory(commodityId: string, fromISO: string, toISO: string) {
  return useQuery({
    queryKey: ['history', commodityId, fromISO, toISO],
    queryFn: () => priceSource.getHistory(commodityId, fromISO, toISO),
    retry: 1,
  });
}
