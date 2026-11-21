import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar/Navbar";
import Footer from "../components/home/Footer/Footer";
import FloatingScrollTop from "../components/common/FloatingScrollTop";
import "./AssetTokenization.css";

/* ─────────────────────────────── Data ─────────────────────────────── */

const BENEFITS = [
  {
    color: "#EFF6FF",
    iconColor: "#075AD8",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: "Fractional Ownership",
    desc: "Divide high-value assets into smaller, tradeable units — allowing a broader investor base to participate in markets previously reserved for institutions.",
  },
  {
    color: "#F0FDF4",
    iconColor: "#16A34A",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Enhanced Liquidity",
    desc: "Transform illiquid assets into tradeable tokens, enabling faster settlement and access to secondary markets that were previously unavailable.",
  },
  {
    color: "#FFFBEB",
    iconColor: "#D97706",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Immutable Security",
    desc: "Every token and transaction is cryptographically secured on-chain, providing tamper-proof ownership records and transparent audit trails.",
  },
  {
    color: "#FDF2F8",
    iconColor: "#DB2777",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: "24 / 7 Markets",
    desc: "Tokenised assets trade around the clock on digital platforms, eliminating geographical barriers and time-zone restrictions.",
  },
  {
    color: "#EFF6FF",
    iconColor: "#075AD8",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Wider Investor Access",
    desc: "Lower minimum investment thresholds open up premium asset classes — real estate, art, gold — to retail and HNI investors alike.",
  },
  {
    color: "#F0FDF4",
    iconColor: "#16A34A",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    title: "Regulatory Compliance",
    desc: "CresoX issues tokens within applicable SEBI and RBI guidelines, ensuring every offering is structured for legal enforceability.",
  },
];

const INDUSTRIES = [
  {
    name: "Real Estate",
    example: "Residential, Commercial, REITs",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    name: "Commodities",
    example: "Gold, Silver, Agri Produce",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
  {
    name: "Private Equity",
    example: "Startup Stakes, VC Funds",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    name: "Art & Collectibles",
    example: "Fine Art, NFTs, Memorabilia",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
      </svg>
    ),
  },
  {
    name: "Infrastructure",
    example: "Highways, Ports, Energy",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    name: "Debt Instruments",
    example: "Bonds, Invoices, Receivables",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    name: "Intellectual Property",
    example: "Patents, Royalties, Brands",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    name: "Agriculture",
    example: "Farmland, Crop Yields, Timber",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12"/><path d="M12 12C12 12 7 10 7 5a5 5 0 0 1 10 0c0 5-5 7-5 7z"/>
      </svg>
    ),
  },
];

const WORKFLOW_STEPS = [
  {
    title: "Asset Assessment & Due Diligence",
    desc: "Our team evaluates the asset for eligibility, legal title, valuation, and regulatory fit. We conduct thorough due diligence to ensure the asset meets tokenization standards.",
    tags: ["Legal Review", "Valuation", "Eligibility Check"],
  },
  {
    title: "Legal Structuring & SPV Setup",
    desc: "A Special Purpose Vehicle (SPV) or equivalent legal structure is established to hold the asset. This separates the underlying asset from the issuer's balance sheet and protects investor rights.",
    tags: ["SPV Formation", "Contract Drafting", "Regulatory Filing"],
  },
  {
    title: "Token Design & Smart Contract Development",
    desc: "Tokens are designed to represent fractional ownership rights. Smart contracts are written, audited, and deployed on the chosen blockchain, encoding all rights, restrictions, and governance rules.",
    tags: ["Smart Contracts", "Audit", "Blockchain Deployment"],
  },
  {
    title: "Compliance & KYC / AML Onboarding",
    desc: "Investors undergo a KYC/AML process compliant with RBI and SEBI guidelines. Whitelist addresses are verified and approved before any token allocation occurs.",
    tags: ["KYC / AML", "Investor Whitelisting", "SEBI Compliance"],
  },
  {
    title: "Token Issuance & Primary Distribution",
    desc: "Tokens are minted and allocated to verified investors. Primary market sale proceeds are used to acquire or settle the underlying asset within the SPV structure.",
    tags: ["Token Minting", "Primary Sale", "Investor Allocation"],
  },
  {
    title: "Secondary Market & Ongoing Management",
    desc: "Token holders can trade their positions on the CresoX marketplace. Regular asset reports, distribution events, and governance updates are delivered via the platform.",
    tags: ["Secondary Trading", "Reporting", "Distributions"],
  },
];

const DOCUMENTS = [
  {
    title: "Proof of Asset Ownership",
    desc: "Title deed, registration certificate, or any government-issued document confirming ownership of the asset to be tokenized.",
  },
  {
    title: "Identity Documents (KYC)",
    desc: "PAN card, Aadhaar, passport, or other government-issued photo ID for all directors, promoters, and authorized signatories.",
  },
  {
    title: "Valuation Report",
    desc: "Independent valuation report from a SEBI-registered or certified valuer, dated within the last 6 months.",
  },
  {
    title: "Legal Title Report",
    desc: "Solicitor's report confirming clear title, absence of encumbrances, and legal enforceability of ownership transfer.",
  },
  {
    title: "Business / Company Registration",
    desc: "Certificate of Incorporation, MOA/AOA, and latest board resolution authorizing the tokenization process (for entities).",
  },
  {
    title: "Financial Statements",
    desc: "Audited financials for the past 2 years, demonstrating the asset's income generation history and projected cash flows.",
  },
  {
    title: "Regulatory Licenses (if applicable)",
    desc: "Any sector-specific regulatory approvals — RERA for real estate, FMC for commodities, or SEBI registration for equity instruments.",
  },
  {
    title: "Asset Insurance Documents",
    desc: "Current insurance policy covering the asset against loss, damage, or liability — required for all physical asset categories.",
  },
];

const FAQS = [
  {
    q: "What types of assets can be tokenized on CresoX?",
    a: "CresoX supports a wide range of asset classes including real estate (residential and commercial), gold and precious metals, private equity stakes, art and collectibles, infrastructure assets, debt instruments (bonds and receivables), intellectual property, and agricultural assets. Each asset class is evaluated individually for legal eligibility and market suitability.",
  },
  {
    q: "Is asset tokenization legal in India?",
    a: "Asset tokenization in India is an evolving regulatory area. CresoX structures all tokenization offerings within existing SEBI, RBI, and Companies Act frameworks. We work with experienced legal counsel to ensure each offering is compliant, and we monitor regulatory developments closely. For sector-specific queries, please consult our compliance team.",
  },
  {
    q: "What is the minimum asset value for tokenization?",
    a: "Our platform generally requires a minimum asset value of ₹1 crore for tokenization. This threshold ensures economic viability of the legal and technical structuring costs. Contact us to discuss assets below this threshold — in some cases, we can bundle multiple smaller assets into a single tokenized pool.",
  },
  {
    q: "How long does the tokenization process take?",
    a: "End-to-end tokenization typically takes 8–16 weeks from initial submission to token issuance. This includes due diligence (2–4 weeks), legal structuring (3–5 weeks), smart contract development and audit (2–3 weeks), and investor onboarding/KYC (1–2 weeks). Complex assets with regulatory licensing requirements may take longer.",
  },
  {
    q: "What fees does CresoX charge for tokenization?",
    a: "CresoX charges a one-time structuring fee (typically 1.5–3% of asset value, subject to negotiation), plus an annual platform management fee of 0.5–1%. Smart contract audit costs and legal fees are additional and depend on asset complexity. A detailed fee schedule will be provided during the initial consultation.",
  },
  {
    q: "Can international investors participate in tokenized assets?",
    a: "Yes, subject to applicable FEMA and RBI regulations governing foreign investment in the underlying asset class. Some asset types have restrictions on foreign ownership (e.g., agricultural land), while others are fully open. Our compliance team assesses each investor's eligibility based on their jurisdiction and the specific asset.",
  },
  {
    q: "What happens if I want to exit my tokenized investment?",
    a: "Token holders can sell their tokens on the CresoX secondary marketplace to other eligible investors. Liquidity depends on market demand and is not guaranteed. In addition, certain token structures include buyback provisions, redemption windows, or put options — the specific liquidity mechanisms are detailed in each asset's offering documents.",
  },
  {
    q: "How are investor rights protected?",
    a: "Investor rights are encoded in smart contracts and backed by legally binding off-chain agreements (token purchase agreements, investor rights agreements). The underlying asset is held in a ring-fenced SPV, meaning it is legally separated from CresoX's corporate balance sheet. All token holders receive regular financial reports and have voting rights on material decisions per the governance framework.",
  },
];

const TERMS_TEXT = `
ASSET TOKENIZATION TERMS & CONDITIONS
CresoX Fintech Private Limited ("CresoX", "we", "us", "our")
Effective Date: 1 July 2024

PLEASE READ THESE TERMS CAREFULLY BEFORE APPLYING FOR ASSET TOKENIZATION SERVICES.

1. ELIGIBILITY
1.1 You must be at least 18 years of age and legally capable of entering into contracts under applicable Indian law.
1.2 You must have clear, unencumbered title to the asset you wish to tokenize, or be duly authorized by the title holder.
1.3 The asset must comply with all applicable laws and not be derived from illegal activity.
1.4 Entities must be duly incorporated and in good standing under applicable law.

2. NATURE OF SERVICE
2.1 CresoX provides a technology and advisory platform to facilitate the tokenization of eligible real-world assets. We do not guarantee investment returns, secondary market liquidity, or regulatory approvals.
2.2 CresoX is not a broker-dealer, investment adviser, or custodian. We are a technology intermediary.
2.3 Token holders' rights arise from the legal structures documented in the offering documents, not solely from token possession.

3. DUE DILIGENCE & APPROVAL
3.1 Submission of an application does not guarantee approval or listing. CresoX reserves the right to decline any application without providing reasons.
3.2 You must provide accurate, complete, and current information. Any misrepresentation will result in immediate termination of the application.
3.3 We may conduct independent due diligence, including third-party valuation and legal title searches, at our cost.

4. FEES & CHARGES
4.1 A non-refundable application processing fee may apply.
4.2 Structuring fees, legal fees, audit costs, and platform management fees will be detailed in a separate Fee Schedule prior to your execution of the Tokenization Agreement.
4.3 All fees are exclusive of applicable GST.

5. REGULATORY COMPLIANCE
5.1 You are responsible for obtaining all necessary regulatory approvals, licenses, and clearances for your asset prior to tokenization.
5.2 CresoX will structure the offering within applicable SEBI and RBI guidelines as reasonably interpreted. However, we make no warranty as to the regulatory treatment of tokenized assets by future legislation or regulatory guidance.
5.3 You agree to cooperate fully with any regulatory enquiry relating to your tokenized asset.

6. REPRESENTATIONS & WARRANTIES
6.1 You represent that (a) you have full authority to tokenize the asset; (b) the asset is free from undisclosed encumbrances; (c) all documents provided are genuine and current; and (d) the tokenization does not violate any agreement to which you are a party.

7. INTELLECTUAL PROPERTY
7.1 All technology, smart contracts, platform interfaces, and processes developed by CresoX remain our exclusive intellectual property.
7.2 You grant CresoX a non-exclusive licence to use your asset information and materials solely for the purpose of providing the tokenization service.

8. LIMITATION OF LIABILITY
8.1 CresoX shall not be liable for any indirect, incidental, special, or consequential loss arising from the tokenization service, including but not limited to: loss of profits, loss of investment value, regulatory action, or smart contract vulnerabilities discovered after independent audit.
8.2 Our maximum aggregate liability shall not exceed the fees paid by you to CresoX in the 12 months preceding the claim.

9. INDEMNIFICATION
9.1 You agree to indemnify and hold harmless CresoX, its directors, officers, and employees from any claims, losses, or liabilities arising from your misrepresentation, breach of these Terms, or violation of applicable law.

10. GOVERNING LAW & DISPUTE RESOLUTION
10.1 These Terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.
10.2 Disputes above ₹5 lakh may be referred to arbitration under the Arbitration and Conciliation Act, 1996, with a sole arbitrator appointed by mutual agreement.

11. AMENDMENTS
11.1 CresoX reserves the right to amend these Terms at any time. Continued use of the platform following notification of amendments constitutes acceptance.

12. CONTACT
For queries regarding these Terms, contact: legal@cresox.in
`;

/* ─────────────────────────────── FAQ Item ─────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`at-faq-item${open ? " at-faq-item--open" : ""}`}>
      <button
        type="button"
        className="at-faq-item__q"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {q}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="at-faq-item__chevron"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="at-faq-item__a">{a}</div>}
    </div>
  );
}

/* ─────────────────────────────── Page ─────────────────────────────── */
function AssetTokenization() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleApply = () => {
    if (agreed) navigate("/tokenization-request");
  };

  return (
    <div className="at-page">
      <Navbar />

      {/* ── 1. Hero ─────────────────────────────────────────────────── */}
      <section className="at-hero" aria-label="Asset Tokenization Hero">
        <div className="at-hero__inner">
          {/* Left copy */}
          <div>
            <span className="at-hero__eyebrow">Asset Tokenization</span>
            <h1 className="at-hero__title">
              Turn Real-World Assets into{" "}
              <span>Digital Tokens</span>
            </h1>
            <p className="at-hero__subtitle">
              CresoX enables institutions and asset owners to tokenize physical
              and financial assets on the blockchain — unlocking liquidity,
              fractional ownership, and global investment access within a
              regulatory-compliant framework.
            </p>
            <div className="at-hero__cta-row">
              <a href="#terms" className="at-hero__cta-primary">
                Apply Now
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#what" className="at-hero__cta-secondary">
                Learn How It Works
              </a>
            </div>
          </div>

          {/* Right illustration */}
          <div className="at-hero__visual" aria-hidden="true">
            <svg viewBox="0 0 460 360" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer glow rings */}
              <circle cx="230" cy="180" r="155" stroke="rgba(7,90,216,0.12)" strokeWidth="1" />
              <circle cx="230" cy="180" r="120" stroke="rgba(7,90,216,0.18)" strokeWidth="1" />
              <circle cx="230" cy="180" r="82" stroke="rgba(7,90,216,0.25)" strokeWidth="1" />

              {/* Central hex */}
              <polygon points="230,108 278,136 278,192 230,220 182,192 182,136"
                fill="url(#heroHexGrad)" stroke="rgba(96,165,250,0.5)" strokeWidth="1.5" />
              <polygon points="230,122 264,142 264,182 230,202 196,182 196,142"
                fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 3" />
              <text x="230" y="172" textAnchor="middle" fontSize="26" fontWeight="800" fill="#fff" fontFamily="Inter,sans-serif">₮</text>
              <text x="230" y="190" textAnchor="middle" fontSize="9" fontWeight="600" fill="rgba(255,255,255,0.5)" fontFamily="Inter,sans-serif" letterSpacing="2">TOKEN</text>

              {/* Asset nodes */}
              {/* Real estate */}
              <circle cx="90" cy="110" r="34" fill="rgba(7,90,216,0.15)" stroke="rgba(7,90,216,0.35)" strokeWidth="1.5" />
              <rect x="78" y="97" width="24" height="28" rx="2" fill="rgba(7,90,216,0.7)" />
              <rect x="82" y="88" width="16" height="12" rx="1" fill="rgba(5,75,181,0.8)" />
              <rect x="81" y="103" width="5" height="6" rx="0.5" fill="rgba(255,255,255,0.9)" />
              <rect x="88" y="103" width="5" height="6" rx="0.5" fill="rgba(255,255,255,0.9)" />
              <rect x="95" y="103" width="5" height="6" rx="0.5" fill="rgba(255,255,255,0.9)" />
              <text x="90" y="153" textAnchor="middle" fontSize="9" fontWeight="600" fill="rgba(255,255,255,0.55)" fontFamily="Inter,sans-serif">Real Estate</text>

              {/* Gold */}
              <circle cx="370" cy="110" r="34" fill="rgba(217,119,6,0.15)" stroke="rgba(217,119,6,0.35)" strokeWidth="1.5" />
              <rect x="352" y="101" width="36" height="18" rx="4" fill="rgba(217,119,6,0.8)" />
              <rect x="356" y="105" width="28" height="10" rx="2" fill="rgba(245,158,11,0.9)" />
              <text x="370" y="115" textAnchor="middle" fontSize="8" fontWeight="700" fill="rgba(120,53,15,0.9)" fontFamily="Inter,sans-serif">GOLD</text>
              <text x="370" y="153" textAnchor="middle" fontSize="9" fontWeight="600" fill="rgba(255,255,255,0.55)" fontFamily="Inter,sans-serif">Commodities</text>

              {/* Equity */}
              <circle cx="90" cy="260" r="34" fill="rgba(22,163,74,0.12)" stroke="rgba(22,163,74,0.3)" strokeWidth="1.5" />
              <polyline points="72,272 80,260 88,265 96,250 104,255 112,242" stroke="rgba(22,163,74,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="112" cy="242" r="3" fill="rgba(22,163,74,0.85)" />
              <text x="90" y="303" textAnchor="middle" fontSize="9" fontWeight="600" fill="rgba(255,255,255,0.55)" fontFamily="Inter,sans-serif">Private Equity</text>

              {/* Art */}
              <circle cx="370" cy="260" r="34" fill="rgba(219,39,119,0.1)" stroke="rgba(219,39,119,0.28)" strokeWidth="1.5" />
              <rect x="354" y="246" width="32" height="28" rx="2" fill="rgba(219,39,119,0.15)" stroke="rgba(219,39,119,0.4)" strokeWidth="1" />
              <circle cx="361" cy="255" r="3.5" fill="rgba(219,39,119,0.6)" />
              <polyline points="354,272 362,261 369,266 376,256 382,261 386,274" stroke="rgba(219,39,119,0.7)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
              <text x="370" y="303" textAnchor="middle" fontSize="9" fontWeight="600" fill="rgba(255,255,255,0.55)" fontFamily="Inter,sans-serif">Art & Collectibles</text>

              {/* Connector lines */}
              <line x1="124" y1="122" x2="185" y2="152" stroke="rgba(96,165,250,0.2)" strokeWidth="1" strokeDasharray="4 3" />
              <line x1="336" y1="122" x2="275" y2="152" stroke="rgba(96,165,250,0.2)" strokeWidth="1" strokeDasharray="4 3" />
              <line x1="124" y1="248" x2="185" y2="210" stroke="rgba(96,165,250,0.2)" strokeWidth="1" strokeDasharray="4 3" />
              <line x1="336" y1="248" x2="275" y2="210" stroke="rgba(96,165,250,0.2)" strokeWidth="1" strokeDasharray="4 3" />

              {/* Floating particles */}
              <circle cx="185" cy="72" r="3" fill="rgba(96,165,250,0.4)" />
              <circle cx="275" cy="72" r="2" fill="rgba(96,165,250,0.25)" />
              <circle cx="160" cy="310" r="2.5" fill="rgba(96,165,250,0.3)" />
              <circle cx="300" cy="310" r="2" fill="rgba(96,165,250,0.2)" />

              <defs>
                <linearGradient id="heroHexGrad" x1="182" y1="108" x2="278" y2="220" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1D6BF3" />
                  <stop offset="100%" stopColor="#054BB5" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Stats strip */}
        <div className="at-hero__stats" role="list" aria-label="Key statistics">
          <div className="at-hero__stat" role="listitem">
            <div className="at-hero__stat-value">₹16T+</div>
            <div className="at-hero__stat-label">Global RWA Tokenization Market by 2030</div>
          </div>
          <div className="at-hero__stat" role="listitem">
            <div className="at-hero__stat-value">48hrs</div>
            <div className="at-hero__stat-label">Typical Settlement vs. 30 Days Traditional</div>
          </div>
          <div className="at-hero__stat" role="listitem">
            <div className="at-hero__stat-value">8–16 wks</div>
            <div className="at-hero__stat-label">End-to-End Tokenization Timeline</div>
          </div>
        </div>
      </section>

      {/* ── 2. What is Asset Tokenization? ──────────────────────────── */}
      <section className="at-section" id="what" aria-labelledby="what-title">
        <div className="at-container">
          <div className="at-what__grid">
            {/* Content */}
            <div className="at-what__content">
              <span className="at-eyebrow">What Is It?</span>
              <h2 id="what-title">Asset Tokenization — Explained</h2>
              <p>
                Asset tokenization is the process of converting ownership rights in a real-world asset
                — such as property, gold, or private equity — into digital tokens on a blockchain.
                Each token represents a fractional or whole stake in the underlying asset, governed by
                smart contracts that encode all rights, obligations, and transfer rules.
              </p>
              <p>
                Unlike traditional securities, tokenized assets settle in near real-time, can be
                programmatically distributed to thousands of investors, and trade 24/7 on digital
                platforms — fundamentally reshaping how capital markets operate.
              </p>
              <div className="at-what__points">
                {[
                  { strong: "Blockchain-backed ownership", text: "Ownership records are immutable and verifiable by any party without a central authority." },
                  { strong: "Programmable rights", text: "Dividends, voting, and transfer restrictions are enforced automatically via smart contracts." },
                  { strong: "Global accessibility", text: "Investors from anywhere in the world can participate, subject to regulatory approvals." },
                ].map(({ strong, text }) => (
                  <div className="at-what__point" key={strong}>
                    <div className="at-what__point-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="at-what__point-text">
                      <strong>{strong}</strong>
                      <span>{text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Illustration */}
            <div className="at-what__visual" aria-hidden="true">
              <svg viewBox="0 0 400 380" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background */}
                <rect x="20" y="20" width="360" height="340" rx="20" fill="#F8FAFC" stroke="#E5E7EB" strokeWidth="1.5" />

                {/* Title bar */}
                <rect x="20" y="20" width="360" height="48" rx="20" fill="url(#whatHdrGrad)" />
                <rect x="20" y="44" width="360" height="24" fill="url(#whatHdrGrad)" />
                <circle cx="56" cy="44" r="7" fill="rgba(255,255,255,0.15)" />
                <circle cx="78" cy="44" r="7" fill="rgba(255,255,255,0.15)" />
                <circle cx="100" cy="44" r="7" fill="rgba(255,255,255,0.15)" />
                <text x="200" y="49" textAnchor="middle" fontSize="11" fontWeight="700" fill="rgba(255,255,255,0.85)" fontFamily="Inter,sans-serif">CRESOX TOKENIZATION LEDGER</text>

                {/* Asset box */}
                <rect x="48" y="90" width="140" height="110" rx="10" fill="#EFF6FF" stroke="#DBEAFE" strokeWidth="1.5" />
                <text x="118" y="113" textAnchor="middle" fontSize="10" fontWeight="700" fill="#075AD8" fontFamily="Inter,sans-serif" letterSpacing="1">ASSET</text>
                <rect x="64" y="120" width="108" height="14" rx="4" fill="rgba(7,90,216,0.12)" />
                <text x="118" y="131" textAnchor="middle" fontSize="9" fill="#374151" fontFamily="Inter,sans-serif">Commercial Property</text>
                <rect x="64" y="140" width="108" height="10" rx="3" fill="rgba(7,90,216,0.07)" />
                <text x="118" y="149" textAnchor="middle" fontSize="8" fill="#6B7280" fontFamily="Inter,sans-serif">Value: ₹10 Crore</text>
                <rect x="64" y="156" width="108" height="10" rx="3" fill="rgba(7,90,216,0.07)" />
                <text x="118" y="165" textAnchor="middle" fontSize="8" fill="#6B7280" fontFamily="Inter,sans-serif">Mumbai, Maharashtra</text>
                <rect x="64" y="172" width="108" height="16" rx="4" fill="rgba(22,163,74,0.12)" stroke="rgba(22,163,74,0.3)" strokeWidth="1" />
                <text x="118" y="183" textAnchor="middle" fontSize="8" fontWeight="700" fill="#16A34A" fontFamily="Inter,sans-serif">✓ Verified & Cleared</text>

                {/* Arrow */}
                <line x1="190" y1="145" x2="213" y2="145" stroke="#075AD8" strokeWidth="1.5" strokeDasharray="4 2" />
                <polygon points="213,142 220,145 213,148" fill="#075AD8" />

                {/* Token box */}
                <rect x="220" y="90" width="140" height="110" rx="10" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="1.5" />
                <text x="290" y="113" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0369A1" fontFamily="Inter,sans-serif" letterSpacing="1">TOKENS</text>
                {[0,1,2,3].map((i) => (
                  <g key={i}>
                    <rect x="236" y={120 + i * 18} width="108" height="14" rx="4" fill="rgba(7,90,216,0.1)" stroke="rgba(7,90,216,0.2)" strokeWidth="0.8" />
                    <text x="246" y={130 + i * 18} fontSize="8" fontWeight="700" fill="#075AD8" fontFamily="Inter,sans-serif">Token #{1001 + i}</text>
                    <text x="338" y={130 + i * 18} textAnchor="end" fontSize="8" fill="#374151" fontFamily="Inter,sans-serif">₹1L / 1%</text>
                  </g>
                ))}
                <text x="290" y="195" textAnchor="middle" fontSize="8" fill="#9CA3AF" fontFamily="Inter,sans-serif">+ 96 more tokens</text>

                {/* Blockchain row */}
                <rect x="48" y="228" width="312" height="60" rx="10" fill="#1A2332" />
                <text x="204" y="248" textAnchor="middle" fontSize="9" fontWeight="700" fill="rgba(255,255,255,0.5)" fontFamily="Inter,sans-serif" letterSpacing="2">BLOCKCHAIN LEDGER</text>
                {["0x4A2f…", "0x9C8e…", "0x3B1d…"].map((h, i) => (
                  <g key={h}>
                    <rect x={60 + i * 104} y="256" width="92" height="20" rx="4" fill="rgba(7,90,216,0.25)" />
                    <text x={106 + i * 104} y="270" textAnchor="middle" fontSize="7.5" fill="rgba(96,165,250,0.9)" fontFamily="monospace">{h}</text>
                  </g>
                ))}

                {/* Arrow down */}
                <line x1="204" y1="208" x2="204" y2="228" stroke="rgba(7,90,216,0.4)" strokeWidth="1.5" strokeDasharray="3 2" />
                <polygon points="200,228 204,235 208,228" fill="rgba(7,90,216,0.4)" />

                {/* Investors row */}
                <rect x="48" y="316" width="312" height="32" rx="8" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
                <text x="204" y="331" textAnchor="middle" fontSize="9" fontWeight="700" fill="#16A34A" fontFamily="Inter,sans-serif">✓ 100 Verified Investors — Fractional Ownership Distributed</text>
                <text x="204" y="341" textAnchor="middle" fontSize="8" fill="#6B7280" fontFamily="Inter,sans-serif">Tokens tradeable on CresoX Secondary Marketplace</text>

                <defs>
                  <linearGradient id="whatHdrGrad" x1="20" y1="20" x2="380" y2="68" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0D1F3C" />
                    <stop offset="100%" stopColor="#1A2E50" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Benefits ─────────────────────────────────────────────── */}
      <section className="at-section at-section--alt" aria-labelledby="benefits-title">
        <div className="at-container">
          <div className="at-section-header">
            <span className="at-eyebrow">Benefits</span>
            <h2 id="benefits-title" className="at-section-title">
              Why Tokenize with CresoX?
            </h2>
            <p className="at-section-subtitle">
              Tokenization transforms illiquid, opaque assets into transparent, programmable,
              globally accessible investment opportunities.
            </p>
          </div>

          <div className="at-benefits__grid" role="list">
            {BENEFITS.map(({ color, iconColor, icon, title, desc }) => (
              <article
                className="at-benefit-card"
                key={title}
                role="listitem"
                style={{ "--benefit-icon-bg": color, "--benefit-icon-color": iconColor }}
              >
                <div
                  className="at-benefit-card__icon"
                  style={{ background: color, color: iconColor }}
                  aria-hidden="true"
                >
                  {icon}
                </div>
                <h3 className="at-benefit-card__title">{title}</h3>
                <p className="at-benefit-card__desc">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Industries ───────────────────────────────────────────── */}
      <section className="at-section at-section--dark" aria-labelledby="industries-title">
        <div className="at-container">
          <div className="at-section-header">
            <span className="at-eyebrow at-eyebrow--white">Asset Classes</span>
            <h2 id="industries-title" className="at-section-title at-section-title--white">
              Industries We Serve
            </h2>
            <p className="at-section-subtitle at-section-subtitle--white">
              From physical commodities to digital intellectual property — CresoX supports
              tokenization across all major asset classes.
            </p>
          </div>

          <div className="at-industries__grid" role="list">
            {INDUSTRIES.map(({ name, example, icon }) => (
              <div className="at-industry-card" key={name} role="listitem">
                <div className="at-industry-card__icon" aria-hidden="true">{icon}</div>
                <div className="at-industry-card__name">{name}</div>
                <div className="at-industry-card__example">{example}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Tokenization Workflow ─────────────────────────────────── */}
      <section className="at-section" aria-labelledby="workflow-title">
        <div className="at-container">
          <div className="at-section-header">
            <span className="at-eyebrow">Process</span>
            <h2 id="workflow-title" className="at-section-title">Tokenization Workflow</h2>
            <p className="at-section-subtitle">
              A structured, transparent six-stage process — from initial asset assessment to
              live secondary market trading.
            </p>
          </div>

          <div className="at-workflow__steps" role="list">
            {WORKFLOW_STEPS.map(({ title, desc, tags }, idx) => (
              <div className="at-workflow__step" key={title} role="listitem">
                <div className="at-workflow__step-num" aria-label={`Step ${idx + 1}`}>
                  {idx + 1}
                </div>
                <div className="at-workflow__step-body">
                  <h3 className="at-workflow__step-title">{title}</h3>
                  <p className="at-workflow__step-desc">{desc}</p>
                  <div className="at-workflow__step-tags">
                    {tags.map((t) => (
                      <span className="at-workflow__tag" key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Required Documents ────────────────────────────────────── */}
      <section className="at-section at-section--alt" aria-labelledby="docs-title">
        <div className="at-container">
          <div className="at-section-header">
            <span className="at-eyebrow">Documentation</span>
            <h2 id="docs-title" className="at-section-title">Required Documents</h2>
            <p className="at-section-subtitle">
              Prepare the following documents before submitting your tokenization application.
              Incomplete submissions may cause delays.
            </p>
          </div>

          <div className="at-docs__grid" role="list">
            {DOCUMENTS.map(({ title, desc }) => (
              <div className="at-doc-item" key={title} role="listitem">
                <div className="at-doc-item__icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <div>
                  <div className="at-doc-item__title">{title}</div>
                  <div className="at-doc-item__desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FAQ ──────────────────────────────────────────────────── */}
      <section className="at-section" aria-labelledby="faq-title">
        <div className="at-container">
          <div className="at-section-header">
            <span className="at-eyebrow">FAQ</span>
            <h2 id="faq-title" className="at-section-title">Frequently Asked Questions</h2>
            <p className="at-section-subtitle">
              Everything you need to know about the tokenization process, fees, timelines, and
              investor rights.
            </p>
          </div>

          <div className="at-faq" role="list">
            {FAQS.map(({ q, a }) => (
              <div key={q} role="listitem">
                <FaqItem q={q} a={a} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8 & 9 & 10. Terms + Checkbox + Apply Button ─────────────── */}
      <section className="at-section at-terms" id="terms" aria-labelledby="terms-title">
        <div className="at-container">
          <div className="at-section-header">
            <span className="at-eyebrow">Legal</span>
            <h2 id="terms-title" className="at-section-title">Terms &amp; Conditions</h2>
            <p className="at-section-subtitle">
              Please read and accept the terms below before submitting your tokenization
              application.
            </p>
          </div>

          <div className="at-terms__box">
            <h3 className="at-terms__title">
              Asset Tokenization Terms &amp; Conditions
            </h3>

            {/* Scrollable T&C content */}
            <div
              className="at-terms__scroll"
              tabIndex={0}
              role="region"
              aria-label="Terms and conditions text"
            >
              {TERMS_TEXT.trim().split("\n").map((line, i) => {
                if (line.startsWith("ASSET TOKENIZATION") || line.startsWith("CresoX Fintech") || line.startsWith("Effective Date") || line.startsWith("PLEASE READ")) {
                  return <p key={i} style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>{line}</p>;
                }
                if (/^\d+\. [A-Z]/.test(line)) {
                  return <h4 key={i}>{line}</h4>;
                }
                if (line.trim() === "") return null;
                return <p key={i}>{line}</p>;
              })}
            </div>

            {/* Checkbox */}
            <label
              className="at-terms__checkbox-row"
              htmlFor="terms-checkbox"
            >
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                aria-describedby="terms-checkbox-desc"
              />
              <div className="at-terms__checkbox-label">
                I have read and accepted the Terms &amp; Conditions
                <span id="terms-checkbox-desc">
                  By checking this box, you confirm you have read, understood, and agree to be
                  bound by CresoX's Asset Tokenization Terms &amp; Conditions.
                </span>
              </div>
            </label>

            {/* Apply button */}
            <button
              type="button"
              className="at-terms__apply-btn"
              disabled={!agreed}
              onClick={handleApply}
              aria-label={agreed ? "Proceed to tokenization application" : "Accept terms and conditions to enable Apply button"}
            >
              {agreed ? (
                <>
                  Proceed to Application
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Accept Terms to Apply
                </>
              )}
            </button>

            {!agreed && (
              <p className="at-terms__btn-hint" role="status" aria-live="polite">
                ☝ Please check the box above to enable the Apply button.
              </p>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <FloatingScrollTop />
    </div>
  );
}

export default AssetTokenization;
