# Tend

*A quiet place to keep track of the care you're giving to someone else.*

🌿 **Live at [tend-app-one.vercel.app](https://tend-app-one.vercel.app)**

---

## Why I built this

Most healthcare products start and end at the booking screen. But if you've ever helped someone close to you through a real diagnosis, you find out pretty fast that finding a doctor is the easy part. The hard part is everything that orbits it — the question you didn't think to ask in the appointment, the kind of specialist you've never heard of, the family member halfway across the world who wants to be useful and has no idea where to start.

And the person navigating all of that is usually not the one who's sick. It's a partner, a daughter, a son, sometimes an aunt on the phone from another country. They carry the whole map in their head while the patient just tries to make it through the week.

I wanted to prototype what the existing healthcare-booking experience could look like if it actually centered the caregiver — not as a secondary tab inside a flow built for patients. This is a weekend build, deliberately small, focused on three design questions:

1. **How do you onboard someone in crisis without asking for an account?** Value first, identity later. Tend asks for three pieces of information — who you're caring for, what they're navigating, and (optionally) where you are — then gets out of the way.
2. **How do you make "share with family" feel native instead of bolted-on?** Care decisions are rarely held by one person. The share flow drafts a message you can copy, edit, and send through whatever channel actually reaches your family — text, WhatsApp, email — rather than locking you into one.
3. **How do you write microcopy that respects the emotional state of the reader?** Every label, button, and empty state in Tend was written, read aloud, and rewritten. No "Welcome!" No "Awesome." No exclamation points where they don't belong.

## What's in it

- **Onboarding** — three questions, no account.
- **AI-generated care plans** — instead of hardcoded mock data, Tend uses `gpt-4o` to generate a specific care navigation guide for whatever condition you type, tailored to your location when you share it. Diabetes in Mumbai gets different specialists and resources than ALS in San Francisco.
- **The next conversation** — what the doctor will likely ask, and what's worth asking them.
- **The care team you'll likely need** — specialist briefs with what each role does, what to ask, and what to bring.
- **On the horizon** — a 30/60/90-day map of what typically happens, so the road ahead feels less unknown.
- **For you, the caregiver** — a small card written directly to the person doing the holding, not the person being held. The therapist voice, not the doctor voice.
- **Share an update** — a pre-drafted, editable message designed to inform family without alarming them or inviting unsolicited advice.
- **Visit notes** — four soft prompts after each appointment. Saved locally. In a real build, this is the loop that would let the dashboard get smarter over time.

## A note on what it isn't

Tend doesn't try to be a medical record, a chat-with-AI feature, or a diagnostic tool. It is a UX prototype to explore one specific question: *what does the surface of care look like when the user is the person doing the holding, not the person being held?*

## Running it locally

```bash
npm install
npm run dev
```

To enable the AI-generated care plans, create a `.env.local` file with:

```
OPENAI_API_KEY=sk-...
```

Then open the local URL Vite prints. Without the key, the app still runs but shows an "add your key" message after onboarding.

## Deploying

The project is wired for one-command deploys to Vercel:

```bash
npm run deploy
```

This commits any pending changes, pushes to GitHub, and ships to production in about 30 seconds. Set `OPENAI_API_KEY` once in the Vercel dashboard (Settings → Environment Variables) and it stays there.

## Stack

Vite · React · TypeScript · Tailwind · React Router · lucide-react · OpenAI `gpt-4o`.

The AI call lives in a tiny serverless function (`api/generate.ts`) so the key never touches the browser. In local dev, the same endpoint is served by a Vite middleware — same code path, same URL, zero environment-specific glue.

## Design system

- **Display:** Fraunces (variable, soft-serif, used for everything that should feel warm)
- **Body:** Inter Tight (used for everything that should feel calm and readable)
- **Palette:** bone, ink, ochre, sage — warm and quiet, deliberately not "medical blue"
- **Animation:** gentle staggered rise on each section, a 30/60ms cadence that feels less like an app loading and more like a page being set down

## What I'd build next

- A **second-opinion flow** with the same restraint.
- A **clinical-trials surface**, written for caregivers rather than researchers. *(This is the part I have the most to say about — happy to walk through it.)*
- A **provider-side view**: what your caregiver-bookers are reading before they walk in.
- **Memory** — the visit-notes loop quietly informing the "next conversation" card, so the product compounds over time.

---

*A prototype, not a product. Built to think through what care could feel like for the people doing the holding.*
