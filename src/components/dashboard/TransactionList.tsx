'use client';

import React from 'react';
import { ChevronRight, ArrowUpRight, ArrowDownLeft, ShieldCheck, Clock, Receipt, Plus } from 'lucide-react';
import { PaymentTransaction } from '@/types/fintech';
import { formatBDT } from '@/lib/utils';

export interface TransactionListProps {
  transactions: PaymentTransaction[];
  onSelectTransaction: (tx: PaymentTransaction) => void;
  onSeeAll?: () => void;
  onCreateNew?: () => void;
}

export function TransactionList({
  transactions,
  onSelectTransaction,
  onSeeAll,
  onCreateNew,
}: TransactionListProps) {
  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'bkash':
        return { label: 'bKash', bg: 'bg-[#E2136E]/10', text: 'text-[#E2136E]', border: 'border-[#E2136E]/20' };
      case 'nagad':
        return { label: 'Nagad', bg: 'bg-[#F7941D]/10', text: 'text-[#F7941D]', border: 'border-[#F7941D]/20' };
      case 'rocket':
        return { label: 'Rocket', bg: 'bg-[#8C3494]/10', text: 'text-[#8C3494]', border: 'border-[#8C3494]/20' };
      case 'bank_transfer':
        return { label: 'Bank NPSB', bg: 'bg-[#0B2C1F]/10', text: 'text-[#0B2C1F]', border: 'border-[#0B2C1F]/20' };
      default:
        return { label: method, bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  return (
    <div className="px-4 sm:px-5 mt-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold text-[#112117] tracking-tight">
          Recent Transactions
        </h2>
        {transactions.length > 0 && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-xs font-semibold text-[#0B2B1F] hover:text-[#10B981] flex items-center gap-1 transition-colors duration-150"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Transaction Items */}
      {transactions.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {transactions.map((tx) => {
            const isIncome = tx.category === 'Income';
            const methodInfo = getMethodBadge(tx.method);

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="bg-white rounded-2xl p-3 sm:p-3.5 border border-[#E6EDE7] shadow-sm flex items-center justify-between hover:border-[#CADBD0] active:scale-[0.99] transition-all duration-150 cursor-pointer min-w-0 gap-2.5"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  {/* Visual Icon Avatar */}
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isIncome
                        ? 'bg-[#EBF7EE] text-[#059669] border border-[#CDEED5]'
                        : 'bg-[#F2F5F2] text-[#243B2E] border border-[#DEE8E0]'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#059669]" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#3C5346]" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-xs sm:text-sm text-[#112117] truncate">
                        {isIncome ? tx.senderName : tx.recipientName}
                      </span>
                      {tx.status === 'verified' && (
                        <span title="Verified Receipt" className="shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                        </span>
                      )}
                      {tx.status === 'pending' && (
                        <span title="Pending Verification" className="shrink-0">
                          <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                      <span className="text-[11px] text-[#6F8276] truncate">
                        {tx.category}
                      </span>
                      <span
                        className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.2 rounded border shrink-0 ${methodInfo.bg} ${methodInfo.text} ${methodInfo.border}`}
                      >
                        {methodInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount & Time */}
                <div className="flex flex-col items-end shrink-0 pl-1">
                  <span
                    className={`text-xs sm:text-sm font-bold tracking-tight ${
                      isIncome ? 'text-[#059669]' : 'text-[#112117]'
                    }`}
                  >
                    {isIncome ? '+' : '-'}৳{formatBDT(tx.amount)}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#86998D] mt-0.5">
                    {tx.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#E4EBE5] p-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#EAF3ED] text-[#0B2C1F] flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-6 h-6 text-[#10B981]" />
          </div>
          <h3 className="text-sm font-bold text-[#112117]">
            No Transactions Yet
          </h3>
          <p className="text-xs text-[#6B7F73] mt-1 max-w-xs mx-auto">
            Your live Supabase ledger is clean and ready. Tap below to log your first payment or upload a receipt slip.
          </p>
          {onCreateNew && (
            <button
              type="button"
              onClick={onCreateNew}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B2C1F] text-white rounded-xl text-xs font-semibold hover:bg-[#071F15] active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Create First Payment</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
