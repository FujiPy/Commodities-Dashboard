'use client';
import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { FuturesContract } from '@/app/lib/commodities';

interface FuturesCurvePanelProps {
  symbols: { symbol: string; name: string; decimals: number }[];
}

export function FuturesCurvePanel({ symbols }: FuturesCurvePanelProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]?.symbol || 'CL');
  const [curveData, setCurveData] = useState<FuturesContract[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedSymbol(symbols[0]?.symbol || 'CL');
  }, [symbols]);

  useEffect(() => {
    let cancelled = false;
    async function fetchCurve() {
      setLoading(true);
      try {
        const res = await fetch(`/api/commodities?type=futures&symbol=${selectedSymbol}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        if (!cancelled) {
          setCurveData(json.curve);
        }
      } catch {
        if (!cancelled) setCurveData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCurve();
    return () => { cancelled = true; };
  }, [selectedSymbol]);

  const selected = symbols.find(s => s.symbol === selectedSymbol) || symbols[0];
  const decimals = selected?.decimals || 2;

  return (
    <div className="space-y-4">
      {/* Symbol selector */}
      <div className="flex flex-wrap items-center gap-2">
        {symbols.map(s => (
          <button
            key={s.symbol}
            onClick={() => setSelectedSymbol(s.symbol)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedSymbol === s.symbol
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <span className="font-mono mr-1">{s.symbol}</span>
            <span className="hidden sm:inline">{s.name}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-400">Loading futures curve for {selectedSymbol}...</p>
          </div>
        </div>
      ) : curveData && curveData.length > 0 ? (
        <div className="space-y-4">
          {/* Forward Curve Chart */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">
              {selected?.name || selectedSymbol} Forward Curve
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={curveData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <defs>
                  <linearGradient id={`fc-${selectedSymbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(v: number) => v.toFixed(decimals > 2 ? 2 : decimals)}
                  width={65}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: number | undefined) => [value != null ? value.toFixed(decimals) : '', 'Price']}
                />
                <Area type="monotone" dataKey="price" stroke="#3b82f6" fill={`url(#fc-${selectedSymbol})`} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
              <span>
                {curveData[0].price > curveData[curveData.length - 1].price
                  ? 'Backwardation (near > far)'
                  : curveData[0].price < curveData[curveData.length - 1].price
                    ? 'Contango (far > near)'
                    : 'Flat curve'}
              </span>
              <span>Spread: {(curveData[curveData.length - 1].price - curveData[0].price).toFixed(decimals)}</span>
            </div>
          </div>

          {/* Contracts Table */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Contract Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700/50 text-xs">
                    <th className="text-left py-2 px-2 font-medium">Contract</th>
                    <th className="text-left py-2 px-2 font-medium">Code</th>
                    <th className="text-right py-2 px-2 font-medium">Last</th>
                    <th className="text-right py-2 px-2 font-medium">Change</th>
                    <th className="text-right py-2 px-2 font-medium">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {curveData.map((c) => {
                    const isPos = c.change >= 0;
                    return (
                      <tr key={c.code} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="py-1.5 px-2 font-mono text-slate-200 text-xs">{c.month}</td>
                        <td className="py-1.5 px-2 font-mono text-slate-400 text-xs">{c.code}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-white">{c.price.toFixed(decimals)}</td>
                        <td className={`py-1.5 px-2 text-right font-mono ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPos ? '+' : ''}{c.change.toFixed(decimals)}
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono text-slate-400">
                          {c.volume > 0 ? c.volume.toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 mb-4">
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-300 mb-2">No Futures Data Available</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Futures curve data for {selected?.name || selectedSymbol} could not be retrieved. This may be due to a temporary API issue or the contracts not being actively traded.
          </p>
        </div>
      )}
    </div>
  );
}
