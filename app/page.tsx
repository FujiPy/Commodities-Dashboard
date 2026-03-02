"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Mock data (replace with live API later)
const mockPrices = [
  { time: "09:30", price: 78.2 },
  { time: "10:00", price: 78.9 },
  { time: "10:30", price: 79.4 },
  { time: "11:00", price: 79.1 },
  { time: "11:30", price: 80.0 },
];

const mockCurve = [
  { contract: "Apr", price: 79.8 },
  { contract: "May", price: 80.3 },
  { contract: "Jun", price: 81.1 },
  { contract: "Jul", price: 82.0 },
  { contract: "Aug", price: 82.7 },
];

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-4 border">
      {children}
    </div>
  );
}

function TabButton({ label, value, activeTab, setActiveTab }: { 
  label: string; 
  value: string; 
  activeTab: string; 
  setActiveTab: (value: string) => void 
}) {
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2 rounded-xl font-medium ${
        activeTab === value
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

function PriceChart({ title }: { title: string }) {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockPrices}>
            <XAxis dataKey="time" />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function FuturesCurve({ title }: { title: string }) {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-2">{title} Futures Curve</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockCurve}>
            <XAxis dataKey="contract" />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function SpreadCard() {
  const wti = 80.0;
  const brent = 83.2;
  const spread = (brent - wti).toFixed(2);

  return (
    <Card>
      <h2 className="text-xl font-semibold">WTI–Brent Spread</h2>
      <p className="text-3xl font-bold mt-2">${spread}</p>
      <p className="text-sm text-gray-500">Brent - WTI</p>
    </Card>
  );
}

function NewsFeed() {
  const mockNews = [
    "Oil rises on supply disruption concerns",
    "Natural gas volatility spikes ahead of EIA report",
    "Copper demand outlook improves with China stimulus",
  ];

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-2">Commodities News</h2>
      <ul className="space-y-2">
        {mockNews.map((headline, i) => (
          <li key={i} className="text-sm border-b pb-2">
            {headline}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function CommoditiesDashboard() {
  const [activeTab, setActiveTab] = useState("energy");

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold">Global Commodities Dashboard</h1>

      <div className="flex gap-3">
        <TabButton label="Energy" value="energy" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton label="Metals" value="metals" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton label="Agriculture" value="agriculture" activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {activeTab === "energy" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PriceChart title="WTI Spot Price" />
          <FuturesCurve title="WTI" />
          <PriceChart title="Natural Gas Spot" />
          <SpreadCard />
          <div className="md:col-span-2">
            <NewsFeed />
          </div>
        </div>
      )}

      {activeTab === "metals" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PriceChart title="Gold Spot" />
          <FuturesCurve title="Gold" />
          <PriceChart title="Copper Spot" />
        </div>
      )}

      {activeTab === "agriculture" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PriceChart title="Corn Futures" />
          <FuturesCurve title="Corn" />
          <PriceChart title="Soybeans Futures" />
        </div>
      )}
    </div>
  );
}
