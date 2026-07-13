import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar/Navbar";
import Hero from "../components/home/Hero/Hero";
import TrustedBy from "../components/home/TrustedBy/TrustedBy";
import Services from "../components/home/Services/Services";
import RealWorldAssets from "../components/home/RealWorldAssets/RealWorldAssets";
import HowItWorks from "../components/home/HowItWorks/HowItWorks";
import BlockchainViz from "../components/home/BlockchainViz/BlockchainViz";
import Leadership from "../components/home/Leadership/Leadership";
import Platform from "../components/home/Platform/Platform";
import Footer from "../components/home/Footer/Footer";

function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const id = setTimeout(() => {
        const el = document.getElementById(location.state.scrollTo);
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
      <Services />
      <RealWorldAssets />
      <HowItWorks />
      <BlockchainViz />
      <Leadership />
      <Platform />
      <Footer />
    </>
  );
}

export default Home;
