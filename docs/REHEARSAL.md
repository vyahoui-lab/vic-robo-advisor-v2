# Pre-Demo Rehearsal Checklist

Do these on the presentation laptop **before** class.

## 1. Rotate the DeepSeek API key

The key used during development was pasted in a chat transcript and must be considered leaked.

- Log into the DeepSeek console → invalidate the old key.
- Create a fresh key.
- Paste it into `.env` on the presentation laptop:
  ```
  OPENAI_API_KEY=sk-<new-key>
  OPENAI_BASE_URL=https://api.deepseek.com/v1
  OPENAI_MODEL=deepseek-chat
  ```
- `.env` is gitignored — never commit it.

## 2. Pre-warm the live LLM path

On the presentation laptop:

```bash
cd /path/to/Robot-Advisor
npm install
npm run dev
```

Open `http://localhost:3000` in the browser.

For each persona (Marco / Zoë / Dragan):
- Click the persona card
- Click **Get my plan**
- Wait for advice to render (should be <5s)
- Open Ethics Lab drawer, flip all four toggles, reset

If any persona errors out live, the API route falls back to the cached outputs in `lib/fallback.ts` — the demo still runs. To force-test the fallback path: temporarily set an invalid key in `.env` and submit again; you should see the fallback rendering.

## 3. Projector check

- Open the app on the external display.
- Confirm text is readable at ~2 m distance.
- Confirm the Ethics Lab drawer is visible against the projector contrast (dark slate theme should be fine).
- Confirm toggle switches are large enough to see from the back of the room.

## 4. Narration beats (2-minute demo window)

Suggested cadence:

| Time | What happens | What you say |
|---|---|---|
| 0:00–0:20 | Volunteer gives info, or you click a persona card | "Let's pretend you want to invest. Just a few questions." |
| 0:20–0:30 | Advisor card streams, plan renders | "This is what a normal robo-advisor looks like." |
| 0:30–0:40 | Open **🔬 Ethics Lab** drawer | "And this is what's *actually* happening behind the scenes." |
| 0:40–0:55 | Flip **Exclusion bias** OFF | "§2.1 — the system assumed the user was a finance student. For someone who isn't, the jargon becomes barriers. Plain language changes the experience." |
| 0:55–1:10 | Flip **Literacy erosion** OFF | "§2.2 — automation substitutes for understanding. Honest advice explains the *why*, the alternatives, and what things cost." |
| 1:10–1:30 | Flip **Fiduciary opacity** OFF | "§2.3 — the Schwab case. 17% of your portfolio was sitting in cash earning the platform money, undisclosed. When we disclose it, the effective cost triples." |
| 1:30–1:45 | Flip **Surveillance** OFF | "§2.4 — the platform wasn't just managing a portfolio, it was a data-collection system. Most of what it captured wasn't needed to advise you." |
| 1:45–2:00 | Click **Reset all biases to ON** | "Flip a switch and we're back. That's the myth of democratisation — cheaper access, but the structural problems don't go away unless someone actively fixes them." |
