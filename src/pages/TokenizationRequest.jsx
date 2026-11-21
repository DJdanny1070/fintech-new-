import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar/Navbar";
import Footer from "../components/home/Footer/Footer";
import FloatingScrollTop from "../components/common/FloatingScrollTop";
import "./TokenizationRequest.css";

/* ── Progress steps ── */
const PROGRESS_STEPS = [
  { label: "T&C Accepted", done: true },
  { label: "Your Application", active: true },
  { label: "Review & KYC" },
  { label: "Token Issuance" },
];

/* ── Asset categories ── */
const ASSET_TYPES = [
  "Real Estate — Residential",
  "Real Estate — Commercial",
  "Gold & Precious Metals",
  "Private Equity / Startup Stake",
  "Art & Collectibles",
  "Infrastructure Asset",
  "Debt Instrument / Bond",
  "Intellectual Property",
  "Agriculture / Farmland",
  "Other",
];

/* ── Investment range options ── */
const VALUE_RANGES = [
  "₹1 Cr – ₹5 Cr",
  "₹5 Cr – ₹25 Cr",
  "₹25 Cr – ₹100 Cr",
  "₹100 Cr – ₹500 Cr",
  "Above ₹500 Cr",
];

/* ── What happens next ── */
const NEXT_STEPS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    title: "Acknowledgement Email",
    desc: "You'll receive a confirmation email within 2 business hours with your Application Reference ID.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Dedicated Advisor Assigned",
    desc: "A CresoX senior advisor will contact you within 1 business day to schedule an initial consultation.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    title: "Due Diligence Commences",
    desc: "Our legal and technical teams begin asset assessment, valuation review, and compliance verification.",
  },
];

function TokenizationRequest() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    // Applicant
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    // Asset
    assetType: "",
    assetName: "",
    assetLocation: "",
    assetValue: "",
    valueRange: "",
    ownershipYears: "",
    encumbered: "no",
    description: "",
    // Additional
    targetInvestors: "",
    timeline: "",
    additionalInfo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend connection — just simulate submission
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Success State ── */
  if (submitted) {
    return (
      <div className="tr-page">
        <Navbar />
        <section className="tr-hero">
          <div className="tr-hero__inner">
            <span className="tr-hero__badge">
              <span className="tr-hero__badge-dot" />
              Application Received
            </span>
            <h1 className="tr-hero__title">
              Application Successfully Submitted!
            </h1>
            <p className="tr-hero__subtitle">
              Thank you for applying for CresoX Asset Tokenization. Our team will
              review your application and reach out within 1 business day.
            </p>
          </div>
        </section>

        <div className="tr-body">
          <div className="tr-container">
            {/* Success card */}
            <div className="tr-form-card" style={{ textAlign: "center", padding: "48px 40px" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "var(--green-light)", border: "2px solid #bbf7d0",
                color: "var(--green)", display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 24px"
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12, letterSpacing: "-0.02em" }}>
                We've received your application
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-muted)", maxWidth: 480, margin: "0 auto 32px" }}>
                Your Tokenization Application Reference ID is{" "}
                <strong style={{ color: "var(--blue)", fontFamily: "monospace" }}>
                  CRX-TOK-{Math.floor(100000 + Math.random() * 900000)}
                </strong>
                . A confirmation email has been sent to{" "}
                <strong style={{ color: "var(--text-primary)" }}>{form.email || "your email address"}</strong>.
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <Link
                  to="/"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "var(--blue)", color: "#fff", fontWeight: 700,
                    fontSize: 14, padding: "12px 28px", borderRadius: "100px",
                    textDecoration: "none", transition: "background 0.2s ease"
                  }}
                >
                  Return to Home
                </Link>
                <Link
                  to="/contact"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "transparent", color: "var(--blue)", fontWeight: 600,
                    fontSize: 14, padding: "12px 28px", borderRadius: "100px",
                    border: "1px solid rgba(7,90,216,0.25)", textDecoration: "none"
                  }}
                >
                  Contact Our Team
                </Link>
              </div>
            </div>

            {/* What happens next */}
            <div className="tr-next">
              <h3 className="tr-next__title">What Happens Next?</h3>
              <div className="tr-next__steps">
                {NEXT_STEPS.map(({ icon, title, desc }) => (
                  <div className="tr-next__step" key={title}>
                    <div className="tr-next__step-icon" aria-hidden="true">{icon}</div>
                    <div className="tr-next__step-title">{title}</div>
                    <div className="tr-next__step-desc">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  /* ── Application Form ── */
  return (
    <div className="tr-page">
      <Navbar />

      {/* Hero band */}
      <section className="tr-hero" aria-label="Tokenization Application">
        <div className="tr-hero__inner">
          <span className="tr-hero__badge">
            <span className="tr-hero__badge-dot" />
            Application Open
          </span>
          <h1 className="tr-hero__title">Tokenization Application</h1>
          <p className="tr-hero__subtitle">
            Complete the form below to begin your asset tokenization journey with
            CresoX. A dedicated advisor will be assigned within 1 business day.
          </p>

          {/* Progress indicator */}
          <div className="tr-progress" role="list" aria-label="Application progress">
            {PROGRESS_STEPS.map((step, idx) => (
              <div key={step.label} style={{ display: "flex", alignItems: "center" }}>
                <div
                  className={`tr-progress__step${step.done ? " tr-progress__step--done" : ""}${step.active ? " tr-progress__step--active" : ""}`}
                  role="listitem"
                  aria-current={step.active ? "step" : undefined}
                >
                  <div className="tr-progress__num">
                    {step.done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="tr-progress__label">{step.label}</div>
                </div>
                {idx < PROGRESS_STEPS.length - 1 && (
                  <div className={`tr-progress__connector${step.done ? " tr-progress__connector--done" : ""}`} aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="tr-body">
        <div className="tr-container">
          {/* Notice */}
          <div className="tr-notice" role="note">
            <div className="tr-notice__icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <div className="tr-notice__title">No backend connection — Demo Mode</div>
              <div className="tr-notice__body">
                This form is for demonstration purposes. Submitting will simulate a successful
                application without sending data to any server. Backend integration will be
                connected in a future phase.
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="tr-form" onSubmit={handleSubmit} noValidate aria-label="Tokenization application form">
            <div className="tr-form-card">

              {/* Section 1 — Applicant Details */}
              <div className="tr-form-section">
                <div className="tr-form-section__header">
                  <div className="tr-form-section__num" aria-hidden="true">1</div>
                  <div>
                    <div className="tr-form-section__title">Applicant Details</div>
                    <div className="tr-form-section__subtitle">Your personal or organization contact information</div>
                  </div>
                </div>

                <div className="tr-form__grid">
                  <div className="tr-form__field">
                    <label className="tr-form__label" htmlFor="fullName">
                      Full Name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className="tr-form__input"
                      
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className="tr-form__field">
                    <label className="tr-form__label" htmlFor="email">
                      Email Address <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="tr-form__input"
                      
                      value={form.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="tr-form__field">
                    <label className="tr-form__label" htmlFor="phone">
                      Phone Number <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="tr-form__input"
                      
                      value={form.phone}
                      onChange={handleChange}
                      required
                      autoComplete="tel"
                    />
                  </div>

                  <div className="tr-form__field">
                    <label className="tr-form__label" htmlFor="organization">
                      Organization / Company Name
                    </label>
                    <input
                      id="organization"
                      name="organization"
                      type="text"
                      className="tr-form__input"
                     
                      value={form.organization}
                      onChange={handleChange}
                      autoComplete="organization"
                    />
                    <span className="tr-form__hint">Leave blank if you are applying as an individual.</span>
                  </div>
                </div>
              </div>

              {/* Section 2 — Asset Information */}
              <div className="tr-form-section">
                <div className="tr-form-section__header">
                  <div className="tr-form-section__num" aria-hidden="true">2</div>
                  <div>
                    <div className="tr-form-section__title">Asset Information</div>
                    <div className="tr-form-section__subtitle">Details about the asset you wish to tokenize</div>
                  </div>
                </div>

                <div className="tr-form__grid">
                  <div className="tr-form__field">
                    <label className="tr-form__label" htmlFor="assetType">
                      Asset Category <span aria-hidden="true">*</span>
                    </label>
                    <select
                      id="assetType"
                      name="assetType"
                      className="tr-form__select"
                      value={form.assetType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select asset type…</option>
                      {ASSET_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="tr-form__field">
                    <label className="tr-form__label" htmlFor="assetName">
                      Asset Name / Identifier <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="assetName"
                      name="assetName"
                      type="text"
                      className="tr-form__input"
                      
                      value={form.assetName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="tr-form__field">
                    <label className="tr-form__label" htmlFor="assetLocation">
                      Asset Location / Jurisdiction <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="assetLocation"
                      name="assetLocation"
                      type="text"
                      className="tr-form__input"
                      
                      value={form.assetLocation}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="tr-form__field">
                    <label className="tr-form__label" htmlFor="valueRange">
                      Estimated Asset Value Range <span aria-hidden="true">*</span>
                    </label>
                    <select
                      id="valueRange"
                      name="valueRange"
                      className="tr-form__select"
                      value={form.valueRange}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a range…</option>
                      {VALUE_RANGES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="tr-form__field">
                    <label className="tr-form__label" htmlFor="ownershipYears">
                      Years of Ownership
                    </label>
                    <input
                      id="ownershipYears"
                      name="ownershipYears"
                      type="number"
                      min="0"
                      max="100"
                      className="tr-form__input"
                      
                      value={form.ownershipYears}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="tr-form__field">
                    <label className="tr-form__label" htmlFor="encumbered">
                      Is the asset encumbered / mortgaged?
                    </label>
                    <select
                      id="encumbered"
                      name="encumbered"
                      className="tr-form__select"
                      value={form.encumbered}
                      onChange={handleChange}
                    >
                      <option value="no">No — Free and clear</option>
                      <option value="yes">Yes — Mortgage / lien exists</option>
                      <option value="partial">Partially encumbered</option>
                    </select>
                  </div>

                  <div className="tr-form__field tr-form__field--full">
                    <label className="tr-form__label" htmlFor="description">
                      Asset Description <span aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="tr-form__textarea"
                      placeholder="Provide a brief description of the asset including its use, income-generating potential, and any relevant details…"
                      value={form.description}
                      onChange={handleChange}
                      required
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3 — Tokenization Preferences */}
              <div className="tr-form-section">
                <div className="tr-form-section__header">
                  <div className="tr-form-section__num" aria-hidden="true">3</div>
                  <div>
                    <div className="tr-form-section__title">Tokenization Preferences</div>
                    <div className="tr-form-section__subtitle">Help us understand your objectives and timeline</div>
                  </div>
                </div>

                <div className="tr-form__grid">
                  <div className="tr-form__field">
                    <label className="tr-form__label" htmlFor="targetInvestors">
                      Target Investor Type
                    </label>
                    <select
                      id="targetInvestors"
                      name="targetInvestors"
                      className="tr-form__select"
                      value={form.targetInvestors}
                      onChange={handleChange}
                    >
                      <option value="">Select type…</option>
                      <option value="retail">Retail Investors</option>
                      <option value="hni">HNI / Ultra-HNI</option>
                      <option value="institutional">Institutional Investors</option>
                      <option value="mixed">Mixed Investor Base</option>
                      <option value="unsure">Not Sure Yet</option>
                    </select>
                  </div>

                  <div className="tr-form__field">
                    <label className="tr-form__label" htmlFor="timeline">
                      Desired Launch Timeline
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      className="tr-form__select"
                      value={form.timeline}
                      onChange={handleChange}
                    >
                      <option value="">Select timeline…</option>
                      <option value="asap">As soon as possible</option>
                      <option value="3m">Within 3 months</option>
                      <option value="6m">Within 6 months</option>
                      <option value="1y">Within 1 year</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>

                  <div className="tr-form__field tr-form__field--full">
                    <label className="tr-form__label" htmlFor="additionalInfo">
                      Additional Information or Queries
                    </label>
                    <textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      className="tr-form__textarea"
                      placeholder="Any additional context, special requirements, or questions you'd like to raise with our team…"
                      value={form.additionalInfo}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4 — Document Upload (UI only) */}
              <div className="tr-form-section">
                <div className="tr-form-section__header">
                  <div className="tr-form-section__num" aria-hidden="true">4</div>
                  <div>
                    <div className="tr-form-section__title">Document Upload</div>
                    <div className="tr-form-section__subtitle">
                      Upload initial documents — full submission requested post-approval
                    </div>
                  </div>
                </div>

                <div className="tr-form__grid">
                  {[
                    { id: "upload-ownership", label: "Proof of Ownership", hint: "Title deed, registration certificate" },
                    { id: "upload-id", label: "Identity Document (KYC)", hint: "PAN, Aadhaar, or passport" },
                    { id: "upload-valuation", label: "Valuation Report", hint: "Certified valuer report (last 6 months)" },
                    { id: "upload-other", label: "Additional Documents", hint: "Any other supporting documents" },
                  ].map(({ id, label, hint }) => (
                    <div className="tr-form__field" key={id}>
                      <label className="tr-form__label" htmlFor={id}>{label}</label>
                      <label className="tr-form__upload" htmlFor={id} tabIndex={0}>
                        <div className="tr-form__upload-icon" aria-hidden="true">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                        </div>
                        <div className="tr-form__upload-label">Click to upload</div>
                        <div className="tr-form__upload-hint">{hint} · PDF, JPG, PNG · Max 10 MB</div>
                        <input id={id} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit area */}
              <div className="tr-submit-area">
                <div className="tr-submit-notice">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                  By submitting this application, you confirm that all information provided is
                  accurate and that you have authority to tokenize the stated asset. CresoX will
                  conduct independent due diligence.
                </div>

                <button
                  type="submit"
                  className="tr-submit-btn"
                  id="submit-tokenization-application"
                >
                  Submit Tokenization Application
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>

                <p className="tr-submit-disclaimer">
                  Submitting this form does not guarantee approval. By proceeding, you agree
                  to CresoX's{" "}
                  <Link to="/terms">Terms of Service</Link> and{" "}
                  <Link to="/privacy-policy">Privacy Policy</Link>.
                  Application data is processed securely and not shared with third parties
                  without your consent.
                </p>
              </div>
            </div>
          </form>

          {/* What happens next */}
          <div className="tr-next">
            <h3 className="tr-next__title">What Happens After You Submit?</h3>
            <div className="tr-next__steps">
              {NEXT_STEPS.map(({ icon, title, desc }) => (
                <div className="tr-next__step" key={title}>
                  <div className="tr-next__step-icon" aria-hidden="true">{icon}</div>
                  <div className="tr-next__step-title">{title}</div>
                  <div className="tr-next__step-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <FloatingScrollTop />
    </div>
  );
}

export default TokenizationRequest;
