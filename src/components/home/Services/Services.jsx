import { Link } from "react-router-dom";
import "./Services.css";

const SERVICES = [
  {
    id: "asset-tokenization",
    href: "/services/asset-tokenization",
    eyebrow: "Fintech Product",
    title: "Asset Tokenization",
    description:
      "Convert physical and financial assets into secure, blockchain-anchored digital tokens. Enable fractional ownership, enhanced liquidity, and broader investor access — all within a compliant, enterprise-grade infrastructure.",
    features: [
      "Your asset's ownership is split into smaller tradeable digital tokens",
      "Ownership is permanently recorded and cannot be altered by anyone",
      "Compliant, structured token issuance within regulatory guidelines",
      "Tokens can be traded on the marketplace after tokenization",
    ],
    requestTo: "/request/asset-tokenization",
    illustration: (
      <svg
        viewBox="0 0 280 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="services__illustration"
      >
        {/* Background glow */}
        <ellipse cx="140" cy="100" rx="110" ry="70" fill="url(#glowBlue)" opacity="0.18" />

        {/* Central hex token */}
        <polygon
          points="140,44 178,66 178,110 140,132 102,110 102,66"
          fill="url(#hexGrad)"
          stroke="url(#hexStroke)"
          strokeWidth="1.5"
        />
        {/* Inner hex pattern */}
        <polygon
          points="140,60 166,74 166,102 140,116 114,102 114,74"
          fill="none"
          stroke="rgba(7,90,216,0.3)"
          strokeWidth="0.8"
          strokeDasharray="3 2"
        />
        {/* Token symbol */}
        <text x="140" y="94" textAnchor="middle" fontSize="20" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">₮</text>

        {/* Orbiting asset nodes */}
        {/* Building / real estate */}
        <circle cx="60" cy="76" r="22" fill="#EFF6FF" stroke="#DBEAFE" strokeWidth="1.5" />
        <rect x="52" y="66" width="16" height="20" rx="1" fill="#075AD8" opacity="0.85" />
        <rect x="55" y="60" width="10" height="8" rx="1" fill="#054BB5" opacity="0.7" />
        <rect x="54" y="70" width="3" height="4" rx="0.5" fill="#fff" opacity="0.9" />
        <rect x="59" y="70" width="3" height="4" rx="0.5" fill="#fff" opacity="0.9" />
        <rect x="64" y="70" width="3" height="4" rx="0.5" fill="#fff" opacity="0.9" />

        {/* Gold bar */}
        <circle cx="220" cy="76" r="22" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5" />
        <rect x="206" y="69" width="28" height="14" rx="3" fill="#D97706" />
        <rect x="209" y="72" width="22" height="8" rx="2" fill="#F59E0B" />
        <text x="220" y="79" textAnchor="middle" fontSize="7" fontWeight="700" fill="#92400E" fontFamily="Inter,sans-serif">GOLD</text>

        {/* Chart / equity */}
        <circle cx="60" cy="136" r="22" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1.5" />
        <polyline points="50,142 55,134 61,138 66,128 71,132" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="71" cy="132" r="2.5" fill="#16A34A" />

        {/* Artwork / collectible */}
        <circle cx="220" cy="136" r="22" fill="#FDF2F8" stroke="#F9A8D4" strokeWidth="1.5" />
        <rect x="209" y="126" width="22" height="20" rx="2" fill="#DB2777" opacity="0.15" stroke="#DB2777" strokeWidth="1" />
        <circle cx="215" cy="132" r="3" fill="#DB2777" opacity="0.6" />
        <polyline points="209,144 215,136 220,141 226,131 231,138 231,146" stroke="#DB2777" strokeWidth="1.2" fill="none" strokeLinejoin="round" />

        {/* Connector lines */}
        <line x1="82" y1="84" x2="105" y2="88" stroke="#DBEAFE" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="198" y1="84" x2="175" y2="88" stroke="#DBEAFE" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="82" y1="128" x2="105" y2="113" stroke="#DBEAFE" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="198" y1="128" x2="175" y2="113" stroke="#DBEAFE" strokeWidth="1" strokeDasharray="3 2" />

        {/* Floating micro dots */}
        <circle cx="140" cy="26" r="3" fill="#075AD8" opacity="0.4" />
        <circle cx="156" cy="20" r="2" fill="#075AD8" opacity="0.25" />
        <circle cx="124" cy="22" r="2" fill="#075AD8" opacity="0.25" />

        <defs>
          <radialGradient id="glowBlue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#075AD8" />
            <stop offset="100%" stopColor="#075AD8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hexGrad" x1="102" y1="44" x2="178" y2="132" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1D6BF3" />
            <stop offset="100%" stopColor="#054BB5" />
          </linearGradient>
          <linearGradient id="hexStroke" x1="102" y1="44" x2="178" y2="132" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: "direct-consultancy",
    href: "/services/direct-consultancy",
    eyebrow: "Advisory Service",
    title: "Direct Consultancy",
    description:
      "Speak directly with a CresoX expert. Whether you need a digital asset strategy, tokenization plan, or help getting your business onboarded, we build a plan around your goals — not a template.",
    features: [
      "Digital asset strategy and planning",
      "Blockchain consultation in plain language",
      "Business onboarding and enterprise integration",
      "One-on-one sessions with senior advisors",
    ],
    requestTo: "/consultation-request",
    illustration: (
      <svg
        viewBox="0 0 280 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="services__illustration"
      >
        {/* Background glow */}
        <ellipse cx="140" cy="100" rx="110" ry="70" fill="url(#glowSlate)" opacity="0.14" />

        {/* Central desk / strategy table */}
        <rect x="85" y="88" width="110" height="60" rx="8" fill="url(#tableGrad)" stroke="#DBEAFE" strokeWidth="1.5" />

        {/* Document on table */}
        <rect x="104" y="96" width="50" height="44" rx="4" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="111" y1="108" x2="147" y2="108" stroke="#075AD8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="111" y1="116" x2="147" y2="116" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <line x1="111" y1="123" x2="135" y2="123" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        {/* Chart on doc */}
        <polyline points="111,134 118,128 125,131 132,122 140,126 147,118" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="147" cy="118" r="2" fill="#16A34A" />

        {/* Pie chart on table */}
        <circle cx="172" cy="115" r="18" fill="#EFF6FF" stroke="#DBEAFE" strokeWidth="1" />
        {/* Pie segments approximated with paths */}
        <path d="M172,115 L172,97 A18,18 0 0,1 188,124 Z" fill="#075AD8" opacity="0.85" />
        <path d="M172,115 L188,124 A18,18 0 0,1 156,124 Z" fill="#054BB5" opacity="0.6" />
        <path d="M172,115 L156,124 A18,18 0 0,1 172,97 Z" fill="#DBEAFE" stroke="#DBEAFE" strokeWidth="0.5" />
        <circle cx="172" cy="115" r="7" fill="#fff" />

        {/* Advisor figure left */}
        <circle cx="65" cy="78" r="18" fill="#EFF6FF" stroke="#DBEAFE" strokeWidth="1.5" />
        {/* Head */}
        <circle cx="65" cy="70" r="8" fill="#075AD8" opacity="0.9" />
        {/* Body */}
        <path d="M53,90 Q65,82 77,90" stroke="#075AD8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
        {/* Speech bubble */}
        <rect x="78" y="52" width="40" height="22" rx="6" fill="#075AD8" />
        <polygon points="82,74 88,74 85,80" fill="#075AD8" />
        <line x1="84" y1="60" x2="112" y2="60" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        <line x1="84" y1="66" x2="104" y2="66" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

        {/* Client figure right */}
        <circle cx="215" cy="78" r="18" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1.5" />
        <circle cx="215" cy="70" r="8" fill="#16A34A" opacity="0.85" />
        <path d="M203,90 Q215,82 227,90" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85" />

        {/* Connector arrows */}
        <line x1="83" y1="88" x2="90" y2="95" stroke="#DBEAFE" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="197" y1="88" x2="190" y2="95" stroke="#DBEAFE" strokeWidth="1" strokeDasharray="3 2" />

        {/* Stars / rating */}
        {[0,1,2,3,4].map((i) => (
          <text key={i} x={108 + i * 14} y={160} fontSize="10" fill="#D97706" fontFamily="serif">★</text>
        ))}

        {/* Floating badge */}
        <rect x="100" y="154" width="80" height="22" rx="11" fill="#fff" stroke="#E5E7EB" strokeWidth="1" opacity="0.9" />
        <text x="140" y="169" textAnchor="middle" fontSize="8" fontWeight="600" fill="#075AD8" fontFamily="Inter,sans-serif">Bespoke Strategy</text>

        <defs>
          <radialGradient id="glowSlate" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2C3E58" />
            <stop offset="100%" stopColor="#2C3E58" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="tableGrad" x1="85" y1="88" x2="195" y2="148" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#EFF6FF" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
];

/* ── Journey workflow steps ─────────────────────────────── */
const JOURNEY_STEPS = [
  {
    id: "visitor",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    label: "Visitor",
    sublabel: "You arrive at CresoX",
    color: "#EFF6FF",
    iconColor: "#075AD8",
  },
  {
    id: "request",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    label: "Service Request",
    sublabel: "Choose your service",
    color: "#FFFBEB",
    iconColor: "#D97706",
  },
  {
    id: "verification",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    label: "Verification",
    sublabel: "Identity & KYC check",
    color: "#F0FDF4",
    iconColor: "#16A34A",
  },
  {
    id: "approval",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    label: "Approval",
    sublabel: "Account activated",
    color: "#F0FDF4",
    iconColor: "#16A34A",
  },
  {
    id: "dashboard",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    label: "Dashboard",
    sublabel: "Manage your portfolio",
    color: "#EFF6FF",
    iconColor: "#075AD8",
  },
  {
    id: "marketplace",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    label: "Marketplace",
    sublabel: "Buy & sell digital assets",
    color: "#FDF2F8",
    iconColor: "#DB2777",
  },
];

function Services() {
  return (
    <section className="services" id="services">
      <div className="services__container">
        {/* Section Header */}
        <div className="services__header">
          <span className="services__eyebrow">Our Services</span>
          <h2 className="services__title">
            Premium Fintech Services
          </h2>
          <p className="services__subtitle">
            From blockchain-powered asset tokenization to high-touch strategic
            advisory — CresoX delivers institutional-grade solutions built for
            the next era of finance.
          </p>
        </div>

        {/* Premium Service Cards */}
        <div className="services__grid">
          {SERVICES.map(({ id, href, eyebrow, title, description, features, illustration, requestTo }) => (
            <article className="services__card" key={id} id={id}>
              {/* Illustration */}
              <div className="services__card-visual">
                {illustration}
              </div>

              {/* Content */}
              <div className="services__card-body">
                <span className="services__card-eyebrow">{eyebrow}</span>
                <h3 className="services__card-title">{title}</h3>
                <p className="services__card-desc">{description}</p>

                <ul className="services__card-features">
                  {features.map((f) => (
                    <li key={f} className="services__feature-item">
                      <span className="services__feature-dot" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to={href}
                  className="services__learn-btn"
                  aria-label={`Learn more about ${title}`}
                >
                  Learn More
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="services__btn-arrow">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  to={requestTo}
                  className="btn btn-primary btn-sm"
                  aria-label={`Submit a request for ${title}`}
                  style={{ marginTop: 4 }}
                >
                  {id === "asset-tokenization" ? "Request Tokenization" : "Request Consultancy"}
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* ══════════ EDUCATIONAL SECTION ══════════ */}
        <div className="services__edu" id="services-education">

          {/* Divider label */}
          <div className="services__edu-label">
            <span className="services__eyebrow" style={{ marginBottom: 0 }}>
              New to CresoX? Start here
            </span>
            <p className="services__edu-sublabel">
              Understand our core concepts in plain, everyday language — no technical knowledge required.
            </p>
          </div>

          {/* ── Explanation Cards ── */}
          <div className="services__explain-grid">

            {/* Card 1 — Asset Tokenization */}
            <div className="services__explain-card" id="explain-tokenization">
              <div className="services__explain-card-header" style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)" }}>
                {/* SVG Illustration — building split into tokens */}
                <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="services__explain-svg" aria-hidden="true">
                  {/* Building */}
                  <rect x="30" y="50" width="80" height="110" rx="4" fill="#1D6BF3" opacity="0.9" />
                  <rect x="38" y="60" width="12" height="16" rx="1" fill="#fff" opacity="0.85" />
                  <rect x="56" y="60" width="12" height="16" rx="1" fill="#fff" opacity="0.85" />
                  <rect x="74" y="60" width="12" height="16" rx="1" fill="#fff" opacity="0.85" />
                  <rect x="38" y="84" width="12" height="16" rx="1" fill="#fff" opacity="0.85" />
                  <rect x="56" y="84" width="12" height="16" rx="1" fill="#fff" opacity="0.85" />
                  <rect x="74" y="84" width="12" height="16" rx="1" fill="#fff" opacity="0.85" />
                  <rect x="50" y="115" width="40" height="45" rx="2" fill="#054BB5" />
                  {/* Price tag */}
                  <rect x="14" y="28" width="112" height="20" rx="10" fill="#fff" stroke="#DBEAFE" strokeWidth="1" />
                  <text x="70" y="42" textAnchor="middle" fontSize="9" fontWeight="700" fill="#075AD8" fontFamily="Inter,sans-serif">₹10 Crores</text>
                  {/* Arrow right */}
                  <path d="M120 110 L148 110" stroke="#075AD8" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />
                  <path d="M144 106 L150 110 L144 114" stroke="#075AD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  {/* Token grid */}
                  <g>
                    {[0,1,2].map(col => [0,1,2].map(row => (
                      <g key={`${col}-${row}`}>
                        <rect x={160 + col * 50} y={48 + row * 46} width="40" height="36" rx="6"
                          fill={["#EFF6FF","#DBEAFE","#BFDBFE","#93C5FD","#60A5FA","#3B82F6","#2563EB","#1D4ED8","#1E40AF"][col*3+row]}
                          stroke="#BFDBFE" strokeWidth="1" />
                        <text x={180 + col * 50} y={70 + row * 46} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">₮</text>
                      </g>
                    )))
                    }
                  </g>
                  {/* Equal sign */}
                  <text x="152" y="97" fontSize="16" fontWeight="800" fill="#075AD8" fontFamily="Inter,sans-serif">=</text>
                  {/* Investor avatars below tokens */}
                  {[0,1,2].map(i => (
                    <g key={i}>
                      <circle cx={185 + i * 50} cy={168} r="10" fill={["#075AD8","#16A34A","#DB2777"][i]} opacity="0.85" />
                      <text x={185 + i * 50} y={172} textAnchor="middle" fontSize="9" fill="#fff" fontFamily="Inter,sans-serif" fontWeight="600">{["A","B","C"][i]}</text>
                    </g>
                  ))}
                  <text x="235" y="172" textAnchor="middle" fontSize="8" fill="#6B7280" fontFamily="Inter,sans-serif">Investors</text>
                </svg>
              </div>
              <div className="services__explain-card-body">
                <div className="services__explain-badge" style={{ color: "#075AD8", background: "#EFF6FF" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                  Concept Explained
                </div>
                <h3 className="services__explain-title">What is Asset Tokenization?</h3>
                <p className="services__explain-intro">
                  Think of a building worth <strong>₹10 Crores</strong>. Normally, only one person or company can own it.
                  With asset tokenization, its ownership is split into many small <strong>digital tokens</strong>.
                </p>
                <div className="services__explain-steps">
                  <div className="services__explain-step">
                    <div className="services__explain-step-icon" style={{ background: "#EFF6FF", color: "#075AD8" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="services__explain-step-title">The Asset</span>
                      <span className="services__explain-step-desc">A real building, gold, or equity — worth ₹10 Crores.</span>
                    </div>
                  </div>
                  <div className="services__explain-arrow" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                    </svg>
                  </div>
                  <div className="services__explain-step">
                    <div className="services__explain-step-icon" style={{ background: "#DBEAFE", color: "#1D6BF3" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                      </svg>
                    </div>
                    <div>
                      <span className="services__explain-step-title">Divided into Tokens</span>
                      <span className="services__explain-step-desc">Ownership is split — e.g. 10,000 tokens at ₹10,000 each.</span>
                    </div>
                  </div>
                  <div className="services__explain-arrow" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                    </svg>
                  </div>
                  <div className="services__explain-step">
                    <div className="services__explain-step-icon" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <span className="services__explain-step-title">Multiple Investors</span>
                      <span className="services__explain-step-desc">Anyone can buy tokens securely — no need to buy the whole asset.</span>
                    </div>
                  </div>
                </div>
                <div className="services__explain-callout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "#D97706" }}>
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>CresoX handles all the legal structure, security, and technology — so you don't have to.</span>
                </div>
              </div>
            </div>

            {/* Card 2 — Blockchain */}
            <div className="services__explain-card" id="explain-blockchain">
              <div className="services__explain-card-header" style={{ background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)" }}>
                {/* SVG Illustration — chain of blocks */}
                <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="services__explain-svg" aria-hidden="true">
                  {/* Block chain horizontal */}
                  {[0,1,2].map(i => (
                    <g key={i}>
                      {/* Block body */}
                      <rect x={20 + i * 98} y={58} width="82" height="64" rx="8"
                        fill={i === 0 ? "#16A34A" : i === 1 ? "#0F9E60" : "#0D8A52"}
                        opacity={1 - i * 0.08} />
                      {/* Inner lighter block */}
                      <rect x={28 + i * 98} y={66} width="66" height="48" rx="5" fill="rgba(255,255,255,0.12)" />
                      {/* Hash lines */}
                      <line x1={36 + i * 98} y1={80} x2={82 + i * 98} y2={80} stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1={36 + i * 98} y1={90} x2={74 + i * 98} y2={90} stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round" />
                      <line x1={36 + i * 98} y1={99} x2={78 + i * 98} y2={99} stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round" />
                      {/* Block label */}
                      <text x={61 + i * 98} y={120} textAnchor="middle" fontSize="9" fontWeight="700" fill="rgba(255,255,255,0.9)" fontFamily="Inter,sans-serif">{`Block ${i + 1}`}</text>
                      {/* Chain link */}
                      {i < 2 && (
                        <>
                          <path d={`M${102 + i * 98} 90 C${112 + i * 98} 82 ${112 + i * 98} 98 ${122 + i * 98} 90`}
                            stroke="#16A34A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        </>
                      )}
                    </g>
                  ))}
                  {/* Lock icon on each block */}
                  {[0,1,2].map(i => (
                    <g key={`lock-${i}`}>
                      <rect x={52 + i * 98} y={62} width="16" height="12" rx="3" fill="rgba(255,255,255,0.25)" />
                      <path d={`M${55 + i * 98} 62 a5,5 0 0 1 10,0`} stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </g>
                  ))}
                  {/* Permanent record badge */}
                  <rect x="90" y="138" width="140" height="24" rx="12" fill="#fff" stroke="#BBF7D0" strokeWidth="1" />
                  <text x="160" y="154" textAnchor="middle" fontSize="9" fontWeight="700" fill="#16A34A" fontFamily="Inter,sans-serif">Permanent · Tamper-proof · Transparent</text>
                  {/* Check marks above blocks */}
                  {[0,1,2].map(i => (
                    <g key={`chk-${i}`}>
                      <circle cx={61 + i * 98} cy={42} r="10" fill="#16A34A" />
                      <polyline points={`${55 + i * 98},42 ${59 + i * 98},46 ${67 + i * 98},38`} stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </g>
                  ))}
                  {/* Labels above checks */}
                  {["Record", "Verified", "Sealed"].map((lbl, i) => (
                    <text key={lbl} x={61 + i * 98} y={22} textAnchor="middle" fontSize="8" fontWeight="600" fill="#16A34A" fontFamily="Inter,sans-serif">{lbl}</text>
                  ))}
                </svg>
              </div>
              <div className="services__explain-card-body">
                <div className="services__explain-badge" style={{ color: "#16A34A", background: "#F0FDF4" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Concept Explained
                </div>
                <h3 className="services__explain-title">What is Blockchain?</h3>
                <p className="services__explain-intro">
                  Think of blockchain as a <strong>secure digital record book</strong>. Every transaction is written down permanently — and no one can secretly erase or change anything.
                </p>
                <div className="services__explain-steps">
                  <div className="services__explain-step">
                    <div className="services__explain-step-icon" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </div>
                    <div>
                      <span className="services__explain-step-title">Transaction Happens</span>
                      <span className="services__explain-step-desc">A payment or ownership transfer is initiated by a user.</span>
                    </div>
                  </div>
                  <div className="services__explain-arrow" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                    </svg>
                  </div>
                  <div className="services__explain-step">
                    <div className="services__explain-step-icon" style={{ background: "#DCFCE7", color: "#15803D" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <div>
                      <span className="services__explain-step-title">Recorded Permanently</span>
                      <span className="services__explain-step-desc">The record is added to a chain that cannot be altered.</span>
                    </div>
                  </div>
                  <div className="services__explain-arrow" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                    </svg>
                  </div>
                  <div className="services__explain-step">
                    <div className="services__explain-step-icon" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                    </div>
                    <div>
                      <span className="services__explain-step-title">Everyone Can Verify</span>
                      <span className="services__explain-step-desc">The record is transparent — trust is built into the system itself.</span>
                    </div>
                  </div>
                </div>
                <div className="services__explain-callout" style={{ background: "#F0FDF4", borderColor: "rgba(22,163,74,0.2)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "#16A34A" }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span>CresoX uses blockchain so your ownership records and transactions are always safe, honest, and verifiable.</span>
                </div>
              </div>
            </div>

          </div>{/* end explain-grid */}

          {/* ── User Journey Workflow ── */}
          <div className="services__journey" id="user-journey">
            <div className="services__journey-header">
              <span className="services__eyebrow" style={{ marginBottom: 0 }}>Your Journey</span>
              <h3 className="services__journey-title">How you get started with CresoX</h3>
              <p className="services__journey-sub">Six simple steps — from first visit to trading on the marketplace.</p>
            </div>

            {/* Horizontal timeline for desktop, vertical for mobile */}
            <div className="services__journey-track">
              {JOURNEY_STEPS.map((step, idx) => (
                <div key={step.id} className="services__journey-item" id={`journey-${step.id}`}>
                  {/* Node */}
                  <div className="services__journey-node">
                    <div className="services__journey-icon" style={{ background: step.color, color: step.iconColor }}>
                      {step.icon}
                    </div>
                    <div className="services__journey-num">{String(idx + 1).padStart(2, "0")}</div>
                  </div>

                  {/* Connector arrow (not after last) */}
                  {idx < JOURNEY_STEPS.length - 1 && (
                    <div className="services__journey-connector" aria-hidden="true">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="services__journey-arrow-icon">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  )}

                  {/* Label */}
                  <div className="services__journey-label">
                    <span className="services__journey-label-title">{step.label}</span>
                    <span className="services__journey-label-sub">{step.sublabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>{/* end journey */}

        </div>{/* end edu */}
      </div>
    </section>
  );
}

export default Services;
