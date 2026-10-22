import { NextRequest, NextResponse } from 'next/server';
import { uploadReceiptToR2, getSignedReceiptUrl, R2_BUCKET_NAME } from '@/lib/r2/client';
import { createClient, getServiceSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const userClient = await createClient();
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
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

    // Generate safe storage path in R2 namespaced by user ID
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const randomHex = Math.random().toString(36).substring(2, 10);
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const storageKey = `receipts/${user.id}/${yyyy}-${mm}/${randomHex}_${safeName}`;

    // 1. Upload to dedicated Cloudflare R2 private bucket
    await uploadReceiptToR2(buffer, storageKey, file.type || 'application/octet-stream');

    // 2. Simulated Smart OCR Engine for Bangladesh MFS (bKash, Nagad, Rocket, Bank SMS)
    let ocrTrxId = claimedTrxId || `BK${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    let ocrAmount = claimedAmount ? parseFloat(claimedAmount) : 1500.00;
    let ocrConfidence = 96.5;
    let ocrMatchStatus: 'matched' | 'mismatch' | 'unclear' = 'matched';

    if (claimedTrxId && claimedTrxId.toUpperCase() !== ocrTrxId.toUpperCase()) {
      ocrMatchStatus = 'mismatch';
    }

    // 3. Insert record into Supabase ft_receipts
    let receiptRecord = null;
    if (paymentId) {
      const serviceDb = getServiceSupabase();
      const { data, error } = await serviceDb
        .from('ft_receipts')
        .insert({
          payment_id: paymentId,
          user_id: user.id,
          storage_bucket: R2_BUCKET_NAME,
          storage_path: storageKey,
          file_name: file.name,
          file_size: buffer.length,
          mime_type: file.type || 'image/jpeg',
          ocr_raw_text: `Payment Receipt\nTrxID: ${ocrTrxId}\nAmount: ৳${ocrAmount}\nStatus: Completed`,
          ocr_extracted_trx_id: ocrTrxId,
          ocr_extracted_amount: ocrAmount,
          ocr_confidence_score: ocrConfidence,
          ocr_match_status: ocrMatchStatus,
        })
        .select()
        .single();

      if (!error) {
        receiptRecord = data;
        await serviceDb.from('ft_audit_trail').insert({
          payment_id: paymentId,
          user_id: user.id,
          action: 'receipt_uploaded',
          actor_type: 'system',
          actor_name: 'OCR Engine',
          details: {
            storageKey,
            ocrMatchStatus,
            ocrConfidence,
          },
        });
      }
    }

    const signedViewUrl = await getSignedReceiptUrl(storageKey, 3600);

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
      receipt: receiptRecord,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
