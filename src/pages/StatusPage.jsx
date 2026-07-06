import { useState, useEffect } from "react";
import StaticPageLayout from "../components/layout/StaticPageLayout/StaticPageLayout";
import { Link } from "react-router-dom";

/* ─── Service definitions ──────────────────────────────────────── */
const SERVICES = [
  {
    id: "auth",
    name: "Authentication Service",
    description: "Login, registration, JWT token issuance",
    category: "Core",
  },
  {
    id: "wallet",
    name: "Wallet Service",
    description: "Balance management, transfers, withdrawals",
    category: "Core",
  },
  {
    id: "marketplace",
    name: "Marketplace Service",
    description: "Listings, orders, and trade execution",
    category: "Core",
  },
  {
    id: "blockchain",
    name: "Blockchain Service",
    description: "Transaction hashing and on-chain verification",
    category: "Core",
  },
  {
    id: "database",
    name: "Database Cluster",
    description: "Primary PostgreSQL cluster and read replicas",
    category: "Infrastructure",
  },
  {
    id: "kyc",
    name: "KYC / Identity Service",
    description: "Document verification and AML screening",
    category: "Compliance",
  },
  {
    id: "notifications",
    name: "Notification Service",
    description: "Email, SMS, and push alerts",
    category: "Platform",
  },
  {
    id: "api",
    name: "API Gateway",
    description: "Rate limiting, routing, and developer API",
    category: "Infrastructure",
  },
];

/* Simulate fetching status — all operational for demo */
function useServiceStatus() {
  const [statuses, setStatuses] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = () => {
      /* Simulate an async fetch */
      setTimeout(() => {
        setStatuses(
          Object.fromEntries(
            SERVICES.map((s) => [
              s.id,
              { status: "operational", latency: Math.floor(Math.random() * 80 + 20) },
            ])
          )
        );
        setLastUpdated(new Date());
        setLoading(false);
      }, 600);
    };

    fetchStatus();
    /* Refresh every 60 seconds */
    const interval = setInterval(fetchStatus, 60_000);
    return () => clearInterval(interval);
  }, []);

  return { statuses, lastUpdated, loading };
}

function StatusBadge({ status }) {
  const map = {
    operational: { label: "Operational", cls: "sp-status-row__badge--operational" },
    degraded:    { label: "Degraded",    cls: "sp-status-row__badge--degraded" },
    down:        { label: "Outage",      cls: "sp-status-row__badge--down" },
  };
  const { label, cls } = map[status] || map.operational;
  return (
    <span className={`sp-status-row__badge ${cls}`}>
      <span className="sp-status-row__dot" />
      {label}
    </span>
  );
}

function StatusPage() {
  const { statuses, lastUpdated, loading } = useServiceStatus();

  const allOperational = statuses && Object.values(statuses).every((s) => s.status === "operational");
  const categories = [...new Set(SERVICES.map((s) => s.category))];

  return (
    <StaticPageLayout
      eyebrow="Platform"
      title="System Status"
      subtitle="Real-time health status of all CresoX platform services. This page refreshes automatically every 60 seconds."
    >
      {/* Overall status banner */}
      {loading ? (
        <div
          style={{
            background: "var(--bg-white)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            padding: "var(--sp-6)",
            display: "flex",
            alignItems: "center",
            gap: "var(--sp-4)",
            marginBottom: "var(--sp-12)",
          }}
        >
          <div className="spinner" style={{ borderColor: "rgba(0,0,0,.1)", borderTopColor: "var(--blue)" }} />
          <span style={{ fontSize: 15, color: "var(--text-muted)" }}>Fetching service status…</span>
        </div>
      ) : (
        <div
          className={`sp-banner ${allOperational ? "sp-banner--green" : "sp-banner--amber"}`}
          style={{ marginBottom: "var(--sp-12)" }}
        >
          <div className="sp-banner__icon">
            {allOperational ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            )}
          </div>
          <div className="sp-banner__text">
            <strong>{allOperational ? "All Systems Operational" : "Service Disruption Detected"}</strong>
            {allOperational
              ? "All CresoX platform services are running normally."
              : "One or more services are experiencing issues. Our team is investigating."}
          </div>
        </div>
      )}

      {/* Per-category service rows */}
      {categories.map((cat) => (
        <div key={cat} className="sp-section">
          <span className="sp-section__eyebrow">{cat}</span>
          <h2 className="sp-section__title">{cat} Services</h2>

          {SERVICES.filter((s) => s.category === cat).map((service) => {
            const svc = statuses?.[service.id];
            return (
              <div className="sp-status-row" key={service.id}>
                <div>
                  <div className="sp-status-row__label">{service.name}</div>
                  <div className="sp-status-row__meta">
                    {service.description}
                    {svc && (
                      <span style={{ marginLeft: 8, color: "var(--text-subtle)" }}>
                        · {svc.latency}ms
                      </span>
                    )}
                  </div>
                </div>
                {loading || !svc ? (
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Checking…</span>
                ) : (
                  <StatusBadge status={svc.status} />
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Last updated */}
      {lastUpdated && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sp-2)",
            marginTop: "var(--sp-8)",
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Last updated:{" "}
          {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}{" "}
          IST on{" "}
          {lastUpdated.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      )}

      {/* Incident history placeholder */}
      <hr className="sp-divider" />
      <div className="sp-section">
        <span className="sp-section__eyebrow">History</span>
        <h2 className="sp-section__title">Recent Incidents</h2>
        <div
          className="sp-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sp-4)",
            color: "var(--text-muted)",
            fontSize: 15,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          No incidents in the last 30 days.
        </div>
      </div>

      {/* Support CTA */}
      <div className="sp-banner" style={{ marginTop: "var(--sp-8)" }}>
        <div className="sp-banner__icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div className="sp-banner__text">
          <strong>Experiencing an issue not shown here?</strong>
          <Link to="/contact" style={{ color: "var(--blue)", fontWeight: 600, marginLeft: 4 }}>
            Contact support →
          </Link>
        </div>
      </div>
    </StaticPageLayout>
  );
}

export default StatusPage;
