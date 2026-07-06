import { useState } from "react";
import StaticPageLayout from "../components/layout/StaticPageLayout/StaticPageLayout";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const FAQ_CATEGORIES = [
  {
    category: "Account Issues",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    color: "var(--blue-light)", text: "var(--blue)",
    faqs: [
      { q: "How do I reset my password?", a: "Navigate to the login page and click 'Forgot Password'. Enter your registered email address. You will receive a reset link within 2 minutes. Check your spam folder if you don't see it." },
      { q: "My account is locked — what do I do?", a: "Accounts are locked after 5 consecutive failed login attempts for security. Wait 30 minutes and try again, or use the 'Forgot Password' link to reset your credentials immediately." },
      { q: "How do I change my registered mobile number?", a: "Go to Profile → Settings → Contact Details. You will need to verify both your old and new mobile numbers via OTP before the change takes effect." },
      { q: "Can I have multiple accounts?", a: "No. Each individual is permitted one personal account. Businesses may register a separate business account using their company registration documents." },
    ],
  },
  {
    category: "Wallet Issues",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h.01"/>
      </svg>
    ),
    color: "var(--green-light)", text: "var(--green)",
    faqs: [
      { q: "My wallet top-up hasn't arrived — what now?", a: "Bank transfers can take 1–2 business days. UPI transfers are typically instant. If more than 2 business days have passed, check your bank statement for the debit and contact support with the transaction reference number." },
      { q: "How do I withdraw funds to my bank?", a: "Go to Wallet → Withdraw → select your linked bank account → enter the amount → confirm with your PIN. Withdrawals are processed within 1 business day. Minimum withdrawal amount is ₹100." },
      { q: "Why was my transaction declined?", a: "Transactions may be declined due to insufficient balance, spending limit restrictions, or security flags. Check your wallet balance and daily limit in Wallet → Settings → Limits." },
      { q: "What is my wallet transaction limit?", a: "Minimum KYC: ₹10,000 per day, ₹1,00,000 balance. Full KYC: ₹2,00,000 per day, ₹10,00,000 balance. Business accounts have higher limits — contact us for details." },
    ],
  },
  {
    category: "Marketplace Issues",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
    color: "var(--amber-light)", text: "var(--amber)",
    faqs: [
      { q: "My listing was rejected — why?", a: "Listings are rejected if they do not meet our content policy, lack required documentation, or involve prohibited asset categories. You will receive an email with specific rejection reasons. Revise and resubmit once the issues are addressed." },
      { q: "I placed an order but the seller isn't responding.", a: "Sellers have 48 hours to confirm an order. If they don't respond, the order is automatically cancelled and your payment is refunded to your wallet within 1 business day." },
      { q: "How do I raise a dispute on a completed order?", a: "Go to Marketplace → My Orders → select the order → Raise Dispute. Provide evidence (photos, communication). Our team will investigate within 5 business days. Decisions are final as per our Terms of Service." },
      { q: "Are all marketplace assets verified?", a: "All asset listings undergo a review process before going live. Verification badges indicate assets with additional documentation reviewed by our compliance team. However, always perform your own due diligence before purchasing." },
    ],
  },
  {
    category: "Verification Issues",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    color: "#EEF0F4", text: "var(--slate)",
    faqs: [
      { q: "My KYC was rejected — what should I do?", a: "You will receive an email with the specific reason for rejection (e.g., blurry document, name mismatch). Re-upload clear, valid documents in a well-lit environment. Ensure your document matches your registered name exactly." },
      { q: "How long does KYC verification take?", a: "Automated KYC is typically completed within 5 minutes. Cases requiring manual review take up to 2 business days. You will be notified by email once your KYC status changes." },
      { q: "Can I use a foreign passport for KYC?", a: "Yes. Foreign nationals may use their passport and a valid Indian visa for identity verification. Additional proof of Indian address is required for full wallet access." },
      { q: "What does 'blockchain verification failed' mean?", a: "This indicates a hash mismatch between the transaction record and the on-chain data. This is rare and typically caused by a system delay. Contact support immediately with the transaction ID." },
    ],
  },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sp-faq-item">
      <button
        className="sp-faq-item__q"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        {faq.q}
        <ChevronDown
          size={16}
          className={`sp-faq-item__chevron ${open ? "sp-faq-item__chevron--open" : ""}`}
        />
      </button>
      {open && <div className="sp-faq-item__a">{faq.a}</div>}
    </div>
  );
}

function HelpCentre() {
  return (
    <StaticPageLayout
      eyebrow="Resources"
      title="Help Centre"
      subtitle="Find answers to common questions, troubleshoot issues, or contact our support team directly."
    >
      {/* Quick contact banner */}
      <div className="sp-banner" style={{ marginBottom: "var(--sp-12)" }}>
        <div className="sp-banner__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div className="sp-banner__text">
          <strong>Can't find your answer below?</strong>
          Our support team responds within one business day.{" "}
          <Link to="/contact" style={{ color: "var(--blue)", fontWeight: 600 }}>Contact Support →</Link>
        </div>
      </div>

      {/* FAQ categories */}
      {FAQ_CATEGORIES.map((cat, idx) => (
        <div key={cat.category} className="sp-section">
          {/* Category header */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-5)" }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: "var(--r-md)",
                background: cat.color, color: cat.text,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {cat.icon}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{cat.category}</h2>
          </div>

          {/* FAQ items */}
          <div>
            {cat.faqs.map((faq) => (
              <FAQItem key={faq.q} faq={faq} />
            ))}
          </div>

          {idx < FAQ_CATEGORIES.length - 1 && <hr className="sp-divider" />}
        </div>
      ))}

      {/* Bottom CTA */}
      <div
        style={{
          marginTop: "var(--sp-12)",
          background: "var(--bg-white)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-lg)",
          padding: "var(--sp-8)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--sp-3)" }}>
          Still need help?
        </div>
        <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: "var(--sp-6)" }}>
          Our support team is available Monday to Friday, 9 AM – 6 PM IST.
        </p>
        <div style={{ display: "flex", gap: "var(--sp-4)", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/contact" className="btn btn-primary" id="help-contact-btn">
            Contact Support
          </Link>
          <Link to="/docs" className="btn btn-secondary" id="help-docs-btn">
            Browse Documentation
          </Link>
        </div>
      </div>
    </StaticPageLayout>
  );
}

export default HelpCentre;
