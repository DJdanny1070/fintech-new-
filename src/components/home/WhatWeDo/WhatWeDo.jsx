import { LayoutGrid, Calculator, Compass, GitBranch } from "lucide-react";
import "./WhatWeDo.css";

const PRACTICES = [
  {
    num: "01",
    title: "Asset digitisation platforms",
    desc: "Developing, operating and managing fintech platforms and digital infrastructure for the tokenisation, structuring and fractional ownership of real-world assets.",
    icon: <LayoutGrid size={22} strokeWidth={2} />,
    featured: false,
  },
  {
    num: "02",
    title: "Fintech applications",
    desc: "Advisory systems and applications for businesses and individuals covering due diligence, financial feasibility, business analysis, valuation and financial management.",
    icon: <Calculator size={22} strokeWidth={2} />,
    featured: false,
  },
  {
    num: "03",
    title: "Consultancy & advisory",
    desc: "Guidance on financial technology, deep-tech solutions, digital assets, business strategy, digital transformation and technology implementation.",
    icon: <Compass size={22} strokeWidth={2} />,
    featured: true,
  },
  {
    num: "04",
    title: "Research & development",
    desc: "Applied work in AI, machine learning and data analytics, plus simulation and gamified platforms for financial analysis, training and real-time decisions.",
    icon: <GitBranch size={22} strokeWidth={2} />,
    featured: false,
  },
];

function WhatWeDo() {
  return (
    <section className="cx-practices" id="what-we-do">
      <div className="cx-practices__container">
        {/* Header */}
        <div className="cx-practices__header">
          <div className="cx-practices__header-left">
            <div className="cx-practices__tag">
              <span className="cx-practices__tag-dash">—</span>
              <span>WHAT WE DO</span>
            </div>
            <h2 className="cx-practices__title">
              Four practices, one
              <br />
              technology–first firm.
            </h2>
          </div>

          <div className="cx-practices__header-right">
            <p className="cx-practices__subtitle">
              We take projects from framework design through to live operation — building
              the platforms ourselves, or advising your team as it builds its own.
            </p>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="cx-practices__grid">
          {PRACTICES.map((p) => (
            <div
              key={p.num}
              className={`cx-practice-card ${p.featured ? "cx-practice-card--featured" : ""}`}
            >
              <div className="cx-practice-card__num">{p.num}</div>

              <div className={`cx-practice-card__icon ${p.featured ? "cx-practice-card__icon--accent" : ""}`}>
                {p.icon}
              </div>

              <h3 className="cx-practice-card__title">{p.title}</h3>

              <p className="cx-practice-card__desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhatWeDo;
