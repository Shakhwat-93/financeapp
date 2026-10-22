'use client';

import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export interface BrandedSplashProps {
  onDismiss: () => void;
}

export function BrandedSplash({ onDismiss }: BrandedSplashProps) {
  return (
    <div className="absolute inset-0 z-50 bg-[#09261B] text-white flex flex-col justify-between p-5 sm:p-6 overflow-y-auto">
      {/* Background glow effects */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-[#059669]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with step indicator & Skip */}
      <div className="relative z-10 pt-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-wider text-[#A3C7B2]">
            01 / 03
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-1 rounded-full bg-white" />
            <div className="w-8 h-1 rounded-full bg-white/25" />
            <div className="w-8 h-1 rounded-full bg-white/25" />
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-semibold text-[#A3C7B2] hover:text-white transition-colors duration-150 p-1"
        >
          Skip
        </button>
      </div>

      {/* Hero Headline & Subtitle */}
      <div className="relative z-10 mt-5 sm:mt-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.15]">
          Your Money <br />
          <span className="text-[#34D399]">Better Days</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#A3C7B2] mt-2 sm:mt-3 leading-relaxed max-w-xs">
          Verify Bangladesh payment receipts, track bKash, Nagad & Bank transfers — all in one secure fintech portal.
        </p>
      </div>

      {/* Card Visual Hero Presentation */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center py-6">
        <div className="relative w-56 sm:w-64 h-36 sm:h-44 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#113A2B] via-[#1E5C45] to-[#154634] p-4 sm:p-5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border border-[#2D7A5D]/60 flex flex-col justify-between transform rotate-[-3deg] hover:rotate-0 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div className="w-9 h-6 sm:w-10 sm:h-7 rounded-md bg-[#D4AF37]/80 flex items-center justify-center shadow-inner">
              <div className="w-5 h-3.5 border border-[#B38F24] rounded-sm" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#9BD7B6]">
              BDT VERIFIED
            </span>
          </div>

          <div>
            <div className="text-[10px] sm:text-[11px] text-[#A6D5BD] font-mono tracking-wider">
              MFS & BANK RECEIPT CHECK
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm sm:text-base font-bold font-mono tracking-widest text-white">
                •••• 8921
              </span>
              <div className="flex items-center gap-1 bg-[#10B981]/25 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] text-[#34D399] font-semibold border border-[#10B981]/40">
                <ShieldCheck className="w-3 h-3" />
                <span>Instant OCR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Podium Base Accent */}
        <div className="w-40 sm:w-48 h-4 rounded-full bg-[#051710]/60 blur-md -mt-1" />
      </div>

      {/* Bottom CTA Button */}
      <div className="relative z-10 pb-2">
        <button
          type="button"
          onClick={onDismiss}
          className="w-full h-12 sm:h-14 bg-white hover:bg-[#F2F5F2] text-[#09261B] rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all duration-150"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
