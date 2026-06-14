import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isComtradeCommodity, reporterCodeFor } from '../_lib/comtradeMapper.js';
import { ComtradeUnconfiguredError, fetchPortTrade } from '../_lib/comtradeProvider.js';

// GET /api/comtrade/port-trade?commodity=crude_oil&country=Saudi%20Arabia
// A port country's item profile (export/import split) + top partner countries
// for the commodity, from UN Comtrade. Source-or-error: no key → 503, unknown
// country/commodity → 400, no rows → 404. The client renders a source-picker on
// any non-200 (never fabricated data).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const commodityId = String(req.query.commodity ?? '');
  const country = String(req.query.country ?? '');

  if (!isComtradeCommodity(commodityId)) {
    res.status(400).json({ error: `Unknown commodity: ${commodityId || '(none)'}` });
    return;
  }
  const reporterCode = reporterCodeFor(country);
  if (reporterCode === undefined) {
    res.status(400).json({ error: `No Comtrade reporter code for: ${country || '(none)'}` });
    return;
  }

  try {
    const result = await fetchPortTrade(commodityId, reporterCode);
    if (!result.profile && result.partners.length === 0) {
      res.status(404).json({ error: 'Comtrade returned no rows' });
      return;
    }
    // Annual data — cache each commodity+country at the edge for a day.
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
    res.status(200).json(result);
  } catch (err) {
    const status = err instanceof ComtradeUnconfiguredError ? 503 : 502;
    res.status(status).json({ error: (err as Error).message });
  }
}
