'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawReturnTo = searchParams.get('returnTo');
  const returnTo = rawReturnTo && rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//')
    ? rawReturnTo
    : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please verify and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Email verification required. Please check your inbox.');
        } else {
          setErrorMessage(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.session) {
        router.refresh();
        router.push(returnTo);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#ECEFEA] flex justify-center items-center p-4">
      {/* Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#F5F7F3] rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(11,43,31,0.12)] border border-[#DCE5DE] relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center relative z-10 mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0B2C1F] to-[#0E3A2A] text-white flex items-center justify-center mx-auto mb-3 shadow-emerald-float border border-[#18533C]/40"
          >
            <span className="text-2xl font-black text-[#34D399]">৳</span>
          </motion.div>
          <h1 className="text-2xl font-extrabold text-[#112117] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-[#5E7166] mt-1">
            Bangladesh Payment Tracking & Verification PWA
          </p>
        </div>

        {/* Error Alert */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="text-[11px] font-bold text-[#576C60] block mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8BA092] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full h-12 pl-11 pr-4 bg-white text-[#112117] placeholder-[#8EA295] rounded-2xl border border-[#E2EAE3] focus:border-[#10B981] focus:ring-3 focus:ring-[#10B981]/15 text-base outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-[#576C60] uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#0B2C1F] hover:text-[#10B981] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
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
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#34D399]" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-[#5E7166] relative z-10">
          <span>Don&apos;t have an account? </span>
          <Link
            href="/register"
            className="font-bold text-[#0B2C1F] hover:text-[#10B981] underline underline-offset-2 transition-colors"
          >
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#ECEFEA] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#0B2C1F]/20 border-t-[#0B2C1F] rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
