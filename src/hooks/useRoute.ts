import { useQuery } from '@tanstack/react-query';
import type { RouteRequest } from '@/types';
import { routeSource } from '@/data/adapters';

export function useRoute(req: RouteRequest | null) {
  return useQuery({
    queryKey: ['route', req],
    queryFn: () => routeSource.getRoute(req as RouteRequest),
    enabled: req !== null,
  });
}
