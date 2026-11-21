# CresoX – Comprehensive Functionality Inventory

This document details every feature, user action, backend operation, database table dependency, required permissions, and implementation status discovered across the CresoX codebase.

---

## 1. Authentication & Session Management

| Feature | User Action | Backend Operation | Database / Auth Target | Permissions | Status |
|---|---|---|---|---|:---:|
| **Sign In with Email** | Submits login form with email & password | Authenticates credentials via Supabase GoTrue | `auth.users` | Public / Invited | ✅ Functional |
| **Sign In with Google** | Clicks "Continue with Google" | OAuth 2.0 redirect via Supabase Auth | `auth.users` | Public / Invited | ✅ Functional |
| **Sign Out** | Clicks "Sign Out" in navigation or profile | Revokes session, clears local storage tokens | Supabase Auth | Authenticated | ✅ Functional |
| **Session Restore** | Opens or refreshes browser | Restores JWT from local storage; calls `loadUserData` | `auth.users`, `profiles`, `wallets` | Authenticated | ✅ Functional |
| **Password Reset Request**| Submits email on `/forgot-password` | Sends password reset email via Supabase Auth | `auth.users` | Public | ✅ Functional |
| **Closed Registration Notice** | Visits `/register` | Informs user access is by admin invite only | N/A (Static notice) | Public | ✅ Functional |
| **Auto-Profile Creation** | User created in `auth.users` | Database trigger `on_auth_user_created` creates row | `profiles` | Trigger (Definer) | ✅ Functional |
| **Auto-Wallet Creation** | Row inserted into `profiles` | Database trigger `on_profile_created` creates wallet | `wallets` | Trigger (Definer) | ✅ Functional |
| **OAuth Profile Synchronization** | User re-authenticates via Google | Trigger `on_auth_user_updated` syncs avatar/email | `profiles`, `wallets` | Trigger (Definer) | ✅ Functional |

---

## 2. Profile Management & Business KYC

| Feature | User Action | Backend Operation | Database / Auth Target | Permissions | Status |
|---|---|---|---|---|:---:|
| **View Profile** | Navigates to `/dashboard/profile` | Fetches user profile row by `auth.uid()` | `profiles` | Authenticated (Own) | ✅ Functional |
| **Edit Profile Details** | Updates name, phone, or company name | Updates profile fields; `protect_profile_fields` guards status | `profiles` | Authenticated (Own) | ✅ Functional |
| **Upload Avatar** | Selects image file for profile avatar | Uploads file to Supabase Storage `avatars` bucket | `avatars` bucket, `profiles` | Authenticated (Own) | ✅ Functional |
| **Submit KYC Documents** | Submits GST, PAN, address, and document files | Uploads to `company-docs` bucket; sets `verification_status = 'Pending'` | `company-docs` bucket, `profiles` | Business Role | ✅ Functional |
| **KYC Audit Hashing** | Submits KYC verification request | Generates and logs SHA-256 hash of submission | `hash_records` | Authenticated | ✅ Functional |
| **Search Sellers** | Searches seller name in marketplace | Searches `profiles` via `ilike` on `full_name` & `company_name` | `profiles` | Authenticated | ✅ Functional |

---

## 3. Marketplace & Asset Management

| Feature | User Action | Backend Operation | Database / Auth Target | Permissions | Status |
|---|---|---|---|---|:---:|
| **Browse Marketplace** | Visits `/dashboard/marketplace` | Queries active product listings joined with seller profile | `products`, `profiles` | Authenticated | ✅ Functional |
| **Filter by Category** | Clicks category pills (Real Estate, Agriculture, etc.) | Filters `products` query by `category` column | `products` | Authenticated | ✅ Functional |
| **Search Marketplace** | Types keywords in search box | Performs `ilike` query across `title`, `description`, `category` | `products` | Authenticated | ✅ Functional |
| **View Product Details** | Clicks product card | Fetches product by ID with joined seller info | `products`, `profiles` | Authenticated | ✅ Functional |
| **Create Asset Listing** | Submits asset listing form | Inserts product row with default pricing metadata | `products` | Authenticated Seller | ✅ Functional |
| **Asset Listing Hash** | Submits new product listing | Computes and logs SHA-256 hash of asset creation | `hash_records`, `products` | Authenticated Seller | ✅ Functional |
| **Edit Product Listing** | Updates product details | Updates product row (enforced by RLS `seller_id = auth.uid()`) | `products` | Listing Owner | ✅ Functional |
| **Delete Product Listing**| Deletes product listing | Deletes product row (enforced by RLS `seller_id = auth.uid()`) | `products` | Listing Owner | ✅ Functional |
| **Update Token Price** | Changes price of tokenized asset | Updates `current_price`, `trend`, and `price_history` JSONB | `products` | Listing Owner | ✅ Functional |
| **Upload Product Image** | Selects image during asset listing | Uploads to `product-images` storage bucket | `product-images` bucket | Authenticated Seller | ✅ Functional |

---

## 4. Orders & Purchase Settlements

| Feature | User Action | Backend Operation | Database / Auth Target | Permissions | Status |
|---|---|---|---|---|:---:|
| **Buy Token / Asset** | Clicks "Buy Now" on product details | Calls atomic `execute_purchase` RPC function | `orders`, `wallets`, `transactions`, `hash_records` | Authenticated Buyer | ✅ Functional |
| **View My Orders** | Visits `/dashboard/orders` | Queries orders where `buyer_id = auth.uid() OR seller_id = auth.uid()` | `orders`, `products`, `profiles` | Buyer / Seller | ✅ Functional |
| **Order Counts** | Views order summary badges | Exact counts of received orders and purchased orders | `orders` | Authenticated | ✅ Functional |
| **Global Order Feed** | Views dashboard platform activity | Reads recent platform orders with buyer/seller names | `orders`, `products`, `profiles` | Authenticated | ✅ Functional |

---

## 5. Wallet & Financial Ledger

| Feature | User Action | Backend Operation | Database / Auth Target | Permissions | Status |
|---|---|---|---|---|:---:|
| **View Wallet Balance** | Navigates to `/dashboard/wallet` | Queries wallet record for `auth.uid()` | `wallets` | Authenticated (Own) | ✅ Functional |
| **Peer-to-Peer Transfer** | Submits "Send" modal with recipient & amount | Calls atomic `execute_transfer` RPC function | `wallets`, `transactions`, `hash_records` | Authenticated Sender | ✅ Functional |
| **Simulated Deposit** | Submits "Deposit" modal with amount | Debits simulated bank; updates balance and logs transaction | `wallets`, `transactions` | Authenticated (Own) | ✅ Functional |
| **Simulated Withdrawal**| Submits "Withdraw" modal with amount | Credits simulated bank; decreases balance and logs transaction | `wallets`, `transactions` | Authenticated (Own) | ✅ Functional |
| **Transaction History** | Scrolls transaction list in Wallet | Queries `transactions` where `user_id = auth.uid()` | `transactions`, `profiles` | Authenticated (Own) | ✅ Functional |
| **Recent Platform Txs** | Views recent transactions on Dashboard | Queries recent transactions with joined profiles | `transactions`, `profiles` | Authenticated | ✅ Functional |

---

## 6. Blockchain Explorer & Hash Ledger

| Feature | User Action | Backend Operation | Database / Auth Target | Permissions | Status |
|---|---|---|---|---|:---:|
| **View Live Hash Feed** | Visits `/dashboard/blockchain` | Queries recent entries from `hash_records` | `hash_records` | Authenticated | ✅ Functional |
| **Filter by Entity Type**| Selects entity filter (asset, purchase, transfer) | Queries `hash_records WHERE entity_type = ?` | `hash_records` | Authenticated | ✅ Functional |
| **Search by Hash Fragment** | Enters hex string in search input | `ilike` query on `sha256_hash` column | `hash_records` | Authenticated | ✅ Functional |
| **Search by Numeric ID** | Enters integer ID in search input | Exact match query on `id` column (`BIGINT`) | `hash_records` | Authenticated | ✅ Functional |
| **Search User Hashes** | Searches user email or ID on explorer | Resolves user profile, then queries hashes by `entity_id` | `profiles`, `hash_records` | Authenticated | ✅ Functional |
| **Verify Hash Integrity**| Pastes stored hash and compares with recomputed payload | Recomputes client-side SHA-256 and compares strings | Client memory | Authenticated | ✅ Functional |
| **Hash Statistics** | Views hash breakdown counts | Computes counts grouped by `entity_type` | `hash_records` | Authenticated | ✅ Functional |

---

## 7. Inbound Service Requests

| Feature | User Action | Backend Operation | Database / Auth Target | Permissions | Status |
|---|---|---|---|---|:---:|
| **Submit Tokenization Request** | Fills form on `/request/asset-tokenization` | Verifies no pending duplicates, then inserts row | `service_requests` | Public (Anon) | ✅ Functional |
| **Submit Consultancy Request** | Fills form on `/consultation-request` | Verifies no pending duplicates, then inserts row | `service_requests` | Public (Anon) | ✅ Functional |
| **Upload Request Documents** | Attaches PDF/image files to request | Uploads to `service-request-docs` storage bucket | `service-request-docs` bucket | Public (Anon) | ✅ Functional |
| **Track Request Status** | Queries status of request by ID | Fetches request status row by UUID | `service_requests` | Public (Anon) | ✅ Functional |
| **Cancel Request** | Cancels pending request | Updates status to `'cancelled'` for pending requests | `service_requests` | Request Submitter | ✅ Functional |

---

## 8. Platform Administration & Access Gates

| Feature | User Action | Backend Operation | Database / Auth Target | Permissions | Status |
|---|---|---|---|---|:---:|
| **Approve User Account** | Admin calls `approve_user(email)` | Sets `approval_status = 'Approved'` & logs hash | `profiles`, `hash_records` | Service Role / Admin | ✅ Functional |
| **Reject User Account** | Admin calls `reject_user(email)` | Sets `approval_status = 'Rejected'` & logs hash | `profiles`, `hash_records` | Service Role / Admin | ✅ Functional |
| **Gate Protected Routes** | User visits `/dashboard/*` | Inspects `approval_status`; renders `<AccessPending>` if not Approved | `profiles` | System / Router | ✅ Functional |
| **Anti-Tampering Protection**| User attempts to alter `approval_status` via API | Trigger `protect_profile_fields` reverts unauthorized changes | `profiles` | System / Trigger | ✅ Functional |
