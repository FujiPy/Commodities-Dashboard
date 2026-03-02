// Commodity definitions for the dashboard (real data only, no simulation)

export interface CommodityDef {
  symbol: string;
  name: string;
  category: 'energy' | 'precious-metals' | 'industrial-metals' | 'grains' | 'softs';
  subcategory: string;
  unit: string;
  basePrice: number;
  volatility: number;
  decimals: number;
}

export const COMMODITIES: CommodityDef[] = [
  // Energy
  { symbol: 'CL', name: 'WTI Crude Oil', category: 'energy', subcategory: 'Oil', unit: '$/bbl', basePrice: 78.50, volatility: 0.018, decimals: 2 },
  { symbol: 'CO', name: 'Brent Crude Oil', category: 'energy', subcategory: 'Oil', unit: '$/bbl', basePrice: 82.30, volatility: 0.017, decimals: 2 },
  { symbol: 'NG', name: 'Natural Gas', category: 'energy', subcategory: 'Natural Gas', unit: '$/MMBtu', basePrice: 2.85, volatility: 0.035, decimals: 3 },
  { symbol: 'RB', name: 'RBOB Gasoline', category: 'energy', subcategory: 'Oil', unit: '$/gal', basePrice: 2.42, volatility: 0.022, decimals: 4 },
  { symbol: 'HO', name: 'Heating Oil', category: 'energy', subcategory: 'Oil', unit: '$/gal', basePrice: 2.68, volatility: 0.020, decimals: 4 },
  // Precious Metals
  { symbol: 'GC', name: 'Gold', category: 'precious-metals', subcategory: 'Precious', unit: '$/oz', basePrice: 2650.00, volatility: 0.010, decimals: 2 },
  { symbol: 'SI', name: 'Silver', category: 'precious-metals', subcategory: 'Precious', unit: '$/oz', basePrice: 31.20, volatility: 0.018, decimals: 3 },
  { symbol: 'PL', name: 'Platinum', category: 'precious-metals', subcategory: 'Precious', unit: '$/oz', basePrice: 1020.00, volatility: 0.014, decimals: 2 },
  { symbol: 'PA', name: 'Palladium', category: 'precious-metals', subcategory: 'Precious', unit: '$/oz', basePrice: 980.00, volatility: 0.020, decimals: 2 },
  // Industrial Metals
  { symbol: 'HG', name: 'Copper', category: 'industrial-metals', subcategory: 'Industrial', unit: '$/lb', basePrice: 4.22, volatility: 0.016, decimals: 4 },
  { symbol: 'AL', name: 'Aluminum', category: 'industrial-metals', subcategory: 'Industrial', unit: '$/mt', basePrice: 2380.00, volatility: 0.014, decimals: 2 },
  // Grains
  { symbol: 'ZC', name: 'Corn', category: 'grains', subcategory: 'Grains', unit: '$/bu', basePrice: 452.00, volatility: 0.015, decimals: 2 },
  { symbol: 'ZW', name: 'Wheat', category: 'grains', subcategory: 'Grains', unit: '$/bu', basePrice: 582.00, volatility: 0.018, decimals: 2 },
  { symbol: 'ZS', name: 'Soybeans', category: 'grains', subcategory: 'Grains', unit: '$/bu', basePrice: 1185.00, volatility: 0.014, decimals: 2 },
  { symbol: 'ZM', name: 'Soybean Meal', category: 'grains', subcategory: 'Grains', unit: '$/ton', basePrice: 325.00, volatility: 0.016, decimals: 2 },
  { symbol: 'ZL', name: 'Soybean Oil', category: 'grains', subcategory: 'Grains', unit: '$/lb', basePrice: 45.80, volatility: 0.018, decimals: 2 },
  // Softs
  { symbol: 'KC', name: 'Coffee', category: 'softs', subcategory: 'Softs', unit: '$/lb', basePrice: 185.50, volatility: 0.025, decimals: 2 },
  { symbol: 'SB', name: 'Sugar #11', category: 'softs', subcategory: 'Softs', unit: '$/lb', basePrice: 21.30, volatility: 0.020, decimals: 2 },
  { symbol: 'CT', name: 'Cotton', category: 'softs', subcategory: 'Softs', unit: '$/lb', basePrice: 82.40, volatility: 0.018, decimals: 2 },
  { symbol: 'CC', name: 'Cocoa', category: 'softs', subcategory: 'Softs', unit: '$/mt', basePrice: 8200.00, volatility: 0.028, decimals: 2 },
];

export interface PriceData {
  symbol: string;
  name: string;
  category: string;
  subcategory: string;
  unit: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  bid: number | null;
  ask: number | null;
  volume: string;
  timestamp: string;
  decimals: number;
  sparkline: number[];
}

export interface FuturesContract {
  month: string;
  code: string;
  price: number;
  change: number;
  volume: number;
  openInterest: number;
}

export interface SpreadData {
  name: string;
  value: number;
  change: number | null;
  changePercent: number | null;
  description: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  time: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
  symbols: string[];
  link?: string;
}

export interface MacroEvent {
  date: string;
  time: string;
  event: string;
  actual: string;
  forecast: string;
  previous: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

export interface UpcomingDataEvent {
  date: string;
  time: string;
  event: string;
  source: string;
  impact: 'high' | 'medium' | 'low';
  category: 'energy' | 'metals' | 'agriculture' | 'macro' | 'all';
  symbols: string[];
}

export interface HistoricalBar {
  timestamp: number;
  close: number;
}

export interface CorrelationData {
  symbols: string[];
  names: string[];
  matrix: number[][];
}

export interface MacroIndicator {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  category: 'currency' | 'rates' | 'equity' | 'volatility' | 'crypto';
}

/**
 * Compute inter-commodity spreads from real prices only.
 * No simulated changes are included.
 */
export function computeSpreads(prices: PriceData[]): SpreadData[] {
  const priceMap = new Map(prices.map(p => [p.symbol, p]));
  const wti = priceMap.get('CL');
  const brent = priceMap.get('CO');
  const rb = priceMap.get('RB');
  const ho = priceMap.get('HO');
  const gc = priceMap.get('GC');
  const si = priceMap.get('SI');
  const zs = priceMap.get('ZS');
  const zm = priceMap.get('ZM');
  const zl = priceMap.get('ZL');

  const spreads: SpreadData[] = [];

  if (wti && brent) {
    const val = Number((brent.price - wti.price).toFixed(2));
    spreads.push({ name: 'Brent-WTI Spread', value: val, change: null, changePercent: null, description: 'Brent crude vs WTI crude differential' });
  }
  if (wti && rb) {
    const crackVal = Number((rb.price * 42 - wti.price).toFixed(2));
    spreads.push({ name: 'Gasoline Crack', value: crackVal, change: null, changePercent: null, description: 'RBOB gasoline vs WTI crude crack spread' });
  }
  if (wti && ho) {
    const hoCrack = Number((ho.price * 42 - wti.price).toFixed(2));
    spreads.push({ name: 'Heating Oil Crack', value: hoCrack, change: null, changePercent: null, description: 'Heating oil vs WTI crude crack spread' });
  }
  if (gc && si) {
    const ratio = Number((gc.price / si.price).toFixed(1));
    spreads.push({ name: 'Gold/Silver Ratio', value: ratio, change: null, changePercent: null, description: 'Gold to silver price ratio' });
  }
  if (zs && zm && zl) {
    const crushVal = Number((zm.price * 0.022 + zl.price * 0.11 - zs.price / 100).toFixed(2));
    spreads.push({ name: 'Soybean Crush', value: crushVal, change: null, changePercent: null, description: 'Soybean crush spread (meal + oil vs beans)' });
  }

  return spreads;
}
