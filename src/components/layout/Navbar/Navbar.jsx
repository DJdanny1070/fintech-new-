import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun, ArrowRight } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home",       to: "/" },
  { label: "About",      to: "/about" },
  { label: "Platforms",  to: "/services" },
  { label: "Advisory",   to: "/services/direct-consultancy" },
  { label: "Technology", to: "/services/asset-tokenization" },
  { label: "Approach",   to: "/compliance" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Ensure the entire website consistently adheres to the high-tech theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("cresox_theme", "dark");
    setIsDark(true);
  }, []);

  const toggleTheme = () => {
    // Keep consistent with the deep-tech midnight theme across all pages
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("cresox_theme", "dark");
    setIsDark(true);
  };

  return (
    <header className={`cx-nav ${scrolled ? "cx-nav--scrolled" : ""}`}>
      <div className="cx-nav__inner">
        {/* Logo */}
        <Link to="/" className="cx-nav__logo" aria-label="CresoX Fintech Private Limited">
          <div className="cx-nav__logo-brand">
            <span className="cx-nav__logo-creso">creso</span>
            <span className="cx-nav__logo-x">x</span>
          </div>
          <span className="cx-nav__logo-sub">FINTECH PRIVATE LIMITED</span>
        </Link>

        {/* Desktop Links */}
        <nav className="cx-nav__menu" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`cx-nav__link ${isActive ? "cx-nav__link--active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="cx-nav__actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="cx-nav__signin-btn">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="cx-nav__signin-btn">
              Sign In
            </Link>
          )}

          <Link to="/contact" className="cx-nav__cta-btn">
            <span>Talk to us</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>

          <button
            type="button"
            className="cx-nav__theme-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? <Moon size={15} strokeWidth={2} /> : <Sun size={15} strokeWidth={2} />}
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="cx-nav__mobile-toggle"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="cx-nav__drawer animate-fade-in">
          <nav className="cx-nav__drawer-links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`cx-nav__drawer-link ${location.pathname === link.to ? "cx-nav__drawer-link--active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="cx-nav__drawer-actions">
              <Link to="/login" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                Sign In to Platform
              </Link>
              <Link to="/contact" className="cx-nav__cta-btn" style={{ width: "100%", justifyContent: "center" }}>
                <span>Talk to us</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
