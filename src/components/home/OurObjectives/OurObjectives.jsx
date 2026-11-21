import "./OurObjectives.css";

const OBJECTIVES = [
  {
    step: "1",
    title: "Fintech platforms for real-world assets",
    desc: "Developing, operating and managing fintech platforms and digital infrastructure, including deep-tech solutions for the digitisation, tokenisation, structuring and management of real-world assets, and operating digital platforms and marketplaces for their issuance, exchange, trading and fractional ownership.",
  },
  {
    step: "2",
    title: "Fintech applications and advisory systems",
    desc: "Developing and providing fintech applications, advisory systems and technology solutions for businesses and individuals, including due diligence, financial feasibility, business analysis, valuation and financial management.",
  },
  {
    step: "3",
    title: "Consultancy and technology implementation",
    desc: "Providing expert consultancy in financial technology, deep-tech solutions, digital transformation, business strategy, financial modelling and technology implementation.",
  },
  {
    step: "4",
    title: "Applied research, data and simulations",
    desc: "Conducting research and developing applications in artificial intelligence, machine learning, data analytics, predictive modelling, simulation and gamification for financial decision-making, training and market insights.",
  },
];

function OurObjectives() {
  return (
    <section className="cx-objectives" id="our-objectives">
      <div className="cx-objectives__container">
        {/* Header */}
        <div className="cx-objectives__header">
          <div className="cx-objectives__tag">
            <span className="cx-objectives__tag-dash">—</span>
            <span>OUR OBJECTIVES</span>
          </div>
          <h2 className="cx-objectives__title">
            Four objectives that
            <br />
            shape everything we build.
          </h2>
        </div>

        {/* 2-Column Content */}
        <div className="cx-objectives__body">
          {/* Left Column: Dark Visual Card with SHARED LEDGER badge */}
          <div className="cx-objectives__visual-card">
            <div className="cx-objectives__visual-inner">
              <div className="cx-objectives__visual-badge">
                <span className="cx-objectives__badge-dot" />
                <span>SHARED LEDGER</span>
              </div>

              {/* High-Tech Ledger Illustration */}
              <div className="cx-objectives__art">
                <svg viewBox="0 0 380 280" fill="none" className="cx-objectives__svg">
                  <defs>
                    <linearGradient id="gridGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#0260C6" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#FF5722" stopOpacity="0.25" />
                    </linearGradient>
                    <linearGradient id="pillarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#0260C6" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  {/* Isometric Building / Ledger Blocks */}
                  <g opacity="0.85">
                    {/* Tower pillars */}
                    <rect x="50" y="110" width="45" height="130" rx="4" fill="url(#pillarGrad)" />
                    <rect x="110" y="70" width="55" height="170" rx="4" fill="url(#pillarGrad)" opacity="0.9" />
                    <rect x="180" y="95" width="50" height="145" rx="4" fill="url(#pillarGrad)" opacity="0.8" />
                    <rect x="245" y="130" width="45" height="110" rx="4" fill="url(#pillarGrad)" opacity="0.65" />

                    {/* Windows grid lines */}
                    <line x1="120" y1="90" x2="155" y2="90" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <line x1="120" y1="110" x2="155" y2="110" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <line x1="120" y1="130" x2="155" y2="130" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <line x1="120" y1="150" x2="155" y2="150" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

                    {/* Network connector curves */}
                    <path d="M 72 110 Q 137 40 205 95" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
                    <path d="M 137 70 Q 200 30 267 130" stroke="#FF5722" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.8" />

                    {/* Pulsing state nodes */}
                    <circle cx="72" cy="110" r="4" fill="#38BDF8" />
                    <circle cx="137" cy="70" r="5" fill="#38BDF8" />
                    <circle cx="205" cy="95" r="4.5" fill="#FF5722" />
                    <circle cx="267" cy="130" r="4" fill="#38BDF8" />
                  </g>
                </svg>
              </div>

              <div className="cx-objectives__visual-footer">
                <span className="cx-objectives__meta-tag">ENTERPRISE INFRASTRUCTURE</span>
                <span className="cx-objectives__meta-status">100% LEDGER AUDITED</span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Numbered Steps */}
          <div className="cx-objectives__steps">
            {OBJECTIVES.map((item) => (
              <div key={item.step} className="cx-objective-step">
                <div className="cx-objective-step__badge">{item.step}</div>
                <div className="cx-objective-step__content">
                  <h3 className="cx-objective-step__title">{item.title}</h3>
                  <p className="cx-objective-step__desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default OurObjectives;
