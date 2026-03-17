'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { PriceData } from '@/app/lib/commodities';

interface ChartPoint {
  time: string;
  timestamp: number;
  price: number;
}

type ChartRange = '5d' | '1mo' | '1y';

interface PriceChartModalProps {
  price: PriceData;
  onClose: () => void;
}

export function PriceChartModal({ price, onClose }: PriceChartModalProps) {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<ChartRange>('5d');

  const fetchChart = useCallback(async (r: ChartRange) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/commodities?type=chart&symbol=${price.symbol}&range=${r}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();

      if (json.history && json.history.length > 0) {
        const formatFn = r === '1y' ? formatWeeklyTime : r === '1mo' ? formatDailyTime : formatChartTime;
        const points: ChartPoint[] = json.history.map((bar: { timestamp: number; close: number }) => ({
          time: formatFn(bar.timestamp),
          timestamp: bar.timestamp,
          price: Number(bar.close.toFixed(price.decimals)),
        }));
        setChartData(points);
      } else {
        const points: ChartPoint[] = price.sparkline.map((v, i) => ({
          time: `${i + 1}`,
          timestamp: i,
          price: v,
        }));
        setChartData(points);
      }
    } catch {
      const points: ChartPoint[] = price.sparkline.map((v, i) => ({
        time: `${i + 1}`,
        timestamp: i,
        price: v,
      }));
      setChartData(points);
    } finally {
      setLoading(false);
    }
  }, [price.symbol, price.sparkline, price.decimals]);

  useEffect(() => {
    fetchChart(range);
  }, [fetchChart, range]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const isPositive = price.change >= 0;
  const color = isPositive ? '#10b981' : '#ef4444';
  const gradientId = `chart-gradient-${price.symbol}`;

  const chartPrices = chartData.map(d => d.price);
  const minPrice = chartPrices.length > 0 ? Math.min(...chartPrices) : 0;
  const maxPrice = chartPrices.length > 0 ? Math.max(...chartPrices) : 0;
  const pricePadding = (maxPrice - minPrice) * 0.05 || 1;

  const rangeLabel = range === '1y' ? '1-Year Price History (weekly)' : range === '1mo' ? '1-Month Price History (daily)' : '5-Day Price History (15min intervals)';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#0d1019] border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">{price.symbol}</span>
            <div>
              <h2 className="text-lg font-bold text-white">{price.name}</h2>
              <span className="text-xs text-slate-500">{price.unit}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-end gap-4">
            <span className="text-3xl font-mono font-bold text-white">
              {price.price.toLocaleString(undefined, { minimumFractionDigits: price.decimals, maximumFractionDigits: price.decimals })}
            </span>
            <div className="pb-1">
              <span className={`text-lg font-mono font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{price.change.toFixed(price.decimals)}
              </span>
              <span className={`text-sm font-mono ml-2 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                ({isPositive ? '+' : ''}{price.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div>
              <span className="text-xs text-slate-500 block">Open</span>
              <span className="text-sm font-mono text-slate-200">
                {price.open.toLocaleString(undefined, { minimumFractionDigits: price.decimals, maximumFractionDigits: price.decimals })}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">High</span>
              <span className="text-sm font-mono text-emerald-400">
                {price.high.toLocaleString(undefined, { minimumFractionDigits: price.decimals, maximumFractionDigits: price.decimals })}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Low</span>
              <span className="text-sm font-mono text-red-400">
                {price.low.toLocaleString(undefined, { minimumFractionDigits: price.decimals, maximumFractionDigits: price.decimals })}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Volume</span>
              <span className="text-sm font-mono text-slate-200">{price.volume}</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-300">{rangeLabel}</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setRange('5d')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  range === '5d'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 border border-slate-700/50 hover:border-slate-600'
                }`}
              >
                5D
              </button>
              <button
                onClick={() => setRange('1mo')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  range === '1mo'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 border border-slate-700/50 hover:border-slate-600'
                }`}
              >
                1M
              </button>
              <button
                onClick={() => setRange('1y')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  range === '1y'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 border border-slate-700/50 hover:border-slate-600'
                }`}
              >
                1Y
              </button>
              <span className="text-xs text-slate-500 ml-2">{chartData.length} pts</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#334155' }}
                  interval="preserveStartEnd"
                  minTickGap={60}
                />
                <YAxis
                  domain={[minPrice - pricePadding, maxPrice + pricePadding]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(v: number) => v.toFixed(price.decimals > 2 ? 2 : price.decimals)}
                  width={65}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: number | undefined) => [
                    value != null ? value.toLocaleString(undefined, { minimumFractionDigits: price.decimals, maximumFractionDigits: price.decimals }) : '',
                    'Price',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={color}
                  fill={`url(#${gradientId})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: color, stroke: '#0d1019', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-500 text-sm">
              No chart data available
            </div>
          )}
        </div>

        <div className="px-4 pb-4">
          <p className="text-xs text-slate-600 text-center">
            Data from Yahoo Finance. Prices delayed ~15 minutes. Click outside or press Esc to close.
          </p>
        </div>
      </div>
    </div>
  );
}

function formatChartTime(ms: number): string {
  const d = new Date(ms);
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${month} ${day} ${hours}:${mins}`;
}

function formatDailyTime(ms: number): string {
  const d = new Date(ms);
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  return `${month} ${day}`;
}

function formatWeeklyTime(ms: number): string {
  const d = new Date(ms);
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const year = d.getFullYear().toString().slice(-2);
  return `${month} '${year}`;
}
