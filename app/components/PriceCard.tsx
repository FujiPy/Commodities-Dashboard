'use client';
import React from 'react';
import type { PriceData } from '@/app/lib/commodities';

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline fill="none" stroke={positive ? '#00c853' : '#ff1744'} strokeWidth="1.5" points={points} />
    </svg>
  );
}

export function PriceCard({ price, onClick, selected }: { price: PriceData; onClick?: () => void; selected?: boolean }) {
  const isPositive = price.change >= 0;
  const color = isPositive ? 'text-emerald-400' : 'text-red-400';
  const bgColor = isPositive ? 'bg-emerald-400/5' : 'bg-red-400/5';
  const borderColor = selected ? 'border-blue-500' : 'border-slate-700/50';

  return (
    <div
      onClick={onClick}
      className={`${bgColor} border ${borderColor} rounded-lg p-3 cursor-pointer hover:border-slate-500 transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">{price.symbol}</span>
          <span className="text-sm font-medium text-slate-200 truncate">{price.name}</span>
        </div>
        <Sparkline data={price.sparkline} positive={isPositive} />
      </div>
      <div className="flex items-end justify-between mt-2">
        <div>
          <span className="text-xl font-mono font-bold text-white">
            {price.price.toLocaleString(undefined, { minimumFractionDigits: price.decimals, maximumFractionDigits: price.decimals })}
          </span>
          <span className="text-xs text-slate-500 ml-1">{price.unit}</span>
        </div>
        <div className="text-right">
          <div className={`text-sm font-mono font-semibold ${color}`}>
            {isPositive ? '+' : ''}{price.change.toFixed(price.decimals)}
          </div>
          <div className={`text-xs font-mono ${color}`}>
            {isPositive ? '+' : ''}{price.changePercent.toFixed(2)}%
          </div>
        </div>
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
        <span>H: {price.high.toLocaleString(undefined, { minimumFractionDigits: price.decimals, maximumFractionDigits: price.decimals })}</span>
        <span>L: {price.low.toLocaleString(undefined, { minimumFractionDigits: price.decimals, maximumFractionDigits: price.decimals })}</span>
        <span>Vol: {price.volume}</span>
      </div>
    </div>
  );
}

export function PriceTable({ prices }: { prices: PriceData[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400 border-b border-slate-700/50 text-xs">
            <th className="text-left py-2 px-2 font-medium">Symbol</th>
            <th className="text-left py-2 px-2 font-medium">Name</th>
            <th className="text-right py-2 px-2 font-medium">Last</th>
            <th className="text-right py-2 px-2 font-medium">Chg</th>
            <th className="text-right py-2 px-2 font-medium">Chg%</th>
            <th className="text-right py-2 px-2 font-medium">Bid</th>
            <th className="text-right py-2 px-2 font-medium">Ask</th>
            <th className="text-right py-2 px-2 font-medium">High</th>
            <th className="text-right py-2 px-2 font-medium">Low</th>
            <th className="text-right py-2 px-2 font-medium">Vol</th>
            <th className="text-center py-2 px-2 font-medium">Trend</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((p) => {
            const isPos = p.change >= 0;
            const color = isPos ? 'text-emerald-400' : 'text-red-400';
            return (
              <tr key={p.symbol} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="py-2 px-2 font-mono text-xs text-slate-300">{p.symbol}</td>
                <td className="py-2 px-2 text-slate-200">{p.name}</td>
                <td className="py-2 px-2 text-right font-mono font-semibold text-white">
                  {p.price.toLocaleString(undefined, { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals })}
                </td>
                <td className={`py-2 px-2 text-right font-mono ${color}`}>
                  {isPos ? '+' : ''}{p.change.toFixed(p.decimals)}
                </td>
                <td className={`py-2 px-2 text-right font-mono ${color}`}>
                  {isPos ? '+' : ''}{p.changePercent.toFixed(2)}%
                </td>
                <td className="py-2 px-2 text-right font-mono text-slate-500">
                  {p.bid != null ? p.bid.toLocaleString(undefined, { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals }) : 'N/A'}
                </td>
                <td className="py-2 px-2 text-right font-mono text-slate-500">
                  {p.ask != null ? p.ask.toLocaleString(undefined, { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals }) : 'N/A'}
                </td>
                <td className="py-2 px-2 text-right font-mono text-slate-400">
                  {p.high.toLocaleString(undefined, { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals })}
                </td>
                <td className="py-2 px-2 text-right font-mono text-slate-400">
                  {p.low.toLocaleString(undefined, { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals })}
                </td>
                <td className="py-2 px-2 text-right font-mono text-slate-400">{p.volume}</td>
                <td className="py-2 px-2 text-center">
                  <Sparkline data={p.sparkline} positive={isPos} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
