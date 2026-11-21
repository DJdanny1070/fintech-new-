 import StaticPageLayout from "../components/layout/StaticPageLayout/StaticPageLayout";

const SECTIONS = [
  {
    eyebrow: "Data Collection",
    title: "What Data We Collect",
    body: "We collect information you provide directly (name, email, phone, identity documents) and information generated through your use of the platform (transaction history, device information, usage logs). We do not collect data we do not need.",
    items: [
      "Account registration details (name, email, mobile number)",
      "Identity verification documents (PAN, Aadhaar, passport) for KYC compliance",
      "Financial information (wallet balance, transaction records)",
      "Device and browser information for security purposes",
      "Usage data and analytics to improve the platform",
    ],
  },
  {
    eyebrow: "User Privacy",
    title: "How We Use Your Data",
    body: "Your data is used solely to operate and improve the CresoX platform, comply with legal obligations, and protect you and other users from fraud. We will never sell your personal data to third parties for marketing purposes.",
    items: [
      "Providing and personalising the CresoX platform",
      "Processing transactions and maintaining wallet records",
      "Verifying your identity in accordance with RBI KYC guidelines",
      "Sending transactional notifications and security alerts",
      "Improving our products through aggregated, anonymised analytics",
    ],
  },
  {
    eyebrow: "Cookies",
    title: "Cookies & Tracking",
    body: "CresoX uses essential cookies required for the platform to function, and optional analytics cookies that help us understand how users interact with our services. You can manage your cookie preferences at any time.",
    items: [
      "Session cookies to keep you logged in securely",
      "Preference cookies to remember your settings",
      "Analytics cookies (can be disabled) for platform improvement",
      "No third-party advertising or tracking cookies",
    ],
  },
  {
    eyebrow: "Security",
    title: "How We Protect Your Data",
    body: "We employ industry-standard security measures including AES-256 encryption at rest, TLS 1.3 in transit, multi-factor authentication, and blockchain-backed audit trails for all financial transactions.",
    items: [
      "AES-256 encryption for all data at rest",
      "TLS 1.3 for all data in transit",
      "Multi-factor authentication (MFA) enforced for all accounts",
      "Immutable blockchain audit logs for financial records",
      "Regular independent security audits and penetration testing",
    ],
  },
  {
    eyebrow: "Data Sharing",
    title: "When We Share Your Data",
    body: "We share your data only with trusted service providers under strict data processing agreements, or when legally required by Indian authorities. We never share data for advertising.",
    items: [
      "Regulated payment processors and banking partners",
      "KYC/AML verification service providers",
      "Cloud infrastructure providers under data processing agreements",
      "Indian regulators (RBI, SEBI, FIU-IND) when legally required",
      "Law enforcement agencies pursuant to valid court orders",
    ],
  },
];

function PrivacyPolicy() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="Last updated: 1 January 2025. This policy explains how CresoX Fintech Private Limited collects, uses, and protects your personal information."
    >
      <div className="sp-banner" style={{ marginBottom: "var(--sp-12)" }}>
        <div className="sp-banner__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div className="sp-banner__text">
          <strong>Your privacy matters to us</strong>
          CresoX is committed to protecting your personal data and operating transparently. This policy applies to all users of the CresoX platform globally.
        </div>
      </div>

      {SECTIONS.map((section, idx) => (
        <div key={section.eyebrow} className="sp-section">
          <span className="sp-section__eyebrow">{section.eyebrow}</span>
          <h2 className="sp-section__title">{section.title}</h2>
          <p className="sp-section__lead">{section.body}</p>
          <ul className="sp-list">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {idx < SECTIONS.length - 1 && <hr className="sp-divider" />}
        </div>
      ))}

      <div className="sp-banner" style={{ marginTop: "var(--sp-12)" }}>
        <div className="sp-banner__icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div className="sp-banner__text">
          <strong>Questions about your data?</strong>
          Contact our Data Protection Officer at{" "}
          <a href="mailto:dpo@cresox.in" style={{ color: "var(--blue)", fontWeight: 600 }}>dpo@cresox.in</a>.
        </div>
      </div>
    </StaticPageLayout>
  );
}

export default PrivacyPolicy;
