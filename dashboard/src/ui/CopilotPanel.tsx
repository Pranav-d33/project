import React, { useState, useEffect } from 'react';
import { FilterState } from './FilterPane';

interface CopilotResponse {
  answer: string;
  chart_highlight?: {
    date?: string;
    sku?: string;
    store?: string;
  };
  action?: {
    type: string;
    params: Record<string, any>;
  };
}

export const CopilotPanel: React.FC<{ 
  filters: FilterState;
  onAction?: (action: { type: string; params: Record<string, any> }) => void;
}> = ({ filters, onAction }) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<CopilotResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Sample suggestions based on current filters
  const suggestions = [
    `Why did demand spike on ${filters.endDate} for ${filters.sku}?`,
    `Compare promotion vs. weather for ${filters.store}`,
    'Summarize top drivers this week',
    'Which stores underperformed last week?'
  ];

  const submit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters }),
      });
      const data = await res.json();
      setAnswer(data);
      
      // Trigger action if provided
      if (data.action && onAction) {
        onAction(data.action);
      }
    } catch (err) {
      console.error('Copilot error', err);
      setAnswer({
        answer: 'Sorry, I encountered an error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-all duration-200"
        >
          🤖
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 rounded-lg shadow-xl bg-white border border-gray-200 z-50 max-h-96 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg flex justify-between items-center">
        <span>🤖 Forecast Copilot</span>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-white hover:text-gray-200 text-lg"
        >
          ✕
        </button>
      </div>

      {/* Suggestions */}
      {!answer && !loading && (
        <div className="p-3 border-b bg-gray-50">
          <div className="text-xs text-gray-600 mb-2">Try asking:</div>
          <div className="space-y-1">
            {suggestions.slice(0, 2).map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded"
              >
                → {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Answer Display */}
      <div className="flex-1 p-3 text-sm text-gray-700 overflow-y-auto">
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            <span>Thinking...</span>
          </div>
        ) : answer ? (
          <div className="space-y-3">
            <div className="bg-gray-50 p-2 rounded">
              {answer.answer}
            </div>
            {answer.chart_highlight && (
              <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                💡 Check chart for: {answer.chart_highlight.date} | {answer.chart_highlight.sku} | {answer.chart_highlight.store}
              </div>
            )}
            {answer.action && (
              <button
                onClick={() => onAction?.(answer.action!)}
                className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200"
              >
                → {answer.action.type.replace('_', ' ')}
              </button>
            )}
          </div>
        ) : (
          <div className="text-gray-500">Ask anything about demand, influencers, or anomalies...</div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-gray-50">
        <div className="flex gap-2">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={2}
            className="flex-1 border rounded px-2 py-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ask about your forecast..."
            disabled={loading}
          />
          <button
            onClick={submit}
            disabled={loading || !query.trim()}
            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
};