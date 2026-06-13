import type { Commodity, SupplyChainStep } from '@/types';
import { oil, oilChain } from './oil';
import { gold, goldChain } from './gold';
import { silver, silverChain } from './silver';
import { copper, copperChain } from './copper';
import { nickel, nickelChain } from './nickel';
import { palladium, palladiumChain } from './palladium';
import { diesel, dieselChain } from './diesel';
import { neodymium, dysprosium } from './rareEarths';
import { wheat, corn, soybeans, beef, pork, eggs, fertilizer } from './agriculture';

export const COMMODITIES: Commodity[] = [
  oil,
  diesel,
  gold,
  silver,
  palladium,
  copper,
  nickel,
  neodymium,
  dysprosium,
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
};

export function getCommodity(id: string): Commodity | undefined {
  return COMMODITIES.find((c) => c.id === id);
}

export function getChain(commodityId: string): SupplyChainStep[] {
  return CHAINS[commodityId] ?? [];
}

export { oil, gold, silver, copper, nickel, palladium, diesel };
