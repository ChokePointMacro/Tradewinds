// Shared display formatters (extracted from per-tab duplicates).

/** Plain number, up to 2 decimals, locale-default. Spot prices & route values. */
export function fmtPrice(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/** MW, switching to GW at/above 1,000 MW. */
export function fmtCapacity(mw: number): string {
  if (mw >= 1000) {
    const gw = mw / 1000;
    return `${gw.toLocaleString('en-US', { maximumFractionDigits: gw % 1 === 0 ? 0 : 1 })} GW`;
  }
  return `${mw.toLocaleString('en-US')} MW`;
}

/** USD billions: 1 decimal below $10B, whole dollars above. */
export function fmtUsdB(n: number): string {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: n < 10 ? 1 : 0 })}B`;
}
