import StaticPageLayout from "../components/layout/StaticPageLayout/StaticPageLayout";
import { Link } from "react-router-dom";

const COOKIE_TYPES = [
  {
    name: "Essential Cookies",
    required: true,
    description: "These cookies are strictly necessary for the platform to function. They manage your session, authentication tokens, and security preferences. They cannot be disabled.",
    examples: ["session_token", "csrf_protection", "auth_state"],
    color: "var(--blue-light)",
    textColor: "var(--blue)",
  },
  {
    name: "Functional Cookies",
    required: false,
    description: "These cookies remember your preferences and settings such as language, theme, and dashboard layout to provide a personalised experience.",
    examples: ["user_preferences", "sidebar_state", "locale"],
    color: "var(--green-light)",
    textColor: "var(--green)",
  },
  {
    name: "Analytics Cookies",
    required: false,
    description: "We use anonymised analytics cookies to understand how users navigate the platform. This helps us identify friction points and improve the product. No personal data is shared.",
    examples: ["page_view_count", "feature_usage", "error_tracking"],
    color: "var(--amber-light)",
    textColor: "var(--amber)",
  },
  {
    name: "Third-Party Cookies",
    required: false,
    description: "CresoX does not allow third-party advertising or tracking cookies. Any third-party integrations (e.g., payment processors) use only technically necessary cookies under strict data agreements.",
    examples: ["payment_gateway_session"],
    color: "#EEF0F4",
    textColor: "var(--slate)",
  },
];

function CookiePolicy() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="Cookie Policy"
      subtitle="Last updated: 1 January 2025. This policy explains how and why CresoX uses cookies and similar tracking technologies on our platform."
    >
      {/* What are cookies */}
      <div className="sp-section">
        <span className="sp-section__eyebrow">Overview</span>
        <h2 className="sp-section__title">What Are Cookies?</h2>
        <p className="sp-section__lead">
          Cookies are small text files stored on your device when you visit a website. They allow
          the platform to recognise your device, maintain your session, remember your preferences,
          and collect usage data. CresoX uses cookies responsibly and in accordance with Indian
          data protection regulations.
        </p>
      </div>

      <hr className="sp-divider" />

      {/* Cookie types */}
      <div className="sp-section">
        <span className="sp-section__eyebrow">Cookie Types</span>
        <h2 className="sp-section__title">Cookies We Use</h2>
        <div className="sp-grid" style={{ marginTop: "var(--sp-6)" }}>
          {COOKIE_TYPES.map((ct) => (
            <div className="sp-card" key={ct.name}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{ct.name}</span>
                <span
                  className="badge"
                  style={{
                    background: ct.color,
                    color: ct.textColor,
                    fontWeight: 600,
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: "var(--r-full)",
                  }}
                >
                  {ct.required ? "Required" : "Optional"}
                </span>
              </div>
              <p className="sp-card__body" style={{ marginBottom: "var(--sp-3)" }}>{ct.description}</p>
              <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap" }}>
                {ct.examples.map((ex) => (
                  <code
                    key={ex}
                    style={{
                      fontSize: 11,
                      background: "var(--bg-section)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--r-sm)",
                      padding: "2px 8px",
                      color: "var(--text-muted)",
                      fontFamily: "monospace",
                    }}
                  >
                    {ex}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="sp-divider" />

      {/* Managing cookies */}
      <div className="sp-section">
        <span className="sp-section__eyebrow">Managing Cookies</span>
        <h2 className="sp-section__title">Your Cookie Choices</h2>
        <p className="sp-section__lead">
          You can control which optional cookies are active through your browser settings or through
          the CresoX platform settings. Note that disabling essential cookies may prevent the platform
          from functioning correctly.
        </p>
        <ul className="sp-list">
          <li>Use your browser settings to block or delete cookies at any time</li>
          <li>Opt out of analytics cookies via your Profile → Privacy settings</li>
          <li>Essential cookies cannot be disabled as they are required for security</li>
          <li>Clearing cookies will log you out and reset your preferences</li>
        </ul>

        <div className="sp-banner" style={{ marginTop: "var(--sp-6)" }}>
          <div className="sp-banner__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="sp-banner__text">
            <strong>Cookie retention</strong>
            Session cookies expire when you close your browser. Persistent cookies expire after
            30 to 365 days depending on their purpose. All cookies respect your device's privacy
            settings including "Do Not Track" signals.
          </div>
        </div>
      </div>

      <div className="sp-banner" style={{ marginTop: "var(--sp-12)" }}>
        <div className="sp-banner__icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div className="sp-banner__text">
          <strong>Questions?</strong>
          Read our{" "}
          <Link to="/privacy-policy" style={{ color: "var(--blue)", fontWeight: 600 }}>Privacy Policy</Link>
          {" "}or contact{" "}
          <a href="mailto:privacy@cresox.in" style={{ color: "var(--blue)", fontWeight: 600 }}>privacy@cresox.in</a>.
        </div>
      </div>
    </StaticPageLayout>
  );
}

export default CookiePolicy;
