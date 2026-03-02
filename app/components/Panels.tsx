'use client';
import React from 'react';
import type { NewsItem, SpreadData, MacroIndicator, UpcomingDataEvent } from '@/app/lib/commodities';

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
  const filtered = filter ? news.filter(n => n.category === filter || n.category === 'macro' || n.category === 'commodities' || n.symbols.some(s => {
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
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-200 leading-snug hover:text-blue-400 transition-colors"
                >
                  {item.headline}
                  <svg className="inline-block w-3 h-3 ml-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <p className="text-sm text-slate-200 leading-snug">{item.headline}</p>
              )}
              <ImpactBadge impact={item.impact} />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-slate-500">{item.source}</span>
              <span className="text-xs text-slate-600">{item.time}</span>
              {item.category === 'macro' && (
                <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">MACRO</span>
              )}
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

export function UpcomingEventsPanel({ events, filter }: { events: UpcomingDataEvent[]; filter?: string }) {
  const filtered = filter
    ? events.filter(e => e.category === filter || e.category === 'macro' || e.category === 'all' || e.symbols.some(s => {
        if (filter === 'energy') return ['CL', 'CO', 'NG', 'RB', 'HO'].includes(s);
        if (filter === 'metals') return ['GC', 'SI', 'PL', 'PA', 'HG', 'AL'].includes(s);
        if (filter === 'agriculture') return ['ZC', 'ZW', 'ZS', 'ZM', 'ZL', 'KC', 'SB', 'CT', 'CC'].includes(s);
        return true;
      }))
    : events;

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Upcoming Data Events
        <span className="text-[10px] text-slate-500 font-normal ml-1">Next 14 days</span>
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700/50 text-xs">
              <th className="text-left py-2 px-2 font-medium">Date</th>
              <th className="text-left py-2 px-2 font-medium">Time</th>
              <th className="text-left py-2 px-2 font-medium">Event</th>
              <th className="text-left py-2 px-2 font-medium">Source</th>
              <th className="text-center py-2 px-2 font-medium">Impact</th>
              <th className="text-left py-2 px-2 font-medium">Symbols</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="py-2 px-2 text-xs text-slate-300 whitespace-nowrap">{e.date}</td>
                <td className="py-2 px-2 text-xs text-slate-400 whitespace-nowrap">{e.time}</td>
                <td className="py-2 px-2 text-slate-200 text-xs">
                  {e.event}
                  {e.category === 'macro' && (
                    <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/20 px-1 py-0.5 rounded ml-1.5">MACRO</span>
                  )}
                </td>
                <td className="py-2 px-2 text-xs text-slate-400">{e.source}</td>
                <td className="py-2 px-2 text-center"><ImpactBadge impact={e.impact} /></td>
                <td className="py-2 px-2">
                  <div className="flex gap-1 flex-wrap">
                    {e.symbols.map(s => (
                      <span key={s} className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1 rounded">{s}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-xs text-slate-500">No upcoming events for this category in the next 14 days.</td>
              </tr>
            )}
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

const CATEGORY_LABELS: Record<MacroIndicator['category'], { label: string; icon: string }> = {
  rates: { label: 'Interest Rates & Yields', icon: '📈' },
  currency: { label: 'Currencies', icon: '💱' },
  equity: { label: 'Equity & ETFs', icon: '📊' },
  volatility: { label: 'Volatility', icon: '⚡' },
  crypto: { label: 'Crypto', icon: '₿' },
};

const CATEGORY_ORDER: MacroIndicator['category'][] = ['rates', 'currency', 'equity', 'volatility', 'crypto'];

function formatMacroValue(indicator: MacroIndicator): string {
  if (indicator.category === 'equity' || indicator.category === 'crypto') {
    return indicator.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (indicator.category === 'rates') {
    return indicator.value.toFixed(3) + '%';
  }
  return indicator.value.toFixed(4);
}

export function MacroIndicatorsPanel({ indicators }: { indicators: MacroIndicator[] }) {
  const grouped = new Map<MacroIndicator['category'], MacroIndicator[]>();
  for (const ind of indicators) {
    const existing = grouped.get(ind.category) || [];
    existing.push(ind);
    grouped.set(ind.category, existing);
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        Live Macro Indicators
      </h3>
      <div className="space-y-4">
        {CATEGORY_ORDER.map(cat => {
          const items = grouped.get(cat);
          if (!items || items.length === 0) return null;
          const meta = CATEGORY_LABELS[cat];
          return (
            <div key={cat}>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>{meta.icon}</span>
                {meta.label}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map(ind => {
                  const isPos = ind.change >= 0;
                  return (
                    <div
                      key={ind.symbol}
                      className="bg-slate-900/40 border border-slate-700/30 rounded-lg p-2.5 flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <div className="text-xs text-slate-400 truncate">{ind.name}</div>
                        <div className="text-sm font-mono font-semibold text-white mt-0.5">
                          {formatMacroValue(ind)}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className={`text-xs font-mono ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPos ? '+' : ''}{ind.change.toFixed(ind.category === 'rates' ? 3 : 2)}
                        </div>
                        <div className={`text-[10px] font-mono ${isPos ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                          {isPos ? '+' : ''}{ind.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
