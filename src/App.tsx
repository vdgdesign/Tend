import { Routes, Route, useLocation, Link } from "react-router-dom";
import Onboarding from "./screens/Onboarding";
import Dashboard from "./screens/Dashboard";
import SpecialistDetail from "./screens/SpecialistDetail";
import VisitNotes from "./screens/VisitNotes";

function Footer() {
  return (
    <footer className="relative z-10 pt-16 pb-10 text-center">
      <div className="rule max-w-[120px] mx-auto mb-5" />
      <p className="text-xs text-muted tracking-wide leading-relaxed max-w-xs mx-auto">
        A prototype, not a product. Built to think through what care could feel like for the people doing the holding.
      </p>
    </footer>
  );
}

function Header() {
  const loc = useLocation();
  if (loc.pathname === "/") return null;
  return (
    <header className="relative z-10 max-w-3xl mx-auto pt-7 px-6 flex items-baseline justify-between">
      <Link
        to="/"
        className="font-display text-2xl tracking-tighter2 text-ink hover:text-ochre transition-colors duration-200"
        onClick={() => {
          sessionStorage.removeItem("tend.diagnosisData");
        }}
      >
        Tend<span className="text-ochre">.</span>
      </Link>
      <span className="num">A caregiver's companion</span>
    </header>
  );
}

export default function App() {
  const loc = useLocation();
  return (
    <div className="grain min-h-screen flex flex-col">
      <Header />
      <main key={loc.pathname} className="route-fade relative z-10 flex-1">
        <Routes>
          <Route path="/"               element={<Onboarding />} />
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/specialist/:id" element={<SpecialistDetail />} />
          <Route path="/visit-notes"    element={<VisitNotes />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
