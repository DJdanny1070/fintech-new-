import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar/Navbar";
import Footer from "../components/home/Footer/Footer";
import "./ServicesPage.css";

/* ── Service data ──────────────────────────────────────────── */
const SERVICE_CARDS = [
  {
    id: "asset-tokenization",
    eyebrow: "Fintech Product",
    title: "Asset Tokenization",
    headline: "Turn any asset into a digital token — owned, traded, and protected.",
    description:
      "Imagine you own a building worth ₹10 Crores. Instead of selling it to just one buyer, CresoX splits its ownership into thousands of small digital certificates called tokens. Each token represents a share of that building. People can buy, hold, or sell tokens — just like shares in a company.",
    plainPoints: [
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
          </svg>
        ),
        title: "Secure Ownership",
        desc: "Your ownership of each token is securely recorded and cannot be altered by anyone — not even CresoX.",
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        ),
        title: "Verified Data Integrity",
        desc: "Every asset detail is checked and locked in place. The information on your token is always accurate and tamper-proof.",
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        ),
        title: "Reliable Token Transfers",
        desc: "Buying or selling tokens is fast and straightforward. Every transfer is recorded so there is no confusion about who owns what.",
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
        ),
        title: "Transparent Asset Management",
        desc: "You can always see the full history of your asset — who owned it, when it changed hands, and its current status.",
      },
    ],
    illustration: (
      <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="sp__card-svg">
        <ellipse cx="140" cy="100" rx="110" ry="70" fill="url(#spGlowBlue)" opacity="0.18" />
        <polygon points="140,44 178,66 178,110 140,132 102,110 102,66" fill="url(#spHexGrad)" stroke="url(#spHexStroke)" strokeWidth="1.5" />
        <polygon points="140,60 166,74 166,102 140,116 114,102 114,74" fill="none" stroke="rgba(7,90,216,0.3)" strokeWidth="0.8" strokeDasharray="3 2" />
        <text x="140" y="94" textAnchor="middle" fontSize="20" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">₮</text>
        <circle cx="60" cy="76" r="22" fill="#EFF6FF" stroke="#DBEAFE" strokeWidth="1.5" />
        <rect x="52" y="66" width="16" height="20" rx="1" fill="#075AD8" opacity="0.85" />
        <rect x="55" y="60" width="10" height="8" rx="1" fill="#054BB5" opacity="0.7" />
        <circle cx="220" cy="76" r="22" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5" />
        <rect x="206" y="69" width="28" height="14" rx="3" fill="#D97706" />
        <rect x="209" y="72" width="22" height="8" rx="2" fill="#F59E0B" />
        <text x="220" y="79" textAnchor="middle" fontSize="7" fontWeight="700" fill="#92400E" fontFamily="Inter,sans-serif">GOLD</text>
        <circle cx="60" cy="136" r="22" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1.5" />
        <polyline points="50,142 55,134 61,138 66,128 71,132" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="71" cy="132" r="2.5" fill="#16A34A" />
        <circle cx="220" cy="136" r="22" fill="#FDF2F8" stroke="#F9A8D4" strokeWidth="1.5" />
        <rect x="209" y="126" width="22" height="20" rx="2" fill="#DB2777" opacity="0.15" stroke="#DB2777" strokeWidth="1" />
        <line x1="82" y1="84" x2="105" y2="88" stroke="#DBEAFE" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="198" y1="84" x2="175" y2="88" stroke="#DBEAFE" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="82" y1="128" x2="105" y2="113" stroke="#DBEAFE" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="198" y1="128" x2="175" y2="113" stroke="#DBEAFE" strokeWidth="1" strokeDasharray="3 2" />
        <defs>
          <radialGradient id="spGlowBlue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#075AD8" />
            <stop offset="100%" stopColor="#075AD8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="spHexGrad" x1="102" y1="44" x2="178" y2="132" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1D6BF3" />
            <stop offset="100%" stopColor="#054BB5" />
          </linearGradient>
          <linearGradient id="spHexStroke" x1="102" y1="44" x2="178" y2="132" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    ),
    learnMoreTo: "/services/asset-tokenization",
    requestTo: "/request/asset-tokenization",
    requestLabel: "Request Tokenization",
    accentColor: "#075AD8",
    accentBg: "#EFF6FF",
  },
  {
    id: "direct-consultancy",
    eyebrow: "Advisory Service",
    title: "Direct Consultancy",
    headline: "Talk directly to a CresoX expert — and get a strategy built for you.",
    description:
      "Whether you're a business owner looking to tokenize your assets, or an entrepreneur exploring fintech, our consultants guide you at every step. There are no complicated forms or automated bots — you speak directly to a human expert who understands your situation.",
    plainPoints: [
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
        title: "Digital Asset Strategy",
        desc: "We help you plan how to manage, grow, and protect your digital assets in a way that aligns with your business goals.",
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        ),
        title: "Tokenization Planning",
        desc: "We map out the full tokenization process for your specific asset — from legal structure to token issuance — in simple terms.",
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        title: "Business Onboarding",
        desc: "If you're new to fintech, we walk you through everything step by step. No experience required.",
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" />
          </svg>
        ),
        title: "Enterprise Integration",
        desc: "Already running a business? We help you connect your existing systems with CresoX's platform — smoothly and securely.",
      },
    ],
    consultancyServices: [
      "Digital asset strategy",
      "Blockchain consultation",
      "Tokenization planning",
      "Business onboarding",
      "Financial technology consulting",
      "Enterprise integration guidance",
    ],
    illustration: (
      <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="sp__card-svg">
        <ellipse cx="140" cy="100" rx="110" ry="70" fill="url(#spGlowSlate)" opacity="0.14" />
        <rect x="85" y="88" width="110" height="60" rx="8" fill="url(#spTableGrad)" stroke="#DBEAFE" strokeWidth="1.5" />
        <rect x="104" y="96" width="50" height="44" rx="4" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="111" y1="108" x2="147" y2="108" stroke="#075AD8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="111" y1="116" x2="147" y2="116" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <line x1="111" y1="123" x2="135" y2="123" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <polyline points="111,134 118,128 125,131 132,122 140,126 147,118" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="147" cy="118" r="2" fill="#16A34A" />
        <circle cx="65" cy="78" r="18" fill="#EFF6FF" stroke="#DBEAFE" strokeWidth="1.5" />
        <circle cx="65" cy="70" r="8" fill="#075AD8" opacity="0.9" />
        <path d="M53,90 Q65,82 77,90" stroke="#075AD8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
        <rect x="78" y="52" width="40" height="22" rx="6" fill="#075AD8" />
        <polygon points="82,74 88,74 85,80" fill="#075AD8" />
        <line x1="84" y1="60" x2="112" y2="60" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        <line x1="84" y1="66" x2="104" y2="66" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <circle cx="215" cy="78" r="18" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1.5" />
        <circle cx="215" cy="70" r="8" fill="#16A34A" opacity="0.85" />
        <path d="M203,90 Q215,82 227,90" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85" />
        {[0,1,2,3,4].map((i) => (
          <text key={i} x={108 + i * 14} y={160} fontSize="10" fill="#D97706" fontFamily="serif">★</text>
        ))}
        <rect x="100" y="154" width="80" height="22" rx="11" fill="#fff" stroke="#E5E7EB" strokeWidth="1" opacity="0.9" />
        <text x="140" y="169" textAnchor="middle" fontSize="8" fontWeight="600" fill="#075AD8" fontFamily="Inter,sans-serif">Bespoke Strategy</text>
        <defs>
          <radialGradient id="spGlowSlate" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2C3E58" />
            <stop offset="100%" stopColor="#2C3E58" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="spTableGrad" x1="85" y1="88" x2="195" y2="148" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#EFF6FF" />
          </linearGradient>
        </defs>
      </svg>
    ),
    learnMoreTo: "/services/direct-consultancy",
    requestTo: "/consultation-request",
    requestLabel: "Request Consultancy",
    accentColor: "#16A34A",
    accentBg: "#F0FDF4",
  },
];

/* ── Blockchain explainer ──────────────────────────────────── */
const BLOCKCHAIN_POINTS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Your information is securely protected and cannot be changed without verification.",
    desc: "Every piece of information about your asset or transaction is locked in place. No one — not even an administrator — can quietly alter it.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    title: "Every transaction is securely recorded and verified.",
    desc: "When you buy, sell, or transfer a token, it's written into a permanent record. You can always look it up and confirm it happened.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Ownership is always clear and publicly verifiable.",
    desc: "Anyone can check who owns a token at any time. There are no hidden transfers or surprise changes in ownership.",
  },
];

/* ── User journey steps ────────────────────────────────────── */
const JOURNEY_STEPS = [
  { num: "01", label: "Visit CresoX",      sub: "Browse our services",                color: "rgba(56, 189, 248, 0.15)", iconColor: "#38BDF8" },
  { num: "02", label: "Read & Understand", sub: "Learn about our services",            color: "rgba(245, 158, 11, 0.15)", iconColor: "#F59E0B" },
  { num: "03", label: "Accept T&C",        sub: "Review terms & conditions",           color: "rgba(16, 185, 129, 0.15)", iconColor: "#10B981" },
  { num: "04", label: "Submit Request",    sub: "Fill in the service request form",    color: "rgba(56, 189, 248, 0.15)", iconColor: "#38BDF8" },
  { num: "05", label: "Verification",      sub: "CresoX reviews your application",     color: "rgba(16, 185, 129, 0.15)", iconColor: "#10B981" },
  { num: "06", label: "Approved",          sub: "Receive your account credentials",    color: "rgba(16, 185, 129, 0.15)", iconColor: "#10B981" },
  { num: "07", label: "Sign In",           sub: "Access your secure dashboard",        color: "rgba(255, 87, 34, 0.15)", iconColor: "#FF5722" },
];

/* ─────────────────────────────────────────────────────────── */

function ServicesPage() {
  return (
    <>
      <Navbar />

      {/* Page Hero */}
      <section className="sp__hero">
        <div className="sp__container">
          <span className="sp__eyebrow">Our Services</span>
          <h1 className="sp__hero-title">
            What CresoX Offers
          </h1>
          <p className="sp__hero-sub">
            Two core services — Asset Tokenization and Direct Consultancy — designed to
            bring your investments into the digital age, safely and simply.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <section className="sp__services">
        <div className="sp__container">
          {SERVICE_CARDS.map((svc, idx) => (
            <article
              key={svc.id}
              id={svc.id}
              className={`sp__service-card ${idx % 2 === 1 ? "sp__service-card--reverse" : ""}`}
            >
              {/* Visual */}
              <div className="sp__card-visual">
                {svc.illustration}
              </div>

              {/* Content */}
              <div className="sp__card-body">
                <span className="sp__card-eyebrow" style={{ color: svc.accentColor, background: svc.accentBg }}>
                  {svc.eyebrow}
                </span>
                <h2 className="sp__card-title">{svc.title}</h2>
                <p className="sp__card-headline">{svc.headline}</p>
                <p className="sp__card-desc">{svc.description}</p>

                {/* Plain-language points */}
                <ul className="sp__card-points">
                  {svc.plainPoints.map((pt) => (
                    <li key={pt.title} className="sp__card-point">
                      <div className="sp__card-point-icon" style={{ color: svc.accentColor, background: svc.accentBg }}>
                        {pt.icon}
                      </div>
                      <div>
                        <div className="sp__card-point-title">{pt.title}</div>
                        <div className="sp__card-point-desc">{pt.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Consultancy services list */}
                {svc.consultancyServices && (
                  <div className="sp__consult-list">
                    <div className="sp__consult-list-label">Services include:</div>
                    <div className="sp__consult-tags">
                      {svc.consultancyServices.map((s) => (
                        <span key={s} className="sp__consult-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="sp__card-actions">
                  <Link to={svc.learnMoreTo} className="btn btn-secondary">
                    Learn More
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <Link to={svc.requestTo} className="btn btn-primary">
                    {svc.requestLabel}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Blockchain Explained */}
      <section className="sp__blockchain">
        <div className="sp__container">
          <div className="sp__section-header">
            <span className="sp__eyebrow">How It Works</span>
            <h2 className="sp__section-title">Why we use Blockchain</h2>
            <p className="sp__section-sub">
              Think of blockchain as a secure, permanent record book that everyone can read
              but no one can quietly erase or change.
            </p>
          </div>

          <div className="sp__blockchain-grid">
            {BLOCKCHAIN_POINTS.map((pt) => (
              <div key={pt.title} className="sp__blockchain-card">
                <div className="sp__blockchain-icon">
                  {pt.icon}
                </div>
                <div className="sp__blockchain-title">{pt.title}</div>
                <div className="sp__blockchain-desc">{pt.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Journey */}
      <section className="sp__journey">
        <div className="sp__container">
          <div className="sp__section-header">
            <span className="sp__eyebrow">Your Journey</span>
            <h2 className="sp__section-title">How you get started with CresoX</h2>
            <p className="sp__section-sub">
              Seven simple steps — from first visit to accessing your secure dashboard.
              No shortcuts, no bypasses. Every user goes through our verification process.
            </p>
          </div>

          <div className="sp__journey-track">
            {JOURNEY_STEPS.map((step, idx) => (
              <div key={step.num} className="sp__journey-step">
                <div className="sp__journey-node">
                  <div
                    className="sp__journey-badge"
                    style={{ background: step.color, color: step.iconColor }}
                  >
                    {step.num}
                  </div>
                </div>
                {idx < JOURNEY_STEPS.length - 1 && (
                  <div className="sp__journey-connector" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sp__journey-arrow">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                )}
                <div className="sp__journey-labels">
                  <div className="sp__journey-label">{step.label}</div>
                  <div className="sp__journey-sub">{step.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA at bottom of journey */}
          <div className="sp__journey-cta">
            <p className="sp__journey-cta-text">
              Ready to begin? Submit a service request and we'll be in touch within 48 hours.
            </p>
            <div className="sp__journey-cta-btns">
              <Link to="/request/asset-tokenization" className="btn btn-primary btn-lg">
                Request Asset Tokenization
              </Link>
              <Link to="/consultation-request" className="btn btn-secondary btn-lg">
                Request Consultancy
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default ServicesPage;
