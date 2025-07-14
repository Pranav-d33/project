import React, { useState } from 'react';
import { 
  CalendarIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  CloudIcon,
  MegaphoneIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

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

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface FilterGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isExpanded: boolean;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFiltersChange,
  isCollapsed,
  onToggleCollapse
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    time: true,
    context: true,
    factors: true,
    insights: false
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      startDate: '',
      endDate: '',
      sku: '',
      store: '',
      weather: false,
      promotions: false,
      socialTrends: false,
      anomalies: false,
      highUncertainty: false,
      biggestSwings: false,
      aiOverrides: false,
    });
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'startDate' || key === 'endDate') return value !== '';
      if (key === 'sku' || key === 'store') return value !== '';
      return value === true;
    }).length;
  };

  const FilterChip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-rex-blue text-white text-xs rounded-full">
      <span>{label}</span>
      <button onClick={onRemove} className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5">
        <XMarkIcon className="w-3 h-3" />
      </button>
    </div>
  );

  const FilterGroup: React.FC<{ 
    id: string; 
    title: string; 
    icon: React.ComponentType<{ className?: string }>; 
    children: React.ReactNode 
  }> = ({ id, title, icon: Icon, children }) => {
    const isExpanded = expandedGroups[id];
    
    return (
      <div className="border-b border-rex-bg-800 last:border-b-0">
        <button
          onClick={() => toggleGroup(id)}
          className="w-full flex items-center justify-between p-4 hover:bg-rex-bg-700 transition-colors duration-rex-fast"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-rex-blue" />
            {!isCollapsed && <span className="rex-text-body font-medium">{title}</span>}
          </div>
          {!isCollapsed && (
            <ChevronRightIcon 
              className={`w-4 h-4 text-rex-grey transition-transform duration-rex-fast ${
                isExpanded ? 'rotate-90' : ''
              }`} 
            />
          )}
        </button>
        
        {isExpanded && !isCollapsed && (
          <div className="px-4 pb-4 space-y-3 animate-slide-up">
            {children}
          </div>
        )}
      </div>
    );
  };

  const ToggleFilter: React.FC<{ 
    label: string; 
    checked: boolean; 
    onChange: (checked: boolean) => void;
    description?: string;
  }> = ({ label, checked, onChange, description }) => (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`
          w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-rex-fast
          ${checked 
            ? 'bg-rex-blue border-rex-blue' 
            : 'border-rex-grey group-hover:border-rex-blue'
          }
        `}>
          {checked && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      <div className="flex-1">
        <div className="rex-text-body">{label}</div>
        {description && (
          <div className="rex-text-caption mt-1">{description}</div>
        )}
      </div>
    </label>
  );

  return (
    <div className={`
      bg-rex-bg-800 border-r border-rex-bg-700 flex flex-col transition-all duration-rex-normal
      ${isCollapsed ? 'w-18' : 'w-64'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-rex-bg-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="rex-text-h3">Filters</h2>
              {getActiveFilterCount() > 0 && (
                <p className="rex-text-caption mt-1">
                  {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-rex-bg-700 transition-colors duration-rex-fast"
            title={isCollapsed ? 'Expand filters' : 'Collapse filters'}
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-rex-grey" />
          </button>
        </div>

        {/* Active Filters */}
        {!isCollapsed && getActiveFilterCount() > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="rex-text-caption">Active Filters</span>
              <button
                onClick={clearAllFilters}
                className="rex-text-caption text-rex-blue hover:text-rex-white transition-colors duration-rex-fast"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.weather && <FilterChip label="Weather" onRemove={() => updateFilter('weather', false)} />}
              {filters.promotions && <FilterChip label="Promotions" onRemove={() => updateFilter('promotions', false)} />}
              {filters.socialTrends && <FilterChip label="Social Trends" onRemove={() => updateFilter('socialTrends', false)} />}
              {filters.anomalies && <FilterChip label="Anomalies" onRemove={() => updateFilter('anomalies', false)} />}
              {filters.highUncertainty && <FilterChip label="High Uncertainty" onRemove={() => updateFilter('highUncertainty', false)} />}
              {filters.biggestSwings && <FilterChip label="Biggest Swings" onRemove={() => updateFilter('biggestSwings', false)} />}
              {filters.aiOverrides && <FilterChip label="AI Overrides" onRemove={() => updateFilter('aiOverrides', false)} />}
            </div>
          </div>
        )}
      </div>

      {/* Filter Groups */}
      <div className="flex-1 overflow-y-auto">
        {/* Time Range */}
        <FilterGroup id="time" title="Time Range" icon={CalendarIcon}>
          <div className="space-y-3">
            <div>
              <label className="rex-text-caption block mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => updateFilter('startDate', e.target.value)}
                className="rex-input w-full"
              />
            </div>
            <div>
              <label className="rex-text-caption block mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => updateFilter('endDate', e.target.value)}
                className="rex-input w-full"
              />
            </div>
          </div>
        </FilterGroup>

        {/* Context */}
        <FilterGroup id="context" title="Context" icon={CubeIcon}>
          <div className="space-y-3">
            <div>
              <label className="rex-text-caption block mb-1">SKU</label>
              <input
                type="text"
                value={filters.sku}
                onChange={(e) => updateFilter('sku', e.target.value)}
                placeholder="Enter SKU ID"
                className="rex-input w-full"
              />
            </div>
            <div>
              <label className="rex-text-caption block mb-1">Store</label>
              <input
                type="text"
                value={filters.store}
                onChange={(e) => updateFilter('store', e.target.value)}
                placeholder="Enter Store ID"
                className="rex-input w-full"
              />
            </div>
          </div>
        </FilterGroup>

        {/* External Factors */}
        <FilterGroup id="factors" title="External Factors" icon={CloudIcon}>
          <div className="space-y-3">
            <ToggleFilter
              label="Weather Impact"
              checked={filters.weather}
              onChange={(checked) => updateFilter('weather', checked)}
              description="Show forecasts affected by weather"
            />
            <ToggleFilter
              label="Promotions"
              checked={filters.promotions}
              onChange={(checked) => updateFilter('promotions', checked)}
              description="Include promotional periods"
            />
            <ToggleFilter
              label="Social Trends"
              checked={filters.socialTrends}
              onChange={(checked) => updateFilter('socialTrends', checked)}
              description="Factor in social media trends"
            />
          </div>
        </FilterGroup>

        {/* Insights */}
        <FilterGroup id="insights" title="Insights" icon={TrendingUpIcon}>
          <div className="space-y-3">
            <ToggleFilter
              label="Anomalies"
              checked={filters.anomalies}
              onChange={(checked) => updateFilter('anomalies', checked)}
              description="Highlight unusual patterns"
            />
            <ToggleFilter
              label="High Uncertainty"
              checked={filters.highUncertainty}
              onChange={(checked) => updateFilter('highUncertainty', checked)}
              description="Low confidence predictions"
            />
            <ToggleFilter
              label="Biggest Swings"
              checked={filters.biggestSwings}
              onChange={(checked) => updateFilter('biggestSwings', checked)}
              description="Largest demand changes"
            />
            <ToggleFilter
              label="AI Overrides"
              checked={filters.aiOverrides}
              onChange={(checked) => updateFilter('aiOverrides', checked)}
              description="Manual adjustments made"
            />
          </div>
        </FilterGroup>
      </div>

      {/* Collapse Toggle */}
      {!isCollapsed && (
        <div className="p-4 border-t border-rex-bg-700">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-rex-bg-700 transition-colors duration-rex-fast"
            title="Collapse sidebar"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4 text-rex-grey rotate-180" />
            <span className="rex-text-caption">Collapse</span>
          </button>
        </div>
      )}
    </div>
  );
};
