import React from 'react';

interface DashboardDetailProps {
  selectedForecast: any;
}

export function DashboardDetail({ selectedForecast }: DashboardDetailProps) {
  if (!selectedForecast) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm text-gray-700 dark:text-gray-300 animate-fade-in">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">Forecast Detail</h2>
        <p className="mb-1">📈 Start by selecting a data point or tile to view forecast details.</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">👇 Try clicking on a KPI tile or chart dot to get an AI explanation.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm text-gray-700 dark:text-gray-300 animate-fade-in">
      <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">
        Forecast for {selectedForecast.sku_id} @ {selectedForecast.store_id}
      </h2>
      <p className="mb-2">{selectedForecast.narrative_explanation}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Top Influencer: {selectedForecast.top_influencer} · Confidence: {selectedForecast.confidence_score ?? 'N/A'}
      </p>
    </div>
  );
}
