import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Sources & Information | Commodities Dashboard',
  description: 'Information about the data sources, methodology, and disclaimers for the Commodities Dashboard.',
};

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-[#0b0e14]">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0d1019]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[900px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-lg font-bold text-white tracking-tight">Data Sources & Information</h1>
            </div>
            <Link
              href="/"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-4 py-8 space-y-8">
        {/* Data Delay Notice */}
        <section className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <div>
              <h2 className="text-sm font-semibold text-amber-300 mb-1">Data Delay Notice</h2>
              <p className="text-sm text-amber-200/80 leading-relaxed">
                All market data displayed on this dashboard is delayed by approximately <strong>15 minutes</strong>.
                This is a limitation of the free Yahoo Finance API used as the data source. Real-time (zero-delay)
                data requires a licensed commercial market data feed from exchanges such as CME Group, ICE, or LME,
                which is not included in this dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Primary Data Source */}
        <section className="bg-[#131620] border border-slate-800 rounded-lg p-6">
          <h2 className="text-base font-semibold text-white mb-4">Primary Data Source</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-purple-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-sm font-bold">Y!</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-200">Yahoo Finance API</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Spot prices, open/high/low/close data, volume, and historical sparklines are sourced from
                  the Yahoo Finance chart API. Data is fetched for front-month futures contracts (e.g., CL=F for
                  WTI Crude Oil) with 15-minute interval bars over a 5-day range.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">~15 min delay</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">60s server cache</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">3s client polling</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Commodities Covered */}
        <section className="bg-[#131620] border border-slate-800 rounded-lg p-6">
          <h2 className="text-base font-semibold text-white mb-4">Commodities Covered</h2>
          <div className="space-y-4">
            <CommodityGroup
              title="Energy"
              items={[
                { symbol: 'CL', name: 'WTI Crude Oil', exchange: 'NYMEX', yahoo: 'CL=F' },
                { symbol: 'CO', name: 'Brent Crude Oil', exchange: 'ICE', yahoo: 'BZ=F' },
                { symbol: 'NG', name: 'Natural Gas', exchange: 'NYMEX', yahoo: 'NG=F' },
                { symbol: 'RB', name: 'RBOB Gasoline', exchange: 'NYMEX', yahoo: 'RB=F' },
                { symbol: 'HO', name: 'Heating Oil', exchange: 'NYMEX', yahoo: 'HO=F' },
              ]}
            />
            <CommodityGroup
              title="Precious Metals"
              items={[
                { symbol: 'GC', name: 'Gold', exchange: 'COMEX', yahoo: 'GC=F' },
                { symbol: 'SI', name: 'Silver', exchange: 'COMEX', yahoo: 'SI=F' },
                { symbol: 'PL', name: 'Platinum', exchange: 'NYMEX', yahoo: 'PL=F' },
                { symbol: 'PA', name: 'Palladium', exchange: 'NYMEX', yahoo: 'PA=F' },
              ]}
            />
            <CommodityGroup
              title="Industrial Metals"
              items={[
                { symbol: 'HG', name: 'Copper', exchange: 'COMEX', yahoo: 'HG=F' },
                { symbol: 'AL', name: 'Aluminum', exchange: 'LME', yahoo: 'ALI=F' },
              ]}
            />
            <CommodityGroup
              title="Grains"
              items={[
                { symbol: 'ZC', name: 'Corn', exchange: 'CBOT', yahoo: 'ZC=F' },
                { symbol: 'ZW', name: 'Wheat', exchange: 'CBOT', yahoo: 'ZW=F' },
                { symbol: 'ZS', name: 'Soybeans', exchange: 'CBOT', yahoo: 'ZS=F' },
                { symbol: 'ZM', name: 'Soybean Meal', exchange: 'CBOT', yahoo: 'ZM=F' },
                { symbol: 'ZL', name: 'Soybean Oil', exchange: 'CBOT', yahoo: 'ZL=F' },
              ]}
            />
            <CommodityGroup
              title="Softs"
              items={[
                { symbol: 'KC', name: 'Coffee', exchange: 'ICE', yahoo: 'KC=F' },
                { symbol: 'SB', name: 'Sugar #11', exchange: 'ICE', yahoo: 'SB=F' },
                { symbol: 'CT', name: 'Cotton', exchange: 'ICE', yahoo: 'CT=F' },
                { symbol: 'CC', name: 'Cocoa', exchange: 'ICE', yahoo: 'CC=F' },
              ]}
            />
          </div>
        </section>

        {/* Data Methodology */}
        <section className="bg-[#131620] border border-slate-800 rounded-lg p-6">
          <h2 className="text-base font-semibold text-white mb-4">Data Methodology</h2>
          <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
            <div>
              <h3 className="text-sm font-medium text-slate-200 mb-1">Spot Prices</h3>
              <p>
                Spot prices represent the front-month futures contract price from Yahoo Finance. Only real market
                data is displayed. If the Yahoo Finance API is unavailable, prices will show as &quot;Not Available&quot;
                rather than using any simulated or estimated values.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200 mb-1">Bid / Ask</h3>
              <p>
                Bid and ask prices are shown as &quot;N/A&quot; because the Yahoo Finance API does not provide
                real bid/ask data for futures contracts. Only real exchange data would be accurate for these fields.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200 mb-1">Spreads</h3>
              <p>
                Key inter-commodity spreads (Brent-WTI, crack spreads, gold/silver ratio, soybean crush) are
                calculated directly from the real underlying commodity prices. Spread change values are not
                available as they would require historical spread tracking.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200 mb-1">Futures Curves</h3>
              <p>
                Futures curve data is not available. Displaying real forward curves requires individual contract
                month data from a licensed commercial data feed (e.g., CME Group, ICE).
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200 mb-1">Correlation Matrix</h3>
              <p>
                Correlation data is not available. Computing accurate cross-commodity correlations requires
                historical tick-level or daily close data from a licensed market data provider.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200 mb-1">News & Economic Calendar</h3>
              <p>
                Real-time news and economic calendar data are not available. These features would require
                a licensed news feed (e.g., Reuters, Bloomberg) and economic data provider.
              </p>
            </div>
          </div>
        </section>

        {/* Data Status Indicators */}
        <section className="bg-[#131620] border border-slate-800 rounded-lg p-6">
          <h2 className="text-base font-semibold text-white mb-4">Data Status Indicators</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs text-emerald-400 font-medium">LIVE</span>
              </div>
              <span className="text-sm text-slate-400">
                Fresh data from Yahoo Finance (fetched within the last 60 seconds). Still subject to ~15 min exchange delay.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span className="text-xs text-yellow-400 font-medium">UNAVAILABLE</span>
              </div>
              <span className="text-sm text-slate-400">
                The Yahoo Finance API is unreachable or returned no data. All affected sections display
                &quot;Not Available&quot; until the connection is restored.
              </span>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-red-500/5 border border-red-500/20 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-red-300 mb-2">Disclaimer</h2>
          <p className="text-xs text-red-200/70 leading-relaxed">
            This dashboard is for informational and educational purposes only. It does not constitute financial
            advice, investment recommendations, or a solicitation to buy or sell any commodity, futures contract,
            or financial instrument. All data is provided &quot;as is&quot; with no warranty of accuracy,
            completeness, or timeliness. Market data is delayed and may not reflect current market conditions.
            Always consult a licensed financial professional before making investment decisions. Past performance
            is not indicative of future results.
          </p>
        </section>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <Link
            href="/"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

function CommodityGroup({ title, items }: {
  title: string;
  items: { symbol: string; name: string; exchange: string; yahoo: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500">
              <th className="text-left py-1 pr-4 font-medium">Symbol</th>
              <th className="text-left py-1 pr-4 font-medium">Name</th>
              <th className="text-left py-1 pr-4 font-medium">Exchange</th>
              <th className="text-left py-1 font-medium">Yahoo Symbol</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.symbol} className="border-t border-slate-800/50">
                <td className="py-1.5 pr-4 font-mono text-slate-200">{item.symbol}</td>
                <td className="py-1.5 pr-4 text-slate-300">{item.name}</td>
                <td className="py-1.5 pr-4 text-slate-400">{item.exchange}</td>
                <td className="py-1.5 font-mono text-slate-400">{item.yahoo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
