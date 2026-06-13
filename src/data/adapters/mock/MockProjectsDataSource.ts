import type { EnergyProject } from '@/types';
import type { ProjectsDataSource } from '../types';
import { ENERGY_PROJECTS } from '@/data/projects/energyProjects';

// Serves the curated US energy-project seed (SOURCED, with per-project source
// URLs). A live cutover (EIA-860, BOEM, company filings) would slot in behind
// this same interface.
export class MockProjectsDataSource implements ProjectsDataSource {
  async getEnergyProjects(): Promise<EnergyProject[]> {
    return ENERGY_PROJECTS;
  }
}
