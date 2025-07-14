import React from 'react';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';

export const MetricTilesLive: React.FC<{
  start_date: string;
  end_date: string;
  sku?: string;
  store?: string;
  onTileClick?: (tileKey: string) => void;
  activeKey?: string | null;
}> = ({ start_date, end_date, sku, store, onTileClick, activeKey }) => {
  const { data, isLoading, error } = useDashboardMetrics({ start_date, end_date, sku, store });

  if (isLoading) return <div className="p-6 text-gray-500 dark:text-gray-400">Loading metrics...</div>;
  if (error) return <div className="p-6 text-red-500 dark:text-red-400">Error loading metrics</div>;
  if (!data || !Array.isArray(data)) return null;

  // Map the API response to the expected format
  const getColorClass = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-500 dark:text-green-400';
      case 'blue': return 'text-blue-500 dark:text-blue-400';
      case 'red': return 'text-red-500 dark:text-red-400';
      case 'orange': return 'text-orange-500 dark:text-orange-400';
      default: return 'text-primary';
    }
  };

  const getTrendColorClass = (trend: string) => {
    if (trend.startsWith('+')) return 'text-green-500 dark:text-green-400';
    if (trend.startsWith('-')) return 'text-red-500 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      {data.map((metric: any) => (
        <div
          key={metric.key}
          onClick={() => onTileClick && onTileClick(metric.key)}
          className={`bg-glass rounded-xl shadow-lg p-4 flex flex-col items-center cursor-pointer transition-transform hover:scale-105 ${
            activeKey === metric.key ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <span className="text-xs text-gray-600 dark:text-gray-300 font-medium text-center">{metric.title}</span>
          <span className={`text-3xl font-bold ${getColorClass(metric.color)}`}>{metric.value}</span>
          {metric.trend && (
            <span className={`text-xs mt-1 font-medium ${getTrendColorClass(metric.trend)}`}>
              {metric.trend}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
