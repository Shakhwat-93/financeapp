'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, BarChart3, TrendingUp, Clock, ArrowDownLeft, ShieldCheck } from 'lucide-react';
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
    <div className="px-4 sm:px-5 pt-1">
      <div className="relative overflow-hidden rounded-[26px] sm:rounded-[28px] bg-gradient-to-br from-[#0B2C1F] via-[#0E3A2A] to-[#071D14] text-white p-5 sm:p-6 shadow-emerald-float border border-[#18533C]/40">
        {/* Subtle ambient lighting effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#059669]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row of the Card */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#124130]/80 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#1C5B44]/50 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium text-[#C8E0D2] tracking-wide truncate">
              Total Verified Volume
            </span>
            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              aria-label={showBalance ? 'Hide balance' : 'Show balance'}
              className="text-[#96B8A5] hover:text-white transition-colors duration-150 ml-0.5 shrink-0"
            >
              {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            type="button"
            onClick={onAnalyticsClick}
            aria-label="View financial analytics"
            className="w-8 h-8 rounded-full bg-[#124130]/80 flex items-center justify-center text-[#A6CDB7] hover:text-white hover:bg-[#19523D] transition-all duration-150 border border-[#1C5B44]/50 shrink-0"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>

        {/* Big Monetary Amount */}
        <div className="relative z-10 mt-4 sm:mt-5">
          <div className="flex items-baseline gap-1 font-bold tracking-tight">
            <span className="text-xl sm:text-2xl text-[#82C39C] font-semibold">৳</span>
            {showBalance ? (
              <span className="text-3xl sm:text-4xl text-white font-extrabold tracking-tight truncate max-w-full">
                {formatBDT(metrics.totalConfirmedBDT)}
              </span>
            ) : (
              <span className="text-2xl sm:text-3xl text-white tracking-widest font-mono">
                •••••••••
              </span>
            )}
          </div>

          {/* Metric Subtitle / Disclaimers */}
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <div className="inline-flex items-center gap-1 bg-[#10B981]/20 text-[#34D399] px-2 py-0.5 rounded-full text-[11px] font-medium border border-[#10B981]/30">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              <span>{metrics.confirmedCount} verified receipts</span>
            </div>
          </div>
        </div>

        {/* Secondary Financial Indicators: Pending Confirmation + Sent & Received */}
        <div className="relative z-10 mt-5 pt-3.5 border-t border-[#174A37]/80 grid grid-cols-2 gap-2 text-xs">
          {/* Sent & Received Total */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#103D2C]/50 border border-[#19523C]/40 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#124130] flex items-center justify-center text-[#34D399] border border-[#1D5E46]/60 shrink-0">
              <ArrowDownLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] uppercase font-semibold text-[#82A392] tracking-wider truncate">
                Total Inflow
              </span>
              <span className="font-semibold text-white text-[11px] sm:text-xs truncate">
                ৳{formatBDT(metrics.totalReceivedBDT, false)}
              </span>
            </div>
          </div>

          {/* Pending Confirmation */}
          <button
            type="button"
            onClick={onPendingClick}
            className="flex items-center gap-2 p-2 rounded-xl bg-[#103D2C]/50 border border-[#19523C]/40 min-w-0 text-left hover:bg-[#144734]/70 active:scale-95 transition-all"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center text-[#FBBF24] border border-[#F59E0B]/30 shrink-0">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] uppercase font-semibold text-[#E9C37A] tracking-wider truncate">
                Pending ({metrics.pendingCount})
              </span>
              <span className="font-semibold text-[#FDE68A] text-[11px] sm:text-xs truncate">
                ৳{formatBDT(metrics.pendingConfirmationBDT, false)}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
