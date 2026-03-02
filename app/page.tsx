'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useCommodityData } from '@/app/hooks/useCommodityData';
import { PriceCard, PriceTable } from '@/app/components/PriceCard';
import { SpreadsPanel, NewsPanel, MacroIndicatorsPanel, UpcomingEventsPanel } from '@/app/components/Panels';
import { WorldMarketClock } from '@/app/components/WorldMarketClock';
import { Heatmap, MiniHeatmap } from '@/app/components/Heatmap';
import { CorrelationMatrix } from '@/app/components/CorrelationMatrix';
import { PriceChartModal } from '@/app/components/PriceChartModal';
import { FuturesCurvePanel } from '@/app/components/FuturesCurvePanel';
import { COMMODITIES } from '@/app/lib/commodities';
import type { PriceData } from '@/app/lib/commodities';
import Link from 'next/link';

type MainTab = 'energy' | 'metals' | 'agriculture' | 'correlations' | 'heatmap';
type SubTab = 'prices' | 'futures' | 'news';

const MAIN_TABS: { id: MainTab; label: string; icon: string }[] = [
  { id: 'energy', label: 'Energy', icon: '⚡' },
  { id: 'metals', label: 'Metals', icon: '🔩' },
  { id: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { id: 'correlations', label: 'Correlations', icon: '📊' },
  { id: 'heatmap', label: 'Heatmap', icon: '🗺️' },
];

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'prices', label: 'Spot Prices & Spreads' },
  { id: 'futures', label: 'Futures & Curves' },
  { id: 'news', label: 'News & Macro' },
];

function getCategorySymbols(tab: MainTab): string[] {
  if (tab === 'energy') return COMMODITIES.filter(c => c.category === 'energy').map(c => c.symbol);
  if (tab === 'metals') return COMMODITIES.filter(c => c.category === 'precious-metals' || c.category === 'industrial-metals').map(c => c.symbol);
  if (tab === 'agriculture') return COMMODITIES.filter(c => c.category === 'grains' || c.category === 'softs').map(c => c.symbol);
  return [];
}

function getCategoryFilter(tab: MainTab): string | undefined {
  if (tab === 'energy') return 'energy';
  if (tab === 'metals') return 'metals';
  if (tab === 'agriculture') return 'agriculture';
  return undefined;
}

function NotAvailablePanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-8 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 mb-4">
        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-slate-300 mb-2">{title}</h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto">{message}</p>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, lastUpdate } = useCommodityData(3000);
  const [mainTab, setMainTab] = useState<MainTab>('energy');
  const [subTab, setSubTab] = useState<SubTab>('prices');
  const [selectedPrice, setSelectedPrice] = useState<PriceData | null>(null);

  const categoryPrices = useMemo(() => {
    if (!data?.prices) return [];
    const symbols = getCategorySymbols(mainTab);
    return data.prices.filter(p => symbols.includes(p.symbol));
  }, [data?.prices, mainTab]);

  const categoryGroups = useMemo(() => {
    const groups = new Map<string, typeof categoryPrices>();
    for (const p of categoryPrices) {
      const existing = groups.get(p.subcategory) || [];
      existing.push(p);
      groups.set(p.subcategory, existing);
    }
    return groups;
  }, [categoryPrices]);

  const handlePriceCardClick = useCallback((price: PriceData) => {
    setSelectedPrice(price);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPrice(null);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Loading market data...</p>
        </div>
      </div>
    );
  }

  const isCommodityTab = mainTab === 'energy' || mainTab === 'metals' || mainTab === 'agriculture';
  const hasNoPrices = !data?.prices || data.prices.length === 0;

  return (
    <div className="min-h-screen bg-[#0b0e14]">
      {/* Price Chart Modal */}
      {selectedPrice && (
        <PriceChartModal price={selectedPrice} onClose={handleCloseModal} />
      )}

      {/* Delay Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20">
        <div className="max-w-[1600px] mx-auto px-4 py-1.5 flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-amber-300/90">
            Market data is delayed by approximately 15 minutes.{' '}
            <Link href="/info" className="underline underline-offset-2 hover:text-amber-200 transition-colors">
              View data sources
            </Link>
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0d1019]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-white tracking-tight">Commodities Dashboard</h1>
              <div className="flex items-center gap-1.5 ml-2">
                {data?.dataSource === 'live' || data?.dataSource === 'cached' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 live-pulse"></span>
                    <span className="text-xs text-emerald-400 font-medium">LIVE</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span className="text-xs text-yellow-400 font-medium">UNAVAILABLE</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {data?.prices && data.prices.length > 0 && <MiniSummary prices={data.prices} />}
              {lastUpdate && (
                <span className="text-xs text-slate-500 font-mono">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
              <Link
                href="/info"
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Info
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Tabs */}
      <nav className="border-b border-slate-800 bg-[#0d1019]/50">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center gap-1">
            {MAIN_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setMainTab(tab.id); setSubTab('prices'); }}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  mainTab === tab.id
                    ? 'text-white border-blue-500 bg-blue-500/5'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Sub Tabs for commodity pages */}
      {isCommodityTab && (
        <div className="border-b border-slate-800/50 bg-[#0d1019]/30">
          <div className="max-w-[1600px] mx-auto px-4">
            <div className="flex items-center gap-1">
              {SUB_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id)}
                  className={`px-3 py-2 text-xs font-medium transition-all border-b-2 ${
                    subTab === tab.id
                      ? 'text-slate-200 border-slate-400'
                      : 'text-slate-500 border-transparent hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-4 py-4">
        {/* World Market Clock */}
        <div className="mb-4">
          <WorldMarketClock />
        </div>

        <div className="tab-content-enter">
          {/* Commodity Tab - Spot Prices */}
          {isCommodityTab && subTab === 'prices' && data && (
            <div className="space-y-6">
              {hasNoPrices ? (
                <NotAvailablePanel
                  title="Not Available"
                  message="Real-time price data is currently unavailable. Prices are sourced from Yahoo Finance and require an active market data connection."
                />
              ) : (
                <>
                  {/* Quick Summary */}
                  {categoryPrices.length > 0 && <MiniHeatmap prices={categoryPrices} />}

                  {/* Price Cards by subcategory */}
                  {Array.from(categoryGroups.entries()).map(([group, prices]) => (
                    <div key={group}>
                      <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">{group}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {prices.map(p => (
                          <PriceCard key={p.symbol} price={p} onClick={() => handlePriceCardClick(p)} />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Spreads */}
                  {data.spreads && data.spreads.length > 0 && (
                    <SpreadsPanel spreads={data.spreads.filter(s => {
                      if (mainTab === 'energy') return ['Brent-WTI Spread', 'Gasoline Crack', 'Heating Oil Crack'].includes(s.name);
                      if (mainTab === 'metals') return ['Gold/Silver Ratio'].includes(s.name);
                      if (mainTab === 'agriculture') return ['Soybean Crush'].includes(s.name);
                      return false;
                    })} />
                  )}

                  {/* Full Price Table */}
                  {categoryPrices.length > 0 && (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-slate-300 mb-3">Detailed Quotes</h3>
                      <PriceTable prices={categoryPrices} onRowClick={handlePriceCardClick} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Commodity Tab - Futures */}
          {isCommodityTab && subTab === 'futures' && (
            <FuturesCurvePanel
              symbols={getCategorySymbols(mainTab).map(sym => {
                const c = COMMODITIES.find(x => x.symbol === sym);
                return { symbol: sym, name: c?.name || sym, decimals: c?.decimals || 2 };
              })}
            />
          )}

          {/* Commodity Tab - News & Macro */}
          {isCommodityTab && subTab === 'news' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {data?.news && data.news.length > 0 ? (
                  <NewsPanel news={data.news} filter={getCategoryFilter(mainTab)} />
                ) : (
                  <NotAvailablePanel
                    title="News Feed - Loading"
                    message="Commodity news is being fetched from Yahoo Finance. If no news appears, the news API may be temporarily unavailable."
                  />
                )}
                {data?.macro && data.macro.length > 0 ? (
                  <MacroIndicatorsPanel indicators={data.macro} />
                ) : (
                  <NotAvailablePanel
                    title="Macro Indicators - Loading"
                    message="Macro economic indicators are being fetched from Yahoo Finance. If no data appears, the API may be temporarily unavailable."
                  />
                )}
              </div>
              {data?.calendar && data.calendar.length > 0 && (
                <UpcomingEventsPanel events={data.calendar} filter={getCategoryFilter(mainTab)} />
              )}
            </div>
          )}

          {/* Correlations Tab */}
          {mainTab === 'correlations' && (
            <>
              {data?.correlations ? (
                <CorrelationMatrix
                  symbols={data.correlations.symbols}
                  names={data.correlations.names}
                  matrix={data.correlations.matrix}
                />
              ) : (
                <NotAvailablePanel
                  title="Correlation Matrix - Loading"
                  message="Correlation data is being computed from historical Yahoo Finance price data. If the matrix does not appear, price data may be temporarily unavailable."
                />
              )}
            </>
          )}

          {/* Heatmap Tab */}
          {mainTab === 'heatmap' && data && (
            <div className="space-y-4">
              {hasNoPrices ? (
                <NotAvailablePanel
                  title="Not Available"
                  message="Real-time price data is currently unavailable. The heatmap requires live price data from Yahoo Finance."
                />
              ) : (
                <>
                  <Heatmap prices={data.prices} />
                  <MiniHeatmap prices={data.prices} />
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">All Commodities</h3>
                    <PriceTable prices={data.prices} onRowClick={handlePriceCardClick} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MiniSummary({ prices }: { prices: { symbol: string; price: number; changePercent: number; decimals: number }[] }) {
  const key = [
    { sym: 'CL', label: 'WTI' },
    { sym: 'GC', label: 'Gold' },
    { sym: 'SI', label: 'Silver' },
    { sym: 'NG', label: 'NatGas' },
  ];
  return (
    <div className="hidden md:flex items-center gap-4 text-xs font-mono">
      {key.map(k => {
        const p = prices.find(x => x.symbol === k.sym);
        if (!p) return null;
        const isPos = p.changePercent >= 0;
        return (
          <div key={k.sym} className="flex items-center gap-1.5">
            <span className="text-slate-500">{k.label}</span>
            <span className="text-white">{p.price.toLocaleString(undefined, { minimumFractionDigits: Math.min(p.decimals, 2), maximumFractionDigits: Math.min(p.decimals, 2) })}</span>
            <span className={isPos ? 'text-emerald-400' : 'text-red-400'}>
              {isPos ? '+' : ''}{p.changePercent.toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
