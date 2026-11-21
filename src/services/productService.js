import { supabase } from "./supabase";
import { createTransaction } from "./transactionService";
import { getWallet, updateWalletBalance } from "./walletService";
import { hashTokenPurchase, hashOwnershipChange, hashAssetCreation } from "./hashService";
import {
  isDemoMode,
  getDemoProducts,
  getDemoOrders,
  addDemoOrder,
} from "../data/demoData";

/**
 * Fetch all products with optional filters.
 * @param {{ search?: string, category?: string }} filters
 */
export async function getProducts({ search = "", category = "" } = {}) {
  if (isDemoMode()) {
    let list = getDemoProducts();
    if (category && category !== "All") {
      list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }

  let query = supabase
    .from("products")
    .select(
      `
      *,
      seller:profiles(full_name, email, verification_status)
    `
    )
    .order("created_at", { ascending: false });

  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * Create a new product and fire a blockchain hash for the asset listing event.
 */
export async function createProduct(productData) {
  //Default pricing values for future dynamic pricing
  const defaultPricing = {
    current_price: productData.price ?? 0,
    previous_price: productData.price ?? 0,
    daily_change: 0,
    daily_change_percent: 0,
    price_history: [],
    last_price_update: new Date().toISOString(),
  };

  const payload = {
    ...productData,
    ...defaultPricing,
  };

  const { data, error } = await supabase
    .from("products")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;

  // Blockchain: hash the asset creation event (non-blocking)
  try {
    await hashAssetCreation(data.id, {
      title: data.title,
      category: data.category,
      price: data.price,
      seller_id: data.seller_id,
    });
  } catch (err) {
    console.error("[blockchain] Asset creation hash failed:", err.message);
  }

  return data;
}

/**
 * Update an existing product (sellers can only update their own — enforced by RLS).
 */
export async function updateProduct(id, fields) {
  const { data, error } = await supabase
    .from("products")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a product (RLS ensures only the seller can do this).
 */
export async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Upload a product image to Supabase Storage.
 * Returns the public URL.
 */
export async function uploadProductImage(file, userId) {
  const ext = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Create an order when a buyer purchases a product.
 * Uses atomic execute_purchase RPC function to enforce strict RLS and avoid cross-user wallet conflicts.
 */
export async function createOrder({ buyerId, sellerId, productId }) {
  if (isDemoMode()) {
    const list = getDemoProducts();
    const product = list.find((p) => p.id === productId) || list[0];
    const order = addDemoOrder(product);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("orders:changed"));
      window.dispatchEvent(new Event("marketplace:changed"));
    }
    return order;
  }

  const { data, error } = await supabase.rpc("execute_purchase", {
    p_buyer_id: buyerId,
    p_product_id: productId,
  });

  if (error) {
    throw new Error(error.message || "Failed to create order.");
  }

  // ── Blockchain hashes (fire and forget) ────────────────────────────
  try {
    if (data?.order_id) {
      await hashTokenPurchase(data.order_id, {
        buyerId,
        sellerId: data.seller_id || sellerId,
        assetId: productId,
        assetTitle: data.title || "Asset",
        price: data.price,
      });

      await hashOwnershipChange(productId, {
        userId: buyerId,
        previousPct: 0,
        newPct: 1,
        trigger: "purchase",
      });
    }
  } catch (err) {
    console.error("[blockchain] Order hash generation failed:", err.message);
  }

  return {
    id: data?.order_id,
    buyer_id: data?.buyer_id,
    seller_id: data?.seller_id,
    product_id: data?.product_id,
    status: data?.status || "pending",
    created_at: data?.created_at,
  };
}

/**
 * Get orders for the current user (as buyer or seller).
 */
export async function getMyOrders(userId) {
  if (isDemoMode()) {
    return getDemoOrders();
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      product:products(id, title, price, image_url),
      buyer:profiles!orders_buyer_id_fkey(full_name),
      seller:profiles!orders_seller_id_fkey(full_name)
    `
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get the user's own products (for seller dashboard).
 */
export async function getMyProducts(sellerId) {
  if (isDemoMode()) {
    return getDemoProducts().slice(0, 2);
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch recent products with optional limit.
 */
export async function getRecentProducts(limit = 3) {
  if (isDemoMode()) {
    return getDemoProducts().slice(0, limit);
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      seller:profiles(full_name, verification_status)
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch recent orders across the platform (admin/dashboard view)
 */
export async function getRecentOrdersGlobal(limit = 5) {
  if (isDemoMode()) {
    return getDemoOrders().slice(0, limit);
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      product:products(id,title,price,image_url),
      buyer:profiles!orders_buyer_id_fkey(full_name),
      seller:profiles!orders_seller_id_fkey(full_name)
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/**
 * Get counts of orders for a user (received as seller, purchased as buyer).
 */
export async function getOrdersCounts(userId) {
  if (isDemoMode()) {
    return {
      received: 1,
      purchased: 4,
    };
  }

  const [receivedRes, purchasedRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", userId),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("buyer_id", userId),
  ]);

  if (receivedRes.error) throw receivedRes.error;
  if (purchasedRes.error) throw purchasedRes.error;

  return {
    received: receivedRes.count || 0,
    purchased: purchasedRes.count || 0,
  };
}

/**
 * Fetch recent orders related to the user (buyer or seller).
 */
export async function getRecentOrders(userId, limit = 5) {
  if (isDemoMode()) {
    return getDemoOrders().slice(0, limit);
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      product:products(id,title,price,image_url),
      buyer:profiles!orders_buyer_id_fkey(full_name),
      seller:profiles!orders_seller_id_fkey(full_name)
    `
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/**
 * Get total counts for products and orders in the marketplace.
 */
export async function getGlobalCounts() {
  if (isDemoMode()) {
    return {
      products: getDemoProducts().length,
      orders: getDemoOrders().length,
    };
  }

  const [productsRes, ordersRes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
  ]);

  if (productsRes.error) throw productsRes.error;
  if (ordersRes.error) throw ordersRes.error;

  return {
    products: productsRes.count || 0,
    orders: ordersRes.count || 0,
  };
}

/**
 * Fetch a single product by id with seller info.
 */
export async function getProduct(id) {
  if (isDemoMode()) {
    const list = getDemoProducts();
    const found = list.find((p) => p.id === id);
    return found || list[0] || null;
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      seller:profiles(full_name, email, verification_status)
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data ?? null;
}

/**
 * Fetch related products by category excluding a product id.
 */
export async function getRelatedProducts(category, excludeId) {
  if (isDemoMode()) {
    return getDemoProducts()
      .filter((p) => p.id !== excludeId && (!category || p.category === category))
      .slice(0, 6);
  }

  if (!category) return [];
  const { data, error } = await supabase
    .from("products")
    .select(
      `*, seller:profiles(full_name, email, verification_status)`
    )
    .eq("category", category)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) throw error;
  return data ?? [];
}

export function calculatePriceChange(currentPrice, previousPrice) {
  const current = Number(currentPrice || 0);
  const previous = Number(previousPrice || 0);

  const change = current - previous;
  const percent = previous === 0 ? 0 : (change / previous) * 100;
  let trend = "stable";

  if (change > 0) trend = "up";
  else if (change < 0) trend = "down";

  return {
    daily_change: Number(change.toFixed(2)),
    daily_change_percent: Number(percent.toFixed(2)),
    trend,
  };
}

export async function updateTokenPrice(productId, newPrice) {
  const product = await getProduct(productId);
  if (!product) throw new Error("Product not found.");

  const pricing = calculatePriceChange(newPrice, product.current_price);

  return updateProduct(productId, {
    current_price: newPrice,
    previous_price: product.current_price,
    daily_change: pricing.daily_change,
    daily_change_percent: pricing.daily_change_percent,
    trend: pricing.trend,
    last_price_update: new Date().toISOString(),
  });
}

export async function getPriceHistory(productId) {
  const product = await getProduct(productId);

  return product?.price_history ?? [];
}

export async function getMarketplaceSummary() {
  const products = await getProducts();

  return {
    totalAssets: products.length,
    totalMarketValue: products.reduce((sum, product) => sum + Number(product.current_price || 0), 0),
  };
}
