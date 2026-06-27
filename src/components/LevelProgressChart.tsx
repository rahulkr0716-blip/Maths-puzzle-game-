/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface StarProgressPoint {
  level: string;
  stars: number;
}

interface LevelProgressChartProps {
  history: StarProgressPoint[];
  currentLevel: number;
}

export default function LevelProgressChart({ history, currentLevel }: LevelProgressChartProps) {
  // Ensure we have data points for the levels.
  // If history is empty, let's construct some initial preview points.
  const chartData = Array.from({ length: 10 }, (_, i) => {
    const lvlNum = i + 1;
    const historyItem = history.find((h) => h.level === `Lvl ${lvlNum}`);
    
    return {
      name: `L${lvlNum}`,
      // Only show stars for levels that have been reached/completed
      stars: historyItem ? historyItem.stars : lvlNum <= currentLevel ? 0 : null,
    };
  });

  // Calculate some stats for the child-friendly footer
  const totalStars = history.length > 0 ? history[history.length - 1].stars : 0;

  return (
    <div id="level-progress-chart-container" className="bg-amber-50/90 rounded-2xl p-3 border-2 border-amber-200/60 shadow-inner space-y-2 text-left">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-wider">
          Star Journey 📈
        </span>
        <span className="text-[10px] font-black text-amber-700 bg-white px-2 py-0.5 rounded-full border border-amber-100">
          {totalStars} ⭐ Collected
        </span>
      </div>

      <div className="w-full h-32 relative select-none">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="starGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(217, 119, 6, 0.1)"
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#78350f', fontSize: 9, fontWeight: 800 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fill: '#78350f', fontSize: 9, fontWeight: 800 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  if (data.stars === null) return null;
                  return (
                    <div className="bg-amber-950 text-white text-[10px] font-black px-2 py-1 rounded-lg border border-amber-700 shadow-md">
                      Level {data.name.replace('L', '')}: {data.stars} ⭐
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="stars"
              stroke="#d97706"
              strokeWidth={3}
              dot={{ fill: '#fbbf24', stroke: '#78350f', strokeWidth: 1.5, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#f59e0b' }}
              connectNulls={true}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[9px] font-bold text-amber-900/60 text-center italic">
        Watch your star count soar level by level! 🚀
      </div>
    </div>
  );
}
