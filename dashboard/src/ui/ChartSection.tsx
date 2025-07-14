import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FilterState } from './FilterPane';
import { useChartData } from '../hooks/useChartData';
// import { DashboardDetail } from './DashboardDetail'; (unused)

const defaultChartData = [
  { forecast_date: '2025-07-01', predicted: 4000, actual: 2400 },
  { forecast_date: '2025-07-02', predicted: 3000, actual: 1398 },
  { forecast_date: '2025-07-03', predicted: 2000, actual: 9800 },
  { forecast_date: '2025-07-04', predicted: 2780, actual: 3908 },
  { forecast_date: '2025-07-05', predicted: 1890, actual: 4800 },
  { forecast_date: '2025-07-06', predicted: 2390, actual: 3800 },
  { forecast_date: '2025-07-07', predicted: 3490, actual: 4300 },
];

export const ChartSection: React.FC<{ filters: FilterState }> = ({ filters }) => {
  const { data: chartData, isLoading, error } = useChartData(filters);
  const [selectedForecast, setSelectedForecast] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  // Transform API response { labels: string[], values: number[] } into array of data points
  const formattedData = useMemo(() => {
    if (
      chartData &&
      Array.isArray((chartData as any).labels) &&
      Array.isArray((chartData as any).values)
    ) {
      return (chartData as any).labels.map((date: string, i: number) => ({
        sku_id: filters.sku,
        store_id: filters.store,
        forecast_date: date,
        predicted: (chartData as any).values[i],
        actual: (chartData as any).values[i]
      }));
    }
    return [];
  }, [chartData]);
  // Determine if we should show fallback demo data
  const isFallback = !!error || (chartData && formattedData.length === 0);
  const dataToDisplay = isFallback ? defaultChartData : formattedData;

  // Handler when clicking a chart dot
  const handleDotClick = async (point: any) => {
    setLoadingDetail(true);
    try {
      const res = await fetch('/api/dashboard/explain/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku_id: point.sku_id,
          store_id: point.store_id,
          forecast_date: point.forecast_date
        })
      });
      const data = await res.json();
      setSelectedForecast(data);
    } catch (err) {
      console.error('Failed to load forecast explanation', err);
      setSelectedForecast({
        sku_id: point.sku_id,
        store_id: point.store_id,
        narrative_explanation: 'Error loading explanation.',
        top_influencer: 'N/A',
        confidence_score: null
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
          Demand vs Prediction{' '}
          {isFallback ? (
            <span className="text-gray-500 text-sm">(Demo)</span>
          ) : (
            <span className="text-green-500 text-sm">(Live)</span>
          )}
        </h2>
        {isLoading && (
          <div className="text-center text-blue-500 mb-2">Loading chart data...</div>
        )}
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={dataToDisplay}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload.length > 0) {
                  handleDotClick(e.activePayload[0].payload);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="forecast_date" stroke="gray" />
              <YAxis stroke="gray" />
              <Tooltip
                // Custom tooltip content with an explain button
                content={({ payload, label }) => {
                  if (!payload || !payload.length) return null;
                  const point = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                      <p className="text-xs font-medium"><strong>Date:</strong> {label}</p>
                      <p className="text-xs">Predicted: <span className="font-semibold text-blue-600 dark:text-blue-400">{point.predicted}</span></p>
                      <p className="text-xs">Actual: <span className="font-semibold text-green-600 dark:text-green-400">{point.actual}</span></p>
                      <button
                        onClick={() => handleDotClick(point)}
                        className="mt-2 w-full text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors duration-200 font-medium"
                      >
                        🔍 Explain this Point
                      </button>
                    </div>
                  );
                }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Legend />
              <Line type="monotone" dataKey="predicted" name="Predicted Demand" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="actual" name="Actual Sales" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Forecast Detail Section */}
        <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">Forecast Detail</h3>
          {loadingDetail && (
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading explanation...</div>
          )}
          {!loadingDetail && !selectedForecast && (
            <div className="text-sm text-gray-500 dark:text-gray-400">Click a data point to see AI explanation.</div>
          )}
          {!loadingDetail && selectedForecast && (
            <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
              <div><strong>Narrative:</strong> <span className="text-gray-700 dark:text-gray-300">{selectedForecast.narrative_explanation}</span></div>
              <div><strong>Top Influencer:</strong> <span className="text-blue-600 dark:text-blue-400 font-medium">{selectedForecast.top_influencer}</span></div>
              <div><strong>Confidence:</strong> <span className="text-green-600 dark:text-green-400 font-medium">{selectedForecast.confidence_score != null ? `${Math.round(selectedForecast.confidence_score * 100)}%` : 'N/A'}</span></div>
              {selectedForecast.explanation_type === 'rule_based' && (
                <span className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Fallback</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
