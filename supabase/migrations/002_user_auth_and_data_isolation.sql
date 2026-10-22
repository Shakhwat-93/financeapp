-- ==============================================================================
-- BANGLADESH PAYMENT TRACKING & RECEIPT VERIFICATION PWA
-- MIGRATION: 002_user_auth_and_data_isolation.sql
-- PURPOSE: User Profiles, User-Level Data Isolation & Strict RLS Policies
-- ==============================================================================

-- 1. Create ft_profiles Table linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.ft_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'auditor')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Alter ft_payments, ft_receipts, ft_audit_trail to add user ownership columns
ALTER TABLE public.ft_payments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.ft_receipts 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.ft_audit_trail 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Indexes for rapid lookups and RLS evaluation
CREATE INDEX IF NOT EXISTS idx_ft_payments_user_id ON public.ft_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_ft_payments_recipient_user_id ON public.ft_payments(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_ft_profiles_email ON public.ft_profiles(email);
CREATE INDEX IF NOT EXISTS idx_ft_receipts_user_id ON public.ft_receipts(user_id);

-- 4. Admin Check Helper Function
CREATE OR REPLACE FUNCTION public.is_ft_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.ft_profiles 
    WHERE id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger for automated profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_ft_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ft_profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.ft_profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_ft ON auth.users;
CREATE TRIGGER on_auth_user_created_ft
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_ft_user();

-- 6. Enable RLS on ft_profiles
ALTER TABLE public.ft_profiles ENABLE ROW LEVEL SECURITY;

-- 7. Overhaul RLS Policies: Remove old open policies and enforce strict user isolation
DO $$
BEGIN
    -- Drop old policies on ft_profiles
    DROP POLICY IF EXISTS "ft_profiles_select_own" ON public.ft_profiles;
    DROP POLICY IF EXISTS "ft_profiles_update_own" ON public.ft_profiles;
    DROP POLICY IF EXISTS "ft_profiles_all_service" ON public.ft_profiles;

    -- Profiles Policies: Users see their own profile or admin sees all
    CREATE POLICY "ft_profiles_select_own" ON public.ft_profiles
      FOR SELECT USING (auth.uid() = id OR public.is_ft_admin(auth.uid()));

    CREATE POLICY "ft_profiles_update_own" ON public.ft_profiles
      FOR UPDATE USING (auth.uid() = id)
      WITH CHECK (
        auth.uid() = id AND 
        (role = (SELECT role FROM public.ft_profiles WHERE id = auth.uid()) OR public.is_ft_admin(auth.uid()))
      );

    CREATE POLICY "ft_profiles_all_service" ON public.ft_profiles
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- Drop old permissive policies on ft_payments
    DROP POLICY IF EXISTS "ft_payments_select" ON public.ft_payments;
    DROP POLICY IF EXISTS "ft_payments_insert" ON public.ft_payments;
    DROP POLICY IF EXISTS "ft_payments_update" ON public.ft_payments;
    DROP POLICY IF EXISTS "ft_payments_all_service" ON public.ft_payments;

    -- Strict Payments Policies: Only sender, recipient, or admin can read
    CREATE POLICY "ft_payments_select_isolated" ON public.ft_payments
      FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() = recipient_user_id OR 
        public.is_ft_admin(auth.uid())
      );

    -- Insert allowed only for the authenticated sender
    CREATE POLICY "ft_payments_insert_isolated" ON public.ft_payments
      FOR INSERT WITH CHECK (
        auth.uid() = user_id
      );

    -- Update allowed for creator, recipient (e.g. confirming receipt), or admin
    CREATE POLICY "ft_payments_update_isolated" ON public.ft_payments
      FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() = recipient_user_id OR 
        public.is_ft_admin(auth.uid())
      ) WITH CHECK (
        auth.uid() = user_id OR 
        auth.uid() = recipient_user_id OR 
        public.is_ft_admin(auth.uid())
      );

    -- Delete allowed only for creator or admin
    CREATE POLICY "ft_payments_delete_isolated" ON public.ft_payments
      FOR DELETE USING (
        auth.uid() = user_id OR 
        public.is_ft_admin(auth.uid())
      );

    CREATE POLICY "ft_payments_all_service" ON public.ft_payments
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- Drop old policies on ft_receipts
    DROP POLICY IF EXISTS "ft_receipts_select" ON public.ft_receipts;
    DROP POLICY IF EXISTS "ft_receipts_insert" ON public.ft_receipts;
    DROP POLICY IF EXISTS "ft_receipts_all_service" ON public.ft_receipts;

    -- Receipts isolated to payment owner or admin
    CREATE POLICY "ft_receipts_select_isolated" ON public.ft_receipts
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.ft_payments p
          WHERE p.id = ft_receipts.payment_id 
          AND (p.user_id = auth.uid() OR p.recipient_user_id = auth.uid() OR public.is_ft_admin(auth.uid()))
        )
      );

    CREATE POLICY "ft_receipts_insert_isolated" ON public.ft_receipts
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.ft_payments p
          WHERE p.id = ft_receipts.payment_id 
          AND (p.user_id = auth.uid() OR public.is_ft_admin(auth.uid()))
        )
      );

    CREATE POLICY "ft_receipts_all_service" ON public.ft_receipts
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- Drop old policies on ft_audit_trail
    DROP POLICY IF EXISTS "ft_audit_trail_select" ON public.ft_audit_trail;
    DROP POLICY IF EXISTS "ft_audit_trail_insert" ON public.ft_audit_trail;
    DROP POLICY IF EXISTS "ft_audit_trail_all_service" ON public.ft_audit_trail;

    CREATE POLICY "ft_audit_trail_select_isolated" ON public.ft_audit_trail
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.ft_payments p
          WHERE p.id = ft_audit_trail.payment_id 
          AND (p.user_id = auth.uid() OR p.recipient_user_id = auth.uid() OR public.is_ft_admin(auth.uid()))
        )
      );

    CREATE POLICY "ft_audit_trail_insert_auth" ON public.ft_audit_trail
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

    CREATE POLICY "ft_audit_trail_all_service" ON public.ft_audit_trail
      FOR ALL TO service_role USING (true) WITH CHECK (true);
END $$;
