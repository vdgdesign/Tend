import { useEffect, useState } from "react";
import { X, Copy, Check, Mail } from "lucide-react";

const TO_EMAIL = "vamsi.deepak@gmail.com";

type Props = {
  open: boolean;
  onClose: () => void;
  relationship: string;
  userDx: string;
  nextSpecialist: string;
};

// The pre-filled text is the design. It models how to tell family what's happening
// without alarming them or inviting unsolicited advice. Copy-paste is intentional:
// it gives the caregiver control over the channel (WhatsApp to a sibling in Mumbai,
// text to a parent, email to a cousin) and the timing.
export default function ShareModal({ open, onClose, relationship, userDx, nextSpecialist }: Props) {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    if (open) {
      setText(
        `A quick update on ${relationship.toLowerCase()}.\n\nWe're working through ${userDx}. The next step is a consult with a ${nextSpecialist} — I'm putting questions together and will share what we learn after.\n\nIf you want to help right now, the most useful thing is just checking in. No need to weigh in on decisions yet; I'll let you know when there's something to decide.\n\nMore soon.`
      );
      setCopied(false);
      setSent(false);
      setSendError("");
    }
  }, [open, relationship, userDx, nextSpecialist]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendEmail() {
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: `Update on ${relationship}`, text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to send" }));
        throw new Error(err.error || "Failed to send");
      }
      setSent(true);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FFFDF8] border border-line rounded-md max-w-xl w-full p-8 shadow-2xl shadow-ink/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-muted hover:text-ink transition-colors" aria-label="Close">
          <X size={18} strokeWidth={1.6} />
        </button>

        <p className="num mb-2">A note for family</p>
        <h3 className="font-display text-3xl tracking-tighter2 text-ink mb-2">Share an update</h3>
        <p className="text-sm text-muted mb-6 leading-relaxed">
          A draft you can send in your own words, on your own time. Copy it, edit it, choose your channel.
        </p>

        <textarea
          className="input"
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {sendError && (
          <p className="mt-4 text-sm text-[#b34a2a] bg-[#b34a2a]/[0.06] border border-[#b34a2a]/20 rounded-md px-4 py-3 leading-relaxed">
            {sendError}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
          <button onClick={onClose} className="btn-ghost">Close</button>
          <div className="flex items-center gap-2">
            <button onClick={copy} className="btn-ghost inline-flex items-center gap-2">
              {copied ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={1.8} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={sendEmail}
              disabled={sending || sent}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              {sent ? <Check size={15} strokeWidth={2} /> : <Mail size={15} strokeWidth={1.8} />}
              {sending ? "Sending…" : sent ? "Sent" : "Send email"}
            </button>
          </div>
        </div>
        {sent && (
          <p className="mt-3 text-xs text-muted text-right">
            Sent to {TO_EMAIL}
          </p>
        )}
      </div>
    </div>
  );
}
