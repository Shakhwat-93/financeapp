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
  subtitle = "Let's track & verify your receipts",
  onSearchClick,
  onNotificationClick,
  unreadCount = 2,
}: TopHeaderProps) {
  return (
    <header className="px-5 pt-4 pb-3 flex items-center justify-between">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold tracking-tight text-[#112117] leading-tight">
          {greeting}
        </h1>
        <p className="text-xs font-medium text-[#64786C] mt-0.5">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSearchClick}
          aria-label="Search transactions"
          className="w-10 h-10 rounded-full bg-white border border-[#E2EAE3] text-[#112117] flex items-center justify-center transition-all duration-200 active:scale-95 hover:bg-[#F2F5F2] shadow-sm"
        >
          <Search className="w-4 h-4 text-[#43574B]" />
        </button>

        <button
          onClick={onNotificationClick}
          aria-label="Notifications"
          className="w-10 h-10 rounded-full bg-white border border-[#E2EAE3] text-[#112117] flex items-center justify-center transition-all duration-200 active:scale-95 hover:bg-[#F2F5F2] shadow-sm relative"
        >
          <Bell className="w-4 h-4 text-[#43574B]" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
}
