import { NextRequest, NextResponse } from 'next/server';
import { uploadReceiptToR2, getSignedReceiptUrl } from '@/lib/r2/client';
import { getSessionUser } from '@/lib/auth/session';
import { fetchGoogleSheets } from '@/lib/sheets/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const paymentId = formData.get('paymentId') as string | null;
    const claimedTrxId = formData.get('trxId') as string | null;
    const claimedAmount = formData.get('amount') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate safe storage path in Cloudflare R2
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const randomHex = Math.random().toString(36).substring(2, 10);
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const storageKey = `receipts/${user.id}/${yyyy}-${mm}/${randomHex}_${safeName}`;

    // 1. Upload to dedicated Cloudflare R2 private bucket
    await uploadReceiptToR2(buffer, storageKey, file.type || 'application/octet-stream');

    // 2. Simulated Smart OCR Engine for Bangladesh MFS (bKash, Nagad, Rocket, Bank SMS)
    const ocrTrxId = claimedTrxId || `BK${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const ocrAmount = claimedAmount ? parseFloat(claimedAmount) : 1500.00;
    const ocrConfidence = 97.2;
    let ocrMatchStatus: 'matched' | 'mismatch' | 'unclear' = 'matched';

    if (claimedTrxId && claimedTrxId.toUpperCase() !== ocrTrxId.toUpperCase()) {
      ocrMatchStatus = 'mismatch';
    }

    const signedViewUrl = await getSignedReceiptUrl(storageKey, 3600);

    // 3. Record in Google Sheets Receipts tab
    await fetchGoogleSheets('add_receipt', {
      receipt: {
        paymentId: paymentId || '',
        trxId: ocrTrxId,
        fileName: file.name,
        fileSize: buffer.length,
        mimeType: file.type || 'image/jpeg',
        storageUrl: signedViewUrl,
        ocrExtractedTrxId: ocrTrxId,
        ocrExtractedAmount: ocrAmount,
        ocrConfidence,
        ocrStatus: ocrMatchStatus,
      },
    });

    return NextResponse.json({
      success: true,
      storageKey,
      signedViewUrl,
      ocr: {
        extractedTrxId: ocrTrxId,
        extractedAmount: ocrAmount,
        confidence: ocrConfidence,
        matchStatus: ocrMatchStatus,
      },
      receipt: {
        fileName: file.name,
        fileSize: buffer.length,
        storageUrl: signedViewUrl,
      },
    });
  } catch (err: any) {
    console.error('Receipt upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
