'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#ECEFEA] flex justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#F5F7F3] rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(11,43,31,0.12)] border border-[#DCE5DE] relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-16 h-16 rounded-full bg-[#EBF7EE] border border-[#CEEED6] text-[#059669] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#112117] tracking-tight">
              Password Updated
            </h2>
            <p className="text-xs text-[#5E7166] mt-2 max-w-xs mx-auto leading-relaxed">
              Your password has been changed successfully. You can now sign in with your new credentials.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="w-full h-12 bg-[#0B2C1F] hover:bg-[#071F15] text-white rounded-2xl font-bold text-sm inline-flex items-center justify-center gap-2 shadow-emerald-float transition-all"
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#34D399]" />
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-6 relative z-10">
              <h1 className="text-2xl font-extrabold text-[#112117] tracking-tight">
                Create New Password
              </h1>
              <p className="text-xs text-[#5E7166] mt-1">
                Enter your new secure password below
              </p>
            </div>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{errorMessage}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="text-[11px] font-bold text-[#576C60] block mb-1 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8BA092] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-11 pr-11 bg-white text-[#112117] placeholder-[#8EA295] rounded-2xl border border-[#E2EAE3] focus:border-[#10B981] focus:ring-3 focus:ring-[#10B981]/15 text-base outline-none transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8BA092] hover:text-[#112117] p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#576C60] block mb-1 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8BA092] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-11 pr-4 bg-white text-[#112117] placeholder-[#8EA295] rounded-2xl border border-[#E2EAE3] focus:border-[#10B981] focus:ring-3 focus:ring-[#10B981]/15 text-base outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#0B2C1F] hover:bg-[#071F15] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-emerald-float active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight className="w-4 h-4 text-[#34D399]" />
                  </>
                )}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
