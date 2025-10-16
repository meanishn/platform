/**
 * TierSelectionCard Component
 * 
 * Reusable card for selecting a service tier.
 * Displays pricing, features, and tier badge with color coding.
 * Follows design system for consistent styling.
 */

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ServiceTierDto } from '../../types/api';

export interface TierSelectionCardProps {
  tier: ServiceTierDto;
  isSelected: boolean;
  tierIndex: number;
  onSelect: (tierId: string) => void;
}

// Tier color schemes following design system
const tierColorSchemes = [
  { 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200', 
    accent: 'border-l-emerald-400', 
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
    icon: 'text-emerald-600' 
  },
  { 
    bg: 'bg-slate-50', 
    border: 'border-slate-200', 
    accent: 'border-l-slate-400', 
    badge: 'bg-slate-100 text-slate-800 border-slate-200', 
    icon: 'text-slate-600' 
  },
  { 
    bg: 'bg-amber-50', 
    border: 'border-amber-200', 
    accent: 'border-l-amber-400', 
    badge: 'bg-amber-100 text-amber-800 border-amber-200', 
    icon: 'text-amber-600' 
  }
];

// Feature lists by tier level
const tierFeatures = [
  // Basic tier features
  [
    'Standard service',
    'Basic tools & equipment',
  ],
  // Standard tier features
  [
    'Experienced professionals',
    'Advanced tools',
    'Faster service',
  ],
  // Premium tier features
  [
    'Top-tier experts',
    'Premium equipment',
    'Priority service',
    'Extended warranty',
  ],
];

export const TierSelectionCard: React.FC<TierSelectionCardProps> = ({
  tier,
  isSelected,
  tierIndex,
  onSelect,
}) => {
  const colors = tierColorSchemes[tierIndex % 3];
  const features = tierFeatures[tierIndex % 3] || [];

  return (
    <button
      type="button"
      onClick={() => onSelect(tier.id.toString())}
      className={`
        relative p-6 rounded-xl border-2 transition-all text-left overflow-hidden
        hover:shadow-lg border-l-4 flex flex-col h-full
        ${isSelected 
          ? `border-slate-700 ${colors.bg} shadow-lg ${colors.accent}` 
          : `${colors.border} bg-white hover:border-slate-400 ${colors.accent}`
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        <div className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border mb-3 self-start ${colors.badge}`}>
          {tier.name}
        </div>
        
        <div className="mb-4">
          <div className="text-3xl font-bold text-slate-900">
            ${tier.baseHourlyRate}
            <span className="text-lg text-slate-600 font-normal">/hour</span>
          </div>
        </div>
        
        {tier.description && (
          <p className="text-sm text-slate-600 mb-4">{tier.description}</p>
        )}
        
        {/* Features */}
        <div className="space-y-2 text-sm text-slate-700 flex-1">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 ${colors.icon} flex-shrink-0`} />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
};

