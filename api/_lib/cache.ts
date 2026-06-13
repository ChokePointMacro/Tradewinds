// Server-only Supabase access for the price proxy. Uses the SERVICE ROLE key,
// which must NEVER reach the client (no VITE_ prefix; CI secret check enforces).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type PriceKind = 'spot' | 'history';

// TTLs per PRD §16: spot is short-lived, history changes at most daily.
export const TTL_MS: Record<PriceKind, number> = {
  spot: 15 * 60 * 1000, // 15 minutes
  history: 24 * 60 * 60 * 1000, // 24 hours
};

let client: SupabaseClient | null = null;

/** Lazily build the admin client. Returns null if env is unconfigured (mock-only deploy). */
export function adminClient(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export interface CacheEntry<T> {
  payload: T;
  fetchedAtMs: number;
  fresh: boolean;
}

export async function readCache<T>(commodityId: string, kind: PriceKind): Promise<CacheEntry<T> | null> {
  const db = adminClient();
  if (!db) return null;
  const { data, error } = await db
    .from('price_cache')
    .select('payload, fetched_at')
    .eq('commodity_id', commodityId)
    .eq('kind', kind)
    .maybeSingle();
  if (error || !data) return null;
  const fetchedAtMs = new Date(data.fetched_at as string).getTime();
  return {
    payload: data.payload as T,
    fetchedAtMs,
    fresh: Date.now() - fetchedAtMs < TTL_MS[kind],
  };
}

export async function writeCache<T>(commodityId: string, kind: PriceKind, payload: T): Promise<void> {
  const db = adminClient();
  if (!db) return;
  await db
    .from('price_cache')
    .upsert(
      { commodity_id: commodityId, kind, payload, fetched_at: new Date().toISOString() },
      { onConflict: 'commodity_id,kind' },
    );
}
