import React from 'react';
import { cn } from '@/lib/utils';
import { PaymentStatus } from '@/types/fintech';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'verified' | 'pending' | 'flagged' | 'emerald' | 'sage' | 'neutral';
  status?: PaymentStatus;
}

export function Badge({ className, variant, status, children, ...props }: BadgeProps) {
  let activeVariant = variant || 'neutral';

  if (status) {
    switch (status) {
      case 'verified':
        activeVariant = 'verified';
        break;
      case 'pending':
        activeVariant = 'pending';
        break;
      case 'rejected':
      case 'flagged':
        activeVariant = 'flagged';
        break;
    }
  }

  const variants = {
    verified: 'bg-[#EBF7EE] text-[#0A7A3C] border border-[#C6E8CD]',
    pending: 'bg-[#FFF8E7] text-[#B45309] border border-[#FDE68A]',
    flagged: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
    emerald: 'bg-[#10B981]/15 text-[#059669] border border-[#10B981]/30',
    sage: 'bg-[#E7EFE9] text-[#0E3524] border border-[#D5E3D8]',
    neutral: 'bg-[#F2F5F2] text-[#5E7166] border border-[#E3EAE4]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full',
        variants[activeVariant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
