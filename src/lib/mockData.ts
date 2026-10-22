import { DashboardMetrics, PaymentTransaction } from '@/types/fintech';

export const INITIAL_METRICS: DashboardMetrics = {
  totalConfirmedBDT: 0,
  pendingConfirmationBDT: 0,
  totalSentBDT: 0,
  totalReceivedBDT: 0,
  confirmedCount: 0,
  pendingCount: 0,
  percentageChangeVsLastMonth: 0,
};

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [];
