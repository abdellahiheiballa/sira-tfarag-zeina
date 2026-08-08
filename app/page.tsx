import CompetitionInfo from "../components/CompetitionInfo";
import EligibilitySection from "../components/EligibilitySection";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import RegistrationCTA from "../components/RegistrationCTA";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Hero />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-8">
            <CompetitionInfo />
            <EligibilitySection />
          </div>
          <div className="space-y-8">
            <RegistrationCTA />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
