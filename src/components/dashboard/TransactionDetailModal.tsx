'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Copy, Check, Download, Share2, Clock } from 'lucide-react';
import { PaymentTransaction } from '@/types/fintech';
import { formatBDT } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export interface TransactionDetailModalProps {
  transaction: PaymentTransaction | null;
  onClose: () => void;
}

export function TransactionDetailModal({
  transaction,
  onClose,
}: TransactionDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const handleCopyTrx = () => {
    navigator.clipboard.writeText(transaction.trxId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isIncome = transaction.category === 'Income';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl border border-[#E2EAE3] max-h-[90dvh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EEF3EF]">
          <span className="text-[11px] font-bold text-[#62776A] uppercase tracking-wider">
            Transaction Details
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="w-8 h-8 rounded-full bg-[#F2F6F3] text-[#4F6356] flex items-center justify-center hover:bg-[#E5ECE7] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount & Status Hero */}
        <div className="text-center py-4">
          <div className="inline-block mb-2">
            <Badge status={transaction.status}>
              {transaction.status === 'verified' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Verified Receipt Proof</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Pending Merchant Clearance</span>
                </>
              )}
            </Badge>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-[#112117] tracking-tight">
            {isIncome ? '+' : '-'}৳{formatBDT(transaction.amount)}
          </div>
          <div className="text-xs text-[#718679] mt-0.5">
            {transaction.date} at {transaction.time}
          </div>
        </div>

        {/* Key Info Cards */}
        <div className="bg-[#F6F8F6] rounded-2xl p-3.5 sm:p-4 border border-[#E4EBE5] space-y-2.5 text-xs">
          {/* TrxID */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#62776A] font-medium shrink-0">TrxID</span>
            <div className="flex items-center gap-1 font-mono font-bold text-[#112117] truncate">
              <span className="truncate">{transaction.trxId}</span>
              <button
                type="button"
                onClick={handleCopyTrx}
                aria-label="Copy TrxID"
                className="p-1 hover:bg-[#E5ECE7] rounded-md transition-colors shrink-0"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#7B8F83]" />
                )}
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <span className="text-[#62776A] font-medium">Gateway</span>
            <span className="font-bold text-[#112117] uppercase">
              {transaction.method}
            </span>
          </div>

          {/* Sender */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#62776A] font-medium shrink-0">Sender</span>
            <div className="text-right truncate">
              <span className="font-bold text-[#112117] block truncate">
                {transaction.senderName}
              </span>
              {transaction.senderPhone && (
                <span className="text-[10px] text-[#7B8F83] block">
                  {transaction.senderPhone}
                </span>
              )}
            </div>
          </div>

          {/* Recipient */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#62776A] font-medium shrink-0">Recipient</span>
            <span className="font-bold text-[#112117] truncate text-right">
              {transaction.recipientName}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between">
            <span className="text-[#62776A] font-medium">Category</span>
            <span className="font-semibold text-[#112117]">
              {transaction.category}
            </span>
          </div>

          {/* Audit Verification */}
          {transaction.verifiedBy && (
            <div className="flex items-center justify-between pt-2 border-t border-[#E8EDE8]">
              <span className="text-[#62776A] font-medium">Verified By</span>
              <span className="font-bold text-[#059669]">
                {transaction.verifiedBy}
              </span>
            </div>
          )}
        </div>

        {/* Note / OCR Result */}
        {transaction.note && (
          <div className="mt-2.5 bg-[#EAF4ED] rounded-xl p-3 border border-[#D5E5D8] text-[11px] text-[#294B37] leading-relaxed">
            <span className="font-bold block mb-0.5">Verification Note:</span>
            {transaction.note}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => alert(`Receipt details for ${transaction.trxId} verified.`)}
            className="h-10 sm:h-11 rounded-xl sm:rounded-2xl border border-[#E2EAE3] bg-white text-[#112117] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#F5F7F3] active:scale-95 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#526659]" />
            <span>Save Receipt</span>
          </button>

          <button
            type="button"
            onClick={() => alert(`Verification reference for ${transaction.trxId} copied.`)}
            className="h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-[#0B2C1F] text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#071F15] active:scale-95 transition-all shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Share Audit Proof</span>
          </button>
        </div>
      </div>
    </div>
  );
}
