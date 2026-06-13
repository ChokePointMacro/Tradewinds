import type { BridgePowerDeployment, EnergyProject } from '@/types';
import type { ProjectsDataSource } from '../types';
import { ENERGY_PROJECTS } from '@/data/projects/energyProjects';
import { BRIDGE_POWER } from '@/data/bridgepower/bridgePower';

// Serves the curated US energy-project + data-center bridge-power seeds (SOURCED,
// with per-row source URLs). A live cutover (EIA-860, BOEM, company filings)
// would slot in behind this same interface.
export class MockProjectsDataSource implements ProjectsDataSource {
  async getEnergyProjects(): Promise<EnergyProject[]> {
    return ENERGY_PROJECTS;
  }

  async getBridgePower(): Promise<BridgePowerDeployment[]> {
    return BRIDGE_POWER;
  }
}
