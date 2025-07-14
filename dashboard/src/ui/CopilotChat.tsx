import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  SparklesIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  BeakerIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useExplain } from '../hooks/useExplain';
import { FilterState } from './FilterSidebar';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    sources?: string[];
    actionSuggestions?: Array<{
      type: 'approve' | 'simulate' | 'explain';
      label: string;
      action: () => void;
    }>;
  };
}

interface CopilotChatProps {
  filters: FilterState;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onSendMessage?: (message: string) => Promise<string>;
  initialMessages?: ChatMessage[];
}

export const CopilotChat: React.FC<CopilotChatProps> = ({
  filters,
  isExpanded,
  onToggleExpanded,
  onSendMessage,
  initialMessages = []
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const explain = useExplain();

  // Sample initial conversation
  useEffect(() => {
    if (messages.length === 0) {
      const sampleMessages: ChatMessage[] = [
        {
          id: '1',
          type: 'assistant',
          content: "Hello! I'm SorsAI, your forecast analysis assistant. I can help explain predictions, run what-if scenarios, and provide insights. What would you like to explore?",
          timestamp: new Date(Date.now() - 120000),
        },
        {
          id: '2',
          type: 'user',
          content: "Why is the forecast showing increased demand for SKU_DEFAULT next week?",
          timestamp: new Date(Date.now() - 60000),
        },
        {
          id: '3',
          type: 'assistant',
          content: "Based on my analysis, the 15% demand increase is primarily driven by weather patterns and seasonal trends. Clear skies are forecasted, which typically increases foot traffic for outdoor products by 12-18%.",
          timestamp: new Date(Date.now() - 30000),
          metadata: {
            confidence: 0.87,
            sources: ['Weather API', 'Historical Patterns', 'Google Trends'],
            actionSuggestions: [
              { type: 'approve', label: 'Approve', action: () => console.log('Approved') },
              { type: 'simulate', label: 'Simulate', action: () => console.log('Simulate') },
              { type: 'explain', label: 'Why?', action: () => console.log('Explain') }
            ]
          }
        }
      ];
      setMessages(sampleMessages);
    }
  }, [messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [messages, isLoading]);

  // Scroll to bottom when chat is expanded
  useEffect(() => {
    if (isExpanded && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end' 
        });
        // Focus input when expanded
        inputRef.current?.focus();
      }, 100);
    }
  }, [isExpanded]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Expand chat if collapsed
    if (!isExpanded) {
      onToggleExpanded();
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      // Use the existing explain hook or fallback
      const response = await new Promise<string>((resolve, reject) => {
        explain.mutate(
          { question: currentInput, context: JSON.stringify(filters) },
          {
            onSuccess: (data) => {
              resolve(data.explanation || data.message || "I understand your question. Let me analyze the data for you.");
            },
            onError: (error) => {
              reject(error);
            }
          }
        );
      }).catch(async () => {
        return onSendMessage ? 
          await onSendMessage(currentInput) : 
          "I understand your question. Let me analyze the forecast data and provide you with insights based on current trends and patterns.";
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: {
          confidence: 0.82,
          sources: ['Forecast Model', 'Real-time Data'],
          actionSuggestions: [
            { type: 'approve', label: 'Approve', action: () => console.log('Approved') },
            { type: 'simulate', label: 'Simulate', action: () => console.log('Simulate') }
          ]
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      setInputValue(prev => prev + '\n');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const toggleDetails = (messageId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Collapsed view - floating crown icon
  if (!isExpanded) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={onToggleExpanded}
          className="w-14 h-14 bg-rex-blue rounded-full shadow-rex-card hover:shadow-rex-glow transition-all duration-rex-normal flex items-center justify-center group"
        >
          <SparklesIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-rex-fast" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-rex-gold rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">AI</span>
          </div>
        </button>
      </motion.div>
    );
  }

  // Expanded view
  return (
    <motion.div
      initial={{ x: 360 }}
      animate={{ x: 0 }}
      exit={{ x: 360 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-18 right-0 bottom-0 w-96 bg-rex-bg-800 border-l border-rex-bg-700 flex flex-col z-40 shadow-2xl"
    >
      {/* Header */}
      <div className="p-4 border-b border-rex-bg-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-rex-blue rounded-full flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rex-gold rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">AI</span>
            </div>
          </div>
          <div>
            <h3 className="rex-text-body font-semibold">Ask SorsAI</h3>
            <p className="rex-text-caption text-rex-grey">Forecast Assistant</p>
          </div>
        </div>
        <button
          onClick={onToggleExpanded}
          className="p-2 rounded-lg hover:bg-rex-bg-700 transition-colors duration-rex-fast"
        >
          <ChevronRightIcon className="w-5 h-5 text-rex-grey" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" 
        style={{ 
          maxHeight: 'calc(100vh - 200px)',
          scrollBehavior: 'smooth'
        }}
      >
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[80%] rounded-rex p-3 animate-slide-up shadow-sm
              ${message.type === 'user' 
                ? 'bg-rex-blue text-white shadow-rex-blue shadow-opacity-20' 
                : 'bg-rex-blue-soft text-rex-white border border-rex-blue border-opacity-30'
              }
            `}>
              <div className={`rex-text-body whitespace-pre-wrap ${message.type === 'user' ? 'text-white' : 'text-rex-white'}`}>
                {message.content}
              </div>
              
              {/* Metadata for assistant messages */}
              {message.type === 'assistant' && message.metadata && (
                <div className="mt-3 space-y-2">
                  {/* Quick Actions */}
                  {message.metadata.actionSuggestions && (
                    <div className="flex gap-2 flex-wrap">
                      {message.metadata.actionSuggestions.map((action, index) => (
                        <button
                          key={index}
                          onClick={action.action}
                          className={`
                            px-2 py-1 rounded-full text-xs font-medium transition-all duration-rex-fast
                            ${action.type === 'approve' ? 'bg-rex-gold text-white hover:bg-opacity-80' :
                              action.type === 'simulate' ? 'bg-rex-blue text-white hover:bg-opacity-80' :
                              'bg-rex-bg-800 text-rex-grey hover:text-rex-white'}
                          `}
                        >
                          {action.type === 'approve' && <CheckIcon className="w-3 h-3 inline mr-1" />}
                          {action.type === 'simulate' && <BeakerIcon className="w-3 h-3 inline mr-1" />}
                          {action.type === 'explain' && <QuestionMarkCircleIcon className="w-3 h-3 inline mr-1" />}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Details Toggle */}
                  <button
                    onClick={() => toggleDetails(message.id)}
                    className="flex items-center gap-1 rex-text-caption text-rex-blue hover:text-rex-white transition-colors duration-rex-fast"
                  >
                    <ClipboardDocumentIcon className="w-3 h-3" />
                    <span>View Details</span>
                  </button>

                  {/* Expandable Details */}
                  <AnimatePresence>
                    {showDetails[message.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-2 bg-rex-bg-900 rounded border border-rex-bg-700">
                          {message.metadata.confidence && (
                            <div className="flex justify-between items-center mb-2">
                              <span className="rex-text-caption">Confidence:</span>
                              <span className="rex-text-caption font-medium">
                                {(message.metadata.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                          {message.metadata.sources && (
                            <div>
                              <span className="rex-text-caption block mb-1">Sources:</span>
                              <div className="flex flex-wrap gap-1">
                                {message.metadata.sources.map((source, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1 py-0.5 bg-rex-bg-800 rounded text-xs text-rex-grey"
                                  >
                                    {source}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="rex-text-caption text-rex-grey opacity-75 mt-2">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-rex-blue-soft border border-rex-blue border-opacity-30 rounded-rex p-3">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-rex-blue rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-rex-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-rex-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="rex-text-caption text-rex-grey">SorsAI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-rex-bg-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about forecasts, trends, or insights..."
            className="flex-1 px-3 py-2 bg-rex-bg-900 border border-rex-bg-700 rounded-lg text-rex-white placeholder-rex-grey focus:border-rex-blue focus:outline-none focus:ring-2 focus:ring-rex-blue-soft transition-all duration-rex-fast"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-rex-blue rounded-lg hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-rex-fast"
          >
            <PaperAirplaneIcon className="w-5 h-5 text-white" />
          </button>
        </form>
        <p className="rex-text-caption text-rex-grey mt-2">
          Press <kbd className="px-1 py-0.5 bg-rex-bg-700 rounded text-xs">Ctrl+Enter</kbd> for new line, <kbd className="px-1 py-0.5 bg-rex-bg-700 rounded text-xs">Enter</kbd> to send
        </p>
      </div>
    </motion.div>
  );
};
