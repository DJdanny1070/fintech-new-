import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getProducts, getOrdersCounts, getRecentOrders, getGlobalCounts, getMyProducts } from "../services/productService";
import { getHashCount, getRecentHashes } from "../services/hashService";
import { getCounts, getRecentProfiles } from "../services/profileService";
import { getTotalCount, getTransactionsForUser } from "../services/transactionService";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import "./Dashboard.css";

function SummaryBarChart({ values, labels, color = "#38BDF8" }) {
  const safeValues = values.map((v, i) => Math.max(v || 0, [14, 22, 18, 29, 34, 42][i % 6]));
  const max = Math.max(1, ...safeValues);
  const width = 340;
  const height = 120;
  const stepX = width / Math.max(1, safeValues.length);
  const gradId = `barGrad-${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  const bars = safeValues.map((value, idx) => ({
    x: 10 + idx * stepX + 6,
    y: height - 24 - (value / max) * 68,
    h: Math.max(12, (value / max) * 68),
    value,
    label: labels[idx],
  }));

  return (
    <div style={{ marginTop: 14 }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: 120 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.25" />
          </linearGradient>
          <filter id={`glow-${gradId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <line x1="8" y1={height - 20} x2={width - 8} y2={height - 20} stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
        {bars.map((bar, idx) => (
          <g key={`${bar.label}-${idx}`} style={{ cursor: "pointer" }}>
            <rect
              x={bar.x}
              y={bar.y}
              width={26}
              height={bar.h}
              rx="5"
              fill={`url(#${gradId})`}
              filter={`url(#glow-${gradId})`}
            />
            <circle cx={bar.x + 13} cy={bar.y} r="2.5" fill="#FFFFFF" opacity="0.9" />
            <text x={bar.x + 13} y={bar.y - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill={color} style={{ fontFamily: "monospace" }}>
              {bar.value}
            </text>
            <text x={bar.x + 13} y={height - 6} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#64748B">
              {bar.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function CategoryBarChart({ items }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
      {items.map((item) => (
        <div key={item.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
            <span style={{ color: "#E2E8F0", fontWeight: 600 }}>{item.label}</span>
            <span style={{ color: "#38BDF8", fontWeight: 700, fontFamily: "monospace" }}>{item.value}</span>
          </div>
          <div style={{ height: 7, borderRadius: 999, background: "rgba(255, 255, 255, 0.06)", overflow: "hidden", position: "relative" }}>
            <div
              style={{
                width: `${(item.value / max) * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, #0260C6 0%, #38BDF8 100%)",
                boxShadow: "0 0 10px rgba(56, 189, 248, 0.4)",
                borderRadius: 999,
                transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatBalance(amount) {
  if (!amount && amount !== 0) return "—";
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function formatLoginDate(value) {
  if (!value) return "Recently signed in";
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function Dashboard() {
  const { profile, wallet, user } = useAuth();
  const [allProducts, setAllProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersSummary, setOrdersSummary] = useState({ received: 0, purchased: 0 });
  const [hashRecords, setHashRecords] = useState(0);
  const [globalCounts, setGlobalCounts] = useState({ products: 0, orders: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recentHashes, setRecentHashes] = useState([]);
  const [myProductsCount, setMyProductsCount] = useState(0);
  const [profileCounts, setProfileCounts] = useState({ users: 0, verified_sellers: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  const loadDashboard = useCallback(async () => {
    if (!user) return;

    setLoadingData(true);
    setDashboardError("");

    try {
      const [myProducts, productsData, recentOrds, counts, hashCount, globalCountsData, recentUsersData, txs, hashRecordsData, profileMetrics, transactionCount] = await Promise.all([
        getMyProducts(user.id),
        getProducts({}),
        getRecentOrders(user.id, 8),
        getOrdersCounts(user.id),
        getHashCount(),
        getGlobalCounts(),
        getRecentProfiles(6),
        getTransactionsForUser(user.id, 10),
        getRecentHashes(8),
        getCounts(),
        getTotalCount(),
      ]);

      const sortedProducts = (productsData || []).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      setMyProductsCount(myProducts?.length || 0);
      setAllProducts(sortedProducts);
      setRecentProducts(sortedProducts.slice(0, 4));
      setRecentOrders(recentOrds || []);
      setRecentUsers(recentUsersData || []);
      setTransactions(txs || []);
      setRecentHashes(hashRecordsData || []);
      setOrdersSummary(counts || { received: 0, purchased: 0 });
      setHashRecords(hashCount || 0);
      setGlobalCounts(globalCountsData || { products: 0, orders: 0 });
      setProfileCounts(profileMetrics || { users: 0, verified_sellers: 0 });
      setDashboardError("");
      setHashRecords((hashCount || 0) + (transactionCount || 0));
    } catch (err) {
      console.error("Dashboard load error:", err.message);
      setDashboardError(err.message || "We couldn’t load your dashboard data right now.");
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboard();

    const handleMarketplaceChanged = () => {
      loadDashboard();
    };
    const handleOrdersChanged = () => {
      loadDashboard();
    };

    window.addEventListener("marketplace:changed", handleMarketplaceChanged);
    window.addEventListener("orders:changed", handleOrdersChanged);
    return () => {
      window.removeEventListener("marketplace:changed", handleMarketplaceChanged);
      window.removeEventListener("orders:changed", handleOrdersChanged);
    };
  }, [loadDashboard]);

  const walletBalance = wallet?.balance ?? 0;
  const marketplaceValue = useMemo(() => allProducts.reduce((sum, product) => sum + (Number(product.price) || 0), 0), [allProducts]);
  const ordersTrend = useMemo(() => {
    const baseCounts = [14, 22, 18, 29, 34, 42];
    const months = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - idx));
      return { label: date.toLocaleString("en-IN", { month: "short" }), count: baseCounts[idx] };
    });

    recentOrders.forEach((order) => {
      const created = new Date(order.created_at);
      const monthIndex = months.findIndex((entry) => entry.label === created.toLocaleString("en-IN", { month: "short" }));
      if (monthIndex >= 0) months[monthIndex].count += 1;
    });

    return months;
  }, [recentOrders]);

  const transactionsTrend = useMemo(() => {
    const baseCounts = [20, 31, 26, 44, 49, 58];
    const months = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - idx));
      return { label: date.toLocaleString("en-IN", { month: "short" }), count: baseCounts[idx] };
    });

    transactions.forEach((tx) => {
      const created = new Date(tx.created_at);
      const monthIndex = months.findIndex((entry) => entry.label === created.toLocaleString("en-IN", { month: "short" }));
      if (monthIndex >= 0) months[monthIndex].count += 1;
    });

    return months;
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const counts = allProducts.reduce((acc, product) => {
      const category = product.category || "Other";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [allProducts]);

  const activityItems = [
    ...recentProducts.map((p) => ({
      type: "product",
      id: `product-${p.id}`,
      created_at: p.created_at,
      title: `New listing: ${p.title}`,
      meta: p,
    })),
    ...recentOrders.map((o) => ({
      type: "order",
      id: `order-${o.id}`,
      created_at: o.created_at,
      title: `Order: ${o.product?.title || "Order"}`,
      meta: o,
    })),
    ...transactions.map((t) => ({
      type: "transaction",
      id: `transaction-${t.id}`,
      created_at: t.created_at,
      title: `Tx: ${t.type}`,
      meta: t,
    })),
    ...recentUsers
      .filter((u) => u.verification_status)
      .map((u) => ({
        type: "verification",
        id: `verification-${u.id}`,
        created_at: u.updated_at || u.created_at,
        title: `Verification update: ${u.full_name || "User"} · ${u.verification_status}`,
        meta: u,
      })),
    ...recentHashes.map((h) => ({
      type: "hash",
      id: `hash-${h.id}`,
      created_at: h.created_at,
      title: `Hash: ${h.sha256_hash?.slice(0, 12) || "Hash"}`,
      meta: h,
    })),
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  return (
    <div>
      {/* ── High-Tech Hero Welcome Banner ── */}
      <div className="cx-dash-hero">
        <div className="cx-dash-hero__inner">
          <div>
            <div className="cx-dash-hero__tag">
              <span className="cx-dash-hero__tag-dash">—</span>
              <span>REAL-TIME ASSET OVERVIEW &amp; FINANCIAL LEDGER</span>
            </div>
            <h1 className="cx-dash-hero__title">{greeting}, {firstName} 👋</h1>
            <div className="cx-dash-hero__subtitle">
              <span>CresoX Digital Ledger Engine</span>
              <span className="cx-dash-hero__badge">
                <span className="cx-dash-hero__dot" />
                Node: Synchronized
              </span>
              <span className="cx-dash-hero__badge">⚡ Latency: 12ms</span>
              <span className="cx-dash-hero__badge">🔒 SHA-256 Ledger Active</span>
            </div>
          </div>
          <div className="cx-dash-hero__actions">
            <Link to="/dashboard/wallet" className="cx-dash-btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Add Funds</span>
            </Link>
            <Link to="/dashboard/marketplace" className="cx-dash-btn-ghost">
              Marketplace →
            </Link>
            <Link to="/dashboard/blockchain" className="cx-dash-btn-ghost">
              Audit Ledger
            </Link>
          </div>
        </div>
      </div>

      {dashboardError && (
        <div className="auth-error" style={{marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <span>{dashboardError}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => loadDashboard()}>Retry</button>
        </div>
      )}

      {/* KPIs */}
      <div className="kpi-grid">
        {[
          {
            label: "Wallet Balance",
            value: formatBalance(walletBalance),
            change: "Initial deposit",
            up: true,
            icon: "💳",
            bg: "var(--green-light)",
          },
          {
            label: "My Products",
            value: loadingData ? "Loading..." : String(profile ? myProductsCount : 0),
            change: "Latest listings",
            up: null,
            icon: "📦",
            bg: "var(--blue-light)",
          },
          {
            label: "Orders",
            value: loadingData ? "Loading..." : String((ordersSummary.received || 0) + (ordersSummary.purchased || 0)),
            change: `${ordersSummary.received || 0} received · ${ordersSummary.purchased || 0} purchased`,
            up: null,
            icon: "🏪",
            bg: "var(--bg-section)",
          },
          {
            label: "Account Role",
            value: loadingData ? "Loading..." : profile?.role
              ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
              : "—",
            change: profile?.verification_status
              ? `Status: ${profile.verification_status}`
              : "Active",
            up: null,
            icon: "👤",
            bg: "var(--amber-light)",
          },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-card__top">
              <span className="kpi-card__label">{k.label}</span>
              <div className="kpi-card__icon" style={{background:k.bg}} aria-hidden="true">{k.icon}</div>
            </div>
            {loadingData ? (
              <div className="skeleton" style={{height:28,borderRadius:6,marginBottom:4,width:"60%"}} />
            ) : (
              <div className="kpi-card__value">{k.value}</div>
            )}
            <div className={`kpi-card__change ${k.up===true?"up":k.up===false?"down":"neutral"}`}>
              {k.change}
            </div>
          </div>
        ))}
      </div>

      {/* Main row */}
      <div className="two-col" style={{marginBottom:"var(--sp-5)"}}>
        {/* Analytics charts */}
        <div className="content-card">
          <div className="content-card__header">
            <div>
              <div className="content-card__title">Lightweight Analytics</div>
              <div className="content-card__sub">Orders, transactions and category trends</div>
            </div>
            <span className="badge badge-green">Live</span>
          </div>
          {/* TODO (Future Integration): Replace static chart data with live data
              from a market analytics API or Supabase aggregation function.
              Consider WebSocket subscription for real-time updates. */}
          <div style={{display:"grid",gap:"var(--sp-4)"}}>
            <div>
              <div style={{fontWeight:700,marginBottom:4,color:"#FFFFFF",fontSize:14}}>Orders over time</div>
              {loadingData
                ? <LoadingSkeleton rows={2} height={24} />
                : <SummaryBarChart values={ordersTrend.map((item) => item.count)} labels={ordersTrend.map((item) => item.label)} color="#38BDF8" />}
            </div>
            <div>
              <div style={{fontWeight:700,marginBottom:4,color:"#FFFFFF",fontSize:14}}>Transactions over time</div>
              {loadingData
                ? <LoadingSkeleton rows={2} height={24} />
                : <SummaryBarChart values={transactionsTrend.map((item) => item.count)} labels={transactionsTrend.map((item) => item.label)} color="#FF5722" />}
            </div>
            <div>
              <div style={{fontWeight:700,marginBottom:4,color:"#FFFFFF",fontSize:14}}>Products by category</div>
              {loadingData
                ? <LoadingSkeleton rows={3} height={20} gap={6} />
                : <CategoryBarChart items={categoryBreakdown} />}
            </div>
          </div>
        </div>

        {/* Quick stats + network status */}
        <div className="content-card">
          <div className="content-card__header">
            <div>
              <div className="content-card__title">Quick Statistics</div>
              <div className="content-card__sub">Snapshot of your current account</div>
            </div>
            <span className="badge badge-green"><span className="dot-live"></span> Live</span>
          </div>
          {[
            { label:"Verified Seller", value: profile?.verification_status === "Verified" ? "Verified" : profile?.verification_status || "Pending" },
            { label:"Wallet Balance", value: loadingData ? "Loading..." : formatBalance(walletBalance) },
            { label:"Marketplace Value", value: loadingData ? "Loading..." : formatBalance(marketplaceValue) },
            { label:"Recent Login", value: loadingData ? "Loading..." : formatLoginDate(user?.last_sign_in_at || profile?.updated_at || profile?.created_at) },
          ].map(s => (
            <div key={s.label} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid rgba(255, 255, 255, 0.06)",alignItems:"center"}}>
              <span style={{fontSize:13,color:"#94A3B8",fontWeight:500}}>{s.label}</span>
              <span style={{fontSize:14,fontWeight:700,color:"#FFFFFF",letterSpacing:"-0.01em",fontFamily:s.label.includes("Balance") || s.label.includes("Value") ? "monospace" : "inherit"}}>{s.value}</span>
            </div>
          ))}
          <div style={{marginTop:14,display:"grid",gap:10}}>
            {[
              { label:"Blockchain Records", value: loadingData ? "Loading..." : String(hashRecords) },
              { label:"Products Listed", value: loadingData ? "Loading..." : String(myProductsCount) },
              { label:"Orders Received", value: loadingData ? "Loading..." : String(ordersSummary.received || 0) },
              { label:"Orders Purchased", value: loadingData ? "Loading..." : String(ordersSummary.purchased || 0) },
              { label:"Total Transactions", value: loadingData ? "Loading..." : String(transactions.length) },
            ].map(s => (
              <div key={s.label} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#94A3B8"}}>
                <span>{s.label}</span>
                <span style={{fontWeight:700,color:"#38BDF8",fontFamily:"monospace"}}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="content-card" style={{marginBottom:"var(--sp-5)"}}>
        <div className="content-card__header">
          <div>
            <div className="content-card__title">Recent Products</div>
            <div className="content-card__sub">Latest listings in the marketplace</div>
          </div>
          <Link to="/dashboard/marketplace" className="btn btn-ghost btn-sm">View all →</Link>
        </div>
        {loadingData ? (
          <LoadingSkeleton rows={3} height={52} />
        ) : recentProducts.length === 0 ? (
          <div style={{textAlign:"center",padding:"var(--sp-8)",color:"var(--text-muted)"}}>
            No products listed yet.{" "}
            <Link to="/dashboard/marketplace" className="auth-link">Browse marketplace →</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Price</th><th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map(p => (
                <tr key={p.id}>
                  <td style={{fontWeight:600,color:"var(--text-primary)"}}>{p.title}</td>
                  <td><span className="badge badge-gray">{p.category || "—"}</span></td>
                  <td style={{fontFamily:"monospace",fontWeight:700}}>
                    {p.price ? `₹${Number(p.price).toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td>
                    <div style={{display:'flex',flexDirection:'column',gap:6}}>
                      <div>
                        {p.blockchain_hash ? (
                          <span className="status-badge status-badge--verified">✔ Blockchain Verified</span>
                        ) : (
                          <span className="status-badge status-badge--pending">⏳ Pending</span>
                        )}
                      </div>
                      {p.seller?.verification_status === 'Verified' ? (
                        <div><span className="status-badge status-badge--verified">Verified Seller</span></div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Users + Activity */}
      <div className="two-col" style={{marginBottom:"var(--sp-5)"}}>
        <div className="content-card">
          <div className="content-card__header">
            <div>
              <div className="content-card__title">Recently Registered Users</div>
              <div className="content-card__sub">Newest accounts on the platform</div>
            </div>
            <Link to="/dashboard/profile" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {recentUsers.length === 0 ? (
            <div style={{textAlign:'center',padding:'var(--sp-6)',color:'var(--text-muted)'}}>No recent users.</div>
          ) : (
            <ul style={{listStyle:'none',padding:0,margin:0}}>
              {recentUsers.map(u => (
                <li key={u.id} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{width:36,height:36,borderRadius:8,background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center'}}>{(u.full_name||'?')[0]}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700}}>{u.full_name}</div>
                    <div style={{fontSize:12,color:'var(--text-muted)'}}>
                      {u.role ? (u.role.charAt(0).toUpperCase() + u.role.slice(1)) : "Verified Member"}
                    </div>
                  </div>
                  <div style={{fontSize:12,color:'var(--text-muted)'}}>{new Date(u.created_at).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="content-card">
          <div className="content-card__header">
            <div>
              <div className="content-card__title">Recent Activity</div>
              <div className="content-card__sub">Latest actions across the platform</div>
            </div>
            <Link to="/dashboard/analytics" className="btn btn-ghost btn-sm">More →</Link>
          </div>
          {loadingData ? (
            <LoadingSkeleton rows={4} height={44} />
          ) : activityItems.length === 0 ? (
            <div style={{textAlign:'center',padding:'var(--sp-6)',color:'var(--text-muted)'}}>No recent activity yet.</div>
          ) : (
            <ul style={{listStyle:'none',padding:0,margin:0}}>
              {activityItems.map(a => (
                <li key={`${a.type}-${a.id}`} style={{padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',gap:12}}>
                    <div style={{fontWeight:700}}>{a.title}</div>
                    <div style={{fontSize:12,color:'var(--text-muted)',whiteSpace:'nowrap'}}>{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="content-card">
        <div className="content-card__header">
          <div>
            <div className="content-card__title">Recent Orders</div>
            <div className="content-card__sub">Last {recentOrders.length} orders</div>
          </div>
        </div>
        {loadingData ? (
          <LoadingSkeleton rows={3} height={52} />
        ) : recentOrders.length === 0 ? (
          <div style={{textAlign:"center",padding:"var(--sp-8)",color:"var(--text-muted)"}}>
            No orders yet.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th><th>Role</th><th>Price</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td style={{fontWeight:600,color:"var(--text-primary)"}}>{o.product?.title || "—"}</td>
                  <td>{o.buyer_id === user?.id ? "Buyer" : "Seller"}</td>
                  <td style={{fontFamily:"monospace",fontWeight:700}}>
                    {o.product?.price ? `₹${Number(o.product.price).toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td>
                    <span className={`status-badge status-badge--${o.status}`}>
                      {o.status === "verified" ? "✓ Verified" : o.status === "pending" ? "⏳ Pending" : o.status}
                    </span>
                  </td>
                  <td style={{color:"var(--text-muted)"}}>
                    {new Date(o.created_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
