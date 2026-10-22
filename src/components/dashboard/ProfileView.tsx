'use client';

import React from 'react';
import { Shield, Database, Cloud, Lock, Bell, Moon, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

export interface ProfileViewProps {
  onShowSplashAgain: () => void;
}

export function ProfileView({ onShowSplashAgain }: ProfileViewProps) {
  return (
    <div className="flex flex-col min-h-full bg-[#F5F7F3] pb-24">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <h1 className="text-xl font-bold text-[#112117] tracking-tight">
          Account & Infrastructure
        </h1>
        <p className="text-xs text-[#62776A] mt-0.5">
          Bangladesh Fintech Compliance & Verification
        </p>
      </div>

      {/* User Card */}
      <div className="px-5 mt-2">
        <div className="bg-white rounded-[26px] p-5 border border-[#E4EBE5] shadow-premium-card flex items-center gap-4">
          <Avatar name="Shakhawat Hossain" size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[#112117] truncate">
              Lead Finance Officer
            </h2>
            <p className="text-xs text-[#6B7F73]">
              fintech-admin@bangladesh.app
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1 bg-[#EBF7EE] text-[#059669] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#CEEED6]">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified SuperAdmin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure Status Panel */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-[26px] p-5 border border-[#E4EBE5] shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold text-[#6B7F73] uppercase tracking-wider">
            Connected Infrastructure (Phase 1 Audit)
          </h3>

          {/* Supabase Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#059669]">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#112117]">Self-Hosted Supabase</div>
                <div className="text-[10px] text-[#71867A]">Kong Gateway (Isolated Schema Ready)</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#059669] bg-[#EBF7EE] px-2 py-0.5 rounded-md border border-[#CEEED6]">
              Online
            </span>
          </div>

          {/* Cloudflare R2 Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFF6E7] flex items-center justify-center text-[#D97706]">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#112117]">Cloudflare R2 Storage</div>
                <div className="text-[10px] text-[#71867A]">Dedicated Secure Bucket Target</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#059669] bg-[#EBF7EE] px-2 py-0.5 rounded-md border border-[#CEEED6]">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-[26px] p-2 border border-[#E4EBE5] shadow-sm divide-y divide-[#EEF3EF]">
          <button
            onClick={onShowSplashAgain}
            className="w-full p-3.5 flex items-center justify-between hover:bg-[#F7F9F7] rounded-2xl transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F0F5F1] flex items-center justify-center text-[#1E3A2B]">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#112117]">
                View Onboarding Splash Screen
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8BA092]" />
          </button>

          <button
            onClick={() => alert('Biometric FaceID / TouchID protection is enabled.')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-[#F7F9F7] rounded-2xl transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F0F5F1] flex items-center justify-center text-[#1E3A2B]">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#112117]">
                Biometric & PIN Security
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8BA092]" />
          </button>
        </div>
      </div>
    </div>
  );
}
