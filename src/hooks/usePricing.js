/**
 * ─── usePricing hook ──────────────────────────────────────────────────────────
 *
 * Manages the live-updating price map for all marketplace assets.
 *
 * Usage
 * -----
 *   const { priceFor, isLive, lastTick } = usePricing(products);
 *   const record = priceFor(product.id);
 *   // record.currentPrice, record.dailyChange, record.pctChange, etc.
 *
 * Architecture
 * ------------
 * The hook owns the price Map in React state and drives periodic ticks via
 * setInterval.  When a real WebSocket feed is available:
 *   1. Remove the setInterval block.
 *   2. Open a WebSocket inside the same useEffect.
 *   3. On each message, call setPriceMap(prev => { next = new Map(prev); next.set(id, msg); return next; })
 *
 * The rest of the codebase (TokenCard, PortfolioTab, stats strip) is already
 * wired to this hook and will pick up live data automatically.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { buildPriceMap, tickAllPrices, adminOverridePrice } from "../services/priceService";

// Tick interval in ms.
// TODO (live): Remove this constant once WebSocket feed is active.
const TICK_INTERVAL_MS = 4_000;

/**
 * @param {Array<{id: string, price: number}>} products
 * @param {{ tickMs?: number, enabled?: boolean }} options
 */
export function usePricing(products, { tickMs = TICK_INTERVAL_MS, enabled = true } = {}) {
  const [priceMap, setPriceMap] = useState(() => new Map());
  const [lastTick, setLastTick]   = useState(null);
  const [isLive]                  = useState(false); // flips to true when real feed connects
  const initializedRef            = useRef(false);

  // Build initial snapshots when products list changes
  useEffect(() => {
    if (!products || products.length === 0) return;
    setPriceMap(buildPriceMap(products));
    initializedRef.current = true;
  }, [products]);

  // Periodic tick – simulates streaming updates
  // TODO (live): Replace with WebSocket connection
  useEffect(() => {
    if (!enabled || !initializedRef.current) return;

    const id = setInterval(() => {
      setPriceMap((prev) => tickAllPrices(prev));
      setLastTick(new Date());
    }, tickMs);

    return () => clearInterval(id);
  }, [enabled, tickMs, products]); // re-subscribe if products change

  /**
   * Get the live PriceRecord for a product id.
   * Returns null if prices haven't loaded yet.
   *
   * @param {string} productId
   * @returns {object|null}
   */
  const priceFor = useCallback(
    (productId) => priceMap.get(productId) ?? null,
    [priceMap]
  );

  /**
   * Manually override a price (admin use).
   * In a live system, also fire an API call here.
   *
   * @param {string} productId
   * @param {number} newPrice
   */
  const adminSetPrice = useCallback(
    (productId, newPrice) => {
      setPriceMap((prev) => adminOverridePrice(prev, productId, newPrice));
    },
    []
  );

  return {
    priceMap,
    priceFor,
    adminSetPrice,
    isLive,
    lastTick,
    ready: priceMap.size > 0,
  };
}
