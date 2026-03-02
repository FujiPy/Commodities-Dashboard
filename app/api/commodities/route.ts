import { NextResponse } from 'next/server';
import { computeSpreads } from '@/app/lib/commodities';
import { fetchRealPrices, computeCorrelationMatrix, fetchCommodityNews, getChartHistory, getMonthlyChartHistory, getYearlyChartHistory, fetchFuturesCurve, fetchMacroIndicators, getUpcomingDataEvents } from '@/app/lib/fetchRealData';

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

    case 'futures': {
      const futSymbol = searchParams.get('symbol') || 'CL';
      const curve = await fetchFuturesCurve(futSymbol);
      return NextResponse.json({ symbol: futSymbol, curve, dataSource, timestamp: new Date().toISOString() });
    }

    case 'spreads':
      return NextResponse.json({ spreads: computeSpreads(priceList), dataSource, timestamp: new Date().toISOString() });

    case 'news': {
      const news = await fetchCommodityNews();
      return NextResponse.json({ news: news.length > 0 ? news : null, timestamp: new Date().toISOString() });
    }

    case 'calendar': {
      const events = getUpcomingDataEvents();
      return NextResponse.json({ events: events.length > 0 ? events : null, timestamp: new Date().toISOString() });
    }

    case 'correlations': {
      const correlations = computeCorrelationMatrix();
      return NextResponse.json({ correlations, timestamp: new Date().toISOString() });
    }

    case 'chart': {
      const symbol = searchParams.get('symbol') || 'CL';
      const range = searchParams.get('range') || '5d';
      let history: Awaited<ReturnType<typeof getChartHistory>> = null;

      if (range === '1y') {
        history = await getYearlyChartHistory(symbol);
      } else if (range === '1mo') {
        history = await getMonthlyChartHistory(symbol);
      } else {
        history = getChartHistory(symbol);
      }

      const commodity = priceList.find(p => p.symbol === symbol);
      return NextResponse.json({
        symbol,
        range,
        history,
        price: commodity || null,
        timestamp: new Date().toISOString(),
      });
    }

    case 'macro': {
      const indicators = await fetchMacroIndicators();
      return NextResponse.json({ indicators, timestamp: new Date().toISOString() });
    }

    case 'all':
    default: {
      const [correlations, news, macroIndicators] = await Promise.all([
        Promise.resolve(computeCorrelationMatrix()),
        fetchCommodityNews(),
        fetchMacroIndicators(),
      ]);

      const upcomingEvents = getUpcomingDataEvents();

      return NextResponse.json({
        prices: priceList,
        futures: null,
        spreads: computeSpreads(priceList),
        news: news.length > 0 ? news : null,
        calendar: upcomingEvents.length > 0 ? upcomingEvents : null,
        correlations,
        macro: macroIndicators.length > 0 ? macroIndicators : null,
        dataSource,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
