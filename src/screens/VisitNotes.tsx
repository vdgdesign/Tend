import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

type Note = {
  id: string;
  date: string;
  said: string;
  decided: string;
  next: string;
  questions: string;
};

const KEY = "tend.notes";

// The "we'll surface these" promise is the loop that would make this product
// compound over time. In a real build, the dashboard would pull from these notes
// to update "the next conversation" and "on the horizon."
export default function VisitNotes() {
  const [said, setSaid] = useState("");
  const [decided, setDecided] = useState("");
  const [next, setNext] = useState("");
  const [questions, setQuestions] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setNotes(JSON.parse(raw));
    } catch {
      // ignore corrupt local storage
    }
  }, []);

  function save() {
    if (!said.trim() && !decided.trim() && !next.trim() && !questions.trim()) return;
    const n: Note = {
      id: String(Date.now()),
      date: new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
      said: said.trim(),
      decided: decided.trim(),
      next: next.trim(),
      questions: questions.trim(),
    };
    const updated = [n, ...notes];
    setNotes(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setSaid("");
    setDecided("");
    setNext("");
    setQuestions("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <section className="max-w-2xl mx-auto px-6 pt-10 pb-6">
      <div className="stagger">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ochre transition-colors mb-10">
          <ArrowLeft size={14} strokeWidth={1.6} /> Back to where you are
        </Link>

        <div className="mb-10">
          <p className="num mb-3">After the visit</p>
          <h1 className="font-display text-5xl tracking-tighter2 text-ink leading-[1.02]">How did it go?</h1>
          <p className="mt-5 text-base text-ink2 leading-relaxed max-w-prose">
            Five quiet minutes here saves an hour next week. You don't need full sentences — fragments are fine, and so is leaving fields blank.
          </p>
        </div>

        <div className="space-y-7 mb-8">
          <div>
            <label className="num block mb-2">i. What was said</label>
            <textarea
              className="input"
              rows={4}
              placeholder="The big things you heard. Don't worry about getting it perfect."
              value={said}
              onChange={(e) => setSaid(e.target.value)}
            />
          </div>

          <div>
            <label className="num block mb-2">ii. What was decided</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Treatments, tests, referrals, next appointment…"
              value={decided}
              onChange={(e) => setDecided(e.target.value)}
            />
          </div>

          <div>
            <label className="num block mb-2">iii. What's next</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Appointments to book, results to wait for, calls to return…"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </div>

          <div>
            <label className="num block mb-2">iv. Questions that came up</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Anything you wish you'd asked, or want to ask next time."
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button onClick={save} className="btn-primary">Save these notes</button>
          {saved && (
            <span className="text-sm text-sage inline-flex items-center gap-2">
              <Check size={14} strokeWidth={2} />
              Saved. We'll bring these forward next time.
            </span>
          )}
        </div>

        {notes.length > 0 && (
          <>
            <div className="rule my-12" />
            <div>
              <p className="num mb-4">Earlier visits</p>
              <ul className="space-y-1">
                {notes.map((n) => {
                  const open = expanded === n.id;
                  const preview = n.said || n.decided || n.next || n.questions;
                  return (
                    <li key={n.id} className="border-b border-line/70 last:border-b-0">
                      <button
                        onClick={() => setExpanded(open ? null : n.id)}
                        className="w-full text-left py-4 flex items-baseline gap-5 hover:bg-bone2/50 -mx-3 px-3 rounded transition-colors"
                      >
                        <span className="num flex-none w-24">{n.date}</span>
                        <span className="text-sm text-ink2 truncate">{preview.slice(0, 90)}{preview.length > 90 ? "…" : ""}</span>
                      </button>
                      {open && (
                        <div className="px-3 pb-6 grid gap-4 text-sm text-ink2 leading-relaxed">
                          {n.said && <div><p className="num mb-1">Said</p><p className="whitespace-pre-wrap">{n.said}</p></div>}
                          {n.decided && <div><p className="num mb-1">Decided</p><p className="whitespace-pre-wrap">{n.decided}</p></div>}
                          {n.next && <div><p className="num mb-1">Next</p><p className="whitespace-pre-wrap">{n.next}</p></div>}
                          {n.questions && <div><p className="num mb-1">Questions</p><p className="whitespace-pre-wrap">{n.questions}</p></div>}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}

        {notes.length === 0 && (
          <p className="text-sm text-muted italic mt-10">Your earlier visit notes will appear here.</p>
        )}
      </div>
    </section>
  );
}
