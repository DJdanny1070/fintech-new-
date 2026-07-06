import { useState } from "react";
import StaticPageLayout from "../components/layout/StaticPageLayout/StaticPageLayout";
import { Link } from "react-router-dom";

/* ─── Team placeholder data ──────────────────────────────────── */
const TEAM = [
  { name: "Arjun Mehta",    role: "Chief Executive Officer",      initial: "A" },
  { name: "Priya Kapoor",   role: "Chief Technology Officer",     initial: "P" },
  { name: "Rahul Sharma",   role: "Chief Financial Officer",      initial: "R" },
  { name: "Sneha Iyer",     role: "Head of Product",              initial: "S" },
  { name: "Vikram Nair",    role: "Head of Compliance",           initial: "V" },
  { name: "Anita Desai",    role: "Head of Engineering",          initial: "A" },
];

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h.01"/>
      </svg>
    ),
    title: "Digital Wallet",
    body: "Multi-currency digital wallets with real-time balance, transfers, and transaction history.",
    color: "var(--blue-light)", text: "var(--blue)",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
    title: "Marketplace",
    body: "A verified asset marketplace enabling buy/sell of real-world tokenised assets on-chain.",
    color: "var(--green-light)", text: "var(--green)",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    title: "Blockchain Verification",
    body: "Hash-based immutable record keeping ensuring every transaction is tamper-proof and auditable.",
    color: "var(--amber-light)", text: "var(--amber)",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    title: "Developer APIs",
    body: "RESTful APIs, webhooks, and sandbox environments for seamless third-party integrations.",
    color: "#EEF0F4", text: "var(--slate)",
  },
];

function AboutUs() {
  return (
    <StaticPageLayout
      eyebrow="Company"
      title="Powering the Future of Finance"
      subtitle="CresoX Fintech Private Limited is building India's most trusted digital financial ecosystem — connecting wallets, markets, and blockchains in one platform."
    >
      {/* Mission & Vision */}
      <div className="sp-grid" style={{ marginBottom: "var(--sp-16)" }}>
        <div className="sp-card">
          <div
            className="sp-card__icon"
            style={{ background: "var(--blue-light)", color: "var(--blue)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <p className="sp-card__title">Our Mission</p>
          <p className="sp-card__body">
            To democratise access to financial infrastructure for individuals,
            businesses, and developers across India — making digital payments,
            asset trading, and blockchain verification as simple as a tap.
          </p>
        </div>
        <div className="sp-card">
          <div
            className="sp-card__icon"
            style={{ background: "var(--green-light)", color: "var(--green)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
          </div>
          <p className="sp-card__title">Our Vision</p>
          <p className="sp-card__body">
            A borderless financial future where trust is enforced by code, not
            paperwork — and where every participant from solo freelancer to
            enterprise has access to the same institutional-grade tools.
          </p>
        </div>
      </div>

      {/* Company Overview */}
      <div className="sp-section">
        <span className="sp-section__eyebrow">Who We Are</span>
        <h2 className="sp-section__title">A Complete Financial Ecosystem</h2>
        <p className="sp-section__lead">
          Founded in 2024 and headquartered in Mumbai, CresoX Fintech Private
          Limited (CIN: U74999MH2024PTC123456) is a regulated financial
          technology company operating under RBI and SEBI guidelines. We serve
          individuals, businesses, and developers with a unified platform that
          spans digital payments, tokenised asset trading, and blockchain-backed
          audit trails.
        </p>
      </div>

      {/* Platform Features */}
      <div className="sp-section">
        <span className="sp-section__eyebrow">Platform</span>
        <h2 className="sp-section__title">What We Offer</h2>
        <div className="sp-grid" style={{ marginTop: "var(--sp-6)" }}>
          {FEATURES.map((f) => (
            <div className="sp-card" key={f.title}>
              <div
                className="sp-card__icon"
                style={{ background: f.color, color: f.text }}
              >
                {f.icon}
              </div>
              <p className="sp-card__title">{f.title}</p>
              <p className="sp-card__body">{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      <hr className="sp-divider" />

      {/* Team */}
      <div className="sp-section">
        <span className="sp-section__eyebrow">Team</span>
        <h2 className="sp-section__title">Leadership</h2>
        <p className="sp-section__lead">
          Our leadership team brings decades of combined experience in fintech,
          banking, engineering, and compliance.
        </p>
        <div className="sp-grid sp-grid--3" style={{ marginTop: "var(--sp-6)" }}>
          {TEAM.map((member) => (
            <div className="sp-card" key={member.name} style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)" }}>
              <div
                style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "var(--blue)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 18, flexShrink: 0,
                }}
              >
                {member.initial}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{member.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{member.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="sp-banner" style={{ marginTop: "var(--sp-12)" }}>
        <div className="sp-banner__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div className="sp-banner__text">
          <strong>Want to partner or learn more?</strong>
          Reach out to our team — we'd love to hear from you.{" "}
          <Link to="/contact" style={{ color: "var(--blue)", fontWeight: 600 }}>Contact us →</Link>
        </div>
      </div>
    </StaticPageLayout>
  );
}

export default AboutUs;
