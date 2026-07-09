import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar/Navbar";
import Footer from "../components/home/Footer/Footer";
import {
  createRequest,
  uploadDocuments,
  attachDocumentsToRequest,
  validateFiles,
  REQUEST_TYPES,
} from "../services/serviceRequestService";
import "./AssetTokenizationRequest.css";

/* ── Static data ── */
const BUSINESS_TYPES = [
  "Individual / HNI",
  "Private Limited Company",
  "Public Limited Company",
  "LLP / Partnership Firm",
  "Trust / NGO",
  "Family Office",
  "Real Estate Developer",
  "Financial Institution",
  "Other",
];

const ASSET_TYPES = [
  "Real Estate — Residential",
  "Real Estate — Commercial",
  "Real Estate — Industrial",
  "Gold & Precious Metals",
  "Private Equity / Startup Stake",
  "Art & Collectibles",
  "Infrastructure Asset",
  "Debt Instrument / Bond",
  "Intellectual Property",
  "Agriculture / Farmland",
  "Other",
];

const REQUIRED_DOCS_INFO = [
  "Title deed / ownership proof",
  "Latest valuation certificate",
  "Company registration documents",
  "KYC / Identity documents",
  "Audited financial statements",
  "No-objection certificates (NOC)",
];

const PROCESS_STEPS = [
  { label: "Application Review", desc: "Our team reviews your submission within 24 hrs." },
  { label: "KYC Verification", desc: "Identity and document verification is completed." },
  { label: "Asset Appraisal", desc: "Our experts assess and value your asset." },
  { label: "Token Issuance", desc: "Smart contracts are deployed and tokens issued." },
];

/* ── Client-side validation ── */
function validate(form, declared) {
  const errs = {};
  if (!form.applicantName.trim())    errs.applicantName    = "Applicant name is required.";
  if (!form.companyName.trim())      errs.companyName      = "Company name is required.";
  if (!form.email.trim())            errs.email            = "Email is required.";
  else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email   = "Enter a valid email address.";
  if (!form.phone.trim())            errs.phone            = "Phone number is required.";
  else if (!/^[+\d\s\-()]{7,20}$/.test(form.phone)) errs.phone = "Enter a valid phone number.";
  if (!form.businessType)            errs.businessType     = "Select a business type.";
  if (!form.assetType)               errs.assetType        = "Select an asset type.";
  if (!form.assetDescription.trim()) errs.assetDescription = "Please describe the asset.";
  else if (form.assetDescription.trim().length < 30) errs.assetDescription = "Description must be at least 30 characters.";
  if (!declared)                     errs.declaration      = "You must accept the declaration to proceed.";
  return errs;
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */
function AssetTokenizationRequest() {
  const [submitted, setSubmitted]   = useState(false);
  const [declared, setDeclared]     = useState(false);
  const [errors, setErrors]         = useState({});
  const [fileErrors, setFileErrors] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    applicantName:    "",
    companyName:      "",
    email:            "",
    phone:            "",
    businessType:     "",
    assetType:        "",
    assetDescription: "",
  });

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  /* ── File selection handler ── */
  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    const errs = validateFiles(files);
    setFileErrors(errs);
    if (errs.length === 0) setUploadedFiles(files);
    else setUploadedFiles([]);
  }

  function removeFile(index) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  /* ── Submit ── */
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    const errs = validate(form, declared);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`atr-field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (fileErrors.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);

    try {
      /* 1 — Create the request row (duplicate check happens inside) */
      const request = await createRequest({
        request_type: REQUEST_TYPES.ASSET_TOKENIZATION,
        full_name:    form.applicantName,
        company_name: form.companyName,
        email:        form.email,
        phone:        form.phone,
        business_type: form.businessType,
        asset_type:   form.assetType,
        description:  form.assetDescription,
        metadata: {
          submitted_at: new Date().toISOString(),
          source: "asset_tokenization_form",
        },
      });

      /* 2 — Upload documents if any (optional at this stage) */
      if (uploadedFiles.length > 0) {
        const urls = await uploadDocuments(uploadedFiles, request.id, form.email);
        await attachDocumentsToRequest(request.id, urls);
      }

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
      <div className="atr-page">
        <Navbar />
        <div className="atr-success">
          <div className="atr-success__card">
            <div className="atr-success__icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="atr-success__title">Your request has been submitted.</h1>
            <p className="atr-success__body">
              Thank you, <strong>{form.applicantName}</strong>. Our team will review your
              Asset Tokenization application and reach out within{" "}
              <strong>1–2 business days</strong>.
            </p>
            <div className="atr-success__notice">
              <strong>Important:</strong>&nbsp; Our team will review your application.
              Login access will only be provided after verification and approval of your submission.
            </div>
            <div className="atr-success__links">
              <Link to="/" className="atr-success__btn-primary" id="atr-success-home-btn">
                Back to Home
              </Link>
              <Link to="/contact" className="atr-success__btn-ghost" id="atr-success-contact-btn">
                Contact Us
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
    <div className="atr-page">
      <Navbar />

      {/* Hero */}
      <div className="atr-hero">
        <div className="atr-hero__inner">
          <div className="atr-hero__badge">
            <span className="atr-hero__badge-dot" />
            Service Request
          </div>
          <h1 className="atr-hero__title">
            Asset Tokenization <span>Request</span>
          </h1>
          <p className="atr-hero__sub">
            Complete the form below to initiate your asset tokenization journey.
            Our team reviews every application personally before granting access.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="atr-body">
        <div className="atr-layout">

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="atr-form-card">
              <h2 className="atr-form-card__title">Application Form</h2>
              <p className="atr-form-card__sub">
                All fields marked <span style={{ color: "var(--red)" }}>*</span> are required.
              </p>

              {/* Global submission error */}
              {submitError && (
                <div className="atr-submit-error" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{submitError}</span>
                </div>
              )}

              {/* ── Section 1: Applicant ── */}
              <div className="atr-form-section">
                <div className="atr-form-section__label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  Applicant Details
                </div>

                <div className="atr-row atr-row--2">
                  <div className="atr-field" id="atr-field-applicantName">
                    <label className="atr-label" htmlFor="atr-applicantName">
                      Applicant Name <span>*</span>
                    </label>
                    <input id="atr-applicantName" className={`atr-input${errors.applicantName ? " atr-input--error" : ""}`} type="text" placeholder="e.g. Rajesh Kumar" value={form.applicantName} onChange={set("applicantName")} disabled={loading} />
                    {errors.applicantName && <span className="atr-error">{errors.applicantName}</span>}
                  </div>
                  <div className="atr-field" id="atr-field-companyName">
                    <label className="atr-label" htmlFor="atr-companyName">
                      Company Name <span>*</span>
                    </label>
                    <input id="atr-companyName" className={`atr-input${errors.companyName ? " atr-input--error" : ""}`} type="text" placeholder="e.g. Apex Realty Pvt. Ltd." value={form.companyName} onChange={set("companyName")} disabled={loading} />
                    {errors.companyName && <span className="atr-error">{errors.companyName}</span>}
                  </div>
                </div>

                <div className="atr-row atr-row--2" style={{ marginTop: 18 }}>
                  <div className="atr-field" id="atr-field-email">
                    <label className="atr-label" htmlFor="atr-email">Email Address <span>*</span></label>
                    <input id="atr-email" className={`atr-input${errors.email ? " atr-input--error" : ""}`} type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} disabled={loading} />
                    {errors.email && <span className="atr-error">{errors.email}</span>}
                  </div>
                  <div className="atr-field" id="atr-field-phone">
                    <label className="atr-label" htmlFor="atr-phone">Phone Number <span>*</span></label>
                    <input id="atr-phone" className={`atr-input${errors.phone ? " atr-input--error" : ""}`} type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} disabled={loading} />
                    {errors.phone && <span className="atr-error">{errors.phone}</span>}
                  </div>
                </div>

                <div className="atr-row atr-row--1" style={{ marginTop: 18 }}>
                  <div className="atr-field" id="atr-field-businessType">
                    <label className="atr-label" htmlFor="atr-businessType">Business Type <span>*</span></label>
                    <select id="atr-businessType" className={`atr-select${errors.businessType ? " atr-input--error" : ""}`} value={form.businessType} onChange={set("businessType")} disabled={loading}>
                      <option value="">Select business type…</option>
                      {BUSINESS_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {errors.businessType && <span className="atr-error">{errors.businessType}</span>}
                  </div>
                </div>
              </div>

              {/* ── Section 2: Asset ── */}
              <div className="atr-form-section">
                <div className="atr-form-section__label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                  Asset Information
                </div>

                <div className="atr-row atr-row--1">
                  <div className="atr-field" id="atr-field-assetType">
                    <label className="atr-label" htmlFor="atr-assetType">Asset Type <span>*</span></label>
                    <select id="atr-assetType" className={`atr-select${errors.assetType ? " atr-input--error" : ""}`} value={form.assetType} onChange={set("assetType")} disabled={loading}>
                      <option value="">Select asset type…</option>
                      {ASSET_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                    {errors.assetType && <span className="atr-error">{errors.assetType}</span>}
                  </div>
                </div>

                <div className="atr-row atr-row--1" style={{ marginTop: 18 }}>
                  <div className="atr-field" id="atr-field-assetDescription">
                    <label className="atr-label" htmlFor="atr-assetDescription">
                      Asset Description <span>*</span>
                    </label>
                    <textarea id="atr-assetDescription" className={`atr-textarea${errors.assetDescription ? " atr-input--error" : ""}`} placeholder="Describe the asset — location, type, approximate value, current ownership structure, any encumbrances, etc. (minimum 30 characters)" value={form.assetDescription} onChange={set("assetDescription")} rows={5} disabled={loading} />
                    <span style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 4 }}>
                      {form.assetDescription.length} / 30 characters minimum
                    </span>
                    {errors.assetDescription && <span className="atr-error">{errors.assetDescription}</span>}
                  </div>
                </div>
              </div>

              {/* ── Section 3: Documents ── */}
              <div className="atr-form-section">
                <div className="atr-form-section__label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                  Required Documents
                  <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "none", letterSpacing: 0 }}>Optional at this stage</span>
                </div>

                <div className="atr-doc-hint">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>
                    You may upload supporting documents now or after initial review. Accepted formats: <strong>PDF, JPG, PNG, DOC, DOCX</strong> · Max 10 MB per file.
                    <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                      {REQUIRED_DOCS_INFO.map((d) => <li key={d} style={{ marginBottom: 4 }}>{d}</li>)}
                    </ul>
                  </span>
                </div>

                {/* File input */}
                <div className="atr-file-drop" onClick={() => fileInputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--blue)" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div>
                    <span className="atr-file-drop__main">Click to select files</span>
                    <span className="atr-file-drop__sub">PDF, JPG, PNG, DOC, DOCX · Up to 10 MB each</span>
                  </div>
                  <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileChange} style={{ display: "none" }} disabled={loading} />
                </div>

                {/* File errors */}
                {fileErrors.length > 0 && (
                  <div className="atr-file-errors">
                    {fileErrors.map((err, i) => (
                      <span key={i} className="atr-error">{err}</span>
                    ))}
                  </div>
                )}

                {/* Selected files list */}
                {uploadedFiles.length > 0 && (
                  <div className="atr-file-list">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="atr-file-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--blue)", flexShrink: 0 }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span className="atr-file-item__name">{file.name}</span>
                        <span className="atr-file-item__size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <button type="button" className="atr-file-item__remove" onClick={() => removeFile(i)} disabled={loading} aria-label={`Remove ${file.name}`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Declaration ── */}
              <div className="atr-form-section" style={{ marginBottom: 0 }}>
                <div className="atr-form-section__label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Declaration
                </div>

                <label className="atr-declaration" id="atr-field-declaration">
                  <input type="checkbox" checked={declared} onChange={(e) => { setDeclared(e.target.checked); if (errors.declaration) setErrors((er) => ({ ...er, declaration: undefined })); }} id="atr-declaration-check" disabled={loading} />
                  <span className="atr-declaration__text">
                    I confirm that all information provided is accurate and complete. I understand that CresoX will conduct due diligence and that platform access will only be granted after successful verification of my application and submitted documents.
                  </span>
                </label>
                {errors.declaration && <span className="atr-error" style={{ marginTop: 6, display: "block" }}>{errors.declaration}</span>}
              </div>

              {/* Submit button */}
              <button type="submit" className="atr-submit-btn" id="atr-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ── Sidebar ── */}
          <div className="atr-sidebar">
            <div className="atr-info-card">
              <h3 className="atr-info-card__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                What happens next?
              </h3>
              <div className="atr-process-list">
                {PROCESS_STEPS.map((s, i) => (
                  <div key={i} className="atr-process-item">
                    <div className="atr-process-num">{String(i + 1).padStart(2, "0")}</div>
                    <p className="atr-process-text"><strong>{s.label}</strong><br />{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="atr-info-card">
              <h3 className="atr-info-card__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
                </svg>
                Eligibility
              </h3>
              <div className="atr-info-list">
                {[
                  "Asset must be legally owned by the applicant.",
                  "Minimum asset value of ₹1 Crore.",
                  "Business must be registered in India or internationally.",
                  "KYC documents of directors / owners are mandatory.",
                ].map((item, i) => (
                  <div key={i} className="atr-info-item">
                    <div className="atr-info-item-dot" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="atr-info-card" style={{ background: "var(--blue-light)", borderColor: "var(--blue-mid)" }}>
              <h3 className="atr-info-card__title" style={{ color: "var(--blue)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                Need help?
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--text-secondary)", marginBottom: 12 }}>
                Questions about this form or the tokenization process?
              </p>
              <Link to="/contact" style={{ fontSize: 13, fontWeight: 700, color: "var(--blue)", textDecoration: "none" }} id="atr-contact-link">
                Contact our team →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AssetTokenizationRequest;
