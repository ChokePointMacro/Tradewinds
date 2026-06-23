import { describe, expect, it } from 'vitest';
import { PROCESSING, processingFor } from './processingConcentration';

describe('processing-concentration register', () => {
  it('returns null for commodities with no midstream entry', () => {
    expect(processingFor('gold')).toBeNull();
    expect(processingFor('does_not_exist')).toBeNull();
  });

  it('every row is internally consistent and well-formed', () => {
    for (const [id, p] of Object.entries(PROCESSING)) {
      expect(p.commodityId).toBe(id);
      expect(p.sharePct).toBeGreaterThan(0);
      expect(p.sharePct).toBeLessThanOrEqual(100);
      expect([1, 2, 3]).toContain(p.layer);
      expect(p.step.length).toBeGreaterThan(0);
      expect(p.note.length).toBeGreaterThan(0);
      expect(p.source).toMatch(/ChokepointMacro/);
    }
  });

  it('encodes the report headline shares: gallium ~99%, REE separation ~90%, tungsten ~83%', () => {
    expect(processingFor('gallium')!.sharePct).toBe(99);
    expect(processingFor('neodymium')!.sharePct).toBe(90);
    expect(processingFor('tungsten')!.sharePct).toBe(83);
  });

  it('models uranium as a Layer-3 ENRICHMENT chokepoint, not a mining one', () => {
    const u = processingFor('uranium')!;
    expect(u.layer).toBe(3);
    expect(u.kind).toBe('enrichment');
    expect(u.leadingCountry).toBe('Russia');
  });

  it('places magnet-making in Layer 2 (manufacturing) and recovery metals in Layer 1', () => {
    expect(processingFor('ndfeb_magnets')!.layer).toBe(2);
    expect(processingFor('ndfeb_magnets')!.kind).toBe('manufacturing');
    expect(processingFor('gallium')!.kind).toBe('recovery');
  });
});
