import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readCache, writeCache } from '../_lib/cache.js';
import { fetchSpot, ProviderUnconfiguredError } from '../_lib/provider.js';
import { COMMODITY_SYMBOLS, type NormalizedSpot } from '../_lib/priceMapper.js';

// GET /api/price/spot?commodity=gold
// Cache-first (15 min TTL); on provider error, serve stale cache if present.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const commodityId = String(req.query.commodity ?? '');
  if (!(commodityId in COMMODITY_SYMBOLS)) {
    res.status(400).json({ error: `Unknown commodity: ${commodityId || '(none)'}` });
    return;
  }

  const cached = await readCache<NormalizedSpot>(commodityId, 'spot');
  if (cached?.fresh) {
    res.status(200).json(cached.payload);
    return;
  }

  try {
    const spot = await fetchSpot(commodityId);
    await writeCache(commodityId, 'spot', spot);
    res.status(200).json(spot);
  } catch (err) {
    if (cached) {
      res.status(200).json({ ...cached.payload, stale: true });
      return;
    }
    const status = err instanceof ProviderUnconfiguredError ? 503 : 502;
    res.status(status).json({ error: (err as Error).message });
  }
}
