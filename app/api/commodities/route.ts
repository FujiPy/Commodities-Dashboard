import { NextResponse } from 'next/server';
import {
  generateAllPrices,
  generateFuturesCurve,
  generateSpreads,
  generateNews,
  generateMacroCalendar,
  getCorrelationMatrix,
  COMMODITIES,
} from '@/app/lib/commodities';
import { fetchRealPrices, getCachedSpotPrice } from '@/app/lib/fetchRealData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  const timeSeed = Math.floor(Date.now() / 2000);

  // Try to get real prices, fall back to simulation
  let prices;
  let dataSource: 'live' | 'cached' | 'simulated' = 'simulated';

  try {
    const realResult = await fetchRealPrices();
    if (realResult && realResult.prices.length > 0) {
      // Merge real prices with simulated for any missing symbols
      const realPriceMap = new Map(realResult.prices.map(p => [p.symbol, p]));
      const simulatedPrices = generateAllPrices(timeSeed);
      const simulatedMap = new Map(simulatedPrices.map(p => [p.symbol, p]));

      // Use real data where available, simulated for the rest
      prices = COMMODITIES.map(c => {
        return realPriceMap.get(c.symbol) || simulatedMap.get(c.symbol)!;
      });

      dataSource = realResult.source;
    } else {
      prices = generateAllPrices(timeSeed);
    }
  } catch {
    prices = generateAllPrices(timeSeed);
  }

  switch (type) {
    case 'prices':
      return NextResponse.json({ prices, dataSource, timestamp: new Date().toISOString() });

    case 'futures': {
      const symbol = searchParams.get('symbol') || 'CL';
      const commodity = COMMODITIES.find(c => c.symbol === symbol);
      if (!commodity) {
        return NextResponse.json({ error: 'Unknown symbol' }, { status: 400 });
      }
      // Use real spot price as base for futures curve if available
      const realSpot = getCachedSpotPrice(symbol);
      const curve = generateFuturesCurve(commodity, timeSeed, realSpot);
      return NextResponse.json({ symbol, curve, dataSource, timestamp: new Date().toISOString() });
    }

    case 'spreads':
      return NextResponse.json({ spreads: generateSpreads(prices, timeSeed), dataSource, timestamp: new Date().toISOString() });

    case 'news':
      return NextResponse.json({ news: generateNews(), timestamp: new Date().toISOString() });

    case 'calendar':
      return NextResponse.json({ events: generateMacroCalendar(), timestamp: new Date().toISOString() });

    case 'correlations':
      return NextResponse.json({ ...getCorrelationMatrix(timeSeed), timestamp: new Date().toISOString() });

    case 'all':
    default: {
      const allFutures: Record<string, ReturnType<typeof generateFuturesCurve>> = {};
      for (const c of COMMODITIES) {
        const realSpot = getCachedSpotPrice(c.symbol);
        allFutures[c.symbol] = generateFuturesCurve(c, timeSeed, realSpot);
      }
      return NextResponse.json({
        prices,
        futures: allFutures,
        spreads: generateSpreads(prices, timeSeed),
        news: generateNews(),
        calendar: generateMacroCalendar(),
        correlations: getCorrelationMatrix(timeSeed),
        dataSource,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
