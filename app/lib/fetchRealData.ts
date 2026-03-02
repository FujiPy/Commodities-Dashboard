// Real commodity price data fetching from Yahoo Finance
import axios from 'axios';
import type { PriceData } from './commodities';
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

interface ChartData {
  price: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  sparkline: number[];
}

// In-memory cache
let priceCache: { data: Map<string, ChartData>; timestamp: number } | null = null;
const CACHE_TTL = 60_000; // 60 seconds

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

    if (!meta?.regularMarketPrice) return null;

    // Get close prices for sparkline (last 20 available points)
    const closePrices: number[] = (quote?.close || [])
      .filter((v: number | null): v is number => v !== null && v > 0);
    const sparkline = closePrices.length > 20
      ? closePrices.slice(closePrices.length - 20)
      : closePrices.length > 0
        ? closePrices
        : [meta.regularMarketPrice];

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
