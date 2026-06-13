import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isComtradeCommodity, type TradeBalanceRow } from '../_lib/comtradeMapper';
import { ComtradeUnconfiguredError, fetchNetTrade } from '../_lib/comtradeProvider';
import { readTradeCache, writeTradeCache } from '../_lib/tradeCache';

// GET /api/comtrade/net-trade?commodity=crude_oil
// Per-country net trade (USD bn/yr) from UN Comtrade. Cache-first (24h TTL);
// on provider error, serve stale cache if present, else surface the error so the
// client's FlaggedSupplyDataSource falls back to MODELED seed data.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const commodityId = String(req.query.commodity ?? '');
  if (!isComtradeCommodity(commodityId)) {
    res.status(400).json({ error: `Unknown commodity: ${commodityId || '(none)'}` });
    return;
  }

  const cached = await readTradeCache<TradeBalanceRow[]>(commodityId);
  if (cached?.fresh) {
    res.status(200).json(cached.payload);
    return;
  }

  try {
    const rows = await fetchNetTrade(commodityId);
    if (rows.length === 0) {
      // No live rows (e.g. year not yet reported). Treat as a soft failure so
      // the client falls back to seed rather than rendering an empty overlay.
      if (cached) {
        res.status(200).json(cached.payload);
        return;
      }
      res.status(502).json({ error: 'Comtrade returned no rows' });
      return;
    }
    await writeTradeCache(commodityId, rows);
    res.status(200).json(rows);
  } catch (err) {
    if (cached) {
      res.status(200).json(cached.payload);
      return;
    }
    const status = err instanceof ComtradeUnconfiguredError ? 503 : 502;
    res.status(status).json({ error: (err as Error).message });
  }
}
