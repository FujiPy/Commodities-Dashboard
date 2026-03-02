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

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  // Use current timestamp as seed for "live" data that changes each second
  const timeSeed = Math.floor(Date.now() / 2000); // changes every 2 seconds

  const prices = generateAllPrices(timeSeed);

  switch (type) {
    case 'prices':
      return NextResponse.json({ prices, timestamp: new Date().toISOString() });

    case 'futures': {
      const symbol = searchParams.get('symbol') || 'CL';
      const commodity = COMMODITIES.find(c => c.symbol === symbol);
      if (!commodity) {
        return NextResponse.json({ error: 'Unknown symbol' }, { status: 400 });
      }
      const curve = generateFuturesCurve(commodity, timeSeed);
      return NextResponse.json({ symbol, curve, timestamp: new Date().toISOString() });
    }

    case 'spreads':
      return NextResponse.json({ spreads: generateSpreads(prices, timeSeed), timestamp: new Date().toISOString() });

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
        allFutures[c.symbol] = generateFuturesCurve(c, timeSeed);
      }
      return NextResponse.json({
        prices,
        futures: allFutures,
        spreads: generateSpreads(prices, timeSeed),
        news: generateNews(),
        calendar: generateMacroCalendar(),
        correlations: getCorrelationMatrix(timeSeed),
        timestamp: new Date().toISOString(),
      });
    }
  }
}
