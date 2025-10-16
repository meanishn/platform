/**
 * CostEstimateCard Component
 * 
 * Displays cost estimate for a service request.
 * Shows total cost, hourly rate breakdown, and selected tier.
 * Follows design system for consistent styling.
 */

import React from 'react';
import { DollarSign, Info } from 'lucide-react';

export interface CostEstimateCardProps {
  totalCost: number;
  hours: number;
  hourlyRate: number;
  tierName: string;
  className?: string;
}

export const CostEstimateCard: React.FC<CostEstimateCardProps> = ({
  totalCost,
  hours,
  hourlyRate,
  tierName,
  className = '',
}) => {
  return (
    <div className={`bg-slate-50 p-6 rounded-xl border-2 border-slate-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg text-slate-900 mb-2 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-slate-600" />
            Cost Estimate
          </h3>
          <div className="text-3xl font-bold text-slate-900 mb-2">
            ${totalCost.toFixed(2)}
          </div>
          <p className="text-slate-700">
            {hours.toFixed(1)} hours × ${hourlyRate.toFixed(2)}/hour
          </p>
          <p className="text-sm text-slate-600 mt-3 flex items-center gap-1">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Final cost may vary based on actual work required</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Selected Tier</div>
          <div className="font-semibold text-slate-700">{tierName}</div>
        </div>
      </div>
    </div>
  );
};

