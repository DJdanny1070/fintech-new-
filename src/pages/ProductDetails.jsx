import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getProduct, getRelatedProducts, createOrder } from "../services/productService";
import { useToast } from "../components/common/ToastProvider";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import NetworkError from "../components/common/NetworkError";
import "./Dashboard.css";

function shortenHash(h) {
  if (!h) return "—";
  if (h.length <= 20) return h;
  return `${h.slice(0, 8)}...${h.slice(-6)}`;
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return "—";
  return `₹${numericValue.toLocaleString("en-IN")}`;
}

function formatSignedCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return "—";
  const prefix = numericValue > 0 ? "+" : numericValue < 0 ? "−" : "";
  return `${prefix}₹${Math.abs(numericValue).toLocaleString("en-IN")}`;
}

function formatPercentChange(value) {
  if (value === null || value === undefined || value === "") return "—";
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return "—";
  const prefix = numericValue > 0 ? "+" : numericValue < 0 ? "−" : "";
  return `${prefix}${Math.abs(numericValue).toFixed(2)}%`;
}

function formatTrendLabel(trend) {
  if (trend === "up") return "Trending Up";
  if (trend === "down") return "Trending Down";
  return "Stable";
}

function formatLastUpdated(value) {
  if (!value) return "Recently";
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "Recently";
  const diffMs = Date.now() - time;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return mins <= 1 ? "just now" : `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  return "Today";
}

function MarketMetric({ label, value, valueColor = "var(--text-primary)" }) {
  return (
    <div style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-white)" }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: valueColor }}>{value}</div>
    </div>
  );
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const p = await getProduct(id);
        if (!mounted) return;
        if (!p) {
          setError("Product not found.");
          setProduct(null);
          setRelated([]);
          return;
        }
        setProduct(p);
        const rel = await getRelatedProducts(p.category, p.id);
        if (!mounted) return;
        setRelated((rel || []).slice(0, 4));
      } catch (err) {
        const message = err?.message || "Failed to load product.";
        const isNotFound = err?.code === "PGRST116" || /no rows|not found/i.test(message);
        if (!mounted) return;
        setError(isNotFound ? "Product not found." : message);
        if (/failed to fetch|network/i.test(message)) {
          toast.error("Network error");
        } else if (isNotFound) {
          toast.warning("Product not found");
        }
        setProduct(null);
        setRelated([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [id]);

  const handleCopy = async () => {
    if (!product?.blockchain_hash) return;
    try {
      await navigator.clipboard.writeText(product.blockchain_hash);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Copy failed");
    }
  };

  const handleBuy = async () => {
    if (!user) {
      toast.info("Please log in to continue.");
      navigate("/login");
      return;
    }

    if (product.seller_id === user.id) {
      toast.error("You cannot buy your own product.");
      return;
    }

    setPlacing(true);
    try {
      await createOrder({ buyerId: user.id, sellerId: product.seller_id, productId: product.id });
      toast.success("Order created successfully.");
      window.dispatchEvent(new Event("orders:changed"));
      navigate("/dashboard");
    } catch (err) {
      const message = err?.message || "Failed to create order.";
      toast.error(/failed to fetch|network/i.test(message) ? "We couldn’t place the order right now. Please try again shortly." : message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="content-card">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-card">
        <NetworkError message={error} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="content-card">
        <div style={{textAlign:"center",padding:"var(--sp-8)",color:"var(--text-muted)"}}>
          Product not available.
        </div>
      </div>
    );
  }

  const isSeller = Boolean(user && product.seller_id === user.id);
  const canBuy = Boolean(user) && !isSeller;
  const currentPrice = product.current_price ?? product.price ?? null;
  const previousPrice = product.previous_price ?? product.current_price ?? product.price ?? null;
  const dailyChange = product.daily_change ?? null;
  const dailyChangePercent = product.daily_change_percent ?? null;
  const trend = product.trend ?? "stable";
  const lastPriceUpdate = product.last_price_update ?? product.last_updated ?? null;
  const hasPricingData = [currentPrice, previousPrice, dailyChange, dailyChangePercent, trend, lastPriceUpdate].some((value) => value !== null && value !== undefined && value !== "");
  const priceTone = trend === "up" ? "#16a34a" : trend === "down" ? "#dc2626" : "var(--text-muted)";
  const dailyTone = dailyChange > 0 ? "#16a34a" : dailyChange < 0 ? "#dc2626" : "var(--text-muted)";
  const percentTone = dailyChangePercent > 0 ? "#16a34a" : dailyChangePercent < 0 ? "#dc2626" : "var(--text-muted)";
  const trendLabel = trend === "up" ? "Trending Up" : trend === "down" ? "Trending Down" : "Stable";
  const verificationState = product.blockchain_hash ? "Verified" : "Pending";
  const tokenAvailability = product.quantity ?? product.available_units ?? product.availability ?? "Available";

  return (
    <div>
      <div className="page-header">
        <div className="page-header__row">
          <div>
            <h1>{product.title}</h1>
            <p>{product.category || "—"}</p>
          </div>
          <div>
            {isSeller ? (
              <span className="status-badge status-badge--pending">Your listing</span>
            ) : (
              <button className="btn btn-primary" onClick={handleBuy} disabled={placing}>
                {placing ? "Placing Order..." : canBuy ? "Buy Now" : "Login to Buy"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TODO (Future Integration): Real-time Token Pricing
          Replace hasPricingData static display with a live price feed.
          Subscribe to a WebSocket channel (e.g. priceService.subscribe(product.id))
          that pushes updated current_price, daily_change, and trend on tick. */}
      <div className="content-card product-detail-grid">
        <div>
          {product.image_url ? (
            <img src={product.image_url} alt={`${product.title} — product image`} style={{width:"100%",borderRadius:8}} />
          ) : (
            <div style={{width:"100%",height:200,background:"var(--bg)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-muted)",flexDirection:'column',gap:8}}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="14" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 21l-6-5-4 4-3-3-5 4"/></svg>
              <div style={{fontSize:13}}>Image not available</div>
            </div>
          )}
          <div style={{marginTop:12, display:"flex", flexDirection:"column", gap:10}}>
            <div style={{padding:"12px 14px", border:"1px solid var(--border)", borderRadius:10, background:"var(--bg)"}}>
              <div style={{fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--text-muted)", marginBottom:4}}>Current Price</div>
              {hasPricingData ? (
                <>
                  <div style={{fontSize:24, fontWeight:800, color:priceTone}}>{formatCurrency(currentPrice)}</div>
                  <div style={{marginTop:8, display:"grid", gap:8}}>
                    <MarketMetric label="Previous Price" value={formatCurrency(previousPrice)} />
                    <div style={{display:"grid", gridTemplateColumns:"repeat(2, minmax(0, 1fr))", gap:8}}>
                      <MarketMetric label="Daily Change" value={formatSignedCurrency(dailyChange)} valueColor={dailyTone} />
                      <MarketMetric label="Percentage Change" value={formatPercentChange(dailyChangePercent)} valueColor={percentTone} />
                    </div>
                    <MarketMetric label="Trend" value={trendLabel} valueColor={priceTone} />
                  </div>
                </>
              ) : (
                <div style={{fontSize:14, color:"var(--text-muted)", lineHeight:1.6}}>Price information is currently unavailable.</div>
              )}
            </div>

            <div style={{padding:"12px 14px", border:"1px solid var(--border)", borderRadius:10, background:"var(--bg)"}}>
              <div style={{fontWeight:700, marginBottom:8}}>Price History</div>
              <div style={{color:"var(--text-muted)", fontSize:13, lineHeight:1.6}}>Historical token pricing will be available in a future update.</div>
              <div style={{color:"var(--text-muted)", fontSize:13, lineHeight:1.6, marginTop:4}}>Live market analytics coming soon.</div>
              <div style={{marginTop:12, display:"flex", alignItems:"flex-end", gap:6, height:44}}>
                {[28, 40, 34, 52, 44].map((height, index) => (
                  <div key={index} style={{flex:1, height:`${height}px`, borderRadius:4, background:index % 2 === 0 ? "var(--blue-light)" : "var(--border)"}} />
                ))}
              </div>
            </div>

            <div style={{padding:"12px 14px", border:"1px solid var(--border)", borderRadius:10, background:"var(--bg)"}}>
              <div style={{fontWeight:700, marginBottom:10}}>Market Statistics</div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(2, minmax(0, 1fr))", gap:8}}>
                <MarketMetric label="Last Price Update" value={formatLastUpdated(lastPriceUpdate)} />
                <MarketMetric label="Current Trend" value={trendLabel} valueColor={priceTone} />
                <MarketMetric label="Blockchain Verification" value={verificationState} valueColor={product.blockchain_hash ? "#16a34a" : "var(--text-muted)"} />
                <MarketMetric label="Token Availability" value={tokenAvailability} />
              </div>
            </div>

            <div style={{padding:"12px 14px", border:"1px solid var(--border)", borderRadius:10, background:"var(--bg)"}}>
              <div style={{fontWeight:700, marginBottom:6}}>Price Management</div>
              <div style={{color:"var(--text-muted)", fontSize:13, lineHeight:1.6}}>Token prices are maintained by authorized CresoX administrators and will automatically reflect future market integrations.</div>
            </div>
          </div>
        </div>

        <div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{fontSize:18,fontWeight:700}}>{product.title}</div>
          </div>
          <div style={{marginTop:12,color:"var(--text-muted)"}}>{product.description || "No description provided."}</div>

          <div style={{marginTop:18,display:"flex",flexDirection:"column",gap:8}}>
            <div>
              <strong>Seller:</strong> {product.seller?.full_name || 'Unknown'} {product.seller?.verification_status === 'Verified' ? <span className="status-badge status-badge--verified">Verified Seller</span> : null}
            </div>
            <div>
              <strong>Blockchain:</strong> {product.blockchain_hash ? <span className="status-badge status-badge--verified">Verified</span> : <span className="status-badge status-badge--pending">Pending</span>}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{fontFamily:"monospace"}}>{shortenHash(product.blockchain_hash)}</div>
            {product.blockchain_hash && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleCopy}
                aria-label={`Copy blockchain hash: ${product.blockchain_hash.slice(0,12)}…`}
              >
                Copy
              </button>
            )}
            </div>
          </div>

          {/* Related products */}
          <div style={{marginTop:28}}>
            <div style={{fontWeight:700,marginBottom:8}}>Related Listings</div>
            {related.length === 0 ? (
              <div style={{color:"var(--text-muted)"}}>No related listings.</div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
                {related.map(r => (
                  <Link key={r.id} to={`/marketplace/product/${r.id}`} className="card-link" style={{padding:12,border:"1px solid var(--border)",borderRadius:8,textDecoration:"none",color:"inherit"}}>
                    <div style={{fontWeight:700}}>{r.title}</div>
                    <div style={{fontSize:12,color:"var(--text-muted)"}}>{r.seller?.full_name || 'Unknown'}</div>
                    <div style={{marginTop:6,fontFamily:"monospace",fontWeight:700}}>{r.price ? `₹${Number(r.price).toLocaleString('en-IN')}` : '—'}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;

