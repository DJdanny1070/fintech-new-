import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./Navbar.css";
import cresoxLogo from "../../../assets/cresox-logo.png";

const NAV_LINKS = [
  { label: "Home",        to: "/",        isRoute: true },
  { label: "Services",    to: "/services", isRoute: true },
  { label: "About",       to: "/about",   isRoute: true },
  { label: "Team CresoX", to: "/",        isRoute: true, scrollTo: "leadership" },
  { label: "Contact",     to: "/contact", isRoute: true },
];

function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = (link) => {
    setMobileOpen(false);
    if (link.scrollTo) {
      // If already on home, scroll directly; otherwise navigate then scroll
      if (location.pathname === "/") {
        const el = document.getElementById(link.scrollTo);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label="CresoX Fintech Private Limited">
          <img
            src={cresoxLogo}
            alt="CresoX Fintech Private Limited"
            className="navbar__logo-img"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="navbar__nav" aria-label="Main navigation">
          {NAV_LINKS.map((link) =>
            link.scrollTo ? (
              <Link
                key={link.label}
                to={link.to}
                state={{ scrollTo: link.scrollTo }}
                className={`navbar__link ${
                  location.pathname === link.to ? "navbar__link--active" : ""
                }`}
                onClick={() => handleNavClick(link)}
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className={`navbar__link ${
                  location.pathname === link.to ? "navbar__link--active" : ""
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          <Link to="/login" className="navbar__login">
            Sign In
          </Link>
          <Link to="/services" className="btn btn-primary btn-sm navbar__cta">
            Explore Our Services
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="navbar__toggle"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`navbar__mobile ${mobileOpen ? "navbar__mobile--open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        <div className="navbar__mobile-inner">
          {NAV_LINKS.map((link) =>
            link.scrollTo ? (
              <Link
                key={link.label}
                to={link.to}
                state={{ scrollTo: link.scrollTo }}
                className="navbar__mobile-link"
                onClick={() => handleNavClick(link)}
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className="navbar__mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            )
          )}

          <div className="navbar__mobile-actions">
            <Link
              to="/login"
              className="btn btn-secondary w-full navbar__mobile-btn"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/services"
              className="btn btn-primary w-full navbar__mobile-btn"
              onClick={() => setMobileOpen(false)}
            >
              Explore Our Services
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
