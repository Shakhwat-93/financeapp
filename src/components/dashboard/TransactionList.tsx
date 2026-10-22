'use client';

import React from 'react';
import { ChevronRight, ArrowUpRight, ArrowDownLeft, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { PaymentTransaction } from '@/types/fintech';
import { formatBDT } from '@/lib/utils';

export interface TransactionListProps {
  transactions: PaymentTransaction[];
  onSelectTransaction: (tx: PaymentTransaction) => void;
  onSeeAll?: () => void;
}

export function TransactionList({
  transactions,
  onSelectTransaction,
  onSeeAll,
}: TransactionListProps) {
  // Method styling for Bangladesh ecosystem (bKash pink, Nagad orange, Rocket violet, Bank emerald)
  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'bkash':
        return { label: 'bKash', bg: 'bg-[#E2136E]/10', text: 'text-[#E2136E]', border: 'border-[#E2136E]/20' };
      case 'nagad':
        return { label: 'Nagad', bg: 'bg-[#F7941D]/10', text: 'text-[#F7941D]', border: 'border-[#F7941D]/20' };
      case 'rocket':
        return { label: 'Rocket', bg: 'bg-[#8C3494]/10', text: 'text-[#8C3494]', border: 'border-[#8C3494]/20' };
      case 'bank_transfer':
        return { label: 'BEFTN / NPSB', bg: 'bg-[#0B2C1F]/10', text: 'text-[#0B2C1F]', border: 'border-[#0B2C1F]/20' };
      default:
        return { label: method, bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  return (
    <div className="px-5 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-base font-bold text-[#112117] tracking-tight">
          Recent Transactions
        </h2>
        <button
          onClick={onSeeAll}
          className="text-xs font-semibold text-[#0B2B1F] hover:text-[#10B981] flex items-center gap-1 transition-colors duration-150"
        >
          <span>See all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Transaction Items */}
      <div className="flex flex-col gap-2.5">
        {transactions.map((tx) => {
          const isIncome = tx.category === 'Income';
          const methodInfo = getMethodBadge(tx.method);

          return (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction(tx)}
              className="bg-white rounded-[22px] p-3.5 border border-[#E6EDE7] shadow-sm flex items-center justify-between hover:border-[#CADBD0] active:scale-[0.99] transition-all duration-150 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                {/* Visual Icon Avatar */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    isIncome
                      ? 'bg-[#EBF7EE] text-[#059669] border border-[#CDEED5]'
                      : 'bg-[#F2F5F2] text-[#243B2E] border border-[#DEE8E0]'
                  }`}
                >
                  {isIncome ? (
                    <ArrowDownLeft className="w-5 h-5 text-[#059669]" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-[#3C5346]" />
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-[#112117] truncate max-w-[140px] sm:max-w-[180px]">
                      {isIncome ? tx.senderName : tx.recipientName}
                    </span>
                    {tx.status === 'verified' && (
                      <span title="Verified Receipt">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      </span>
                    )}
                    {tx.status === 'pending' && (
                      <span title="Pending Verification">
                        <Clock className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#6F8276] truncate max-w-[100px]">
                      {tx.category}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.2 rounded-md border ${methodInfo.bg} ${methodInfo.text} ${methodInfo.border}`}
                    >
                      {methodInfo.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount & Time */}
              <div className="flex flex-col items-end shrink-0 pl-2">
                <span
                  className={`text-sm font-bold tracking-tight ${
                    isIncome ? 'text-[#059669]' : 'text-[#112117]'
                  }`}
                >
                  {isIncome ? '+' : '-'}৳{formatBDT(tx.amount)}
                </span>
                <span className="text-[11px] text-[#86998D] mt-0.5">
                  {tx.date}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
