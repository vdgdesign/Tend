import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { generateDiagnosis } from "../lib/generateDiagnosis";

type LoadingPhase = "thinking" | "mapping" | "finishing";

const LOADING_MESSAGES: Record<LoadingPhase, string> = {
  thinking: "Reading what you've shared…",
  mapping: "Drawing a picture of what's ahead.",
  finishing: "Almost there — putting it together.",
};

export default function Onboarding() {
  const [relationship, setRelationship] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("thinking");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const ready = relationship.trim().length > 0 && diagnosis.trim().length > 0;

  async function submit() {
    if (!ready || loading) return;
    setError("");
    setLoading(true);
    setLoadingPhase("thinking");

    const phaseTimer1 = setTimeout(() => setLoadingPhase("mapping"), 2000);
    const phaseTimer2 = setTimeout(() => setLoadingPhase("finishing"), 6000);

    try {
      sessionStorage.setItem("tend.relationship", relationship.trim());
      sessionStorage.setItem("tend.diagnosis", diagnosis.trim());
      if (location.trim()) sessionStorage.setItem("tend.location", location.trim());
      sessionStorage.removeItem("tend.diagnosisData");

      const data = await generateDiagnosis(diagnosis.trim(), location.trim() || undefined);
      sessionStorage.setItem("tend.diagnosisData", JSON.stringify(data));
      nav("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("OPENAI_API_KEY")
          ? "No API key found. Add OPENAI_API_KEY to your .env.local file to generate a real care plan."
          : "Something went wrong generating your care plan. Please try again."
      );
      setLoading(false);
    } finally {
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-inner">
          <div className="font-display text-5xl text-ink mb-10 tracking-tighter2">
            Tend<span className="text-ochre">.</span>
          </div>
          <p className="text-base text-ink2 leading-relaxed mb-8 max-w-xs text-center">
            {LOADING_MESSAGES[loadingPhase]}
          </p>
          <div className="loading-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="stagger">
          <div className="mb-12">
            <div className="font-display text-7xl text-ink leading-[0.95] tracking-tighter2">
              Tend<span className="text-ochre">.</span>
            </div>
            <p className="mt-5 text-[1.0625rem] text-ink2 leading-[1.7] max-w-sm">
              A quiet place to keep track of the care you're giving to someone else.
            </p>
            <p className="mt-2 text-sm text-muted leading-relaxed max-w-sm">
              Three questions, then we'll find you a starting point.
            </p>
          </div>

          <div>
            <label className="num block mb-1.5">i. The person</label>
            <input
              className="input"
              placeholder="My mom, my husband, my dad…"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoFocus
            />
          </div>

          <div className="mt-8">
            <label className="num block mb-1.5">ii. What they're navigating</label>
            <input
              className="input"
              placeholder="A diagnosis, a condition, a recent test result…"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <p className="mt-2.5 text-xs text-muted leading-relaxed">
              Plain words are enough. You don't need the medical name.
            </p>
          </div>

          <div className="mt-8">
            <label className="num block mb-1.5">
              iii. Where you are{" "}
              <span className="opacity-50 normal-case not-italic tracking-normal font-sans text-xs text-muted ml-1">
                (optional)
              </span>
            </label>
            <div className="relative">
              <MapPin
                size={15}
                strokeWidth={1.6}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                className="input pl-6"
                placeholder="City, state, or country…"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
            <p className="mt-2.5 text-xs text-muted leading-relaxed">
              Helps us tailor resources and specialist guidance to your area.
            </p>
          </div>

          {error && (
            <p className="mt-6 text-sm text-[#b34a2a] bg-[#b34a2a]/[0.06] border border-[#b34a2a]/20 rounded-md px-4 py-3 leading-relaxed">
              {error}
            </p>
          )}

          <div className="mt-12 flex items-center gap-4 flex-wrap">
            <button className="btn-primary" disabled={!ready} onClick={submit}>
              Find a starting point
            </button>
            <span className="text-xs text-muted leading-relaxed">No account. Nothing leaves this device.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
