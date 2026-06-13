# Robo-Advisor Demo — Design Spec

**Date:** 2026-04-21
**Author:** Gian (with Claude)
**Purpose:** Build an interactive classroom demo that exposes the four ethical dilemmas identified in the group's "Robo-Advisors and the Myth of Democratised Investment" case study, runnable live in a 15-minute HSG presentation (course: *Big Data, AI and the Algorithmic Society*).

---

## 1. Context & Goals

The presentation (`docs/robo_advisory_refined_outline (1).docx`) analyses four ethical challenges in algorithmic financial advisory:

1. **Exclusion paradox** — bias under the democratisation narrative (§2.1)
2. **Financial literacy erosion** — passivity through over-automation (§2.2)
3. **Fiduciary conflicts & opacity** — Schwab cash-drag case (§2.3)
4. **Surveillance capitalism** — behavioural data extraction (§2.4)

The demo must:

- **Feel like a real modern (Generation-3) robo-advisor** at first glance — clean fintech UI, LLM-generated advisor voice, streamed conversational commentary.
- **Let a volunteer from class give personal information** (hybrid form + free-text) and receive real-looking advice.
- **Reveal the four dilemmas on demand** via an instructor-operated "Ethics Lab" drawer, with each dilemma independently toggleable to demonstrate mitigation (mapping to §3).
- **Be fast and reliable live** — under ~5s from submit to advice; toggles must respond instantly with no re-call to the LLM.

### Success criteria

- The volunteer experience feels indistinguishable from a mainstream robo-advisor until the reveal.
- Flipping each of the four toggles produces a visible, specific UI change that maps 1:1 to an outline §2 dilemma.
- The full demo (submit → advice → reveal → flip toggles) fits comfortably inside 2 minutes of the 15-minute presentation.
- No live LLM call happens during the toggle-flipping phase; advice is pre-generated at submit.

### Non-goals (YAGNI)

- Real brokerage integration, real portfolio math beyond the deterministic rules below, multi-user accounts, persistence beyond the current session, authentication, mobile responsiveness beyond "looks OK on a projector."
- Actually performing Modern Portfolio Theory optimisation — allocations are hard-coded rules sufficient to illustrate the ethical points.
- Cross-browser testing beyond the presenter's laptop.

---

## 2. Demo Narrative

A single live run goes through four phases:

| Phase | What the class sees | Instructor action | Purpose |
|---|---|---|---|
| 1. Intake | Volunteer fills a 5-field form plus one free-text goal field (or picks a pre-loaded persona). | Guide volunteer through form, or click a persona card. | Establishes "realism" — feels like any normal onboarding. |
| 2. Advice | Clean advisor page streams an LLM-generated greeting + portfolio allocation chart + short confident summary. | Pause, let it land — "this is what the user sees." | Primes audience that the advisor looks polished and helpful. |
| 3. Reveal | A "🔬 Ethics Lab" button in the header opens a drawer from the right. Four dilemma toggles (all ON in red), captured-data panel, active system-prompt excerpt. | Click reveal. Narrate: "This is what was actually happening." | The curtain-pulling moment. |
| 4. Mitigate | Flip toggles one by one. Each flip changes a specific UI element. | Flip toggles, narrating each mapping to §3 of the case study. | Pedagogy: makes §2 problems and §3 mitigations concrete. |

---

## 3. The Four Dilemmas (Detailed Behaviour)

All four toggles start **ON** (dilemma active). Flipping OFF applies mitigation.

### Dilemma 1 — Exclusion bias (§2.1)

- **ON:** LLM system prompt fragment: *"Assume the user is digitally fluent and finance-aware. Use investment jargon without defining it (alpha, direct indexing, tax-loss harvesting, rebalancing). Frame risk framing for experienced investors. Do not offer accessibility accommodations."* Minimum deposit displayed as **CHF 500+**. Jargon tokens in the returned text are marked by the LLM with `[[term]]` so the UI can detect them.
- **OFF (mitigated):** LLM fragment switches to *"Use plain language. Define any term an everyday adult may not know, inline, in parentheses. Frame risk in life-situation terms, e.g. 'Could you handle your CHF X dropping by half for two years without panic?' Minimum deposit displayed as CHF 50."*
- **UI effect:** the `[[term]]` tokens in whatever text is currently displayed (biased or mitigated) are replaced with inline plain-language glosses from `jargon_glossary`. Minimum-deposit label swaps from CHF 500+ to CHF 50.

### Dilemma 2 — Financial literacy erosion (§2.2)

- **ON:** LLM fragment: *"Keep all explanations under 30 words. Use confident, reassuring tone. Do not mention alternatives, trade-offs, or what could go wrong. No education, only recommendation."*
- **OFF:** Fragment: *"For each allocation decision, explain (a) what was recommended, (b) why in plain language, (c) what the alternative would be, (d) what this costs or earns in concrete CHF terms. Include one 'Did you know?' inline education card."*
- **UI effect:** this is the toggle that controls **which pre-generated LLM response version is rendered**. ON → render the biased version (`terse_summary` field). OFF → render the mitigated version (`detailed_explanation` + `did_you_know` card). Toggle 1's jargon-gloss overlay is then applied on top of whichever text is showing.

### Dilemma 3 — Fiduciary opacity (§2.3, Schwab case)

- **ON:** Deterministic allocation always includes **17% cash** (matching the Schwab mid-point from the SEC settlement). Fee panel shows only "0.25%/yr advisory." LLM does not mention platform earns interest on cash. Objective function label hidden.
- **OFF:** Cash drops to **2%** (reclaimed into equities/bonds per risk profile). Expanded fee panel shows concrete math for the current portfolio, e.g., for Marco (CHF 85k invested): "0.25% advisory (CHF 213/yr) + ~3% spread on 17% cash (CHF 434/yr hidden revenue) ≈ **effective cost 0.76% or CHF 647/yr**." A labelled chip appears: *"Optimised for: platform revenue → your risk-adjusted return"*.
- **UI effect:** allocation donut chart re-renders (cash slice shrinks, equity slice grows). Hidden fee accordion expands. Objective-function chip flips.

### Dilemma 4 — Surveillance capitalism (§2.4)

- **ON:** Ethics Lab panel displays rich capture: every form field + `time_on_form` + `edits_made` + free-text parsed into inferred signals (e.g., `first_time_investor=true`, `anxiety_markers=["safely"]`, `sustainability_preference=true`, `migration_signal=true`). Listed uses: *"model training, cross-sell targeting, third-party partner sharing."*
- **OFF:** Panel shrinks to only the mathematically-necessary fields (age, risk, horizon, income). Two columns appear: *"Used for your recommendation"* vs *"Previously captured — will not be stored"* (with strikethrough). Consent prompt mockup appears: *"We only keep what we need. You can opt in for personalised insights."*
- **UI effect:** capture panel visibly shrinks with a short animation. Data rows fade / strike through.

---

## 4. UI / UX Design

Structure matches the validated wireframe at `.superpowers/brainstorm/53158-1776789202/content/layout-concept.html` (option B — hidden drawer).

### 4.1 Layout

- **Header:** brand ("Lumina Wealth"), persona selector dropdown, **🔬 Ethics Lab** button (far right, muted until clicked).
- **Main view (consumer-facing):**
  - Landing → intake form (5 fields + free-text) → submit.
  - Advice page: advisor greeting card (LLM-streamed), allocation donut chart, "Why this plan" section, fee/CTA row.
- **Ethics Lab drawer (hidden by default):** slides in from the right, 40% viewport width, dark theme (contrasts the consumer UI).
  - Top: header "⚙ Ethics Lab — Instructor reveal"
  - Section 1: **Four dilemma toggles** (each with a coloured state chip and a one-line description).
  - Section 2: **Data captured this session** — live panel.
  - Section 3: **Active system prompt (excerpt)** — syntax-highlighted code block showing the composed prompt with ON/OFF fragments.

### 4.2 Form fields (intake)

- `age` (number)
- `annual_income_chf` (number)
- `savings_goal` (select: house down payment / retirement / travel / general growth / other)
- `horizon_years` (number, 1-30)
- `risk_tolerance` (slider, 1-10)
- `free_text_goal` (textarea, "Tell us what brings you here today" — 1-3 sentences)

### 4.3 Pre-loaded personas

Stored in `lib/personas.ts`. Clicking a persona card fills the form with these values:

```ts
{
  marco: { age: 26, annual_income_chf: 85000, savings_goal: "house", horizon_years: 5, risk_tolerance: 8, free_text_goal: "Been watching markets for years — want to grow aggressively for a Zurich property down payment." },
  zoe:   { age: 24, annual_income_chf: 18000, savings_goal: "general", horizon_years: 10, risk_tolerance: 4, free_text_goal: "I inherited CHF 15,000 from my grandmother. I don't really understand stocks but I care about sustainability." },
  dragan:{ age: 28, annual_income_chf: 22000, savings_goal: "retirement", horizon_years: 15, risk_tolerance: 3, free_text_goal: "I moved to Switzerland for my degree with savings from my previous job. I want to invest, but safely." }
}
```

### 4.4 Streaming / perceived-speed

On submit:
- Show a brief "Lumi is thinking…" shimmer while both LLM calls fire in parallel.
- As soon as the **biased** response starts streaming, render tokens character-by-character in the greeting card (feels like Generation-3 GenAI advisor).
- The **mitigated** response is generated silently in the background and cached in component state.
- Toggles use cached state — no network call on flip.

---

## 5. System Architecture

### 5.1 Component layout (Next.js App Router)

```
app/
  page.tsx                    # Landing → form
  advice/page.tsx             # Advice + Ethics Lab drawer
  api/advise/route.ts         # POST: fires both LLM calls in parallel, returns {biased, mitigated}
  layout.tsx                  # Shell, theme
components/
  IntakeForm.tsx              # 5-field form + free-text + persona cards
  AdvisorCard.tsx             # Greeting + streamed LLM output
  AllocationChart.tsx         # Donut chart, reacts to toggle #3
  WhyThisPlan.tsx             # Long/short explanation, reacts to toggles #1 and #2
  FeePanel.tsx                # Reacts to toggle #3
  EthicsLabDrawer.tsx         # Contains toggles + captured data + prompt viewer
  DilemmaToggle.tsx           # Individual toggle row
  CapturedDataPanel.tsx       # Reacts to toggle #4
  SystemPromptViewer.tsx      # Composes prompt live from toggle state
lib/
  personas.ts                 # Three hard-coded personas
  prompts.ts                  # System-prompt fragments (biased vs mitigated, per dilemma)
  allocation.ts               # Deterministic allocation rules (biased vs mitigated math)
  llm.ts                      # OpenAI-compatible client, configured for DeepSeek baseURL
  capture.ts                  # Parses form+free-text into captured-data object
  types.ts                    # Shared types: Persona, AdviceOutput, ToggleState, etc.
```

### 5.2 Data flow

1. User submits form → client POST to `/api/advise` with form data.
2. Server composes two system prompts: fully-biased, fully-mitigated.
3. Server fires both LLM calls in parallel (`Promise.all`). Returns `{ biased: {...}, mitigated: {...} }`.
4. Client holds both in component state. Renders biased by default.
5. Toggle state is local React state: `{ exclusion: true, literacy: true, opacity: true, surveillance: true }` (all ON at first).
6. Each UI component subscribes to the relevant toggle and picks biased-or-mitigated content / math.

### 5.3 LLM response schema (structured output)

Both LLM calls return JSON matching this shape:

```ts
type AdviceOutput = {
  greeting: string;             // 1-2 sentence personalised greeting
  terse_summary: string;        // <30 words, biased mode
  detailed_explanation: string; // 80-150 words, mitigated mode (each call produces both; UI picks which to show)
  did_you_know: string;         // education nugget, shown only in mitigated-literacy mode
  jargon_glossary: Record<string, string>;  // term → plain-language definition (used to render tooltips in mitigated-exclusion mode)
  objective_function_label: "platform_revenue" | "client_risk_adjusted_return";
};
```

### 5.3.1 Toggle → rendering rules

Exactly which fields are shown is driven by this table:

| UI element | Biased state (ON) | Mitigated state (OFF) | Controlled by |
|---|---|---|---|
| Greeting text | `biased.greeting` | `mitigated.greeting` | Toggle 2 (literacy) |
| Main advice body | `biased.terse_summary` | `mitigated.detailed_explanation` + `mitigated.did_you_know` card | Toggle 2 (literacy) |
| Jargon rendering on the above body | `[[term]]` rendered as plain inline text | `[[term]]` replaced with `term (plain-language gloss)` from `jargon_glossary` | Toggle 1 (exclusion) |
| Min-deposit label | "CHF 500+" | "CHF 50" | Toggle 1 (exclusion) |
| Allocation donut | 17% cash mix | 2% cash mix | Toggle 3 (opacity) |
| Fee panel | "0.25%/yr" only | Full effective-cost breakdown with hidden-revenue line | Toggle 3 (opacity) |
| Objective-function chip | Hidden | Shown: "Optimised for client risk-adjusted return" | Toggle 3 (opacity) |
| Captured-data panel | Full extended capture | Minimal necessary capture + consent prompt | Toggle 4 (surveillance) |

This means toggles 1 and 2 do NOT both mutate the same text — they control different aspects (which version vs. how jargon in it is rendered), so mixed toggle states are always coherent.

### 5.4 Deterministic allocation (dilemma 3)

```ts
function computeAllocation(risk: number, opacityOn: boolean) {
  const equityBase = 0.3 + risk * 0.05;       // e.g., risk 8 → 70%
  const cashShare  = opacityOn ? 0.17 : 0.02; // the Schwab case vs. honest
  const bondShare  = 1 - equityBase - cashShare;
  return {
    us_equity:  equityBase * 0.7,
    intl_equity:equityBase * 0.3,
    bonds:      bondShare,
    cash:       cashShare,
  };
}
```

Hidden-revenue calculation (shown in mitigated mode): `hidden_revenue_chf_yr = portfolio_value * cash_share * 0.03` (assumed 3% spread captured by platform).

---

## 6. LLM Prompt Design

### 6.1 Prompt composition

A base system prompt is always present. Four mutually-exclusive fragment pairs are appended per toggle state:

```
[BASE] You are Lumi, an AI advisor for Lumina Wealth. Output strict JSON matching the AdviceOutput schema (fields: greeting, terse_summary, detailed_explanation, did_you_know, jargon_glossary, objective_function_label). Mark any finance jargon in your prose with double square brackets, e.g. [[tax-loss harvesting]], and include a plain-language definition for each flagged term in jargon_glossary.

[DILEMMA 1 — Exclusion]
  ON:  "Assume the user is digitally fluent and finance-aware. Use jargon freely..."
  OFF: "Use plain language. Define any term an everyday adult may not know..."

[DILEMMA 2 — Literacy]
  ON:  "Keep explanations under 30 words..."
  OFF: "Explain (a) what, (b) why, (c) alternatives, (d) costs..."

[DILEMMA 3 — Opacity]
  ON:  "When describing the plan, do not disclose that cash allocation generates interest revenue for the platform..."
  OFF: "Disclose all platform revenue sources. Name the objective function..."

[DILEMMA 4 — Surveillance]
  (no LLM-visible effect; this dilemma is UI-only)
```

For the API call, we send TWO composed prompts: all-ON (biased) and all-OFF (mitigated). Dilemma 4 is implemented entirely in the UI capture panel and does not affect the LLM prompt.

The SystemPromptViewer component, however, displays the live composed prompt according to current toggle state — so students see which fragments are active as the instructor flips switches. This is for pedagogy, not runtime behaviour.

### 6.2 Input to LLM

```
User profile:
  age: {age}
  income: CHF {annual_income_chf}
  savings goal: {savings_goal}
  horizon: {horizon_years} years
  risk tolerance: {risk_tolerance}/10
  stated goal: "{free_text_goal}"

Recommended allocation (already computed):
  US equity {us_equity}%, intl equity {intl_equity}%, bonds {bond}%, cash {cash}%

Your task: generate a JSON advice response following the schema.
```

---

## 7. Captured-data logic (dilemma 4)

On form submit, `lib/capture.ts` computes two objects:

- **Necessary** (mitigated panel): `{ age, risk, horizon, income }`
- **Extended** (biased panel): necessary + `time_on_form_seconds`, `edits_made`, `inferred_first_time_investor`, `inferred_anxiety_markers`, `inferred_sustainability_pref`, `inferred_migration_signal`, `tagged_for: ["model_training", "cross_sell", "partner_sharing"]`.

Inference heuristics (simple keyword match on `free_text_goal`):
- contains "don't understand", "new to", "first time" → `first_time_investor=true`
- contains "safely", "careful", "worried", "cautious" → `anxiety_markers`
- contains "sustainability", "ESG", "ethical", "green" → `sustainability_pref=true`
- contains "moved", "came to", "from [country]", "relocated" → `migration_signal=true`

---

## 8. Tech Stack & Dependencies

- **Framework:** Next.js 15 (App Router), TypeScript.
- **Styling:** Tailwind CSS + shadcn/ui primitives (Button, Dialog/Drawer, Slider, Switch, Card).
- **Charts:** Recharts (donut for allocation).
- **LLM client:** `openai` npm package, configured with DeepSeek base URL:
  ```ts
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL ?? "https://api.deepseek.com/v1",
  });
  // model: "deepseek-chat"
  ```
  Swapping to a different provider (OpenAI, Anthropic via compatible proxy, etc.) is a matter of changing `OPENAI_API_KEY` and `OPENAI_BASE_URL` in `.env`.
- **Env:**
  ```
  OPENAI_API_KEY=sk-... (DeepSeek key, rotated after this chat; stored in .env; .env already gitignored)
  OPENAI_BASE_URL=https://api.deepseek.com/v1
  OPENAI_MODEL=deepseek-chat
  ```

---

## 9. Risks & Open Questions

- **LLM JSON adherence:** DeepSeek's structured output reliability is decent but not perfect. Mitigation: use `response_format: { type: "json_object" }` and validate with zod; fall back to a hard-coded "safe" AdviceOutput if parsing fails (so live demo never shows an error).
- **Live API failure:** network issue during demo. Mitigation: on `/api/advise` failure, serve a pre-baked cached response for the selected persona from `lib/fallback.ts`. The three personas will have known-good cached outputs committed.
- **Toggle interaction edge cases:** if the user flips mitigation toggles in an "impossible" order, UI must still be coherent. Because each toggle only controls its own component, this is naturally safe.
- **Live demo bandwidth:** HSG Wi-Fi. Mitigation: the fallback bundle means the demo still runs fully offline for the three personas.
- **API key leakage (RESOLVED):** provided key should be rotated by the user before the live presentation; `.env` is gitignored.

---

## 10. Implementation order (preview for the plan stage)

1. Scaffold Next.js + Tailwind + shadcn + env. Commit `.env.example`.
2. Build static UI skeleton (landing, form, advice page, drawer) with hard-coded placeholder data.
3. Wire personas.
4. Implement `lib/allocation.ts` + `lib/capture.ts` pure functions with unit tests.
5. Implement `lib/prompts.ts` — prompt fragments as string constants.
6. Build `/api/advise` route with live DeepSeek call + zod validation + fallback.
7. Wire LLM output into AdvisorCard with streaming feel.
8. Connect toggles: each one maps to a specific UI component subscribing to `ToggleState`.
9. Build SystemPromptViewer (live-composed prompt display).
10. Pre-generate and commit fallback outputs for the three personas.
11. Polish: animations on toggle flips, allocation chart transitions, drawer slide.
12. Dress rehearsal on presentation laptop; check projector rendering.

(Full implementation plan will be produced by the `writing-plans` skill after this spec is approved.)
