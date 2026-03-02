import { NextResponse } from 'next/server';
import { computeSpreads } from '@/app/lib/commodities';
import { fetchRealPrices } from '@/app/lib/fetchRealData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  // Fetch real prices from Yahoo Finance only — no simulation fallback
  let prices: Awaited<ReturnType<typeof fetchRealPrices>> = null;
  let dataSource: 'live' | 'cached' | 'unavailable' = 'unavailable';

  try {
    const realResult = await fetchRealPrices();
    if (realResult && realResult.prices.length > 0) {
      prices = realResult;
      dataSource = realResult.source;
    }
  } catch {
    // Real data unavailable
  }

  const priceList = prices?.prices ?? [];

  switch (type) {
    case 'prices':
      return NextResponse.json({ prices: priceList, dataSource, timestamp: new Date().toISOString() });

    case 'futures':
      // Futures curves are not available — no real futures data source
      return NextResponse.json({ symbol: searchParams.get('symbol') || 'CL', curve: null, dataSource, timestamp: new Date().toISOString() });

    case 'spreads':
      return NextResponse.json({ spreads: computeSpreads(priceList), dataSource, timestamp: new Date().toISOString() });

    case 'news':
      // No real news feed available
      return NextResponse.json({ news: null, timestamp: new Date().toISOString() });

    case 'calendar':
      // No real calendar data available
      return NextResponse.json({ events: null, timestamp: new Date().toISOString() });

    case 'correlations':
      // No real correlation data available
      return NextResponse.json({ correlations: null, timestamp: new Date().toISOString() });

    case 'all':
    default:
      return NextResponse.json({
        prices: priceList,
        futures: null,
        spreads: computeSpreads(priceList),
        news: null,
        calendar: null,
        correlations: null,
        dataSource,
        timestamp: new Date().toISOString(),
      });
  }
}
