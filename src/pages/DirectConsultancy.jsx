import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar/Navbar";
import Footer from "../components/home/Footer/Footer";
import "./DirectConsultancy.css";

/* ─────────────────────────────── WHY CRESOX DATA ─────────────────────────────── */
const WHY_ITEMS = [
  {
    color: "#EFF6FF",
    iconColor: "#075AD8",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: "Certified Experts",
    desc: "Our consultants bring deep domain expertise in blockchain, finance, and technology — backed by years of hands-on project delivery.",
  },
  {
    color: "#F0FDF4",
    iconColor: "#16A34A",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Fast Turnaround",
    desc: "We understand time is money. Consultations are scheduled within 48 hours and strategy sessions produce actionable outcomes.",
  },
  {
    color: "#FFFBEB",
    iconColor: "#D97706",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Tailored for You",
    desc: "No one-size-fits-all playbooks. Every engagement is custom-built around your business size, goals, and industry.",
  },
  {
    color: "#FDF2F8",
    iconColor: "#DB2777",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "End-to-End Support",
    desc: "From the first strategy call to full execution and go-live, CresoX stays by your side at every stage of the journey.",
  },
  {
    color: "#EFF6FF",
    iconColor: "#075AD8",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Confidential & Secure",
    desc: "All client data, business plans, and discussions are handled with strict confidentiality under signed NDAs.",
  },
  {
    color: "#F0FDF4",
    iconColor: "#16A34A",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Proven Methodology",
    desc: "We apply battle-tested frameworks used by leading global FinTech firms, adapted for Indian and international markets.",
  },
];

/* ─────────────────────────────── SERVICES DATA ─────────────────────────────── */
const SERVICES = [
  {
    bg: "#EFF6FF",
    iconColor: "#075AD8",
    tagBg: "#DBEAFE",
    tagColor: "#075AD8",
    tag: "Blockchain",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Blockchain Consulting",
    desc: "We help you understand and adopt blockchain technology — choosing the right chains, smart contract standards, and integration strategies for your business.",
  },
  {
    bg: "#F0FDF4",
    iconColor: "#16A34A",
    tagBg: "#DCFCE7",
    tagColor: "#16A34A",
    tag: "Tokenization",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Asset Tokenization",
    desc: "Convert real-world assets — real estate, gold, equity — into digital tokens. We guide you through legal structuring, smart contract design, and investor onboarding.",
  },
  {
    bg: "#FFFBEB",
    iconColor: "#D97706",
    tagBg: "#FEF9C3",
    tagColor: "#D97706",
    tag: "FinTech",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M16 12h.01" />
      </svg>
    ),
    title: "FinTech Consulting",
    desc: "Navigate the complex FinTech landscape with guidance on payment systems, digital lending, regulatory compliance (RBI, SEBI), and go-to-market strategy.",
  },
  {
    bg: "#EFF6FF",
    iconColor: "#075AD8",
    tagBg: "#DBEAFE",
    tagColor: "#075AD8",
    tag: "Technology",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "Technology Consulting",
    desc: "Choose the right tech stack, cloud infrastructure, and integrations for your product. We evaluate build vs. buy decisions and vendor selections.",
  },
  {
    bg: "#FDF2F8",
    iconColor: "#DB2777",
    tagBg: "#FCE7F3",
    tagColor: "#DB2777",
    tag: "Product",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "Product Development",
    desc: "From wireframe to launch — we help you define product roadmaps, write specs, run sprints, and ship high-quality software on time.",
  },
  {
    bg: "#F0FDF4",
    iconColor: "#16A34A",
    tagBg: "#DCFCE7",
    tagColor: "#16A34A",
    tag: "Startup",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Startup Guidance",
    desc: "Whether you're pre-seed or Series A, we help startups validate ideas, build MVPs, pitch investors, and scale their operations effectively.",
  },
  {
    bg: "#FFFBEB",
    iconColor: "#D97706",
    tagBg: "#FEF9C3",
    tagColor: "#D97706",
    tag: "Transformation",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
      </svg>
    ),
    title: "Digital Transformation",
    desc: "Move your business from legacy systems to modern digital workflows. We plan, manage, and execute transformation programs with minimal disruption.",
  },
  {
    bg: "#EEF0F4",
    iconColor: "#2C3E58",
    tagBg: "#E2E8F0",
    tagColor: "#2C3E58",
    tag: "Architecture",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    ),
    title: "Architecture Planning",
    desc: "Design scalable, secure, and future-proof system architectures. We review your existing setup or greenfield designs and deliver a detailed blueprint.",
  },
  {
    bg: "#FDF2F8",
    iconColor: "#DB2777",
    tagBg: "#FCE7F3",
    tagColor: "#DB2777",
    tag: "Strategy",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v18H3z" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
      </svg>
    ),
    title: "Business Strategy",
    desc: "Align your technology investments with business goals. We craft go-to-market strategies, competitive positioning, and long-term growth roadmaps.",
  },
];

/* ─────────────────────────────── WORKFLOW DATA ─────────────────────────────── */
const WORKFLOW_STEPS = [
  {
    num: "01",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    badge: "Step 1",
    title: "Request Consultation",
    desc: "Fill out our quick consultation request form. Tell us about your business, your challenge, and what outcome you're hoping for. No technical language needed.",
  },
  {
    num: "02",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    badge: "Step 2",
    title: "Review by CresoX",
    desc: "Our team reviews your request within 24 hours. We assess the scope, assign the right expert from our team, and prepare preliminary thoughts before the meeting.",
  },
  {
    num: "03",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    badge: "Step 3",
    title: "Meeting Scheduled",
    desc: "You receive a calendar invite with a video call link. Meetings are typically 60–90 minutes and held via Google Meet, Zoom, or Microsoft Teams — whichever you prefer.",
  },
  {
    num: "04",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    badge: "Step 4",
    title: "Consultation",
    desc: "A dedicated CresoX expert walks you through insights, recommendations, and a preliminary roadmap tailored specifically for your goals. You leave with clear next steps.",
  },
  {
    num: "05",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    badge: "Step 5",
    title: "Execution",
    desc: "We help you implement the agreed strategy — whether that means building a product, setting up infrastructure, or coaching your team. Execution support is fully optional.",
  },
];

/* ─────────────────────────────── INDUSTRIES DATA ─────────────────────────────── */
const INDUSTRIES = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: "Real Estate",
    desc: "Tokenization, digital property records, and PropTech platforms",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M16 12h.01" />
      </svg>
    ),
    title: "Banking & Finance",
    desc: "Digital wallets, lending platforms, and payment infrastructure",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    title: "E-Commerce",
    desc: "Marketplace platforms, supply chain, and digital payment rails",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: "Healthcare",
    desc: "Health records management, insurance tech, and patient data security",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    title: "Logistics & Supply Chain",
    desc: "Track-and-trace systems, smart contracts, and automated compliance",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41" /><path d="M22 12h-2" /><path d="M19.07 19.07l-1.41-1.41" /><path d="M12 22v-2" /><path d="M4.93 19.07l1.41-1.41" /><path d="M2 12h2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M12 2v2" />
      </svg>
    ),
    title: "Energy & Utilities",
    desc: "Carbon credit tokenization, smart grid management, and reporting",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: "Education & EdTech",
    desc: "Digital credentialing, course platforms, and learning management systems",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "Startups & SMEs",
    desc: "MVP development, fundraising strategy, and market entry planning",
  },
];

/* ─────────────────────────────── FAQ DATA ─────────────────────────────── */
const FAQS = [
  {
    q: "What happens during a consultation session?",
    a: "A consultation is a focused 60–90 minute session where a CresoX expert listens to your challenges, asks clarifying questions, and provides a structured set of recommendations. You will receive a written summary and next-step document after each session.",
  },
  {
    q: "Do I need technical knowledge to request a consultation?",
    a: "Not at all. Our consultants are trained to explain complex ideas in plain language. You simply need to know your business goals — we handle the technical translation and solution design.",
  },
  {
    q: "How quickly can I get my first consultation?",
    a: "Once you submit a request, our team reviews it within 24 hours. Most clients have their first session scheduled within 48 hours of the initial request.",
  },
  {
    q: "Is there a cost for the first consultation?",
    a: "CresoX offers a complimentary 30-minute discovery call for all new clients. Extended and ongoing consultancy packages are priced based on scope and duration — details are shared after the discovery call.",
  },
  {
    q: "Can CresoX also help with implementation after consulting?",
    a: "Yes. While the consultation is advisory, we can extend our engagement to full project execution — building products, deploying infrastructure, or managing your digital transformation end-to-end.",
  },
  {
    q: "Which industries does CresoX serve?",
    a: "We work across FinTech, banking, real estate, healthcare, logistics, energy, education, and more. Our consultants have domain expertise spanning multiple verticals, ensuring relevant and practical advice.",
  },
  {
    q: "Is my business information kept confidential?",
    a: "Absolutely. We sign a Non-Disclosure Agreement (NDA) before any detailed discussions. All data and business information shared with CresoX is kept strictly confidential.",
  },
];

/* ─────────────────────────────── HERO VISUAL SERVICES ─────────────────────────── */
const HERO_SERVICES = [
  { label: "Blockchain Consulting", bg: "#EFF6FF", color: "#075AD8" },
  { label: "Asset Tokenization", bg: "#F0FDF4", color: "#16A34A" },
  { label: "Product Development", bg: "#FFFBEB", color: "#D97706" },
  { label: "Digital Transformation", bg: "#FDF2F8", color: "#DB2777" },
  { label: "Business Strategy", bg: "#EEF0F4", color: "#2C3E58" },
];

/* ─────────────────────────────── FAQ ITEM COMPONENT ─────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`dc-faq__item${open ? " open" : ""}`}>
      <button
        className="dc-faq__question"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="dc-faq__question-text">{q}</span>
        <span className="dc-faq__icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <div className={`dc-faq__answer${open ? " visible" : ""}`}>
        <div className="dc-faq__answer-inner">{a}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── PAGE COMPONENT ─────────────────────────────── */
function DirectConsultancy() {
  return (
    <div className="dc-page">
      <Navbar />

      {/* ══════════ HERO ══════════ */}
      <section className="dc-hero">
        <div className="dc-hero__inner">
          {/* Left: Copy */}
          <div className="dc-hero__left">
            <div className="dc-hero__eyebrow">
              <span className="dc-hero__eyebrow-dot" />
              Direct Consultancy
            </div>

            <h1 className="dc-hero__title">
              Expert Guidance for <span>Every Business Challenge</span>
            </h1>

            <p className="dc-hero__desc">
              Whether you're launching a startup, transforming a legacy business, or building
              the next generation of FinTech — CresoX provides direct, practical consultancy
              from proven experts. No fluff. Just results.
            </p>

            <div className="dc-hero__actions">
              <Link to="/consultation-request" className="dc-hero__btn-primary" id="hero-request-consultation-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Request Consultation
              </Link>
              <Link to="/about" className="dc-hero__btn-secondary" id="hero-learn-more-btn">
                Learn About CresoX
              </Link>
            </div>

            <div className="dc-hero__trust">
              <div className="dc-hero__trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Free discovery call
              </div>
              <div className="dc-hero__trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                NDA protected
              </div>
              <div className="dc-hero__trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Response within 24 hrs
              </div>
            </div>
          </div>

          {/* Right: Visual card */}
          <div className="dc-hero__visual">
            <div className="dc-hero__visual-card">
              <p className="dc-hero__visual-header">Services We Offer</p>
              <div className="dc-hero__visual-services">
                {HERO_SERVICES.map((s, i) => (
                  <div key={i} className="dc-hero__visual-service">
                    <div
                      className="dc-hero__visual-service-icon"
                      style={{ background: s.bg, color: s.color }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="dc-hero__visual-service-text">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ WHY CRESOX ══════════ */}
      <section className="dc-why section--white" id="why-cresox">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Why CresoX</span>
            <h2 className="h2">Built for serious businesses</h2>
            <p className="lead">
              We're not a generic consultancy. CresoX is a technology-first firm with deep roots in
              blockchain, FinTech, and product development — combining strategy with execution capability.
            </p>
          </div>

          <div className="dc-why__grid">
            {WHY_ITEMS.map((item, i) => (
              <div key={i} className="dc-why__card">
                <div
                  className="dc-why__icon"
                  style={{ background: item.color, color: item.iconColor }}
                >
                  {item.icon}
                </div>
                <h3 className="dc-why__card-title">{item.title}</h3>
                <p className="dc-why__card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SERVICES ══════════ */}
      <section className="dc-services section--gray" id="services">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Services We Offer</span>
            <h2 className="h2">What we can help you with</h2>
            <p className="lead">
              From blockchain strategy to full product delivery — here's everything CresoX
              can do for your business. Each service is delivered by a dedicated expert.
            </p>
          </div>

          <div className="dc-services__grid">
            {SERVICES.map((svc, i) => (
              <div key={i} className="dc-svc-card" id={`service-card-${i}`}>
                <div
                  className="dc-svc-card__icon-wrap"
                  style={{ background: svc.bg, color: svc.iconColor }}
                >
                  {svc.icon}
                </div>
                <div>
                  <span
                    className="dc-svc-card__tag"
                    style={{ background: svc.tagBg, color: svc.tagColor }}
                  >
                    {svc.tag}
                  </span>
                  <h3 className="dc-svc-card__title" style={{ marginTop: "10px" }}>{svc.title}</h3>
                </div>
                <p className="dc-svc-card__desc">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ WORKFLOW ══════════ */}
      <section className="dc-workflow section--white" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Consultation Workflow</span>
            <h2 className="h2">How it works — step by step</h2>
            <p className="lead">
              Getting started is simple. Five clear steps take you from initial request
              to full execution — with CresoX guiding you at every stage.
            </p>
          </div>

          <div className="dc-workflow__timeline">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={i} className="dc-workflow__step" id={`workflow-step-${i + 1}`}>
                <div className="dc-workflow__step-num">{step.num}</div>
                <div className="dc-workflow__step-body">
                  <span className="dc-workflow__step-badge">
                    {step.icon}
                    {step.badge}
                  </span>
                  <h3 className="dc-workflow__step-title">{step.title}</h3>
                  <p className="dc-workflow__step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ INDUSTRIES ══════════ */}
      <section className="dc-industries section--gray" id="industries">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Industries We Serve</span>
            <h2 className="h2">Expertise across every sector</h2>
            <p className="lead">
              Our consultants have delivered projects across a wide range of industries.
              Whatever your sector, we bring relevant knowledge and proven frameworks.
            </p>
          </div>

          <div className="dc-industries__grid">
            {INDUSTRIES.map((ind, i) => (
              <div key={i} className="dc-industry-card" id={`industry-card-${i}`}>
                <div className="dc-industry-card__icon">{ind.icon}</div>
                <h3 className="dc-industry-card__title">{ind.title}</h3>
                <p className="dc-industry-card__desc">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="dc-faq section--white" id="faq">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Frequently Asked Questions</span>
            <h2 className="h2">Common questions, honest answers</h2>
            <p className="lead">
              First time using a consultancy? Here are the questions we hear most often —
              answered in plain language.
            </p>
          </div>

          <div className="dc-faq__list">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="dc-cta" id="get-started">
        <div className="dc-cta__inner">
          <div className="dc-cta__eyebrow">
            <span style={{ width: 6, height: 6, background: "#60a5fa", borderRadius: "50%", display: "inline-block" }} />
            Ready to start?
          </div>

          <h2 className="dc-cta__title">
            Let's solve your biggest <span>business challenge</span> together
          </h2>

          <p className="dc-cta__desc">
            Book a free 30-minute discovery call. No commitment. No technical jargon.
            Just a clear conversation about your goals and how CresoX can help.
          </p>

          <div className="dc-cta__actions">
            <Link to="/consultation-request" className="dc-cta__btn-primary" id="cta-request-consultation-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Request Consultation
            </Link>
            <Link to="/contact" className="dc-cta__btn-secondary" id="cta-contact-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
              </svg>
              Contact Us First
            </Link>
          </div>

          <div className="dc-cta__stats">
            <div className="dc-cta__stat">
              <span className="dc-cta__stat-value">200+</span>
              <span className="dc-cta__stat-label">Clients Consulted</span>
            </div>
            <div className="dc-cta__stat">
              <span className="dc-cta__stat-value">9</span>
              <span className="dc-cta__stat-label">Service Areas</span>
            </div>
            <div className="dc-cta__stat">
              <span className="dc-cta__stat-value">48h</span>
              <span className="dc-cta__stat-label">Response Time</span>
            </div>
            <div className="dc-cta__stat">
              <span className="dc-cta__stat-value">100%</span>
              <span className="dc-cta__stat-label">Confidential</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default DirectConsultancy;
