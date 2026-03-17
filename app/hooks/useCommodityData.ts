'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { PriceData, FuturesContract, SpreadData, NewsItem, UpcomingDataEvent, MacroIndicator } from '@/app/lib/commodities';

export type DataSource = 'live' | 'cached' | 'unavailable';

export interface CommodityData {
  prices: PriceData[];
  futures: Record<string, FuturesContract[]> | null;
  spreads: SpreadData[];
  news: NewsItem[] | null;
  calendar: UpcomingDataEvent[] | null;
  correlations: { symbols: string[]; names: string[]; matrix: number[][] } | null;
  macro: MacroIndicator[] | null;
  dataSource?: DataSource;
  timestamp: string;
}

export function useCommodityData(refreshInterval = 900_000) { // 15 minutes
  const [data, setData] = useState<CommodityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/commodities?type=all', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, refreshInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, refreshInterval]);

  return { data, loading, error, lastUpdate, refetch: fetchData };
}
