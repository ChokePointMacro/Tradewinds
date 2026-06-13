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
  | 'tradeByItem'
  | 'tradePartners'
  | 'tradeCompanies'
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

// ── Production by country ──
// Official free agency datasets (USGS metals + EIA oil) are the live default;
// paid intelligence providers are opt-in upgrades.
const PRODUCTION: DomainSources = {
  domain: 'production',
  label: 'Production by country',
  defaultId: 'official',
  options: [
    {
      id: 'official',
      name: 'USGS MCS / EIA',
      provider: 'USGS & U.S. EIA',
      tier: 'free',
      access: 'keyless',
      status: 'live',
      coverage: 'Mine production (USGS) + oil/products (EIA), annual',
    },
    {
      id: 'woodmac',
      name: 'Wood Mackenzie',
      provider: 'Wood Mackenzie',
      tier: 'paid',
      access: 'paid',
      status: 'needs-key',
      coverage: 'Asset-level mine & field production',
    },
    {
      id: 'cru',
      name: 'CRU Group',
      provider: 'CRU',
      tier: 'paid',
      access: 'paid',
      status: 'needs-key',
      coverage: 'Metals supply intelligence',
    },
  ],
};

// ── Reserves by country ──
const RESERVES: DomainSources = {
  domain: 'reserves',
  label: 'Reserves by country',
  defaultId: 'official',
  options: [
    {
      id: 'official',
      name: 'USGS MCS / EIA',
      provider: 'USGS & U.S. EIA',
      tier: 'free',
      access: 'keyless',
      status: 'live',
      coverage: 'Reserves (USGS metals) + proved reserves (EIA oil), annual',
    },
    {
      id: 'woodmac',
      name: 'Wood Mackenzie',
      provider: 'Wood Mackenzie',
      tier: 'paid',
      access: 'paid',
      status: 'needs-key',
      coverage: 'Asset-level reserves',
    },
  ],
};

// ── Port throughput ──
// Curated public rankings are the free default; IMF PortWatch (free, AIS-based)
// is a keyless upgrade once wired; vessel-tracking vendors are paid opt-in.
const PORT_THROUGHPUT: DomainSources = {
  domain: 'portThroughput',
  label: 'Port throughput',
  defaultId: 'rankings',
  options: [
    {
      id: 'rankings',
      name: "Port rankings (Lloyd's / WSC / EIA-JODI)",
      provider: 'Public rankings',
      tier: 'free',
      access: 'keyless',
      status: 'live',
      coverage: 'Headline commodity throughput by port, annual',
    },
    {
      id: 'portwatch',
      name: 'IMF PortWatch',
      provider: 'IMF',
      tier: 'free',
      access: 'keyless',
      status: 'planned',
      coverage: 'AIS-based daily port calls & trade volume',
    },
    {
      id: 'kpler',
      name: 'Kpler',
      provider: 'Kpler',
      tier: 'paid',
      access: 'paid',
      status: 'needs-key',
      coverage: 'Vessel-tracked commodity flows by port',
    },
  ],
};

// ── Trade by item (export/import composition) ──
// UN Comtrade gives item composition at the country level (free, your key);
// port-level item mix is vendor-only (paid).
const TRADE_BY_ITEM: DomainSources = {
  domain: 'tradeByItem',
  label: 'Export / import share by item',
  defaultId: 'comtrade',
  options: [
    {
      id: 'comtrade',
      name: 'UN Comtrade',
      provider: 'UN',
      tier: 'free',
      access: 'free-key',
      status: 'planned',
      coverage: 'Item composition by HS code, country-level (free API key)',
    },
    {
      id: 'kpler',
      name: 'Kpler / Vortexa',
      provider: 'Kpler',
      tier: 'paid',
      access: 'paid',
      status: 'needs-key',
      coverage: 'Vessel-tracked item mix at port level',
    },
  ],
};

// ── Top trading partners (countries) ──
const TRADE_PARTNERS: DomainSources = {
  domain: 'tradePartners',
  label: 'Top trading partners',
  defaultId: 'comtrade',
  options: [
    {
      id: 'comtrade',
      name: 'UN Comtrade',
      provider: 'UN',
      tier: 'free',
      access: 'free-key',
      status: 'planned',
      coverage: 'Bilateral partner-country shares (free API key)',
    },
    {
      id: 'spgta',
      name: 'S&P Global GTA',
      provider: 'S&P Global',
      tier: 'paid',
      access: 'paid',
      status: 'needs-key',
      coverage: 'Granular bilateral & sub-national flows',
    },
  ],
};

// ── Top trading companies ──
// Company-level (bill-of-lading) trade data is paid-only; there is no free feed.
const TRADE_COMPANIES: DomainSources = {
  domain: 'tradeCompanies',
  label: 'Top trading companies',
  defaultId: 'spgta',
  options: [
    {
      id: 'spgta',
      name: 'S&P Global GTA',
      provider: 'S&P Global',
      tier: 'paid',
      access: 'paid',
      status: 'needs-key',
      coverage: 'Company-level shipment records',
    },
    {
      id: 'panjiva',
      name: 'Panjiva',
      provider: 'S&P Panjiva',
      tier: 'paid',
      access: 'paid',
      status: 'needs-key',
      coverage: 'Bill-of-lading consignor/consignee',
    },
    {
      id: 'importgenius',
      name: 'ImportGenius',
      provider: 'ImportGenius',
      tier: 'paid',
      access: 'paid',
      status: 'needs-key',
      coverage: 'Customs manifest records',
    },
  ],
};

// Only domains with a populated catalog are wired so far. Others are added as
// each tab is converted off mock (see PRODUCTION_AUDIT.md).
const REGISTRY: Partial<Record<SourceDomain, DomainSources>> = {
  price: PRICE,
  production: PRODUCTION,
  reserves: RESERVES,
  portThroughput: PORT_THROUGHPUT,
  tradeByItem: TRADE_BY_ITEM,
  tradePartners: TRADE_PARTNERS,
  tradeCompanies: TRADE_COMPANIES,
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
