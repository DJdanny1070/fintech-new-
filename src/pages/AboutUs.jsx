import { useEffect, useRef } from "react";
import Navbar from "../components/layout/Navbar/Navbar";
import Footer from "../components/home/Footer/Footer";
import MarqueeTicker from "../components/home/MarqueeTicker/MarqueeTicker";
import OurObjectives from "../components/home/OurObjectives/OurObjectives";
import Leadership from "../components/home/Leadership/Leadership";
import FloatingScrollTop from "../components/common/FloatingScrollTop";
import "./AboutUs.css";

function AboutUs() {
  const canvasRef = useRef(null);

  // Dynamic particle constellation inside the Shared Ledger card
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", onResize);

    const nodes = Array.from({ length: 22 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1.2,
      isOrange: Math.random() > 0.8,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const alpha = (1 - dist / 90) * 0.35;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.isOrange ? "#FF5722" : "rgba(148, 163, 184, 0.85)";
        if (n.isOrange) {
          ctx.shadowColor = "#FF5722";
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="cx-about">
      <Navbar />

      {/* Hero / Intro matching cresox.in/about.html */}
      <section className="cx-about-hero">
        <div className="cx-about-hero__container">
          <div className="cx-about-hero__content">
            <div className="cx-about-hero__tag">
              <span className="cx-about-hero__tag-dash">—</span>
              <span>FINTECH · TOKENISATION · DEEP-TECH ADVISORY</span>
            </div>
            <h1 className="cx-about-hero__title">
              Engineering institutional fintech for real-world assets.
            </h1>
            <p className="cx-about-hero__lead">
              We support and take up projects such as the development of
              technology frameworks, digital platforms, applications for
              real-world asset management, real-estate project management,
              business analysis and financial decision-making. We also offer
              consultancy in digital transformation, business strategy, financial
              modelling and technology implementation.
            </p>
          </div>

          <div className="cx-about-hero__card">
            <div className="cx-about-hero__card-badge">
              <span className="cx-about-hero__badge-dot" />
              <span>SHARED LEDGER</span>
            </div>
            <div className="cx-about-hero__card-canvas-wrap">
              <canvas ref={canvasRef} className="cx-about-hero__card-canvas" />
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <MarqueeTicker />

      {/* Our Objectives Section (Image 4) */}
      <OurObjectives />

      {/* Team / Leadership */}
      <Leadership />

      <Footer />
      <FloatingScrollTop />
    </div>
  );
}

export default AboutUs;
