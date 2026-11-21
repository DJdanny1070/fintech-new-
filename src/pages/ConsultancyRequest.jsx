import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar/Navbar";
import Footer from "../components/home/Footer/Footer";
import FloatingScrollTop from "../components/common/FloatingScrollTop";
import {
  createRequest,
  REQUEST_TYPES,
} from "../services/serviceRequestService";
import "./ConsultancyRequest.css";

/* ── Static data ── */
const CONSULTATION_CATEGORIES = [
  "Blockchain Consulting",
  "Asset Tokenization Consulting",
  "FinTech Consulting",
  "Technology Consulting",
  "Product Development",
  "Startup Guidance",
  "Digital Transformation",
  "Architecture Planning",
  "Business Strategy",
  "Other",
];

const MEETING_MODES = [
  { id: "video", label: "Video Call", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  )},
  { id: "phone", label: "Phone Call", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.71 3.48 2 2 0 0 1 3.68 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )},
  { id: "inperson", label: "In Person", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )},
  { id: "email_only", label: "Email Only", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  )},
];

const PROCESS_STEPS = [
  { label: "Request Review",    desc: "We review your submission within 24 hours." },
  { label: "Advisor Matched",   desc: "A relevant expert is assigned to your case." },
  { label: "Meeting Scheduled", desc: "You receive a calendar invite within 48 hrs." },
  { label: "Consultation",      desc: "Your session takes place as agreed." },
  { label: "Action Plan",       desc: "You receive a written summary with next steps." },
];

/* ── Client-side validation ── */
function validate(form) {
  const errs = {};
  if (!form.fullName.trim())                    errs.fullName             = "Full name is required.";
  if (!form.email.trim())                        errs.email                = "Email is required.";
  else if (!/\S+@\S+\.\S+/.test(form.email))    errs.email                = "Enter a valid email address.";
  if (!form.phone.trim())                        errs.phone                = "Phone number is required.";
  else if (!/^[+\d\s\-()]{7,20}$/.test(form.phone)) errs.phone            = "Enter a valid phone number.";
  if (!form.consultationCategory)                errs.consultationCategory = "Please select a consultation category.";
  if (!form.businessDescription.trim())          errs.businessDescription  = "Please describe your business or challenge.";
  else if (form.businessDescription.trim().length < 30) errs.businessDescription = "Description must be at least 30 characters.";
  if (!form.preferredMeetingMode)                errs.preferredMeetingMode = "Please choose a meeting mode.";
  return errs;
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */
function ConsultancyRequest() {
  const [submitted, setSubmitted]   = useState(false);
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    fullName:             "",
    company:              "",
    email:                "",
    phone:                "",
    consultationCategory: "",
    businessDescription:  "",
    preferredMeetingMode: "",
    preferredDate:        "",
    additionalNotes:      "",
  });

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  /* ── Submit ── */
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`cr-field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);

    try {
      await createRequest({
        request_type: REQUEST_TYPES.CONSULTANCY,
        full_name:    form.fullName,
        company_name: form.company,
        email:        form.email,
        phone:        form.phone,
        description:  form.businessDescription,
        metadata: {
          consultation_category:  form.consultationCategory,
          preferred_meeting_mode: form.preferredMeetingMode,
          preferred_date:         form.preferredDate || null,
          additional_notes:       form.additionalNotes || "",
          submitted_at:           new Date().toISOString(),
          source:                 "consultancy_request_form",
        },
      });

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      setSubmitError(err.message || "An unexpected error occurred. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="cr-page">
        <Navbar />
        <div className="cr-success">
          <div className="cr-success__card">
            <div className="cr-success__icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="cr-success__title">Your request has been submitted.</h1>
            <p className="cr-success__body">
              Thank you, <strong>{form.fullName}</strong>. Our team will review your
              Consultancy Request and a dedicated advisor will reach out within{" "}
              <strong>1 business day</strong>.
            </p>
            <div className="cr-success__notice">
              <strong>Please note:</strong>&nbsp; Our team will review your application.
              Login access will only be provided after verification of your submission.
            </div>
            <div className="cr-success__links">
              <Link to="/" className="cr-success__btn-primary" id="cr-success-home-btn">
                Back to Home
              </Link>
              <Link to="/services/direct-consultancy" className="cr-success__btn-ghost" id="cr-success-consultancy-btn">
                View Our Services
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="cr-page">
      <Navbar />

      {/* Hero */}
      <div className="cr-hero">
        <div className="cr-hero__inner">
          <div className="cr-hero__badge">
            <span className="cr-hero__badge-dot" />
            Service Request
          </div>
          <h1 className="cr-hero__title">
            Consultancy <span>Request</span>
          </h1>
          <p className="cr-hero__sub">
            Tell us about your business and what you need help with.
            A CresoX expert will be assigned to your case personally.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="cr-body">
        <div className="cr-layout">

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="cr-form-card">
              <h2 className="cr-form-card__title">Consultation Request Form</h2>
              <p className="cr-form-card__sub">
                All fields marked <span style={{ color: "var(--red)" }}>*</span> are required.
                Optional fields help us prepare better.
              </p>

              {/* Global submit error */}
              {submitError && (
                <div className="cr-submit-error" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{submitError}</span>
                </div>
              )}

              {/* ── Section 1: Your Details ── */}
              <div className="cr-form-section">
                <div className="cr-form-section__label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  Your Details
                </div>

                <div className="cr-row cr-row--2">
                  <div className="cr-field" id="cr-field-fullName">
                    <label className="cr-label" htmlFor="cr-fullName">Full Name <span>*</span></label>
                    <input id="cr-fullName" className={`cr-input${errors.fullName ? " cr-input--error" : ""}`} type="text" value={form.fullName} onChange={set("fullName")} disabled={loading} />
                    {errors.fullName && <span className="cr-error">{errors.fullName}</span>}
                  </div>
                  <div className="cr-field" id="cr-field-company">
                    <label className="cr-label" htmlFor="cr-company">Company / Organisation</label>
                    <input id="cr-company" className="cr-input" type="text" value={form.company} onChange={set("company")} disabled={loading} />
                  </div>
                </div>

                <div className="cr-row cr-row--2" style={{ marginTop: 18 }}>
                  <div className="cr-field" id="cr-field-email">
                    <label className="cr-label" htmlFor="cr-email">Email Address <span>*</span></label>
                    <input id="cr-email" className={`cr-input${errors.email ? " cr-input--error" : ""}`} type="email"  value={form.email} onChange={set("email")} disabled={loading} />
                    {errors.email && <span className="cr-error">{errors.email}</span>}
                  </div>
                  <div className="cr-field" id="cr-field-phone">
                    <label className="cr-label" htmlFor="cr-phone">Phone Number <span>*</span></label>
                    <input id="cr-phone" className={`cr-input${errors.phone ? " cr-input--error" : ""}`} type="tel" value={form.phone} onChange={set("phone")} disabled={loading} />
                    {errors.phone && <span className="cr-error">{errors.phone}</span>}
                  </div>
                </div>
              </div>

              {/* ── Section 2: Consultation Details ── */}
              <div className="cr-form-section">
                <div className="cr-form-section__label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Consultation Details
                </div>

                <div className="cr-row cr-row--1">
                  <div className="cr-field" id="cr-field-consultationCategory">
                    <label className="cr-label" htmlFor="cr-consultationCategory">Consultation Category <span>*</span></label>
                    <select id="cr-consultationCategory" className={`cr-select${errors.consultationCategory ? " cr-input--error" : ""}`} value={form.consultationCategory} onChange={set("consultationCategory")} disabled={loading}>
                      <option value="">Select what you need help with…</option>
                      {CONSULTATION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.consultationCategory && <span className="cr-error">{errors.consultationCategory}</span>}
                  </div>
                </div>

                <div className="cr-row cr-row--1" style={{ marginTop: 18 }}>
                  <div className="cr-field" id="cr-field-businessDescription">
                    <label className="cr-label" htmlFor="cr-businessDescription">Business Description <span>*</span></label>
                    <textarea id="cr-businessDescription" className={`cr-textarea${errors.businessDescription ? " cr-input--error" : ""}`} placeholder="Describe your business, your challenge, and what you're hoping to achieve. The more detail you provide, the better we can prepare." value={form.businessDescription} onChange={set("businessDescription")} rows={5} disabled={loading} />
                    <span style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 4 }}>
                      {form.businessDescription.length} / 30 characters minimum
                    </span>
                    {errors.businessDescription && <span className="cr-error">{errors.businessDescription}</span>}
                  </div>
                </div>
              </div>

              {/* ── Section 3: Meeting Preferences ── */}
              <div className="cr-form-section">
                <div className="cr-form-section__label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Meeting Preferences
                </div>

                <div className="cr-field" id="cr-field-preferredMeetingMode">
                  <label className="cr-label">Preferred Meeting Mode <span>*</span></label>
                  <div className="cr-mode-group">
                    {MEETING_MODES.map((mode) => (
                      <div key={mode.id} className="cr-mode-option">
                        <input
                          type="radio"
                          id={`cr-mode-${mode.id}`}
                          name="preferredMeetingMode"
                          value={mode.id}
                          checked={form.preferredMeetingMode === mode.id}
                          onChange={set("preferredMeetingMode")}
                          disabled={loading}
                        />
                        <label htmlFor={`cr-mode-${mode.id}`} className="cr-mode-label">
                          {mode.icon}
                          {mode.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.preferredMeetingMode && <span className="cr-error" style={{ marginTop: 8, display: "block" }}>{errors.preferredMeetingMode}</span>}
                </div>

                <div className="cr-row cr-row--1" style={{ marginTop: 18 }}>
                  <div className="cr-field">
                    <label className="cr-label" htmlFor="cr-preferredDate">Preferred Date</label>
                    <input id="cr-preferredDate" className="cr-input" type="date" min={new Date().toISOString().split("T")[0]} value={form.preferredDate} onChange={set("preferredDate")} disabled={loading} />
                  </div>
                </div>
              </div>

              {/* ── Section 4: Additional Notes ── */}
              <div className="cr-form-section" style={{ marginBottom: 0 }}>
                <div className="cr-form-section__label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                  Additional Notes
                </div>
                <div className="cr-field">
                  <label className="cr-label" htmlFor="cr-additionalNotes">
                    Anything else you'd like us to know?
                  </label>
                  <textarea id="cr-additionalNotes" className="cr-textarea" placeholder="Any specific questions, concerns, or context that would help us prepare. (optional)" value={form.additionalNotes} onChange={set("additionalNotes")} rows={4} disabled={loading} />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="cr-submit-btn" id="cr-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="cr-spinner" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Submit Consultation Request
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ── Sidebar ── */}
          <div className="cr-sidebar">
            <div className="cr-info-card">
              <h3 className="cr-info-card__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                What happens next?
              </h3>
              <div className="cr-process-list">
                {PROCESS_STEPS.map((s, i) => (
                  <div key={i} className="cr-process-item">
                    <div className="cr-process-num">{String(i + 1).padStart(2, "0")}</div>
                    <p className="cr-process-text"><strong>{s.label}</strong><br />{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="cr-info-card">
              <h3 className="cr-info-card__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
                </svg>
                What's included?
              </h3>
              <div className="cr-info-list">
                {[
                  "Free 30-minute discovery call.",
                  "Dedicated expert matched to your industry.",
                  "Confidential — NDA available on request.",
                  "Written summary after each session.",
                  "Optional: end-to-end execution support.",
                ].map((item, i) => (
                  <div key={i} className="cr-info-item">
                    <div className="cr-info-item-dot" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="cr-info-card" style={{ background: "var(--green-light)", borderColor: "rgba(22,163,74,0.2)" }}>
              <h3 className="cr-info-card__title" style={{ color: "var(--green)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Pro tip
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--text-secondary)" }}>
                The more detail you provide in your Business Description, the better prepared your assigned consultant will be — saving you time in the session itself.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <FloatingScrollTop />
    </div>
  );
}

export default ConsultancyRequest;
