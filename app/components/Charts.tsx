'use client';
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar,
} from 'recharts';
import type { FuturesContract } from '@/app/lib/commodities';

export function ForwardCurveChart({ data, symbol, decimals = 2 }: { data: FuturesContract[]; symbol: string; decimals?: number }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data.map(d => d.price));
  const max = Math.max(...data.map(d => d.price));
  const padding = (max - min) * 0.1 || 1;

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">{symbol} Forward Curve</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <defs>
            <linearGradient id={`curve-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
          <YAxis domain={[min - padding, max + padding]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickFormatter={(v: number) => v.toFixed(decimals)} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value: number | undefined) => [value != null ? value.toFixed(decimals) : '', 'Price']}
          />
          <Area type="monotone" dataKey="price" stroke="#3b82f6" fill={`url(#curve-${symbol})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FuturesTable({ data, decimals = 2 }: { data: FuturesContract[]; decimals?: number }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400 border-b border-slate-700/50 text-xs">
            <th className="text-left py-2 px-2 font-medium">Contract</th>
            <th className="text-right py-2 px-2 font-medium">Last</th>
            <th className="text-right py-2 px-2 font-medium">Change</th>
            <th className="text-right py-2 px-2 font-medium">Volume</th>
            <th className="text-right py-2 px-2 font-medium">Open Int.</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c) => {
            const isPos = c.change >= 0;
            return (
              <tr key={c.code} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="py-1.5 px-2 font-mono text-slate-200 text-xs">{c.month}</td>
                <td className="py-1.5 px-2 text-right font-mono text-white">{c.price.toFixed(decimals)}</td>
                <td className={`py-1.5 px-2 text-right font-mono ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPos ? '+' : ''}{c.change.toFixed(decimals)}
                </td>
                <td className="py-1.5 px-2 text-right font-mono text-slate-400">{c.volume.toLocaleString()}</td>
                <td className="py-1.5 px-2 text-right font-mono text-slate-400">{c.openInterest.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function SparklineChart({ data, height = 60 }: { data: number[]; height?: number }) {
  if (!data || data.length < 2) return null;
  const chartData = data.map((v, i) => ({ v, i }));
  const isPositive = data[data.length - 1] >= data[0];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="v" stroke={isPositive ? '#00c853' : '#ff1744'} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function VolumeChart({ data }: { data: FuturesContract[] }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">Volume by Contract</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#334155' }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#334155' }} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
          <Bar dataKey="volume" fill="#6366f1" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
