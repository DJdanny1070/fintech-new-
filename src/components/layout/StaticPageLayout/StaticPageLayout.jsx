import Navbar from "../Navbar/Navbar";
import Footer from "../../home/Footer/Footer";
import FloatingScrollTop from "../../common/FloatingScrollTop";
import "./StaticPageLayout.css";

function StaticPageLayout({ eyebrow, title, subtitle, children }) {
  return (
    <>
      <Navbar />
      <main className="static-page">
        {/* Hero band */}
        <div className="static-page__hero">
          <div className="container">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h1 className="static-page__title">{title}</h1>
            {subtitle && <p className="static-page__subtitle">{subtitle}</p>}
          </div>
        </div>

        {/* Body */}
        <div className="static-page__body">
          <div className="container">{children}</div>
        </div>
      </main>
      <Footer />
      <FloatingScrollTop />
    </>
  );
}

export default StaticPageLayout;
