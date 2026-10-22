import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'forest' | 'secondary' | 'outline' | 'ghost' | 'pill-action';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none tap-highlight-none select-none';

    const variants = {
      primary: 'bg-[#10B981] hover:bg-[#059669] text-white shadow-sm',
      forest: 'bg-[#0B2B1F] hover:bg-[#082117] text-white shadow-emerald-float',
      secondary: 'bg-[#E7EFE9] hover:bg-[#D8E6DC] text-[#0B2B1F]',
      outline: 'border border-[#E2EAE3] bg-white hover:bg-[#F5F7F3] text-[#112117]',
      ghost: 'bg-transparent hover:bg-[#E7EFE9]/50 text-[#5E7166]',
      'pill-action': 'bg-white hover:bg-[#F2F5F2] text-[#112117] border border-[#E5EAE4] shadow-sm rounded-2xl flex-col gap-2 p-3.5',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-xs rounded-xl gap-1.5',
      md: 'h-11 px-5 text-sm rounded-2xl gap-2',
      lg: 'h-13 px-6 text-base rounded-2xl gap-2.5',
      icon: 'h-11 w-11 rounded-2xl p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
