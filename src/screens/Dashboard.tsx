import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Users, Compass, ArrowUpRight, MessageSquare, Heart } from "lucide-react";
import type { Diagnosis } from "../data/mockData";
import { generateDiagnosis } from "../lib/generateDiagnosis";
import ShareModal from "../components/ShareModal";

function SkeletonLine({ w = "w-full", h = "h-4" }: { w?: string; h?: string }) {
  return <div className={`skeleton rounded-sm ${w} ${h}`} />;
}

function DashboardSkeleton() {
  return (
    <section className="max-w-3xl mx-auto px-6 pt-12 pb-6">
      <div className="mb-10">
        <SkeletonLine w="w-24" h="h-3" />
        <div className="mt-4 space-y-3">
          <SkeletonLine w="w-3/4" h="h-10" />
          <SkeletonLine w="w-full" h="h-4" />
          <SkeletonLine w="w-5/6" h="h-4" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card mb-5">
          <div className="flex items-center gap-3 mb-5">
            <SkeletonLine w="w-4" h="h-4" />
            <SkeletonLine w="w-40" h="h-6" />
          </div>
          <div className="space-y-3">
            <SkeletonLine />
            <SkeletonLine w="w-5/6" />
            <SkeletonLine w="w-4/6" />
          </div>
        </div>
      ))}
    </section>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const [relationship, setRelationship] = useState("");
  const [userDx, setUserDx] = useState("");
  const [dx, setDx] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const r = sessionStorage.getItem("tend.relationship");
    const d = sessionStorage.getItem("tend.diagnosis");
    if (!r || !d) {
      nav("/");
      return;
    }
    setRelationship(r);
    setUserDx(d);

    const cached = sessionStorage.getItem("tend.diagnosisData");
    if (cached) {
      try {
        setDx(JSON.parse(cached));
        setLoading(false);
        return;
      } catch {
        // fall through to generate
      }
    }

    const loc = sessionStorage.getItem("tend.location") || undefined;
    generateDiagnosis(d, loc)
      .then((data) => {
        sessionStorage.setItem("tend.diagnosisData", JSON.stringify(data));
        setDx(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not generate care plan.");
        setLoading(false);
      });
  }, [nav]);

  if (!relationship) return null;
  if (loading) return <DashboardSkeleton />;

  if (error || !dx) {
    return (
      <section className="max-w-2xl mx-auto px-6 pt-16">
        <p className="text-base text-ink2 leading-relaxed mb-4">
          We weren't able to generate a care plan right now.
        </p>
        <p className="text-sm text-muted mb-6 bg-bone2 rounded-md px-4 py-3 leading-relaxed font-mono">
          {error || "Unknown error"}
        </p>
        <button className="btn-primary" onClick={() => nav("/")}>
          Go back and try again
        </button>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-6 pt-12 pb-6">
      <div className="stagger">
        <div className="mb-10">
          <p className="num mb-3">For {relationship.toLowerCase()}</p>
          <h1 className="font-display text-5xl md:text-6xl tracking-tighter2 text-ink leading-[1.02]">
            Here's where you are.
          </h1>
          <p className="mt-5 text-[1.0625rem] text-ink2 leading-[1.7] max-w-xl">
            Based on <span className="italic">{userDx}</span>, we've put together a starting picture for{" "}
            <span className="italic">{dx.name}</span>. Treat it as a draft, not a verdict.
          </p>
          {dx.summary && (
            <div className="mt-6 pl-5 border-l-2 border-ochre/30">
              <p className="text-[0.95rem] text-ink2 leading-[1.75]">{dx.summary}</p>
            </div>
          )}
        </div>

        {/* Card 1 — Next conversation */}
        <article className="card mb-5">
          <header className="flex items-center gap-3 mb-6">
            <Calendar size={17} className="text-ochre" strokeWidth={1.6} />
            <h2 className="font-display text-2xl tracking-tighter text-ink">The next conversation</h2>
          </header>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="num mb-3">They'll likely ask you</p>
              <ul className="space-y-3">
                {dx.conversation.theyAsk.map((q) => (
                  <li key={q} className="flex gap-3 text-[0.9375rem] text-ink2 leading-[1.65]">
                    <span className="text-ochre/70 mt-[0.35rem] flex-none text-xs">◆</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="num mb-3">Worth asking them</p>
              <ul className="space-y-3">
                {dx.conversation.youAsk.slice(0, 5).map((q) => (
                  <li key={q} className="flex gap-3 text-[0.9375rem] text-ink2 leading-[1.65]">
                    <span className="text-ochre/70 mt-[0.35rem] flex-none text-xs">◆</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        {/* Card 2 — Specialists */}
        <article className="card mb-5">
          <header className="flex items-center gap-3 mb-6">
            <Users size={17} className="text-ochre" strokeWidth={1.6} />
            <h2 className="font-display text-2xl tracking-tighter text-ink">The care team you'll likely need</h2>
          </header>
          <ul className="divide-y divide-line">
            {dx.specialists.map((s, idx) => (
              <li key={s.id}>
                <Link
                  to={`/specialist/${s.id}`}
                  className="group flex items-start justify-between gap-6 py-4 hover:bg-bone2/60 -mx-4 px-4 rounded-md transition-colors"
                >
                  <div className="flex gap-4">
                    <span className="num pt-1 w-6 flex-none">{String(idx + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="font-display text-xl text-ink tracking-tighter group-hover:text-ochre transition-colors">
                        {s.role}
                      </div>
                      <div className="text-sm text-muted mt-0.5 leading-relaxed max-w-md">{s.oneLine}</div>
                    </div>
                  </div>
                  <ArrowUpRight
                    size={17}
                    className="text-muted group-hover:text-ochre group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-none mt-1"
                    strokeWidth={1.6}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </article>

        {/* Card 3 — Horizon */}
        <article className="card mb-5">
          <header className="flex items-center gap-3 mb-6">
            <Compass size={17} className="text-ochre" strokeWidth={1.6} />
            <h2 className="font-display text-2xl tracking-tighter text-ink">On the horizon</h2>
          </header>
          <div className="space-y-6">
            {dx.horizon.map((h, i) => (
              <div key={h.label} className="grid grid-cols-[120px_1fr] gap-6">
                <div>
                  <p className="num">{h.label}</p>
                  <div className={`mt-2 w-8 h-px ${i === 0 ? "bg-ochre" : i === 1 ? "bg-ochre/50" : "bg-ochre/25"}`} />
                </div>
                <p className="text-[0.9375rem] text-ink2 leading-[1.75]">{h.body}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Card 4 — For the caregiver */}
        {dx.selfCare && (
          <article className="card mb-10 bg-ochre/[0.04] border-ochre/20">
            <header className="flex items-center gap-3 mb-4">
              <Heart size={17} className="text-ochre" strokeWidth={1.6} />
              <h2 className="font-display text-2xl tracking-tighter text-ink">For you, the caregiver</h2>
            </header>
            <p className="text-[0.9375rem] text-ink2 leading-[1.75] max-w-prose">{dx.selfCare}</p>
          </article>
        )}

        {/* Bring others in */}
        <div className="rule mb-8" />
        <div className="text-center max-w-lg mx-auto mb-10">
          <p className="font-display italic text-xl text-ink2 tracking-tightish mb-3">
            Care is rarely held by one person.
          </p>
          <p className="text-sm text-muted leading-relaxed mb-5">
            Send a short, honest update to family — at home or across time zones — without inviting a flood of advice.
          </p>
          <button onClick={() => setShareOpen(true)} className="btn-outline inline-flex items-center gap-2">
            <MessageSquare size={15} strokeWidth={1.7} />
            Share an update
          </button>
        </div>

        <div className="text-center">
          <Link
            to="/visit-notes"
            className="text-sm text-muted hover:text-ochre transition-colors underline underline-offset-4 decoration-line"
          >
            Log notes from a visit →
          </Link>
        </div>
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        relationship={relationship}
        userDx={userDx}
        nextSpecialist={dx.specialists[0]?.role.toLowerCase() ?? "specialist"}
      />
    </section>
  );
}
