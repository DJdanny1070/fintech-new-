import { Link } from "react-router-dom";
import StaticPageLayout from "../components/layout/StaticPageLayout/StaticPageLayout";

const GUIDES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    title: "Platform Overview",
    anchor: "platform-overview",
    color: "var(--blue-light)", text: "var(--blue)",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h.01"/>
      </svg>
    ),
    title: "Wallet Guide",
    anchor: "wallet-guide",
    color: "var(--green-light)", text: "var(--green)",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
    title: "Marketplace Guide",
    anchor: "marketplace-guide",
    color: "var(--amber-light)", text: "var(--amber)",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    title: "Blockchain Verification Guide",
    anchor: "blockchain-guide",
    color: "#EEF0F4", text: "var(--slate)",
  },
];

const DOC_SECTIONS = [
  {
    id: "platform-overview",
    eyebrow: "Platform Overview",
    title: "Getting Started with CresoX",
    body: "CresoX is a complete financial ecosystem built for individuals, businesses, and developers. This guide walks you through setting up your account and navigating the platform.",
    steps: [
      "Register an account at cresox.in/register and select your role (Individual, Business, or Developer)",
      "Complete identity verification (KYC) to unlock all platform features",
      "Fund your wallet via bank transfer, UPI, or NEFT/RTGS",
      "Explore the Marketplace to buy and sell tokenised assets",
      "Use the Blockchain tab to verify transaction integrity",
      "Access the Analytics dashboard to track performance",
    ],
  },
  {
    id: "wallet-guide",
    eyebrow: "Wallet Guide",
    title: "Digital Wallet — Complete Guide",
    body: "Your CresoX Wallet is a regulated multi-currency digital wallet. Here's everything you need to know to manage your funds effectively.",
    steps: [
      "Add funds: go to Wallet → Add Money → choose UPI, NEFT, or bank transfer",
      "Send money: Wallet → Send → enter recipient's CresoX ID or UPI ID",
      "Withdraw: Wallet → Withdraw → select linked bank account (minimum ₹100)",
      "Transaction history: Wallet → History — filter by type, date, or amount",
      "Set spending limits via Wallet → Settings → Limits",
      "Enable 2FA for all transactions in Account → Security",
    ],
  },
  {
    id: "marketplace-guide",
    eyebrow: "Marketplace Guide",
    title: "Buying & Selling on the Marketplace",
    body: "The CresoX Marketplace allows you to trade verified real-world and digital assets. All listings are KYC-verified and blockchain-backed.",
    steps: [
      "Complete full KYC before listing or purchasing assets",
      "Browse listings: Marketplace → Explore — filter by category, price, or verification status",
      "Purchase: click an asset → Review details → Place Order → confirm with wallet PIN",
      "Sell: Marketplace → List Asset → upload documents, set price, submit for review",
      "Track orders: Marketplace → My Orders — view status, tracking, and dispute options",
      "Disputes: raise via order detail page; resolution within 5 business days",
    ],
  },
  {
    id: "blockchain-guide",
    eyebrow: "Blockchain Verification",
    title: "Verifying Transactions on the Blockchain",
    body: "Every transaction on CresoX generates an immutable blockchain hash. Use the Blockchain Verification tool to independently confirm any transaction's integrity.",
    steps: [
      "Navigate to Dashboard → Blockchain",
      "Paste a transaction ID or hash in the verification field",
      "The system will display the on-chain record including timestamp and hash",
      "Green checkmark = verified; red warning = hash mismatch (contact support immediately)",
      "Download blockchain proof certificates for compliance or audit purposes",
      "API access for automated verification: see Developer documentation",
    ],
  },
];

const FAQS = [
  { q: "How do I reset my password?", a: "Go to the login page and click 'Forgot Password'. Enter your registered email address and follow the link sent to you." },
  { q: "What is the maximum wallet balance?", a: "For minimum KYC users, the limit is ₹1,00,000. For full KYC users, the limit is ₹10,00,000 as per RBI guidelines." },
  { q: "How long does KYC verification take?", a: "Automated KYC is typically completed within 5 minutes. Manual review cases can take up to 2 business days." },
  { q: "Are my funds insured?", a: "CresoX is not a bank. Wallet balances are held in escrow with a regulated banking partner but are not DICGC insured." },
];

function Documentation() {
  return (
    <StaticPageLayout
      eyebrow="Resources"
      title="Documentation"
      subtitle="Everything you need to get started, integrate, and operate on the CresoX platform — from wallet basics to blockchain verification."
    >
      {/* Guide cards */}
      <div className="sp-section">
        <span className="sp-section__eyebrow">Guides</span>
        <h2 className="sp-section__title">Platform Guides</h2>
        <div className="sp-grid" style={{ marginTop: "var(--sp-6)" }}>
          {GUIDES.map((g) => (
            <a
              href={`#${g.anchor}`}
              key={g.title}
              className="sp-card"
              style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)", textDecoration: "none", transition: "border-color var(--t)" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--blue)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div
                className="sp-card__icon"
                style={{ background: g.color, color: g.text, margin: 0, flexShrink: 0 }}
              >
                {g.icon}
              </div>
              <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{g.title}</span>
            </a>
          ))}
        </div>
      </div>

      <hr className="sp-divider" />

      {/* Detailed sections */}
      {DOC_SECTIONS.map((section, idx) => (
        <div key={section.id} className="sp-section" id={section.id}>
          <span className="sp-section__eyebrow">{section.eyebrow}</span>
          <h2 className="sp-section__title">{section.title}</h2>
          <p className="sp-section__lead">{section.body}</p>
          <ul className="sp-list">
            {section.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
          {idx < DOC_SECTIONS.length - 1 && <hr className="sp-divider" />}
        </div>
      ))}

      <hr className="sp-divider" />

      {/* FAQ */}
      <div className="sp-section">
        <span className="sp-section__eyebrow">FAQ Links</span>
        <h2 className="sp-section__title">Frequently Asked Questions</h2>
        <div style={{ marginTop: "var(--sp-6)" }}>
          {FAQS.map((faq) => (
            <div className="sp-card" key={faq.q} style={{ marginBottom: "var(--sp-3)" }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)", marginBottom: "var(--sp-2)" }}>{faq.q}</div>
              <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65 }}>{faq.a}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: "var(--sp-4)", fontSize: 14, color: "var(--text-muted)" }}>
          More answers in our{" "}
          <Link to="/help" style={{ color: "var(--blue)", fontWeight: 600 }}>Help Centre →</Link>
        </p>
      </div>
    </StaticPageLayout>
  );
}

export default Documentation;
