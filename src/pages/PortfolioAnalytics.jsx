import { Link } from "react-router-dom";

// TODO (Future Integration): Portfolio Analytics Engine
// This page is the integration point for a full portfolio tracking and
// analytics module. Planned data sources:
//   - Real-time asset valuations via market price APIs
//   - Historical returns and XIRR calculations from the transaction ledger
//   - Allocation breakdown by asset type, sector, and geography
//   - Risk metrics: standard deviation, Sharpe ratio, max drawdown
// See: /services/portfolioService.js (to be created)

function PortfolioAnalytics() {
  return (
    <div>
      <div className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Portfolio Analytics</h1>
            <p>Investment portfolio tracking and performance reporting</p>
          </div>
          <Link to="/dashboard/analytics" className="btn btn-ghost btn-sm">
            ← Back to Analytics
          </Link>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: "var(--sp-5)" }}>
        {["Total Portfolio Value", "Returns (YTD)", "No. of Holdings", "Risk Level"].map((label) => (
          <div key={label} className="kpi-card" style={{ opacity: 0.55 }}>
            <div className="kpi-card__label">{label}</div>
            <div className="skeleton" style={{ height: 28, borderRadius: 6, marginTop: 8, width: "70%" }} />
            <div className="kpi-card__change neutral" style={{ marginTop: 6 }}>Coming soon</div>
          </div>
        ))}
      </div>

      <div className="content-card" style={{ maxWidth: 640 }}>
        <div className="content-card__header">
          <div>
            <div className="content-card__title">Portfolio Tracking</div>
            <div className="content-card__sub">Full investment analytics · Upcoming release</div>
          </div>
          <span className="badge badge-amber">Coming Soon</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>
            The portfolio view is being prepared for an upcoming release. It will include
            deep analytics reporting, real-time asset valuations, and historical return
            calculations across all tokenized holdings.
          </p>

          {[
            { icon: "📊", label: "Performance Charts",     desc: "Interactive charts for returns, drawdown, and volatility" },
            { icon: "🗂️", label: "Asset Allocation",       desc: "Breakdown by type, sector, and geography" },
            { icon: "📈", label: "Real-time Pricing",      desc: "Live valuations for all tokenized assets" },
            { icon: "🔗", label: "Blockchain Provenance",  desc: "On-chain verification for every holding" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--sp-3)",
                padding: "var(--sp-3) 0",
                borderBottom: "1px solid var(--border)",
                opacity: 0.7,
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }} aria-hidden="true">{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{item.label}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PortfolioAnalytics;
