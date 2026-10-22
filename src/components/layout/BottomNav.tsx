'use client';

import React from 'react';
import { Home, BarChart2, ArrowLeftRight, Receipt, User } from 'lucide-react';
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
    { id: 'quick-transfer' as NavTab, label: '', icon: ArrowLeftRight, isCenter: true },
    { id: 'receipts' as NavTab, label: 'Receipts', icon: Receipt },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed sm:absolute bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-1 pointer-events-none">
      <nav className="pointer-events-auto max-w-[420px] mx-auto bg-white/95 backdrop-blur-xl border border-[#E2EAE3] rounded-[30px] px-3 py-2 flex items-center justify-between shadow-bottom-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isCenter) {
            return (
              <div key="center-btn" className="relative -top-5 flex justify-center">
                <button
                  onClick={onCenterAction}
                  aria-label="Create payment or verify receipt"
                  className="w-13 h-13 rounded-full bg-[#0B2C1F] text-white flex items-center justify-center shadow-emerald-float border-4 border-white active:scale-95 hover:bg-[#071E15] transition-all duration-200"
                >
                  <ArrowLeftRight className="w-5 h-5 text-[#34D399]" />
                </button>
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-150 active:scale-95',
                isActive ? 'text-[#0B2C1F]' : 'text-[#8E9F94] hover:text-[#4F6255]'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]')} />
              <span
                className={cn(
                  'text-[10px] mt-1 font-semibold tracking-tight transition-colors duration-150',
                  isActive ? 'text-[#0B2C1F]' : 'text-[#8E9F94]'
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#0B2C1F] mt-0.5" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
