import React from 'react';
import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface KPIMetric {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };
  status: 'good' | 'warning' | 'error' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface KPIRibbonProps {
  metrics: KPIMetric[];
  onTileClick?: (metricId: string) => void;
  selectedTile?: string | null;
  loading?: boolean;
}

export const KPIRibbon: React.FC<KPIRibbonProps> = ({
  metrics = [],
  onTileClick,
  selectedTile,
  loading = false
}) => {
  const defaultMetrics: KPIMetric[] = [
    {
      id: 'accuracy',
      title: 'Forecast Error',
      value: loading ? 0 : 12.4,
      unit: '%',
      trend: { direction: 'down', percentage: 2.1, period: '7d' },
      status: 'good',
      icon: ChartBarIcon,
      description: 'Average prediction accuracy'
    },
    {
      id: 'coverage',
      title: 'Explain Coverage',
      value: loading ? 0 : 94.2,
      unit: '%',
      trend: { direction: 'up', percentage: 1.8, period: '7d' },
      status: 'good',
      icon: ShieldCheckIcon,
      description: 'SKUs with AI explanations'
    },
    {
      id: 'confidence',
      title: 'Confidence Mean',
      value: loading ? 0 : 0.87,
      unit: '',
      trend: { direction: 'stable', percentage: 0.3, period: '7d' },
      status: 'good',
      icon: SparklesIcon,
      description: 'Average model confidence'
    },
    {
      id: 'uptime',
      title: 'AI Uptime',
      value: loading ? 0 : 99.8,
      unit: '%',
      trend: { direction: 'up', percentage: 0.1, period: '24h' },
      status: 'good',
      icon: ExclamationTriangleIcon,
      description: 'System availability'
    }
  ];

  const metricsToDisplay = metrics.length > 0 ? metrics : defaultMetrics;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-rex-gold';
      case 'warning': return 'text-rex-warning';
      case 'error': return 'text-rex-error';
      default: return 'text-rex-blue';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <ArrowUpIcon className="w-3 h-3" />;
      case 'down': return <ArrowDownIcon className="w-3 h-3" />;
      default: return null;
    }
  };

  const getTrendColor = (direction: string, context: 'error' | 'positive' = 'positive') => {
    if (direction === 'stable') return 'text-rex-grey';
    
    // For error metrics, down is good
    if (context === 'error') {
      return direction === 'down' ? 'text-rex-gold' : 'text-rex-error';
    }
    
    // For positive metrics, up is good
    return direction === 'up' ? 'text-rex-gold' : 'text-rex-error';
  };

  const KPICard: React.FC<{ metric: KPIMetric; isSelected: boolean; onClick: () => void }> = ({ 
    metric, 
    isSelected, 
    onClick 
  }) => (
    <div
      onClick={onClick}
      className={`
        rex-card p-6 cursor-pointer transition-all duration-rex-normal hover:scale-105
        ${isSelected ? 'ring-2 ring-rex-blue shadow-rex-glow' : 'hover:shadow-lg'}
        ${loading ? 'animate-pulse' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-rex-bg-900 ${getStatusColor(metric.status)}`}>
            <metric.icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="rex-text-caption font-medium text-rex-grey">{metric.title}</h3>
            {metric.description && (
              <p className="rex-text-caption text-rex-grey opacity-75 mt-1">{metric.description}</p>
            )}
          </div>
        </div>
        
        {metric.trend && (
          <div className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            ${getTrendColor(metric.trend.direction, metric.id === 'accuracy' ? 'error' : 'positive')}
          `}>
            {getTrendIcon(metric.trend.direction)}
            <span>{metric.trend.percentage}%</span>
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-1">
        {loading ? (
          <div className="rex-skeleton h-8 w-20 rounded"></div>
        ) : (
          <>
            <span className="text-3xl font-bold font-display text-rex-white">
              {typeof metric.value === 'number' ? 
                (metric.value < 1 ? metric.value.toFixed(2) : metric.value.toLocaleString()) : 
                metric.value
              }
            </span>
            {metric.unit && (
              <span className="text-lg font-medium text-rex-grey">{metric.unit}</span>
            )}
          </>
        )}
      </div>
      
      {metric.trend && !loading && (
        <div className="mt-2 rex-text-caption text-rex-grey">
          vs {metric.trend.period} ago
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rex-card p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-rex-bg-900 rounded-lg rex-skeleton"></div>
                <div>
                  <div className="rex-skeleton h-4 w-24 rounded mb-2"></div>
                  <div className="rex-skeleton h-3 w-32 rounded"></div>
                </div>
              </div>
              <div className="rex-skeleton h-6 w-12 rounded-full"></div>
            </div>
            <div className="rex-skeleton h-8 w-20 rounded mb-2"></div>
            <div className="rex-skeleton h-3 w-16 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
      {metricsToDisplay.map((metric) => (
        <KPICard
          key={metric.id}
          metric={metric}
          isSelected={selectedTile === metric.id}
          onClick={() => onTileClick?.(metric.id)}
        />
      ))}
    </div>
  );
};

// Loading skeleton version for initial renders
export const KPIRibbonSkeleton: React.FC = () => (
  <KPIRibbon metrics={[]} loading={true} />
);
