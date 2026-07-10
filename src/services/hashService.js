import { supabase } from "./supabase";
import { generateSHA256 } from "../utils/hashGenerator";

// ─── Entity type registry ─────────────────────────────────────────────────────
//
// Every event type that CresoX hashes is registered here.
// When a real blockchain is integrated, replace generateSHA256() with an
// on-chain call (e.g. Ethereum/Polygon transaction submission) — the rest of
// each function stays identical.
//
// EVENT TYPES
// ───────────────────────────────────────────────────────────────────
//  profile              Profile created (new user registration / invitation)
//  asset                Tokenized asset listed on the marketplace
//  token_purchase       User buys a token (asset ownership begins)
//  token_transfer       Token transferred from one holder to another
//  wallet_transaction   Any wallet debit/credit (deposit, withdraw, send)
//  verification_approval  Business KYC / approval_status changed by admin
//  ownership_change     Any change in token ownership share
// ───────────────────────────────────────────────────────────────────

/**
 * Core: generate a SHA-256 hash of any payload and persist it to hash_records.
 *
 * @param {string} entityType  - One of the registered event types above
 * @param {string} entityId    - UUID of the primary record being hashed
 * @param {object} data        - Arbitrary payload (will be JSON-serialised)
 * @param {object} [meta]      - Optional metadata to include in the hash (actor, notes)
 * @returns {string}           - Hex-encoded SHA-256 hash
 */
export async function generateAndStoreHash(entityType, entityId, data, meta = {}) {
  const payload = {
    entityType,
    entityId,
    ...data,
    ...meta,
    timestamp: new Date().toISOString(),
  };

  const hash = generateSHA256(payload);

  const { error } = await supabase.from("hash_records").insert([
    {
      entity_type: entityType,
      entity_id: entityId,
      sha256_hash: hash,
    },
  ]);

  if (error) {
    // Non-fatal — log and continue. A failed hash write must never block the
    // primary operation (order creation, profile update, etc.).
    console.error(`[blockchain] Failed to store hash (${entityType}/${entityId}):`, error.message);
  }

  return hash;
}

// ─── Typed event helpers ──────────────────────────────────────────────────────
// Each function wraps generateAndStoreHash with the correct event type.
// Use these instead of raw generateAndStoreHash to ensure consistent typing.

/**
 * Hash a new profile creation event.
 * Fired when a user is invited and their profile row is first inserted.
 */
export async function hashProfileCreation(userId, { full_name, email, role }, actorId = null) {
  return generateAndStoreHash(
    "profile",
    userId,
    { full_name, email, role },
    { actor_id: actorId }
  );
}

/**
 * Hash an asset (product) listing event.
 * Fired when a seller lists a new tokenized asset.
 */
export async function hashAssetCreation(assetId, { title, category, price, seller_id }) {
  return generateAndStoreHash(
    "asset",
    assetId,
    { title, category, price, seller_id }
  );
}

/**
 * Hash a token purchase event.
 * Fired when a buyer acquires a token (order placed).
 *
 * @param {string} orderId
 * @param {{ buyerId, sellerId, assetId, assetTitle, price }} details
 */
export async function hashTokenPurchase(orderId, { buyerId, sellerId, assetId, assetTitle, price }) {
  return generateAndStoreHash(
    "token_purchase",
    orderId,
    { buyer_id: buyerId, seller_id: sellerId, asset_id: assetId, asset_title: assetTitle, price }
  );
}

/**
 * Hash a token transfer event.
 * Fired when a token holder transfers their stake to another address.
 *
 * @param {string} transferId  - Synthetic ID for this transfer event
 * @param {{ fromId, toId, assetId, assetTitle, quantity }} details
 */
export async function hashTokenTransfer(transferId, { fromId, toId, assetId, assetTitle, quantity }) {
  return generateAndStoreHash(
    "token_transfer",
    transferId,
    { from_id: fromId, to_id: toId, asset_id: assetId, asset_title: assetTitle, quantity }
  );
}

/**
 * Hash a wallet transaction event.
 * Fired alongside every createTransaction() call.
 *
 * @param {string} transactionId
 * @param {{ userId, type, amount, counterpartyId, note }} details
 */
export async function hashWalletTransaction(transactionId, { userId, type, amount, counterpartyId = null, note = null }) {
  return generateAndStoreHash(
    "wallet_transaction",
    transactionId,
    { user_id: userId, type, amount, counterparty_id: counterpartyId, note }
  );
}

/**
 * Hash a verification / approval status change.
 * Fired when an admin approves or rejects a user, or when business KYC status changes.
 *
 * @param {string} profileId
 * @param {{ adminId, previousStatus, newStatus, reason }} details
 */
export async function hashVerificationApproval(profileId, { adminId = null, previousStatus, newStatus, reason = null }) {
  return generateAndStoreHash(
    "verification_approval",
    profileId,
    { admin_id: adminId, previous_status: previousStatus, new_status: newStatus, reason }
  );
}

/**
 * Hash an ownership change event.
 * Fired whenever token ownership percentages are recalculated after a trade or transfer.
 *
 * @param {string} assetId
 * @param {{ userId, previousPct, newPct, trigger }} details
 */
export async function hashOwnershipChange(assetId, { userId, previousPct, newPct, trigger }) {
  return generateAndStoreHash(
    "ownership_change",
    assetId,
    { user_id: userId, previous_pct: previousPct, new_pct: newPct, trigger }
  );
}

// ─── Query helpers ────────────────────────────────────────────────────────────

export async function getHashCount() {
  const { count, error } = await supabase
    .from("hash_records")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count || 0;
}

/**
 * Recent hash records ordered by time (most recent first).
 */
export async function getRecentHashes(limit = 10) {
  const { data, error } = await supabase
    .from("hash_records")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * Hash feed with optional entity type filter.
 * Used by the Blockchain Explorer page for the live feed.
 */
export async function getHashFeed({ entityType = null, limit = 20 } = {}) {
  let query = supabase
    .from("hash_records")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (entityType && entityType !== "all") {
    query = query.eq("entity_type", entityType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * Count records grouped by entity_type.
 * Returns an array of { entity_type, count }.
 *
 * NOTE: Supabase JS v2 doesn't support GROUP BY natively, so we fetch all
 * entity types in parallel via individual count queries.
 */
export async function getHashStatsByType() {
  const TYPES = [
    "profile",
    "asset",
    "token_purchase",
    "token_transfer",
    "wallet_transaction",
    "verification_approval",
    "ownership_change",
    "transaction",  // legacy type used by createTransaction()
    "product",      // legacy type used by createProduct()
  ];

  const results = await Promise.all(
    TYPES.map(async (type) => {
      const { count, error } = await supabase
        .from("hash_records")
        .select("id", { count: "exact", head: true })
        .eq("entity_type", type);
      return { entity_type: type, count: error ? 0 : (count || 0) };
    })
  );

  return results.filter((r) => r.count > 0);
}

/**
 * Search hash records by SHA-256 fragment OR numeric record ID.
 */
export async function searchHashes(query, limit = 20) {
  const trimmed = (query || "").trim();
  if (!trimmed) return [];

  const numericMatch = Number(trimmed);
  if (!Number.isNaN(numericMatch) && String(numericMatch) === trimmed) {
    const { data, error } = await supabase
      .from("hash_records")
      .select("*")
      .eq("id", numericMatch)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }

  const { data, error } = await supabase
    .from("hash_records")
    .select("*")
    .ilike("sha256_hash", `%${trimmed}%`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * Find hashes by (partial) SHA string.
 */
export async function findHashesBySha(query, limit = 50) {
  if (!query) return [];
  const { data, error } = await supabase
    .from("hash_records")
    .select("*")
    .ilike("sha256_hash", `%${query}%`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * Get hashes for a specific entity type + id.
 */
export async function getHashesByEntity(entityType, entityId, limit = 50) {
  if (!entityType || !entityId) return [];
  const { data, error } = await supabase
    .from("hash_records")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * Verify a hash: re-compute and compare.
 * Returns true if the stored hash matches a recomputed hash of the supplied data.
 *
 * NOTE: This is a client-side integrity check. When a real chain is integrated,
 * replace this with an on-chain proof verification call.
 *
 * @param {string} storedHash  - The SHA-256 hex string stored in hash_records
 * @param {object} data        - The original payload to re-hash
 * @returns {boolean}
 */
export function verifyHash(storedHash, data) {
  if (!storedHash || !data) return false;
  const recomputed = generateSHA256(data);
  return recomputed === storedHash;
}
