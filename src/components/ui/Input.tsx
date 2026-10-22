import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-[#5E7166] uppercase tracking-wider pl-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 text-[#8E9F94] pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full h-12 bg-white text-[#112117] placeholder-[#9AA99E] rounded-2xl border border-[#E2EAE3] px-4 text-sm transition-all duration-200 outline-none',
              'focus:border-[#10B981] focus:ring-3 focus:ring-[#10B981]/15',
              icon && 'pl-11',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-600 pl-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
