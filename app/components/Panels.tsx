'use client';
import React from 'react';
import type { NewsItem, MacroEvent, SpreadData } from '@/app/lib/commodities';

function ImpactBadge({ impact }: { impact: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded border ${styles[impact]}`}>
      {impact}
    </span>
  );
}

export function NewsPanel({ news, filter }: { news: NewsItem[]; filter?: string }) {
  const filtered = filter ? news.filter(n => n.category === filter || n.symbols.some(s => {
    if (filter === 'energy') return ['CL', 'CO', 'NG', 'RB', 'HO'].includes(s);
    if (filter === 'metals') return ['GC', 'SI', 'PL', 'PA', 'HG', 'AL', 'ZN', 'NI'].includes(s);
    if (filter === 'agriculture') return ['ZC', 'ZW', 'ZS', 'ZM', 'ZL', 'KC', 'SB', 'CT', 'CC'].includes(s);
    return true;
  })) : news;

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        Live News Feed
      </h3>
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {filtered.map((item) => (
          <div key={item.id} className="border-b border-slate-800/50 pb-2 last:border-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-slate-200 leading-snug">{item.headline}</p>
              <ImpactBadge impact={item.impact} />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-slate-500">{item.source}</span>
              <span className="text-xs text-slate-600">{item.time}</span>
              <div className="flex gap-1">
                {item.symbols.map(s => (
                  <span key={s} className="text-xs font-mono bg-slate-800 text-slate-400 px-1 rounded">{s}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MacroCalendar({ events, filter }: { events: MacroEvent[]; filter?: string }) {
  const filtered = filter ? events.filter(e => e.category === filter || e.category === 'macro' || e.category === 'all') : events;

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">Economic Calendar & Events</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700/50 text-xs">
              <th className="text-left py-2 px-2 font-medium">Date</th>
              <th className="text-left py-2 px-2 font-medium">Time</th>
              <th className="text-left py-2 px-2 font-medium">Event</th>
              <th className="text-center py-2 px-2 font-medium">Impact</th>
              <th className="text-right py-2 px-2 font-medium">Actual</th>
              <th className="text-right py-2 px-2 font-medium">Forecast</th>
              <th className="text-right py-2 px-2 font-medium">Previous</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="py-2 px-2 text-xs text-slate-300 whitespace-nowrap">{e.date}</td>
                <td className="py-2 px-2 text-xs text-slate-400 whitespace-nowrap">{e.time}</td>
                <td className="py-2 px-2 text-slate-200 text-xs">{e.event}</td>
                <td className="py-2 px-2 text-center"><ImpactBadge impact={e.impact} /></td>
                <td className="py-2 px-2 text-right font-mono text-xs text-white">{e.actual}</td>
                <td className="py-2 px-2 text-right font-mono text-xs text-slate-300">{e.forecast}</td>
                <td className="py-2 px-2 text-right font-mono text-xs text-slate-400">{e.previous}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SpreadsPanel({ spreads }: { spreads: SpreadData[] }) {
  if (!spreads || spreads.length === 0) return null;
  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">Key Spreads</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {spreads.map((s) => {
          return (
            <div key={s.name} className="bg-slate-900/40 border border-slate-700/30 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">{s.name}</div>
              <div className="flex items-end justify-between">
                <span className="text-lg font-mono font-bold text-white">{s.value.toFixed(2)}</span>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-500">
                    Chg: N/A
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-1">{s.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
