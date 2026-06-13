import type { EnergyProject, EnergyProjectType } from '@/types';

// Bridges the Projects tab back to the core commodity engine: translate the
// tracked US energy buildout into the *implied* demand it places on the metals
// this app prices (copper, silver). These are MODELED order-of-magnitude
// estimates — capacity × a metal-intensity factor — NOT reported figures.
//
// Intensity factors (tonnes of metal per MW of capacity):
// - Copper, generation: IEA, "The Role of Critical Minerals in Clean Energy
//   Transitions" (2021), Fig. material intensity by technology. Offshore-wind
//   value includes inter-array + export cabling (the seed's wind projects are
//   offshore). Data-center value is a power-chain estimate (transformers,
//   busways, distribution + cabling) and carries a wide real-world range.
// - Silver: crystalline-silicon PV cell metallization, ~15 t/GW = 0.015 t/MW
//   (Silver Institute / IEA recent-generation cell silver loadings).
//
// Storage co-located with solar (battery nickel/lithium) is NOT estimated:
// the seed records co-location in capacityNote but does not size storage energy
// (MWh), so any nickel figure would be invented. We surface that caveat instead.

export const COPPER_T_PER_MW: Partial<Record<EnergyProjectType, number>> = {
  data_center: 20, // power-chain copper; real range ~15–27 t/MW
  wind: 8, // offshore-weighted, incl. array + export cabling
  solar: 2.8,
  geothermal: 1.7,
  storage: 1.4,
  nuclear: 1.4,
  gas: 1.1,
};

export const SILVER_T_PER_MW: Partial<Record<EnergyProjectType, number>> = {
  solar: 0.015, // c-Si PV metallization only
};

export interface CommodityDemandEstimate {
  commodityId: 'copper' | 'silver';
  label: string;
  tonnes: number; // total implied demand, metric tonnes
  displayValue: number; // tonnes converted to the display unit
  unit: string; // display unit: 'kt' (kilotonnes) or 't'
  contributingProjects: number; // projects with disclosed capacity AND a factor
  contributingMw: number; // capacity basis used
  basisNote: string;
}

function sumIntensity(
  projects: EnergyProject[],
  factors: Partial<Record<EnergyProjectType, number>>,
): { tonnes: number; projects: number; mw: number } {
  let tonnes = 0;
  let count = 0;
  let mw = 0;
  for (const p of projects) {
    if (p.capacityMw === undefined) continue;
    const factor = factors[p.type];
    if (factor === undefined) continue;
    tonnes += p.capacityMw * factor;
    mw += p.capacityMw;
    count += 1;
  }
  return { tonnes, projects: count, mw };
}

// Computes implied copper + silver demand for a set of projects. Honest by
// construction: only projects that disclose capacity AND have a credible
// intensity factor for their type contribute; commodities with zero implied
// demand from the given set are omitted (e.g. silver when no solar is present).
export function impliedCommodityDemand(projects: EnergyProject[]): CommodityDemandEstimate[] {
  const out: CommodityDemandEstimate[] = [];

  const cu = sumIntensity(projects, COPPER_T_PER_MW);
  if (cu.tonnes > 0) {
    out.push({
      commodityId: 'copper',
      label: 'Copper',
      tonnes: cu.tonnes,
      displayValue: cu.tonnes / 1000,
      unit: 'kt',
      contributingProjects: cu.projects,
      contributingMw: cu.mw,
      basisNote: 'Generation + data-center power-chain and grid copper.',
    });
  }

  const ag = sumIntensity(projects, SILVER_T_PER_MW);
  if (ag.tonnes > 0) {
    out.push({
      commodityId: 'silver',
      label: 'Silver',
      tonnes: ag.tonnes,
      displayValue: ag.tonnes,
      unit: 't',
      contributingProjects: ag.projects,
      contributingMw: ag.mw,
      basisNote: 'Crystalline-silicon PV cell metallization (solar only).',
    });
  }

  return out;
}
