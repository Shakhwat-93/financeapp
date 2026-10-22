'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { TopHeader } from '@/components/layout/TopHeader';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { BottomNav, NavTab } from '@/components/layout/BottomNav';
import { BrandedSplash } from '@/components/layout/BrandedSplash';
import { AnalyticsView } from '@/components/dashboard/AnalyticsView';
import { ReceiptsView } from '@/components/dashboard/ReceiptsView';
import { ProfileView } from '@/components/dashboard/ProfileView';
import { CreatePaymentModal } from '@/components/dashboard/CreatePaymentModal';
import { TransactionDetailModal } from '@/components/dashboard/TransactionDetailModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { INITIAL_METRICS, INITIAL_TRANSACTIONS } from '@/lib/mockData';
import { DashboardMetrics, PaymentTransaction } from '@/types/fintech';
import { supabase } from '@/lib/supabase/client';

export default function Home() {
  const [showSplash, setShowSplash] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_TRANSACTIONS);
  const [metrics, setMetrics] = useState<DashboardMetrics>(INITIAL_METRICS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Map database row from Supabase to frontend model
  const mapDbRow = (row: any): PaymentTransaction => {
    const d = new Date(row.created_at);
    return {
      id: row.id,
      trxId: row.trx_id,
      amount: Number(row.amount),
      currency: 'BDT',
      method: row.gateway,
      status: row.status,
      senderName: row.sender_name || 'Sender',
      senderPhone: row.sender_phone || undefined,
      recipientName: row.recipient_name,
      category: row.category || 'Shopping',
      note: row.note || undefined,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      verifiedAt: row.verified_at || undefined,
      verifiedBy: row.verified_by || undefined,
    };
  };

  const loadData = useCallback(async () => {
    try {
      // 1. Get authenticated user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
      }

      // 2. Fetch live payments strictly isolated to this user
      const resPayments = await fetch('/api/payments');
      if (resPayments.ok) {
        const { payments } = await resPayments.json();
        if (payments) {
          setTransactions(payments.map(mapDbRow));
        }
      }

      // 3. Fetch live metrics strictly isolated to this user
      const resMetrics = await fetch('/api/metrics');
      if (resMetrics.ok) {
        const { metrics: m } = await resMetrics.json();
        if (m) {
          setMetrics(m);
        }
      }
    } catch (err) {
      console.warn('Network fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Setup Supabase Realtime listener on ft_payments
    try {
      const channel = supabase
        .channel('ft_payments_live_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'ft_payments' },
          () => {
            loadData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.error('Realtime subscription error:', e);
    }
  }, [loadData]);

  const handleCreatePayment = async (newPayment: {
    amount: number;
    method: any;
    trxId: string;
    recipientName: string;
    note: string;
    file?: File;
  }) => {
    try {
      // 1. Create payment in live Supabase DB
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trxId: newPayment.trxId,
          gateway: newPayment.method,
          amount: newPayment.amount,
          recipientName: newPayment.recipientName,
          note: newPayment.note,
          status: 'verified',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(`Error: ${errData.error || 'Failed to create payment'}`);
        return;
      }

      const { payment } = await res.json();

      // 2. If receipt file was selected, upload directly to Cloudflare R2
      if (newPayment.file) {
        const formData = new FormData();
        formData.append('file', newPayment.file);
        formData.append('paymentId', payment.id);
        formData.append('trxId', payment.trx_id);
        formData.append('amount', String(payment.amount));

        await fetch('/api/receipts/upload', {
          method: 'POST',
          body: formData,
        });
      }

      // 3. Refresh live dataset
      await loadData();
    } catch (err: any) {
      console.error('Create payment failed:', err);
      alert('Network error while saving payment proof.');
    }
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <MobileContainer>
      {showSplash ? (
        <BrandedSplash onDismiss={() => setShowSplash(false)} />
      ) : (
        <>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 sm:p-5 space-y-4"
              >
                <div className="flex justify-between items-center pt-2">
                  <div className="space-y-1.5">
                    <Skeleton className="w-32 h-6" />
                    <Skeleton className="w-48 h-3.5" />
                  </div>
                  <Skeleton className="w-10 h-10 rounded-full" />
                </div>
                <Skeleton className="w-full h-48 rounded-[28px]" />
                <div className="grid grid-cols-4 gap-2.5">
                  <Skeleton className="h-20 rounded-2xl" />
                  <Skeleton className="h-20 rounded-2xl" />
                  <Skeleton className="h-20 rounded-2xl" />
                  <Skeleton className="h-20 rounded-2xl" />
                </div>
                <Skeleton className="w-full h-36 rounded-2xl" />
              </motion.div>
            ) : (
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex-1 flex flex-col"
              >
                {/* Main Tab Render */}
                {currentTab === 'home' && (
                  <div className="flex flex-col">
                    <TopHeader
                      greeting={`Good day, ${userName}`}
                      subtitle="Payment Tracking & Receipt Verification"
                      onSearchClick={() => setCurrentTab('receipts')}
                      onNotificationClick={() => alert('Infrastructure status: Supabase VPS & Cloudflare R2 active.')}
                    />
                    <BalanceCard
                      metrics={metrics}
                      onAnalyticsClick={() => setCurrentTab('analytics')}
                      onPendingClick={() => setCurrentTab('receipts')}
                    />
                    <QuickActions
                      onCreatePayment={() => setIsCreateOpen(true)}
                      onVerifyReceipt={() => setCurrentTab('receipts')}
                      onSend={() => setIsCreateOpen(true)}
                      onMore={() => setCurrentTab('profile')}
                    />
                    <TransactionList
                      transactions={transactions}
                      onSelectTransaction={(tx) => setSelectedTx(tx)}
                      onSeeAll={() => setCurrentTab('receipts')}
                      onCreateNew={() => setIsCreateOpen(true)}
                    />
                  </div>
                )}

                {currentTab === 'analytics' && (
                  <AnalyticsView
                    onBack={() => setCurrentTab('home')}
                    transactions={transactions}
                    metrics={metrics}
                  />
                )}

                {currentTab === 'receipts' && (
                  <ReceiptsView
                    transactions={transactions}
                    onSelectTransaction={(tx) => setSelectedTx(tx)}
                    onUploadNew={() => setIsCreateOpen(true)}
                  />
                )}

                {currentTab === 'profile' && (
                  <ProfileView
                    onShowSplashAgain={() => setShowSplash(true)}
                    userEmail={user?.email}
                    userName={userName}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Persistent Floating Bottom Nav */}
          <BottomNav
            currentTab={currentTab}
            onTabChange={(tab) => setCurrentTab(tab)}
            onCenterAction={() => setIsCreateOpen(true)}
          />

          {/* Interactive Modals */}
          <CreatePaymentModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreatePayment}
          />

          <TransactionDetailModal
            transaction={selectedTx}
            onClose={() => setSelectedTx(null)}
          />
        </>
      )}
    </MobileContainer>
  );
}
