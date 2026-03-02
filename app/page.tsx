'use client';

import React, { useState, useMemo } from 'react';
import { useCommodityData } from '@/app/hooks/useCommodityData';
import { PriceCard, PriceTable } from '@/app/components/PriceCard';
import { ForwardCurveChart, FuturesTable, VolumeChart } from '@/app/components/Charts';
import { CorrelationMatrix } from '@/app/components/CorrelationMatrix';
import { Heatmap, MiniHeatmap } from '@/app/components/Heatmap';
import { NewsPanel, MacroCalendar, SpreadsPanel } from '@/app/components/Panels';
import { COMMODITIES } from '@/app/lib/commodities';

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

function getNewsFilter(tab: MainTab): string | undefined {
  if (tab === 'energy') return 'energy';
  if (tab === 'metals') return 'metals';
  if (tab === 'agriculture') return 'agriculture';
  return undefined;
}

function getCalendarFilter(tab: MainTab): string | undefined {
  if (tab === 'energy') return 'energy';
  if (tab === 'metals') return 'metals';
  if (tab === 'agriculture') return 'agriculture';
  return undefined;
}

export default function Dashboard() {
  const { data, loading, lastUpdate } = useCommodityData(3000);
  const [mainTab, setMainTab] = useState<MainTab>('energy');
  const [subTab, setSubTab] = useState<SubTab>('prices');
  const [selectedFutures, setSelectedFutures] = useState<string>('CL');

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

  // Update selected futures when tab changes
  React.useEffect(() => {
    const symbols = getCategorySymbols(mainTab);
    if (symbols.length > 0 && !symbols.includes(selectedFutures)) {
      setSelectedFutures(symbols[0]);
    }
  }, [mainTab, selectedFutures]);

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

  return (
    <div className="min-h-screen bg-[#0b0e14]">
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
                    <span className="text-xs text-yellow-400 font-medium">DELAYED</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {data?.prices && <MiniSummary prices={data.prices} />}
              {lastUpdate && (
                <span className="text-xs text-slate-500 font-mono">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
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
        <div className="tab-content-enter">
          {/* Commodity Tab - Spot Prices */}
          {isCommodityTab && subTab === 'prices' && data && (
            <div className="space-y-6">
              {/* Quick Summary */}
              <MiniHeatmap prices={categoryPrices} />

              {/* Price Cards by subcategory */}
              {Array.from(categoryGroups.entries()).map(([group, prices]) => (
                <div key={group}>
                  <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">{group}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {prices.map(p => (
                      <PriceCard key={p.symbol} price={p} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Spreads */}
              <SpreadsPanel spreads={data.spreads.filter(s => {
                if (mainTab === 'energy') return ['Brent-WTI Spread', 'Gasoline Crack', 'Heating Oil Crack', 'WTI M1-M2', 'Brent M1-M2'].includes(s.name);
                if (mainTab === 'metals') return ['Gold/Silver Ratio'].includes(s.name);
                if (mainTab === 'agriculture') return ['Soybean Crush'].includes(s.name);
                return false;
              })} />

              {/* Full Price Table */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Detailed Quotes</h3>
                <PriceTable prices={categoryPrices} />
              </div>
            </div>
          )}

          {/* Commodity Tab - Futures */}
          {isCommodityTab && subTab === 'futures' && data && (
            <div className="space-y-4">
              {/* Futures Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400">Select contract:</span>
                {getCategorySymbols(mainTab).map(sym => {
                  const c = COMMODITIES.find(x => x.symbol === sym);
                  return (
                    <button
                      key={sym}
                      onClick={() => setSelectedFutures(sym)}
                      className={`px-3 py-1.5 text-xs rounded-md font-mono transition-all ${
                        selectedFutures === sym
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {sym} <span className="text-slate-300 font-sans ml-1">{c?.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Forward Curve Chart */}
              {data.futures[selectedFutures] && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ForwardCurveChart
                    data={data.futures[selectedFutures]}
                    symbol={selectedFutures}
                    decimals={COMMODITIES.find(c => c.symbol === selectedFutures)?.decimals ?? 2}
                  />
                  <VolumeChart data={data.futures[selectedFutures]} />
                </div>
              )}

              {/* Futures Table */}
              {data.futures[selectedFutures] && (
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">
                    {selectedFutures} Futures Contracts
                  </h3>
                  <FuturesTable
                    data={data.futures[selectedFutures]}
                    decimals={COMMODITIES.find(c => c.symbol === selectedFutures)?.decimals ?? 2}
                  />
                </div>
              )}

              {/* All Forward Curves for category */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">All Forward Curves</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {getCategorySymbols(mainTab).map(sym => (
                    data.futures[sym] && (
                      <ForwardCurveChart
                        key={sym}
                        data={data.futures[sym]}
                        symbol={sym}
                        decimals={COMMODITIES.find(c => c.symbol === sym)?.decimals ?? 2}
                      />
                    )
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Commodity Tab - News & Macro */}
          {isCommodityTab && subTab === 'news' && data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <NewsPanel news={data.news} filter={getNewsFilter(mainTab)} />
              <MacroCalendar events={data.calendar} filter={getCalendarFilter(mainTab)} />
            </div>
          )}

          {/* Correlations Tab */}
          {mainTab === 'correlations' && data?.correlations && (
            <div className="space-y-4">
              <CorrelationMatrix
                symbols={data.correlations.symbols}
                names={data.correlations.names}
                matrix={data.correlations.matrix}
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Strongest Positive Correlations</h4>
                  <TopCorrelations matrix={data.correlations.matrix} symbols={data.correlations.symbols} names={data.correlations.names} type="positive" />
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Weakest / Negative Correlations</h4>
                  <TopCorrelations matrix={data.correlations.matrix} symbols={data.correlations.symbols} names={data.correlations.names} type="negative" />
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">About</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The correlation matrix shows the statistical relationship between commodity price movements.
                    Values range from -1 (perfectly inversely correlated) to +1 (perfectly correlated).
                    Strong correlations ({'>'}0.7) suggest commodities move together, while weak or negative correlations
                    indicate diversification potential. Energy commodities tend to be highly correlated with each other,
                    while agriculture shows more independence.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Heatmap Tab */}
          {mainTab === 'heatmap' && data?.prices && (
            <div className="space-y-4">
              <Heatmap prices={data.prices} />
              <MiniHeatmap prices={data.prices} />
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-300 mb-3">All Commodities</h3>
                <PriceTable prices={data.prices} />
              </div>
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

function TopCorrelations({
  matrix, symbols, names, type,
}: { matrix: number[][]; symbols: string[]; names: string[]; type: 'positive' | 'negative' }) {
  const pairs: { s1: string; n1: string; s2: string; n2: string; corr: number }[] = [];
  for (let i = 0; i < symbols.length; i++) {
    for (let j = i + 1; j < symbols.length; j++) {
      pairs.push({ s1: symbols[i], n1: names[i], s2: symbols[j], n2: names[j], corr: matrix[i][j] });
    }
  }
  const sorted = type === 'positive'
    ? pairs.sort((a, b) => b.corr - a.corr).slice(0, 10)
    : pairs.sort((a, b) => a.corr - b.corr).slice(0, 10);

  return (
    <div className="space-y-1.5">
      {sorted.map((p, i) => (
        <div key={i} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="font-mono text-slate-300">{p.s1}</span>
            <span className="text-slate-600">/</span>
            <span className="font-mono text-slate-300">{p.s2}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${p.corr >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${Math.abs(p.corr) * 100}%` }}
              ></div>
            </div>
            <span className={`font-mono w-12 text-right ${p.corr >= 0.5 ? 'text-emerald-400' : p.corr >= 0 ? 'text-slate-400' : 'text-red-400'}`}>
              {p.corr.toFixed(3)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
