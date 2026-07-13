import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getMyOrders } from "../services/productService";
import EmptyState from "../components/common/EmptyState";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import "./Dashboard.css";

function formatOrderDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getFriendlyErrorMessage(err) {
  if (!err) return "We couldn’t load your orders right now.";
  const message = err?.message || "";
  if (/failed to fetch|network|fetch/i.test(message)) {
    return "We couldn’t reach the orders service right now. Please try again shortly.";
  }
  if (/jwt|token|auth/i.test(message)) {
    return "Please sign in again to continue.";
  }
  return message || "We couldn’t load your orders right now.";
}

function Orders() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (!user) {
          setOrders([]);
          return;
        }
        const data = await getMyOrders(user.id);
        if (!mounted) return;
        setOrders(data || []);
      } catch (err) {
        if (!mounted) return;
        setError(getFriendlyErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();

    const onOrdersChanged = () => {
      if (mounted && user) load();
    };

    window.addEventListener("orders:changed", onOrdersChanged);
    return () => {
      mounted = false;
      window.removeEventListener("orders:changed", onOrdersChanged);
    };
  }, [user]);

  const isBusiness = profile?.role === "business";
  const visibleOrders = (orders || []).filter((o) => (
    isBusiness ? o.seller_id === user?.id : o.buyer_id === user?.id
  ));

  const byStatus = (status) => visibleOrders.filter(o => (o.status || "").toLowerCase() === status);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Orders</h1>
          <p>Loading your orders&hellip;</p>
        </div>
        <div className="content-card">
          <LoadingSkeleton rows={4} height={64} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header"><h1>Orders</h1></div>
        <div className="content-card">
          <EmptyState
            icon="⚠️"
            title="Could not load orders"
            description={error}
            action={<button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>Retry</button>}
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="content-card">
        <div style={{padding:"var(--sp-6)",color:"var(--text-muted)"}}>Please log in to view orders.</div>
      </div>
    );
  }

  const sections = [
    { key: "pending", title: "Pending Orders" },
    { key: "completed", title: "Completed Orders" },
    { key: "cancelled", title: "Cancelled Orders" },
  ];

  if (!visibleOrders.length) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header__row">
            <div>
              <h1>Orders</h1>
              <p>{isBusiness ? "Orders received from buyers" : "Your purchases"}</p>
            </div>
          </div>
        </div>
        <div className="content-card">
          <EmptyState
            icon="📦"
            title="No orders yet"
            description={isBusiness
              ? "When buyers purchase your listings, orders will appear here."
              : "Browse the marketplace and make your first purchase."}
            action={
              <Link to="/dashboard/marketplace" className="btn btn-primary btn-sm">
                Browse Marketplace →
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Orders</h1>
            <p>{visibleOrders.length} {isBusiness ? "orders received" : "purchases"}</p>
          </div>
        </div>
      </div>

      {sections.map(sec => {
        const list = byStatus(sec.key);
        return (
          <div key={sec.key} className="content-card" style={{marginBottom:"var(--sp-5)"}}>
            <div className="content-card__header">
              <div>
                <div className="content-card__title">{sec.title}</div>
                <div className="content-card__sub">{list.length} results</div>
              </div>
            </div>

            {list.length === 0 ? (
              <EmptyState
                icon="📋"
                title={`No ${sec.title.toLowerCase()}`}
                description="Nothing to show here yet."
              />
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Buyer</th>
                      <th>Seller</th>
                      <th>Price</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map(o => (
                      <tr key={o.id}>
                        <td style={{display:"flex",alignItems:"center",gap:12}}>
                          {o.product?.image_url ? (
                            <img src={o.product.image_url} alt={o.product?.title || "Product image"} style={{width:44,height:44,objectFit:"cover",borderRadius:6}} />
                          ) : (
                            <div style={{width:44,height:44,background:"var(--bg)",borderRadius:6,flexShrink:0}} aria-hidden="true" />
                          )}
                          <div style={{fontWeight:700}}>{o.product?.title || "Unknown"}</div>
                        </td>
                        <td>{o.buyer?.full_name || 'Unknown'}</td>
                        <td>{o.seller?.full_name || 'Unknown'}</td>
                        <td style={{fontFamily:"monospace",fontWeight:700}}>{o.product?.price ? `₹${Number(o.product.price).toLocaleString('en-IN')}` : '—'}</td>
                        <td style={{whiteSpace:"nowrap"}}>{formatOrderDate(o.created_at)}</td>
                        <td>
                          <span className={`status-badge ${o.status === 'completed' ? 'status-badge--success' : o.status === 'cancelled' ? 'status-badge--danger' : 'status-badge--pending'}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Orders;
