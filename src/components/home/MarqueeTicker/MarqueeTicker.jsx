import "./MarqueeTicker.css";

const TICKER_ITEMS = [
  "ARTIFICIAL INTELLIGENCE",
  "MACHINE LEARNING",
  "DATA ANALYTICS",
  "SIMULATION",
  "GAMIFICATION",
  "DIGITAL TRANSFORMATION",
  "DISTRIBUTED LEDGER",
  "SMART CONTRACT AUDITS",
  "REAL-WORLD ASSET TOKENISATION",
  "PREDICTIVE RISK MODELLING",
];

function MarqueeTicker() {
  return (
    <div className="cx-ticker" aria-hidden="true">
      <div className="cx-ticker__fade cx-ticker__fade--left" />
      <div className="cx-ticker__track">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
          <div key={idx} className="cx-ticker__item">
            <span className="cx-ticker__diamond">◆</span>
            <span className="cx-ticker__text">{item}</span>
          </div>
        ))}
      </div>
      <div className="cx-ticker__fade cx-ticker__fade--right" />
    </div>
  );
}

export default MarqueeTicker;
