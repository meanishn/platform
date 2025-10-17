/**
 * TabNavigation Component
 * 
 * Horizontal tab navigation with active state styling.
 * Extracted from Profile.tsx following design system.
 * 
 * RESPONSIVE:
 * - Mobile: Scrollable horizontal tabs
 * - Tablet+: Standard horizontal layout with wrapping
 */

import React from 'react';

export interface Tab {
  id: string;
  label: string;
}

export interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="border-b border-slate-200 mb-6 sm:mb-8">
      {/* Mobile: Scrollable tabs */}
      <div className="flex md:hidden overflow-x-auto scrollbar-hide -mx-3 px-3">
        <div className="flex space-x-4 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-2.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-slate-700 text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tablet+: Wrappable tabs */}
      <div className="hidden md:flex flex-wrap gap-2 sm:gap-4 md:gap-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 sm:py-2.5 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-slate-700 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

