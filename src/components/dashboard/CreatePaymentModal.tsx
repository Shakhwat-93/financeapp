'use client';

import React, { useState, useRef } from 'react';
import { X, UploadCloud, ShieldCheck, Sparkles } from 'lucide-react';
import { PaymentMethod } from '@/types/fintech';

export interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    method: PaymentMethod;
    trxId: string;
    recipientName: string;
    note: string;
    file?: File;
  }) => Promise<void> | void;
}

export function CreatePaymentModal({ isOpen, onClose, onSubmit }: CreatePaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [amount, setAmount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !trxId || !recipientName) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
        method,
        trxId,
        recipientName,
        note,
        file: selectedFile || undefined,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const methods: { id: PaymentMethod; name: string; tag: string }[] = [
    { id: 'bkash', name: 'bKash', tag: 'Instant MFS' },
    { id: 'nagad', name: 'Nagad', tag: 'Postal MFS' },
    { id: 'rocket', name: 'Rocket', tag: 'DBBL' },
    { id: 'bank_transfer', name: 'Bank Transfer', tag: 'NPSB/BEFTN' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl border border-[#E2EAE3] max-h-[90dvh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EEF3EF]">
          <div className="min-w-0 pr-2">
            <h2 className="text-base sm:text-lg font-bold text-[#112117] tracking-tight truncate">
              Create & Verify Payment
            </h2>
            <p className="text-[11px] sm:text-xs text-[#62776A] mt-0.5 truncate">
              Live Supabase DB + Cloudflare R2 Proof Storage
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-[#F2F6F3] text-[#4F6356] flex items-center justify-center hover:bg-[#E5ECE7] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Method Selection */}
          <div>
            <label className="text-[11px] font-semibold text-[#576C60] block mb-1.5 uppercase tracking-wider">
              Payment Gateway
            </label>
            <div className="grid grid-cols-2 gap-2">
              {methods.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border text-left flex flex-col transition-all duration-150 active:scale-95 ${
                    method === m.id
                      ? 'border-[#0B2C1F] bg-[#0B2C1F] text-white shadow-sm'
                      : 'border-[#E2EAE3] bg-white text-[#112117] hover:bg-[#F7F9F7]'
                  }`}
                >
                  <span className="text-xs font-bold">{m.name}</span>
                  <span
                    className={`text-[9px] sm:text-[10px] mt-0.5 ${
                      method === m.id ? 'text-[#A3D1B9]' : 'text-[#7B8F83]'
                    }`}
                  >
                    {m.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount in BDT */}
          <div>
            <label className="text-[11px] font-semibold text-[#576C60] block mb-1 uppercase tracking-wider">
              Amount (BDT ৳)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-[#0B2C1F]">
                ৳
              </span>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-11 pl-9 pr-3 text-base font-bold rounded-xl sm:rounded-2xl border border-[#E2EAE3] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 outline-none bg-white text-[#112117]"
              />
            </div>
          </div>

          {/* Transaction ID / TrxID */}
          <div>
            <label className="text-[11px] font-semibold text-[#576C60] block mb-1 uppercase tracking-wider">
              Transaction ID (TrxID)
            </label>
            <input
              type="text"
              required
              value={trxId}
              onChange={(e) => setTrxId(e.target.value.toUpperCase())}
              placeholder="e.g. BK9A40812X or Bank Ref"
              className="w-full h-11 px-3 font-mono text-base tracking-wider uppercase rounded-xl sm:rounded-2xl border border-[#E2EAE3] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 outline-none bg-white text-[#112117]"
            />
          </div>

          {/* Recipient / Merchant */}
          <div>
            <label className="text-[11px] font-semibold text-[#576C60] block mb-1 uppercase tracking-wider">
              Recipient / Merchant
            </label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Apex Footwear / Personal"
              className="w-full h-11 px-3 text-base rounded-xl sm:rounded-2xl border border-[#E2EAE3] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 outline-none bg-white text-[#112117]"
            />
          </div>

          {/* Note / Memo */}
          <div>
            <label className="text-[11px] font-semibold text-[#576C60] block mb-1 uppercase tracking-wider">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Invoice reference or bill note"
              className="w-full h-11 px-3 text-base rounded-xl sm:rounded-2xl border border-[#E2EAE3] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 outline-none bg-white text-[#112117]"
            />
          </div>

          {/* Receipt Proof Upload */}
          <div>
            <label className="text-[11px] font-semibold text-[#576C60] block mb-1 uppercase tracking-wider">
              Receipt Proof (Cloudflare R2 Bucket)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                selectedFile
                  ? 'border-[#10B981] bg-[#EBF7EE]'
                  : 'border-[#CBD9CF] bg-[#F7F9F7] hover:bg-[#EEF4EF]'
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center gap-2 text-[#059669] min-w-0">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <div className="text-left truncate">
                    <span className="text-xs font-bold block truncate">
                      {selectedFile.name}
                    </span>
                    <span className="text-[10px] text-[#477558]">
                      {(selectedFile.size / 1024).toFixed(1)} KB — Attached for Cloudflare R2
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-[#62776A]">
                  <UploadCloud className="w-5 h-5 text-[#10B981]" />
                  <span className="text-xs font-medium text-center">
                    Tap to upload SMS screenshot or slip
                  </span>
                  <span className="text-[9px] text-[#8EA295] text-center">
                    PNG, JPG, PDF (Stored in fintech-receipts-secure)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 sm:h-12 bg-[#0B2C1F] hover:bg-[#071F15] text-white rounded-xl sm:rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-emerald-float active:scale-[0.98] transition-all"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Storing in Supabase & R2...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#34D399]" />
                  <span>Submit Payment for Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
