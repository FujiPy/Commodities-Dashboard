'use client';

import { useState, useEffect } from 'react';

interface MarketSession {
  name: string;
  city: string;
  timezone: string;
  openHour: number;  // in local time (24h)
  closeHour: number; // in local time (24h)
  flag: string;
}

const MARKETS: MarketSession[] = [
  { name: 'Sydney', city: 'Sydney', timezone: 'Australia/Sydney', openHour: 10, closeHour: 16, flag: '🇦🇺' },
  { name: 'Tokyo', city: 'Tokyo', timezone: 'Asia/Tokyo', openHour: 9, closeHour: 15, flag: '🇯🇵' },
  { name: 'Shanghai', city: 'Shanghai', timezone: 'Asia/Shanghai', openHour: 9, closeHour: 15, flag: '🇨🇳' },
  { name: 'Singapore', city: 'Singapore', timezone: 'Asia/Singapore', openHour: 9, closeHour: 17, flag: '🇸🇬' },
  { name: 'London', city: 'London', timezone: 'Europe/London', openHour: 8, closeHour: 16, flag: '🇬🇧' },
  { name: 'New York', city: 'New York', timezone: 'America/New_York', openHour: 9, closeHour: 17, flag: '🇺🇸' },
  { name: 'Chicago', city: 'Chicago', timezone: 'America/Chicago', openHour: 8, closeHour: 14, flag: '🇺🇸' },
];

function getLocalTime(timezone: string): Date {
  const now = new Date();
  const str = now.toLocaleString('en-US', { timeZone: timezone });
  return new Date(str);
}

function isWeekday(timezone: string): boolean {
  const localTime = getLocalTime(timezone);
  const day = localTime.getDay();
  return day >= 1 && day <= 5;
}

function getMarketStatus(market: MarketSession): { isOpen: boolean; localTime: string; statusText: string } {
  const localTime = getLocalTime(market.timezone);
  const hours = localTime.getHours();
  const minutes = localTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  const openMinutes = market.openHour * 60;
  const closeMinutes = market.closeHour * 60;
  const weekday = isWeekday(market.timezone);

  const isOpen = weekday && currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  const timeStr = localTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  let statusText = 'Closed';
  if (!weekday) {
    statusText = 'Weekend';
  } else if (isOpen) {
    const minsLeft = closeMinutes - currentMinutes;
    if (minsLeft <= 60) {
      statusText = `Closes in ${minsLeft}m`;
    } else {
      statusText = 'Open';
    }
  } else if (currentMinutes < openMinutes) {
    const minsUntilOpen = openMinutes - currentMinutes;
    if (minsUntilOpen <= 60) {
      statusText = `Opens in ${minsUntilOpen}m`;
    } else {
      statusText = 'Pre-Market';
    }
  } else {
    statusText = 'After Hours';
  }

  return { isOpen, localTime: timeStr, statusText };
}

export function WorldMarketClock() {
  const [marketStates, setMarketStates] = useState<
    { market: MarketSession; isOpen: boolean; localTime: string; statusText: string }[]
  >([]);

  useEffect(() => {
    function update() {
      setMarketStates(
        MARKETS.map((market) => ({
          market,
          ...getMarketStatus(market),
        }))
      );
    }
    update();
    const interval = setInterval(update, 60_000); // 1 minute
    return () => clearInterval(interval);
  }, []);

  if (marketStates.length === 0) return null;

  const openCount = marketStates.filter((m) => m.isOpen).length;

  return (
    <div className="bg-[#131620]/80 border border-slate-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">World Markets</span>
          <span className="text-[10px] text-slate-500 font-mono">
            {openCount} of {MARKETS.length} open
          </span>
        </div>
        <span className="text-[10px] text-slate-600 font-mono">
          UTC {new Date().toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false })}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {marketStates.map(({ market, isOpen, localTime, statusText }) => (
          <div
            key={market.name}
            className={`rounded-md px-2.5 py-2 border transition-colors ${
              isOpen
                ? 'bg-emerald-500/8 border-emerald-500/30'
                : 'bg-slate-800/30 border-slate-700/30'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs">{market.flag}</span>
              <span className="text-xs font-medium text-slate-200 truncate">{market.name}</span>
            </div>
            <div className="font-mono text-sm text-white leading-tight">{localTime}</div>
            <div className="flex items-center gap-1 mt-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOpen ? 'bg-emerald-400 live-pulse' : 'bg-slate-600'
                }`}
              ></span>
              <span
                className={`text-[10px] font-medium ${
                  isOpen ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {statusText}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
