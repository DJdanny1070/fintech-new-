import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/common/ToastProvider";
import { getProducts } from "../services/productService";
import { searchSellers } from "../services/profileService";
import { isDemoMode, DEMO_NOTIFICATIONS } from "../data/demoData";
import "./DashboardLayout.css";

const NAV = [
  { path: "/dashboard",            label: "Overview",    icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )},
  { path: "/dashboard/marketplace", label: "Marketplace", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )},
  { path: "/dashboard/wallet",      label: "Wallet",      icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h.01"/>
    </svg>
  )},
  { path: "/dashboard/blockchain",  label: "Blockchain",  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  )},
  { path: "/dashboard/analytics",   label: "Analytics",   icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )},
  { path: "/dashboard/orders",      label: "Orders",      icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )},
];

function DashboardLayout() {
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState({ products: [], sellers: [] });
  const [isSearching, setIsSearching]   = useState(false);
  const [hasSearched, setHasSearched]   = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Refs for outside-click / Escape handling
  const notificationRef = useRef(null);
  const searchWrapRef   = useRef(null);

  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const toast = useToast();

  const displayName  = profile?.full_name || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const displayRole  = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : "Member";

  // ── Debounced global search ──────────────────────────────────
  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setSearchResults({ products: [], sellers: [] });
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setHasSearched(true);

      try {
        const [products, sellers] = await Promise.all([
          getProducts({ search: trimmed }),
          searchSellers(trimmed, { limit: 5 }),
        ]);

        setSearchResults({
          products: (products || []).slice(0, 5),
          sellers:  (sellers  || []).slice(0, 5),
        });
      } catch (err) {
        console.error("Global search failed:", err.message);
        setSearchResults({ products: [], sellers: [] });
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  // ── Close notification panel on outside click or Escape ──────
  // TODO (Future Integration): Replace this static panel with a real-time
  // notifications feed connected via Supabase Realtime channels or WebSocket.
  // The notificationRef and toggle state are already wired up correctly.
  useEffect(() => {
    if (!showNotifications) return;

    function handleOutsideClick(e) {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }

    function handleEscape(e) {
      if (e.key === "Escape") setShowNotifications(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown",   handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown",   handleEscape);
    };
  }, [showNotifications]);

  // ── Close search panel on Escape ────────────────────────────
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape" && hasSearched) {
        setSearchQuery("");
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [hasSearched]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("You have been signed out.");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err.message);
      toast.error("We could not sign you out. Please try again.");
    }
  };

  const handleBack = () => {
    if (window.history.length > 1 && window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="db-layout">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="db-sidebar">
        <div className="db-sidebar__top">
          {/* Logo — click navigates to marketing home */}
          <div
            className="db-sidebar__logo"
            onClick={() => navigate("/")}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/")}
            aria-label="Go to CresoX home"
          >
            <div className="db-sidebar__logo-box">
              <span className="db-logo-creso">creso</span>
              <span className="db-logo-x">x</span>
            </div>
            <span className="db-sidebar__logo-tag">● FINTECH LEDGER</span>
          </div>
        </div>

        <div className="db-sidebar__section-label">
          <span className="db-sidebar__section-dash">—</span>
          <span>MAIN MENU</span>
        </div>

        <nav className="db-sidebar__nav" aria-label="Dashboard navigation">
          {NAV.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `db-nav-item ${isActive ? "db-nav-item--active" : ""}`
              }
            >
              <span className="db-nav-item__icon" aria-hidden="true">{item.icon}</span>
              <span className="db-nav-item__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="db-sidebar__bottom">
          <div className="db-sidebar__user">
            <div className="db-sidebar__avatar">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt={`${displayName}'s avatar`} />
                : avatarLetter}
            </div>
            <div className="db-sidebar__user-info">
              <div className="db-sidebar__user-name">{displayName}</div>
              <div className="db-sidebar__user-role-wrap">
                <span className="db-sidebar__user-dot" />
                <span className="db-sidebar__user-role">{displayRole}</span>
              </div>
            </div>
          </div>
          <button
            className="db-nav-item"
            onClick={handleLogout}
            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            aria-label="Log out of CresoX"
          >
            <span className="db-nav-item__icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            <span className="db-nav-item__label">Log Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────── */}
      <div className="db-main">
        {/* ── Topbar ─────────────────────────────────────────── */}
        <header className="db-topbar">
          <div className="db-topbar__left">
            <button
              type="button"
              className="db-topbar__back-btn"
              onClick={handleBack}
              title="Go back"
              aria-label="Go back to previous page"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Back</span>
            </button>

            <div className="db-topbar__search-wrap" ref={searchWrapRef}>
              <div className="db-topbar__search">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products or sellers…"
                  aria-label="Search products or sellers"
                  aria-expanded={hasSearched}
                  aria-controls="search-results-panel"
                  role="combobox"
                  autoComplete="off"
                />
              </div>

              {hasSearched && (
                <div
                  id="search-results-panel"
                  className="db-topbar__search-panel animate-fade-in"
                  role="dialog"
                  aria-label="Search results"
                >
                  {isSearching ? (
                    <div className="db-topbar__search-state" aria-live="polite">
                      <span className="db-topbar__search-state-text">Searching…</span>
                    </div>
                  ) : (
                    <>
                      {searchResults.products.length === 0 && searchResults.sellers.length === 0 ? (
                        <div className="db-topbar__search-state" aria-live="polite">
                          No matches found for &ldquo;{searchQuery.trim()}&rdquo;.
                        </div>
                      ) : (
                        <>
                          {searchResults.products.length > 0 && (
                            <div className="db-topbar__search-section">
                              <div className="db-topbar__search-title">Products</div>
                              {searchResults.products.map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  className="db-topbar__search-item"
                                  onClick={() => {
                                    navigate(`/dashboard/marketplace/product/${product.id}`);
                                    setSearchQuery("");
                                  }}
                                >
                                  <span>{product.title}</span>
                                  <small>{product.category || "Product"}</small>
                                </button>
                              ))}
                            </div>
                          )}

                          {searchResults.sellers.length > 0 && (
                            <div className="db-topbar__search-section">
                              <div className="db-topbar__search-title">Sellers</div>
                              {searchResults.sellers.map((seller) => (
                                <div
                                  key={seller.id}
                                  className="db-topbar__search-item db-topbar__search-item--static"
                                >
                                  <span>{seller.full_name || seller.company_name || (seller.username || "Verified Seller")}</span>
                                  <small>{seller.company_name || seller.role || "Seller"}</small>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="db-topbar__right">
            {/* System status badge with radar pulse effect */}
            <span className="db-topbar__status-badge">
              <span className="db-topbar__status-pulse" aria-hidden="true" />
              <span>All systems operational</span>
            </span>

            {/* ── Notification Bell ──────────────────────────── */}
            <div className="db-topbar__notification-wrap" ref={notificationRef}>
              <button
                className="db-topbar__icon-btn"
                title="Notifications"
                aria-label="Open notifications"
                onClick={() => setShowNotifications((prev) => !prev)}
                aria-expanded={showNotifications}
                aria-controls="notification-panel"
                style={{ position: "relative" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                {isDemoMode() && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--blue)",
                    }}
                  />
                )}
              </button>

              {showNotifications && (
                <div
                  id="notification-panel"
                  className="db-topbar__notification-panel animate-fade-in"
                  role="dialog"
                  aria-label="Notifications"
                  aria-modal="false"
                >
                  <div className="db-topbar__notification-header">
                    <span>Notifications</span>
                    <button
                      className="db-topbar__icon-btn"
                      style={{ width: 28, height: 28 }}
                      onClick={() => setShowNotifications(false)}
                      aria-label="Close notifications"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  {isDemoMode() ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12 }}>
                      {DEMO_NOTIFICATIONS.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "8px",
                            background: n.read ? "transparent" : "var(--blue-light)",
                            border: "1px solid var(--border)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                            <span>{n.title}</span>
                            <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)" }}>{n.time}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{n.message}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="db-topbar__notification-empty">
                      <div className="db-topbar__notification-empty-title">No Notifications</div>
                      <div className="db-topbar__notification-empty-body">You&apos;re all caught up.</div>
                      <div className="db-topbar__notification-empty-meta">New activity will appear here.</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Profile avatar ─────────────────────────────── */}
            <button
              type="button"
              className="db-topbar__avatar-btn"
              onClick={() => navigate("/dashboard/profile")}
              aria-label="Open your profile"
            >
              <div className="db-topbar__avatar">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt={`${displayName}'s avatar`} />
                  : avatarLetter}
              </div>
            </button>
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────── */}
        <main className="db-content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
