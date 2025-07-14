import React from 'react';

export const MetricTiles: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
    {/* Example Tile: Forecast Accuracy */}
    <div className="bg-glass rounded-xl shadow-lg p-4 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer">
      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Forecast Accuracy</span>
      <span className="text-3xl font-bold text-primary">92%</span>
      <span className="text-xs text-green-500 mt-1">+2% WoW</span>
    </div>
    {/* Example Tile: Confidence Score */}
    <div className="bg-glass rounded-xl shadow-lg p-4 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer">
      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Confidence Score</span>
      <span className="text-3xl font-bold text-accent">0.84</span>
      <span className="text-xs text-blue-500 mt-1">Stable</span>
    </div>
    {/* Example Tile: Missed SKUs */}
    <div className="bg-glass rounded-xl shadow-lg p-4 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer">
      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Missed SKUs</span>
      <span className="text-3xl font-bold text-red-400">12</span>
      <span className="text-xs text-red-500 mt-1">-3 vs last week</span>
    </div>
    {/* Example Tile: Top Influencer */}
    <div className="bg-glass rounded-xl shadow-lg p-4 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer">
      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Top Influencer</span>
      <span className="text-lg font-semibold text-primary">Weather</span>
      <span className="text-xs text-gray-400 mt-1">40% of cases</span>
    </div>
  </div>
);
