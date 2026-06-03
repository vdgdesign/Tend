import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, ClipboardList, Search } from "lucide-react";
import type { Diagnosis } from "../data/mockData";

export default function SpecialistDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [dx, setDx] = useState<Diagnosis | null>(null);
  const [checkedQ, setCheckedQ] = useState<Record<number, boolean>>({});
  const [checkedB, setCheckedB] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("tend.diagnosisData");
    if (!raw) {
      nav("/");
      return;
    }
    try {
      setDx(JSON.parse(raw));
    } catch {
      nav("/");
    }
  }, [nav]);

  if (!dx) return null;

  const s = dx.specialists.find((x) => x.id === id);

  if (!s) {
    return (
      <section className="max-w-2xl mx-auto px-6 pt-16">
        <p className="text-muted mb-4">We couldn't find that specialist.</p>
        <Link to="/dashboard" className="text-ochre underline underline-offset-4">
          Back to the dashboard
        </Link>
      </section>
    );
  }

  const idx = dx.specialists.indexOf(s);

  function find() {
    setToast(true);
    setTimeout(() => setToast(false), 3200);
  }

  return (
    <section className="max-w-2xl mx-auto px-6 pt-10 pb-6">
      <div className="stagger">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-ochre transition-colors mb-10"
        >
          <ArrowLeft size={14} strokeWidth={1.6} /> Back to where you are
        </Link>

        <div className="mb-10">
          <p className="num mb-3">
            Care team · {String(idx + 1).padStart(2, "0")} of{" "}
            {String(dx.specialists.length).padStart(2, "0")}
          </p>
          <h1 className="font-display text-5xl tracking-tighter2 text-ink leading-[1.02]">{s.role}</h1>
          <p className="mt-5 text-[1.0625rem] text-ink2 leading-[1.7] max-w-prose">{s.description}</p>
        </div>

        <article className="card mb-5">
          <header className="flex items-center gap-3 mb-5">
            <MessageCircle size={17} className="text-ochre" strokeWidth={1.6} />
            <h2 className="font-display text-2xl tracking-tighter text-ink">Questions to bring</h2>
          </header>
          <ul className="space-y-1">
            {s.questions.map((q, i) => (
              <li key={i}>
                <label className="flex gap-3 items-start py-2.5 cursor-pointer group">
                  <span
                    className={`flex-none mt-1 w-4 h-4 rounded-sm border transition-colors ${
                      checkedQ[i] ? "bg-ochre border-ochre" : "border-line group-hover:border-ochre"
                    }`}
                  >
                    {checkedQ[i] && (
                      <svg viewBox="0 0 16 16" className="w-full h-full text-bone">
                        <path
                          d="M3.5 8.5L6.5 11.5L12.5 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={!!checkedQ[i]}
                    onChange={(e) => setCheckedQ({ ...checkedQ, [i]: e.target.checked })}
                    className="sr-only"
                  />
                  <span
                    className={`text-[0.9375rem] leading-[1.65] ${
                      checkedQ[i] ? "text-muted line-through decoration-line/60" : "text-ink2"
                    }`}
                  >
                    {q}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </article>

        <article className="card mb-10">
          <header className="flex items-center gap-3 mb-5">
            <ClipboardList size={17} className="text-ochre" strokeWidth={1.6} />
            <h2 className="font-display text-2xl tracking-tighter text-ink">What to bring</h2>
          </header>
          <ul className="space-y-1">
            {s.bring.map((b, i) => (
              <li key={i}>
                <label className="flex gap-3 items-start py-2.5 cursor-pointer group">
                  <span
                    className={`flex-none mt-1 w-4 h-4 rounded-sm border transition-colors ${
                      checkedB[i] ? "bg-ochre border-ochre" : "border-line group-hover:border-ochre"
                    }`}
                  >
                    {checkedB[i] && (
                      <svg viewBox="0 0 16 16" className="w-full h-full text-bone">
                        <path
                          d="M3.5 8.5L6.5 11.5L12.5 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={!!checkedB[i]}
                    onChange={(e) => setCheckedB({ ...checkedB, [i]: e.target.checked })}
                    className="sr-only"
                  />
                  <span
                    className={`text-[0.9375rem] leading-[1.65] ${
                      checkedB[i] ? "text-muted line-through decoration-line/60" : "text-ink2"
                    }`}
                  >
                    {b}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </article>

        {/* Find a provider */}
        <div className="bg-ochre/[0.06] border border-ochre/15 rounded-lg p-7 relative">
          <p className="num mb-2">When you're ready</p>
          <h3 className="font-display text-3xl tracking-tighter2 text-ink mb-2">
            Finding the right {s.role.toLowerCase()}
          </h3>
          <p className="text-[0.9375rem] text-ink2 leading-[1.7] max-w-prose mb-6">
            When the questions feel right and the moment is right, there are good booking tools that can match you with
            a {s.role.toLowerCase()} who takes your insurance and has openings this week.
          </p>
          <button onClick={find} className="btn-primary inline-flex items-center gap-2">
            <Search size={15} strokeWidth={1.8} />
            Find a {s.role.toLowerCase()}
          </button>
          {toast && (
            <div className="mt-5 text-sm text-ochre2 italic leading-relaxed">
              In a real product, this hands off to a booking experience — same care, no broken seam.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
