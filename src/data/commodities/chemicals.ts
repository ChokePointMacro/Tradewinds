import type { Commodity, SupplyChainStep } from '@/types';

// Industrial chemicals — the feedstocks under the whole manufacturing base.
// The dominant cost and chokepoint is the FEEDSTOCK + ENERGY input: ammonia &
// methanol ride on natural gas (coal in China); ethylene on naphtha/ethane
// crackers; caustic soda on electricity (chlor-alkali) and is co-produced with
// chlorine in a fixed ratio; sulfuric acid is a by-product of oil/gas
// desulfurisation and metal smelting, so supply is inelastic to price.
//
// No free real-time price feed exists for any (Argus/ICIS/Platts/CRU are paid),
// so priceSymbol is empty and live price errors out (source-or-error). Trade
// (Comtrade) and production (USGS / industry) are wired.

interface ChemChainOpts {
  feedstockLabel: string;
  feedstockDesc: string;
  prodLabel: string;
  prodDesc: string;
  prodCountry: string;
}

function chemChain(id: string, o: ChemChainOpts): SupplyChainStep[] {
  return [
    {
      id: `${id}_feedstock`,
      order: 1,
      key: 'extraction',
      label: o.feedstockLabel,
      description: o.feedstockDesc,
      specifics: {},
      costParamKeys: [`${id}.feedstock`],
    },
    {
      id: `${id}_production`,
      order: 2,
      key: 'processing',
      label: o.prodLabel,
      description: o.prodDesc,
      specifics: { dominantSupplier: o.prodCountry },
      costParamKeys: [`${id}.production`],
    },
    {
      id: `${id}_distribution`,
      order: 3,
      key: 'storage',
      label: 'Distribution',
      description: 'Specialised tank/ISO freight, terminals and storage.',
      specifics: {},
      costParamKeys: [`${id}.freight`],
    },
  ];
}

export const ammonia: Commodity = {
  id: 'ammonia',
  name: 'Ammonia',
  category: 'chemical',
  nativeUnit: 'tonne',
  benchmark: 'Ammonia CFR Tampa / FOB Black Sea (Argus)',
  priceSymbol: '',
  chainTemplateId: 'chain_chemical',
};

export const methanol: Commodity = {
  id: 'methanol',
  name: 'Methanol',
  category: 'chemical',
  nativeUnit: 'tonne',
  benchmark: 'Methanex reference / CFR China (ICIS)',
  priceSymbol: '',
  chainTemplateId: 'chain_chemical',
};

export const ethylene: Commodity = {
  id: 'ethylene',
  name: 'Ethylene',
  category: 'chemical',
  nativeUnit: 'tonne',
  benchmark: 'Ethylene CFR NE Asia / FD NWE (ICIS)',
  priceSymbol: '',
  chainTemplateId: 'chain_chemical',
};

export const sulfuricAcid: Commodity = {
  id: 'sulfuric_acid',
  name: 'Sulfuric acid',
  category: 'chemical',
  nativeUnit: 'tonne',
  benchmark: 'Sulfuric acid FOB (Argus)',
  priceSymbol: '',
  chainTemplateId: 'chain_chemical',
};

export const causticSoda: Commodity = {
  id: 'caustic_soda',
  name: 'Caustic soda',
  category: 'chemical',
  nativeUnit: 'tonne',
  benchmark: 'Caustic soda FOB NE Asia, 100% basis (ICIS)',
  priceSymbol: '',
  chainTemplateId: 'chain_chemical',
};

export const ammoniaChain = chemChain('ammonia', {
  feedstockLabel: 'Natural gas / coal feedstock',
  feedstockDesc: 'Steam methane reforming (~70% of capacity); coal gasification in China. ~70–90% of cash cost.',
  prodLabel: 'Haber-Bosch synthesis',
  prodDesc: 'Ammonia synthesis — China ~29% of world output (contained N).',
  prodCountry: 'China',
});
export const methanolChain = chemChain('methanol', {
  feedstockLabel: 'Natural gas / coal feedstock',
  feedstockDesc: 'Gas reforming globally; coal-to-methanol dominant in China.',
  prodLabel: 'Methanol synthesis',
  prodDesc: 'Syngas → methanol — China ~45–50% of world capacity (coal route).',
  prodCountry: 'China',
});
export const ethyleneChain = chemChain('ethylene', {
  feedstockLabel: 'Naphtha / ethane feedstock',
  feedstockDesc: 'Ethane crackers (US/Mideast, low-cost) vs naphtha crackers (Asia/Europe, marginal).',
  prodLabel: 'Steam cracking',
  prodDesc: 'Cracking to ethylene monomer — mostly captive; merchant trade understates the market.',
  prodCountry: 'China / US',
});
export const sulfuricAcidChain = chemChain('sulfuric_acid', {
  feedstockLabel: 'Sulfur (by-product)',
  feedstockDesc: 'Sulfur recovered from oil/gas desulfurisation and metal smelting — supply is inelastic.',
  prodLabel: 'Sulfur burning / smelter acid',
  prodDesc: 'Contact-process H₂SO₄; also a smelter (Cu/Ni/Zn) by-product. China-led.',
  prodCountry: 'China',
});
export const causticSodaChain = chemChain('caustic_soda', {
  feedstockLabel: 'Salt brine + electricity',
  feedstockDesc: 'Chlor-alkali electrolysis — power is the swing cost (~2,200 kWh/t NaOH).',
  prodLabel: 'Chlor-alkali electrolysis',
  prodDesc: 'Co-produced with chlorine in a fixed ~1.1:1 ratio — supply driven by chlorine/PVC demand. China ~40–45%.',
  prodCountry: 'China',
});
