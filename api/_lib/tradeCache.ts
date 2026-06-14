// Server-only Supabase cache for the Comtrade net-trade proxy. Reuses the price
// proxy's admin client (SERVICE ROLE key, never client-exposed). Keyed by
// commodity; one Comtrade `all-reporters` call covers every country, so a single
// cached row per commodity is enough. Long TTL — annual trade data is static.
import { adminClient } from './cache.js';

export const TRADE_TTL_MS = 24 * 60 * 60 * 1000; // 24h; annual data barely moves

export interface TradeCacheEntry<T> {
  payload: T;
  fetchedAtMs: number;
  fresh: boolean;
}

export async function readTradeCache<T>(commodityId: string): Promise<TradeCacheEntry<T> | null> {
  const db = adminClient();
  if (!db) return null;
  const { data, error } = await db
    .from('trade_cache')
    .select('payload, fetched_at')
    .eq('commodity_id', commodityId)
    .maybeSingle();
  if (error || !data) return null;
  const fetchedAtMs = new Date(data.fetched_at as string).getTime();
  return {
    payload: data.payload as T,
    fetchedAtMs,
    fresh: Date.now() - fetchedAtMs < TRADE_TTL_MS,
  };
}

export async function writeTradeCache<T>(commodityId: string, payload: T): Promise<void> {
  const db = adminClient();
  if (!db) return;
  await db
    .from('trade_cache')
    .upsert(
      { commodity_id: commodityId, payload, fetched_at: new Date().toISOString() },
      { onConflict: 'commodity_id' },
    );
}
