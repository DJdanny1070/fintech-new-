import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar/Navbar";
import Hero from "../components/home/Hero/Hero";
import TrustedBy from "../components/home/TrustedBy/TrustedBy";
import Services from "../components/home/Services/Services";
import RealWorldAssets from "../components/home/RealWorldAssets/RealWorldAssets";
import HowItWorks from "../components/home/HowItWorks/HowItWorks";
import MarketplacePreview from "../components/home/MarketplacePreview/MarketplacePreview";
import BlockchainViz from "../components/home/BlockchainViz/BlockchainViz";
import Platform from "../components/home/Platform/Platform";
import Leadership from "../components/home/Leadership/Leadership";
import Footer from "../components/home/Footer/Footer";

function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo === "leadership") {
      // Use a short timeout so the page has rendered before scrolling
      const id = setTimeout(() => {
        const el = document.getElementById("leadership");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
      return () => clearTimeout(id);
    }
  }, [location.state]);

  return (
    <>
      <Navbar />
      <Hero />
      <TrustedBy />
      <RealWorldAssets />
      <Services />
      <HowItWorks />
      <MarketplacePreview />
      <BlockchainViz />
      <Leadership />
      <Platform />
      <Footer />
    </>
  );
}

export default Home;
