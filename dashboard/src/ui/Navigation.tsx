import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon as SearchIcon, 
  ChevronDownIcon, 
  Bars3Icon as MenuIcon, 
  SunIcon, 
  MoonIcon 
} from '@heroicons/react/24/outline';

interface NavigationProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onSearch?: (query: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  theme, 
  onThemeToggle, 
  onSearch 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '2025-07-01',
    end: '2025-07-13'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <nav className="h-18 bg-rex-bg-900 border-b border-rex-bg-800 px-6 flex items-center justify-between relative z-50">
      {/* Left Section - Logo & Brand */}
      <div className="flex items-center space-x-4">
        {/* Crown Logo */}
        <div className="relative group">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg 
              viewBox="0 0 24 24" 
              className="w-8 h-8 text-rex-blue transition-all duration-300 group-hover:drop-shadow-rex-glow"
              fill="currentColor"
            >
              <path d="M5 16L3 21h18l-2-5H5zm2.18-2H7l-1.5-3L12 8l6.5 3L17 14h-.18c-.69 1.16-1.97 2-3.82 2s-3.13-.84-3.82-2zM12 6c-.83 0-1.5-.67-1.5-1.5S11.17 3 12 3s1.5.67 1.5 1.5S12.83 6 12 6z"/>
            </svg>
          </div>
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 w-8 h-8 bg-rex-blue rounded-full opacity-0 group-hover:opacity-20 group-hover:animate-glow-pulse transition-opacity duration-1000"></div>
        </div>
        
        {/* Brand Text */}
        <div className="flex items-center space-x-2">
          <h1 className="rex-text-h2">SorsAI</h1>
          <ChevronDownIcon className="w-4 h-4 text-rex-grey" />
        </div>
      </div>

      {/* Center Section - Date Range Picker */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full bg-rex-bg-800 rounded-rex px-4 py-2 flex items-center justify-between text-rex-white hover:bg-opacity-80 transition-all duration-rex-fast"
          >
            <span className="rex-text-body">
              {dateRange.start} — {dateRange.end}
            </span>
            <ChevronDownIcon className="w-4 h-4 text-rex-grey" />
          </button>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-rex-bg-800 rounded-rex shadow-rex-card border border-rex-bg-700 p-4 z-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="rex-text-caption block mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="rex-input w-full"
                  />
                </div>
                <div>
                  <label className="rex-text-caption block mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="rex-input w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="rex-btn-ghost px-3 py-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="rex-btn-primary px-3 py-1"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Search & User */}
      <div className="flex items-center space-x-4">
        {/* Global Search */}
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-rex-grey" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forecasts, SKUs..."
              className="w-80 pl-10 pr-4 py-2 bg-rex-bg-800 border border-rex-bg-800 rounded-rex text-rex-white placeholder-rex-grey focus:border-rex-blue focus:ring-2 focus:ring-rex-blue-soft focus:outline-none transition-all duration-rex-fast"
            />
          </div>
        </form>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-lg bg-rex-bg-800 hover:bg-rex-bg-700 transition-colors duration-rex-fast"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <SunIcon className="w-5 h-5 text-rex-grey hover:text-rex-white" />
          ) : (
            <MoonIcon className="w-5 h-5 text-rex-grey hover:text-rex-white" />
          )}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-rex-bg-800 transition-colors duration-rex-fast">
            <div className="w-8 h-8 bg-rex-blue rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
            <span className="rex-text-body hidden md:block">User</span>
            <ChevronDownIcon className="w-4 h-4 text-rex-grey" />
          </button>
        </div>
      </div>
    </nav>
  );
};
