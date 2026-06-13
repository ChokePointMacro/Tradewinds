import { describe, expect, it } from 'vitest';
import {
  getDomainSources,
  getSourceOption,
  sourceCovers,
  type SourceOption,
} from './registry';

describe('source registry', () => {
  it('has a price domain whose default is a free, live, keyless source', () => {
    const price = getDomainSources('price')!;
    expect(price).toBeDefined();
    const def = price.options.find((o) => o.id === price.defaultId)!;
    expect(def).toBeDefined();
    expect(def.tier).toBe('free');
    expect(def.status).toBe('live');
    expect(def.access).toBe('keyless');
  });

  it('lists at least one free option per registered domain (free-first)', () => {
    const price = getDomainSources('price')!;
    expect(price.options.some((o) => o.tier === 'free')).toBe(true);
  });

  it('marks every paid option as needing a key (never auto-connected)', () => {
    const price = getDomainSources('price')!;
    for (const o of price.options.filter((o) => o.tier === 'paid')) {
      expect(o.status).toBe('needs-key');
      expect(o.access).toBe('paid');
    }
  });

  it('every option carries the required descriptive fields', () => {
    const price = getDomainSources('price')!;
    for (const o of price.options) {
      expect(o.id).toBeTruthy();
      expect(o.name).toBeTruthy();
      expect(o.provider).toBeTruthy();
      expect(['free', 'paid']).toContain(o.tier);
      expect(['keyless', 'free-key', 'paid']).toContain(o.access);
      expect(['live', 'planned', 'needs-key']).toContain(o.status);
    }
  });

  it('Yahoo is live and covers majors but explicitly excludes nickel', () => {
    const yahoo = getSourceOption('price', 'yahoo')!;
    expect(yahoo.status).toBe('live');
    expect(sourceCovers(yahoo, 'gold')).toBe(true);
    expect(sourceCovers(yahoo, 'crude_oil')).toBe(true);
    expect(sourceCovers(yahoo, 'nickel')).toBe(false);
  });

  it('sourceCovers is false for non-live sources even without an exclusion', () => {
    const planned: SourceOption = {
      id: 'x',
      name: 'X',
      provider: 'X',
      tier: 'free',
      access: 'keyless',
      status: 'planned',
    };
    expect(sourceCovers(planned, 'gold')).toBe(false);
  });

  it('returns undefined for an unregistered domain', () => {
    expect(getDomainSources('countryRisk')).toBeUndefined();
  });
});
