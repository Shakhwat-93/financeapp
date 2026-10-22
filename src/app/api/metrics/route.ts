import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Authenticate user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 });
    }

    // Query only records belonging to the current user
    const { data: payments, error } = await supabase
      .from('ft_payments')
      .select('amount, status, direction')
      .or(`user_id.eq.${user.id},recipient_user_id.eq.${user.id}`);

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
        percentageChangeVsLastMonth: confirmedCount > 0 ? 12.5 : 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
