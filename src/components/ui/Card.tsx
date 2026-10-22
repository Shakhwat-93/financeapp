import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'forest' | 'sage' | 'subtle';
}

export function Card({ className, variant = 'white', children, ...props }: CardProps) {
  const variants = {
    white: 'bg-white border border-[#E8EDE7] shadow-premium-card text-[#112117]',
    forest: 'bg-gradient-to-br from-[#0B2B1F] via-[#0D3627] to-[#082117] text-white shadow-emerald-float border border-[#164A35]/40',
    sage: 'bg-[#EBF3ED] border border-[#D5E5D9] text-[#0E3524]',
    subtle: 'bg-[#F2F5F2] border border-[#E3EAE4] text-[#112117]',
  };

  return (
    <div
      className={cn('rounded-[24px] p-5 transition-all duration-200', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
