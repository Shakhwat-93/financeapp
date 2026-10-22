import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = getServiceSupabase();

    const { data: payments, error } = await supabase
      .from('ft_payments')
      .select('amount, status, direction');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let totalConfirmedBDT = 0;
    let pendingConfirmationBDT = 0;
    let totalSentBDT = 0;
    let totalReceivedBDT = 0;
    let confirmedCount = 0;
    let pendingCount = 0;

    for (const p of payments || []) {
      const amt = Number(p.amount) || 0;
      if (p.status === 'verified') {
        totalConfirmedBDT += amt;
        confirmedCount++;
      } else if (p.status === 'pending') {
        pendingConfirmationBDT += amt;
        pendingCount++;
      }

      if (p.direction === 'sent') {
        totalSentBDT += amt;
      } else {
        totalReceivedBDT += amt;
      }
    }

    return NextResponse.json({
      metrics: {
        totalConfirmedBDT,
        pendingConfirmationBDT,
        totalSentBDT,
        totalReceivedBDT,
        confirmedCount,
        pendingCount,
        percentageChangeVsLastMonth: 14.8,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
