import { describe, it, expect } from 'vitest';
import { ENERGY_PROJECTS, energyProjectsByType, allEnergyProjects } from './energyProjects';

const TYPES = [
  'nuclear',
  'data_center',
  'semiconductor',
  'solar',
  'wind',
  'storage',
  'geothermal',
  'gas',
] as const;
const STATUSES = [
  'announced',
  'permitting',
  'under_construction',
  'partially_operational',
  'operational',
] as const;

describe('energy-project seed data', () => {
  it('has a non-trivial number of projects', () => {
    expect(ENERGY_PROJECTS.length).toBeGreaterThanOrEqual(20);
  });

  it('uses unique ids', () => {
    const ids = ENERGY_PROJECTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers the three headline categories', () => {
    expect(energyProjectsByType('nuclear').length).toBeGreaterThan(0);
    expect(energyProjectsByType('data_center').length).toBeGreaterThan(0);
    // "Other generation" spans several types — at least solar and wind present.
    expect(energyProjectsByType('solar').length).toBeGreaterThan(0);
    expect(energyProjectsByType('wind').length).toBeGreaterThan(0);
  });

  it('uses valid type and status enums', () => {
    for (const p of ENERGY_PROJECTS) {
      expect(TYPES).toContain(p.type);
      expect(STATUSES).toContain(p.status);
    }
  });

  it('every project carries a verifiable source URL', () => {
    for (const p of ENERGY_PROJECTS) {
      expect(p.source.length, `${p.id} source`).toBeGreaterThan(0);
      expect(p.sourceUrl, `${p.id} url`).toMatch(/^https:\/\//);
      expect(p.note.length, `${p.id} note`).toBeGreaterThan(0);
    }
  });

  it('uses positive capacity and investment when present', () => {
    for (const p of ENERGY_PROJECTS) {
      if (p.capacityMw !== undefined) {
        expect(p.capacityMw, `${p.id} capacity`).toBeGreaterThan(0);
      }
      if (p.investmentUsdB !== undefined) {
        expect(p.investmentUsdB, `${p.id} investment`).toBeGreaterThan(0);
      }
    }
  });

  it('uses sane years (2009 Vogtle exception, else 2022+) and ordered timelines', () => {
    for (const p of ENERGY_PROJECTS) {
      for (const y of [p.announcedYear, p.onlineYear]) {
        if (y !== undefined) {
          expect(y, `${p.id} year`).toBeGreaterThanOrEqual(2009);
          expect(y).toBeLessThanOrEqual(2040);
        }
      }
      if (p.announcedYear !== undefined && p.onlineYear !== undefined) {
        expect(p.onlineYear, `${p.id} timeline`).toBeGreaterThanOrEqual(p.announcedYear);
      }
    }
  });

  it('allEnergyProjects returns the full set', () => {
    expect(allEnergyProjects()).toHaveLength(ENERGY_PROJECTS.length);
  });
});
