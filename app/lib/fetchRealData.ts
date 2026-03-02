// Real commodity price data fetching from Yahoo Finance
import axios from 'axios';
import type { PriceData, NewsItem, CorrelationData, HistoricalBar, FuturesContract, UpcomingDataEvent } from './commodities';
import { COMMODITIES } from './commodities';

// Map internal symbols to Yahoo Finance futures symbols
const YAHOO_SYMBOLS: Record<string, string> = {
  CL: 'CL=F',   // WTI Crude Oil
  CO: 'BZ=F',   // Brent Crude Oil
  NG: 'NG=F',   // Natural Gas
  RB: 'RB=F',   // RBOB Gasoline
  HO: 'HO=F',   // Heating Oil
  GC: 'GC=F',   // Gold
  SI: 'SI=F',   // Silver
  PL: 'PL=F',   // Platinum
  PA: 'PA=F',   // Palladium
  HG: 'HG=F',   // Copper
  AL: 'ALI=F',  // Aluminum
  ZC: 'ZC=F',   // Corn
  ZW: 'ZW=F',   // Wheat (KC HRW)
  ZS: 'ZS=F',   // Soybeans
  ZM: 'ZM=F',   // Soybean Meal
  ZL: 'ZL=F',   // Soybean Oil
  KC: 'KC=F',   // Coffee
  SB: 'SB=F',   // Sugar #11
  CT: 'CT=F',   // Cotton
  CC: 'CC=F',   // Cocoa
};

// Reverse map: Yahoo symbol -> local symbol
const REVERSE_YAHOO: Record<string, string> = {};
for (const [local, yahoo] of Object.entries(YAHOO_SYMBOLS)) {
  REVERSE_YAHOO[yahoo] = local;
}

interface ChartData {
  price: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  sparkline: number[];
  // Full historical data for charts and correlations
  historicalBars: HistoricalBar[];
}

// In-memory cache
let priceCache: { data: Map<string, ChartData>; timestamp: number } | null = null;
const CACHE_TTL = 900_000; // 15 minutes

// Monthly chart cache (1mo range, separate)
let monthlyCache: { data: Map<string, HistoricalBar[]>; timestamp: number } | null = null;
const MONTHLY_CACHE_TTL = 900_000; // 15 minutes

// Yearly chart cache (1y range, separate)
let yearlyCache: { data: Map<string, HistoricalBar[]>; timestamp: number } | null = null;
const YEARLY_CACHE_TTL = 900_000; // 15 minutes

// Futures data cache
let futuresCache: { data: Map<string, FuturesContract[]>; timestamp: number } | null = null;
const FUTURES_CACHE_TTL = 900_000; // 15 minutes

// News cache (separate, longer TTL for article persistence)
let newsCache: { data: NewsItem[]; timestamp: number } | null = null;
const NEWS_CACHE_TTL = 432_000_000; // 5 days

// Macro indicators cache
export interface MacroIndicator {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  category: 'currency' | 'rates' | 'equity' | 'volatility' | 'crypto';
}

let macroCache: { data: MacroIndicator[]; timestamp: number } | null = null;
const MACRO_CACHE_TTL = 900_000; // 15 minutes

// Yahoo Finance symbols for key macro indicators
const MACRO_SYMBOLS: { yahoo: string; name: string; category: MacroIndicator['category'] }[] = [
  { yahoo: 'DX-Y.NYB', name: 'US Dollar Index (DXY)', category: 'currency' },
  { yahoo: '^TNX', name: '10-Year Treasury Yield', category: 'rates' },
  { yahoo: '^FVX', name: '5-Year Treasury Yield', category: 'rates' },
  { yahoo: '^TYX', name: '30-Year Treasury Yield', category: 'rates' },
  { yahoo: '^GSPC', name: 'S&P 500', category: 'equity' },
  { yahoo: '^DJI', name: 'Dow Jones', category: 'equity' },
  { yahoo: '^VIX', name: 'CBOE Volatility (VIX)', category: 'volatility' },
  { yahoo: 'EURUSD=X', name: 'EUR/USD', category: 'currency' },
  { yahoo: 'GBPUSD=X', name: 'GBP/USD', category: 'currency' },
  { yahoo: 'JPY=X', name: 'USD/JPY', category: 'currency' },
  { yahoo: 'BTC-USD', name: 'Bitcoin', category: 'crypto' },
  { yahoo: 'GLD', name: 'Gold ETF (GLD)', category: 'equity' },
];

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(0)}K`;
  return vol.toString();
}

async function fetchSingleChart(yahooSymbol: string): Promise<ChartData | null> {
  try {
    const res = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`,
      {
        params: {
          interval: '15m',
          range: '5d',
          includePrePost: false,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 8000,
      }
    );

    const result = res.data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    const timestamps: number[] = result.timestamp || [];

    if (!meta?.regularMarketPrice) return null;

    // Get close prices for sparkline (last 20 available points)
    const closePrices: number[] = (quote?.close || [])
      .filter((v: number | null): v is number => v !== null && v > 0);
    const sparkline = closePrices.length > 20
      ? closePrices.slice(closePrices.length - 20)
      : closePrices.length > 0
        ? closePrices
        : [meta.regularMarketPrice];

    // Build full historical bars for charts and correlations
    const allCloses: number[] = quote?.close || [];
    const historicalBars: HistoricalBar[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const close = allCloses[i];
      if (close != null && close > 0) {
        historicalBars.push({
          timestamp: timestamps[i] * 1000,
          close,
        });
      }
    }

    // Get today's OHLV from the most recent data
    const opens: number[] = (quote?.open || []).filter((v: number | null): v is number => v !== null && v > 0);
    const highs: number[] = (quote?.high || []).filter((v: number | null): v is number => v !== null && v > 0);
    const lows: number[] = (quote?.low || []).filter((v: number | null): v is number => v !== null && v > 0);
    const volumes: number[] = (quote?.volume || []).filter((v: number | null): v is number => v !== null);

    // Use the most recent trading session's data
    const recentCount = Math.min(26, opens.length); // ~1 trading day of 15-min bars
    const recentOpens = opens.slice(-recentCount);
    const recentHighs = highs.slice(-recentCount);
    const recentLows = lows.slice(-recentCount);
    const recentVolumes = volumes.slice(-recentCount);

    return {
      price: meta.regularMarketPrice,
      previousClose: meta.chartPreviousClose || meta.previousClose || meta.regularMarketPrice,
      open: recentOpens.length > 0 ? recentOpens[0] : meta.regularMarketPrice,
      high: recentHighs.length > 0 ? Math.max(...recentHighs) : meta.regularMarketPrice,
      low: recentLows.length > 0 ? Math.min(...recentLows) : meta.regularMarketPrice,
      volume: recentVolumes.reduce((sum, v) => sum + v, 0),
      sparkline,
      historicalBars,
    };
  } catch {
    return null;
  }
}

// Fetch all available symbols with concurrency limit
async function fetchAllCharts(): Promise<Map<string, ChartData>> {
  const results = new Map<string, ChartData>();
  const entries = Object.entries(YAHOO_SYMBOLS);

  // Process in batches of 5 to avoid overwhelming Yahoo Finance
  const BATCH_SIZE = 5;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async ([localSymbol, yahooSymbol]) => {
      const data = await fetchSingleChart(yahooSymbol);
      if (data) {
        results.set(localSymbol, data);
      }
    });
    await Promise.all(promises);
  }

  return results;
}

/**
 * Fetch real commodity prices from Yahoo Finance.
 * Returns an array of PriceData with real market data, or null if fetching fails.
 * Only commodities with Yahoo Finance symbols will have data returned.
 */
export async function fetchRealPrices(): Promise<{ prices: PriceData[]; source: 'live' | 'cached' } | null> {
  // Check cache first
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL) {
    const prices = buildPriceData(priceCache.data);
    return prices.length > 0 ? { prices, source: 'cached' } : null;
  }

  try {
    const chartData = await fetchAllCharts();

    if (chartData.size === 0) {
      return null;
    }

    // Update cache
    priceCache = { data: chartData, timestamp: Date.now() };

    const prices = buildPriceData(chartData);
    return prices.length > 0 ? { prices, source: 'live' } : null;
  } catch (error) {
    console.error('Failed to fetch real prices:', error);

    // Return cached data if available (even if expired)
    if (priceCache) {
      const prices = buildPriceData(priceCache.data);
      return prices.length > 0 ? { prices, source: 'cached' } : null;
    }

    return null;
  }
}

/**
 * Get full historical chart data for a specific symbol (for detailed chart view).
 */
export function getChartHistory(symbol: string): HistoricalBar[] | null {
  if (!priceCache) return null;
  const chart = priceCache.data.get(symbol);
  if (!chart) return null;
  return chart.historicalBars;
}

/**
 * Fetch 1-month chart data for a specific symbol (daily bars).
 */
export async function getMonthlyChartHistory(symbol: string): Promise<HistoricalBar[] | null> {
  // Check cache first
  if (monthlyCache && Date.now() - monthlyCache.timestamp < MONTHLY_CACHE_TTL) {
    return monthlyCache.data.get(symbol) || null;
  }

  // Fetch for all symbols at once so we cache them
  const results = new Map<string, HistoricalBar[]>();
  const entries = Object.entries(YAHOO_SYMBOLS);
  const BATCH_SIZE = 5;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async ([localSymbol, yahooSymbol]) => {
      try {
        const res = await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`,
          {
            params: {
              interval: '1d',
              range: '1mo',
              includePrePost: false,
            },
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            timeout: 8000,
          }
        );

        const result = res.data?.chart?.result?.[0];
        if (!result) return;

        const timestamps: number[] = result.timestamp || [];
        const quote = result.indicators?.quote?.[0];
        const closes: number[] = quote?.close || [];
        const bars: HistoricalBar[] = [];

        for (let j = 0; j < timestamps.length; j++) {
          const close = closes[j];
          if (close != null && close > 0) {
            bars.push({ timestamp: timestamps[j] * 1000, close });
          }
        }

        if (bars.length > 0) {
          results.set(localSymbol, bars);
        }
      } catch {
        // Skip failed fetch
      }
    });
    await Promise.all(promises);
  }

  monthlyCache = { data: results, timestamp: Date.now() };
  return results.get(symbol) || null;
}

/**
 * Fetch 1-year chart data for a specific symbol (weekly bars).
 */
export async function getYearlyChartHistory(symbol: string): Promise<HistoricalBar[] | null> {
  // Check cache first
  if (yearlyCache && Date.now() - yearlyCache.timestamp < YEARLY_CACHE_TTL) {
    return yearlyCache.data.get(symbol) || null;
  }

  // Fetch for all symbols at once so we cache them
  const results = new Map<string, HistoricalBar[]>();
  const entries = Object.entries(YAHOO_SYMBOLS);
  const BATCH_SIZE = 5;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async ([localSymbol, yahooSymbol]) => {
      try {
        const res = await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`,
          {
            params: {
              interval: '1wk',
              range: '1y',
              includePrePost: false,
            },
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            timeout: 8000,
          }
        );

        const result = res.data?.chart?.result?.[0];
        if (!result) return;

        const timestamps: number[] = result.timestamp || [];
        const quote = result.indicators?.quote?.[0];
        const closes: number[] = quote?.close || [];
        const bars: HistoricalBar[] = [];

        for (let j = 0; j < timestamps.length; j++) {
          const close = closes[j];
          if (close != null && close > 0) {
            bars.push({ timestamp: timestamps[j] * 1000, close });
          }
        }

        if (bars.length > 0) {
          results.set(localSymbol, bars);
        }
      } catch {
        // Skip failed fetch
      }
    });
    await Promise.all(promises);
  }

  yearlyCache = { data: results, timestamp: Date.now() };
  return results.get(symbol) || null;
}

/**
 * Fetch live macro economic indicators from Yahoo Finance.
 * Returns key indicators like DXY, Treasury yields, VIX, S&P 500, etc.
 */
export async function fetchMacroIndicators(): Promise<MacroIndicator[]> {
  // Check cache first
  if (macroCache && Date.now() - macroCache.timestamp < MACRO_CACHE_TTL) {
    return macroCache.data;
  }

  const indicators: MacroIndicator[] = [];
  const BATCH_SIZE = 4;

  for (let i = 0; i < MACRO_SYMBOLS.length; i += BATCH_SIZE) {
    const batch = MACRO_SYMBOLS.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (macro) => {
      try {
        const res = await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(macro.yahoo)}`,
          {
            params: {
              interval: '1d',
              range: '5d',
              includePrePost: false,
            },
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            timeout: 5000,
          }
        );

        const result = res.data?.chart?.result?.[0];
        if (!result?.meta?.regularMarketPrice) return null;

        const meta = result.meta;
        const previousClose = meta.chartPreviousClose || meta.previousClose || meta.regularMarketPrice;
        const change = meta.regularMarketPrice - previousClose;
        const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

        return {
          symbol: macro.yahoo,
          name: macro.name,
          value: meta.regularMarketPrice,
          change: Number(change.toFixed(4)),
          changePercent: Number(changePercent.toFixed(2)),
          category: macro.category,
        } as MacroIndicator;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(promises);
    for (const r of results) {
      if (r) indicators.push(r);
    }
  }

  if (indicators.length > 0) {
    macroCache = { data: indicators, timestamp: Date.now() };
  }

  return macroCache?.data || [];
}

// Yahoo Finance futures contract month codes
const FUTURES_MONTHS: Record<string, string> = {
  F: 'Jan', G: 'Feb', H: 'Mar', J: 'Apr', K: 'May', M: 'Jun',
  N: 'Jul', Q: 'Aug', U: 'Sep', V: 'Oct', X: 'Nov', Z: 'Dec',
};

// Map of commodity symbol to Yahoo Finance base code and available months
const FUTURES_SYMBOL_MAP: Record<string, { base: string; months: string[] }> = {
  CL: { base: 'CL', months: ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'] },
  CO: { base: 'BZ', months: ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'] },
  NG: { base: 'NG', months: ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'] },
  RB: { base: 'RB', months: ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'] },
  HO: { base: 'HO', months: ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'] },
  GC: { base: 'GC', months: ['G', 'J', 'M', 'Q', 'V', 'Z'] },
  SI: { base: 'SI', months: ['H', 'K', 'N', 'U', 'Z'] },
  PL: { base: 'PL', months: ['F', 'J', 'N', 'V'] },
  PA: { base: 'PA', months: ['H', 'M', 'U', 'Z'] },
  HG: { base: 'HG', months: ['H', 'K', 'N', 'U', 'Z'] },
  ZC: { base: 'ZC', months: ['H', 'K', 'N', 'U', 'Z'] },
  ZW: { base: 'ZW', months: ['H', 'K', 'N', 'U', 'Z'] },
  ZS: { base: 'ZS', months: ['F', 'H', 'K', 'N', 'Q', 'X'] },
  ZM: { base: 'ZM', months: ['F', 'H', 'K', 'N', 'Q', 'V', 'Z'] },
  ZL: { base: 'ZL', months: ['F', 'H', 'K', 'N', 'Q', 'V', 'Z'] },
  KC: { base: 'KC', months: ['H', 'K', 'N', 'U', 'Z'] },
  SB: { base: 'SB', months: ['H', 'K', 'N', 'V'] },
  CT: { base: 'CT', months: ['H', 'K', 'N', 'V', 'Z'] },
  CC: { base: 'CC', months: ['H', 'K', 'N', 'U', 'Z'] },
};

/**
 * Fetch real futures curve data from Yahoo Finance for a given commodity.
 * Fetches individual contract months using Yahoo's futures symbol convention (e.g., CLF26.NYM).
 */
export async function fetchFuturesCurve(symbol: string): Promise<FuturesContract[] | null> {
  // Check cache first
  if (futuresCache && Date.now() - futuresCache.timestamp < FUTURES_CACHE_TTL) {
    return futuresCache.data.get(symbol) || null;
  }

  // Fetch futures for all commodities at once to populate cache
  const allResults = new Map<string, FuturesContract[]>();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  for (const [localSymbol, config] of Object.entries(FUTURES_SYMBOL_MAP)) {
    const contracts: FuturesContract[] = [];
    const monthCodeToNum: Record<string, number> = {
      F: 0, G: 1, H: 2, J: 3, K: 4, M: 5,
      N: 6, Q: 7, U: 8, V: 9, X: 10, Z: 11,
    };

    // Generate symbols for upcoming contract months (next 8-12 months)
    const symbolsToFetch: { yahooSym: string; monthCode: string; year: number; monthLabel: string }[] = [];
    for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
      const year = currentYear + yearOffset;
      const yearSuffix = (year % 100).toString().padStart(2, '0');
      for (const mc of config.months) {
        const mNum = monthCodeToNum[mc];
        // Skip past months for current year
        if (year === currentYear && mNum < currentMonth) continue;
        const yahooSym = `${config.base}${mc}${yearSuffix}.NYM`;
        symbolsToFetch.push({
          yahooSym,
          monthCode: mc,
          year,
          monthLabel: `${FUTURES_MONTHS[mc]} ${yearSuffix}`,
        });
        if (symbolsToFetch.length >= 8) break;
      }
      if (symbolsToFetch.length >= 8) break;
    }

    // Fetch in batch
    const promises = symbolsToFetch.map(async (s) => {
      try {
        const res = await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s.yahooSym)}`,
          {
            params: { interval: '1d', range: '5d', includePrePost: false },
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            timeout: 5000,
          }
        );

        const result = res.data?.chart?.result?.[0];
        if (!result?.meta?.regularMarketPrice) return null;

        const meta = result.meta;
        const previousClose = meta.chartPreviousClose || meta.previousClose || meta.regularMarketPrice;
        const change = meta.regularMarketPrice - previousClose;
        const volume = meta.regularMarketVolume || 0;

        return {
          month: s.monthLabel,
          code: `${config.base}${s.monthCode}${(s.year % 100).toString().padStart(2, '0')}`,
          price: meta.regularMarketPrice,
          change: Number(change.toFixed(4)),
          volume: volume,
          openInterest: 0, // Not available from Yahoo Finance free API
        } as FuturesContract;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(promises);
    for (const r of results) {
      if (r) contracts.push(r);
    }

    if (contracts.length > 0) {
      allResults.set(localSymbol, contracts);
    }
  }

  futuresCache = { data: allResults, timestamp: Date.now() };
  return allResults.get(symbol) || null;
}

/**
 * Compute correlation matrix from historical price data.
 * Uses Pearson correlation on log returns of 15-min close prices.
 */
export function computeCorrelationMatrix(): CorrelationData | null {
  if (!priceCache || priceCache.data.size < 2) return null;

  const symbols: string[] = [];
  const names: string[] = [];
  const returnSeries: number[][] = [];

  for (const c of COMMODITIES) {
    const chart = priceCache.data.get(c.symbol);
    if (!chart || chart.historicalBars.length < 10) continue;

    // Compute log returns from historical bars
    const bars = chart.historicalBars;
    const returns: number[] = [];
    for (let i = 1; i < bars.length; i++) {
      if (bars[i].close > 0 && bars[i - 1].close > 0) {
        returns.push(Math.log(bars[i].close / bars[i - 1].close));
      }
    }

    if (returns.length >= 5) {
      symbols.push(c.symbol);
      names.push(c.name);
      returnSeries.push(returns);
    }
  }

  if (symbols.length < 2) return null;

  // Build correlation matrix
  const n = symbols.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1.0; // Diagonal
    for (let j = i + 1; j < n; j++) {
      const corr = pearsonCorrelation(returnSeries[i], returnSeries[j]);
      matrix[i][j] = corr;
      matrix[j][i] = corr;
    }
  }

  return { symbols, names, matrix };
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const len = Math.min(x.length, y.length);
  if (len < 3) return 0;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < len; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const denom = Math.sqrt((len * sumX2 - sumX * sumX) * (len * sumY2 - sumY * sumY));
  if (denom === 0) return 0;
  return Number(((len * sumXY - sumX * sumY) / denom).toFixed(4));
}

/**
 * Fetch commodity news from Yahoo Finance search API.
 */
export async function fetchCommodityNews(): Promise<NewsItem[]> {
  // Check news cache
  if (newsCache && Date.now() - newsCache.timestamp < NEWS_CACHE_TTL) {
    return newsCache.data;
  }

  try {
    const queries = [
      'commodities market prices',
      'crude oil natural gas energy',
      'gold silver metals prices',
      'wheat corn agriculture crops',
      'federal reserve interest rates inflation',
      'global economy GDP trade tariffs',
    ];

    const allNews: NewsItem[] = [];
    const seenIds = new Set<string>();

    for (const q of queries) {
      try {
        const res = await axios.get(
          'https://query1.finance.yahoo.com/v1/finance/search',
          {
            params: {
              q,
              newsCount: 8,
              quotesCount: 0,
              enableFuzzyQuery: false,
            },
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            timeout: 5000,
          }
        );

        const newsItems = res.data?.news || [];
        for (const n of newsItems) {
          const id = n.uuid || `news-${allNews.length}`;
          if (seenIds.has(id)) continue;
          seenIds.add(id);

          const title = n.title || '';
          const relatedTickers: string[] = (n.relatedTickers || [])
            .map((t: string) => REVERSE_YAHOO[t])
            .filter(Boolean);

          allNews.push({
            id,
            headline: title,
            source: n.publisher || 'Yahoo Finance',
            time: n.providerPublishTime
              ? formatNewsTime(n.providerPublishTime * 1000)
              : 'Recent',
            category: categorizeNews(title, relatedTickers),
            impact: determineImpact(title),
            symbols: relatedTickers,
            link: n.link || undefined,
          });
        }
      } catch {
        // Skip failed query
      }
    }

    const result = allNews.slice(0, 25);
    newsCache = { data: result, timestamp: Date.now() };
    return result;
  } catch {
    return newsCache?.data || [];
  }
}

function formatNewsTime(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function categorizeNews(title: string, symbols: string[]): string {
  const t = title.toLowerCase();
  const energySymbols = ['CL', 'CO', 'NG', 'RB', 'HO'];
  const metalSymbols = ['GC', 'SI', 'PL', 'PA', 'HG', 'AL'];
  const agSymbols = ['ZC', 'ZW', 'ZS', 'ZM', 'ZL', 'KC', 'SB', 'CT', 'CC'];

  if (symbols.some(s => energySymbols.includes(s)) || t.includes('oil') || t.includes('crude') || t.includes('gas') || t.includes('energy') || t.includes('opec')) return 'energy';
  if (symbols.some(s => metalSymbols.includes(s)) || t.includes('gold') || t.includes('silver') || t.includes('copper') || t.includes('metal') || t.includes('platinum')) return 'metals';
  if (symbols.some(s => agSymbols.includes(s)) || t.includes('wheat') || t.includes('corn') || t.includes('soy') || t.includes('coffee') || t.includes('sugar') || t.includes('cotton') || t.includes('cocoa') || t.includes('crop') || t.includes('grain')) return 'agriculture';
  if (t.includes('fed') || t.includes('inflation') || t.includes('gdp') || t.includes('interest rate') || t.includes('treasury') || t.includes('cpi') || t.includes('ppi') || t.includes('employment') || t.includes('jobs') || t.includes('payroll') || t.includes('tariff') || t.includes('trade') || t.includes('dollar') || t.includes('central bank') || t.includes('monetary') || t.includes('fiscal')) return 'macro';
  return 'commodities';
}

function determineImpact(title: string): 'high' | 'medium' | 'low' {
  const t = title.toLowerCase();
  if (t.includes('breaking') || t.includes('surge') || t.includes('crash') || t.includes('plunge') || t.includes('crisis') || t.includes('war') || t.includes('sanction') || t.includes('record') || t.includes('soar') || t.includes('collapse')) return 'high';
  if (t.includes('rise') || t.includes('fall') || t.includes('report') || t.includes('data') || t.includes('opec') || t.includes('fed') || t.includes('forecast') || t.includes('cut') || t.includes('hike') || t.includes('rally') || t.includes('drop')) return 'medium';
  return 'low';
}

function buildPriceData(chartData: Map<string, ChartData>): PriceData[] {
  const results: PriceData[] = [];

  for (const c of COMMODITIES) {
    const chart = chartData.get(c.symbol);

    if (chart) {
      const change = chart.price - chart.previousClose;
      const changePercent = chart.previousClose !== 0
        ? (change / chart.previousClose) * 100
        : 0;

      results.push({
        symbol: c.symbol,
        name: c.name,
        category: c.category,
        subcategory: c.subcategory,
        unit: c.unit,
        price: Number(chart.price.toFixed(c.decimals)),
        change: Number(change.toFixed(c.decimals)),
        changePercent: Number(changePercent.toFixed(2)),
        high: Number(chart.high.toFixed(c.decimals)),
        low: Number(chart.low.toFixed(c.decimals)),
        open: Number(chart.open.toFixed(c.decimals)),
        bid: null,
        ask: null,
        volume: formatVolume(chart.volume),
        timestamp: new Date().toISOString(),
        decimals: c.decimals,
        sparkline: chart.sparkline.map(v => Number(v.toFixed(c.decimals))),
      });
    }
    // Skip commodities without Yahoo Finance data
  }

  return results;
}

// --- Upcoming Commodity Data Events ---

interface ScheduledEvent {
  name: string;
  source: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday; -1 for monthDay-based
  time: string; // ET time like '10:30 AM ET'
  impact: 'high' | 'medium' | 'low';
  category: 'energy' | 'metals' | 'agriculture' | 'macro' | 'all';
  symbols: string[];
  weekOfMonth?: number; // 1-4 for monthly events on Nth weekday
  monthDay?: number; // specific day of month
  frequency: 'weekly' | 'monthly' | 'biweekly';
}

const RECURRING_EVENTS: ScheduledEvent[] = [
  // Energy - Weekly
  { name: 'EIA Weekly Natural Gas Storage Report', source: 'EIA', dayOfWeek: 4, time: '10:30 AM ET', impact: 'high', category: 'energy', symbols: ['NG'], frequency: 'weekly' },
  { name: 'EIA Weekly Petroleum Status Report', source: 'EIA', dayOfWeek: 3, time: '10:30 AM ET', impact: 'high', category: 'energy', symbols: ['CL', 'CO', 'RB', 'HO'], frequency: 'weekly' },
  { name: 'API Weekly Crude Oil Stock Report', source: 'API', dayOfWeek: 2, time: '4:30 PM ET', impact: 'medium', category: 'energy', symbols: ['CL', 'CO'], frequency: 'weekly' },
  { name: 'Baker Hughes Rig Count', source: 'Baker Hughes', dayOfWeek: 5, time: '1:00 PM ET', impact: 'medium', category: 'energy', symbols: ['CL', 'NG'], frequency: 'weekly' },
  // Agriculture - Monthly
  { name: 'USDA WASDE Report (World Supply & Demand)', source: 'USDA', dayOfWeek: -1, time: '12:00 PM ET', impact: 'high', category: 'agriculture', symbols: ['ZC', 'ZW', 'ZS', 'ZM', 'ZL', 'CT'], monthDay: 10, frequency: 'monthly' },
  { name: 'USDA Crop Production Report', source: 'USDA', dayOfWeek: -1, time: '12:00 PM ET', impact: 'high', category: 'agriculture', symbols: ['ZC', 'ZW', 'ZS'], monthDay: 10, frequency: 'monthly' },
  // Agriculture - Weekly
  { name: 'USDA Weekly Export Sales Report', source: 'USDA', dayOfWeek: 4, time: '8:30 AM ET', impact: 'medium', category: 'agriculture', symbols: ['ZC', 'ZW', 'ZS'], frequency: 'weekly' },
  { name: 'USDA Weekly Crop Progress Report', source: 'USDA', dayOfWeek: 1, time: '4:00 PM ET', impact: 'medium', category: 'agriculture', symbols: ['ZC', 'ZW', 'ZS', 'CT'], frequency: 'weekly' },
  // Cross-commodity
  { name: 'CFTC Commitments of Traders (COT) Report', source: 'CFTC', dayOfWeek: 5, time: '3:30 PM ET', impact: 'medium', category: 'all', symbols: ['GC', 'SI', 'CL', 'NG'], frequency: 'weekly' },
  // Macro - impacts all commodities
  { name: 'FOMC Interest Rate Decision', source: 'Federal Reserve', dayOfWeek: 3, time: '2:00 PM ET', impact: 'high', category: 'macro', symbols: [], weekOfMonth: 3, frequency: 'biweekly' },
  { name: 'US CPI (Consumer Price Index)', source: 'BLS', dayOfWeek: -1, time: '8:30 AM ET', impact: 'high', category: 'macro', symbols: [], monthDay: 13, frequency: 'monthly' },
  { name: 'US PPI (Producer Price Index)', source: 'BLS', dayOfWeek: -1, time: '8:30 AM ET', impact: 'medium', category: 'macro', symbols: [], monthDay: 14, frequency: 'monthly' },
  { name: 'US Non-Farm Payrolls', source: 'BLS', dayOfWeek: 5, time: '8:30 AM ET', impact: 'high', category: 'macro', symbols: [], weekOfMonth: 1, frequency: 'monthly' },
  { name: 'US GDP Report (Advance/Final)', source: 'BEA', dayOfWeek: -1, time: '8:30 AM ET', impact: 'high', category: 'macro', symbols: [], monthDay: 28, frequency: 'monthly' },
  { name: 'ISM Manufacturing PMI', source: 'ISM', dayOfWeek: -1, time: '10:00 AM ET', impact: 'medium', category: 'macro', symbols: ['HG', 'AL'], monthDay: 1, frequency: 'monthly' },
  // Softs - Monthly
  { name: 'ICO World Coffee Market Report', source: 'ICO', dayOfWeek: -1, time: 'N/A', impact: 'medium', category: 'agriculture', symbols: ['KC'], monthDay: 5, frequency: 'monthly' },
];

function getNextOccurrences(event: ScheduledEvent, fromDate: Date, count: number): Date[] {
  const dates: Date[] = [];
  const d = new Date(fromDate);
  d.setHours(0, 0, 0, 0);

  if (event.frequency === 'weekly' && event.dayOfWeek >= 0) {
    const current = d.getDay();
    let daysUntil = event.dayOfWeek - current;
    if (daysUntil < 0) daysUntil += 7;
    if (daysUntil === 0) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + daysUntil);
      dates.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
    while (dates.length < count) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
  } else if (event.frequency === 'monthly' && event.monthDay) {
    let month = d.getMonth();
    let year = d.getFullYear();
    for (let i = 0; i < count + 12 && dates.length < count; i++) {
      const candidate = new Date(year, month, event.monthDay);
      while (candidate.getDay() === 0 || candidate.getDay() === 6) {
        candidate.setDate(candidate.getDate() + 1);
      }
      if (candidate >= fromDate) {
        dates.push(candidate);
      }
      month++;
      if (month > 11) { month = 0; year++; }
    }
  } else if (event.frequency === 'monthly' && event.weekOfMonth && event.dayOfWeek >= 0) {
    let month = d.getMonth();
    let year = d.getFullYear();
    for (let i = 0; i < count + 12 && dates.length < count; i++) {
      const firstDay = new Date(year, month, 1);
      let daysToAdd = event.dayOfWeek - firstDay.getDay();
      if (daysToAdd < 0) daysToAdd += 7;
      const candidate = new Date(year, month, 1 + daysToAdd + (event.weekOfMonth - 1) * 7);
      if (candidate.getMonth() === month && candidate >= fromDate) {
        dates.push(candidate);
      }
      month++;
      if (month > 11) { month = 0; year++; }
    }
  } else if (event.frequency === 'biweekly') {
    if (event.weekOfMonth && event.dayOfWeek >= 0) {
      let month = d.getMonth();
      let year = d.getFullYear();
      for (let i = 0; i < count + 24 && dates.length < count; i++) {
        const firstDay = new Date(year, month, 1);
        let daysToAdd = event.dayOfWeek - firstDay.getDay();
        if (daysToAdd < 0) daysToAdd += 7;
        const candidate = new Date(year, month, 1 + daysToAdd + (event.weekOfMonth - 1) * 7);
        if (candidate.getMonth() === month && candidate >= fromDate) {
          dates.push(candidate);
        }
        month += 2;
        if (month > 11) { month = month - 12; year++; }
      }
    }
  }

  return dates;
}

function formatEventDate(d: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

/**
 * Generate upcoming scheduled commodity data events.
 * Returns events for the next 14 days, sorted by date.
 */
export function getUpcomingDataEvents(): UpcomingDataEvent[] {
  const now = new Date();
  const twoWeeksLater = new Date(now);
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

  const events: UpcomingDataEvent[] = [];

  for (const sched of RECURRING_EVENTS) {
    const occurrences = getNextOccurrences(sched, now, 3);
    for (const occ of occurrences) {
      if (occ <= twoWeeksLater) {
        events.push({
          date: formatEventDate(occ),
          time: sched.time,
          event: sched.name,
          source: sched.source,
          impact: sched.impact,
          category: sched.category,
          symbols: sched.symbols,
        });
      }
    }
  }

  // Sort by date
  events.sort((a, b) => {
    const parseDate = (s: string) => new Date(s + `, ${new Date().getFullYear()}`);
    return parseDate(a.date).getTime() - parseDate(b.date).getTime();
  });

  return events;
}
