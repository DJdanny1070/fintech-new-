/**
 * ─── Price Service ────────────────────────────────────────────────────────────
 *
 * Architecture note
 * -----------------
 * This module is the SINGLE source of truth for token pricing data.
 * It currently uses a deterministic pseudo-random engine so the UI can
 * demonstrate live-feeling price updates without any external dependency.
 *
 * When you are ready to connect real market data:
 *  1. Replace `_mockSnapshot` with a real REST/WebSocket fetch.
 *  2. Replace `_mockTick`    with real delta events from the feed.
 *  3. The hook (usePricing.js) and all UI components remain unchanged.
 *
 * Shape of a PriceRecord
 * ----------------------
 * {
 *   productId    : string,
 *   currentPrice : number,          // INR – current token price
 *   openPrice    : number,          // INR – price at market open (00:00 IST)
 *   dailyChange  : number,          // INR delta  (currentPrice - openPrice)
 *   pctChange    : number,          // percentage (dailyChange / openPrice * 100)
 *   trend        : 'up'|'down'|'flat',
 *   high24h      : number,          // 24-hour high
 *   low24h       : number,          // 24-hour low
 *   volume24h    : number,          // indicative unit volume
 *   priceHistory : number[],        // last 30 data-points (oldest → newest)
 *   lastUpdated  : string,          // ISO timestamp
 *   source       : 'mock'|'live',   // swap to 'live' when real feed is wired
 * }
 */

// ── Deterministic seeding helpers ─────────────────────────────────────────────

/**
 * Simple deterministic hash → number in [0, 1)
 * Used to give each product a stable base price and volatility signature.
 */
function _seed(id = "") {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h) / 2_147_483_647;
}

/**
 * Seeded LCG (linear congruential generator) – deterministic sequence.
 * Returns a stateful next() function that always produces the same sequence
 * for a given seed.
 */
function _lcg(seed) {
  let s = Math.abs(Math.round(seed * 1_000_000)) || 1;
  return {
    next() {
      s = (1_664_525 * s + 1_013_904_223) & 0xffffffff;
      return (s >>> 0) / 0x100000000; // [0, 1)
    },
  };
}

// ── Mock price engine ─────────────────────────────────────────────────────────

/**
 * Generate the INITIAL price snapshot for a product.
 * The snapshot is deterministic – the same product id always yields the same
 * open price, range, and price history baseline.
 *
 * @param {string} productId
 * @param {number} listedPrice  – the price stored in the DB (used as anchor)
 * @returns {import('./priceService').PriceRecord}
 */
export function _mockSnapshot(productId, listedPrice = 0) {
  const rng = _lcg(_seed(productId));
  const anchor = listedPrice > 0 ? listedPrice : 100_000;

  // Base "open" price sits within ±5% of the listed price
  const openPrice = anchor * (0.95 + rng.next() * 0.1);

  // Simulate 30-point intraday history (oldest → newest)
  const history = [];
  let v = openPrice;
  for (let i = 0; i < 30; i++) {
    const change = (rng.next() - 0.49) * 0.015 * v; // ±0.75% per tick
    v = Math.max(v + change, openPrice * 0.8);
    history.push(Math.round(v));
  }

  const currentPrice = history[history.length - 1];
  const dailyChange = currentPrice - openPrice;
  const pctChange = openPrice > 0 ? (dailyChange / openPrice) * 100 : 0;

  const prices = history;
  const high24h = Math.max(...prices);
  const low24h = Math.min(...prices);

  return {
    productId,
    currentPrice,
    openPrice: Math.round(openPrice),
    dailyChange: Math.round(dailyChange),
    pctChange: parseFloat(pctChange.toFixed(2)),
    trend: pctChange > 0.01 ? "up" : pctChange < -0.01 ? "down" : "flat",
    high24h,
    low24h,
    volume24h: Math.round(rng.next() * 500 + 50),
    priceHistory: prices,
    lastUpdated: new Date().toISOString(),
    source: "mock",
  };
}

/**
 * Apply one simulated tick to an existing PriceRecord.
 * In a live system this would be replaced by a WebSocket delta message.
 *
 * @param {object} prev  – existing PriceRecord
 * @returns {object}     – new PriceRecord (immutable update)
 */
export function _mockTick(prev) {
  // Small random walk: ±0.4% per tick
  const drift = (Math.random() - 0.496) * 0.008;
  const newPrice = Math.max(
    Math.round(prev.currentPrice * (1 + drift)),
    Math.round(prev.openPrice * 0.7)
  );

  const dailyChange = newPrice - prev.openPrice;
  const pctChange =
    prev.openPrice > 0 ? (dailyChange / prev.openPrice) * 100 : 0;

  // Keep last 30 points in history
  const priceHistory = [...prev.priceHistory.slice(-29), newPrice];

  const high24h = Math.max(prev.high24h, newPrice);
  const low24h = Math.min(prev.low24h, newPrice);

  return {
    ...prev,
    currentPrice: newPrice,
    dailyChange: Math.round(dailyChange),
    pctChange: parseFloat(pctChange.toFixed(2)),
    trend: pctChange > 0.01 ? "up" : pctChange < -0.01 ? "down" : "flat",
    priceHistory,
    high24h,
    low24h,
    volume24h: prev.volume24h + Math.round(Math.random() * 3),
    lastUpdated: new Date().toISOString(),
    source: "mock",
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Build the initial price map for a list of products.
 * Returns Map<productId, PriceRecord>.
 *
 * TODO (live): Replace the body with a single batch REST call, e.g.:
 *   const res = await fetch(`${MARKET_API}/prices?ids=${ids.join(',')}`);
 *   const data = await res.json();
 *   return new Map(data.map(r => [r.productId, r]));
 *
 * @param {Array<{id: string, price: number}>} products
 * @returns {Map<string, object>}
 */
export function buildPriceMap(products) {
  const map = new Map();
  for (const p of products) {
    map.set(p.id, _mockSnapshot(p.id, Number(p.price) || 0));
  }
  return map;
}

/**
 * Tick all prices in the map (simulate live updates).
 * Returns a NEW Map so React state updates are detected correctly.
 *
 * TODO (live): This function becomes a no-op; price updates come from a
 *   WebSocket listener that calls setPriceMap directly in the hook.
 *
 * @param {Map<string, object>} prev
 * @returns {Map<string, object>}
 */
export function tickAllPrices(prev) {
  const next = new Map();
  for (const [id, record] of prev) {
    // Only ~40% of assets move on each tick (realistic sparse updates)
    next.set(id, Math.random() < 0.4 ? _mockTick(record) : record);
  }
  return next;
}

/**
 * Simulate an admin price override.
 * In a live system this would call a secured admin API endpoint.
 *
 * @param {Map<string, object>} priceMap
 * @param {string}  productId
 * @param {number}  newPrice   – admin-specified new token price
 * @returns {Map<string, object>}
 */
export function adminOverridePrice(priceMap, productId, newPrice) {
  const prev = priceMap.get(productId);
  if (!prev) return priceMap;

  const updated = {
    ...prev,
    currentPrice: Math.round(newPrice),
    dailyChange: Math.round(newPrice - prev.openPrice),
    pctChange: parseFloat(
      (((newPrice - prev.openPrice) / prev.openPrice) * 100).toFixed(2)
    ),
    trend:
      newPrice > prev.openPrice
        ? "up"
        : newPrice < prev.openPrice
        ? "down"
        : "flat",
    priceHistory: [...prev.priceHistory.slice(-29), Math.round(newPrice)],
    lastUpdated: new Date().toISOString(),
    source: "mock", // change to 'admin' or 'live' as needed
  };

  const next = new Map(priceMap);
  next.set(productId, updated);
  return next;
}
