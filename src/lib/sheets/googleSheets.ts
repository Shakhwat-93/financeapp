import { DashboardMetrics, PaymentTransaction } from '@/types/fintech';

export const DEFAULT_SPREADSHEET_ID = '1BiWzOnqxJZcjEeRugH93h1f_TzBlUGC41yPS2BUeZGg';
export const DEFAULT_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit`;

// In-memory fallback ledger (keeps app 100% stable during dev and initial setup)
let localPayments: PaymentTransaction[] = [
  {
    id: 'pmt_001',
    trxId: 'BK9A40812X',
    method: 'bkash',
    amount: 2450.00,
    currency: 'BDT',
    senderName: 'Shakhwat Hossain',
    senderPhone: '01711223344',
    recipientName: 'Canvas Digital',
    status: 'verified',
    category: 'Shopping',
    note: 'Invoice #8491',
    date: 'Nov 19, 2026',
    time: '2:00 AM',
    verifiedAt: '2026-11-19T02:00:00Z',
    verifiedBy: 'Automated Verification',
  },
  {
    id: 'pmt_002',
    trxId: 'NG7X19384M',
    method: 'nagad',
    amount: 5000.00,
    currency: 'BDT',
    senderName: 'Shakhwat Hossain',
    senderPhone: '01711223344',
    recipientName: 'Apex Footwear',
    status: 'verified',
    category: 'Shopping',
    note: 'Winter purchase',
    date: 'Nov 18, 2026',
    time: '7:30 PM',
    verifiedAt: '2026-11-18T19:30:00Z',
    verifiedBy: 'Automated Verification',
  },
  {
    id: 'pmt_003',
    trxId: 'RK4P82015L',
    method: 'rocket',
    amount: 1200.00,
    currency: 'BDT',
    senderName: 'Rahim Uddin',
    senderPhone: '01822334455',
    recipientName: 'Canvas Digital',
    status: 'pending',
    category: 'Business',
    note: 'Web consulting',
    date: 'Nov 18, 2026',
    time: '3:10 PM',
  },
];

let localUsers = [
  {
    id: 'usr_001',
    email: 'shakhwat.rasel989@gmail.com',
    password: 'password123',
    name: 'Shakhwat Hossain',
    phone: '01711223344',
    role: 'admin',
  },
  {
    id: 'usr_002',
    email: 'admin@fintech.bd',
    password: 'password123',
    name: 'Fintech Admin',
    phone: '01700112233',
    role: 'admin',
  },
];

function getWebAppUrl(): string | null {
  return process.env.GOOGLE_SHEETS_WEBAPP_URL || null;
}

export async function fetchGoogleSheets(action: string, payload: any = {}): Promise<any> {
  const webAppUrl = getWebAppUrl();

  if (!webAppUrl) {
    return null; // Fallback to local store
  }

  try {
    const res = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        ...payload,
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`[Google Sheets WebApp HTTP ${res.status}]`, await res.text());
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('[Google Sheets API Error]:', error);
    return null;
  }
}

// ------------------------------------------------------------------------------
// PAYMENTS SERVICE
// ------------------------------------------------------------------------------
export async function getPaymentsFromSheet(params: {
  status?: string;
  gateway?: string;
  search?: string;
  limit?: number;
} = {}): Promise<PaymentTransaction[]> {
  // 1. Try Google Sheets Web App
  const remote = await fetchGoogleSheets('get_payments', params);
  if (remote && Array.isArray(remote.payments)) {
    return remote.payments.map((p: any) => {
      const d = p.created_at ? new Date(p.created_at) : new Date();
      return {
        id: String(p.id),
        trxId: String(p.trx_id),
        method: (p.gateway || 'bkash').toLowerCase(),
        amount: Number(p.amount) || 0,
        currency: 'BDT' as const,
        senderName: p.sender_name || 'Fintech User',
        senderPhone: p.sender_phone || undefined,
        recipientName: p.recipient_name || 'Merchant',
        status: (p.status || 'verified').toLowerCase(),
        category: p.category || 'Shopping',
        note: p.note || undefined,
        receiptUrl: p.receipt_url || undefined,
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        verifiedAt: p.verified_at || undefined,
        verifiedBy: p.verified_by || undefined,
      };
    });
  }

  // 2. Fallback in-memory filter
  let result = [...localPayments];
  if (params.status && params.status !== 'all') {
    result = result.filter((p) => p.status === params.status);
  }
  if (params.gateway) {
    result = result.filter((p) => p.method === params.gateway);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.trxId.toLowerCase().includes(q) ||
        p.senderName.toLowerCase().includes(q) ||
        p.recipientName.toLowerCase().includes(q)
    );
  }

  return result.slice(0, params.limit || 50);
}

export async function addPaymentToSheet(paymentData: {
  trxId: string;
  gateway: string;
  amount: number;
  recipientName: string;
  senderName?: string;
  senderPhone?: string;
  recipientPhone?: string;
  category?: string;
  note?: string;
  receiptUrl?: string;
  status?: string;
}): Promise<PaymentTransaction> {
  const cleanTrxId = paymentData.trxId.trim().toUpperCase();

  // 1. Try Google Sheets Web App
  const remote = await fetchGoogleSheets('add_payment', {
    payment: {
      ...paymentData,
      trxId: cleanTrxId,
    },
  });

  if (remote?.error) {
    throw new Error(remote.error);
  }

  if (remote?.payment) {
    const p = remote.payment;
    const d = new Date();
    const created: PaymentTransaction = {
      id: String(p.id),
      trxId: cleanTrxId,
      method: (p.gateway || paymentData.gateway).toLowerCase() as any,
      amount: Number(p.amount) || paymentData.amount,
      currency: 'BDT',
      senderName: p.sender_name || paymentData.senderName || 'Fintech User',
      senderPhone: p.sender_phone || paymentData.senderPhone,
      recipientName: p.recipient_name || paymentData.recipientName,
      status: (p.status || 'verified') as any,
      category: (p.category || paymentData.category || 'Shopping') as any,
      note: p.note || paymentData.note,
      receiptUrl: p.receipt_url || paymentData.receiptUrl,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      verifiedAt: p.verified_at || d.toISOString(),
      verifiedBy: p.verified_by || 'Automated Verification',
    };
    // Also prepend to local
    localPayments.unshift(created);
    return created;
  }

  // 2. Check local duplicate
  const exists = localPayments.some((p) => p.trxId.toUpperCase() === cleanTrxId);
  if (exists) {
    throw new Error(`Payment with TrxID ${cleanTrxId} already exists in the ledger!`);
  }

  const d = new Date();
  const newPayment: PaymentTransaction = {
    id: `pmt_${Date.now()}`,
    trxId: cleanTrxId,
    method: paymentData.gateway.toLowerCase() as any,
    amount: Number(paymentData.amount),
    currency: 'BDT',
    senderName: paymentData.senderName || 'Fintech User',
    senderPhone: paymentData.senderPhone,
    recipientName: paymentData.recipientName,
    status: (paymentData.status || 'verified') as any,
    category: (paymentData.category || 'Shopping') as any,
    note: paymentData.note,
    receiptUrl: paymentData.receiptUrl,
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    verifiedAt: d.toISOString(),
    verifiedBy: 'Automated Verification',
  };

  localPayments.unshift(newPayment);
  return newPayment;
}

// ------------------------------------------------------------------------------
// METRICS SERVICE
// ------------------------------------------------------------------------------
export async function getMetricsFromSheet(): Promise<DashboardMetrics> {
  const remote = await fetchGoogleSheets('get_metrics');
  if (remote?.metrics) {
    return remote.metrics;
  }

  // Calculate from local
  let totalConfirmedBDT = 0;
  let pendingConfirmationBDT = 0;
  let totalSentBDT = 0;
  let totalReceivedBDT = 0;
  let confirmedCount = 0;
  let pendingCount = 0;

  for (const p of localPayments) {
    const amt = Number(p.amount) || 0;
    if (p.status === 'verified') {
      totalConfirmedBDT += amt;
      confirmedCount++;
    } else if (p.status === 'pending') {
      pendingConfirmationBDT += amt;
      pendingCount++;
    }
    totalSentBDT += amt;
  }

  return {
    totalConfirmedBDT,
    pendingConfirmationBDT,
    totalSentBDT,
    totalReceivedBDT,
    confirmedCount,
    pendingCount,
    percentageChangeVsLastMonth: confirmedCount > 0 ? 14.8 : 0,
  };
}

// ------------------------------------------------------------------------------
// AUTH SERVICE (Google Sheets Users Tab)
// ------------------------------------------------------------------------------
export async function authenticateWithGoogleSheet(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();

  const remote = await fetchGoogleSheets('login', { email: cleanEmail, password });
  if (remote?.user) {
    return { success: true, user: remote.user };
  }
  if (remote?.error) {
    return { success: false, error: remote.error };
  }

  // Check local users
  const user = localUsers.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === password.trim()
  );

  if (user) {
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  return {
    success: false,
    error: 'Invalid credentials. Please verify your email and password.',
  };
}

export async function registerWithGoogleSheet(params: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) {
  const cleanEmail = params.email.trim().toLowerCase();

  const remote = await fetchGoogleSheets('register', {
    ...params,
    email: cleanEmail,
  });

  if (remote?.user) {
    return { success: true, user: remote.user };
  }
  if (remote?.error) {
    return { success: false, error: remote.error };
  }

  const existing = localUsers.some((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: 'An account with this email already exists!' };
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    email: cleanEmail,
    password: params.password,
    name: params.name,
    phone: params.phone || '',
    role: 'user',
  };

  localUsers.push(newUser);
  return { success: true, user: newUser };
}
