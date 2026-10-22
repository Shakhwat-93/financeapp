'use client';

import React from 'react';
import { Plus, Send, CheckCircle2, MoreHorizontal } from 'lucide-react';

export interface QuickActionsProps {
  onCreatePayment: () => void;
  onVerifyReceipt: () => void;
  onSend: () => void;
  onMore: () => void;
}

export function QuickActions({
  onCreatePayment,
  onVerifyReceipt,
  onSend,
  onMore,
}: QuickActionsProps) {
  const actions = [
    {
      id: 'create',
      label: 'Pay / Add',
      icon: Plus,
      onClick: onCreatePayment,
      highlight: true,
    },
    {
      id: 'verify',
      label: 'Verify',
      icon: CheckCircle2,
      onClick: onVerifyReceipt,
      highlight: false,
    },
    {
      id: 'send',
      label: 'Transfer',
      icon: Send,
      onClick: onSend,
      highlight: false,
    },
    {
      id: 'more',
      label: 'More',
      icon: MoreHorizontal,
      onClick: onMore,
      highlight: false,
    },
  ];

  return (
    <div className="px-4 sm:px-5 mt-4">
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              className="flex flex-col items-center justify-center py-2.5 px-1 sm:p-3 bg-white rounded-2xl sm:rounded-[22px] border border-[#E4EBE5] shadow-sm hover:border-[#CBDCD0] active:scale-95 transition-all duration-150 group min-w-0"
            >
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center mb-1.5 transition-colors duration-150 shrink-0 ${
                  act.highlight
                    ? 'bg-[#0B2C1F] text-white shadow-sm'
                    : 'bg-[#F2F6F3] text-[#1E3A2B] group-hover:bg-[#E5EFE8]'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] font-semibold text-[#304439] tracking-tight text-center truncate w-full px-0.5">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
