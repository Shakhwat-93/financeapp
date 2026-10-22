import React from 'react';
import { cn } from '@/lib/utils';

export interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-[#ECEFEA] flex justify-center items-start sm:py-8 select-none">
      <div
        className={cn(
          'w-full sm:max-w-[420px] min-h-screen sm:min-h-[890px] bg-[#F5F7F3] sm:rounded-[44px] sm:shadow-[0_24px_60px_-15px_rgba(11,43,31,0.22),0_0_0_10px_#112117] flex flex-col relative overflow-hidden sm:border-[8px] sm:border-[#1F3327]',
          className
        )}
      >
        {/* Dynamic Island / Speaker Notch Simulation for Desktop Preview */}
        <div className="hidden sm:flex justify-center pt-3 pb-1 w-full z-50">
          <div className="w-28 h-5 bg-[#0C1A13] rounded-full flex items-center justify-between px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#152A20]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#152A20] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#059669]/60" />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col pb-24">
          {children}
        </div>
      </div>
    </div>
  );
}
