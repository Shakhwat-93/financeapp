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
      label: 'New Payment',
      icon: Plus,
      onClick: onCreatePayment,
      highlight: true,
    },
    {
      id: 'verify',
      label: 'Verify Proof',
      icon: CheckCircle2,
      onClick: onVerifyReceipt,
      highlight: false,
    },
    {
      id: 'send',
      label: 'Send',
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
    <div className="px-5 mt-5">
      <div className="grid grid-cols-4 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className="flex flex-col items-center justify-center p-3 bg-white rounded-[22px] border border-[#E4EBE5] shadow-sm hover:border-[#CBDCD0] active:scale-95 transition-all duration-200 group"
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-1.5 transition-colors duration-200 ${
                  act.highlight
                    ? 'bg-[#0B2C1F] text-white shadow-sm'
                    : 'bg-[#F2F6F3] text-[#1E3A2B] group-hover:bg-[#E5EFE8]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-[#304439] tracking-tight text-center truncate max-w-full">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
