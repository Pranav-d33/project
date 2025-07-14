import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ServiceStatus {
  googleTrends: 'connected' | 'degraded' | 'offline';
  newsAPI: 'connected' | 'degraded' | 'offline';
  geminiAI: 'connected' | 'degraded' | 'offline';
}

interface StatusBarProps {
  lastUpdated?: Date;
  version?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  lastUpdated = new Date(),
  version = 'v2.1.0'
}) => {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    googleTrends: 'connected',
    newsAPI: 'connected',
    geminiAI: 'connected'
  });

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 120) return '1 hour ago';
    return `${Math.floor(diffMins / 60)} hours ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="w-3 h-3 text-rex-success" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="w-3 h-3 text-rex-warning" />;
      case 'offline':
        return <XCircleIcon className="w-3 h-3 text-rex-error" />;
      default:
        return <div className="w-2 h-2 bg-rex-grey rounded-full" />;
    }
  };

  const getStatusDot = (status: string) => {
    const colors = {
      connected: 'bg-rex-success',
      degraded: 'bg-rex-warning',
      offline: 'bg-rex-error'
    };
    return colors[status as keyof typeof colors] || 'bg-rex-grey';
  };

  const getOverallStatus = () => {
    const statuses = Object.values(serviceStatus);
    if (statuses.every(s => s === 'connected')) return 'All systems operational';
    if (statuses.some(s => s === 'offline')) return 'Some services offline';
    if (statuses.some(s => s === 'degraded')) return 'Degraded performance';
    return 'Checking status...';
  };

  const getOverallStatusColor = () => {
    const statuses = Object.values(serviceStatus);
    if (statuses.every(s => s === 'connected')) return 'text-rex-success';
    if (statuses.some(s => s === 'offline')) return 'text-rex-error';
    if (statuses.some(s => s === 'degraded')) return 'text-rex-warning';
    return 'text-rex-grey';
  };

  // Simulate status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update service status for demo
      if (Math.random() > 0.95) {
        const services = ['googleTrends', 'newsAPI', 'geminiAI'] as const;
        const randomService = services[Math.floor(Math.random() * services.length)];
        const statuses = ['connected', 'degraded', 'offline'] as const;
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        setServiceStatus(prev => ({
          ...prev,
          [randomService]: randomStatus
        }));
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-8 bg-rex-bg-900 border-t border-rex-bg-800 flex items-center justify-between px-6 text-xs text-rex-grey">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusDot('connected')}`} />
          <span>Data refreshed {formatLastUpdated(lastUpdated)}</span>
        </div>
        
        {/* Service Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" title="Google Trends API">
            {getStatusIcon(serviceStatus.googleTrends)}
            <span className="hidden md:inline">Trends</span>
          </div>
          
          <div className="flex items-center gap-1" title="News API">
            {getStatusIcon(serviceStatus.newsAPI)}
            <span className="hidden md:inline">News</span>
          </div>
          
          <div className="flex items-center gap-1" title="Gemini AI">
            {getStatusIcon(serviceStatus.geminiAI)}
            <span className="hidden md:inline">AI</span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 ${getOverallStatusColor()}`}>
          <CheckCircleIcon className="w-3 h-3" />
          <span className="hidden sm:inline">{getOverallStatus()}</span>
        </div>
        
        <span className="text-rex-grey">{version}</span>
      </div>
    </div>
  );
};
