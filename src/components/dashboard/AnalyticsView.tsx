'use client';

import React, { useState } from 'react';
import { ChevronLeft, Calendar, Leaf, ChevronRight, PieChart } from 'lucide-react';
import { formatBDT } from '@/lib/utils';

export interface AnalyticsViewProps {
  onBack: () => void;
}

export function AnalyticsView({ onBack }: AnalyticsViewProps) {
  const [activeSegment, setActiveSegment] = useState<'spending' | 'income' | 'savings' | 'goals'>('spending');

  const categories = [
    { name: 'Shopping', percent: 32, color: '#0B2C1F' },
    { name: 'Food & Drinks', percent: 18, color: '#10B981' },
    { name: 'Transport', percent: 14, color: '#F59E0B' },
    { name: 'Entertainment', percent: 12, color: '#6EE7B7' },
    { name: 'Bills & Utilities', percent: 10, color: '#047857' },
    { name: 'Others', percent: 14, color: '#A7F3D0' },
  ];

  const monthlyTrend = [
    { month: 'May', height: 45, amount: 28400 },
    { month: 'Jun', height: 60, amount: 35200 },
    { month: 'Jul', height: 50, amount: 31000 },
    { month: 'Aug', height: 75, amount: 42100, active: true },
    { month: 'Sep', height: 40, amount: 24500 },
    { month: 'Oct', height: 68, amount: 38900 },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#F5F7F3] pb-24">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          aria-label="Back to dashboard"
          className="w-10 h-10 rounded-full bg-white border border-[#E2EAE3] text-[#112117] flex items-center justify-center active:scale-95 transition-all shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-bold text-[#112117] tracking-tight">
          Analytics
        </h1>

        <button
          aria-label="Filter calendar date range"
          className="w-10 h-10 rounded-full bg-white border border-[#E2EAE3] text-[#112117] flex items-center justify-center active:scale-95 transition-all shadow-sm"
        >
          <Calendar className="w-4 h-4 text-[#43574B]" />
        </button>
      </div>

      {/* Segmented Control Pills */}
      <div className="px-5 mt-2">
        <div className="flex items-center gap-1.5 p-1 bg-[#E7EFE9] rounded-2xl">
          {(['spending', 'income', 'savings', 'goals'] as const).map((seg) => (
            <button
              key={seg}
              onClick={() => setActiveSegment(seg)}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl capitalize transition-all duration-200 ${
                activeSegment === seg
                  ? 'bg-[#0B2C1F] text-white shadow-sm'
                  : 'text-[#5E7166] hover:text-[#112117]'
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* Donut Chart Presentation */}
      <div className="px-5 mt-5">
        <div className="bg-white rounded-[26px] p-5 border border-[#E4EBE5] shadow-premium-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#112117]">
              Your Spending
            </h2>
            <div className="text-xs font-semibold text-[#5E7166] bg-[#F2F6F3] px-2.5 py-1 rounded-lg border border-[#E2EAE3]">
              Oct 2026 ▾
            </div>
          </div>

          {/* Donut Graphic */}
          <div className="relative flex items-center justify-center py-4">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#E7EFE9"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Segment 1: Shopping */}
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#0B2C1F"
                strokeWidth="10"
                strokeDasharray="238.76"
                strokeDashoffset="76.4"
                strokeLinecap="round"
                fill="transparent"
              />
              {/* Segment 2: Food */}
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#10B981"
                strokeWidth="10"
                strokeDasharray="238.76"
                strokeDashoffset="150.0"
                fill="transparent"
              />
              {/* Segment 3: Transport */}
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#F59E0B"
                strokeWidth="10"
                strokeDasharray="238.76"
                strokeDashoffset="195.0"
                fill="transparent"
              />
            </svg>

            {/* Inner Center Metrics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-[#112117] tracking-tight">
                ৳42,100
              </span>
              <span className="text-[11px] font-medium text-[#73877A] mt-0.5">
                Total Spent
              </span>
            </div>
          </div>

          {/* Category Breakdown Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-4 pt-4 border-t border-[#EDF2EE]">
            {categories.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-[#516458] font-medium">{c.name}</span>
                </div>
                <span className="font-bold text-[#112117]">{c.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Under Budget Insight Card */}
      <div className="px-5 mt-4">
        <div className="bg-[#EAF3EC] rounded-[22px] p-4 border border-[#D5E5D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D2E7D7] flex items-center justify-center text-[#0B2C1F]">
              <Leaf className="w-5 h-5 text-[#059669]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0B2C1F]">
                You&apos;re 12% under budget!
              </div>
              <div className="text-[11px] text-[#476150] mt-0.5">
                Great job managing spending this month.
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#5F7C6A]" />
        </div>
      </div>

      {/* Spending Trend Bar Chart */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-[26px] p-5 border border-[#E4EBE5] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#112117]">
              Spending Trend
            </h2>
            <span className="text-xs font-medium text-[#73877A]">Last 6 Months</span>
          </div>

          {/* Bar Chart Columns */}
          <div className="flex items-end justify-between h-36 pt-6 px-2">
            {monthlyTrend.map((m) => (
              <div key={m.month} className="flex flex-col items-center gap-2 flex-1">
                {m.active && (
                  <div className="bg-[#0B2C1F] text-white text-[10px] font-bold px-2 py-0.5 rounded-md -mb-1 shadow-sm">
                    ৳42.1k
                  </div>
                )}
                <div
                  className={`w-7 rounded-t-lg transition-all duration-300 ${
                    m.active ? 'bg-[#0B2C1F]' : 'bg-[#D2E1D6] hover:bg-[#B8CDBC]'
                  }`}
                  style={{ height: `${m.height}%` }}
                />
                <span className="text-[10px] font-semibold text-[#73877A]">
                  {m.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
