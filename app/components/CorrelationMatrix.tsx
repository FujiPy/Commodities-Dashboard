'use client';
import React from 'react';

interface CorrelationMatrixProps {
  symbols: string[];
  names: string[];
  matrix: number[][];
}

function getCorrelationColor(value: number): string {
  if (value >= 0.8) return 'bg-emerald-500';
  if (value >= 0.6) return 'bg-emerald-600/80';
  if (value >= 0.4) return 'bg-emerald-700/60';
  if (value >= 0.2) return 'bg-emerald-800/40';
  if (value >= 0) return 'bg-slate-700/40';
  if (value >= -0.2) return 'bg-red-900/30';
  if (value >= -0.4) return 'bg-red-800/50';
  if (value >= -0.6) return 'bg-red-700/60';
  return 'bg-red-600/80';
}

function getCorrelationTextColor(value: number): string {
  if (Math.abs(value) >= 0.6) return 'text-white';
  return 'text-slate-300';
}

export function CorrelationMatrix({ symbols, names, matrix }: CorrelationMatrixProps) {
  const [hoveredCell, setHoveredCell] = React.useState<{ row: number; col: number } | null>(null);

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300">Correlation Matrix</h3>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-600/80"></div>
            <span>-1.0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-slate-700/40"></div>
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span>+1.0</span>
          </div>
        </div>
      </div>

      {hoveredCell && (
        <div className="mb-3 p-2 bg-slate-900/50 rounded text-xs text-slate-300 font-mono">
          {names[hoveredCell.row]} / {names[hoveredCell.col]}: <span className="text-white font-semibold">{matrix[hoveredCell.row][hoveredCell.col].toFixed(3)}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="text-xs border-collapse" style={{ minWidth: symbols.length * 36 + 60 }}>
          <thead>
            <tr>
              <th className="sticky left-0 bg-slate-900/90 z-10 px-1 py-1"></th>
              {symbols.map((s, i) => (
                <th
                  key={s}
                  className="px-0.5 py-1 font-mono text-slate-400 font-normal"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', height: 60, fontSize: 9 }}
                  title={names[i]}
                >
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {symbols.map((rowSym, i) => (
              <tr key={rowSym}>
                <td className="sticky left-0 bg-slate-900/90 z-10 px-1 py-0.5 font-mono text-slate-400 text-right pr-2" title={names[i]} style={{ fontSize: 9 }}>
                  {rowSym}
                </td>
                {matrix[i].map((val, j) => (
                  <td
                    key={j}
                    className={`px-0 py-0 text-center cursor-pointer transition-all duration-150 ${getCorrelationColor(val)} ${getCorrelationTextColor(val)} ${hoveredCell?.row === i || hoveredCell?.col === j ? 'opacity-100' : 'opacity-85'}`}
                    style={{ width: 32, height: 28, fontSize: 8, lineHeight: '28px' }}
                    onMouseEnter={() => setHoveredCell({ row: i, col: j })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {val.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
