import React, { useState, useEffect } from 'react';
import { FilterState } from './FilterPane';

// Card type returned from storycards API
interface Card {
  type: 'anomaly' | 'insight' | 'driver' | 'fallback';
  title: string;
  subtitle: string;
  body: string;
  confidence: number;
  primary_driver: string;
  action?: { label: string; params: Record<string, any> };
}

export const NarrativeStorycards: React.FC<{ filters: FilterState }> = ({ filters }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedForecast, setSelectedForecast] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const url = new URL('/api/dashboard/storycards', window.location.origin);
        url.searchParams.append('start', filters.startDate);
        url.searchParams.append('end', filters.endDate);
        if (filters.sku) url.searchParams.append('sku', filters.sku);
        if (filters.store) url.searchParams.append('store', filters.store);
        ['weather', 'promotions', 'socialTrends', 'anomalies'].forEach((sig) => {
          // @ts-ignore
          if (filters[sig]) url.searchParams.append('signals', sig);
        });
        const res = await fetch(url.toString());
        const data = await res.json();
        setCards(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading storycards', err);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [filters]);

  const handleStorycardClick = async (action: { label: string; params: Record<string, any> }) => {
    console.log('Storycard action clicked:', action);
    setLoadingDetail(true);
    setSelectedForecast(null);
    try {
      console.log('Making API call to /api/dashboard/explain/single');
      const res = await fetch('/api/dashboard/explain/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.params),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const detail = await res.json();
      console.log('API response:', detail);
      setSelectedForecast(detail);
    } catch (err) {
      console.error('Failed to load forecast explanation:', err);
      // Set a fallback explanation
      setSelectedForecast({
        narrative_explanation: 'Failed to load explanation. Please try again.',
        top_influencer: 'Error',
        confidence_score: 0,
        explanation_type: 'error'
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading || cards.length === 0) return null;

  return (
    <div className="mt-4 space-y-3 animate-fade-in px-4">
      {cards.slice(0, 5).map((card, i) => (
        <div
          key={i}
          className={`rounded-lg p-4 shadow border-l-4 ${
            card.type === 'anomaly'
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : card.type === 'driver'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-400 bg-white dark:bg-gray-800'
          }`}
        >
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{card.title}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{card.subtitle}</div>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{card.body}</p>
          {card.action && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Button clicked for card:', card.title);
                handleStorycardClick(card.action!);
              }}
              className="mt-3 px-3 py-1 text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-md transition-colors duration-200 border border-indigo-300 dark:border-indigo-600"
            >
              🔍 {card.action.label}
            </button>
          )}
        </div>
      ))}
      <div className="mt-4">
        {loadingDetail && <div className="text-sm text-gray-500 dark:text-gray-400">Loading explanation...</div>}
        {!loadingDetail && selectedForecast && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm space-y-2 text-sm text-gray-800 dark:text-gray-200">
            <div><strong>Narrative:</strong> <span className="text-gray-700 dark:text-gray-300">{selectedForecast.narrative_explanation}</span></div>
            <div><strong>Top Influencer:</strong> <span className="text-blue-600 dark:text-blue-400 font-medium">{selectedForecast.top_influencer}</span></div>
            <div><strong>Confidence:</strong>{' '}
              <span className="text-green-600 dark:text-green-400 font-medium">
                {selectedForecast.confidence_score != null
                  ? `${Math.round(selectedForecast.confidence_score * 100)}%`
                  : 'N/A'}
              </span>
            </div>
            {selectedForecast.explanation_type === 'rule_based' && (
              <span className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Fallback</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
