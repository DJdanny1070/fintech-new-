import { supabase } from "./supabase";
import { getWallet, updateWalletBalance } from "./walletService";
import { getProfileByEmail } from "./profileService";
import { hashWalletTransaction } from "./hashService";
import {
  isDemoMode,
  getDemoTransactions,
  addDemoTransaction,
  updateDemoWalletBalance,
  getDemoWallet,
} from "../data/demoData";

/**
 * Create a transaction record and generate a blockchain hash.
 */
export async function createTransaction({ userId, type, amount, counterpartyId = null, counterpartyName = null, note = null, status = "pending" }) {
  if (isDemoMode()) {
    return addDemoTransaction({ type, amount, counterparty_name: counterpartyName, note });
  }

  const payload = {
    user_id: userId,
    type,
    amount,
    counterparty_id: counterpartyId,
    counterparty_name: counterpartyName,
    note,
    status,
  };

  const { data, error } = await supabase
    .from("transactions")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;

  // Generate blockchain hash (non-blocking if storage fails)
  try {
    const hash = await hashWalletTransaction(data.id, {
      userId,
      type,
      amount,
      counterpartyId,
      note,
    });
    await supabase.from("transactions").update({ blockchain_hash: hash }).eq("id", data.id);
  } catch (err) {
    console.error("[blockchain] Failed to generate/store wallet transaction hash:", err.message);
  }

  return data;
}

/**
 * Get transactions for a user (as owner) with optional limit.
 */
export async function getTransactionsForUser(userId, limit = 50) {
  if (isDemoMode()) {
    const list = getDemoTransactions();
    return limit ? list.slice(0, limit) : list;
  }

  let query = supabase
    .from("transactions")
    .select(
      `*,
      counterparty:profiles!transactions_counterparty_id_fkey(
        id,
        full_name,
        email
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (limit !== null && limit !== undefined) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

/**
 * Get recent transactions across the platform
 */
export async function getRecentTransactions(limit = 10) {
  if (isDemoMode()) {
    return getDemoTransactions().slice(0, limit);
  }

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      user:profiles!transactions_user_id_fkey(
          id,
          full_name,
          email
      ),
      counterparty:profiles!transactions_counterparty_id_fkey(
          id,
          full_name,
          email
      )
  `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getTotalCount() {
  if (isDemoMode()) {
    return getDemoTransactions().length;
  }

  const { count, error } = await supabase.from("transactions").select("id", { count: "exact", head: true });
  if (error) throw error;
  return count || 0;
}

/**
 * Simulate a deposit: increase wallet balance and create verified transaction.
 */
export async function depositSimulation(userId, amount, source = "bank") {
  if (isDemoMode()) {
    const amt = Number(amount || 0);
    updateDemoWalletBalance(amt);
    return addDemoTransaction({
      type: "deposit",
      amount: amt,
      counterparty_name: source === "bank" ? "HDFC Bank Settlement" : source,
      note: "Capital Inflow via Bank RTGS",
    });
  }

  // Update wallet balance
  const wallet = await getWallet(userId);
  const newBalance = (wallet?.balance || 0) + Number(amount || 0);
  await updateWalletBalance(userId, newBalance);

  // Create transaction
  const tx = await createTransaction({ userId, type: "deposit", amount: Number(amount), counterpartyName: source, status: "verified" });
  return tx;
}

/**
 * Simulate a withdraw: decrease wallet balance and create verified transaction.
 */
export async function withdrawSimulation(userId, amount, destination = "bank") {
  if (isDemoMode()) {
    const amt = Number(amount || 0);
    const current = getDemoWallet().balance;
    if (current < amt) throw new Error("Insufficient balance");
    updateDemoWalletBalance(-amt);
    return addDemoTransaction({
      type: "withdraw",
      amount: -amt,
      counterparty_name: destination === "bank" ? "HDFC Bank Settlement" : destination,
      note: "Treasury Rebalancing Payout",
    });
  }

  const wallet = await getWallet(userId);
  const newBalance = (wallet?.balance || 0) - Number(amount || 0);
  if (newBalance < 0) throw new Error("Insufficient balance");
  await updateWalletBalance(userId, newBalance);

  const tx = await createTransaction({ userId, type: "withdraw", amount: -Number(amount), counterpartyName: destination, status: "verified" });
  return tx;
}

/**
 * Transfer between users (simulated): debit sender, credit recipient, create two transactions.
 * recipientIdentifier can be an email or user id.
 * Uses atomic execute_transfer RPC function to enforce strict RLS and avoid cross-user permission violations.
 */
export async function transferBetweenUsers(senderId, recipientIdentifier, amount, note = null) {
  const amt = Number(amount);
  if (isNaN(amt) || amt <= 0) throw new Error("Invalid amount");

  if (isDemoMode()) {
    const current = getDemoWallet().balance;
    if (current < amt) throw new Error("Insufficient balance");
    updateDemoWalletBalance(-amt);
    const sentTx = addDemoTransaction({
      type: "transfer",
      amount: -amt,
      counterparty_name: recipientIdentifier || "CresoX Network Partner",
      note: note || "Transfer between users",
    });
    return {
      sentTx,
      recvTx: { id: `TXN-${Math.floor(10000 + Math.random() * 90000)}` },
    };
  }

  // Call the atomic SECURITY DEFINER function
  const { data, error } = await supabase.rpc("execute_transfer", {
    p_sender_id: senderId,
    p_recipient_identifier: recipientIdentifier,
    p_amount: amt,
    p_note: note,
  });

  if (error) {
    throw new Error(error.message || "Transfer failed");
  }

  // Non-blocking hash write if client wants to record hash
  try {
    if (data?.sent_tx_id) {
      const sentHash = await hashWalletTransaction(data.sent_tx_id, {
        userId: senderId,
        type: "transfer_sent",
        amount: -amt,
        counterpartyId: data.recipient_id,
        note,
      });
      await supabase.from("transactions").update({ blockchain_hash: sentHash }).eq("id", data.sent_tx_id);
    }
  } catch (err) {
    console.error("[blockchain] Failed to record sent transaction hash:", err.message);
  }

  return {
    sentTx: { id: data?.sent_tx_id },
    recvTx: { id: data?.recv_tx_id },
  };
}
