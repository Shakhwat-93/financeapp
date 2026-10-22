import { NextRequest, NextResponse } from 'next/server';
import { createClient, getServiceSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const gateway = searchParams.get('gateway');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Query ft_payments strictly isolated to this user (or where user is recipient)
    let query = supabase
      .from('ft_payments')
      .select('*, ft_receipts(*)')
      .or(`user_id.eq.${user.id},recipient_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (gateway) {
      query = query.eq('gateway', gateway);
    }

    if (search) {
      query = query.or(`trx_id.ilike.%${search}%,sender_name.ilike.%${search}%,recipient_name.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payments: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 });
    }

    const body = await request.json();

    const {
      trxId,
      gateway,
      amount,
      direction = 'sent',
      senderName,
      senderPhone,
      recipientName,
      recipientPhone,
      category = 'Shopping',
      note,
      status = 'verified',
    } = body;

    if (!trxId || !gateway || !amount || !recipientName) {
      return NextResponse.json(
        { error: 'Missing required payment fields: trxId, gateway, amount, recipientName' },
        { status: 400 }
      );
    }

    // Check for duplicate TrxID across ledger
    const serviceDb = getServiceSupabase();
    const { data: existing } = await serviceDb
      .from('ft_payments')
      .select('id, trx_id')
      .eq('trx_id', trxId.trim().toUpperCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: `Payment with TrxID ${trxId.trim().toUpperCase()} already exists in the ledger!` },
        { status: 409 }
      );
    }

    // Insert new payment strictly bound to authenticated user
    const { data: payment, error: insertError } = await supabase
      .from('ft_payments')
      .insert({
        user_id: user.id,
        trx_id: trxId.trim().toUpperCase(),
        gateway,
        amount: parseFloat(amount),
        currency: 'BDT',
        direction,
        sender_name: senderName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        sender_phone: senderPhone || null,
        recipient_name: recipientName,
        recipient_phone: recipientPhone || null,
        category,
        note: note || null,
        status,
        verified_at: status === 'verified' ? new Date().toISOString() : null,
        verified_by: status === 'verified' ? 'Automated Verification' : null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Record in Audit Trail bound to this user
    await serviceDb.from('ft_audit_trail').insert({
      payment_id: payment.id,
      user_id: user.id,
      action: 'payment_created',
      actor_type: 'merchant',
      actor_name: user.email || 'Authenticated User',
      details: {
        trx_id: payment.trx_id,
        amount: payment.amount,
        gateway: payment.gateway,
      },
    });

    return NextResponse.json({ payment, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
