import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/common/ToastProvider";
import { getProducts, getMyOrders } from "../services/productService";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import "./Marketplace.css";
import "./Dashboard.css";

// ─── Constants ───────────────────────────────────────────────────────────────

const CATS = [
  "All",
  "Real Estate",
  "Renewable Energy",
  "Infrastructure",
  "Receivables",
  "Arts & Collectibles",
  "Other",
];

const CAT_ICONS = {
  "Real Estate":        "🏢",
  "Renewable Energy":   "☀️",
  "Infrastructure":     "🏗️",
  "Receivables":        "📄",
  "Arts & Collectibles":"🎨",
  "Other":              "📦",
};

// Deterministic mock daily trend per product id (seed via id chars)
function mockTrend(id = "") {
  const seed = id.charCodeAt(0) + (id.charCodeAt(1) || 0);
  const pct = ((seed % 19) - 8) / 10; // range -0.8% to +1.0%
  return pct;
}

// Micro sparkline — 12-point mock data seeded from id
function Sparkline({ id = "", trend = 0 }) {
  const seed = (id.charCodeAt(0) || 50) + (id.charCodeAt(2) || 30);
  const pts = Array.from({ length: 12 }, (_, i) => {
    const base = 50 + Math.sin((seed + i) * 0.8) * 15;
    return base + i * trend * 3;
  });
  const W = 200, H = 44;
  const min = Math.min(...pts);
  const max = Math.max(...pts) - min || 1;
  const coords = pts
    .map((v, i) => `${(i / (pts.length - 1)) * W},${H - 4 - ((v - min) / max) * (H - 8)}`)
    .join(" ");
  const area = `0,${H} ` + coords + ` ${W},${H}`;
  const upColor = "#16A34A";
  const downColor = "#E0010B";
  const color = trend >= 0 ? upColor : downColor;

  return (
    <svg className="cp-sparkline" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${id})`} />
      <polyline
        points={coords}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Donut chart for portfolio allocation
function DonutChart({ slices }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const radius = 52;
  const cx = 70, cy = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const COLORS = ["#075AD8", "#16A34A", "#D97706", "#E0010B", "#6B7280", "#4FA3FF"];

  return (
    <div className="cp-donut-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {slices.map((s, i) => {
          const pct = s.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={s.label}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={COLORS[i % COLORS.length]}
              strokeWidth="18"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
            />
          );
          offset += dash;
          return el;
        })}
        <circle cx={cx} cy={cy} r={radius - 9} fill="var(--bg-white)" />
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="Inter">
          Assets
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--text-primary)" fontFamily="Inter">
          {slices.length}
        </text>
      </svg>

      <div className="cp-donut-legend">
        {slices.map((s, i) => (
          <div className="cp-donut-legend-row" key={s.label}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="cp-donut-dot" style={{ background: COLORS[i % COLORS.length] }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.label}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
              {((s.value / (slices.reduce((a, x) => a + x.value, 0) || 1)) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Format INR
function fmt(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

// ─── Trade Modal ─────────────────────────────────────────────────────────────

const MODAL_CONFIGS = {
  buy: {
    title: "Buy Token",
    color: "var(--green)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    btnLabel: "Confirm Purchase",
    btnClass: "btn-primary",
  },
  sell: {
    title: "Sell Token",
    color: "var(--red)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
        <polyline points="17 18 23 18 23 12" />
      </svg>
    ),
    btnLabel: "Confirm Sale",
    btnClass: "btn-ghost",
  },
  transfer: {
    title: "Transfer Token",
    color: "var(--blue)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    btnLabel: "Initiate Transfer",
    btnClass: "btn-primary",
  },
};

function TradeModal({ mode, asset, onClose }) {
  const { wallet } = useAuth();
  const toast = useToast();
  const cfg = MODAL_CONFIGS[mode];
  const [qty, setQty] = useState("1");
  const [recipient, setRecipient] = useState("");
  const trend = mockTrend(asset?.id);
  const price = Number(asset?.price || 0);
  const total = price * (parseInt(qty) || 0);
  const balance = wallet?.balance ?? 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    // ── STUB: no real payment processing ──────────────────────────
    // When the trading engine is implemented, replace this block with
    // the appropriate service call (e.g. createTradeOrder, createTransfer).
    // For now we surface a clear notice to the user that this is a preview.
    toast.info(
      mode === "transfer"
        ? "Transfer queued — trading engine coming soon."
        : `${mode === "buy" ? "Buy" : "Sell"} order noted — trading engine coming soon.`
    );
    onClose();
  };

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cp-modal__header">
          <div className="cp-modal__title" style={{ color: cfg.color }}>
            {cfg.icon}
            {cfg.title}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            style={{ padding: "4px 8px", lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cp-modal__body">
            {/* Asset info */}
            <div className="cp-modal__asset-row">
              <div className="cp-token-icon" style={{ fontSize: 18 }}>
                {CAT_ICONS[asset?.category] || "📦"}
              </div>
              <div className="cp-modal__asset-info">
                <div className="cp-modal__asset-name">{asset?.title || "—"}</div>
                <div className="cp-modal__asset-price">
                  Token price: {fmt(price)} · {asset?.category}
                </div>
              </div>
              {trend >= 0 ? (
                <div className="cp-trend cp-trend--up">+{(trend * 100).toFixed(2)}%</div>
              ) : (
                <div className="cp-trend cp-trend--down">{(trend * 100).toFixed(2)}%</div>
              )}
            </div>

            {/* Quantity */}
            <div className="cp-modal__field">
              <label htmlFor="cp-qty">
                {mode === "transfer" ? "Token units" : "Quantity (units)"}
              </label>
              <input
                id="cp-qty"
                className="input"
                type="number"
                min="1"
                max="1000"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                required
              />
            </div>

            {/* Transfer recipient */}
            {mode === "transfer" && (
              <div className="cp-modal__field">
                <label htmlFor="cp-recipient">Recipient wallet address / email</label>
                <input
                  id="cp-recipient"
                  className="input"
                  type="text"
                  placeholder="USR-XXXXXXXX or you@example.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Summary */}
            <div className="cp-modal__summary">
              <div className="cp-modal__summary-row">
                <span style={{ color: "var(--text-muted)" }}>Token price</span>
                <span>{fmt(price)}</span>
              </div>
              <div className="cp-modal__summary-row">
                <span style={{ color: "var(--text-muted)" }}>Quantity</span>
                <span>{parseInt(qty) || 0} units</span>
              </div>
              {mode !== "transfer" && (
                <div className="cp-modal__summary-row">
                  <span style={{ color: "var(--text-muted)" }}>Wallet balance</span>
                  <span>{fmt(balance)}</span>
                </div>
              )}
              <div className="cp-modal__summary-row">
                <span>Total</span>
                <span style={{ color: cfg.color }}>{fmt(total)}</span>
              </div>
            </div>

            {/* Coming-soon notice */}
            <div className="cp-modal__notice">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>
                Live token trading is coming soon. This order will be queued for
                execution once the trading engine is live. No funds will be deducted.
              </span>
            </div>
          </div>

          <div className="cp-modal__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={`btn ${cfg.btnClass}`}>
              {cfg.btnLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Token card ──────────────────────────────────────────────────────────────

function TokenCard({ product, owned, onAction }) {
  const trend = mockTrend(product.id);
  const price = Number(product.price || 0);
  const isVerified = Boolean(product.blockchain_hash);

  // Deterministic ownership pct (mock, seed from id)
  const ownershipPct = owned
    ? Math.min(100, 5 + ((product.id.charCodeAt(1) || 40) % 30))
    : 0;

  return (
    <div className="cp-token-card">
      {/* Head */}
      <div className="cp-token-card__head">
        <div className="cp-token-icon">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} />
          ) : (
            CAT_ICONS[product.category] || "📦"
          )}
        </div>
        <div className="cp-token-card__meta">
          <div className="cp-token-card__name" title={product.title}>{product.title}</div>
          <div className="cp-token-card__category">{product.category || "Other"}</div>
        </div>
        <div
          className={`cp-token-badge ${isVerified ? "cp-token-badge--verified" : "cp-token-badge--pending"}`}
        >
          {isVerified ? "✔ On-chain" : "⏳ Pending"}
        </div>
      </div>

      {/* Sparkline */}
      <Sparkline id={product.id} trend={trend} />

      {/* Price + trend */}
      <div className="cp-price-row">
        <div>
          <div className="cp-price__label">Token Price</div>
          <div className="cp-price">{fmt(price)}</div>
        </div>
        {trend >= 0 ? (
          <div className="cp-trend cp-trend--up">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            +{(trend * 100).toFixed(2)}% today
          </div>
        ) : (
          <div className="cp-trend cp-trend--down">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            {(trend * 100).toFixed(2)}% today
          </div>
        )}
      </div>

      {/* Ownership */}
      <div className="cp-ownership">
        <div className="cp-ownership__row">
          <span>Your ownership</span>
          <span className="cp-ownership__val">
            {owned ? `${ownershipPct.toFixed(1)}%` : "None"}
          </span>
        </div>
        <div className="cp-ownership__bar">
          <div
            className="cp-ownership__fill"
            style={{ width: `${ownershipPct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="cp-actions">
        <button
          className="cp-action-btn cp-action-btn--buy"
          onClick={() => onAction("buy", product)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          Buy
        </button>
        <button
          className="cp-action-btn cp-action-btn--sell"
          onClick={() => onAction("sell", product)}
          disabled={!owned}
          title={!owned ? "You don't hold this token" : undefined}
          style={!owned ? { opacity: 0.4, cursor: "not-allowed" } : {}}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
          </svg>
          Sell
        </button>
        <button
          className="cp-action-btn"
          onClick={() => onAction("transfer", product)}
          disabled={!owned}
          title={!owned ? "You don't hold this token" : undefined}
          style={!owned ? { opacity: 0.4, cursor: "not-allowed" } : {}}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Transfer
        </button>
      </div>
    </div>
  );
}

// ─── Portfolio tab ────────────────────────────────────────────────────────────

function PortfolioTab({ ownedProducts, allProducts }) {
  const totalValue = ownedProducts.reduce((s, p) => s + Number(p.price || 0), 0);
  const unrealizedPnl = ownedProducts.reduce((s, p) => {
    const trend = mockTrend(p.id);
    return s + Number(p.price || 0) * trend;
  }, 0);

  // Category allocation for donut
  const catMap = {};
  ownedProducts.forEach((p) => {
    const cat = p.category || "Other";
    catMap[cat] = (catMap[cat] || 0) + Number(p.price || 0);
  });
  const slices = Object.entries(catMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  if (ownedProducts.length === 0) {
    return (
      <div className="content-card">
        <div className="cp-empty">
          <div className="cp-empty__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className="cp-empty__title">No holdings yet</div>
          <div className="cp-empty__sub">
            Purchase tokenized assets from the Explore tab to build your portfolio.
            All trades are blockchain-verified.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-portfolio-grid">
      {/* Left — holdings table */}
      <div className="content-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          className="cp-portfolio-row cp-portfolio-row__th"
          style={{ background: "var(--bg)", borderRadius: "var(--r-lg) var(--r-lg) 0 0" }}
        >
          <span>Asset</span>
          <span>Token Price</span>
          <span>Daily Trend</span>
          <span>Ownership</span>
          <span style={{ textAlign: "right" }}>Value</span>
        </div>
        <div className="cp-portfolio-list">
          {ownedProducts.map((p) => {
            const trend = mockTrend(p.id);
            const price = Number(p.price || 0);
            const ownershipPct = Math.min(100, 5 + ((p.id.charCodeAt(1) || 40) % 30));
            return (
              <div className="cp-portfolio-row" key={p.id}>
                <div className="cp-portfolio-name">
                  <div className="cp-portfolio-icon">
                    {CAT_ICONS[p.category] || "📦"}
                  </div>
                  <div>
                    <div className="cp-portfolio-title">{p.title}</div>
                    <div className="cp-portfolio-cat">{p.category || "Other"}</div>
                  </div>
                </div>
                <div className="cp-portfolio-val">{fmt(price)}</div>
                <div>
                  {trend >= 0 ? (
                    <span className="cp-trend cp-trend--up" style={{ fontSize: 12 }}>
                      +{(trend * 100).toFixed(2)}%
                    </span>
                  ) : (
                    <span className="cp-trend cp-trend--down" style={{ fontSize: 12 }}>
                      {(trend * 100).toFixed(2)}%
                    </span>
                  )}
                </div>
                <div className="cp-portfolio-muted">{ownershipPct.toFixed(1)}%</div>
                <div className="cp-portfolio-val" style={{ textAlign: "right" }}>
                  {fmt(price)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right — summary + donut */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
        <div className="cp-summary-card">
          <div className="cp-summary-card__title">Portfolio Summary</div>
          <div className="cp-summary-row">
            <span className="cp-summary-label">Total holdings</span>
            <span className="cp-summary-value">{ownedProducts.length}</span>
          </div>
          <div className="cp-summary-row">
            <span className="cp-summary-label">Invested value</span>
            <span className="cp-summary-value">{fmt(totalValue)}</span>
          </div>
          <div className="cp-summary-row">
            <span className="cp-summary-label">Unrealised P&L</span>
            <span className={`cp-summary-value ${unrealizedPnl >= 0 ? "green" : "red"}`}>
              {unrealizedPnl >= 0 ? "+" : ""}{fmt(Math.abs(unrealizedPnl))}
            </span>
          </div>
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "var(--sp-4)",
            }}
          >
            <div className="cp-summary-row">
              <span className="cp-summary-label" style={{ fontWeight: 700 }}>
                Portfolio value
              </span>
              <span className="cp-summary-value" style={{ fontSize: 18 }}>
                {fmt(totalValue + unrealizedPnl)}
              </span>
            </div>
          </div>
          <div
            style={{
              padding: "10px 14px",
              background: "var(--blue-light)",
              borderRadius: "var(--r-md)",
              fontSize: 12,
              color: "var(--blue)",
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            P&L values are indicative only. Live pricing will be enabled when the
            trading engine launches.
          </div>
        </div>

        {/* Donut allocation */}
        {slices.length > 0 && (
          <div className="cp-summary-card">
            <div className="cp-summary-card__title">Allocation</div>
            <DonutChart slices={slices} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Marketplace() {
  const { user, wallet } = useAuth();
  const toast = useToast();

  // ── Tab state
  const [tab, setTab] = useState("explore"); // 'explore' | 'portfolio'

  // ── Filters (Explore)
  const [cat, setCat]             = useState("All");
  const [searchInput, setSearch]  = useState("");
  const [sortBy, setSortBy]       = useState("newest");

  // ── Data
  const [products, setProducts]   = useState([]);
  const [ownedIds, setOwnedIds]   = useState(new Set()); // product IDs the user has bought
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState("");

  // ── Trade modal
  const [modal, setModal] = useState(null); // { mode: 'buy'|'sell'|'transfer', asset }

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debTimer = useRef(null);
  useEffect(() => {
    clearTimeout(debTimer.current);
    debTimer.current = setTimeout(() => setDebouncedSearch(searchInput.trim()), 250);
    return () => clearTimeout(debTimer.current);
  }, [searchInput]);

  // Load products + owned ids
  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setLoadError("");
    try {
      const [prods, orders] = await Promise.all([
        getProducts({}),
        getMyOrders(user.id),
      ]);
      setProducts(prods || []);
      const bought = new Set(
        (orders || [])
          .filter((o) => o.buyer_id === user.id && o.product_id)
          .map((o) => o.product_id)
      );
      setOwnedIds(bought);
    } catch (err) {
      setLoadError("Failed to load market data. Please try again.");
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => { load(); }, [load]);

  // ── Filtered/sorted products for Explore tab
  const visible = useMemo(() => {
    let result = [...products];
    if (cat !== "All") result = result.filter((p) => p.category === cat);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((p) =>
        `${p.title} ${p.description || ""} ${p.category || ""}`.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "price-asc":  result.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case "price-desc": result.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case "oldest":     result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break;
      default:           result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
    }
    return result;
  }, [products, cat, debouncedSearch, sortBy]);

  // Owned product objects
  const ownedProducts = useMemo(
    () => products.filter((p) => ownedIds.has(p.id)),
    [products, ownedIds]
  );

  // Stats
  const totalMarketValue = products.reduce((s, p) => s + Number(p.price || 0), 0);
  const portfolioValue   = ownedProducts.reduce((s, p) => s + Number(p.price || 0), 0);
  const avgTrend         = products.length
    ? products.reduce((s, p) => s + mockTrend(p.id), 0) / products.length
    : 0;

  const handleAction = (mode, asset) => setModal({ mode, asset });
  const handleCloseModal = () => setModal(null);

  return (
    <div>
      {/* ── Page header ─────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Client Portal</h1>
            <p>
              {products.length} tokenized assets available ·{" "}
              {ownedProducts.length} in your portfolio
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                background: "var(--bg-white)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                padding: "7px 14px",
                fontWeight: 500,
              }}
            >
              Wallet: <strong style={{ color: "var(--text-primary)" }}>
                {fmt(wallet?.balance ?? 0)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats strip ─────────────────────────────────── */}
      <div className="cp-stats">
        <div className="cp-stat">
          <div className="cp-stat__label">Total Assets</div>
          <div className="cp-stat__value">{products.length}</div>
          <div className="cp-stat__sub neutral">on platform</div>
        </div>
        <div className="cp-stat">
          <div className="cp-stat__label">Market Value</div>
          <div className="cp-stat__value">{fmt(totalMarketValue)}</div>
          <div className="cp-stat__sub neutral">cumulative</div>
        </div>
        <div className="cp-stat">
          <div className="cp-stat__label">Portfolio Value</div>
          <div className="cp-stat__value">{fmt(portfolioValue)}</div>
          <div className="cp-stat__sub neutral">your holdings</div>
        </div>
        <div className="cp-stat">
          <div className="cp-stat__label">Avg Daily Trend</div>
          <div className="cp-stat__value">
            {avgTrend >= 0 ? "+" : ""}
            {(avgTrend * 100).toFixed(2)}%
          </div>
          <div className={`cp-stat__sub ${avgTrend >= 0 ? "up" : "down"}`}>
            {avgTrend >= 0 ? "↑ Market positive" : "↓ Market negative"}
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <div className="cp-tabs">
        <button
          className={`cp-tab ${tab === "explore" ? "cp-tab--active" : ""}`}
          onClick={() => setTab("explore")}
        >
          Explore Assets
          <span
            style={{
              marginLeft: 6,
              fontSize: 11,
              background: "var(--blue-light)",
              color: "var(--blue)",
              borderRadius: "var(--r-full)",
              padding: "1px 7px",
              fontWeight: 700,
            }}
          >
            {products.length}
          </span>
        </button>
        <button
          className={`cp-tab ${tab === "portfolio" ? "cp-tab--active" : ""}`}
          onClick={() => setTab("portfolio")}
        >
          My Portfolio
          {ownedProducts.length > 0 && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                background: "var(--green-light)",
                color: "var(--green)",
                borderRadius: "var(--r-full)",
                padding: "1px 7px",
                fontWeight: 700,
              }}
            >
              {ownedProducts.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Explore tab ─────────────────────────────────── */}
      {tab === "explore" && (
        <>
          {/* Filters */}
          <div className="cp-filters">
            <div className="cp-search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--text-muted)" }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                placeholder="Search assets…"
                value={searchInput}
                onChange={(e) => setSearch(e.target.value)}
              />
              {searchInput && (
                <button
                  onClick={() => setSearch("")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px 4px", fontSize: 13 }}
                >
                  ✕
                </button>
              )}
            </div>
            <select
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ minWidth: 160, width: "auto" }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>

          {/* Category chips */}
          <div className="cp-cat-strip" style={{ marginBottom: "var(--sp-5)" }}>
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`btn btn-sm ${cat === c ? "btn-primary" : "btn-secondary"}`}
              >
                {c !== "All" && CAT_ICONS[c] ? `${CAT_ICONS[c]} ` : ""}
                {c}
              </button>
            ))}
          </div>

          {/* Error */}
          {loadError && (
            <div
              style={{
                background: "var(--red-light)",
                border: "1px solid rgba(224,1,11,0.18)",
                borderRadius: "var(--r-md)",
                padding: "12px 16px",
                color: "var(--red)",
                fontSize: 14,
                marginBottom: "var(--sp-5)",
              }}
            >
              {loadError}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="content-card">
              <LoadingSkeleton rows={3} />
            </div>
          ) : visible.length === 0 ? (
            <div className="content-card">
              <div className="cp-empty">
                <div className="cp-empty__icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div className="cp-empty__title">No assets found</div>
                <div className="cp-empty__sub">
                  {products.length === 0
                    ? "There are no tokenized assets listed yet. Check back soon."
                    : "Try adjusting your search or category filter."}
                </div>
                {(searchInput || cat !== "All") && (
                  <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(""); setCat("All"); }}>
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="cp-grid">
              {visible.map((p) => (
                <TokenCard
                  key={p.id}
                  product={p}
                  owned={ownedIds.has(p.id)}
                  onAction={handleAction}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Portfolio tab ────────────────────────────────── */}
      {tab === "portfolio" && (
        loading ? (
          <div className="content-card"><LoadingSkeleton rows={4} /></div>
        ) : (
          <PortfolioTab ownedProducts={ownedProducts} allProducts={products} />
        )
      )}

      {/* ── Trade modal ──────────────────────────────────── */}
      {modal && (
        <TradeModal
          mode={modal.mode}
          asset={modal.asset}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
