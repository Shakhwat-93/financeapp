export type PaymentStatus = 'pending' | 'verified' | 'rejected' | 'flagged';

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank_transfer' | 'cash';

export interface PaymentTransaction {
  id: string;
  senderName: string;
  senderPhone?: string;
  recipientName: string;
  amount: number;
  currency: 'BDT';
  method: PaymentMethod;
  trxId: string;
  status: PaymentStatus;
  date: string;
  time: string;
  receiptUrl?: string;
  note?: string;
  category: 'Subscription' | 'Income' | 'Food & Drinks' | 'Transport' | 'Shopping' | 'Bills & Utilities' | 'Business';
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface DashboardMetrics {
  totalConfirmedBDT: number;
  pendingConfirmationBDT: number;
  totalSentBDT: number;
  totalReceivedBDT: number;
  confirmedCount: number;
  pendingCount: number;
  percentageChangeVsLastMonth: number;
}
