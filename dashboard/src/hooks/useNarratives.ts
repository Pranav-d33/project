import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { FilterState } from '../ui/FilterPane';
export interface Story {
  sku_id: string;
  store_id: string;
  forecast_date: string;
  narrative_explanation: string;
  top_influencer: string;
  confidence_score: number;
  structured_explanation: Record<string, any>;
  explanation_type: 'fallback' | 'error' | string;
}
export default function useNarratives(filters: FilterState) {
  const [narratives, setNarratives] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNarratives = async () => {
      setLoading(true);
      try {
        const url = new URL('/api/dashboard/storycards', window.location.origin);
        // Append filters as query parameters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
            url.searchParams.append(key, String(value));
          }
        });
        const res = await fetch(url.toString());
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setNarratives(data);
        } else {
          setNarratives([{ 
            sku_id: 'DEFAULT',
            store_id: 'DEFAULT',
            forecast_date: dayjs().format('YYYY-MM-DD'),
            narrative_explanation: 'No anomalies or spikes detected this week. Forecasts remain stable.',
            top_influencer: 'historical_pattern',
            confidence_score: 0.8,
            structured_explanation: {},
            explanation_type: 'fallback'
          }]);
        }
      } catch (error) {
        console.error('Error loading narratives', error);
        setNarratives([{ 
          sku_id: 'N/A',
          store_id: 'N/A',
          forecast_date: 'N/A',
          narrative_explanation: 'Narrative insights unavailable. Please check back later.',
          top_influencer: 'unknown',
          confidence_score: 0.5,
          structured_explanation: {},
          explanation_type: 'error'
        }]);
      } finally {
        setLoading(false);
      }
    };
    fetchNarratives();
  }, [filters]);

  return { narratives, loading };
}
