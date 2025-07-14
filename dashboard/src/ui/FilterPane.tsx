import React from 'react';

export interface FilterState {
  startDate: string;
  endDate: string;
  sku: string;
  store: string;
  weather: boolean;
  promotions: boolean;
  socialTrends: boolean;
  anomalies: boolean;
  highUncertainty: boolean;
  biggestSwings: boolean;
  aiOverrides: boolean;
}

interface FilterPaneProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const FilterPane: React.FC<FilterPaneProps> = ({ filters, setFilters }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleButtonToggle = (name: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg mb-2">Filters</h2>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs mb-1 text-gray-700 dark:text-gray-300">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleInputChange}
            className="w-full rounded border px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs mb-1 text-gray-700 dark:text-gray-300">End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleInputChange}
            className="w-full rounded border px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs mb-1 text-gray-700 dark:text-gray-300">SKU</label>
        <input
          type="text"
          name="sku"
          value={filters.sku}
          onChange={handleInputChange}
          placeholder="Search SKU..."
          className="w-full rounded border px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>
      <div>
        <label className="block text-xs mb-1 text-gray-700 dark:text-gray-300">Store/Location</label>
        <input
          type="text"
          name="store"
          value={filters.store}
          onChange={handleInputChange}
          placeholder="Search store..."
          className="w-full rounded border px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="weather"
            checked={filters.weather}
            onChange={handleInputChange}
            className="mr-2"
          />{' '}
          Weather
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="promotions"
            checked={filters.promotions}
            onChange={handleInputChange}
            className="mr-2"
          />{' '}
          Promotions
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="socialTrends"
            checked={filters.socialTrends}
            onChange={handleInputChange}
            className="mr-2"
          />{' '}
          Social Trends
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="anomalies"
            checked={filters.anomalies}
            onChange={handleInputChange}
            className="mr-2"
          />{' '}
          Anomalies
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleButtonToggle('highUncertainty')}
          className={`px-2 py-1 rounded text-xs ${
            filters.highUncertainty ? 'bg-primary text-white' : 'bg-surface border'
          }`}
        >
          High Uncertainty
        </button>
        <button
          onClick={() => handleButtonToggle('biggestSwings')}
          className={`px-2 py-1 rounded text-xs ${
            filters.biggestSwings ? 'bg-accent text-white' : 'bg-surface border'
          }`}
        >
          Biggest Swings
        </button>
        <button
          onClick={() => handleButtonToggle('aiOverrides')}
          className={`px-2 py-1 rounded text-xs ${
            filters.aiOverrides ? 'bg-surface border' : 'bg-surface border'
          }`}
        >
          AI Overrides Only
        </button>
      </div>
    </div>
  );
};
