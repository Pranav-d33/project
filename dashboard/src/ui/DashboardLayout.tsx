import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { FilterSidebar, FilterState } from './FilterSidebar';
import { KPIRibbon } from './KPIRibbon';
import { ForecastChart } from './ForecastChart';
import { NarrativePanel } from './NarrativePanel';
import { CopilotChat } from './CopilotChat';
import { StatusBar } from './StatusBar';
import { AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Default lens when user has not selected filters
export const DEFAULT_DASHBOARD_FILTERS: FilterState = {
  startDate: '2025-07-01',
  endDate: '2025-07-13',
  sku: 'SKU_DEFAULT',
  store: 'STORE_DEFAULT',
  weather: true,
  promotions: true,
  socialTrends: true,
  anomalies: false,
  highUncertainty: false,
  biggestSwings: false,
  aiOverrides: false,
};

export const DashboardLayout: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_DASHBOARD_FILTERS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  
  // State for selected KPI tile and its detail
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [tileDetail, setTileDetail] = useState<{ 
    narrative_explanation: string; 
    top_influencer: string; 
    confidence_score: number; 
    structured_explanation: any;
  } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Default mapping for KPI tiles to context for explanation
  const defaultContextMap: Record<string, { sku_id: string; store_id: string; forecast_date: string }> = {
    accuracy: { sku_id: 'SKU_DEFAULT', store_id: 'STORE_DEFAULT', forecast_date: '2025-07-11' },
    confidence: { sku_id: 'SKU_CONF', store_id: 'STORE_CONF', forecast_date: '2025-07-10' },
    missed: { sku_id: 'SKU_MISSED', store_id: 'STORE_MISSED', forecast_date: '2025-07-09' },
    uptime: { sku_id: 'SKU_AI', store_id: 'STORE_AI', forecast_date: '2025-07-08' },
  };

  // Mock KPI metrics
  const kpiMetrics = [
    {
      id: 'accuracy',
      title: 'Forecast Error',
      value: loadingDetail ? 0 : 12.4,
      unit: '%',
      trend: { direction: 'down' as const, percentage: 2.1, period: '7d' },
      status: 'good' as const,
      icon: ChartBarIcon,
      description: 'Average prediction accuracy'
    },
    {
      id: 'confidence',
      title: 'Model Confidence',
      value: loadingDetail ? 0 : 89.2,
      unit: '%',
      trend: { direction: 'up' as const, percentage: 1.4, period: '7d' },
      status: 'good' as const,
      icon: ShieldCheckIcon,
      description: 'AI model certainty level'
    },
    {
      id: 'missed',
      title: 'Anomalies Flagged',
      value: loadingDetail ? 0 : 23,
      trend: { direction: 'down' as const, percentage: 8.2, period: '7d' },
      status: 'warning' as const,
      icon: ExclamationTriangleIcon,
      description: 'Data points requiring attention'
    },
    {
      id: 'uptime',
      title: 'AI System Uptime',
      value: loadingDetail ? 0 : 99.8,
      unit: '%',
      trend: { direction: 'stable' as const, percentage: 0, period: '30d' },
      status: 'good' as const,
      icon: SparklesIcon,
      description: 'System availability'
    }
  ];

  // Load default forecast detail on mount
  useEffect(() => {
    const loadDefaultExplanation = async () => {
      setLoadingDetail(true);
      try {
        const res = await fetch('/api/dashboard/explain/single', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultContextMap['accuracy']),
        });
        const data = await res.json();
        setTileDetail(data);
        setSelectedTile('accuracy');
      } catch (err) {
        console.error('Default explanation failed', err);
        setTileDetail({
          narrative_explanation: 'Unable to fetch default forecast explanation',
          top_influencer: 'unknown',
          confidence_score: 0,
          structured_explanation: {}
        });
      } finally {
        setLoadingDetail(false);
      }
    };

    loadDefaultExplanation();
  }, []);

  // Handler when clicking a KPI tile
  const handleTileClick = async (tileKey: string) => {
    const ctx = defaultContextMap[tileKey];
    if (!ctx) return;
    
    setSelectedTile(tileKey);
    setTileDetail(null);
    setLoadingDetail(true);
    
    try {
      const res = await fetch('/api/dashboard/explain/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx),
      });
      const data = await res.json();
      setTileDetail(data);
    } catch (err) {
      console.error('Error loading explanation', err);
      setTileDetail({ 
        narrative_explanation: 'Failed to explain KPI tile', 
        top_influencer: 'unknown', 
        confidence_score: 0,
        structured_explanation: {}
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApplyUnits = (units: number) => {
    console.log(`Applying ${units} units adjustment`);
    // Implement the logic to apply units
  };

  const handleFlagData = () => {
    console.log('Flagging data for review');
    // Implement the logic to flag data
  };

  return (
    <div className="min-h-screen bg-rex-bg-900 flex flex-col">
      {/* Navigation */}
      <Navigation 
        theme={theme} 
        onThemeToggle={toggleTheme}
        onSearch={(query) => console.log('Search:', query)}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <FilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <main className={`flex-1 p-6 transition-all duration-rex-normal ${
          sidebarCollapsed ? 'ml-18' : 'ml-64'
        } ${chatExpanded ? 'mr-96' : 'mr-0'}`}>
          {/* KPI Ribbon */}
          <KPIRibbon
            metrics={kpiMetrics}
            onTileClick={handleTileClick}
            selectedTile={selectedTile}
            loading={loadingDetail}
          />

          {/* Chart Section */}
          <div className="mb-8">
            <ForecastChart 
              loading={false}
              onWhatIfChange={(params) => console.log('What-if params:', params)}
            />
          </div>

          {/* Narrative Panel */}
          <NarrativePanel
            explanation={tileDetail}
            loading={loadingDetail}
            onApplyUnits={handleApplyUnits}
            onFlagData={handleFlagData}
            expanded={true}
          />
        </main>

        {/* Copilot Chat */}
        <AnimatePresence>
          <CopilotChat
            filters={filters}
            isExpanded={chatExpanded}
            onToggleExpanded={() => setChatExpanded(!chatExpanded)}
          />
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

