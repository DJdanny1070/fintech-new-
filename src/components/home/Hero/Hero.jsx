import { Link } from "react-router-dom";
import { ArrowRight, PhoneCall } from "lucide-react";
import "./Hero.css";

const VALUE_PROPS = [
  { label: "Asset Tokenization" },
  { label: "Blockchain-backed Ownership" },
  { label: "Secure Digital Asset Marketplace" },
  { label: "Direct Financial Consultancy" },
];

function Hero() {
  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content hero__animate">
          {/* Eyebrow */}
          <span className="hero__eyebrow">CresoX Fintech Private Limited</span>

          <h1 className="hero__headline">
            Real Assets.{" "}
            <span className="hero__headline-accent">Digital Ownership.</span>
          </h1>

          <p className="hero__description">
            To create an innovative and efficient channel for businesses
            and investors for investment through tokenization and fintech solutions
          </p>

          {/* Value-prop pills */}
          <div className="hero__pills">
            {VALUE_PROPS.map(({ label }) => (
              <span key={label} className="hero__pill">
                <span className="hero__pill-dot" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>

          <div className="hero__actions">
            <Link to="/services" className="btn btn-primary btn-lg hero__btn">
              Explore Our Services
              <ArrowRight size={16} strokeWidth={1.75} />
            </Link>
            <Link to="/contact" className="btn btn-secondary btn-lg hero__btn">
              <PhoneCall size={16} strokeWidth={1.75} />
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
