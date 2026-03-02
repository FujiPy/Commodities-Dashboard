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
                  All market data is sourced from Yahoo Finance. Spot prices use front-month futures contracts
                  (e.g., CL=F for WTI Crude Oil) with 15-minute interval bars over a 5-day range. Futures
                  forward curves are built by querying individual contract months (e.g., CLF26.NYM, CLG26.NYM).
                  Chart history is available in three ranges: 5-day (15-min bars), 1-month (daily bars), and
                  1-year (weekly bars). Macro economic indicators (DXY, Treasury yields, VIX, equity indices,
                  currencies) are also fetched from Yahoo Finance. News headlines include both commodity and
                  macro economic topics.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">~15 min delay</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">15min price cache</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">15min macro cache</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">15min futures cache</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">5-day news cache</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">15min chart cache</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">15min client polling</span>
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
              <h3 className="text-sm font-medium text-slate-200 mb-1">Price Charts (5-Day, 1-Month &amp; 1-Year)</h3>
              <p>
                Clicking any commodity opens a detailed chart modal with three time ranges: 5-day (15-minute interval
                bars), 1-month (daily bars), and 1-year (weekly bars). All ranges use real historical price data from
                Yahoo Finance. The chart color reflects whether the commodity has gained (green) or declined (red) over
                the period. Yearly data is cached for 15 minutes.
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
                Futures forward curves display real prices for upcoming contract months fetched from Yahoo Finance.
                Each commodity&apos;s individual contract months (e.g., CLF26, CLG26, etc.) are queried to build
                the term structure. The curve indicates whether a commodity is in contango (far months priced higher)
                or backwardation (near months priced higher). Open interest data is not available from the free API.
                Futures data is cached for 15 minutes.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200 mb-1">Correlation Matrix</h3>
              <p>
                The correlation matrix is computed from real historical price data. Log returns are calculated from
                5 days of 15-minute close prices for all tracked commodities, and Pearson correlation coefficients
                are computed between every pair. The matrix updates whenever fresh price data is fetched.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200 mb-1">News Feed</h3>
              <p>
                Commodity news headlines are sourced from Yahoo Finance&apos;s search API across multiple query topics
                (energy, metals, agriculture, general commodities, macroeconomic). Headlines are categorized by sector,
                tagged with impact level (high/medium/low) based on keyword analysis, and include direct links to the
                original article when available. News data is cached for 5 days to ensure article persistence and
                reduce API calls.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200 mb-1">Live Macro Indicators</h3>
              <p>
                The News &amp; Macro sub-tab displays live macro economic indicators sourced from Yahoo Finance.
                These include the US Dollar Index (DXY), Treasury yields (5-year, 10-year, 30-year), equity indices
                (S&amp;P 500, Dow Jones), the CBOE Volatility Index (VIX), major currency pairs (EUR/USD, GBP/USD,
                USD/JPY), Bitcoin, and the Gold ETF (GLD). Each indicator shows its current value, absolute change,
                and percentage change. Macro data is cached for 15 minutes.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200 mb-1">Macro News</h3>
              <p>
                In addition to commodity-specific news, the news feed also includes macroeconomic headlines related
                to Federal Reserve policy, inflation data, GDP reports, trade and tariff developments, and central
                bank announcements. These headlines are tagged with a &quot;MACRO&quot; badge and appear alongside
                commodity-specific news in all category tabs.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200 mb-1">Upcoming Data Events</h3>
              <p>
                The News &amp; Macro sub-tab includes a &quot;Upcoming Data Events&quot; panel that displays scheduled
                commodity and macro data releases for the next 14 days. These are generated from a curated list of
                recurring scheduled events relevant to commodity markets. Events include:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-slate-400">
                <li><strong className="text-slate-300">Energy:</strong> EIA Weekly Natural Gas Storage Report, EIA Weekly Petroleum Status Report, API Weekly Crude Oil Stock Report, Baker Hughes Rig Count</li>
                <li><strong className="text-slate-300">Agriculture:</strong> USDA WASDE Report, USDA Crop Production Report, USDA Weekly Export Sales, USDA Weekly Crop Progress, ICO World Coffee Market Report</li>
                <li><strong className="text-slate-300">Cross-commodity:</strong> CFTC Commitments of Traders (COT) Report</li>
                <li><strong className="text-slate-300">Macro:</strong> FOMC Interest Rate Decision, US CPI, US PPI, US Non-Farm Payrolls, US GDP Report, ISM Manufacturing PMI</li>
              </ul>
              <p className="mt-2">
                Events are filtered by the active commodity category tab and include their scheduled release time,
                source agency, impact level, and related commodity symbols.
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
                Fresh data from Yahoo Finance (fetched within the last 15 minutes). Still subject to ~15 min exchange delay.
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
