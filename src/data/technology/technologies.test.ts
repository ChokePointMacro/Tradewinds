import { describe, expect, it } from 'vitest';
import { COMMODITIES } from '@/data/commodities';
import {
  TECHNOLOGIES,
  technologyById,
  technologiesForCommodity,
} from './technologies';

const COMMODITY_IDS = new Set(COMMODITIES.map((c) => c.id));

describe('technology → mineral → processing layer (Recommendation 2)', () => {
  it('every technology has an id, a scale window and a non-empty BOM', () => {
    for (const t of TECHNOLOGIES) {
      expect(t.id).toBeTruthy();
      expect(t.scaleWindow).toMatch(/\d{4}/);
      expect(t.bom.length).toBeGreaterThan(0);
      expect(t.source).toMatch(/ChokepointMacro/);
    }
  });

  it('BOM rows that name a commodityId reference a real commodity', () => {
    for (const t of TECHNOLOGIES) {
      for (const b of t.bom) {
        if (b.commodityId) expect(COMMODITY_IDS.has(b.commodityId)).toBe(true);
      }
    }
  });

  it('resolves the reverse lens: NdFeB motors pull on neodymium', () => {
    const techs = technologiesForCommodity('neodymium');
    expect(techs.some((t) => t.id === 'ndfeb_motors')).toBe(true);
  });

  it('models the HALEU fuel cycle as enrichment-gated', () => {
    const haleu = technologyById('haleu_smr')!;
    const fuel = haleu.bom.find((b) => b.commodityId === 'uranium')!;
    expect(fuel.processingStep).toMatch(/enrichment/i);
  });

  it('flags substitution levers (sodium-ion, LFP, recycling) that lower exposure', () => {
    expect(technologyById('sodium_ion')!.isSubstitution).toBe(true);
    expect(technologyById('lfp_lmfp')!.isSubstitution).toBe(true);
    expect(technologyById('magnet_battery_recycling')!.isSubstitution).toBe(true);
  });
});
