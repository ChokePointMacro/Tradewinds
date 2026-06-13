import { useQuery } from '@tanstack/react-query';
import { projectsDataSource } from '@/data/adapters';

export function useEnergyProjects() {
  return useQuery({
    queryKey: ['energyProjects'],
    queryFn: () => projectsDataSource.getEnergyProjects(),
  });
}
