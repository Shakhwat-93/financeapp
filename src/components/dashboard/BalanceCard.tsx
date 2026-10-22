'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, BarChart3, TrendingUp, Clock, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatBDT } from '@/lib/utils';
import { DashboardMetrics } from '@/types/fintech';

export interface BalanceCardProps {
  metrics: DashboardMetrics;
  onAnalyticsClick?: () => void;
  onPendingClick?: () => void;
}

export function BalanceCard({ metrics, onAnalyticsClick, onPendingClick }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="px-5 pt-1">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0B2C1F] via-[#0E3A2A] to-[#071D14] text-white p-6 shadow-emerald-float border border-[#18533C]/40">
        {/* Subtle ambient lighting effect */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-[#059669]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row of the Card */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 bg-[#124130]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#1C5B44]/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            <span className="text-xs font-medium text-[#C8E0D2] tracking-wide">
              Total Verified Volume
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              aria-label={showBalance ? 'Hide balance' : 'Show balance'}
              className="text-[#96B8A5] hover:text-white transition-colors duration-150 ml-0.5"
            >
              {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={onAnalyticsClick}
            aria-label="View financial analytics"
            className="w-8 h-8 rounded-full bg-[#124130]/80 flex items-center justify-center text-[#A6CDB7] hover:text-white hover:bg-[#19523D] transition-all duration-150 border border-[#1C5B44]/50"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>

        {/* Big Monetary Amount */}
        <div className="relative z-10 mt-5">
          <div className="flex items-baseline gap-1.5 font-bold tracking-tight">
            <span className="text-2xl text-[#82C39C] font-semibold">৳</span>
            {showBalance ? (
              <span className="text-4xl text-white font-extrabold tracking-tight">
                {formatBDT(metrics.totalConfirmedBDT)}
              </span>
            ) : (
              <span className="text-4xl text-white tracking-widest font-mono">
                •••••••••
              </span>
            )}
          </div>

          {/* Metric Subtitle / Disclaimers */}
          <div className="flex items-center gap-2 mt-2">
            <div className="inline-flex items-center gap-1 bg-[#10B981]/20 text-[#34D399] px-2.5 py-0.5 rounded-full text-xs font-medium border border-[#10B981]/30">
              <TrendingUp className="w-3 h-3" />
              <span>+{metrics.percentageChangeVsLastMonth}% vs last month</span>
            </div>
            <span className="text-[11px] text-[#86A896]">
              {metrics.confirmedCount} verified receipts
            </span>
          </div>
        </div>

        {/* Secondary Financial Indicators: Pending Confirmation + Sent & Received */}
        <div className="relative z-10 mt-6 pt-4 border-t border-[#174A37]/80 grid grid-cols-2 gap-3 text-xs">
          {/* Sent & Received Total */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#124130] flex items-center justify-center text-[#34D399] border border-[#1D5E46]/60">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-[#82A392] tracking-wider">
                Total Inflow
              </span>
              <span className="font-semibold text-white">
                ৳{formatBDT(metrics.totalReceivedBDT, false)}
              </span>
            </div>
          </div>

          {/* Pending Confirmation */}
          <button
            onClick={onPendingClick}
            className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
          >
            <div className="w-7 h-7 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center text-[#FBBF24] border border-[#F59E0B]/30">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-[#E9C37A] tracking-wider flex items-center gap-1">
                Pending ({metrics.pendingCount})
              </span>
              <span className="font-semibold text-[#FDE68A]">
                ৳{formatBDT(metrics.pendingConfirmationBDT, false)}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
