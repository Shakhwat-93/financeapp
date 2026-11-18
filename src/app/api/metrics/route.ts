import { NextRequest, NextResponse } from 'next/server';
import { getMetricsFromSheet } from '@/lib/sheets/googleSheets';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 });
    }

    const metrics = await getMetricsFromSheet();
    return NextResponse.json({ metrics });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
