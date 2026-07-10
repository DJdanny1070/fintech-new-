import { useAuth } from "../hooks/useAuth";
import "./Auth.css";

const STATUS_CONFIG = {
  Pending: {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--blue)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    iconBg: "var(--blue-light)",
    title: "Your account is under review",
    subtitle: "Waiting for administrator approval",
    message:
      "Your account has been created and is currently awaiting approval from a CresoX administrator. You will receive access once your account has been reviewed. This process typically takes 1–2 business days.",
    badge: "Pending Approval",
    badgeColor: "#f59e0b",
    badgeBg: "#fef3c7",
  },
  Rejected: {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--red)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    iconBg: "var(--red-light)",
    title: "Access request declined",
    subtitle: "Your account was not approved",
    message:
      "Unfortunately, your access request was not approved at this time. If you believe this is a mistake or would like to discuss further, please reach out to our team.",
    badge: "Access Declined",
    badgeColor: "var(--red)",
    badgeBg: "var(--red-light)",
  },
};

/**
 * AccessPending
 *
 * Shown to authenticated users whose approval_status is not 'Approved'.
 * Covers both Pending and Rejected states with tailored messaging.
 * The user is already signed in — this is a gate, not an auth error.
 */
function AccessPending() {
  const { profile, logout } = useAuth();
  const status = profile?.approval_status ?? "Pending";
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        background: "var(--bg)",
        fontFamily: "var(--font)",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 40, fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>
        <span style={{ color: "#4FA3FF" }}>Creso</span>
        <span style={{ color: "#FF5A5A" }}>X</span>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--bg-white)",
          border: "1.5px solid var(--border)",
          borderRadius: "var(--r-lg)",
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Icon + badge row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: cfg.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {cfg.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <h1
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                {cfg.title}
              </h1>
            </div>
            <span
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 600,
                color: cfg.badgeColor,
                background: cfg.badgeBg,
                borderRadius: 999,
                padding: "2px 10px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {cfg.badge}
            </span>
          </div>
        </div>

        {/* Subtitle + message */}
        <div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            {cfg.subtitle}
          </p>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {cfg.message}
          </p>
        </div>

        {/* User info pill */}
        {profile?.email && (
          <div
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              padding: "10px 14px",
              fontSize: 13,
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Signed in as{" "}
            <strong style={{ color: "var(--text-primary)" }}>{profile.email}</strong>
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border)" }} />

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a
            href="mailto:support@cresox.com"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "11px",
              background: "var(--blue)",
              borderRadius: "var(--r-md)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              transition: "opacity 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Contact Support
          </a>

          <button
            onClick={logout}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "11px",
              background: "transparent",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--r-md)",
              color: "var(--text-muted)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
              fontFamily: "var(--font)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--border-hover)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: "var(--text-muted)" }}>
        © {new Date().getFullYear()} CresoX. All rights reserved.
      </p>
    </div>
  );
}

export default AccessPending;
