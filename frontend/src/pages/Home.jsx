import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import Platforms from "../components/Platforms.jsx";
import Features from "../components/Features.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import Footer from "../components/Footer.jsx";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#05060a] text-white">
      <Navbar />
      <Hero />
      <Platforms />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  );
}
