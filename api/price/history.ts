import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readCache, writeCache } from '../_lib/cache';
import { fetchHistory, ProviderUnconfiguredError } from '../_lib/provider';
import { COMMODITY_SYMBOLS, type NormalizedPoint } from '../_lib/priceMapper';

interface HistoryPayload {
  from: string;
  to: string;
  points: NormalizedPoint[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/price/history?commodity=gold&from=2024-01-01&to=2024-12-31
// Cache-first (24 h TTL); on provider error, serve stale cache if present.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const commodityId = String(req.query.commodity ?? '');
  const from = String(req.query.from ?? '');
  const to = String(req.query.to ?? '');

  if (!(commodityId in COMMODITY_SYMBOLS)) {
    res.status(400).json({ error: `Unknown commodity: ${commodityId || '(none)'}` });
    return;
  }
  if (!ISO_DATE.test(from) || !ISO_DATE.test(to)) {
    res.status(400).json({ error: 'from/to must be ISO dates (YYYY-MM-DD)' });
    return;
  }

  const cached = await readCache<HistoryPayload>(commodityId, 'history');
  if (cached?.fresh && cached.payload.from === from && cached.payload.to === to) {
    res.status(200).json(cached.payload.points);
    return;
  }

  try {
    const points = await fetchHistory(commodityId, from, to);
    await writeCache<HistoryPayload>(commodityId, 'history', { from, to, points });
    res.status(200).json(points);
  } catch (err) {
    if (cached) {
      res.status(200).json(cached.payload.points);
      return;
    }
    const status = err instanceof ProviderUnconfiguredError ? 503 : 502;
    res.status(status).json({ error: (err as Error).message });
  }
}
