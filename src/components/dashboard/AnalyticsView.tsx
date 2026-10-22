'use client';

import React, { useState } from 'react';
import { ChevronLeft, Calendar, Leaf, ChevronRight, PieChart } from 'lucide-react';
import { formatBDT } from '@/lib/utils';
import { PaymentTransaction, DashboardMetrics } from '@/types/fintech';

export interface AnalyticsViewProps {
  onBack: () => void;
  transactions: PaymentTransaction[];
  metrics: DashboardMetrics;
}

export function AnalyticsView({ onBack, transactions, metrics }: AnalyticsViewProps) {
  const [activeSegment, setActiveSegment] = useState<'spending' | 'income'>('spending');

  // Compute real totals from transactions
  const totalSpent = transactions
    .filter((tx) => tx.category !== 'Income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalIncome = transactions
    .filter((tx) => tx.category === 'Income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const currentDisplayAmount = activeSegment === 'spending' ? totalSpent : totalIncome;

  // Compute category breakdown from real transactions
  const categoryMap = new Map<string, number>();
  transactions.forEach((tx) => {
    if (activeSegment === 'spending' && tx.category !== 'Income') {
      categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.amount);
    } else if (activeSegment === 'income' && tx.category === 'Income') {
      categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.amount);
    }
  });

  const categoryColors: Record<string, string> = {
    Shopping: '#0B2C1F',
    'Food & Drinks': '#10B981',
    Transport: '#F59E0B',
    'Bills & Utilities': '#047857',
    Subscription: '#6EE7B7',
    Business: '#3B82F6',
    Income: '#10B981',
    Other: '#A7F3D0',
  };

  const categoryList = Array.from(categoryMap.entries()).map(([name, amt]) => ({
    name,
    amount: amt,
    percent: currentDisplayAmount > 0 ? Math.round((amt / currentDisplayAmount) * 100) : 0,
    color: categoryColors[name] || '#64748B',
  }));

  return (
    <div className="flex flex-col min-h-full bg-[#F5F7F3] pb-24">
      {/* Header */}
      <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to dashboard"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E2EAE3] text-[#112117] flex items-center justify-center active:scale-95 transition-all shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-[#112117] tracking-tight">
          Financial Analytics
        </h1>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E2EAE3] text-[#112117] flex items-center justify-center shadow-sm">
          <Calendar className="w-4 h-4 text-[#43574B]" />
        </div>
      </div>

      {/* Segmented Control Pills */}
      <div className="px-4 sm:px-5 mt-2">
        <div className="flex items-center gap-1.5 p-1 bg-[#E7EFE9] rounded-2xl">
          {(['spending', 'income'] as const).map((seg) => (
            <button
              type="button"
              key={seg}
              onClick={() => setActiveSegment(seg)}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl capitalize transition-all duration-150 ${
                activeSegment === seg
                  ? 'bg-[#0B2C1F] text-white shadow-sm'
                  : 'text-[#5E7166] hover:text-[#112117]'
              }`}
            >
              {seg === 'spending' ? 'Total Outflow' : 'Total Inflow'}
            </button>
          ))}
        </div>
      </div>

      {/* Donut Chart Presentation */}
      <div className="px-4 sm:px-5 mt-4">
        <div className="bg-white rounded-[24px] sm:rounded-[26px] p-4 sm:p-5 border border-[#E4EBE5] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs sm:text-sm font-bold text-[#112117]">
              {activeSegment === 'spending' ? 'Expense Distribution' : 'Inflow Distribution'}
            </h2>
            <span className="text-[11px] font-semibold text-[#5E7166] bg-[#F2F6F3] px-2 py-0.5 rounded-lg border border-[#E2EAE3]">
              Live DB
            </span>
          </div>

          {/* Donut Graphic */}
          <div className="relative flex items-center justify-center py-4">
            <svg className="w-40 h-40 sm:w-44 sm:h-44 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#E7EFE9"
                strokeWidth="10"
                fill="transparent"
              />
              {currentDisplayAmount > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#0B2C1F"
                  strokeWidth="10"
                  strokeDasharray="238.76"
                  strokeDashoffset="60"
                  strokeLinecap="round"
                  fill="transparent"
                />
              )}
            </svg>

            {/* Inner Center Metrics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <span className="text-xl sm:text-2xl font-extrabold text-[#112117] tracking-tight truncate max-w-full">
                ৳{formatBDT(currentDisplayAmount, false)}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-[#73877A] mt-0.5">
                {activeSegment === 'spending' ? 'Total Outflow' : 'Total Inflow'}
              </span>
            </div>
          </div>

          {/* Category Breakdown Grid */}
          {categoryList.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3 pt-3 border-t border-[#EDF2EE]">
              {categoryList.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-[#516458] font-medium truncate">{c.name}</span>
                  </div>
                  <span className="font-bold text-[#112117] ml-1 shrink-0">{c.percent}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-2 text-xs text-[#7B8F83]">
              No transactions recorded in this category yet.
            </div>
          )}
        </div>
      </div>

      {/* Live Balance Summary Card */}
      <div className="px-4 sm:px-5 mt-4">
        <div className="bg-[#EAF3EC] rounded-2xl p-4 border border-[#D5E5D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D2E7D7] flex items-center justify-center text-[#0B2C1F] shrink-0">
              <Leaf className="w-5 h-5 text-[#059669]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0B2C1F]">
                Verified Balance: ৳{formatBDT(metrics.totalConfirmedBDT, false)}
              </div>
              <div className="text-[11px] text-[#476150] mt-0.5">
                {metrics.confirmedCount} verified receipts in Supabase
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
