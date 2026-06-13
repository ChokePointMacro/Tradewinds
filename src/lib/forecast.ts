import type { PricePoint } from '@/types';

// Probabilistic forecast (PRD §15): a bounded, clearly-labelled GBM-style fan
// chart from historical volatility. NOT a precision prediction. Pure functions.

const TRADING_DAYS_PER_YEAR = 252;
const Z80 = 1.2816; // 80% confidence (±1.28σ√t)
const Z95 = 1.96; // 95% confidence

export interface ForecastAssumptions {
  windowDays: number; // history points used
  muDaily: number; // mean daily log return
  sigmaDaily: number; // stdev of daily log returns
  muAnnual: number;
  sigmaAnnual: number;
  horizonDays: number;
  startPrice: number;
}

export interface ForecastPoint {
  dateISO: string;
  median: number;
  lo80: number;
  hi80: number;
  lo95: number;
  hi95: number;
}

export interface Forecast {
  points: ForecastPoint[];
  assumptions: ForecastAssumptions;
}

/** Daily log returns r_t = ln(P_t / P_{t-1}). */
export function logReturns(history: PricePoint[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1]!.close;
    const curr = history[i]!.close;
    if (prev > 0 && curr > 0) out.push(Math.log(curr / prev));
  }
  return out;
}

export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Sample standard deviation (n-1). */
export function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const variance = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Build a GBM fan forecast from price history.
 * Median path: P̂_t = P_0 · exp((μ − σ²/2)·t). Bands at ±zσ√t around the log path.
 */
export function forecast(history: PricePoint[], horizonDays = 90): Forecast {
  const last = history[history.length - 1];
  const startPrice = last?.close ?? 0;
  const returns = logReturns(history);
  const muDaily = mean(returns);
  const sigmaDaily = stdev(returns);

  const assumptions: ForecastAssumptions = {
    windowDays: history.length,
    muDaily,
    sigmaDaily,
    muAnnual: muDaily * TRADING_DAYS_PER_YEAR,
    sigmaAnnual: sigmaDaily * Math.sqrt(TRADING_DAYS_PER_YEAR),
    horizonDays,
    startPrice,
  };

  const lastDate = last?.dateISO ?? new Date().toISOString().slice(0, 10);
  const points: ForecastPoint[] = [];
  for (let t = 1; t <= horizonDays; t++) {
    const logMedian = Math.log(startPrice) + (muDaily - (sigmaDaily * sigmaDaily) / 2) * t;
    const spread = sigmaDaily * Math.sqrt(t);
    points.push({
      dateISO: addDaysISO(lastDate, t),
      median: Math.exp(logMedian),
      lo80: Math.exp(logMedian - Z80 * spread),
      hi80: Math.exp(logMedian + Z80 * spread),
      lo95: Math.exp(logMedian - Z95 * spread),
      hi95: Math.exp(logMedian + Z95 * spread),
    });
  }

  return { points, assumptions };
}
