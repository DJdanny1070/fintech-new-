import StaticPageLayout from "../components/layout/StaticPageLayout/StaticPageLayout";
import { Link } from "react-router-dom";

const SECTIONS = [
  {
    eyebrow: "KYC",
    title: "Know Your Customer (KYC)",
    body: "CresoX follows a risk-based KYC approach mandated by the Reserve Bank of India (RBI). All users must complete identity verification before accessing wallet and marketplace features.",
    items: [
      "Minimum KYC: mobile verification and PAN card for basic wallet access",
      "Full KYC: Aadhaar/passport, address proof, and selfie verification for full access",
      "Business KYC: company registration, GST certificate, and director identification",
      "KYC documents are processed by regulated VCIP-compliant verification partners",
      "Re-KYC may be required periodically or upon significant account activity",
    ],
  },
  {
    eyebrow: "AML",
    title: "Anti-Money Laundering (AML) Statement",
    body: "CresoX has implemented a robust AML programme aligned with the Prevention of Money Laundering Act, 2002 (PMLA) and RBI Master Directions on KYC. We report suspicious activity to the Financial Intelligence Unit – India (FIU-IND).",
    items: [
      "Transaction monitoring with automated pattern detection",
      "Mandatory reporting of cash transactions above ₹10 lakh",
      "Suspicious Transaction Reports (STR) filed with FIU-IND",
      "Sanctions screening against OFAC, UN, and RBI watchlists",
      "AML training programme for all platform operations staff",
    ],
  },
  {
    eyebrow: "Data Protection",
    title: "Data Protection & PDPB Readiness",
    body: "CresoX is preparing for full compliance with India's Digital Personal Data Protection Act, 2023 (DPDPA). We have appointed a Data Protection Officer and are conducting data mapping across all processing activities.",
    items: [
      "Data Protection Officer (DPO) appointed — dpo@cresox.in",
      "Data processing registers maintained for all personal data flows",
      "Data residency: all user data stored on servers within India",
      "Breach notification protocols in place with 72-hour reporting capability",
      "Privacy impact assessments (PIA) conducted for new product features",
    ],
  },
  {
    eyebrow: "Blockchain Integrity",
    title: "Blockchain & Audit Integrity",
    body: "CresoX uses blockchain-backed audit trails to ensure the integrity of all financial transactions. Transaction hashes are stored immutably on-chain, providing an independent, tamper-proof record.",
    items: [
      "SHA-256 hashes of every transaction stored on the blockchain",
      "Independent third-party blockchain verification available on request",
      "No private keys held by CresoX — users retain custody of blockchain proofs",
      "Audit logs retained for 7 years in compliance with Indian accounting standards",
      "Annual blockchain integrity audits by a DISA-certified auditor",
    ],
  },
  {
    eyebrow: "Regulatory",
    title: "Regulatory Disclaimer",
    body: "CresoX Fintech Private Limited is a registered payment aggregator operating under applicable RBI guidelines. We are not a bank and do not offer guaranteed returns.",
    items: [
      "CIN: U74999MH2024PTC123456 — Registered in Maharashtra, India",
      "Operating under RBI Payment Aggregator framework",
      "Marketplace activities comply with SEBI guidelines for tokenised assets",
      "CresoX is not a deposit-taking institution; balances are not DICGC insured",
      "Regulatory enquiries: compliance@cresox.in",
    ],
  },
];

function Compliance() {
  return (
    <StaticPageLayout
      eyebrow="Compliance"
      title="Regulatory Compliance"
      subtitle="CresoX Fintech Private Limited is committed to the highest standards of regulatory compliance, data protection, and financial integrity."
    >
      <div className="sp-banner sp-banner--green" style={{ marginBottom: "var(--sp-12)" }}>
        <div className="sp-banner__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <div className="sp-banner__text">
          <strong>Compliant &amp; Regulated</strong>
          CresoX operates under RBI Payment Aggregator guidelines, PMLA/AML requirements, and
          India's emerging Digital Personal Data Protection Act, 2023. Our compliance programme
          is reviewed quarterly by an independent auditor.
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
          <strong>Compliance enquiries</strong>
          Contact our compliance team at{" "}
          <a href="mailto:compliance@cresox.in" style={{ color: "var(--blue)", fontWeight: 600 }}>compliance@cresox.in</a>
          {" "}or file a report through our{" "}
          <Link to="/contact" style={{ color: "var(--blue)", fontWeight: 600 }}>Contact page</Link>.
        </div>
      </div>
    </StaticPageLayout>
  );
}

export default Compliance;
