-- ==============================================================================
-- BANGLADESH PAYMENT TRACKING & RECEIPT VERIFICATION PWA
-- MIGRATION: 001_initial_fintech_schema.sql
-- ISOLATED NAMESPACE: ft_* (Protected against collision with existing tables)
-- ==============================================================================

-- 1. Merchants / Senders Directory
CREATE TABLE IF NOT EXISTS public.ft_merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    trade_license TEXT,
    contact_phone TEXT,
    default_method TEXT DEFAULT 'bkash',
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Core Payments Ledger
CREATE TABLE IF NOT EXISTS public.ft_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.ft_merchants(id) ON DELETE SET NULL,
    trx_id TEXT NOT NULL UNIQUE,
    gateway TEXT NOT NULL CHECK (gateway IN ('bkash', 'nagad', 'rocket', 'upay', 'bank_transfer', 'cash')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'BDT',
    direction TEXT NOT NULL DEFAULT 'received' CHECK (direction IN ('sent', 'received')),
    sender_name TEXT,
    sender_phone TEXT,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'flagged')),
    category TEXT NOT NULL DEFAULT 'Shopping' CHECK (category IN ('Subscription', 'Income', 'Food & Drinks', 'Transport', 'Shopping', 'Bills & Utilities', 'Business', 'Other')),
    note TEXT,
    verified_at TIMESTAMPTZ,
    verified_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Payment Receipts & Cloudflare R2 Proof Storage
CREATE TABLE IF NOT EXISTS public.ft_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.ft_payments(id) ON DELETE CASCADE,
    storage_bucket TEXT NOT NULL DEFAULT 'fintech-receipts-secure',
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    ocr_raw_text TEXT,
    ocr_extracted_trx_id TEXT,
    ocr_extracted_amount NUMERIC(12, 2),
    ocr_confidence_score NUMERIC(5, 2),
    ocr_match_status TEXT DEFAULT 'pending' CHECK (ocr_match_status IN ('matched', 'mismatch', 'unclear', 'pending')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Audit Trail & Verification Logs
CREATE TABLE IF NOT EXISTS public.ft_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.ft_payments(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    actor_type TEXT NOT NULL DEFAULT 'system' CHECK (actor_type IN ('system', 'admin', 'merchant', 'webhook')),
    actor_name TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_ft_payments_trx_id ON public.ft_payments(trx_id);
CREATE INDEX IF NOT EXISTS idx_ft_payments_status ON public.ft_payments(status);
CREATE INDEX IF NOT EXISTS idx_ft_payments_created_at ON public.ft_payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ft_payments_gateway ON public.ft_payments(gateway);
CREATE INDEX IF NOT EXISTS idx_ft_receipts_payment_id ON public.ft_receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_ft_audit_trail_payment_id ON public.ft_audit_trail(payment_id);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.ft_merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ft_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ft_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ft_audit_trail ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: Allow read & insert for anon/authenticated clients, full bypass for service_role
DO $$
BEGIN
    -- ft_merchants policies
    DROP POLICY IF EXISTS "ft_merchants_select" ON public.ft_merchants;
    CREATE POLICY "ft_merchants_select" ON public.ft_merchants FOR SELECT USING (true);
    DROP POLICY IF EXISTS "ft_merchants_all_service" ON public.ft_merchants;
    CREATE POLICY "ft_merchants_all_service" ON public.ft_merchants FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- ft_payments policies
    DROP POLICY IF EXISTS "ft_payments_select" ON public.ft_payments;
    CREATE POLICY "ft_payments_select" ON public.ft_payments FOR SELECT USING (true);
    DROP POLICY IF EXISTS "ft_payments_insert" ON public.ft_payments;
    CREATE POLICY "ft_payments_insert" ON public.ft_payments FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "ft_payments_update" ON public.ft_payments;
    CREATE POLICY "ft_payments_update" ON public.ft_payments FOR UPDATE USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "ft_payments_all_service" ON public.ft_payments;
    CREATE POLICY "ft_payments_all_service" ON public.ft_payments FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- ft_receipts policies
    DROP POLICY IF EXISTS "ft_receipts_select" ON public.ft_receipts;
    CREATE POLICY "ft_receipts_select" ON public.ft_receipts FOR SELECT USING (true);
    DROP POLICY IF EXISTS "ft_receipts_insert" ON public.ft_receipts;
    CREATE POLICY "ft_receipts_insert" ON public.ft_receipts FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "ft_receipts_all_service" ON public.ft_receipts;
    CREATE POLICY "ft_receipts_all_service" ON public.ft_receipts FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- ft_audit_trail policies
    DROP POLICY IF EXISTS "ft_audit_trail_select" ON public.ft_audit_trail;
    CREATE POLICY "ft_audit_trail_select" ON public.ft_audit_trail FOR SELECT USING (true);
    DROP POLICY IF EXISTS "ft_audit_trail_insert" ON public.ft_audit_trail;
    CREATE POLICY "ft_audit_trail_insert" ON public.ft_audit_trail FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "ft_audit_trail_all_service" ON public.ft_audit_trail;
    CREATE POLICY "ft_audit_trail_all_service" ON public.ft_audit_trail FOR ALL TO service_role USING (true) WITH CHECK (true);
END $$;

-- 8. Add to Realtime Publication if publication exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.ft_payments;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.ft_receipts;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Ignore if already added or permission constrained
    NULL;
END $$;
