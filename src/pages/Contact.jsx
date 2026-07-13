import { useState } from "react";
import StaticPageLayout from "../components/layout/StaticPageLayout/StaticPageLayout";

const CONTACT_INFO = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: "Email",
    value: <a href="mailto:support@cresox.in">support@cresox.in</a>,
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/>
      </svg>
    ),
    label: "Phone",
    value: <a href="tel:+912212345678">+91 22 1234 5678</a>,
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: "Office Address",
    value: "CresoX Fintech Pvt Ltd, 120 Seethakathi Estate, GST Rd, Vandalur, Tamil Nadu 600048",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    label: "Business Hours",
    value: "Monday – Friday: 9:00 AM – 6:00 PM IST (Closed on public holidays)",
  },
];

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    /* Simulate async send */
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSubmitted(true);
  };

  return (
    <StaticPageLayout
      eyebrow="Contact"
      title="Get in Touch"
      subtitle="Have a question, partnership inquiry, or need support? We typically respond within one business day."
    >
      <div className="sp-two-col">
        {/* ── Left: Form ── */}
        <div>
          <span className="sp-section__eyebrow">Send a Message</span>
          <h2 className="sp-section__title" style={{ marginBottom: "var(--sp-6)" }}>
            We'd Love to Hear From You
          </h2>

          {submitted ? (
            <div className="sp-banner sp-banner--green">
              <div className="sp-banner__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div className="sp-banner__text">
                <strong>Message Sent!</strong>
                Thank you for reaching out. Our team will get back to you at{" "}
                <strong>{form.email}</strong> within one business day.
              </div>
            </div>
          ) : (
            <form className="sp-form" onSubmit={handleSubmit}>
              <div className="sp-form__row">
                <div className="sp-form__field">
                  <label className="input-label" htmlFor="contact-name">Full Name</label>
                  <input
                    id="contact-name"
                    name="name"
                    className="input"
                    
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="sp-form__field">
                  <label className="input-label" htmlFor="contact-email">Email Address</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    className="input"
                    
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="sp-form__field">
                <label className="input-label" htmlFor="contact-subject">Subject</label>
                <select
                  id="contact-subject"
                  name="subject"
                  className="input"
                  value={form.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a topic…</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="compliance">Compliance / Legal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="sp-form__field">
                <label className="input-label" htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  className="input"
                  placeholder="Describe your inquiry…"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                  style={{ resize: "vertical" }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending}
                style={{ alignSelf: "flex-start" }}
                id="contact-submit-btn"
              >
                {sending ? (
                  <>
                    <span className="spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,.4)" }} />
                    Sending…
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          )}
        </div>

        {/* ── Right: Contact details ── */}
        <div>
          <span className="sp-section__eyebrow">Contact Details</span>
          <h2 className="sp-section__title" style={{ marginBottom: "var(--sp-6)" }}>Reach Us Directly</h2>
          {CONTACT_INFO.map((item) => (
            <div className="sp-contact-item" key={item.label}>
              <div className="sp-contact-item__icon">{item.icon}</div>
              <div>
                <div className="sp-contact-item__label">{item.label}</div>
                <div className="sp-contact-item__value">{item.value}</div>
              </div>
            </div>
          ))}

          <div className="sp-banner" style={{ marginTop: "var(--sp-6)" }}>
            <div className="sp-banner__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="sp-banner__text">
              <strong>For urgent platform issues</strong>
              Check our{" "}
              <a href="/status" style={{ color: "var(--blue)", fontWeight: 600 }}>Status page</a>
              {" "}for real-time system health before contacting support.
            </div>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  );
}

export default Contact;
