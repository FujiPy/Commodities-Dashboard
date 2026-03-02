'use client';
import React from 'react';
import type { PriceData } from '@/app/lib/commodities';

function getHeatColor(pct: number): string {
  if (pct >= 3) return 'bg-emerald-400 text-emerald-950';
  if (pct >= 2) return 'bg-emerald-500 text-white';
  if (pct >= 1) return 'bg-emerald-600 text-white';
  if (pct >= 0.5) return 'bg-emerald-700 text-white';
  if (pct >= 0) return 'bg-emerald-900/60 text-emerald-300';
  if (pct >= -0.5) return 'bg-red-900/60 text-red-300';
  if (pct >= -1) return 'bg-red-700 text-white';
  if (pct >= -2) return 'bg-red-600 text-white';
  if (pct >= -3) return 'bg-red-500 text-white';
  return 'bg-red-400 text-red-950';
}

function getCategoryLabel(cat: string): string {
  switch (cat) {
    case 'energy': return 'Energy';
    case 'precious-metals': return 'Precious Metals';
    case 'industrial-metals': return 'Industrial Metals';
    case 'grains': return 'Grains';
    case 'softs': return 'Softs';
    default: return cat;
  }
}

export function Heatmap({ prices }: { prices: PriceData[] }) {
  // Group by category
  const categories = new Map<string, PriceData[]>();
  for (const p of prices) {
    const existing = categories.get(p.category) || [];
    existing.push(p);
    categories.set(p.category, existing);
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300">Daily Performance Heatmap</h3>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <div className="w-4 h-3 rounded-sm bg-red-500"></div>
          <span className="mr-2">-3%+</span>
          <div className="w-4 h-3 rounded-sm bg-red-900/60"></div>
          <span className="mr-2">-0.5%</span>
          <div className="w-4 h-3 rounded-sm bg-emerald-900/60"></div>
          <span className="mr-2">+0.5%</span>
          <div className="w-4 h-3 rounded-sm bg-emerald-500"></div>
          <span>+3%+</span>
        </div>
      </div>

      <div className="space-y-4">
        {Array.from(categories.entries()).map(([cat, items]) => (
          <div key={cat}>
            <h4 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">{getCategoryLabel(cat)}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {items.map((p) => (
                <div
                  key={p.symbol}
                  className={`rounded-lg p-3 ${getHeatColor(p.changePercent)} transition-all duration-500 hover:scale-105 cursor-pointer`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold">{p.symbol}</span>
                    <span className="text-xs opacity-80">{p.name}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-mono font-bold">
                      {p.changePercent >= 0 ? '+' : ''}{p.changePercent.toFixed(2)}%
                    </span>
                    <span className="text-xs font-mono opacity-80">
                      {p.price.toLocaleString(undefined, { minimumFractionDigits: Math.min(p.decimals, 2), maximumFractionDigits: Math.min(p.decimals, 2) })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MiniHeatmap({ prices }: { prices: PriceData[] }) {
  const sorted = [...prices].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.slice(0, 5);
  const losers = sorted.slice(-5).reverse();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
        <h4 className="text-xs font-medium text-emerald-400 mb-2">Top Gainers</h4>
        {gainers.map((p) => (
          <div key={p.symbol} className="flex items-center justify-between py-1 border-b border-slate-800/30 last:border-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-300">{p.symbol}</span>
              <span className="text-xs text-slate-400">{p.name}</span>
            </div>
            <span className="font-mono text-xs text-emerald-400 font-semibold">+{p.changePercent.toFixed(2)}%</span>
          </div>
        ))}
      </div>
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
        <h4 className="text-xs font-medium text-red-400 mb-2">Top Losers</h4>
        {losers.map((p) => (
          <div key={p.symbol} className="flex items-center justify-between py-1 border-b border-slate-800/30 last:border-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-300">{p.symbol}</span>
              <span className="text-xs text-slate-400">{p.name}</span>
            </div>
            <span className="font-mono text-xs text-red-400 font-semibold">{p.changePercent.toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
