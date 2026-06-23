import type { Commodity, SupplyChainStep } from '@/types';
import { oil, oilChain } from './oil';
import { gold, goldChain } from './gold';
import { silver, silverChain } from './silver';
import { copper, copperChain } from './copper';
import { nickel, nickelChain } from './nickel';
import { palladium, palladiumChain } from './palladium';
import { diesel, dieselChain } from './diesel';
import {
  neodymium,
  dysprosium,
  reCompounds,
  ndfebMagnets,
  neodymiumChain,
  dysprosiumChain,
  reCompoundsChain,
  ndfebMagnetsChain,
} from './rareEarths';
import {
  lithium,
  cobalt,
  graphite,
  manganese,
  titanium,
  tungsten,
  uranium,
  lithiumChain,
  cobaltChain,
  graphiteChain,
  manganeseChain,
  titaniumChain,
  tungstenChain,
  uraniumChain,
} from './criticalMinerals';
import {
  integratedCircuits,
  semiconductorDevices,
  semiconEquipment,
  polysilicon,
  gallium,
  germanium,
  integratedCircuitsChain,
  semiconductorDevicesChain,
  semiconEquipmentChain,
  polysiliconChain,
  galliumChain,
  germaniumChain,
} from './semiconductors';
import {
  ammonia,
  methanol,
  ethylene,
  sulfuricAcid,
  causticSoda,
  ammoniaChain,
  methanolChain,
  ethyleneChain,
  sulfuricAcidChain,
  causticSodaChain,
} from './chemicals';
import {
  wheat,
  corn,
  soybeans,
  beef,
  pork,
  eggs,
  fertilizer,
  wheatChain,
  cornChain,
  soybeansChain,
  beefChain,
  porkChain,
  eggsChain,
  ureaChain,
} from './agriculture';

export const COMMODITIES: Commodity[] = [
  oil,
  diesel,
  gold,
  silver,
  palladium,
  copper,
  nickel,
  // Critical minerals
  lithium,
  cobalt,
  graphite,
  manganese,
  titanium,
  tungsten,
  uranium,
  // Rare earths
  neodymium,
  dysprosium,
  reCompounds,
  ndfebMagnets,
  // Semiconductors
  integratedCircuits,
  semiconductorDevices,
  semiconEquipment,
  polysilicon,
  gallium,
  germanium,
  // Chemicals
  ammonia,
  methanol,
  ethylene,
  sulfuricAcid,
  causticSoda,
  // Food & agriculture
  wheat,
  corn,
  soybeans,
  beef,
  pork,
  eggs,
  fertilizer,
];

export const CHAINS: Record<string, SupplyChainStep[]> = {
  crude_oil: oilChain,
  diesel: dieselChain,
  gold: goldChain,
  silver: silverChain,
  palladium: palladiumChain,
  copper: copperChain,
  nickel: nickelChain,
  lithium: lithiumChain,
  cobalt: cobaltChain,
  graphite: graphiteChain,
  manganese: manganeseChain,
  titanium: titaniumChain,
  tungsten: tungstenChain,
  uranium: uraniumChain,
  neodymium: neodymiumChain,
  dysprosium: dysprosiumChain,
  re_compounds: reCompoundsChain,
  ndfeb_magnets: ndfebMagnetsChain,
  integrated_circuits: integratedCircuitsChain,
  semiconductor_devices: semiconductorDevicesChain,
  semicon_equipment: semiconEquipmentChain,
  polysilicon: polysiliconChain,
  gallium: galliumChain,
  germanium: germaniumChain,
  ammonia: ammoniaChain,
  methanol: methanolChain,
  ethylene: ethyleneChain,
  sulfuric_acid: sulfuricAcidChain,
  caustic_soda: causticSodaChain,
  wheat: wheatChain,
  corn: cornChain,
  soybeans: soybeansChain,
  beef: beefChain,
  pork: porkChain,
  eggs: eggsChain,
  fertilizer: ureaChain,
};

export function getCommodity(id: string): Commodity | undefined {
  return COMMODITIES.find((c) => c.id === id);
}

export function getChain(commodityId: string): SupplyChainStep[] {
  return CHAINS[commodityId] ?? [];
}

export { oil, gold, silver, copper, nickel, palladium, diesel };
