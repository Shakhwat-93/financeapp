'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationPending, setVerificationPending] = useState(false);

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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim() || undefined,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        setVerificationPending(true);
        setIsLoading(false);
        return;
      }

      // If session exists immediately, redirect to dashboard
      if (data.session) {
        router.refresh();
        router.push('/');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during signup.');
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

        {verificationPending ? (
          /* Verification Pending Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-16 h-16 rounded-full bg-[#EBF7EE] border border-[#CEEED6] text-[#059669] flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#112117] tracking-tight">
              Verify Your Email
            </h2>
            <p className="text-xs text-[#5E7166] mt-2 max-w-xs mx-auto leading-relaxed">
              We have sent an activation link to <strong className="text-[#112117]">{email}</strong>. Please check your inbox and verify your email to access the fintech ledger.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="w-full h-12 bg-[#0B2C1F] hover:bg-[#071F15] text-white rounded-2xl font-bold text-sm inline-flex items-center justify-center gap-2 shadow-emerald-float transition-all"
              >
                <span>Return to Login</span>
                <ArrowRight className="w-4 h-4 text-[#34D399]" />
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Registration Form */
          <>
            <div className="text-center relative z-10 mb-5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0B2C1F] to-[#0E3A2A] text-white flex items-center justify-center mx-auto mb-2.5 shadow-emerald-float border border-[#18533C]/40">
                <span className="text-2xl font-black text-[#34D399]">৳</span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#112117] tracking-tight">
                Create Your Account
              </h1>
              <p className="text-xs text-[#5E7166] mt-0.5">
                Start tracking & verifying Bangladesh payments
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

            <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
              <div>
                <label className="text-[11px] font-bold text-[#576C60] block mb-1 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8BA092] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Morshed Alam"
                    className="w-full h-11 pl-10 pr-3 bg-white text-[#112117] placeholder-[#8EA295] rounded-xl sm:rounded-2xl border border-[#E2EAE3] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 text-base outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#576C60] block mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8BA092] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.com"
                    className="w-full h-11 pl-10 pr-3 bg-white text-[#112117] placeholder-[#8EA295] rounded-xl sm:rounded-2xl border border-[#E2EAE3] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 text-base outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#576C60] block mb-1 uppercase tracking-wider">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8BA092] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01700-112233"
                    className="w-full h-11 pl-10 pr-3 bg-white text-[#112117] placeholder-[#8EA295] rounded-xl sm:rounded-2xl border border-[#E2EAE3] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 text-base outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#576C60] block mb-1 uppercase tracking-wider">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8BA092] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-10 bg-white text-[#112117] placeholder-[#8EA295] rounded-xl sm:rounded-2xl border border-[#E2EAE3] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 text-base outline-none transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8BA092] hover:text-[#112117] p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#576C60] block mb-1 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8BA092] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-3 bg-white text-[#112117] placeholder-[#8EA295] rounded-xl sm:rounded-2xl border border-[#E2EAE3] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 text-base outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#0B2C1F] hover:bg-[#071F15] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-emerald-float active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4 text-[#34D399]" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-5 text-center text-xs text-[#5E7166] relative z-10">
              <span>Already have an account? </span>
              <Link
                href="/login"
                className="font-bold text-[#0B2C1F] hover:text-[#10B981] underline underline-offset-2 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
