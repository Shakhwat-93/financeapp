import React from 'react';
import { cn } from '@/lib/utils';

export interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div className="min-h-[100dvh] bg-[#ECEFEA] flex justify-center items-stretch sm:items-start sm:py-6 sm:px-4 antialiased">
      <div
        className={cn(
          'w-full max-w-md min-h-[100dvh] bg-[#F5F7F3] flex flex-col relative sm:rounded-[36px] sm:shadow-[0_20px_50px_rgba(11,43,31,0.12)] sm:border sm:border-[#DCE5DE] overflow-x-hidden',
          className
        )}
      >
        {/* Content Body with proper bottom spacing for floating nav bar */}
        <div className="flex-1 flex flex-col pb-28 pt-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
