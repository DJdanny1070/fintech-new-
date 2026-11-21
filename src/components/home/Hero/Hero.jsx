import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import "./Hero.css";

const ASSET_SLIDES = [
  {
    id: "01",
    tag: "ASSET · COMMERCIAL TOWER",
    badge: "TOKENISED",
    units: "UNIT 0x07 · 0x12 · 0x1A",
    highlightIndices: [1, 5, 8],
    meta: "ILLUSTRATIVE",
  },
  {
    id: "02",
    tag: "ASSET · 50MW SOLAR GRID",
    badge: "TOKENISED",
    units: "UNIT 0x02 · 0x09 · 0x14",
    highlightIndices: [0, 4, 9, 10],
    meta: "RENEWABLE YIELD",
  },
  {
    id: "03",
    tag: "ASSET · LOGISTICS CLUSTER IV",
    badge: "TOKENISED",
    units: "UNIT 0x04 · 0x08 · 0x1B",
    highlightIndices: [2, 6, 7],
    meta: "FREIGHT CORRIDOR",
  },
  {
    id: "04",
    tag: "ASSET · HERITAGE NUMISMATIC",
    badge: "TOKENISED",
    units: "UNIT 0x01 · 0x05 · 0x0C",
    highlightIndices: [3, 5, 11],
    meta: "VAULT CUSTODY",
  },
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const canvasRef = useRef(null);

  // ── Constellation / Particle Network Canvas Background ─────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle nodes
    const particleCount = Math.min(48, Math.floor((width * height) / 22000));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2 + 1,
      accent: Math.random() < 0.18, // some particles tinted orange
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const opacity = (1 - dist / 130) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].accent || particles[j].accent
              ? `rgba(255, 87, 34, ${opacity * 1.5})`
              : `rgba(79, 163, 255, ${opacity})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.accent ? "rgba(255, 87, 34, 0.75)" : "rgba(147, 197, 253, 0.55)";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const slide = ASSET_SLIDES[currentSlide];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % ASSET_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + ASSET_SLIDES.length) % ASSET_SLIDES.length);
  };

  return (
    <section className="cx-hero">
      {/* Interactive Constellation Canvas */}
      <canvas ref={canvasRef} className="cx-hero__canvas" aria-hidden="true" />

      {/* Ambient Neon Glow Spheres */}
      <div className="cx-hero__glow-orange" aria-hidden="true" />
      <div className="cx-hero__glow-blue" aria-hidden="true" />

      <div className="cx-hero__container">
        {/* Left Column: Copy & Actions */}
        <div className="cx-hero__left animate-fade-up">
          {/* Tag */}
          <div className="cx-hero__tag">
            <span className="cx-hero__tag-dash">—</span>
            <span>FINTECH · TOKENISATION · DEEP-TECH ADVISORY</span>
          </div>

          {/* Headline */}
          <h1 className="cx-hero__title">
            Real–world assets,
            <br />
            rebuilt for a digital
            <br />
            ledger.
          </h1>

          {/* Subtitle */}
          <p className="cx-hero__desc">
            CresoX builds and operates financial technology that digitises, tokenises and
            manages real-world assets — and advises the businesses that want to put
            distributed ledgers, AI and data analytics to work.
          </p>

          {/* CTA Buttons */}
          <div className="cx-hero__actions">
            <Link to="/services" className="cx-hero__btn-primary">
              <span>Explore our platforms</span>
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>

            <Link to="/services/direct-consultancy" className="cx-hero__btn-secondary">
              Advisory services
            </Link>
          </div>

          {/* Carousel Slide Indicators */}
          <div className="cx-hero__indicators">
            {ASSET_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                className={`cx-hero__dash ${idx === currentSlide ? "cx-hero__dash--active" : ""}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Asset Token Matrix */}
        <div className="cx-hero__right animate-fade-in">
          <div className="cx-hero__asset-card">
            {/* Top Bar */}
            <div className="cx-hero__card-top">
              <span className="cx-hero__asset-tag">{slide.tag}</span>
              <span className="cx-hero__asset-badge">{slide.badge}</span>
            </div>

            {/* 4x3 Interactive Tile Matrix */}
            <div className="cx-hero__grid">
              {Array.from({ length: 12 }, (_, i) => {
                const isHighlighted = slide.highlightIndices.includes(i);
                return (
                  <div
                    key={i}
                    className={`cx-hero__tile ${isHighlighted ? "cx-hero__tile--active" : ""}`}
                    title={`Asset Fraction Unit 0x${(i + 1).toString(16).padStart(2, "0").toUpperCase()}`}
                  />
                );
              })}
            </div>

            {/* Bottom Bar */}
            <div className="cx-hero__card-bot">
              <span className="cx-hero__unit-code">{slide.units}</span>
              <span className="cx-hero__unit-label">{slide.meta}</span>
            </div>
          </div>

          {/* Carousel Controls (01 / 04, Arrows) */}
          <div className="cx-hero__controls">
            <span className="cx-hero__counter">
              <strong>{slide.id}</strong> / 0{ASSET_SLIDES.length}
            </span>

            <div className="cx-hero__arrows">
              <button
                type="button"
                className="cx-hero__arrow-btn"
                onClick={prevSlide}
                aria-label="Previous asset slide"
                title="Previous asset"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>

              <button
                type="button"
                className="cx-hero__arrow-btn"
                onClick={nextSlide}
                aria-label="Next asset slide"
                title="Next asset"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Edge Scroll Indicator */}
      <div className="cx-hero__scroll-indicator" aria-hidden="true">
        <span>SCROLL</span>
        <span className="cx-hero__scroll-arrow">▾</span>
      </div>
    </section>
  );
}

export default Hero;
