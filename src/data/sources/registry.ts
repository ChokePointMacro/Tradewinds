// ─────────────────────────────────────────────────────────────────────────────
// Source Registry — the catalog of REAL data sources behind every value.
//
// Production posture (owner directive 2026-06-12): no mock, no guesses. A value
// renders only if a connected source provides it; otherwise it errors out with a
// source-picker. Every source dropdown toggles free⇄paid, default FREE-first.
// Build exclusively on totally-free sources; paid options stay listed but
// render as opt-in "needs your key" — never auto-connected.
//
// `status` is the honest runtime state:
//   - 'live'      → adapter wired and usable right now (e.g. Yahoo prices)
//   - 'planned'   → free, but the live adapter isn't built yet
//   - 'needs-key' → requires an API key/subscription the owner must supply
// ─────────────────────────────────────────────────────────────────────────────

export type SourceTier = 'free' | 'paid';
export type SourceAccess = 'keyless' | 'free-key' | 'paid';
export type SourceStatus = 'live' | 'planned' | 'needs-key';

export interface SourceOption {
  id: string;
  name: string;
  provider: string;
  tier: SourceTier;
  access: SourceAccess; // keyless = no signup; free-key = free account; paid = subscription
  status: SourceStatus;
  coverage?: string;
  excludesCommodityIds?: string[]; // commodities this source does NOT cover
}

export type SourceDomain =
  | 'price'
  | 'production'
  | 'reserves'
  | 'netTrade'
  | 'portThroughput'
  | 'countryRisk'
  | 'chokepointFlow'
  | 'projects'
  | 'bridgePower';

export interface DomainSources {
  domain: SourceDomain;
  label: string;
  defaultId: string; // auto-selected free source
  options: SourceOption[];
}

// ── Commodity prices (Rates / Route overlay / Supply spot) ──
// Yahoo Finance is the keyless free default and the only LIVE source today. It
// covers every commodity EXCEPT nickel (no liquid keyless Yahoo future), so
// nickel honestly errors out until the owner opts into a paid metals feed.
const PRICE: DomainSources = {
  domain: 'price',
  label: 'Commodity prices',
  defaultId: 'yahoo',
  options: [
    {
      id: 'yahoo',
      name: 'Yahoo Finance',
      provider: 'Yahoo',
      tier: 'free',
      access: 'keyless',
      status: 'live',
      coverage: 'Front-month futures: crude, gold, silver, copper, palladium, diesel',
      excludesCommodityIds: ['nickel'],
    },
    {
      id: 'stooq',
      name: 'Stooq',
      provider: 'Stooq',
      tier: 'free',
      access: 'keyless',
      status: 'planned',
      coverage: 'End-of-day futures & FX (keyless CSV)',
    },
    {
      id: 'eia',
      name: 'EIA',
      provider: 'U.S. Energy Information Administration',
      tier: 'free',
      access: 'free-key',
      status: 'planned',
      coverage: 'Crude & refined products (US); free API key',
    },
    {
      id: 'lme',
      name: 'LME official',
      provider: 'London Metal Exchange',
      tier: 'paid',
      access: 'paid',
      status: 'needs-key',
      coverage: 'Base metals incl. nickel',
    },
    {
      id: 'metalsapi',
      name: 'Metals-API',
      provider: 'Metals-API',
      tier: 'paid',
      access: 'paid',
      status: 'needs-key',
      coverage: 'Metals incl. nickel',
    },
    {
      id: 'nasdaq',
      name: 'Nasdaq Data Link',
      provider: 'Nasdaq',
      tier: 'paid',
      access: 'paid',
      status: 'needs-key',
      coverage: 'Broad commodities & deep history',
    },
  ],
};

// Only domains with a populated catalog are wired so far. Others are added as
// each tab is converted off mock (see PRODUCTION_AUDIT.md).
const REGISTRY: Partial<Record<SourceDomain, DomainSources>> = {
  price: PRICE,
};

export function getDomainSources(domain: SourceDomain): DomainSources | undefined {
  return REGISTRY[domain];
}

export function getSourceOption(domain: SourceDomain, id: string): SourceOption | undefined {
  return getDomainSources(domain)?.options.find((o) => o.id === id);
}

/** True when the given source can actually serve this commodity right now. */
export function sourceCovers(option: SourceOption, commodityId: string): boolean {
  return option.status === 'live' && !(option.excludesCommodityIds ?? []).includes(commodityId);
}

export const REGISTERED_DOMAINS = Object.keys(REGISTRY) as SourceDomain[];
