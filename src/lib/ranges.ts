export type RangeKey = '1M' | '6M' | '1Y' | '5Y' | '10Y' | 'Max';

export const RANGE_DAYS: Record<RangeKey, number> = {
  '1M': 30,
  '6M': 182,
  '1Y': 365,
  '5Y': 1825,
  '10Y': 3650,
  Max: 3650,
};

export const RANGE_KEYS: RangeKey[] = ['1M', '6M', '1Y', '5Y', '10Y', 'Max'];

export function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
