'use client';

import React, { useState } from 'react';
import { ShieldCheck, Clock, Search, Filter, Plus, FileText, CheckCircle2 } from 'lucide-react';
import { PaymentTransaction } from '@/types/fintech';
import { formatBDT } from '@/lib/utils';

export interface ReceiptsViewProps {
  transactions: PaymentTransaction[];
  onSelectTransaction: (tx: PaymentTransaction) => void;
  onUploadNew: () => void;
}

export function ReceiptsView({
  transactions,
  onSelectTransaction,
  onUploadNew,
}: ReceiptsViewProps) {
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter((tx) => {
    if (filter === 'verified' && tx.status !== 'verified') return false;
    if (filter === 'pending' && tx.status !== 'pending') return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        tx.trxId.toLowerCase().includes(q) ||
        tx.senderName.toLowerCase().includes(q) ||
        tx.recipientName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-full bg-[#F5F7F3] pb-24">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#112117] tracking-tight">
            Receipt Verification
          </h1>
          <p className="text-xs text-[#62776A] mt-0.5">
            Cloudflare R2 Encrypted Proof Archive
          </p>
        </div>

        <button
          onClick={onUploadNew}
          className="h-10 px-3.5 bg-[#0B2C1F] text-white rounded-2xl text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-[#34D399]" />
          <span>Upload</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="px-5 mt-2">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8BA092] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by TrxID, sender, or merchant..."
            className="w-full h-11 pl-10 pr-4 bg-white rounded-2xl border border-[#E2EAE3] text-xs text-[#112117] placeholder-[#8BA092] focus:border-[#10B981] outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 mt-3 flex items-center gap-2">
        {(['all', 'verified', 'pending'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              filter === tab
                ? 'bg-[#0B2C1F] text-white shadow-sm'
                : 'bg-white text-[#5E7166] border border-[#E2EAE3] hover:bg-[#F2F6F3]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-5 mt-4 space-y-2.5">
        {filtered.map((tx) => (
          <div
            key={tx.id}
            onClick={() => onSelectTransaction(tx)}
            className="bg-white rounded-[22px] p-4 border border-[#E4EBE5] shadow-sm flex items-center justify-between hover:border-[#CADBD0] active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs ${
                  tx.status === 'verified'
                    ? 'bg-[#EBF7EE] text-[#059669] border border-[#CEEED6]'
                    : 'bg-[#FFF8E7] text-[#B45309] border border-[#FDE68A]'
                }`}
              >
                {tx.status === 'verified' ? (
                  <ShieldCheck className="w-5 h-5 text-[#059669]" />
                ) : (
                  <Clock className="w-5 h-5 text-[#D97706]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs text-[#112117]">
                    {tx.trxId}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#6F8276] bg-[#F2F5F2] px-1.5 py-0.5 rounded">
                    {tx.method}
                  </span>
                </div>
                <div className="text-xs text-[#6F8276] mt-0.5">
                  {tx.recipientName}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-sm text-[#112117]">
                ৳{formatBDT(tx.amount)}
              </div>
              <div className="text-[11px] text-[#8EA295] mt-0.5">
                {tx.date}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-[26px] border border-[#E2EAE3] p-6">
            <FileText className="w-10 h-10 text-[#A3B8AB] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#112117]">No receipts found</h3>
            <p className="text-xs text-[#6F8276] mt-1">
              No transactions match your current search or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
