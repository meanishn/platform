/**
 * TabFilter Component
 * A reusable tab navigation component with badge counts
 * Used for filtering views (e.g., Ongoing vs Upcoming jobs)
 */

import React from 'react';

export interface TabOption {
  id: string;
  label: string;
  count?: number;
  badge?: string; // Optional badge text (e.g., "Next: 1", "Active: 1")
}

interface TabFilterProps {
  options: TabOption[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const TabFilter: React.FC<TabFilterProps> = ({
  options,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex gap-1 ${className}`}>
      {options.map((option) => {
        const isActive = activeTab === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`
              relative px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${isActive 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span>
              {option.label}
              {option.count !== undefined && ` (${option.count})`}
            </span>
            
            {/* Badge for alternate view count */}
            {option.badge && !isActive && (
              <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                {option.badge}
              </span>
            )}
            
            {/* Active indicator underline */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t"></span>
            )}
          </button>
        );
      })}
    </div>
  );
};
