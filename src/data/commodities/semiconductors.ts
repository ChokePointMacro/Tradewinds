import type { Commodity, SupplyChainStep } from '@/types';

// Semiconductor value chain. Two failure modes dominate: advanced-logic
// FABRICATION (TSMC / Taiwan, >90% of sub-7nm) and EUV LITHOGRAPHY EQUIPMENT
// (ASML / Netherlands, a 100% monopoly). Upstream feedstocks gallium &
// germanium are ~98% / ~60% China and under Chinese export licensing (Aug 2023).
//
// All items are heterogeneous, non-fungible, or capital goods → no free price
// feed; priceSymbol is empty and live price errors out (source-or-error). ICs,
// devices and equipment trade by USD value (nominal nativeUnit 'tonne'); the
// trade overlay is value-based so this is honest. Materials trade by weight.

interface DeviceChainOpts {
  fabLabel: string;
  fabDesc: string;
  fabCountry: string;
}

function deviceChain(id: string, o: DeviceChainOpts): SupplyChainStep[] {
  return [
    {
      id: `${id}_design`,
      order: 1,
      key: 'design',
      label: 'Design (EDA / IP)',
      description: 'Chip design, EDA tools and IP cores (US/EU-led: Synopsys, Cadence, Arm).',
      specifics: {},
      costParamKeys: [`${id}.design`],
    },
    {
      id: `${id}_fab`,
      order: 2,
      key: 'processing',
      label: o.fabLabel,
      description: o.fabDesc,
      specifics: { dominantSupplier: o.fabCountry },
      costParamKeys: [`${id}.fab`],
    },
    {
      id: `${id}_atp`,
      order: 3,
      key: 'refining',
      label: 'Assembly, test & packaging (ATP)',
      description: 'Back-end packaging and test — concentrated in China, Taiwan and SE Asia.',
      specifics: {},
      costParamKeys: [`${id}.assembly`],
    },
    {
      id: `${id}_logistics`,
      order: 4,
      key: 'storage',
      label: 'Logistics',
      description: 'High-value air freight and bonded warehousing of finished devices.',
      specifics: {},
      costParamKeys: [`${id}.logistics`],
    },
  ];
}

function materialChain(
  id: string,
  o: { prodDesc: string; purifyDesc: string; dominant: string },
): SupplyChainStep[] {
  return [
    {
      id: `${id}_production`,
      order: 1,
      key: 'extraction',
      label: 'Primary production',
      description: o.prodDesc,
      specifics: {},
      costParamKeys: [`${id}.production`],
    },
    {
      id: `${id}_purify`,
      order: 2,
      key: 'refining',
      label: 'Purification (high-purity)',
      description: o.purifyDesc,
      specifics: { dominantSupplier: o.dominant },
      costParamKeys: [`${id}.purification`],
    },
    {
      id: `${id}_logistics`,
      order: 3,
      key: 'storage',
      label: 'Logistics',
      description: 'Specialised packaging and freight of high-purity material.',
      specifics: {},
      costParamKeys: [`${id}.freight`],
    },
  ];
}

export const integratedCircuits: Commodity = {
  id: 'integrated_circuits',
  name: 'Integrated circuits',
  category: 'semiconductor',
  nativeUnit: 'tonne',
  benchmark: 'WSTS IC market (no free feed)',
  priceSymbol: '',
  chainTemplateId: 'chain_semi_device',
};

export const semiconductorDevices: Commodity = {
  id: 'semiconductor_devices',
  name: 'Diodes & transistors',
  category: 'semiconductor',
  nativeUnit: 'tonne',
  benchmark: 'WSTS discretes (no free feed)',
  priceSymbol: '',
  chainTemplateId: 'chain_semi_device',
};

export const semiconEquipment: Commodity = {
  id: 'semicon_equipment',
  name: 'Fab & litho equipment',
  category: 'semiconductor',
  nativeUnit: 'tonne',
  benchmark: 'SEMI equipment billings (no free feed)',
  priceSymbol: '',
  chainTemplateId: 'chain_semi_equipment',
};

export const polysilicon: Commodity = {
  id: 'polysilicon',
  name: 'Polysilicon',
  category: 'semiconductor',
  nativeUnit: 'tonne',
  benchmark: 'Polysilicon marker (Bernreuter)',
  priceSymbol: '',
  chainTemplateId: 'chain_semi_material',
};

export const gallium: Commodity = {
  id: 'gallium',
  name: 'Gallium',
  category: 'semiconductor',
  nativeUnit: 'kg',
  benchmark: 'Gallium 99.99% (USGS/Argus)',
  priceSymbol: '',
  chainTemplateId: 'chain_semi_material',
};

export const germanium: Commodity = {
  id: 'germanium',
  name: 'Germanium',
  category: 'semiconductor',
  nativeUnit: 'kg',
  benchmark: 'Germanium metal 5N (USGS/Argus)',
  priceSymbol: '',
  chainTemplateId: 'chain_semi_material',
};

export const integratedCircuitsChain = deviceChain('integrated_circuits', {
  fabLabel: 'Wafer fabrication (advanced logic/memory)',
  fabDesc:
    'Front-end fab — advanced logic >90% TSMC/Taiwan; DRAM Korea/US, NAND Korea/Japan.',
  fabCountry: 'Taiwan',
});
export const semiconductorDevicesChain = deviceChain('semiconductor_devices', {
  fabLabel: 'Wafer fabrication (discretes/power)',
  fabDesc:
    'Power/discrete device fab — more diversified (Infineon, onsemi, STMicro, Japan, China).',
  fabCountry: 'China / Japan / EU',
});

export const semiconEquipmentChain: SupplyChainStep[] = [
  {
    id: 'semicon_equipment_optics',
    order: 1,
    key: 'processing',
    label: 'Precision optics & subsystems',
    description: 'EUV optics (Zeiss), lasers (Trumpf/Cymer), precision components.',
    specifics: { dominantSupplier: 'Germany / US / Japan' },
    costParamKeys: ['semicon_equipment.subsystems'],
  },
  {
    id: 'semicon_equipment_integration',
    order: 2,
    key: 'refining',
    label: 'System integration (lithography)',
    description: 'EUV scanner integration — ASML (Netherlands) is the sole producer.',
    specifics: { dominantSupplier: 'Netherlands (ASML)' },
    costParamKeys: ['semicon_equipment.integration'],
  },
  {
    id: 'semicon_equipment_install',
    order: 3,
    key: 'storage',
    label: 'Install & field service',
    description: 'Shipment, on-site install and lifetime service at fabs (Taiwan/Korea/China/US).',
    specifics: {},
    costParamKeys: ['semicon_equipment.install'],
  },
];

export const polysiliconChain = materialChain('polysilicon', {
  prodDesc: 'Siemens-process polysilicon — solar-grade ~China-dominated; electronic-grade Wacker/Hemlock/Tokuyama.',
  purifyDesc: 'Purification to 9N–11N electronic grade and pull into 300mm prime wafers (Shin-Etsu/SUMCO).',
  dominant: 'China (solar) / Japan (wafers)',
});
export const galliumChain = materialChain('gallium', {
  prodDesc: 'Primary low-purity gallium recovered as a by-product of alumina — ~98% China.',
  purifyDesc: 'Refining to 4N–7N high-purity gallium for GaAs/GaN; China export licensing since Aug 2023.',
  dominant: 'China (~98%)',
});
export const germaniumChain = materialChain('germanium', {
  prodDesc: 'Germanium recovered from zinc residues & coal fly ash — China the leading producer (~60%).',
  purifyDesc: 'Zone-refined to 5N–6N metal / GeO₂ for fibre optics, IR optics, space solar; China licensing since Aug 2023.',
  dominant: 'China (~60%)',
});
