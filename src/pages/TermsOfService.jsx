import StaticPageLayout from "../components/layout/StaticPageLayout/StaticPageLayout";

const SECTIONS = [
  {
    eyebrow: "User Responsibilities",
    title: "Your Obligations as a User",
    body: "By using CresoX, you agree to use the platform lawfully, accurately, and in good faith. You are responsible for maintaining the confidentiality of your credentials.",
    items: [
      "Provide accurate and up-to-date registration information",
      "Keep your login credentials confidential and not share them",
      "Notify us immediately if you suspect unauthorised access",
      "Comply with all applicable Indian laws and regulations",
      "Not use the platform for unlawful, fraudulent, or abusive activities",
    ],
  },
  {
    eyebrow: "Marketplace Usage",
    title: "Marketplace Rules",
    body: "The CresoX Marketplace facilitates the listing and trading of verified real-world and digital assets. All listings must comply with our content and compliance policies.",
    items: [
      "Only list assets you have legal authority to sell",
      "Provide accurate descriptions, valuations, and documentation",
      "Complete all mandatory KYC/AML checks before trading",
      "Honour completed trades — cancellations may result in penalties",
      "Prohibited: counterfeit goods, restricted assets, fraudulent listings",
    ],
  },
  {
    eyebrow: "Wallet Usage",
    title: "Digital Wallet Terms",
    body: "Your CresoX Wallet is a regulated prepaid payment instrument. Funds held are protected under applicable RBI guidelines. Usage is subject to the following conditions.",
    items: [
      "Maximum wallet balance and transaction limits apply per RBI guidelines",
      "Funds may not be used for illegal purposes or money laundering",
      "International transfers are subject to FEMA regulations",
      "CresoX is not a bank; wallet balances are not DICGC insured",
      "Dormant wallets may be deactivated after 12 months of inactivity",
    ],
  },
  {
    eyebrow: "Account Rules",
    title: "Account Conduct",
    body: "Users are permitted one personal account and, where applicable, one business account. Accounts found violating our policies may be suspended or permanently terminated.",
    items: [
      "One personal account per individual (duplicate accounts are prohibited)",
      "Business accounts require valid company registration documents",
      "Accounts may be suspended during fraud investigations",
      "Terminated accounts forfeit any pending rewards or promotions",
      "You may close your account at any time by contacting support",
    ],
  },
  {
    eyebrow: "Liability",
    title: "Limitation of Liability",
    body: "To the fullest extent permitted by law, CresoX Fintech Private Limited shall not be liable for indirect, incidental, or consequential damages arising from the use of the platform.",
    items: [
      "CresoX is not liable for losses due to market volatility on traded assets",
      "We are not responsible for third-party service outages or API failures",
      "Force majeure events (natural disasters, regulatory action) exclude liability",
      "Maximum aggregate liability is limited to fees paid by you in the preceding 3 months",
      "Users waive class-action rights; disputes are settled via individual arbitration in Mumbai",
    ],
  },
];

function TermsOfService() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="Last updated: 1 January 2025. Please read these terms carefully before using the CresoX platform. By registering or using our services, you agree to be bound by these terms."
    >
      <div className="sp-banner sp-banner--amber" style={{ marginBottom: "var(--sp-12)" }}>
        <div className="sp-banner__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div className="sp-banner__text">
          <strong>Important Notice</strong>
          These Terms constitute a legally binding agreement between you and CresoX Fintech Private Limited. These Terms are governed by the laws of India and subject to the jurisdiction of Mumbai courts.
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
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div className="sp-banner__text">
          <strong>Questions about these terms?</strong>
          Contact our legal team at{" "}
          <a href="mailto:legal@cresox.in" style={{ color: "var(--blue)", fontWeight: 600 }}>legal@cresox.in</a>.
        </div>
      </div>
    </StaticPageLayout>
  );
}

export default TermsOfService;
