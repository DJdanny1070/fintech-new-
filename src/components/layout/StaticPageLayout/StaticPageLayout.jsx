import Navbar from "../Navbar/Navbar";
import Footer from "../../home/Footer/Footer";
import "./StaticPageLayout.css";

/**
 * StaticPageLayout
 * A reusable wrapper for public static pages (About, Privacy, Terms, etc.).
 * Renders Navbar → hero band → content → Footer.
 *
 * Props:
 *   eyebrow  — small category label (e.g. "Company")
 *   title    — page heading
 *   subtitle — optional lead paragraph under the title
 *   children — page body content
 */
function StaticPageLayout({ eyebrow, title, subtitle, children }) {
  return (
    <>
      <Navbar />
      <main className="static-page">
        {/* Hero band */}
        <div className="static-page__hero">
          <div className="container">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h1 className="h1 static-page__title">{title}</h1>
            {subtitle && <p className="lead static-page__subtitle">{subtitle}</p>}
          </div>
        </div>

        {/* Body */}
        <div className="static-page__body">
          <div className="container">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default StaticPageLayout;
