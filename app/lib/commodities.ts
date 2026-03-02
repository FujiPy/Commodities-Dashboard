// Commodity definitions and data simulation for the dashboard

export interface CommodityDef {
  symbol: string;
  name: string;
  category: 'energy' | 'precious-metals' | 'industrial-metals' | 'grains' | 'softs';
  subcategory: string;
  unit: string;
  basePrice: number;
  volatility: number; // daily vol as fraction
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
  { symbol: 'ZN', name: 'Zinc', category: 'industrial-metals', subcategory: 'Industrial', unit: '$/mt', basePrice: 2720.00, volatility: 0.016, decimals: 2 },
  { symbol: 'NI', name: 'Nickel', category: 'industrial-metals', subcategory: 'Industrial', unit: '$/mt', basePrice: 16450.00, volatility: 0.020, decimals: 2 },
  // Grains
  { symbol: 'ZC', name: 'Corn', category: 'grains', subcategory: 'Grains', unit: '¢/bu', basePrice: 452.00, volatility: 0.015, decimals: 2 },
  { symbol: 'ZW', name: 'Wheat', category: 'grains', subcategory: 'Grains', unit: '¢/bu', basePrice: 582.00, volatility: 0.018, decimals: 2 },
  { symbol: 'ZS', name: 'Soybeans', category: 'grains', subcategory: 'Grains', unit: '¢/bu', basePrice: 1185.00, volatility: 0.014, decimals: 2 },
  { symbol: 'ZM', name: 'Soybean Meal', category: 'grains', subcategory: 'Grains', unit: '$/ton', basePrice: 325.00, volatility: 0.016, decimals: 2 },
  { symbol: 'ZL', name: 'Soybean Oil', category: 'grains', subcategory: 'Grains', unit: '¢/lb', basePrice: 45.80, volatility: 0.018, decimals: 2 },
  // Softs
  { symbol: 'KC', name: 'Coffee', category: 'softs', subcategory: 'Softs', unit: '¢/lb', basePrice: 185.50, volatility: 0.025, decimals: 2 },
  { symbol: 'SB', name: 'Sugar #11', category: 'softs', subcategory: 'Softs', unit: '¢/lb', basePrice: 21.30, volatility: 0.020, decimals: 2 },
  { symbol: 'CT', name: 'Cotton', category: 'softs', subcategory: 'Softs', unit: '¢/lb', basePrice: 82.40, volatility: 0.018, decimals: 2 },
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
  bid: number;
  ask: number;
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
  change: number;
  changePercent: number;
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

// Deterministic-ish random based on seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate a price with realistic movement
function simulatePrice(base: number, volatility: number, seed: number): number {
  const r = seededRandom(seed);
  const move = (r - 0.5) * 2 * volatility * base;
  return base + move;
}

// Generate sparkline data (last 20 ticks)
function generateSparkline(base: number, volatility: number, timeSeed: number): number[] {
  const points: number[] = [];
  let price = base;
  for (let i = 0; i < 20; i++) {
    const r = seededRandom(timeSeed * 100 + i * 7.3);
    price += (r - 0.5) * 2 * volatility * base * 0.3;
    points.push(Number(price.toFixed(4)));
  }
  return points;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_CODES = ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'];

export function generateFuturesCurve(commodity: CommodityDef, timeSeed: number, realSpotPrice?: number | null): FuturesContract[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const contracts: FuturesContract[] = [];

  // Use real spot price if available, otherwise fall back to hardcoded base
  const spotPrice = realSpotPrice ?? commodity.basePrice;

  // Determine curve shape: energy tends to backwardation, metals contango, ags seasonal
  let curveSlope = 0;
  if (commodity.category === 'energy') {
    curveSlope = -0.003; // slight backwardation
  } else if (commodity.category === 'precious-metals') {
    curveSlope = 0.004; // contango (storage + financing)
  } else if (commodity.category === 'industrial-metals') {
    curveSlope = 0.002;
  } else {
    curveSlope = 0.001; // slight carry for ags
  }

  for (let i = 0; i < 12; i++) {
    const monthIdx = (currentMonth + i + 1) % 12;
    const year = currentYear + Math.floor((currentMonth + i + 1) / 12);
    const r = seededRandom(timeSeed * 50 + i * 13.7);
    const baseMove = curveSlope * (i + 1) * spotPrice;
    const noise = (r - 0.5) * commodity.volatility * spotPrice * 0.5;
    const price = spotPrice + baseMove + noise;

    contracts.push({
      month: `${MONTHS[monthIdx]} ${year.toString().slice(2)}`,
      code: `${commodity.symbol}${MONTH_CODES[monthIdx]}${year.toString().slice(2)}`,
      price: Number(price.toFixed(commodity.decimals)),
      change: Number(((r - 0.5) * commodity.volatility * spotPrice * 0.8).toFixed(commodity.decimals)),
      volume: Math.floor(5000 + seededRandom(timeSeed + i * 3.1) * 80000),
      openInterest: Math.floor(20000 + seededRandom(timeSeed + i * 5.7) * 200000),
    });
  }

  return contracts;
}

export function generateAllPrices(timeSeed: number): PriceData[] {
  return COMMODITIES.map((c, idx) => {
    const seed = timeSeed + idx * 17.3;
    const price = simulatePrice(c.basePrice, c.volatility, seed);
    const open = simulatePrice(c.basePrice, c.volatility * 0.3, seed * 0.1);
    const change = price - open;
    const changePercent = (change / open) * 100;
    const high = Math.max(price, open) + Math.abs(seededRandom(seed + 1) * c.volatility * c.basePrice * 0.5);
    const low = Math.min(price, open) - Math.abs(seededRandom(seed + 2) * c.volatility * c.basePrice * 0.5);
    const spread = c.basePrice * 0.0005;

    return {
      symbol: c.symbol,
      name: c.name,
      category: c.category,
      subcategory: c.subcategory,
      unit: c.unit,
      price: Number(price.toFixed(c.decimals)),
      change: Number(change.toFixed(c.decimals)),
      changePercent: Number(changePercent.toFixed(2)),
      high: Number(high.toFixed(c.decimals)),
      low: Number(low.toFixed(c.decimals)),
      open: Number(open.toFixed(c.decimals)),
      bid: Number((price - spread).toFixed(c.decimals)),
      ask: Number((price + spread).toFixed(c.decimals)),
      volume: `${(Math.floor(seededRandom(seed + 5) * 150) + 20).toLocaleString()}K`,
      timestamp: new Date().toISOString(),
      decimals: c.decimals,
      sparkline: generateSparkline(price, c.volatility, timeSeed + idx),
    };
  });
}

export function generateSpreads(prices: PriceData[], timeSeed: number): SpreadData[] {
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
    spreads.push({ name: 'Brent-WTI Spread', value: val, change: Number(((seededRandom(timeSeed * 3) - 0.5) * 0.4).toFixed(2)), changePercent: Number(((seededRandom(timeSeed * 3) - 0.5) * 5).toFixed(2)), description: 'Brent crude vs WTI crude differential' });
  }
  if (wti && rb) {
    const crackVal = Number((rb.price * 42 - wti.price).toFixed(2));
    spreads.push({ name: 'Gasoline Crack', value: crackVal, change: Number(((seededRandom(timeSeed * 4) - 0.5) * 1.2).toFixed(2)), changePercent: Number(((seededRandom(timeSeed * 4) - 0.5) * 4).toFixed(2)), description: 'RBOB gasoline vs WTI crude crack spread' });
  }
  if (wti && ho) {
    const hoCrack = Number((ho.price * 42 - wti.price).toFixed(2));
    spreads.push({ name: 'Heating Oil Crack', value: hoCrack, change: Number(((seededRandom(timeSeed * 5) - 0.5) * 1.0).toFixed(2)), changePercent: Number(((seededRandom(timeSeed * 5) - 0.5) * 3.5).toFixed(2)), description: 'Heating oil vs WTI crude crack spread' });
  }
  if (gc && si) {
    const ratio = Number((gc.price / si.price).toFixed(1));
    spreads.push({ name: 'Gold/Silver Ratio', value: ratio, change: Number(((seededRandom(timeSeed * 6) - 0.5) * 1.5).toFixed(1)), changePercent: Number(((seededRandom(timeSeed * 6) - 0.5) * 2).toFixed(2)), description: 'Gold to silver price ratio' });
  }
  if (zs && zm && zl) {
    const crushVal = Number((zm.price * 0.022 + zl.price * 0.11 - zs.price / 100).toFixed(2));
    spreads.push({ name: 'Soybean Crush', value: crushVal, change: Number(((seededRandom(timeSeed * 7) - 0.5) * 0.5).toFixed(2)), changePercent: Number(((seededRandom(timeSeed * 7) - 0.5) * 3).toFixed(2)), description: 'Soybean crush spread (meal + oil vs beans)' });
  }

  // Calendar spreads
  if (wti) {
    spreads.push({ name: 'WTI M1-M2', value: Number(((seededRandom(timeSeed * 8) - 0.3) * 1.5).toFixed(2)), change: Number(((seededRandom(timeSeed * 9) - 0.5) * 0.3).toFixed(2)), changePercent: Number(((seededRandom(timeSeed * 9) - 0.5) * 8).toFixed(2)), description: 'WTI front month vs second month calendar spread' });
  }
  if (brent) {
    spreads.push({ name: 'Brent M1-M2', value: Number(((seededRandom(timeSeed * 10) - 0.3) * 1.2).toFixed(2)), change: Number(((seededRandom(timeSeed * 11) - 0.5) * 0.25).toFixed(2)), changePercent: Number(((seededRandom(timeSeed * 11) - 0.5) * 6).toFixed(2)), description: 'Brent front month vs second month calendar spread' });
  }

  return spreads;
}

// Realistic correlation matrix
const CORRELATION_BASE: Record<string, Record<string, number>> = {
  CL: { CL: 1, CO: 0.97, NG: 0.25, RB: 0.92, HO: 0.93, GC: 0.15, SI: 0.20, PL: 0.30, PA: 0.28, HG: 0.45, AL: 0.40, ZN: 0.38, NI: 0.35, ZC: 0.18, ZW: 0.12, ZS: 0.22, ZM: 0.18, ZL: 0.30, KC: 0.10, SB: 0.15, CT: 0.20, CC: 0.08 },
  CO: { CO: 1, NG: 0.22, RB: 0.90, HO: 0.91, GC: 0.14, SI: 0.18, PL: 0.28, PA: 0.26, HG: 0.43, AL: 0.38, ZN: 0.36, NI: 0.33, ZC: 0.16, ZW: 0.10, ZS: 0.20, ZM: 0.16, ZL: 0.28, KC: 0.08, SB: 0.13, CT: 0.18, CC: 0.06 },
  NG: { NG: 1, RB: 0.20, HO: 0.35, GC: 0.05, SI: 0.08, PL: 0.10, PA: 0.08, HG: 0.15, AL: 0.12, ZN: 0.10, NI: 0.12, ZC: 0.22, ZW: 0.18, ZS: 0.15, ZM: 0.12, ZL: 0.10, KC: 0.05, SB: 0.08, CT: 0.06, CC: 0.03 },
  RB: { RB: 1, HO: 0.85, GC: 0.12, SI: 0.16, PL: 0.25, PA: 0.22, HG: 0.40, AL: 0.35, ZN: 0.33, NI: 0.30, ZC: 0.15, ZW: 0.10, ZS: 0.18, ZM: 0.14, ZL: 0.25, KC: 0.08, SB: 0.12, CT: 0.16, CC: 0.05 },
  HO: { HO: 1, GC: 0.13, SI: 0.17, PL: 0.27, PA: 0.24, HG: 0.42, AL: 0.37, ZN: 0.35, NI: 0.32, ZC: 0.16, ZW: 0.11, ZS: 0.20, ZM: 0.15, ZL: 0.27, KC: 0.09, SB: 0.13, CT: 0.17, CC: 0.06 },
  GC: { GC: 1, SI: 0.82, PL: 0.65, PA: 0.45, HG: 0.30, AL: 0.22, ZN: 0.20, NI: 0.18, ZC: 0.05, ZW: 0.08, ZS: 0.10, ZM: 0.08, ZL: 0.12, KC: 0.05, SB: 0.03, CT: 0.08, CC: 0.02 },
  SI: { SI: 1, PL: 0.70, PA: 0.52, HG: 0.55, AL: 0.40, ZN: 0.38, NI: 0.35, ZC: 0.08, ZW: 0.10, ZS: 0.12, ZM: 0.10, ZL: 0.15, KC: 0.06, SB: 0.05, CT: 0.10, CC: 0.03 },
  PL: { PL: 1, PA: 0.62, HG: 0.48, AL: 0.38, ZN: 0.35, NI: 0.40, ZC: 0.10, ZW: 0.08, ZS: 0.12, ZM: 0.10, ZL: 0.14, KC: 0.07, SB: 0.05, CT: 0.09, CC: 0.04 },
  PA: { PA: 1, HG: 0.42, AL: 0.35, ZN: 0.32, NI: 0.38, ZC: 0.08, ZW: 0.06, ZS: 0.10, ZM: 0.08, ZL: 0.12, KC: 0.05, SB: 0.04, CT: 0.07, CC: 0.03 },
  HG: { HG: 1, AL: 0.72, ZN: 0.68, NI: 0.65, ZC: 0.20, ZW: 0.15, ZS: 0.22, ZM: 0.18, ZL: 0.25, KC: 0.12, SB: 0.10, CT: 0.18, CC: 0.08 },
  AL: { AL: 1, ZN: 0.75, NI: 0.70, ZC: 0.18, ZW: 0.12, ZS: 0.20, ZM: 0.15, ZL: 0.22, KC: 0.10, SB: 0.08, CT: 0.15, CC: 0.06 },
  ZN: { ZN: 1, NI: 0.72, ZC: 0.16, ZW: 0.10, ZS: 0.18, ZM: 0.14, ZL: 0.20, KC: 0.08, SB: 0.07, CT: 0.13, CC: 0.05 },
  NI: { NI: 1, ZC: 0.14, ZW: 0.08, ZS: 0.15, ZM: 0.12, ZL: 0.18, KC: 0.07, SB: 0.06, CT: 0.12, CC: 0.04 },
  ZC: { ZC: 1, ZW: 0.72, ZS: 0.78, ZM: 0.65, ZL: 0.55, KC: 0.15, SB: 0.20, CT: 0.25, CC: 0.10 },
  ZW: { ZW: 1, ZS: 0.65, ZM: 0.55, ZL: 0.42, KC: 0.12, SB: 0.15, CT: 0.18, CC: 0.08 },
  ZS: { ZS: 1, ZM: 0.85, ZL: 0.75, KC: 0.18, SB: 0.22, CT: 0.28, CC: 0.12 },
  ZM: { ZM: 1, ZL: 0.60, KC: 0.14, SB: 0.18, CT: 0.22, CC: 0.10 },
  ZL: { ZL: 1, KC: 0.20, SB: 0.25, CT: 0.30, CC: 0.15 },
  KC: { KC: 1, SB: 0.35, CT: 0.28, CC: 0.42 },
  SB: { SB: 1, CT: 0.32, CC: 0.38 },
  CT: { CT: 1, CC: 0.22 },
  CC: { CC: 1 },
};

export function getCorrelationMatrix(timeSeed: number): { symbols: string[]; names: string[]; matrix: number[][] } {
  const symbols = COMMODITIES.map(c => c.symbol);
  const names = COMMODITIES.map(c => c.name);
  const n = symbols.length;
  const matrix: number[][] = [];

  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        row.push(1);
      } else {
        const si = symbols[i];
        const sj = symbols[j];
        const base = CORRELATION_BASE[si]?.[sj] ?? CORRELATION_BASE[sj]?.[si] ?? 0;
        // Add small noise
        const noise = (seededRandom(timeSeed + i * 31 + j * 17) - 0.5) * 0.04;
        row.push(Number(Math.max(-1, Math.min(1, base + noise)).toFixed(3)));
      }
    }
    matrix.push(row);
  }

  return { symbols, names, matrix };
}

export function generateNews(): NewsItem[] {
  // Sample headlines — rotated based on the current hour to add variety
  const allHeadlines: Omit<NewsItem, 'id' | 'time'>[] = [
    { headline: 'OPEC+ Discusses Production Targets Ahead of Upcoming Meeting', source: 'Reuters', category: 'energy', impact: 'high', symbols: ['CL', 'CO'] },
    { headline: 'US Crude Inventories Report Due This Week — Analysts Expect Draw', source: 'EIA', category: 'energy', impact: 'high', symbols: ['CL'] },
    { headline: 'China PMI Data Signals Steady Manufacturing Activity', source: 'Bloomberg', category: 'metals', impact: 'high', symbols: ['HG', 'AL', 'NI'] },
    { headline: 'Gold Steadies as Markets Weigh Central Bank Policy Outlook', source: 'CNBC', category: 'metals', impact: 'medium', symbols: ['GC', 'SI'] },
    { headline: 'USDA Crop Progress Report Shows Mixed Planting Conditions', source: 'USDA', category: 'agriculture', impact: 'high', symbols: ['ZC', 'ZW'] },
    { headline: 'Brazil Weather Concerns Continue to Support Coffee Futures', source: 'Reuters', category: 'agriculture', impact: 'medium', symbols: ['KC'] },
    { headline: 'Copper Inventories at Major Exchanges Remain Tight', source: 'LME', category: 'metals', impact: 'medium', symbols: ['HG'] },
    { headline: 'Natural Gas Storage Levels Tracked Ahead of Weekly Report', source: 'EIA', category: 'energy', impact: 'medium', symbols: ['NG'] },
    { headline: 'Wheat Markets Respond to Global Export Flow Updates', source: 'Bloomberg', category: 'agriculture', impact: 'high', symbols: ['ZW'] },
    { headline: 'Cocoa Supply Chain Constraints Persist in West Africa', source: 'FT', category: 'agriculture', impact: 'high', symbols: ['CC'] },
    { headline: 'Palladium Faces Headwinds from EV Adoption Trends', source: 'Reuters', category: 'metals', impact: 'medium', symbols: ['PA'] },
    { headline: 'Gasoline Demand Tracking Seasonal Patterns', source: 'EIA', category: 'energy', impact: 'low', symbols: ['RB'] },
    { headline: 'South American Soybean Harvest Progress Monitored', source: 'USDA', category: 'agriculture', impact: 'medium', symbols: ['ZS', 'ZM', 'ZL'] },
    { headline: 'Sugar Markets Weigh Global Production Estimates', source: 'Reuters', category: 'agriculture', impact: 'low', symbols: ['SB'] },
    { headline: 'Nickel Inventories Show Continued Decline at LME Warehouses', source: 'Bloomberg', category: 'metals', impact: 'medium', symbols: ['NI'] },
    { headline: 'Brent-WTI Spread Widens on Atlantic Basin Supply Dynamics', source: 'Reuters', category: 'energy', impact: 'medium', symbols: ['CL', 'CO'] },
    { headline: 'Silver ETF Holdings Reach Multi-Month Highs', source: 'Bloomberg', category: 'metals', impact: 'low', symbols: ['SI'] },
    { headline: 'Cotton Futures React to Weekly Export Sales Data', source: 'USDA', category: 'agriculture', impact: 'low', symbols: ['CT'] },
    { headline: 'Heating Oil Demand Adjusts as Seasonal Patterns Shift', source: 'EIA', category: 'energy', impact: 'low', symbols: ['HO'] },
    { headline: 'Aluminum Premiums Firm on Tight Spot Market Conditions', source: 'LME', category: 'metals', impact: 'medium', symbols: ['AL'] },
  ];

  // Rotate headlines based on current hour to add variety
  const hourSeed = Math.floor(Date.now() / 3600000);
  const offset = hourSeed % allHeadlines.length;
  const rotated = [...allHeadlines.slice(offset), ...allHeadlines.slice(0, offset)];
  const selected = rotated.slice(0, 15);

  // Generate relative timestamps
  const timeLabels = [
    '2 min ago', '8 min ago', '15 min ago', '22 min ago', '35 min ago',
    '48 min ago', '1 hr ago', '1 hr ago', '2 hr ago', '2 hr ago',
    '3 hr ago', '3 hr ago', '4 hr ago', '5 hr ago', '6 hr ago',
  ];

  return selected.map((item, i) => ({
    ...item,
    id: String(i + 1),
    time: timeLabels[i],
  }));
}

export function generateMacroCalendar(): MacroEvent[] {
  // Generate a dynamic calendar based on the current date
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function dateStr(daysFromNow: number): string {
    const d = new Date(now);
    d.setDate(currentDay + daysFromNow);
    return `${monthNames[d.getMonth()]} ${d.getDate()}`;
  }

  // Recurring economic events anchored relative to current date
  const events: MacroEvent[] = [
    { date: dateStr(1), time: '10:30 ET', event: 'EIA Weekly Petroleum Status', actual: '-', forecast: '-', previous: '-', impact: 'high', category: 'energy' },
    { date: dateStr(1), time: '10:30 ET', event: 'EIA Natural Gas Storage', actual: '-', forecast: '-', previous: '-', impact: 'high', category: 'energy' },
    { date: dateStr(2), time: '08:30 ET', event: 'US Non-Farm Payrolls', actual: '-', forecast: '-', previous: '-', impact: 'high', category: 'macro' },
    { date: dateStr(3), time: 'All Day', event: 'OPEC+ JMMC Meeting', actual: '-', forecast: '-', previous: '-', impact: 'high', category: 'energy' },
    { date: dateStr(3), time: '15:30 ET', event: 'CFTC Commitments of Traders', actual: '-', forecast: '-', previous: '-', impact: 'medium', category: 'all' },
    { date: dateStr(5), time: '12:00 ET', event: 'USDA WASDE Report', actual: '-', forecast: '-', previous: '-', impact: 'high', category: 'agriculture' },
    { date: dateStr(5), time: '10:00 ET', event: 'ISM Manufacturing PMI', actual: '-', forecast: '-', previous: '-', impact: 'medium', category: 'macro' },
    { date: dateStr(8), time: '08:30 ET', event: 'US CPI (YoY)', actual: '-', forecast: '-', previous: '-', impact: 'high', category: 'macro' },
    { date: dateStr(8), time: '16:00 ET', event: 'API Weekly Crude Stock', actual: '-', forecast: '-', previous: '-', impact: 'medium', category: 'energy' },
    { date: dateStr(10), time: '10:30 ET', event: 'EIA Weekly Petroleum Status', actual: '-', forecast: '-', previous: '-', impact: 'high', category: 'energy' },
    { date: dateStr(12), time: '14:00 ET', event: 'FOMC Rate Decision', actual: '-', forecast: '-', previous: '-', impact: 'high', category: 'macro' },
    { date: dateStr(15), time: 'All Day', event: 'LME Week', actual: '-', forecast: '-', previous: '-', impact: 'medium', category: 'metals' },
    { date: dateStr(18), time: '15:30 ET', event: 'CFTC Commitments of Traders', actual: '-', forecast: '-', previous: '-', impact: 'medium', category: 'all' },
    { date: dateStr(22), time: '12:00 ET', event: 'USDA Prospective Plantings', actual: '-', forecast: '-', previous: '-', impact: 'high', category: 'agriculture' },
    { date: dateStr(26), time: '10:00 ET', event: 'EIA Monthly Energy Review', actual: '-', forecast: '-', previous: '-', impact: 'medium', category: 'energy' },
  ];

  return events;
}
