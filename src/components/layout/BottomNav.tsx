'use client';

import React from 'react';
import { Home, BarChart2, Plus, Receipt, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab = 'home' | 'analytics' | 'quick-transfer' | 'receipts' | 'profile';

export interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onCenterAction: () => void;
}

export function BottomNav({ currentTab, onTabChange, onCenterAction }: BottomNavProps) {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart2 },
    { id: 'quick-transfer' as NavTab, label: '', icon: Plus, isCenter: true },
    { id: 'receipts' as NavTab, label: 'Receipts', icon: Receipt },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none flex justify-center">
      <nav className="pointer-events-auto w-full max-w-md bg-white/95 backdrop-blur-xl border border-[#E2EAE3] rounded-[28px] px-2 sm:px-3 py-1.5 flex items-center justify-between shadow-[0_-4px_24px_rgba(11,43,31,0.08)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isCenter) {
            return (
              <div key="center-btn" className="relative -top-4 px-1">
                <button
                  type="button"
                  onClick={onCenterAction}
                  aria-label="Create payment or upload receipt"
                  className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#0B2C1F] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(11,44,31,0.35)] border-4 border-white active:scale-95 hover:bg-[#071E15] transition-all duration-200"
                >
                  <Plus className="w-6 h-6 text-[#34D399] stroke-[2.5px]" />
                </button>
              </div>
            );
          }

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 min-w-0',
                isActive ? 'text-[#0B2C1F]' : 'text-[#8E9F94] hover:text-[#4F6255]'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]')} />
              <span
                className={cn(
                  'text-[10px] mt-0.5 font-semibold tracking-tight transition-colors duration-150 truncate max-w-full',
                  isActive ? 'text-[#0B2C1F]' : 'text-[#8E9F94]'
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#0B2C1F] mt-0.5 shrink-0" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
