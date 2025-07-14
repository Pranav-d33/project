import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

interface ChartDataPoint {
  date: string;
  actual?: number;
  predicted: number;
  upperBound?: number;
  lowerBound?: number;
  confidence?: number;
}

interface WhatIfSliders {
  weatherSeverity: number;
  promotionDiscount: number;
  socialSentiment: number;
}

interface ForecastChartProps {
  data?: ChartDataPoint[];
  loading?: boolean;
  showConfidenceInterval?: boolean;
  onWhatIfChange?: (params: WhatIfSliders) => void;
}

type TabType = 'actual-vs-predicted' | 'forecast-range' | 'what-if';

export const ForecastChart: React.FC<ForecastChartProps> = ({
  data = [],
  loading = false,
  showConfidenceInterval = true,
  onWhatIfChange
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('actual-vs-predicted');
  const [whatIfParams, setWhatIfParams] = useState<WhatIfSliders>({
    weatherSeverity: 1,
    promotionDiscount: 0,
    socialSentiment: 0
  });

  // Sample data when none provided
  const sampleData: ChartDataPoint[] = useMemo(() => [
    { date: '2025-07-01', actual: 245, predicted: 240, upperBound: 260, lowerBound: 220, confidence: 0.85 },
    { date: '2025-07-02', actual: 252, predicted: 248, upperBound: 268, lowerBound: 228, confidence: 0.82 },
    { date: '2025-07-03', actual: 238, predicted: 245, upperBound: 265, lowerBound: 225, confidence: 0.88 },
    { date: '2025-07-04', actual: 267, predicted: 262, upperBound: 282, lowerBound: 242, confidence: 0.79 },
    { date: '2025-07-05', actual: 258, predicted: 255, upperBound: 275, lowerBound: 235, confidence: 0.84 },
    { date: '2025-07-06', actual: 241, predicted: 250, upperBound: 270, lowerBound: 230, confidence: 0.86 },
    { date: '2025-07-07', actual: undefined, predicted: 265, upperBound: 285, lowerBound: 245, confidence: 0.81 },
    { date: '2025-07-08', actual: undefined, predicted: 272, upperBound: 292, lowerBound: 252, confidence: 0.78 },
    { date: '2025-07-09', actual: undefined, predicted: 268, upperBound: 288, lowerBound: 248, confidence: 0.83 },
    { date: '2025-07-10', actual: undefined, predicted: 275, upperBound: 295, lowerBound: 255, confidence: 0.80 },
  ], []);

  const chartData = data.length > 0 ? data : sampleData;

  const handleWhatIfChange = (param: keyof WhatIfSliders, value: number) => {
    const newParams = { ...whatIfParams, [param]: value };
    setWhatIfParams(newParams);
    onWhatIfChange?.(newParams);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rex-bg-800 border border-rex-bg-700 rounded-rex p-4 shadow-rex-card"
        >
          <div className="rex-text-body font-medium mb-2">{label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 rex-text-caption">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="capitalize">{entry.dataKey}:</span>
              <span className="font-medium">{entry.value?.toLocaleString()}</span>
            </div>
          ))}
          {payload[0]?.payload?.confidence && (
            <div className="mt-2 pt-2 border-t border-rex-bg-700">
              <div className="rex-text-caption text-rex-grey">
                Confidence: {(payload[0].payload.confidence * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </motion.div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    return (
      <motion.circle
        cx={cx}
        cy={cy}
        r={4}
        fill="var(--rex-blue)"
        stroke="white"
        strokeWidth={2}
        whileHover={{ scale: 1.2 }}
        transition={{ duration: 0.15 }}
      />
    );
  };

  const tabs = [
    { id: 'actual-vs-predicted', label: 'Actual vs Predicted' },
    { id: 'forecast-range', label: 'Forecast Range' },
    { id: 'what-if', label: 'What-If Analysis' }
  ];

  const SliderControl: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    onChange: (value: number) => void;
  }> = ({ label, value, min, max, step, unit = '', onChange }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="rex-text-caption font-medium">{label}</label>
        <span className="rex-text-caption text-rex-blue">
          {value}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-rex-bg-800 rounded-rex appearance-none cursor-pointer rex-slider"
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="rex-card p-6 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="rex-skeleton h-6 w-48 rounded"></div>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="rex-skeleton h-8 w-20 rounded"></div>
            ))}
          </div>
        </div>
        <div className="rex-skeleton h-80 w-full rounded"></div>
      </div>
    );
  }

  return (
    <div className="rex-card p-6 animate-fade-in">
      {/* Chart Header with Tabs */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="rex-text-h2">Demand Forecast</h2>
        <div className="flex bg-rex-bg-900 rounded-rex p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                px-4 py-2 rounded-lg transition-all duration-rex-fast rex-text-caption font-medium
                ${activeTab === tab.id 
                  ? 'bg-rex-blue text-white shadow-sm' 
                  : 'text-rex-grey hover:text-rex-white hover:bg-rex-bg-800'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* What-If Controls */}
      {activeTab === 'what-if' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-rex-bg-900 rounded-rex border border-rex-bg-700"
        >
          <h3 className="rex-text-body font-medium mb-4 text-rex-blue">Scenario Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SliderControl
              label="Weather Severity"
              value={whatIfParams.weatherSeverity}
              min={0}
              max={3}
              step={1}
              onChange={(value) => handleWhatIfChange('weatherSeverity', value)}
            />
            <SliderControl
              label="Promotion Discount"
              value={whatIfParams.promotionDiscount}
              min={0}
              max={50}
              step={5}
              unit="%"
              onChange={(value) => handleWhatIfChange('promotionDiscount', value)}
            />
            <SliderControl
              label="Social Sentiment"
              value={whatIfParams.socialSentiment}
              min={-1}
              max={1}
              step={0.1}
              onChange={(value) => handleWhatIfChange('socialSentiment', value)}
            />
          </div>
        </motion.div>
      )}

      {/* Chart Container */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--rex-bg-800)" 
              opacity={0.3} 
            />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--rex-grey)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--rex-grey)', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Confidence Interval */}
            {(activeTab === 'forecast-range' || showConfidenceInterval) && (
              <>
                <Line
                  type="monotone"
                  dataKey="upperBound"
                  stroke="var(--rex-blue)"
                  strokeWidth={1}
                  strokeOpacity={0.3}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="var(--rex-blue)"
                  strokeWidth={1}
                  strokeOpacity={0.3}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </>
            )}
            
            {/* Predicted Line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="var(--rex-blue)"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
            />
            
            {/* Actual Line */}
            {activeTab === 'actual-vs-predicted' && (
              <Line
                type="monotone"
                dataKey="actual"
                stroke="var(--rex-white)"
                strokeWidth={3}
                strokeDasharray="4 4"
                dot={<CustomDot />}
                connectNulls={false}
              />
            )}
            
            {/* Today Reference Line */}
            <ReferenceLine 
              x="2025-07-07" 
              stroke="var(--rex-gold)" 
              strokeWidth={2}
              strokeOpacity={0.6}
              label={{ value: "Today", position: "top", fill: "var(--rex-gold)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-rex-blue"></div>
          <span className="rex-text-caption">Predicted</span>
        </div>
        {activeTab === 'actual-vs-predicted' && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-rex-white" style={{ 
              backgroundImage: 'repeating-linear-gradient(to right, var(--rex-white) 0, var(--rex-white) 4px, transparent 4px, transparent 8px)' 
            }}></div>
            <span className="rex-text-caption">Actual</span>
          </div>
        )}
        {(activeTab === 'forecast-range' || showConfidenceInterval) && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-rex-blue opacity-30" style={{ 
              backgroundImage: 'repeating-linear-gradient(to right, var(--rex-blue) 0, var(--rex-blue) 4px, transparent 4px, transparent 8px)' 
            }}></div>
            <span className="rex-text-caption">Confidence Range</span>
          </div>
        )}
      </div>
    </div>
  );
};
