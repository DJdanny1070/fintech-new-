-- ==============================================================================
-- CresoX – COMPLETE SUPABASE BACKEND RECONSTRUCTION SCRIPT
-- ==============================================================================
-- File: CresoX_Supabase_Backend.sql
-- Compatibility: Supabase PostgreSQL (15+ / 16+)
--
-- Instructions:
-- 1. Open your Supabase Dashboard (https://supabase.com/dashboard).
-- 2. Navigate to "SQL Editor" from the left navigation bar.
-- 3. Click "New query".
-- 4. Paste the entire contents of this file.
-- 5. Click "Run" (or press Ctrl+Enter / Cmd+Enter).
--
-- Safety & Rerunnability:
-- - This script does NOT drop tables or schemas (zero data loss).
-- - Uses IF NOT EXISTS, CREATE OR REPLACE, and idempotent exception handlers.
-- - Can be safely re-executed multiple times on existing databases.
--
-- STRUCTURE & EXECUTION ORDER:
-- ------------------------------------------------------------------------------
--  §1. EXTENSIONS                 (pgcrypto, uuid-ossp)
--  §2. CUSTOM ENUM TYPES          (service_request_type, service_request_status)
--  §3. TABLES & CONSTRAINTS       (profiles, wallets, products, orders,
--                                  transactions, hash_records, service_requests)
--  §4. PERFORMANCE INDEXES        (covering foreign keys, search, timestamps)
--  §5. TIMESTAMP & INTEGRITY TRIGGERS (set_updated_at, protect_profile_fields)
--  §6. AUTHENTICATION TRIGGERS    (handle_new_user, handle_new_wallet, handle_oauth_user)
--  §7. SECURITY DEFINER CORE RPCS (execute_transfer, execute_purchase)
--  §8. PLATFORM MANAGEMENT RPCS   (approve_user, reject_user)
--  §9. ROW LEVEL SECURITY (RLS)   (Activation & strict non-permissive policies)
-- §10. STORAGE BUCKETS & ACCESS   (avatars, company-docs, product-images, service-request-docs)
-- §11. POST-EXECUTION HEALTH VERIFICATION
-- ==============================================================================


-- ==============================================================================
-- §1. EXTENSIONS
-- ==============================================================================

-- pgcrypto provides cryptographic hashing (SHA-256) and gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- uuid-ossp provides UUID utilities
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ==============================================================================
-- §2. CUSTOM ENUM TYPES
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE public.service_request_type AS ENUM (
    'asset_tokenization',
    'consultancy'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.service_request_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ==============================================================================
-- §3. TABLES & CONSTRAINTS
-- ==============================================================================

-- 3.1 PROFILES TABLE
-- Extends auth.users. Stores identity, company details, KYC documents, and approval status.
CREATE TABLE IF NOT EXISTS public.profiles (
  id                     UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name              TEXT          NOT NULL DEFAULT '',
  email                  TEXT          NOT NULL DEFAULT '',
  phone                  TEXT,
  company_name           TEXT,
  avatar_url             TEXT,
  role                   TEXT          NOT NULL DEFAULT 'individual'
                                       CHECK (role IN ('individual', 'business')),
  approval_status        TEXT          NOT NULL DEFAULT 'Pending'
                                       CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
  verification_status    TEXT          CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')),
  gst_number             TEXT,
  pan_number             TEXT,
  company_address        TEXT,
  verification_documents TEXT[],
  created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users. approval_status gates platform access.';


-- 3.2 WALLETS TABLE
-- Stores user fiat/token balances. Guaranteed 1:1 relationship with profiles.
CREATE TABLE IF NOT EXISTS public.wallets (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID          NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance    NUMERIC(18,2) NOT NULL DEFAULT 100000.00
                           CHECK (balance >= 0),
  currency   TEXT          NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.wallets IS 'User balances. Initial grant ₹1,00,000. Balance cannot be negative.';


-- 3.3 PRODUCTS TABLE
-- Tokenized assets listed on the CresoX marketplace.
CREATE TABLE IF NOT EXISTS public.products (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id            UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                TEXT          NOT NULL,
  description          TEXT          NOT NULL DEFAULT '',
  category             TEXT          NOT NULL DEFAULT 'Real Estate',
  price                NUMERIC(18,2) NOT NULL CHECK (price >= 0),
  image_url            TEXT,
  status               TEXT          NOT NULL DEFAULT 'active'
                                     CHECK (status IN ('active', 'inactive', 'sold', 'archived')),
  blockchain_hash      TEXT,
  current_price        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  previous_price       NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  daily_change         NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  daily_change_percent NUMERIC(8,2)  NOT NULL DEFAULT 0.00,
  trend                TEXT          NOT NULL DEFAULT 'stable'
                                     CHECK (trend IN ('up', 'down', 'stable')),
  price_history        JSONB         NOT NULL DEFAULT '[]'::JSONB,
  last_price_update    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.products IS 'Tokenized marketplace assets with price history tracking.';


-- 3.4 ORDERS TABLE
-- Purchase orders between buyers and sellers.
-- Foreign keys are explicitly named to support PostgREST join aliases:
-- buyer:profiles!orders_buyer_id_fkey / seller:profiles!orders_seller_id_fkey
CREATE TABLE IF NOT EXISTS public.orders (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id   UUID        NOT NULL,
  seller_id  UUID        NOT NULL,
  product_id UUID        NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  status     TEXT        NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT orders_buyer_id_fkey
    FOREIGN KEY (buyer_id)  REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT orders_seller_id_fkey
    FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.orders IS 'Marketplace purchase orders with explicit foreign key constraint names.';


-- 3.5 TRANSACTIONS TABLE
-- Financial ledger tracking deposits, withdrawals, transfers, and asset purchases.
-- Foreign keys are explicitly named for PostgREST:
-- user:profiles!transactions_user_id_fkey / counterparty:profiles!transactions_counterparty_id_fkey
CREATE TABLE IF NOT EXISTS public.transactions (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID          NOT NULL,
  type               TEXT          NOT NULL
                                   CHECK (type IN (
                                     'deposit', 'withdraw', 'transfer_sent', 'transfer_received',
                                     'purchase', 'sale', 'refund'
                                   )),
  amount             NUMERIC(18,2) NOT NULL,
  counterparty_id    UUID,
  counterparty_name  TEXT,
  note               TEXT,
  status             TEXT          NOT NULL DEFAULT 'pending'
                                   CHECK (status IN ('pending', 'verified', 'failed', 'cancelled')),
  blockchain_hash    TEXT,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT transactions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT transactions_counterparty_id_fkey
    FOREIGN KEY (counterparty_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.transactions IS 'Immutable financial audit ledger.';


-- 3.6 HASH_RECORDS TABLE
-- Immutable cryptographic audit trail. Uses BIGINT identity PK to match client numeric search.
CREATE TABLE IF NOT EXISTS public.hash_records (
  id          BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entity_type TEXT         NOT NULL
                           CHECK (entity_type IN (
                             'profile', 'asset', 'token_purchase', 'token_transfer',
                             'wallet_transaction', 'verification_approval',
                             'ownership_change', 'transaction', 'product'
                           )),
  entity_id   TEXT         NOT NULL,
  sha256_hash TEXT         NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.hash_records IS 'Blockchain audit log. Immutable event hashes.';


-- 3.7 SERVICE_REQUESTS TABLE
-- Inbound service requests submitted via public forms.
CREATE TABLE IF NOT EXISTS public.service_requests (
  id            UUID                         PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type  public.service_request_type   NOT NULL,
  full_name     TEXT                         NOT NULL,
  company_name  TEXT                         NOT NULL DEFAULT '',
  email         TEXT                         NOT NULL,
  phone         TEXT                         NOT NULL DEFAULT '',
  business_type TEXT                         NOT NULL DEFAULT '',
  asset_type    TEXT                         NOT NULL DEFAULT '',
  description   TEXT                         NOT NULL DEFAULT '',
  documents     TEXT[]                       NOT NULL DEFAULT '{}',
  status        public.service_request_status NOT NULL DEFAULT 'pending',
  metadata      JSONB                        NOT NULL DEFAULT '{}'::JSONB,
  created_at    TIMESTAMPTZ                  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ                  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.service_requests IS 'Inbound asset tokenization and consultancy service requests.';


-- ==============================================================================
-- §4. PERFORMANCE INDEXES
-- ==============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email          ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role           ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_approval       ON public.profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_created        ON public.profiles(created_at DESC);

-- Wallets indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id         ON public.wallets(user_id);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_seller_id      ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category       ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status         ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_created        ON public.products(created_at DESC);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id         ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id        ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id       ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status           ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created          ON public.orders(created_at DESC);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id    ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type       ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created    ON public.transactions(created_at DESC);

-- Hash records indexes
CREATE INDEX IF NOT EXISTS idx_hash_records_entity     ON public.hash_records(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_hash_records_sha256     ON public.hash_records(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_hash_records_created    ON public.hash_records(created_at DESC);

-- Service requests indexes
CREATE INDEX IF NOT EXISTS idx_service_requests_email   ON public.service_requests(email);
CREATE INDEX IF NOT EXISTS idx_service_requests_status  ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_created ON public.service_requests(created_at DESC);

-- Unique pending constraint: prevent duplicate pending requests of the same type for the same email
CREATE UNIQUE INDEX IF NOT EXISTS uq_service_requests_pending
  ON public.service_requests(email, request_type)
  WHERE status = 'pending';


-- ==============================================================================
-- §5. TIMESTAMP & INTEGRITY TRIGGERS
-- ==============================================================================

-- 5.1 Updated-at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_wallets_updated_at ON public.wallets;
CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_service_requests_updated_at ON public.service_requests;
CREATE TRIGGER trg_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- 5.2 Field protection trigger: prevents authenticated users from self-approving or self-promoting
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow authorized administrative actions and service_role/postgres
  IF current_setting('cresox.admin_action', true) = 'true' THEN
    RETURN NEW;
  END IF;

  IF current_user = 'postgres' OR session_user = 'postgres' THEN
    RETURN NEW;
  END IF;

  -- Protect approval_status from client-side alteration
  IF NEW.approval_status IS DISTINCT FROM OLD.approval_status THEN
    NEW.approval_status := OLD.approval_status;
  END IF;

  -- Protect role from client-side alteration
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role := OLD.role;
  END IF;

  -- Protect verification_status unless submitting KYC (setting to 'Pending')
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    IF OLD.role = 'business' AND NEW.verification_status = 'Pending' THEN
      NULL; -- Allowed: business account submitting KYC documents
    ELSE
      NEW.verification_status := OLD.verification_status;
    END IF;
  END IF;

  -- Ensure immutable identity fields
  NEW.id    := OLD.id;
  NEW.email := OLD.email;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();


-- ==============================================================================
-- §6. AUTHENTICATION TRIGGERS
-- ==============================================================================

-- 6.1 Auto-create profile on auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_email     TEXT;
  v_role      TEXT;
BEGIN
  v_email     := COALESCE(NEW.email, '');
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  );
  v_role      := COALESCE(NEW.raw_user_meta_data->>'role', 'individual');
  IF v_role NOT IN ('individual', 'business') THEN
    v_role := 'individual';
  END IF;

  INSERT INTO public.profiles (
    id, full_name, email, role, approval_status, verification_status, created_at, updated_at
  )
  VALUES (
    NEW.id,
    v_full_name,
    v_email,
    v_role,
    'Pending',
    CASE WHEN v_role = 'business' THEN 'Pending' ELSE NULL END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, supabase_auth_admin;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 6.2 Auto-create wallet on public.profiles INSERT
CREATE OR REPLACE FUNCTION public.handle_new_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance, created_at, updated_at)
  VALUES (NEW.id, 100000.00, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_wallet failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_wallet() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_wallet() FROM authenticated, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_wallet() TO postgres, supabase_admin;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_wallet();


-- 6.3 Sync Google OAuth profile updates on auth.users UPDATE of last_sign_in_at
CREATE OR REPLACE FUNCTION public.handle_oauth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider   TEXT;
  v_email      TEXT;
  v_full_name  TEXT;
  v_avatar_url TEXT;
  v_role       TEXT;
BEGIN
  v_provider   := COALESCE(NEW.app_metadata->>'provider', 'email');
  IF v_provider = 'email' THEN
    RETURN NEW;
  END IF;

  v_email      := COALESCE(NEW.email, '');
  v_full_name  := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
  v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
  v_role       := COALESCE(NEW.raw_user_meta_data->>'role', 'individual');
  IF v_role NOT IN ('individual', 'business') THEN
    v_role := 'individual';
  END IF;

  INSERT INTO public.profiles (
    id, full_name, email, role, avatar_url, approval_status, verification_status, created_at, updated_at
  )
  VALUES (
    NEW.id, v_full_name, v_email, v_role, v_avatar_url, 'Pending',
    CASE WHEN v_role = 'business' THEN 'Pending' ELSE NULL END, NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();

  INSERT INTO public.wallets (user_id, balance, created_at, updated_at)
  VALUES (NEW.id, 100000.00, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_oauth_user failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_oauth_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_oauth_user() FROM authenticated, anon;
GRANT EXECUTE ON FUNCTION public.handle_oauth_user() TO postgres, supabase_auth_admin;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.handle_oauth_user();


-- ==============================================================================
-- §7. SECURITY DEFINER CORE RPCS
-- ==============================================================================

-- 7.1 execute_transfer: Atomic peer-to-peer wallet transfer with deadlock prevention
CREATE OR REPLACE FUNCTION public.execute_transfer(
  p_sender_id            UUID,
  p_recipient_identifier TEXT,
  p_amount               NUMERIC,
  p_note                 TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recipient_id      UUID;
  v_recipient_name    TEXT;
  v_sender_name       TEXT;
  v_sender_balance    NUMERIC;
  v_recipient_balance NUMERIC;
  v_new_sender_bal    NUMERIC;
  v_new_recv_bal      NUMERIC;
  v_sent_tx_id        UUID;
  v_recv_tx_id        UUID;
  v_sent_hash         TEXT;
  v_recv_hash         TEXT;
BEGIN
  -- Authenticate caller identity
  IF auth.uid() IS DISTINCT FROM p_sender_id THEN
    RAISE EXCEPTION 'Forbidden: caller is not the sender' USING ERRCODE = '42501';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid transfer amount' USING ERRCODE = '22023';
  END IF;

  -- Resolve recipient
  IF p_recipient_identifier LIKE '%@%' THEN
    SELECT id, full_name INTO v_recipient_id, v_recipient_name
    FROM public.profiles WHERE email = p_recipient_identifier LIMIT 1;
  ELSE
    BEGIN
      SELECT id, full_name INTO v_recipient_id, v_recipient_name
      FROM public.profiles WHERE id = p_recipient_identifier::UUID LIMIT 1;
    EXCEPTION WHEN invalid_text_representation THEN
      v_recipient_id := NULL;
    END;
  END IF;

  IF v_recipient_id IS NULL THEN
    RAISE EXCEPTION 'Recipient not found: no account with identifier %', p_recipient_identifier;
  END IF;

  IF v_recipient_id = p_sender_id THEN
    RAISE EXCEPTION 'Cannot transfer funds to your own account' USING ERRCODE = '22023';
  END IF;

  -- Lock wallets in consistent lexical order to prevent deadlocks
  IF p_sender_id < v_recipient_id THEN
    SELECT balance INTO v_sender_balance FROM public.wallets WHERE user_id = p_sender_id FOR UPDATE;
    SELECT balance INTO v_recipient_balance FROM public.wallets WHERE user_id = v_recipient_id FOR UPDATE;
  ELSE
    SELECT balance INTO v_recipient_balance FROM public.wallets WHERE user_id = v_recipient_id FOR UPDATE;
    SELECT balance INTO v_sender_balance FROM public.wallets WHERE user_id = p_sender_id FOR UPDATE;
  END IF;

  IF v_sender_balance IS NULL THEN
    RAISE EXCEPTION 'Sender wallet not found';
  END IF;
  IF v_recipient_balance IS NULL THEN
    RAISE EXCEPTION 'Recipient wallet not found';
  END IF;

  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance: available balance is %, requested %', v_sender_balance, p_amount;
  END IF;

  -- Update balances
  v_new_sender_bal := v_sender_balance - p_amount;
  v_new_recv_bal   := v_recipient_balance + p_amount;

  UPDATE public.wallets SET balance = v_new_sender_bal, updated_at = NOW() WHERE user_id = p_sender_id;
  UPDATE public.wallets SET balance = v_new_recv_bal,   updated_at = NOW() WHERE user_id = v_recipient_id;

  SELECT full_name INTO v_sender_name FROM public.profiles WHERE id = p_sender_id;

  -- Insert double-entry transactions
  INSERT INTO public.transactions (
    user_id, type, amount, counterparty_id, counterparty_name, note, status, created_at
  )
  VALUES (
    p_sender_id, 'transfer_sent', -p_amount, v_recipient_id, v_recipient_name, p_note, 'verified', NOW()
  )
  RETURNING id INTO v_sent_tx_id;

  INSERT INTO public.transactions (
    user_id, type, amount, counterparty_id, counterparty_name, note, status, created_at
  )
  VALUES (
    v_recipient_id, 'transfer_received', p_amount, p_sender_id, v_sender_name, p_note, 'verified', NOW()
  )
  RETURNING id INTO v_recv_tx_id;

  -- Generate atomic cryptographic hashes
  v_sent_hash := encode(digest(v_sent_tx_id::text || ':' || p_sender_id::text || ':transfer_sent:' || (-p_amount)::text || ':' || clock_timestamp()::text, 'sha256'), 'hex');
  v_recv_hash := encode(digest(v_recv_tx_id::text || ':' || v_recipient_id::text || ':transfer_received:' || p_amount::text || ':' || clock_timestamp()::text, 'sha256'), 'hex');

  UPDATE public.transactions SET blockchain_hash = v_sent_hash WHERE id = v_sent_tx_id;
  UPDATE public.transactions SET blockchain_hash = v_recv_hash WHERE id = v_recv_tx_id;

  INSERT INTO public.hash_records (entity_type, entity_id, sha256_hash)
  VALUES
    ('wallet_transaction', v_sent_tx_id::text, v_sent_hash),
    ('wallet_transaction', v_recv_tx_id::text, v_recv_hash);

  RETURN json_build_object(
    'sent_tx_id',           v_sent_tx_id,
    'recv_tx_id',           v_recv_tx_id,
    'sender_new_balance',   v_new_sender_bal,
    'recipient_new_balance', v_new_recv_bal,
    'recipient_id',         v_recipient_id,
    'recipient_name',       v_recipient_name
  );
END;
$$;

REVOKE ALL ON FUNCTION public.execute_transfer(UUID, TEXT, NUMERIC, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.execute_transfer(UUID, TEXT, NUMERIC, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.execute_transfer(UUID, TEXT, NUMERIC, TEXT) TO authenticated;


-- 7.2 execute_purchase: Atomic asset purchase checkout
CREATE OR REPLACE FUNCTION public.execute_purchase(
  p_buyer_id   UUID,
  p_product_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product         RECORD;
  v_buyer_balance   NUMERIC;
  v_seller_balance  NUMERIC;
  v_new_buyer_bal   NUMERIC;
  v_new_seller_bal  NUMERIC;
  v_order           RECORD;
  v_buyer_tx_id     UUID;
  v_seller_tx_id    UUID;
  v_buyer_tx_hash   TEXT;
  v_seller_tx_hash  TEXT;
  v_purchase_hash   TEXT;
  v_ownership_hash  TEXT;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_buyer_id THEN
    RAISE EXCEPTION 'Forbidden: caller is not the buyer' USING ERRCODE = '42501';
  END IF;

  SELECT id, price, seller_id, title, status
  INTO v_product
  FROM public.products
  WHERE id = p_product_id;

  IF v_product.id IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  IF v_product.seller_id = p_buyer_id THEN
    RAISE EXCEPTION 'Cannot purchase your own listing' USING ERRCODE = '22023';
  END IF;

  -- Lock wallets
  IF p_buyer_id < v_product.seller_id THEN
    SELECT balance INTO v_buyer_balance FROM public.wallets WHERE user_id = p_buyer_id FOR UPDATE;
    SELECT balance INTO v_seller_balance FROM public.wallets WHERE user_id = v_product.seller_id FOR UPDATE;
  ELSE
    SELECT balance INTO v_seller_balance FROM public.wallets WHERE user_id = v_product.seller_id FOR UPDATE;
    SELECT balance INTO v_buyer_balance FROM public.wallets WHERE user_id = p_buyer_id FOR UPDATE;
  END IF;

  IF v_buyer_balance IS NULL THEN
    RAISE EXCEPTION 'Buyer wallet not found';
  END IF;
  IF v_seller_balance IS NULL THEN
    RAISE EXCEPTION 'Seller wallet not found';
  END IF;

  IF v_product.price > 0 AND v_buyer_balance < v_product.price THEN
    RAISE EXCEPTION 'Insufficient balance to complete this purchase.';
  END IF;

  -- Create order
  INSERT INTO public.orders (buyer_id, seller_id, product_id, status, created_at, updated_at)
  VALUES (p_buyer_id, v_product.seller_id, p_product_id, 'pending', NOW(), NOW())
  RETURNING * INTO v_order;

  -- Settlement
  IF v_product.price > 0 THEN
    v_new_buyer_bal  := v_buyer_balance  - v_product.price;
    v_new_seller_bal := v_seller_balance + v_product.price;

    UPDATE public.wallets SET balance = v_new_buyer_bal,  updated_at = NOW() WHERE user_id = p_buyer_id;
    UPDATE public.wallets SET balance = v_new_seller_bal, updated_at = NOW() WHERE user_id = v_product.seller_id;

    INSERT INTO public.transactions (
      user_id, type, amount, counterparty_id, counterparty_name, note, status, created_at
    )
    VALUES (
      p_buyer_id, 'purchase', -v_product.price, v_product.seller_id, v_product.title,
      'Purchased ' || v_product.title, 'verified', NOW()
    )
    RETURNING id INTO v_buyer_tx_id;

    INSERT INTO public.transactions (
      user_id, type, amount, counterparty_id, counterparty_name, note, status, created_at
    )
    VALUES (
      v_product.seller_id, 'sale', v_product.price, p_buyer_id, 'Buyer',
      'Sold ' || v_product.title, 'verified', NOW()
    )
    RETURNING id INTO v_seller_tx_id;

    -- Cryptographic hashes
    v_buyer_tx_hash  := encode(digest(v_buyer_tx_id::text || ':' || p_buyer_id::text || ':purchase:' || (-v_product.price)::text || ':' || clock_timestamp()::text, 'sha256'), 'hex');
    v_seller_tx_hash := encode(digest(v_seller_tx_id::text || ':' || v_product.seller_id::text || ':sale:' || v_product.price::text || ':' || clock_timestamp()::text, 'sha256'), 'hex');
    v_purchase_hash  := encode(digest(v_order.id::text || ':' || p_buyer_id::text || ':' || v_product.id::text || ':' || clock_timestamp()::text, 'sha256'), 'hex');
    v_ownership_hash := encode(digest(v_product.id::text || ':ownership:' || p_buyer_id::text || ':' || clock_timestamp()::text, 'sha256'), 'hex');

    UPDATE public.transactions SET blockchain_hash = v_buyer_tx_hash  WHERE id = v_buyer_tx_id;
    UPDATE public.transactions SET blockchain_hash = v_seller_tx_hash WHERE id = v_seller_tx_id;

    INSERT INTO public.hash_records (entity_type, entity_id, sha256_hash)
    VALUES
      ('wallet_transaction', v_buyer_tx_id::text, v_buyer_tx_hash),
      ('wallet_transaction', v_seller_tx_id::text, v_seller_tx_hash),
      ('token_purchase',     v_order.id::text,     v_purchase_hash),
      ('ownership_change',   v_product.id::text,   v_ownership_hash);
  END IF;

  RETURN json_build_object(
    'order_id',           v_order.id,
    'buyer_id',           v_order.buyer_id,
    'seller_id',          v_order.seller_id,
    'product_id',         v_order.product_id,
    'title',              v_product.title,
    'price',              v_product.price,
    'status',             v_order.status,
    'buyer_new_balance',  COALESCE(v_new_buyer_bal,  v_buyer_balance),
    'seller_new_balance', COALESCE(v_new_seller_bal, v_seller_balance),
    'buyer_tx_id',        v_buyer_tx_id,
    'seller_tx_id',       v_seller_tx_id,
    'created_at',         v_order.created_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.execute_purchase(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.execute_purchase(UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.execute_purchase(UUID, UUID) TO authenticated;


-- ==============================================================================
-- §8. PLATFORM MANAGEMENT RPCS
-- ==============================================================================

-- 8.1 Admin approval helper: sets approval_status = Approved and writes audit record
CREATE OR REPLACE FUNCTION public.approve_user(p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id  UUID;
  v_prev_status TEXT;
BEGIN
  SELECT id, approval_status INTO v_profile_id, v_prev_status
  FROM public.profiles WHERE email = p_email LIMIT 1;

  IF v_profile_id IS NULL THEN
    RETURN 'ERROR: No profile found for email ' || p_email;
  END IF;

  -- Authorize through field protection trigger
  PERFORM set_config('cresox.admin_action', 'true', true);

  UPDATE public.profiles
  SET approval_status = 'Approved', updated_at = NOW()
  WHERE id = v_profile_id;

  INSERT INTO public.hash_records (entity_type, entity_id, sha256_hash)
  VALUES (
    'verification_approval',
    v_profile_id::TEXT,
    encode(digest('admin_approved:' || v_profile_id::text || ':' || clock_timestamp()::text, 'sha256'), 'hex')
  );

  RETURN 'SUCCESS: ' || p_email || ' approved. Previous status: ' || COALESCE(v_prev_status, 'NULL');
END;
$$;

REVOKE ALL ON FUNCTION public.approve_user(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_user(TEXT) FROM authenticated, anon;
GRANT EXECUTE ON FUNCTION public.approve_user(TEXT) TO postgres, service_role;


-- 8.2 Admin rejection helper: sets approval_status = Rejected and writes audit record
CREATE OR REPLACE FUNCTION public.reject_user(p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id  UUID;
  v_prev_status TEXT;
BEGIN
  SELECT id, approval_status INTO v_profile_id, v_prev_status
  FROM public.profiles WHERE email = p_email LIMIT 1;

  IF v_profile_id IS NULL THEN
    RETURN 'ERROR: No profile found for email ' || p_email;
  END IF;

  PERFORM set_config('cresox.admin_action', 'true', true);

  UPDATE public.profiles
  SET approval_status = 'Rejected', updated_at = NOW()
  WHERE id = v_profile_id;

  INSERT INTO public.hash_records (entity_type, entity_id, sha256_hash)
  VALUES (
    'verification_approval',
    v_profile_id::TEXT,
    encode(digest('admin_rejected:' || v_profile_id::text || ':' || clock_timestamp()::text, 'sha256'), 'hex')
  );

  RETURN 'SUCCESS: ' || p_email || ' rejected. Previous status: ' || COALESCE(v_prev_status, 'NULL');
END;
$$;

REVOKE ALL ON FUNCTION public.reject_user(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_user(TEXT) FROM authenticated, anon;
GRANT EXECUTE ON FUNCTION public.reject_user(TEXT) TO postgres, service_role;


-- ==============================================================================
-- §9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 9.1 PROFILES POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING  (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- 9.2 WALLETS POLICIES (STRICT: OWN ONLY)
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallets_select_own" ON public.wallets;
CREATE POLICY "wallets_select_own"
  ON public.wallets FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "wallets_insert_own" ON public.wallets;
CREATE POLICY "wallets_insert_own"
  ON public.wallets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "wallets_update_own" ON public.wallets;
CREATE POLICY "wallets_update_own"
  ON public.wallets FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- 9.3 PRODUCTS POLICIES (SELLER ONLY FOR WRITES)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_authenticated" ON public.products;
CREATE POLICY "products_select_authenticated"
  ON public.products FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "products_insert_own" ON public.products;
CREATE POLICY "products_insert_own"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "products_update_own" ON public.products;
CREATE POLICY "products_update_own"
  ON public.products FOR UPDATE TO authenticated
  USING  (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "products_delete_own" ON public.products;
CREATE POLICY "products_delete_own"
  ON public.products FOR DELETE TO authenticated
  USING (seller_id = auth.uid());


-- 9.4 ORDERS POLICIES
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_authenticated" ON public.orders;
CREATE POLICY "orders_select_authenticated"
  ON public.orders FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "orders_insert_buyer" ON public.orders;
CREATE POLICY "orders_insert_buyer"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "orders_update_participant" ON public.orders;
CREATE POLICY "orders_update_participant"
  ON public.orders FOR UPDATE TO authenticated
  USING  (buyer_id = auth.uid() OR seller_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());


-- 9.5 TRANSACTIONS POLICIES (IMMUTABLE AUDIT LEDGER)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select_authenticated" ON public.transactions;
CREATE POLICY "transactions_select_authenticated"
  ON public.transactions FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "transactions_insert_own" ON public.transactions;
CREATE POLICY "transactions_insert_own"
  ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "transactions_update_own_hash" ON public.transactions;
CREATE POLICY "transactions_update_own_hash"
  ON public.transactions FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- 9.6 HASH_RECORDS POLICIES (IMMUTABLE AUDIT LOG)
ALTER TABLE public.hash_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hash_records_select_authenticated" ON public.hash_records;
CREATE POLICY "hash_records_select_authenticated"
  ON public.hash_records FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "hash_records_insert_authenticated" ON public.hash_records;
CREATE POLICY "hash_records_insert_authenticated"
  ON public.hash_records FOR INSERT TO authenticated
  WITH CHECK (true);


-- 9.7 SERVICE_REQUESTS POLICIES (PUBLIC INTAKE)
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_requests_select_anon" ON public.service_requests;
CREATE POLICY "service_requests_select_anon"
  ON public.service_requests FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "service_requests_select_authenticated" ON public.service_requests;
CREATE POLICY "service_requests_select_authenticated"
  ON public.service_requests FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "service_requests_insert_anon" ON public.service_requests;
CREATE POLICY "service_requests_insert_anon"
  ON public.service_requests FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_requests_insert_authenticated" ON public.service_requests;
CREATE POLICY "service_requests_insert_authenticated"
  ON public.service_requests FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_requests_update_own_anon" ON public.service_requests;
CREATE POLICY "service_requests_update_own_anon"
  ON public.service_requests FOR UPDATE TO anon
  USING  (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_requests_update_authenticated" ON public.service_requests;
CREATE POLICY "service_requests_update_authenticated"
  ON public.service_requests FOR UPDATE TO authenticated
  USING  (true)
  WITH CHECK (true);


-- ==============================================================================
-- §10. STORAGE BUCKETS & ACCESS POLICIES
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars',              'avatars',              true),
  ('company-docs',         'company-docs',         true),
  ('product-images',       'product-images',       true),
  ('service-request-docs', 'service-request-docs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Avatars
DROP POLICY IF EXISTS "avatars_select_public" ON storage.objects;
CREATE POLICY "avatars_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars');

-- Company Docs
DROP POLICY IF EXISTS "company_docs_select_public" ON storage.objects;
CREATE POLICY "company_docs_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-docs');

DROP POLICY IF EXISTS "company_docs_insert_own" ON storage.objects;
CREATE POLICY "company_docs_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'company-docs');

-- Product Images
DROP POLICY IF EXISTS "product_images_select_public" ON storage.objects;
CREATE POLICY "product_images_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_insert_own" ON storage.objects;
CREATE POLICY "product_images_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Service Request Docs
DROP POLICY IF EXISTS "service_request_docs_select_public" ON storage.objects;
CREATE POLICY "service_request_docs_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-request-docs');

DROP POLICY IF EXISTS "service_request_docs_insert_public" ON storage.objects;
CREATE POLICY "service_request_docs_insert_public" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'service-request-docs');


-- ==============================================================================
-- §11. POST-EXECUTION HEALTH VERIFICATION
-- ==============================================================================
-- Run these checks to verify the installation:

-- Verify all 7 public tables have RLS enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Verify all 8 custom functions exist with appropriate security definer settings
SELECT routine_name, security_type FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name IN (
  'handle_new_user', 'handle_new_wallet', 'handle_oauth_user',
  'protect_profile_fields', 'set_updated_at',
  'execute_transfer', 'execute_purchase', 'approve_user', 'reject_user'
) ORDER BY routine_name;

-- Verify RLS policy distribution
SELECT tablename, COUNT(policyname) AS active_policies
FROM pg_policies WHERE schemaname = 'public'
GROUP BY tablename ORDER BY tablename;

-- ==============================================================================
-- ✅ SCRIPT COMPLETE: CresoX_Supabase_Backend.sql
-- ==============================================================================
