import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar/Navbar";
import Hero from "../components/home/Hero/Hero";
import MarqueeTicker from "../components/home/MarqueeTicker/MarqueeTicker";
import WhatWeDo from "../components/home/WhatWeDo/WhatWeDo";
import OurObjectives from "../components/home/OurObjectives/OurObjectives";
import BlockchainViz from "../components/home/BlockchainViz/BlockchainViz";
import Leadership from "../components/home/Leadership/Leadership";
import Footer from "../components/home/Footer/Footer";
import FloatingScrollTop from "../components/common/FloatingScrollTop";

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
      <main>
        <Hero />
        <MarqueeTicker />
        <WhatWeDo />
        <OurObjectives />
        <BlockchainViz />
        <Leadership />
      </main>
      <Footer />
      <FloatingScrollTop />
    </>
  );
}

export default Home;
