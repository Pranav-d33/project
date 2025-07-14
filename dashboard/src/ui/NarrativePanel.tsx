import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudIcon,
  TagIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

interface ForecastExplanation {
  narrative_explanation: string;
  top_influencer: string;
  structured_explanation: {
    primary_factor: {
      impact: string;
      reasoning: string;
    };
    secondary_factors: Array<{
      factor: string;
      impact: string;
    }>;
  };
  confidence_score: number;
}

interface NarrativePanelProps {
  explanation?: ForecastExplanation | null;
  loading?: boolean;
  onApplyUnits?: (units: number) => void;
  onFlagData?: () => void;
  expanded?: boolean;
}

const getInfluencerConfig = (influencer: string) => {
  const configs: Record<string, { icon: any; color: string; bgColor: string; emoji: string }> = {
    weather: { 
      icon: CloudIcon, 
      color: 'text-rex-blue', 
      bgColor: 'bg-rex-blue-soft', 
      emoji: '🌧️' 
    },
    promotion: { 
      icon: TagIcon, 
      color: 'text-rex-gold', 
      bgColor: 'bg-orange-500 bg-opacity-15', 
      emoji: '🏷️' 
    },
    social_trend: { 
      icon: TrendingUpIcon, 
      color: 'text-rex-blue', 
      bgColor: 'bg-rex-blue-soft', 
      emoji: '📱' 
    },
    anomaly: { 
      icon: ExclamationTriangleIcon, 
      color: 'text-rex-error', 
      bgColor: 'bg-red-500 bg-opacity-15', 
      emoji: '⚠️' 
    },
    holiday: { 
      icon: CheckCircleIcon, 
      color: 'text-rex-gold', 
      bgColor: 'bg-orange-500 bg-opacity-15', 
      emoji: '🎉' 
    },
    default: { 
      icon: TrendingUpIcon, 
      color: 'text-rex-grey', 
      bgColor: 'bg-rex-bg-800', 
      emoji: '📊' 
    }
  };
  
  return configs[influencer] || configs.default;
};

export const NarrativePanel: React.FC<NarrativePanelProps> = ({
  explanation,
  loading = false,
  onApplyUnits,
  onFlagData,
  expanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [suggestedUnits, setSuggestedUnits] = useState(150);

  // Sample explanation for when none is provided
  const defaultExplanation: ForecastExplanation = {
    narrative_explanation: "Forecast shows increased demand due to approaching weekend and favorable weather conditions. The 15% uptick aligns with historical seasonal patterns for this SKU category.",
    top_influencer: "weather",
    structured_explanation: {
      primary_factor: {
        impact: "15% increase",
        reasoning: "Clear weather expected to drive higher foot traffic and outdoor product demand"
      },
      secondary_factors: [
        { factor: "Weekend Effect", impact: "8% increase in typical weekend shopping patterns" },
        { factor: "Social Media Buzz", impact: "3% boost from trending product mentions" },
        { factor: "Competitive Pricing", impact: "2% advantage over nearby competitors" }
      ]
    },
    confidence_score: 0.85
  };

  const displayExplanation = explanation || defaultExplanation;
  const influencerConfig = getInfluencerConfig(displayExplanation.top_influencer);

  const SkeletonPanel = () => (
    <div className="rex-card p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="rex-skeleton w-12 h-12 rounded-full"></div>
          <div className="flex-1">
            <div className="rex-skeleton h-6 w-32 rounded mb-2"></div>
            <div className="rex-skeleton h-4 w-full rounded mb-1"></div>
            <div className="rex-skeleton h-4 w-3/4 rounded"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="rex-skeleton h-9 w-24 rounded"></div>
          <div className="rex-skeleton h-9 w-20 rounded"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonPanel />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rex-card p-6"
    >
      {/* Main Content */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Influencer Icon */}
          <div className={`
            flex items-center justify-center w-12 h-12 rounded-full ${influencerConfig.bgColor}
          `}>
            <span className="text-2xl">{influencerConfig.emoji}</span>
          </div>

          {/* Narrative Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="rex-text-h3">Forecast Insight</h3>
              <div className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${influencerConfig.color} ${influencerConfig.bgColor}
              `}>
                <influencerConfig.icon className="w-3 h-3 mr-1" />
                {displayExplanation.top_influencer.replace('_', ' ')}
              </div>
              <div className="flex items-center gap-1 text-rex-grey">
                <div className={`
                  w-2 h-2 rounded-full
                  ${displayExplanation.confidence_score > 0.8 ? 'bg-rex-gold' : 
                    displayExplanation.confidence_score > 0.6 ? 'bg-rex-blue' : 'bg-rex-error'}
                `}></div>
                <span className="rex-text-caption">
                  {(displayExplanation.confidence_score * 100).toFixed(0)}% confidence
                </span>
              </div>
            </div>

            <p className="rex-text-body-lg text-rex-white leading-relaxed mb-4">
              {displayExplanation.narrative_explanation}
            </p>

            {/* Expandable Details */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 rex-text-caption text-rex-blue hover:text-rex-white transition-colors duration-rex-fast"
            >
              <span>View detailed breakdown</span>
              {isExpanded ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onApplyUnits?.(suggestedUnits)}
            className="rex-btn-primary flex items-center gap-2"
          >
            <PlayIcon className="w-4 h-4" />
            Apply +{suggestedUnits}
          </button>
          <button
            onClick={onFlagData}
            className="rex-btn-ghost flex items-center gap-2"
          >
            <FlagIcon className="w-4 h-4" />
            Flag Data
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-rex-bg-700 pt-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Primary Factor */}
              <div>
                <h4 className="rex-text-body font-semibold mb-3 text-rex-blue">Primary Factor</h4>
                <div className="bg-rex-bg-900 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="rex-text-body font-medium capitalize">
                      {displayExplanation.top_influencer.replace('_', ' ')}
                    </span>
                    <span className="rex-text-body font-bold text-rex-gold">
                      {displayExplanation.structured_explanation.primary_factor.impact}
                    </span>
                  </div>
                  <p className="rex-text-caption text-rex-grey">
                    {displayExplanation.structured_explanation.primary_factor.reasoning}
                  </p>
                </div>
              </div>

              {/* Secondary Factors */}
              <div>
                <h4 className="rex-text-body font-semibold mb-3 text-rex-blue">Contributing Factors</h4>
                <div className="space-y-3">
                  {displayExplanation.structured_explanation.secondary_factors?.map((factor, index) => (
                    <div key={index} className="bg-rex-bg-900 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="rex-text-caption font-medium">{factor.factor}</span>
                        <span className="rex-text-caption text-rex-grey">{factor.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Adjustment Controls */}
            <div className="mt-6 p-4 bg-rex-bg-900 rounded-lg">
              <h4 className="rex-text-body font-semibold mb-3 text-rex-blue">Quick Adjustments</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="rex-text-caption">Suggested units:</label>
                  <input
                    type="number"
                    value={suggestedUnits}
                    onChange={(e) => setSuggestedUnits(Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-rex-bg-800 border border-rex-bg-700 rounded text-rex-white text-sm focus:border-rex-blue focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => onApplyUnits?.(suggestedUnits)}
                  className="rex-btn-primary text-sm px-3 py-1"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
