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

export function generateFuturesCurve(commodity: CommodityDef, timeSeed: number): FuturesContract[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const contracts: FuturesContract[] = [];

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
    const baseMove = curveSlope * (i + 1) * commodity.basePrice;
    const noise = (r - 0.5) * commodity.volatility * commodity.basePrice * 0.5;
    const price = commodity.basePrice + baseMove + noise;

    contracts.push({
      month: `${MONTHS[monthIdx]} ${year.toString().slice(2)}`,
      code: `${commodity.symbol}${MONTH_CODES[monthIdx]}${year.toString().slice(2)}`,
      price: Number(price.toFixed(commodity.decimals)),
      change: Number(((r - 0.5) * commodity.volatility * commodity.basePrice * 0.8).toFixed(commodity.decimals)),
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
  return [
    { id: '1', headline: 'OPEC+ Maintains Production Cuts Through Q2, Signaling Supply Discipline', source: 'Reuters', time: '2 min ago', category: 'energy', impact: 'high', symbols: ['CL', 'CO'] },
    { id: '2', headline: 'US Crude Inventories Fall by 4.2M Barrels, Exceeding Expectations', source: 'EIA', time: '15 min ago', category: 'energy', impact: 'high', symbols: ['CL'] },
    { id: '3', headline: 'China Manufacturing PMI Rises to 51.2, Boosting Industrial Metals', source: 'Bloomberg', time: '28 min ago', category: 'metals', impact: 'high', symbols: ['HG', 'AL', 'NI'] },
    { id: '4', headline: 'Gold Holds Near Record as Fed Signals Patience on Rate Cuts', source: 'CNBC', time: '35 min ago', category: 'metals', impact: 'medium', symbols: ['GC', 'SI'] },
    { id: '5', headline: 'USDA Reports Lower-Than-Expected Corn Planting Intentions', source: 'USDA', time: '42 min ago', category: 'agriculture', impact: 'high', symbols: ['ZC', 'ZW'] },
    { id: '6', headline: 'Brazil Coffee Harvest Outlook Cut Due to Drought Conditions', source: 'Reuters', time: '1 hr ago', category: 'agriculture', impact: 'medium', symbols: ['KC'] },
    { id: '7', headline: 'LME Copper Stocks Fall to Lowest Level Since 2005', source: 'LME', time: '1 hr ago', category: 'metals', impact: 'medium', symbols: ['HG'] },
    { id: '8', headline: 'Natural Gas Prices Surge on Extended Cold Weather Forecast', source: 'AccuWeather', time: '1.5 hr ago', category: 'energy', impact: 'medium', symbols: ['NG'] },
    { id: '9', headline: 'India Lifts Wheat Export Ban, Pressuring Global Prices', source: 'Bloomberg', time: '2 hr ago', category: 'agriculture', impact: 'high', symbols: ['ZW'] },
    { id: '10', headline: 'Cocoa Prices Hit New Record as West African Supply Dwindles', source: 'FT', time: '2 hr ago', category: 'agriculture', impact: 'high', symbols: ['CC'] },
    { id: '11', headline: 'Palladium Demand Drops as EV Adoption Accelerates', source: 'Reuters', time: '3 hr ago', category: 'metals', impact: 'medium', symbols: ['PA'] },
    { id: '12', headline: 'US Gasoline Demand Rises Ahead of Summer Driving Season', source: 'EIA', time: '3 hr ago', category: 'energy', impact: 'low', symbols: ['RB'] },
    { id: '13', headline: 'Argentina Soybean Crop Estimate Raised to 50M Tonnes', source: 'USDA', time: '4 hr ago', category: 'agriculture', impact: 'medium', symbols: ['ZS', 'ZM', 'ZL'] },
    { id: '14', headline: 'Sugar Futures Fall on Improved Indian Monsoon Forecast', source: 'Reuters', time: '4 hr ago', category: 'agriculture', impact: 'low', symbols: ['SB'] },
    { id: '15', headline: 'Nickel Squeeze Fears Resurface as LME Inventories Decline', source: 'Bloomberg', time: '5 hr ago', category: 'metals', impact: 'medium', symbols: ['NI'] },
  ];
}

export function generateMacroCalendar(): MacroEvent[] {
  return [
    { date: 'Mar 3', time: '10:30 ET', event: 'EIA Weekly Petroleum Status', actual: '-', forecast: '-2.1M', previous: '-4.2M', impact: 'high', category: 'energy' },
    { date: 'Mar 3', time: '10:30 ET', event: 'EIA Natural Gas Storage', actual: '-', forecast: '-80 Bcf', previous: '-92 Bcf', impact: 'high', category: 'energy' },
    { date: 'Mar 4', time: '08:30 ET', event: 'US Non-Farm Payrolls', actual: '-', forecast: '185K', previous: '216K', impact: 'high', category: 'macro' },
    { date: 'Mar 5', time: 'All Day', event: 'OPEC+ JMMC Meeting', actual: '-', forecast: '-', previous: '-', impact: 'high', category: 'energy' },
    { date: 'Mar 5', time: '15:30 ET', event: 'CFTC Commitments of Traders', actual: '-', forecast: '-', previous: '-', impact: 'medium', category: 'all' },
    { date: 'Mar 7', time: '12:00 ET', event: 'USDA WASDE Report', actual: '-', forecast: '-', previous: '-', impact: 'high', category: 'agriculture' },
    { date: 'Mar 7', time: '10:00 ET', event: 'ISM Manufacturing PMI', actual: '-', forecast: '49.8', previous: '49.2', impact: 'medium', category: 'macro' },
    { date: 'Mar 10', time: '08:30 ET', event: 'US CPI (YoY)', actual: '-', forecast: '2.9%', previous: '3.1%', impact: 'high', category: 'macro' },
    { date: 'Mar 10', time: '16:00 ET', event: 'API Weekly Crude Stock', actual: '-', forecast: '-1.5M', previous: '-3.2M', impact: 'medium', category: 'energy' },
    { date: 'Mar 12', time: '10:30 ET', event: 'EIA Weekly Petroleum Status', actual: '-', forecast: '-', previous: '-', impact: 'high', category: 'energy' },
    { date: 'Mar 14', time: '14:00 ET', event: 'FOMC Rate Decision', actual: '-', forecast: '5.25%', previous: '5.25%', impact: 'high', category: 'macro' },
    { date: 'Mar 17', time: 'All Day', event: 'LME Week Asia', actual: '-', forecast: '-', previous: '-', impact: 'medium', category: 'metals' },
    { date: 'Mar 20', time: '15:30 ET', event: 'CFTC Commitments of Traders', actual: '-', forecast: '-', previous: '-', impact: 'medium', category: 'all' },
    { date: 'Mar 24', time: '12:00 ET', event: 'USDA Prospective Plantings', actual: '-', forecast: '-', previous: '-', impact: 'high', category: 'agriculture' },
    { date: 'Mar 28', time: '10:00 ET', event: 'EIA Monthly Energy Review', actual: '-', forecast: '-', previous: '-', impact: 'medium', category: 'energy' },
  ];
}
