'use client';

import React from 'react';
import { Search, Bell } from 'lucide-react';

export interface TopHeaderProps {
  greeting?: string;
  subtitle?: string;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  unreadCount?: number;
}

export function TopHeader({
  greeting = 'Good morning',
  subtitle = 'Payment Tracking & Receipt Verification',
  onSearchClick,
  onNotificationClick,
  unreadCount = 0,
}: TopHeaderProps) {
  return (
    <header className="px-4 sm:px-5 pt-3 sm:pt-4 pb-2.5 flex items-center justify-between gap-3">
      <div className="flex flex-col min-w-0">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#112117] leading-tight truncate">
          {greeting}
        </h1>
        <p className="text-[11px] sm:text-xs font-medium text-[#64786C] mt-0.5 truncate">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Search transactions"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E2EAE3] text-[#112117] flex items-center justify-center transition-all duration-150 active:scale-95 hover:bg-[#F2F5F2] shadow-sm"
        >
          <Search className="w-4 h-4 text-[#43574B]" />
        </button>

        <button
          type="button"
          onClick={onNotificationClick}
          aria-label="Notifications"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E2EAE3] text-[#112117] flex items-center justify-center transition-all duration-150 active:scale-95 hover:bg-[#F2F5F2] shadow-sm relative"
        >
          <Bell className="w-4 h-4 text-[#43574B]" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
}
