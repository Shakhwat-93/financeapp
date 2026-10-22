'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Database, Cloud, Lock, ChevronRight, CheckCircle2, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { supabase } from '@/lib/supabase/client';

export interface ProfileViewProps {
  onShowSplashAgain: () => void;
  userEmail?: string;
  userName?: string;
}

export function ProfileView({ onShowSplashAgain, userEmail, userName }: ProfileViewProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh();
      router.push('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const displayName = userName || userEmail?.split('@')[0] || 'Finance User';
  const displayEmail = userEmail || 'user@fintech.bd';

  return (
    <div className="flex flex-col min-h-full bg-[#F5F7F3] pb-24">
      {/* Header */}
      <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-2.5">
        <h1 className="text-lg sm:text-xl font-bold text-[#112117] tracking-tight">
          System & Settings
        </h1>
        <p className="text-[11px] sm:text-xs text-[#62776A] mt-0.5">
          Bangladesh Fintech Compliance & Account
        </p>
      </div>

      {/* User Card */}
      <div className="px-4 sm:px-5 mt-2">
        <div className="bg-white rounded-2xl sm:rounded-[26px] p-4 sm:p-5 border border-[#E4EBE5] shadow-sm flex items-center gap-3.5">
          <Avatar name={displayName} size="md" />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-[#112117] truncate">
              {displayName}
            </h2>
            <p className="text-xs text-[#6B7F73] truncate">
              {displayEmail}
            </p>
            <div className="mt-1 inline-flex items-center gap-1 bg-[#EBF7EE] text-[#059669] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#CEEED6]">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure Status Panel */}
      <div className="px-4 sm:px-5 mt-4">
        <div className="bg-white rounded-2xl sm:rounded-[26px] p-4 sm:p-5 border border-[#E4EBE5] shadow-sm space-y-3">
          <h3 className="text-[11px] font-bold text-[#6B7F73] uppercase tracking-wider">
            Connected Infrastructure Status
          </h3>

          {/* Supabase Status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#059669] shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#112117] truncate">Self-Hosted Supabase</div>
                <div className="text-[10px] text-[#71867A] truncate">Kong Gateway (RLS User Isolation)</div>
              </div>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#059669] bg-[#EBF7EE] px-2 py-0.5 rounded-md border border-[#CEEED6] shrink-0">
              Active
            </span>
          </div>

          {/* Cloudflare R2 Status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FFF6E7] flex items-center justify-center text-[#D97706] shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#112117] truncate">Cloudflare R2 Bucket</div>
                <div className="text-[10px] text-[#71867A] truncate">fintech-receipts-secure</div>
              </div>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#059669] bg-[#EBF7EE] px-2 py-0.5 rounded-md border border-[#CEEED6] shrink-0">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="px-4 sm:px-5 mt-4">
        <div className="bg-white rounded-2xl sm:rounded-[26px] p-1.5 border border-[#E4EBE5] shadow-sm divide-y divide-[#EEF3EF]">
          <button
            type="button"
            onClick={onShowSplashAgain}
            className="w-full p-3 flex items-center justify-between hover:bg-[#F7F9F7] rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F0F5F1] flex items-center justify-center text-[#1E3A2B] shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#112117]">
                View Onboarding Splash Screen
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8BA092]" />
          </button>

          <button
            type="button"
            onClick={() => alert('Biometric authentication is active.')}
            className="w-full p-3 flex items-center justify-between hover:bg-[#F7F9F7] rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F0F5F1] flex items-center justify-center text-[#1E3A2B] shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#112117]">
                Biometric & PIN Security
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8BA092]" />
          </button>

          {/* Working Sign Out Action */}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full p-3 flex items-center justify-between hover:bg-red-50/60 rounded-xl transition-colors text-left text-red-600 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-100/60 flex items-center justify-center text-red-600 shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-red-600">
                Sign Out of Account
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
