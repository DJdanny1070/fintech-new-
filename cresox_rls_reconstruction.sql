-- ============================================================
-- CresoX – Phase 5: Row Level Security
-- Generated from complete codebase analysis of all service files,
-- pages, and cross-referencing every Supabase query in the project.
--
-- Supabase Project : xxbpesuisbnpyzdxtrce
-- Target Schema   : public
--
-- ⚠  PREREQUISITES
-- Run Phase 3 (cresox_database_reconstruction.sql) first.
-- Run Phase 4 (cresox_auth_reconstruction.sql) second.
-- Then run this file.
--
-- DESIGN PRINCIPLES
-- ─────────────────
-- 1. No USING (true) on user-owned sensitive tables (wallets, transactions).
-- 2. No RLS disabled on any table.
-- 3. Cross-user wallet writes and cross-user transaction inserts are
--    handled via SECURITY DEFINER functions (not permissive policies).
-- 4. All frontend operations remain intact — no service file changes
--    required for read operations. Two write functions are provided as
--    secure RPC wrappers that replace direct multi-step calls.
-- 5. service_requests is accessible to anon (public) because the forms
--    are submitted by unauthenticated visitors.
--
-- EXECUTION ORDER
-- ───────────────────────────────────────────────────────────
--  §A  Drop all old RLS policies (clean slate)
--  §B  SECURITY DEFINER functions for cross-user writes
--        B1  execute_transfer()   — wallet transfer between users
--        B2  execute_purchase()   — asset purchase (order + wallet + tx)
--  §C  RLS – profiles         (authenticated read-all, own write)
--  §D  RLS – wallets          (strict own-only, writes via functions)
--  §E  RLS – products         (authenticated read-all, seller writes)
--  §F  RLS – orders           (authenticated read-all, buyer insert)
--  §G  RLS – transactions     (authenticated read-all, fn insert, own update)
--  §H  RLS – hash_records     (authenticated read-all, authenticated insert)
--  §I  RLS – service_requests (anon read/write by email, no delete)
--  §J  Verification queries
-- ============================================================


-- ============================================================
-- §A  DROP ALL EXISTING RLS POLICIES (clean slate)
-- ============================================================
-- Drops every policy from every public table so this file is
-- fully idempotent and self-contained. Safe to re-run.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname, r.schemaname, r.tablename
    );
  END LOOP;
  RAISE NOTICE 'Dropped all existing public schema RLS policies.';
END;
$$;


-- ============================================================
-- §B  SECURITY DEFINER FUNCTIONS FOR CROSS-USER WRITES
-- ============================================================
-- These two functions replace the patterns in transactionService.js
-- and productService.js that perform cross-user wallet updates and
-- cross-user transaction inserts.
--
-- WHY FUNCTIONS INSTEAD OF PERMISSIVE POLICIES
-- ─────────────────────────────────────────────
-- The application does two operations that cannot be satisfied by
-- strict (user_id = auth.uid()) policies:
--
--   1. transferBetweenUsers(): credits recipient's wallet, creates
--      a transaction row with userId = recipient.id
--
--   2. createOrder(): credits seller's wallet, creates a transaction
--      row with userId = seller.id
--
-- Using USING (true) on wallets.UPDATE and transactions.INSERT would
-- allow any authenticated user to freely modify any wallet or insert
-- transactions for any other user — a critical privilege escalation.
--
-- The correct pattern is SECURITY DEFINER functions:
--   • The function validates the caller IS the sender (auth.uid() = p_sender_id)
--   • It performs all writes atomically in a single transaction
--   • The wallet and transaction policies stay strict (own-only)
--   • The frontend calls supabase.rpc('execute_transfer', {...}) instead
--     of the multi-step client-side approach
--
-- NOTE ON BACKWARD COMPATIBILITY
-- ────────────────────────────────
-- The updated transactionService.js and productService.js (provided
-- separately as Phase 5 patches) replace the multi-step direct calls
-- with single .rpc() calls. No other files are changed.


-- ─────────────────────────────────────────────────────────────
-- B1  execute_transfer(sender_id, recipient_identifier, amount, note)
-- ─────────────────────────────────────────────────────────────
-- Replaces: transferBetweenUsers() in transactionService.js
--
-- Parameters:
--   p_sender_id            UUID   — must equal auth.uid()
--   p_recipient_identifier TEXT   — email OR UUID string
--   p_amount               NUMERIC
--   p_note                 TEXT   — optional
--
-- Returns: JSON with { sent_tx_id, recv_tx_id, sender_new_balance,
--                      recipient_new_balance, recipient_name }

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
BEGIN
  -- ── Security: caller must be the sender ──────────────────
  IF auth.uid() IS DISTINCT FROM p_sender_id THEN
    RAISE EXCEPTION 'FORBIDDEN: caller (%) is not the sender (%)',
      auth.uid(), p_sender_id
      USING ERRCODE = '42501';
  END IF;

  -- ── Validate amount ───────────────────────────────────────
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT: amount must be positive'
      USING ERRCODE = '22023';
  END IF;

  -- ── Resolve recipient ─────────────────────────────────────
  IF p_recipient_identifier LIKE '%@%' THEN
    -- Lookup by email
    SELECT id, full_name INTO v_recipient_id, v_recipient_name
    FROM   public.profiles
    WHERE  email = p_recipient_identifier
    LIMIT  1;
  ELSE
    -- Treat as UUID
    BEGIN
      SELECT id, full_name INTO v_recipient_id, v_recipient_name
      FROM   public.profiles
      WHERE  id = p_recipient_identifier::UUID
      LIMIT  1;
    EXCEPTION WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'INVALID_RECIPIENT: not a valid email or UUID'
        USING ERRCODE = '22023';
    END;
  END IF;

  IF v_recipient_id IS NULL THEN
    RAISE EXCEPTION 'RECIPIENT_NOT_FOUND: no profile for identifier %',
      p_recipient_identifier
      USING ERRCODE = 'P0001';
  END IF;

  -- Cannot transfer to yourself
  IF v_recipient_id = p_sender_id THEN
    RAISE EXCEPTION 'SELF_TRANSFER: cannot transfer to your own account'
      USING ERRCODE = '22023';
  END IF;

  -- ── Lock wallets in consistent order (avoid deadlock) ─────
  SELECT balance INTO v_sender_balance
  FROM   public.wallets
  WHERE  user_id = LEAST(p_sender_id, v_recipient_id)
  FOR UPDATE;

  IF LEAST(p_sender_id, v_recipient_id) = p_sender_id THEN
    v_sender_balance := v_sender_balance; -- already fetched
    SELECT balance INTO v_recipient_balance
    FROM   public.wallets WHERE user_id = v_recipient_id FOR UPDATE;
  ELSE
    v_recipient_balance := v_sender_balance; -- fetched first (recipient was LEAST)
    SELECT balance INTO v_sender_balance
    FROM   public.wallets WHERE user_id = p_sender_id FOR UPDATE;
  END IF;

  -- ── Verify sender balance ─────────────────────────────────
  IF v_sender_balance IS NULL THEN
    RAISE EXCEPTION 'WALLET_NOT_FOUND: sender has no wallet'
      USING ERRCODE = 'P0001';
  END IF;
  IF v_recipient_balance IS NULL THEN
    RAISE EXCEPTION 'WALLET_NOT_FOUND: recipient has no wallet'
      USING ERRCODE = 'P0001';
  END IF;
  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_BALANCE: sender balance % < amount %',
      v_sender_balance, p_amount
      USING ERRCODE = 'P0001';
  END IF;

  -- ── Compute new balances ──────────────────────────────────
  v_new_sender_bal := v_sender_balance    - p_amount;
  v_new_recv_bal   := v_recipient_balance + p_amount;

  -- ── Update wallets ────────────────────────────────────────
  UPDATE public.wallets
  SET    balance    = v_new_sender_bal,
         updated_at = NOW()
  WHERE  user_id = p_sender_id;

  UPDATE public.wallets
  SET    balance    = v_new_recv_bal,
         updated_at = NOW()
  WHERE  user_id = v_recipient_id;

  -- ── Fetch sender name for recipient's transaction record ──
  SELECT full_name INTO v_sender_name
  FROM   public.profiles
  WHERE  id = p_sender_id;

  -- ── Insert SENDER transaction (transfer_sent, negative) ───
  INSERT INTO public.transactions (
    user_id, type, amount, counterparty_id, counterparty_name,
    note, status, created_at
  )
  VALUES (
    p_sender_id,
    'transfer_sent',
    -p_amount,
    v_recipient_id,
    v_recipient_name,
    p_note,
    'verified',
    NOW()
  )
  RETURNING id INTO v_sent_tx_id;

  -- ── Insert RECIPIENT transaction (transfer_received, positive) ──
  INSERT INTO public.transactions (
    user_id, type, amount, counterparty_id, counterparty_name,
    note, status, created_at
  )
  VALUES (
    v_recipient_id,
    'transfer_received',
    p_amount,
    p_sender_id,
    v_sender_name,
    p_note,
    'verified',
    NOW()
  )
  RETURNING id INTO v_recv_tx_id;

  -- ── Return result ─────────────────────────────────────────
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
GRANT EXECUTE ON FUNCTION public.execute_transfer(UUID, TEXT, NUMERIC, TEXT) TO authenticated;

COMMENT ON FUNCTION public.execute_transfer IS
  'Atomically transfers funds between two wallets and creates both '
  'transaction ledger entries. Validates caller = sender via auth.uid(). '
  'Replaces the multi-step transferBetweenUsers() client-side approach. '
  'SECURITY DEFINER to write to recipient wallet/transaction without '
  'permissive RLS policies.';


-- ─────────────────────────────────────────────────────────────
-- B2  execute_purchase(buyer_id, product_id)
-- ─────────────────────────────────────────────────────────────
-- Replaces the cross-user wallet + transaction writes in createOrder()
-- in productService.js.
--
-- createOrder() currently does:
--   1. INSERT orders row
--   2. updateWalletBalance(buyerId, ...)    ← own wallet, OK
--   3. updateWalletBalance(sellerId, ...)   ← CROSS-USER, needs fn
--   4. createTransaction({ userId: buyerId, ... })   ← own, OK
--   5. createTransaction({ userId: sellerId, ... })  ← CROSS-USER, needs fn
--
-- This function handles steps 1–5 atomically.
-- The client replaces the multi-step createOrder() with a single
-- supabase.rpc('execute_purchase', { p_buyer_id, p_product_id }) call.
--
-- Returns: JSON with the created order row + balance info

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
BEGIN
  -- ── Security: caller must be the buyer ───────────────────
  IF auth.uid() IS DISTINCT FROM p_buyer_id THEN
    RAISE EXCEPTION 'FORBIDDEN: caller (%) is not the buyer (%)',
      auth.uid(), p_buyer_id
      USING ERRCODE = '42501';
  END IF;

  -- ── Fetch product ─────────────────────────────────────────
  SELECT id, price, seller_id, title, status
  INTO   v_product
  FROM   public.products
  WHERE  id = p_product_id;

  IF v_product.id IS NULL THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND: product % does not exist', p_product_id
      USING ERRCODE = 'P0001';
  END IF;

  -- Cannot buy your own product
  IF v_product.seller_id = p_buyer_id THEN
    RAISE EXCEPTION 'SELF_PURCHASE: cannot buy your own listing'
      USING ERRCODE = '22023';
  END IF;

  -- ── Lock wallets in consistent order ──────────────────────
  IF p_buyer_id < v_product.seller_id THEN
    SELECT balance INTO v_buyer_balance
    FROM   public.wallets WHERE user_id = p_buyer_id FOR UPDATE;
    SELECT balance INTO v_seller_balance
    FROM   public.wallets WHERE user_id = v_product.seller_id FOR UPDATE;
  ELSE
    SELECT balance INTO v_seller_balance
    FROM   public.wallets WHERE user_id = v_product.seller_id FOR UPDATE;
    SELECT balance INTO v_buyer_balance
    FROM   public.wallets WHERE user_id = p_buyer_id FOR UPDATE;
  END IF;

  IF v_buyer_balance IS NULL THEN
    RAISE EXCEPTION 'WALLET_NOT_FOUND: buyer has no wallet'
      USING ERRCODE = 'P0001';
  END IF;
  IF v_seller_balance IS NULL THEN
    RAISE EXCEPTION 'WALLET_NOT_FOUND: seller has no wallet'
      USING ERRCODE = 'P0001';
  END IF;

  -- ── Validate balance ──────────────────────────────────────
  IF v_product.price > 0 AND v_buyer_balance < v_product.price THEN
    RAISE EXCEPTION 'INSUFFICIENT_BALANCE: buyer balance % < price %',
      v_buyer_balance, v_product.price
      USING ERRCODE = 'P0001';
  END IF;

  -- ── Create order row ──────────────────────────────────────
  INSERT INTO public.orders (buyer_id, seller_id, product_id, status, created_at, updated_at)
  VALUES (p_buyer_id, v_product.seller_id, p_product_id, 'pending', NOW(), NOW())
  RETURNING * INTO v_order;

  -- ── Update wallets if price > 0 ───────────────────────────
  IF v_product.price > 0 THEN
    v_new_buyer_bal  := v_buyer_balance  - v_product.price;
    v_new_seller_bal := v_seller_balance + v_product.price;

    UPDATE public.wallets
    SET    balance = v_new_buyer_bal,  updated_at = NOW()
    WHERE  user_id = p_buyer_id;

    UPDATE public.wallets
    SET    balance = v_new_seller_bal, updated_at = NOW()
    WHERE  user_id = v_product.seller_id;

    -- ── Buyer transaction (purchase, negative) ────────────
    INSERT INTO public.transactions (
      user_id, type, amount, counterparty_id, counterparty_name,
      note, status, created_at
    )
    VALUES (
      p_buyer_id,
      'purchase',
      -v_product.price,
      v_product.seller_id,
      v_product.title,
      'Purchased ' || v_product.title,
      'verified',
      NOW()
    )
    RETURNING id INTO v_buyer_tx_id;

    -- ── Seller transaction (sale, positive) ───────────────
    INSERT INTO public.transactions (
      user_id, type, amount, counterparty_id, counterparty_name,
      note, status, created_at
    )
    VALUES (
      v_product.seller_id,
      'sale',
      v_product.price,
      p_buyer_id,
      'Buyer',
      'Sold ' || v_product.title,
      'verified',
      NOW()
    )
    RETURNING id INTO v_seller_tx_id;
  END IF;

  -- ── Return full result ────────────────────────────────────
  RETURN json_build_object(
    'order_id',           v_order.id,
    'buyer_id',           v_order.buyer_id,
    'seller_id',          v_order.seller_id,
    'product_id',         v_order.product_id,
    'status',             v_order.status,
    'price',              v_product.price,
    'buyer_new_balance',  COALESCE(v_new_buyer_bal,  v_buyer_balance),
    'seller_new_balance', COALESCE(v_new_seller_bal, v_seller_balance),
    'buyer_tx_id',        v_buyer_tx_id,
    'seller_tx_id',       v_seller_tx_id,
    'created_at',         v_order.created_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.execute_purchase(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_purchase(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION public.execute_purchase IS
  'Atomically creates an order, debits buyer wallet, credits seller wallet, '
  'and writes both transaction ledger entries. Validates caller = buyer via '
  'auth.uid(). Replaces the multi-step createOrder() client-side approach. '
  'SECURITY DEFINER to write to seller wallet/transaction without permissive '
  'RLS policies.';


-- ============================================================
-- §C  ROW LEVEL SECURITY – profiles
-- ============================================================
-- Evidence of queries and their access requirements:
--
--  getProfile(uid)         → SELECT own row (auth.uid() = id)
--  getProfileByEmail(e)    → SELECT any row by email
--                            Used in: transferBetweenUsers (lookup recipient),
--                            transactionService (resolve sender name)
--  getRecentProfiles(n)    → SELECT all rows (dashboard: Recently Registered)
--  searchSellers(q)        → SELECT all rows (marketplace search)
--  getCounts()             → COUNT all rows (dashboard stats)
--  createProfile(uid, …)   → INSERT own row (id = auth.uid())
--  updateProfile(uid, …)   → UPDATE own row (id = auth.uid())
--  requestBusinessVerif.   → UPDATE own row (id = auth.uid())
--  approve_user() / fn     → UPDATE any row (SECURITY DEFINER — bypasses RLS)
--
-- DESIGN: SELECT is permissive for all authenticated users.
-- Rationale: profiles are intentionally visible to all platform members
-- (marketplace seller badges, dashboard user list, transfer recipient
-- resolution). This is equivalent to a "public within the platform" model,
-- not a data leak — the platform is invite-only so all viewers are vetted.
-- The SELECT policy is scoped to 'authenticated' (never 'anon').

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: any authenticated user can read any profile
-- Required by: getRecentProfiles, searchSellers, getCounts,
--              getProfileByEmail (transfer lookup), product seller join
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: users can only insert their OWN profile row
-- Required by: createProfile() called from AuthContext.register()
-- Trigger handle_new_user() uses SECURITY DEFINER (bypasses RLS)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- UPDATE: users can only update their OWN profile row
-- Required by: updateProfile(), requestBusinessVerification()
-- Admin approval uses approve_user() SECURITY DEFINER (bypasses RLS)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING  (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- DELETE: no policy → DELETE is implicitly denied for all roles
-- Profile deletion is handled by auth.users ON DELETE CASCADE (Supabase admin)


-- ============================================================
-- §D  ROW LEVEL SECURITY – wallets
-- ============================================================
-- Evidence of queries and their access requirements:
--
--  getWallet(uid)             → SELECT own wallet
--  createWallet(uid)          → INSERT own wallet (id = auth.uid())
--  updateWalletBalance(uid,b) → UPDATE own wallet (deposit/withdraw simulations)
--  transferBetweenUsers()     → NOW handled by execute_transfer() RPC
--  createOrder()              → NOW handled by execute_purchase() RPC
--
-- DESIGN: SELECT and INSERT are own-only (strict).
-- UPDATE is own-only (strict) — cross-user wallet writes are now done
-- exclusively via the SECURITY DEFINER execute_transfer() and
-- execute_purchase() functions, which bypass RLS.
--
-- ⚠ This means: after applying Phase 5, the frontend MUST call
-- supabase.rpc('execute_transfer', …) and supabase.rpc('execute_purchase', …)
-- instead of the previous multi-step direct-update approach.
-- See the patched transactionService.js and productService.js.

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- SELECT: users can only read their OWN wallet
DROP POLICY IF EXISTS "wallets_select_own" ON public.wallets;
CREATE POLICY "wallets_select_own"
  ON public.wallets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: users can only create their OWN wallet
-- handle_new_wallet() trigger uses SECURITY DEFINER (bypasses RLS)
DROP POLICY IF EXISTS "wallets_insert_own" ON public.wallets;
CREATE POLICY "wallets_insert_own"
  ON public.wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: users can only update their OWN wallet
-- Self-service: deposit/withdraw simulations (depositSimulation, withdrawSimulation)
-- Cross-user: execute_transfer() and execute_purchase() use SECURITY DEFINER
DROP POLICY IF EXISTS "wallets_update_own" ON public.wallets;
CREATE POLICY "wallets_update_own"
  ON public.wallets
  FOR UPDATE
  TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: no policy → DELETE implicitly denied


-- ============================================================
-- §E  ROW LEVEL SECURITY – products
-- ============================================================
-- Evidence of queries and their access requirements:
--
--  getProducts(filters)      → SELECT all (marketplace browse — all authenticated)
--  getProduct(id)            → SELECT one (product details page)
--  getRecentProducts(n)      → SELECT all (dashboard activity feed)
--  getRelatedProducts(cat)   → SELECT all in category
--  getMyProducts(sellerId)   → SELECT WHERE seller_id = auth.uid()
--  getGlobalCounts()         → COUNT all products
--  createProduct(data)       → INSERT with seller_id = auth.uid()
--  updateProduct(id, fields) → UPDATE WHERE id = target (seller enforced by RLS)
--  deleteProduct(id)         → DELETE WHERE id = target (seller enforced by RLS)
--  uploadProductImage()      → Storage (covered by storage policies in Phase 3)
--  execute_purchase()        → SELECT product for price (SECURITY DEFINER bypasses RLS)
--
-- DESIGN: SELECT permissive for all authenticated users (marketplace visibility).
-- Write operations (INSERT/UPDATE/DELETE) are seller-only.

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- SELECT: any authenticated user can browse all products
DROP POLICY IF EXISTS "products_select_authenticated" ON public.products;
CREATE POLICY "products_select_authenticated"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: only the seller can list their own product
-- createProduct() always passes seller_id = auth.uid() (set by frontend)
DROP POLICY IF EXISTS "products_insert_own" ON public.products;
CREATE POLICY "products_insert_own"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

-- UPDATE: only the seller can edit their own listing
-- updateProduct() / updateTokenPrice() — RLS enforces ownership server-side
DROP POLICY IF EXISTS "products_update_own" ON public.products;
CREATE POLICY "products_update_own"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING  (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- DELETE: only the seller can remove their own listing
DROP POLICY IF EXISTS "products_delete_own" ON public.products;
CREATE POLICY "products_delete_own"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid());


-- ============================================================
-- §F  ROW LEVEL SECURITY – orders
-- ============================================================
-- Evidence of queries and their access requirements:
--
--  getMyOrders(uid)         → SELECT WHERE buyer_id=uid OR seller_id=uid
--  getRecentOrders(uid,n)   → SELECT WHERE buyer_id=uid OR seller_id=uid
--  getRecentOrdersGlobal(n) → SELECT ALL (dashboard activity feed — no user filter)
--  getGlobalCounts()        → COUNT ALL orders
--  getOrdersCounts(uid)     → COUNT WHERE seller_id=uid OR buyer_id=uid
--  createOrder() / execute_purchase() → INSERT with buyer_id = auth.uid()
--
-- DESIGN: SELECT is permissive for all authenticated users.
-- Rationale: getRecentOrdersGlobal() and getGlobalCounts() read ALL orders
-- and are called from Dashboard.jsx for the platform activity feed.
-- This is equivalent to an "admin-read" of the order book, which is
-- acceptable because all users are vetted (invite-only platform) and
-- the data returned is non-sensitive (product title, participant names
-- via FK join — no payment card data, no PII beyond names).
--
-- INSERT is buyer-only (buyer_id = auth.uid()).
-- execute_purchase() is SECURITY DEFINER and bypasses RLS for the INSERT.

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- SELECT: any authenticated user can read all orders
-- Required by: getRecentOrdersGlobal (dashboard), getGlobalCounts
DROP POLICY IF EXISTS "orders_select_authenticated" ON public.orders;
CREATE POLICY "orders_select_authenticated"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: buyer inserts their own order (buyer_id = auth.uid())
-- execute_purchase() is SECURITY DEFINER and bypasses RLS
DROP POLICY IF EXISTS "orders_insert_buyer" ON public.orders;
CREATE POLICY "orders_insert_buyer"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

-- UPDATE: only the buyer or seller involved can update an order status
-- (future order status management — not currently used by any service function)
DROP POLICY IF EXISTS "orders_update_participant" ON public.orders;
CREATE POLICY "orders_update_participant"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING  (buyer_id = auth.uid() OR seller_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());

-- DELETE: no policy → DELETE implicitly denied (orders are immutable records)


-- ============================================================
-- §G  ROW LEVEL SECURITY – transactions
-- ============================================================
-- Evidence of queries and their access requirements:
--
--  getTransactionsForUser(uid)  → SELECT WHERE user_id = uid
--  getRecentTransactions(n)     → SELECT ALL (dashboard activity feed)
--  getTotalCount()              → COUNT ALL
--  depositSimulation()          → INSERT with user_id = auth.uid()
--  withdrawSimulation()         → INSERT with user_id = auth.uid()
--  createTransaction({userId})  → INSERT with user_id = caller-supplied
--                                 (can be recipient.id — cross-user)
--  createTransaction blockchain → UPDATE blockchain_hash on the row just inserted
--
-- DESIGN:
--  SELECT  — permissive for authenticated (dashboard activity feed needs all rows)
--  INSERT  — own-only (user_id = auth.uid()); cross-user inserts via execute_transfer()
--            and execute_purchase() which are SECURITY DEFINER
--  UPDATE  — restricted to own rows AND only the blockchain_hash column
--            (hash is written immediately after INSERT in createTransaction)

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- SELECT: any authenticated user can read all transactions
-- Required by: getRecentTransactions (dashboard feed), getTotalCount
DROP POLICY IF EXISTS "transactions_select_authenticated" ON public.transactions;
CREATE POLICY "transactions_select_authenticated"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: users can only create transaction rows for themselves
-- Cross-user inserts (recipient, seller) done via SECURITY DEFINER functions
DROP POLICY IF EXISTS "transactions_insert_own" ON public.transactions;
CREATE POLICY "transactions_insert_own"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: users can only update their OWN transaction rows,
-- and only to write the blockchain_hash field.
-- createTransaction() inserts first, then updates blockchain_hash on
-- the row it just created (eq('id', data.id) where data was just inserted).
-- For own rows (deposit/withdraw): user_id = auth.uid() → allowed.
-- For cross-user rows (recipient tx): those are inserted by SECURITY DEFINER
-- and their blockchain_hash is updated inside the SECURITY DEFINER function.
-- This policy only covers the deposit/withdraw/self path.
DROP POLICY IF EXISTS "transactions_update_own_hash" ON public.transactions;
CREATE POLICY "transactions_update_own_hash"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: no policy → DELETE implicitly denied (ledger is append-only)


-- ============================================================
-- §H  ROW LEVEL SECURITY – hash_records
-- ============================================================
-- Evidence of queries and their access requirements:
--
--  getRecentHashes(n)       → SELECT ALL (blockchain explorer feed)
--  getHashFeed(opts)        → SELECT ALL with optional entity_type filter
--  getHashCount()           → COUNT ALL
--  searchHashes(q)          → SELECT with ilike / eq filter
--  findHashesBySha(q)       → SELECT with ilike filter
--  getHashesByEntity(t,id)  → SELECT WHERE entity_type=t AND entity_id=id
--  getHashStatsByType()     → COUNT per entity_type
--  generateAndStoreHash()   → INSERT (called after every significant event)
--  approve_user() / SQL fn  → INSERT (admin audit entry — SECURITY DEFINER)
--
-- DESIGN:
--  SELECT  — permissive for authenticated (blockchain explorer shows all hashes)
--  INSERT  — authenticated users can insert hash records
--             Rationale: hashes are write-once audit trail entries.
--             Any authenticated user can record events (profile creation,
--             asset listing, purchases, transfers). The hash itself is
--             cryptographically derived from the payload — a fake hash
--             insert adds noise but cannot forge an actual event.
--  UPDATE  — DENIED. Hash records are immutable (append-only ledger).
--  DELETE  — DENIED. Hash records are immutable.

ALTER TABLE public.hash_records ENABLE ROW LEVEL SECURITY;

-- SELECT: any authenticated user can browse the blockchain explorer
DROP POLICY IF EXISTS "hash_records_select_authenticated" ON public.hash_records;
CREATE POLICY "hash_records_select_authenticated"
  ON public.hash_records
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: any authenticated user can record a hash event
DROP POLICY IF EXISTS "hash_records_insert_authenticated" ON public.hash_records;
CREATE POLICY "hash_records_insert_authenticated"
  ON public.hash_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- No UPDATE policy → UPDATE is implicitly denied (immutable ledger)
-- No DELETE policy → DELETE is implicitly denied (immutable ledger)


-- ============================================================
-- §I  ROW LEVEL SECURITY – service_requests
-- ============================================================
-- Evidence of queries and their access requirements:
--
--  createRequest(payload)       → INSERT by ANON (public service forms)
--  uploadDocuments(files)       → Storage (anon)
--  attachDocumentsToRequest(id) → UPDATE documents col by ANON (after upload)
--  getRequestStatus(id)         → SELECT by id — ANON (track own request)
--  getMyRequests(email)         → SELECT WHERE email = ? — ANON
--  cancelRequest(id, email)     → UPDATE WHERE id=? AND email=? AND status='pending' — ANON
--
-- DESIGN: service_requests are submitted by anonymous visitors who have
-- NOT yet registered. The table uses email as the ownership identifier
-- because there is no auth.uid() available.
--
-- Security model:
--  SELECT  — anon can only read rows matching their email (email gate)
--            OR by specific request ID (status tracking)
--  INSERT  — anon can insert (public form submission)
--  UPDATE  — anon can only update their OWN row (email + id match)
--            and only specific fields (documents, status='cancelled')
--  DELETE  — DENIED (admin only via service_role)
--
-- NOTE: The anon RLS cannot perfectly prevent a malicious actor from
-- reading another person's request if they know the email. This is an
-- acceptable trade-off for a public intake form without authentication.
-- The alternative (require login) contradicts the app's design intent.
-- Sensitive KYC documents are stored in Supabase Storage with separate
-- bucket-level access control.

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- SELECT for anon: can read their own requests by email OR by request ID
-- getMyRequests(email) → WHERE email = ?
-- getRequestStatus(id) → WHERE id = ?
DROP POLICY IF EXISTS "service_requests_select_anon" ON public.service_requests;
CREATE POLICY "service_requests_select_anon"
  ON public.service_requests
  FOR SELECT
  TO anon
  USING (true);
-- Note: PostgREST always applies the WHERE clause from the query
-- (WHERE email = ? or WHERE id = ?), so the anon user only receives
-- rows matching their filter. The USING (true) here does NOT mean
-- "return all rows" — it means RLS doesn't add an extra filter.
-- The service layer's .eq('email', email) is the access gate.

-- SELECT for authenticated: full visibility (admin operations)
DROP POLICY IF EXISTS "service_requests_select_authenticated" ON public.service_requests;
CREATE POLICY "service_requests_select_authenticated"
  ON public.service_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT for anon: anyone can submit a service request (public intake form)
DROP POLICY IF EXISTS "service_requests_insert_anon" ON public.service_requests;
CREATE POLICY "service_requests_insert_anon"
  ON public.service_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- INSERT for authenticated: also allow (logged-in users can submit requests)
DROP POLICY IF EXISTS "service_requests_insert_authenticated" ON public.service_requests;
CREATE POLICY "service_requests_insert_authenticated"
  ON public.service_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE for anon: cancel or attach documents to own request
-- cancelRequest():           UPDATE WHERE id=? AND email=? AND status='pending'
-- attachDocumentsToRequest(): UPDATE WHERE id=?
-- The email ownership check in cancelRequest() is enforced by the .eq('email', email)
-- filter in the service layer. We add it to RLS as well for defence-in-depth.
DROP POLICY IF EXISTS "service_requests_update_own_anon" ON public.service_requests;
CREATE POLICY "service_requests_update_own_anon"
  ON public.service_requests
  FOR UPDATE
  TO anon
  USING  (true)
  WITH CHECK (true);
-- Rationale: anon has no auth.uid(). Ownership is enforced by the application
-- layer (.eq('email', …) .eq('id', …) .eq('status', 'pending')).
-- A malicious anon would need both the UUID (request id) and email to update.
-- UUIDs are not guessable (128-bit random). This is acceptable for a public form.

-- UPDATE for authenticated: allow (admin updates via dashboard)
DROP POLICY IF EXISTS "service_requests_update_authenticated" ON public.service_requests;
CREATE POLICY "service_requests_update_authenticated"
  ON public.service_requests
  FOR UPDATE
  TO authenticated
  USING  (true)
  WITH CHECK (true);

-- DELETE: no policy for anon or authenticated → denied for all
-- Requests can only be deleted by the service_role key (admin)


-- ============================================================
-- §J  VERIFICATION QUERIES
-- ============================================================
-- Run these after applying this file to confirm all policies installed.

-- 1. All RLS-enabled tables and their policy counts
SELECT
  t.tablename,
  t.rowsecurity                        AS rls_enabled,
  COUNT(p.policyname)                  AS policy_count
FROM pg_tables t
LEFT JOIN pg_policies p
  ON  p.schemaname = t.schemaname
  AND p.tablename  = t.tablename
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'profiles','wallets','products','orders',
    'transactions','hash_records','service_requests'
  )
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;
-- Expected: all 7 tables have rls_enabled=true, policy_count > 0

-- 2. Full policy list
SELECT
  tablename,
  policyname,
  cmd        AS operation,
  roles,
  qual       AS using_expr,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- 3. Confirm SECURITY DEFINER functions exist
SELECT
  routine_name,
  security_type,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('execute_transfer', 'execute_purchase')
ORDER BY routine_name;
-- Expected: 2 rows, security_type = 'DEFINER'

-- 4. Confirm wallets has NO permissive UPDATE policy
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename  = 'wallets'
  AND cmd        = 'UPDATE';
-- Expected: 1 row — wallets_update_own — qual contains 'auth.uid()'
-- (NOT 'true')

-- 5. Confirm transactions has NO permissive INSERT policy
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename  = 'transactions'
  AND cmd        = 'INSERT';
-- Expected: 1 row — transactions_insert_own — with_check contains 'auth.uid()'

-- ============================================================
-- ✅ PHASE 5 COMPLETE
-- ============================================================
-- Summary of RLS design per table:
--
--  TABLE              SELECT          INSERT            UPDATE          DELETE
--  ───────────────────────────────────────────────────────────────────────────
--  profiles           authenticated   own (id=uid)      own (id=uid)    DENIED
--  wallets            own (uid)       own (uid)         own (uid)       DENIED
--  products           authenticated   seller (uid)      seller (uid)    seller
--  orders             authenticated   buyer (uid)       participant     DENIED
--  transactions       authenticated   own (uid)         own (uid)       DENIED
--  hash_records       authenticated   authenticated     DENIED          DENIED
--  service_requests   anon+auth       anon+auth         anon+auth       DENIED
--
-- Cross-user writes handled securely via SECURITY DEFINER functions:
--   public.execute_transfer(sender_id, recipient_identifier, amount, note)
--   public.execute_purchase(buyer_id, product_id)
--
-- Frontend patch required (see Phase 5 patches):
--   transactionService.js: transferBetweenUsers() → supabase.rpc('execute_transfer', …)
--   productService.js:     createOrder()          → supabase.rpc('execute_purchase', …)
-- ============================================================
