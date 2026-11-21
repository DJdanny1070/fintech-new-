import { supabase } from "./supabase";
import { isDemoMode, getDemoWallet, updateDemoWalletBalance } from "../data/demoData";

/**
 * Wallet Service — Supabase wallet operations.
 *
 * TODO (Future Integration): Real-time balance subscriptions
 * ----------------------------------------------------------
 * Subscribe to the "wallets" table via Supabase Realtime so that the UI
 * reflects balance changes (from purchases, withdrawals, incoming transfers)
 * without requiring a page reload. Example:
 *
 *   supabase
 *     .channel('wallet-updates')
 *     .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wallets',
 *         filter: `user_id=eq.${userId}` }, handleWalletUpdate)
 *     .subscribe();
 *
 * Wire this into AuthContext.refreshWallet() or a dedicated useWallet() hook.
 */


/**
 * Create a wallet for a new user. Initial balance ₹1,00,000.
 */
export async function createWallet(userId) {
  const { data, error } = await supabase
    .from("wallets")
    .insert([{ user_id: userId, balance: 100000 }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get the wallet for a user.
 */
export async function getWallet(userId) {
  if (isDemoMode()) {
    return getDemoWallet();
  }

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

/**
 * Update wallet balance.
 */
export async function updateWalletBalance(userId, newBalance) {
  if (isDemoMode()) {
    const current = getDemoWallet().balance;
    const delta = newBalance - current;
    updateDemoWalletBalance(delta);
    return getDemoWallet();
  }

  const { data, error } = await supabase
    .from("wallets")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
