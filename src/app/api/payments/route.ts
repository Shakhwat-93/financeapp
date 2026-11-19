import { NextRequest, NextResponse } from 'next/server';
import { getPaymentsFromSheet, addPaymentToSheet } from '@/lib/sheets/googleSheets';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const gateway = searchParams.get('gateway') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const payments = await getPaymentsFromSheet(
      {
        status,
        gateway,
        search,
        limit,
      },
      user.email
    );

    return NextResponse.json({ payments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 });
    }

    const body = await request.json();
    const {
      trxId,
      gateway,
      amount,
      recipientName,
      senderName,
      senderPhone,
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

    const payment = await addPaymentToSheet(
      {
        trxId,
        gateway,
        amount: parseFloat(amount),
        recipientName,
        senderName: senderName || user.name || user.email.split('@')[0],
        senderPhone: senderPhone || user.phone,
        recipientPhone,
        category,
        note,
        status,
      },
      user.email
    );

    return NextResponse.json({ payment, success: true }, { status: 201 });
  } catch (err: any) {
    const isDuplicate = err.message && err.message.includes('already exists');
    return NextResponse.json(
      { error: err.message },
      { status: isDuplicate ? 409 : 500 }
    );
  }
}
