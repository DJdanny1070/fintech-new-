import { Link } from "react-router-dom";
import "./Auth.css";

/**
 * Register — Closed Access
 *
 * Public self-registration has been disabled.
 * Accounts are created only via admin-issued invitations.
 * This page keeps the /register route alive (e.g. for old links)
 * but presents a clear closed-access notice instead of a form.
 */
function Register() {
  return (
    <div className="auth-page">
      {/* Left panel — brand */}
      <div className="auth-page__panel">
        <div className="auth-panel__logo">
          <span style={{ color: "#4FA3FF" }}>Creso</span>
          <span style={{ color: "#FF5A5A" }}>X</span>
        </div>
        <p className="auth-panel__tagline">
          Access by invitation only.
        </p>
        <p className="auth-panel__sub">
          CresoX is a closed platform. Accounts are granted by administrators
          to approved individuals and organisations. If you believe you should
          have access, please contact your administrator.
        </p>
        <div className="auth-panel__features">
          {[
            "Invitation-only access",
            "Blockchain-verified transactions",
            "Role-based personalised dashboard",
            "SOC2 compliant & bank-grade security",
          ].map((f) => (
            <div className="auth-panel__feature" key={f}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right — closed-access notice */}
      <div className="auth-page__form-area">
        <div className="auth-card">
          <Link to="/" className="auth-card__back">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to home
          </Link>

          <div className="auth-card__header">
            <h1 className="auth-card__title">Registration is closed</h1>
            <p className="auth-card__sub">
              New accounts are created by administrators only.
            </p>
          </div>

          {/* Closed-access notice block */}
          <div
            style={{
              background: "var(--bg-white)",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--r-lg)",
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {/* Lock icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "var(--blue-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--blue)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <div>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                Invite-only platform
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  lineHeight: 1.65,
                }}
              >
                Access to CresoX requires an administrator-issued invitation.
                If you have received an invitation, use the credentials
                provided to sign in below.
              </p>
            </div>

            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                borderTop: "1px solid var(--border)",
                paddingTop: 14,
              }}
            >
              Already have credentials?{" "}
              <Link to="/login" className="auth-link">
                Sign in →
              </Link>
            </div>
          </div>

          <div className="auth-card__footer">
            Need help?{" "}
            <Link to="/contact" className="auth-link">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
