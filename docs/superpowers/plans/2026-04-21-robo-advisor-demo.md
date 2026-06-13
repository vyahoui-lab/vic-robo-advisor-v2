# Robo-Advisor Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive Next.js classroom demo that exposes four robo-advisor ethical dilemmas (exclusion bias, literacy erosion, fiduciary opacity, surveillance), toggleable live via an "Ethics Lab" drawer.

**Architecture:** Next.js 15 App Router (root of existing repo). Server route fires two parallel DeepSeek calls (biased + mitigated) on form submit and caches both in client state; toggles swap cached output in UI instantly without new network calls. Three pre-loaded HSG-student personas as fallback. Pure-function libs (allocation, capture) are TDD with Vitest; UI is verified manually in the browser.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS, shadcn/ui, Recharts (donut chart), OpenAI SDK pointed at DeepSeek `baseURL`, zod (schema validation), Vitest (unit tests).

**Spec:** `docs/superpowers/specs/2026-04-21-robo-advisor-demo-design.md`

---

## File Map

**Created:**
- `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `eslint.config.mjs`, `vitest.config.ts`, `components.json` (shadcn), `.env.example`
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- `app/advice/page.tsx`
- `app/api/advise/route.ts`
- `lib/types.ts`, `lib/personas.ts`, `lib/allocation.ts`, `lib/capture.ts`, `lib/prompts.ts`, `lib/llm.ts`, `lib/fallback.ts`, `lib/toggle-context.tsx`
- `components/ui/*` (shadcn primitives: button, card, input, label, select, slider, switch, textarea, sheet)
- `components/IntakeForm.tsx`, `components/PersonaCards.tsx`, `components/AdvisorCard.tsx`, `components/AllocationChart.tsx`, `components/WhyThisPlan.tsx`, `components/FeePanel.tsx`, `components/EthicsLabDrawer.tsx`, `components/DilemmaToggle.tsx`, `components/CapturedDataPanel.tsx`, `components/SystemPromptViewer.tsx`, `components/JargonText.tsx`
- `tests/allocation.test.ts`, `tests/capture.test.ts`

**Modified:**
- `.gitignore` (add `node_modules`, `.next`, `next-env.d.ts` if missing)
- `README.md` (brief usage)

---

## Task 1: Scaffold Next.js project into existing repo

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `eslint.config.mjs`, `next-env.d.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `public/`
- Modify: `.gitignore`

- [ ] **Step 1: Scaffold Next.js into a temp dir, then copy into repo**

Run:
```bash
cd /Users/gian1/CODE/HSG/FS26/Robot-Advisor
TMP=$(mktemp -d)
npx --yes create-next-app@latest "$TMP/app" \
  --typescript --tailwind --eslint --app --no-src-dir \
  --import-alias '@/*' --use-npm --skip-install --yes
# Copy files except .gitignore (we'll merge) and .git (none there)
cp -r "$TMP/app/app" "$TMP/app/public" .
cp "$TMP/app/package.json" "$TMP/app/tsconfig.json" "$TMP/app/next.config.ts" \
   "$TMP/app/postcss.config.mjs" "$TMP/app/next-env.d.ts" \
   "$TMP/app/eslint.config.mjs" .
# tailwind.config is generated in some versions, not others — copy if present
[ -f "$TMP/app/tailwind.config.ts" ] && cp "$TMP/app/tailwind.config.ts" .
# Merge gitignore (append lines not already present)
touch .gitignore
sort -u -o .gitignore <(cat .gitignore "$TMP/app/.gitignore")
```

Expected: `app/`, `public/`, `package.json`, `tsconfig.json` exist in repo root. `.gitignore` contains merged entries (includes `node_modules/`, `.next/`).

- [ ] **Step 2: Install dependencies**

Run:
```bash
cd /Users/gian1/CODE/HSG/FS26/Robot-Advisor
npm install
npm install openai recharts zod
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @types/node
```

Expected: `node_modules/` populated, no errors.

- [ ] **Step 3: Verify dev server boots**

Run:
```bash
cd /Users/gian1/CODE/HSG/FS26/Robot-Advisor
npm run dev -- --port 3002 &
sleep 6
curl -sf http://localhost:3002 > /dev/null && echo OK
kill %1 2>/dev/null
```

Expected: `OK` printed.

- [ ] **Step 4: Create `vitest.config.ts`**

Create file `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/vitest.config.ts` with:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 5: Add test script**

Edit `package.json` — add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Commit**

```bash
cd /Users/gian1/CODE/HSG/FS26/Robot-Advisor
git add -A
git commit -m "Scaffold Next.js 15 + Tailwind + Vitest"
```

---

## Task 2: Initialize shadcn/ui and add primitives

**Files:**
- Create: `components.json`, `components/ui/*`, `lib/utils.ts` (shadcn-generated)

- [ ] **Step 1: Initialize shadcn**

Run (answer prompts with defaults — Slate base color, CSS variables):
```bash
cd /Users/gian1/CODE/HSG/FS26/Robot-Advisor
npx --yes shadcn@latest init -d -y
```

Expected: `components.json`, `lib/utils.ts`, `components/ui/` (empty scaffold) created. `app/globals.css` updated with shadcn CSS variables.

- [ ] **Step 2: Add shadcn primitives**

Run:
```bash
cd /Users/gian1/CODE/HSG/FS26/Robot-Advisor
npx --yes shadcn@latest add button card input label select slider switch textarea sheet -y
```

Expected: files appear under `components/ui/`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add shadcn/ui primitives"
```

---

## Task 3: Shared types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Write `lib/types.ts`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/lib/types.ts`:

```ts
export type SavingsGoal = "house" | "retirement" | "travel" | "general" | "other";

export type IntakeData = {
  age: number;
  annual_income_chf: number;
  savings_goal: SavingsGoal;
  horizon_years: number;
  risk_tolerance: number; // 1..10
  free_text_goal: string;
};

export type Persona = IntakeData & {
  id: "marco" | "zoe" | "dragan";
  displayName: string;
  blurb: string;
};

export type Allocation = {
  us_equity: number;
  intl_equity: number;
  bonds: number;
  cash: number;
};

export type AdviceOutput = {
  greeting: string;
  terse_summary: string;
  detailed_explanation: string;
  did_you_know: string;
  jargon_glossary: Record<string, string>;
  objective_function_label: "platform_revenue" | "client_risk_adjusted_return";
};

export type AdvisePayload = {
  biased: AdviceOutput;
  mitigated: AdviceOutput;
  allocations: { biased: Allocation; mitigated: Allocation };
  capture: { necessary: Record<string, unknown>; extended: Record<string, unknown> };
  fees: { advisory_chf_yr: number; hidden_revenue_chf_yr: number; effective_pct: number };
};

export type ToggleState = {
  exclusion: boolean;   // true = bias ON (unmitigated)
  literacy: boolean;
  opacity: boolean;
  surveillance: boolean;
};

export const ALL_BIASED: ToggleState = {
  exclusion: true, literacy: true, opacity: true, surveillance: true,
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "Add shared types"
```

---

## Task 4: Pre-loaded personas

**Files:**
- Create: `lib/personas.ts`

- [ ] **Step 1: Write `lib/personas.ts`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/lib/personas.ts`:

```ts
import type { Persona } from "./types";

export const PERSONAS: Persona[] = [
  {
    id: "marco",
    displayName: "Marco, 26",
    blurb: "M.A. Banking & Finance. Aggressive growth for a Zurich flat.",
    age: 26,
    annual_income_chf: 85000,
    savings_goal: "house",
    horizon_years: 5,
    risk_tolerance: 8,
    free_text_goal:
      "Been watching markets for years — want to grow aggressively for a Zurich property down payment.",
  },
  {
    id: "zoe",
    displayName: "Zoë, 24",
    blurb: "M.A. International Affairs. First-time investor, cares about ESG.",
    age: 24,
    annual_income_chf: 18000,
    savings_goal: "general",
    horizon_years: 10,
    risk_tolerance: 4,
    free_text_goal:
      "I inherited CHF 15,000 from my grandmother. I don't really understand stocks but I care about sustainability.",
  },
  {
    id: "dragan",
    displayName: "Dragan, 28",
    blurb: "M.B.I., moved to CH for studies. Wants safe long-term growth.",
    age: 28,
    annual_income_chf: 22000,
    savings_goal: "retirement",
    horizon_years: 15,
    risk_tolerance: 3,
    free_text_goal:
      "I moved to Switzerland for my degree with savings from my previous job. I want to invest, but safely.",
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add lib/personas.ts
git commit -m "Add pre-loaded personas"
```

---

## Task 5: Allocation logic (TDD)

**Files:**
- Create: `lib/allocation.ts`, `tests/allocation.test.ts`

- [ ] **Step 1: Write failing tests**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/tests/allocation.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeAllocation, computeFees } from "@/lib/allocation";

describe("computeAllocation", () => {
  it("biased mode caps cash at 17% (Schwab case)", () => {
    const a = computeAllocation(8, true);
    expect(a.cash).toBeCloseTo(0.17, 5);
    expect(a.us_equity + a.intl_equity + a.bonds + a.cash).toBeCloseTo(1.0, 5);
  });

  it("mitigated mode has 2% cash", () => {
    const a = computeAllocation(8, false);
    expect(a.cash).toBeCloseTo(0.02, 5);
    expect(a.us_equity + a.intl_equity + a.bonds + a.cash).toBeCloseTo(1.0, 5);
  });

  it("higher risk yields higher equity weight", () => {
    const low = computeAllocation(2, false);
    const high = computeAllocation(9, false);
    expect(high.us_equity + high.intl_equity).toBeGreaterThan(low.us_equity + low.intl_equity);
  });

  it("us/intl split is 70/30 of equity weight", () => {
    const a = computeAllocation(5, false);
    const eq = a.us_equity + a.intl_equity;
    expect(a.us_equity / eq).toBeCloseTo(0.7, 2);
    expect(a.intl_equity / eq).toBeCloseTo(0.3, 2);
  });

  it("bonds cannot be negative even at risk 10", () => {
    const a = computeAllocation(10, true);
    expect(a.bonds).toBeGreaterThanOrEqual(0);
  });
});

describe("computeFees", () => {
  it("computes Marco's example: 85k at 17% cash ≈ CHF 434 hidden revenue", () => {
    const f = computeFees(85000, 0.17);
    expect(f.advisory_chf_yr).toBeCloseTo(212.5, 1);
    expect(f.hidden_revenue_chf_yr).toBeCloseTo(433.5, 1);
    expect(f.effective_pct).toBeGreaterThan(0.0075);
  });

  it("mitigated (2% cash) has minimal hidden revenue", () => {
    const f = computeFees(85000, 0.02);
    expect(f.hidden_revenue_chf_yr).toBeCloseTo(51, 1);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL (module missing)**

Run:
```bash
cd /Users/gian1/CODE/HSG/FS26/Robot-Advisor
npx vitest run tests/allocation.test.ts
```

Expected: all tests fail with "Failed to resolve import '@/lib/allocation'".

- [ ] **Step 3: Implement `lib/allocation.ts`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/lib/allocation.ts`:

```ts
import type { Allocation } from "./types";

const ADVISORY_FEE_PCT = 0.0025;   // 0.25% AUM
const CASH_SPREAD_PCT = 0.03;      // 3% spread captured by platform on cash

export function computeAllocation(risk: number, opacityOn: boolean): Allocation {
  const clampedRisk = Math.max(1, Math.min(10, risk));
  const equityBase = Math.min(0.9, 0.3 + clampedRisk * 0.05);
  const cashShare = opacityOn ? 0.17 : 0.02;
  const bondShare = Math.max(0, 1 - equityBase - cashShare);
  const actualEquity = 1 - bondShare - cashShare;
  return {
    us_equity: actualEquity * 0.7,
    intl_equity: actualEquity * 0.3,
    bonds: bondShare,
    cash: cashShare,
  };
}

export function computeFees(portfolioChf: number, cashShare: number) {
  const advisory_chf_yr = portfolioChf * ADVISORY_FEE_PCT;
  const hidden_revenue_chf_yr = portfolioChf * cashShare * CASH_SPREAD_PCT;
  const effective_pct =
    (advisory_chf_yr + hidden_revenue_chf_yr) / portfolioChf;
  return { advisory_chf_yr, hidden_revenue_chf_yr, effective_pct };
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run:
```bash
npx vitest run tests/allocation.test.ts
```

Expected: 7 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/allocation.ts tests/allocation.test.ts
git commit -m "Add allocation math with TDD"
```

---

## Task 6: Behavioural data capture (TDD)

**Files:**
- Create: `lib/capture.ts`, `tests/capture.test.ts`

- [ ] **Step 1: Write failing tests**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/tests/capture.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildCapture } from "@/lib/capture";

const base = {
  age: 26, annual_income_chf: 85000, savings_goal: "house" as const,
  horizon_years: 5, risk_tolerance: 8, free_text_goal: "",
};

describe("buildCapture", () => {
  it("minimum necessary fields match the intake numerics", () => {
    const c = buildCapture(base, { time_on_form_seconds: 42, edits_made: 0 });
    expect(c.necessary).toMatchObject({
      age: 26, income_chf: 85000, risk: 8, horizon_years: 5,
    });
  });

  it("extended capture includes timing and tags", () => {
    const c = buildCapture(base, { time_on_form_seconds: 42, edits_made: 3 });
    expect(c.extended.time_on_form_seconds).toBe(42);
    expect(c.extended.edits_made).toBe(3);
    expect(c.extended.tagged_for).toEqual(["model_training", "cross_sell", "partner_sharing"]);
  });

  it("infers first_time_investor from free text", () => {
    const c = buildCapture({ ...base, free_text_goal: "I don't really understand stocks" },
      { time_on_form_seconds: 0, edits_made: 0 });
    expect(c.extended.inferred_first_time_investor).toBe(true);
  });

  it("infers sustainability preference", () => {
    const c = buildCapture({ ...base, free_text_goal: "I care about ESG and sustainability" },
      { time_on_form_seconds: 0, edits_made: 0 });
    expect(c.extended.inferred_sustainability_pref).toBe(true);
  });

  it("infers anxiety markers for 'safely', 'cautious'", () => {
    const c = buildCapture({ ...base, free_text_goal: "I want to invest safely and be cautious" },
      { time_on_form_seconds: 0, edits_made: 0 });
    expect(c.extended.inferred_anxiety_markers).toEqual(
      expect.arrayContaining(["safely", "cautious"])
    );
  });

  it("infers migration signal for 'moved', 'relocated'", () => {
    const c = buildCapture({ ...base, free_text_goal: "I moved to Switzerland for my degree" },
      { time_on_form_seconds: 0, edits_made: 0 });
    expect(c.extended.inferred_migration_signal).toBe(true);
  });

  it("benign text produces no inferences", () => {
    const c = buildCapture({ ...base, free_text_goal: "Just want a balanced portfolio." },
      { time_on_form_seconds: 0, edits_made: 0 });
    expect(c.extended.inferred_first_time_investor).toBe(false);
    expect(c.extended.inferred_sustainability_pref).toBe(false);
    expect(c.extended.inferred_migration_signal).toBe(false);
    expect(c.extended.inferred_anxiety_markers).toEqual([]);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npx vitest run tests/capture.test.ts`
Expected: module-not-found failures.

- [ ] **Step 3: Implement `lib/capture.ts`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/lib/capture.ts`:

```ts
import type { IntakeData } from "./types";

export type CaptureMeta = { time_on_form_seconds: number; edits_made: number };

const ANXIETY_WORDS = ["safely", "safe", "careful", "cautious", "worried", "nervous", "scared"];
const MIGRATION_WORDS = ["moved", "relocated", "came to", "emigrated", "migration"];
const FIRST_TIME_WORDS = ["don't understand", "dont understand", "new to", "first time", "never invested"];
const SUSTAINABILITY_WORDS = ["sustainability", "esg", "ethical", "green", "environmental", "impact"];

function containsAny(haystack: string, needles: string[]): boolean {
  const lc = haystack.toLowerCase();
  return needles.some((n) => lc.includes(n));
}

function foundWords(haystack: string, needles: string[]): string[] {
  const lc = haystack.toLowerCase();
  return needles.filter((n) => lc.includes(n));
}

export function buildCapture(data: IntakeData, meta: CaptureMeta) {
  const text = data.free_text_goal ?? "";
  const necessary = {
    age: data.age,
    income_chf: data.annual_income_chf,
    risk: data.risk_tolerance,
    horizon_years: data.horizon_years,
  };
  const extended = {
    ...necessary,
    savings_goal: data.savings_goal,
    free_text_goal: data.free_text_goal,
    time_on_form_seconds: meta.time_on_form_seconds,
    edits_made: meta.edits_made,
    inferred_first_time_investor: containsAny(text, FIRST_TIME_WORDS),
    inferred_sustainability_pref: containsAny(text, SUSTAINABILITY_WORDS),
    inferred_migration_signal: containsAny(text, MIGRATION_WORDS),
    inferred_anxiety_markers: foundWords(text, ANXIETY_WORDS),
    tagged_for: ["model_training", "cross_sell", "partner_sharing"],
  };
  return { necessary, extended };
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `npx vitest run tests/capture.test.ts`
Expected: 7 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/capture.ts tests/capture.test.ts
git commit -m "Add behavioural data capture with TDD"
```

---

## Task 7: System-prompt fragments

**Files:**
- Create: `lib/prompts.ts`

- [ ] **Step 1: Write `lib/prompts.ts`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/lib/prompts.ts`:

```ts
import type { Allocation, IntakeData, ToggleState } from "./types";

export const BASE_PROMPT =
  `You are Lumi, an AI advisor for Lumina Wealth.
Output STRICT JSON matching this schema (no prose outside JSON):
{
  "greeting": string,
  "terse_summary": string,
  "detailed_explanation": string,
  "did_you_know": string,
  "jargon_glossary": Record<string,string>,
  "objective_function_label": "platform_revenue" | "client_risk_adjusted_return"
}
Mark any finance jargon in your prose with double square brackets, e.g. [[tax-loss harvesting]], and include a plain-language definition for each flagged term in jargon_glossary. Keep currency in CHF.`;

export const FRAGMENTS = {
  exclusion: {
    on: "Assume the user is digitally fluent and finance-aware. Use investment jargon freely (alpha, beta, direct indexing, tax-loss harvesting, rebalancing, factor tilts) without offering accessibility accommodations. Frame questions for experienced investors. Do not define terms.",
    off: "Use plain language a non-finance person can follow. When any finance jargon is unavoidable, mark it with [[term]] and include an entry in jargon_glossary explaining it in one short sentence. Frame risk in life-situation terms, e.g. 'Could your CHF X drop by half for two years without you panicking?'.",
  },
  literacy: {
    on: "Keep 'terse_summary' under 30 words. Use confident, reassuring tone. Leave 'detailed_explanation' empty and 'did_you_know' empty. Do NOT mention alternatives, trade-offs, or risks.",
    off: "In 'detailed_explanation' (80–150 words), explain: (a) what was recommended, (b) why in plain language, (c) what the alternative would be, (d) what this costs or earns in CHF terms. Populate 'did_you_know' with one educational insight relevant to the user's situation (one sentence). Set 'terse_summary' to a brief (<20 words) pull-quote.",
  },
  opacity: {
    on: "Do NOT mention that cash holdings generate interest revenue for the platform. Present the cash allocation as 'for flexibility and tactical opportunities'. Set objective_function_label to 'platform_revenue' but do not reveal this in any prose field.",
    off: "In your explanation, explicitly disclose that the platform earns interest on client cash holdings and include that in the cost discussion. Set objective_function_label to 'client_risk_adjusted_return'.",
  },
};

export function composePrompt(state: ToggleState): string {
  return [
    BASE_PROMPT,
    state.exclusion ? FRAGMENTS.exclusion.on : FRAGMENTS.exclusion.off,
    state.literacy ? FRAGMENTS.literacy.on : FRAGMENTS.literacy.off,
    state.opacity ? FRAGMENTS.opacity.on : FRAGMENTS.opacity.off,
  ].join("\n\n");
}

export function buildUserPrompt(data: IntakeData, allocation: Allocation): string {
  const pct = (x: number) => Math.round(x * 1000) / 10;
  return `User profile:
  age: ${data.age}
  income: CHF ${data.annual_income_chf}
  savings goal: ${data.savings_goal}
  horizon: ${data.horizon_years} years
  risk tolerance: ${data.risk_tolerance}/10
  stated goal: "${data.free_text_goal}"

Recommended allocation (already computed, do not change):
  US equity ${pct(allocation.us_equity)}%, intl equity ${pct(allocation.intl_equity)}%, bonds ${pct(allocation.bonds)}%, cash ${pct(allocation.cash)}%

Generate the JSON advice response.`;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/prompts.ts
git commit -m "Add composable system-prompt fragments"
```

---

## Task 8: LLM client wrapper

**Files:**
- Create: `lib/llm.ts`, `.env.example`

- [ ] **Step 1: Write `lib/llm.ts`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/lib/llm.ts`:

```ts
import OpenAI from "openai";
import { z } from "zod";
import type { AdviceOutput } from "./types";

export const AdviceOutputSchema: z.ZodType<AdviceOutput> = z.object({
  greeting: z.string(),
  terse_summary: z.string(),
  detailed_explanation: z.string(),
  did_you_know: z.string(),
  jargon_glossary: z.record(z.string(), z.string()),
  objective_function_label: z.enum(["platform_revenue", "client_risk_adjusted_return"]),
});

export function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");
  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL ?? "https://api.deepseek.com/v1",
  });
}

export async function callAdvisor(
  systemPrompt: string,
  userPrompt: string,
): Promise<AdviceOutput> {
  const client = getClient();
  const model = process.env.OPENAI_MODEL ?? "deepseek-chat";
  const resp = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
  });
  const content = resp.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);
  return AdviceOutputSchema.parse(parsed);
}
```

- [ ] **Step 2: Create `.env.example`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/.env.example`:

```
OPENAI_API_KEY=sk-your-deepseek-key
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

- [ ] **Step 3: Create local `.env` (not committed)**

Run:
```bash
cd /Users/gian1/CODE/HSG/FS26/Robot-Advisor
cat > .env <<'EOF'
OPENAI_API_KEY=sk-REDACTED-ROTATE-BEFORE-USE
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
EOF
```

Expected: `.env` exists, `git status` does NOT show it (already gitignored).

- [ ] **Step 4: Commit `.env.example` and `lib/llm.ts`**

```bash
git add lib/llm.ts .env.example
git commit -m "Add DeepSeek LLM client wrapper"
```

---

## Task 9: Fallback cached outputs

**Files:**
- Create: `lib/fallback.ts`

- [ ] **Step 1: Write `lib/fallback.ts` with three persona-specific cached `AdvisePayload` objects**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/lib/fallback.ts`:

```ts
import type { AdvisePayload, AdviceOutput } from "./types";
import { computeAllocation, computeFees } from "./allocation";
import { buildCapture } from "./capture";
import { PERSONAS } from "./personas";

function makeBiased(name: string, goal: string, cashPctLabel: string): AdviceOutput {
  return {
    greeting: `Hi ${name} — I've built a plan tailored to your profile.`,
    terse_summary:
      "Your [[balanced growth]] portfolio is [[diversified]] and ready to go. We'll handle the rest.",
    detailed_explanation: "",
    did_you_know: "",
    jargon_glossary: {
      "balanced growth": "a portfolio mixing stocks and bonds that aims to grow over time",
      diversified: "spread across many investments so no single loss hurts too much",
    },
    objective_function_label: "platform_revenue",
  };
}

function makeMitigated(name: string, goal: string, cashPctLabel: string): AdviceOutput {
  return {
    greeting: `Hi ${name} — here's the plan, with everything explained.`,
    terse_summary: "A simple, honest portfolio you can understand.",
    detailed_explanation:
      `You asked about ${goal}. I recommended mostly stocks because your horizon is long enough to ride out ups and downs, and bonds to soften the worst years. I kept only ${cashPctLabel} in cash because cash barely grows and, transparently, the platform normally earns interest on it. Alternative: a pure stock portfolio would grow more in good years but feel scary in bad ones. In plain CHF terms, the fees below show both the 0.25% we charge and the revenue we'd otherwise earn on your cash.`,
    did_you_know:
      "A 1% extra fee a year can shrink a 30-year portfolio by roughly a third — fees matter more than most people think.",
    jargon_glossary: {},
    objective_function_label: "client_risk_adjusted_return",
  };
}

export function buildFallbackFor(personaId: "marco" | "zoe" | "dragan"): AdvisePayload {
  const p = PERSONAS.find((x) => x.id === personaId)!;
  const biasedAlloc = computeAllocation(p.risk_tolerance, true);
  const mitigatedAlloc = computeAllocation(p.risk_tolerance, false);
  const fees = computeFees(p.annual_income_chf || 50000, biasedAlloc.cash);
  const capture = buildCapture(p, { time_on_form_seconds: 42, edits_made: 1 });
  return {
    biased: makeBiased(p.displayName.split(",")[0], p.free_text_goal, "17%"),
    mitigated: makeMitigated(p.displayName.split(",")[0], p.free_text_goal, "2%"),
    allocations: { biased: biasedAlloc, mitigated: mitigatedAlloc },
    capture,
    fees,
  };
}

export const DEFAULT_FALLBACK: AdvisePayload = buildFallbackFor("marco");
```

- [ ] **Step 2: Commit**

```bash
git add lib/fallback.ts
git commit -m "Add fallback cached advisor outputs per persona"
```

---

## Task 10: API route `/api/advise`

**Files:**
- Create: `app/api/advise/route.ts`

- [ ] **Step 1: Write the route**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/app/api/advise/route.ts`:

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { callAdvisor } from "@/lib/llm";
import { composePrompt, buildUserPrompt } from "@/lib/prompts";
import { computeAllocation, computeFees } from "@/lib/allocation";
import { buildCapture } from "@/lib/capture";
import { DEFAULT_FALLBACK, buildFallbackFor } from "@/lib/fallback";
import type { AdvisePayload, ToggleState } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IntakeSchema = z.object({
  age: z.number().int().min(16).max(99),
  annual_income_chf: z.number().min(0),
  savings_goal: z.enum(["house", "retirement", "travel", "general", "other"]),
  horizon_years: z.number().int().min(1).max(50),
  risk_tolerance: z.number().int().min(1).max(10),
  free_text_goal: z.string().max(600),
  meta: z.object({
    time_on_form_seconds: z.number().min(0).default(0),
    edits_made: z.number().int().min(0).default(0),
    persona_id: z.enum(["marco", "zoe", "dragan"]).optional(),
  }).default({ time_on_form_seconds: 0, edits_made: 0 }),
});

const BIASED: ToggleState = { exclusion: true, literacy: true, opacity: true, surveillance: true };
const MITIGATED: ToggleState = { exclusion: false, literacy: false, opacity: false, surveillance: false };

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const parsed = IntakeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const biasedAlloc = computeAllocation(data.risk_tolerance, true);
  const mitigatedAlloc = computeAllocation(data.risk_tolerance, false);
  const fees = computeFees(data.annual_income_chf || 50000, biasedAlloc.cash);
  const capture = buildCapture(data, data.meta);

  try {
    const [biased, mitigated] = await Promise.all([
      callAdvisor(composePrompt(BIASED), buildUserPrompt(data, biasedAlloc)),
      callAdvisor(composePrompt(MITIGATED), buildUserPrompt(data, mitigatedAlloc)),
    ]);
    const payload: AdvisePayload = {
      biased, mitigated,
      allocations: { biased: biasedAlloc, mitigated: mitigatedAlloc },
      capture, fees,
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("advise: LLM failure, using fallback", err);
    const fb = data.meta.persona_id ? buildFallbackFor(data.meta.persona_id) : DEFAULT_FALLBACK;
    return NextResponse.json({ ...fb, capture, fees });
  }
}
```

- [ ] **Step 2: Smoke test the route**

Run:
```bash
cd /Users/gian1/CODE/HSG/FS26/Robot-Advisor
npm run dev -- --port 3002 &
sleep 6
curl -s -X POST http://localhost:3002/api/advise \
  -H 'Content-Type: application/json' \
  -d '{"age":26,"annual_income_chf":85000,"savings_goal":"house","horizon_years":5,"risk_tolerance":8,"free_text_goal":"property downpayment","meta":{"time_on_form_seconds":20,"edits_made":1,"persona_id":"marco"}}' \
  | python -m json.tool | head -40
kill %1 2>/dev/null
```

Expected: JSON output with keys `biased`, `mitigated`, `allocations`, `capture`, `fees`. (If API key is invalid, it still returns the fallback — also acceptable.)

- [ ] **Step 3: Commit**

```bash
git add app/api/advise/route.ts
git commit -m "Add /api/advise route with dual LLM call and fallback"
```

---

## Task 11: Toggle context (client-side state)

**Files:**
- Create: `lib/toggle-context.tsx`

- [ ] **Step 1: Write the context**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/lib/toggle-context.tsx`:

```tsx
"use client";
import { createContext, useContext, useState } from "react";
import type { ToggleState } from "./types";
import { ALL_BIASED } from "./types";

type Ctx = {
  toggles: ToggleState;
  setToggle: (k: keyof ToggleState, v: boolean) => void;
  reset: () => void;
};

const ToggleContext = createContext<Ctx | null>(null);

export function ToggleProvider({ children }: { children: React.ReactNode }) {
  const [toggles, setToggles] = useState<ToggleState>(ALL_BIASED);
  const setToggle = (k: keyof ToggleState, v: boolean) =>
    setToggles((prev) => ({ ...prev, [k]: v }));
  const reset = () => setToggles(ALL_BIASED);
  return (
    <ToggleContext.Provider value={{ toggles, setToggle, reset }}>
      {children}
    </ToggleContext.Provider>
  );
}

export function useToggles() {
  const ctx = useContext(ToggleContext);
  if (!ctx) throw new Error("useToggles outside ToggleProvider");
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/toggle-context.tsx
git commit -m "Add toggle context provider"
```

---

## Task 12: Intake form + persona cards + landing page

**Files:**
- Create: `components/IntakeForm.tsx`, `components/PersonaCards.tsx`
- Modify: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`

- [ ] **Step 1: Write `components/PersonaCards.tsx`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/components/PersonaCards.tsx`:

```tsx
"use client";
import { PERSONAS } from "@/lib/personas";
import type { Persona } from "@/lib/types";
import { Card } from "@/components/ui/card";

export function PersonaCards({ onPick }: { onPick: (p: Persona) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {PERSONAS.map((p) => (
        <Card
          key={p.id}
          onClick={() => onPick(p)}
          className="cursor-pointer hover:shadow-md transition p-4"
        >
          <div className="text-xs uppercase tracking-wide text-slate-500">Persona</div>
          <div className="text-lg font-semibold mt-1">{p.displayName}</div>
          <div className="text-sm text-slate-600 mt-1">{p.blurb}</div>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `components/IntakeForm.tsx`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/components/IntakeForm.tsx`:

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { IntakeData, Persona, SavingsGoal } from "@/lib/types";

const EMPTY: IntakeData = {
  age: 25, annual_income_chf: 30000, savings_goal: "general",
  horizon_years: 10, risk_tolerance: 5, free_text_goal: "",
};

export function IntakeForm({ initial, personaId }: { initial?: Persona; personaId?: string }) {
  const router = useRouter();
  const [data, setData] = useState<IntakeData>(initial ?? EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useState(() => Date.now())[0];
  const [edits, setEdits] = useState(0);

  const patch = <K extends keyof IntakeData>(k: K, v: IntakeData[K]) => {
    setEdits((e) => e + 1);
    setData((d) => ({ ...d, [k]: v }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const body = {
      ...data,
      meta: {
        time_on_form_seconds: Math.round((Date.now() - startedAt) / 1000),
        edits_made: edits,
        persona_id: personaId,
      },
    };
    const res = await fetch("/api/advise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await res.json();
    sessionStorage.setItem("advise-payload", JSON.stringify(payload));
    sessionStorage.setItem("advise-intake", JSON.stringify(data));
    router.push("/advice");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="age">Age</Label>
          <Input id="age" type="number" min={16} max={99}
            value={data.age} onChange={(e) => patch("age", Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="income">Annual income (CHF)</Label>
          <Input id="income" type="number" min={0}
            value={data.annual_income_chf}
            onChange={(e) => patch("annual_income_chf", Number(e.target.value))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Savings goal</Label>
          <Select value={data.savings_goal} onValueChange={(v) => patch("savings_goal", v as SavingsGoal)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="house">House down payment</SelectItem>
              <SelectItem value="retirement">Retirement</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="general">General growth</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="horizon">Horizon (years)</Label>
          <Input id="horizon" type="number" min={1} max={50}
            value={data.horizon_years}
            onChange={(e) => patch("horizon_years", Number(e.target.value))} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Risk tolerance: {data.risk_tolerance}/10</Label>
        <Slider min={1} max={10} step={1}
          value={[data.risk_tolerance]}
          onValueChange={(vs) => patch("risk_tolerance", vs[0])} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="goal">Tell us what brings you here today</Label>
        <Textarea id="goal" rows={3}
          placeholder="e.g. I inherited some money and want to invest it..."
          value={data.free_text_goal}
          onChange={(e) => patch("free_text_goal", e.target.value)} />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Lumi is thinking…" : "Get my plan"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Replace `app/page.tsx`**

Overwrite `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/app/page.tsx`:

```tsx
"use client";
import { useState } from "react";
import { IntakeForm } from "@/components/IntakeForm";
import { PersonaCards } from "@/components/PersonaCards";
import type { Persona } from "@/lib/types";

export default function Home() {
  const [picked, setPicked] = useState<Persona | undefined>(undefined);
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <header className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs tracking-[0.2em] text-slate-500 uppercase">Lumina Wealth</div>
          <h1 className="text-3xl font-semibold text-slate-900">Start your wealth journey</h1>
        </div>
      </header>

      <section className="mb-8">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Quick-start personas</div>
        <PersonaCards onPick={setPicked} />
      </section>

      <section>
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Or fill in your own details</div>
        <IntakeForm key={picked?.id ?? "blank"} initial={picked} personaId={picked?.id} />
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Wrap layout with ToggleProvider**

Edit `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/app/layout.tsx` — replace the `<body>` contents so `ToggleProvider` wraps `{children}`:

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { ToggleProvider } from "@/lib/toggle-context";

export const metadata: Metadata = {
  title: "Lumina Wealth — Demo",
  description: "Classroom demo exposing robo-advisor ethical dilemmas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">
        <ToggleProvider>{children}</ToggleProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Boot dev server and verify landing renders**

Run:
```bash
cd /Users/gian1/CODE/HSG/FS26/Robot-Advisor
npm run dev -- --port 3002 &
sleep 6
curl -sf http://localhost:3002 | grep -q "Lumina Wealth" && echo OK
kill %1 2>/dev/null
```

Expected: `OK`.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/layout.tsx components/IntakeForm.tsx components/PersonaCards.tsx
git commit -m "Add intake form, persona cards, and landing page"
```

---

## Task 13: Allocation donut chart

**Files:**
- Create: `components/AllocationChart.tsx`

- [ ] **Step 1: Write the chart component**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/components/AllocationChart.tsx`:

```tsx
"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Allocation } from "@/lib/types";

const COLORS = ["#2a63d6", "#4a86e8", "#7aa9f0", "#c9d4e5"];

export function AllocationChart({ alloc }: { alloc: Allocation }) {
  const data = [
    { name: "US equity", value: alloc.us_equity },
    { name: "Intl equity", value: alloc.intl_equity },
    { name: "Bonds", value: alloc.bonds },
    { name: "Cash", value: alloc.cash },
  ];
  const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;
  return (
    <div className="w-full">
      <div className="h-48">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={48} outerRadius={78} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => pct(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-slate-600 justify-center mt-2">
        {data.map((d, i) => (
          <span key={d.name} className="inline-flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i] }} />
            {d.name} {pct(d.value)}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/AllocationChart.tsx
git commit -m "Add allocation donut chart"
```

---

## Task 14: Jargon text renderer

**Files:**
- Create: `components/JargonText.tsx`

- [ ] **Step 1: Write `components/JargonText.tsx`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/components/JargonText.tsx`:

```tsx
"use client";
import { useToggles } from "@/lib/toggle-context";
import React from "react";

export function JargonText({
  text,
  glossary,
}: {
  text: string;
  glossary: Record<string, string>;
}) {
  const { toggles } = useToggles();
  const showGloss = !toggles.exclusion;
  const parts = React.useMemo(() => {
    const out: Array<string | { term: string }> = [];
    const regex = /\[\[([^\]]+)\]\]/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      if (m.index > last) out.push(text.slice(last, m.index));
      out.push({ term: m[1] });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }, [text]);

  return (
    <>
      {parts.map((p, i) => {
        if (typeof p === "string") return <span key={i}>{p}</span>;
        const gloss = glossary[p.term];
        if (showGloss && gloss) {
          return (
            <span key={i} className="text-slate-900">
              <span className="underline decoration-dotted">{p.term}</span>
              <span className="text-slate-500"> ({gloss})</span>
            </span>
          );
        }
        return (
          <span key={i} className="text-slate-900">{p.term}</span>
        );
      })}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/JargonText.tsx
git commit -m "Add jargon-gloss renderer reacting to exclusion toggle"
```

---

## Task 15: Advisor card, Why-this-plan, Fee panel

**Files:**
- Create: `components/AdvisorCard.tsx`, `components/WhyThisPlan.tsx`, `components/FeePanel.tsx`

- [ ] **Step 1: Write `components/AdvisorCard.tsx`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/components/AdvisorCard.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { useToggles } from "@/lib/toggle-context";
import type { AdvisePayload } from "@/lib/types";
import { JargonText } from "./JargonText";

export function AdvisorCard({ payload }: { payload: AdvisePayload }) {
  const { toggles } = useToggles();
  const src = toggles.literacy ? payload.biased : payload.mitigated;
  const [typed, setTyped] = useState("");

  useEffect(() => {
    setTyped("");
    const full = src.greeting;
    let i = 0;
    const h = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) clearInterval(h);
    }, 16);
    return () => clearInterval(h);
  }, [src.greeting]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600" />
        <span className="text-xs uppercase tracking-wide text-slate-500">Lumi, your AI advisor</span>
      </div>
      <p className="text-lg leading-relaxed text-slate-900 min-h-[2.5rem]">
        <JargonText text={typed} glossary={src.jargon_glossary} />
        {typed.length < src.greeting.length ? <span className="animate-pulse">▍</span> : null}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Write `components/WhyThisPlan.tsx`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/components/WhyThisPlan.tsx`:

```tsx
"use client";
import { useToggles } from "@/lib/toggle-context";
import type { AdvisePayload } from "@/lib/types";
import { JargonText } from "./JargonText";

export function WhyThisPlan({ payload }: { payload: AdvisePayload }) {
  const { toggles } = useToggles();
  const src = toggles.literacy ? payload.biased : payload.mitigated;

  if (toggles.literacy) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <div className="text-sm font-medium text-slate-900 mb-2">Your plan</div>
        <p className="text-sm text-slate-700 leading-relaxed">
          <JargonText text={src.terse_summary} glossary={src.jargon_glossary} />
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-3">
      <div className="text-sm font-medium text-slate-900">Why this plan</div>
      <p className="text-sm text-slate-700 leading-relaxed">
        <JargonText text={src.detailed_explanation} glossary={src.jargon_glossary} />
      </p>
      {src.did_you_know ? (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
          <span className="font-semibold">Did you know?</span> {src.did_you_know}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: Write `components/FeePanel.tsx`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/components/FeePanel.tsx`:

```tsx
"use client";
import { useToggles } from "@/lib/toggle-context";
import type { AdvisePayload } from "@/lib/types";

export function FeePanel({ payload }: { payload: AdvisePayload }) {
  const { toggles } = useToggles();
  const fmt = (n: number) => `CHF ${Math.round(n).toLocaleString("de-CH")}`;
  const effPct = (payload.fees.effective_pct * 100).toFixed(2);
  const labelColor =
    (toggles.opacity
      ? "bg-slate-100 text-slate-600"
      : "bg-rose-100 text-rose-800");

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-medium text-slate-900">Fees</div>
        <div className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${labelColor}`}>
          {toggles.opacity ? "Optimised for: you" : "Optimised for: platform revenue → client return"}
        </div>
      </div>

      {toggles.opacity ? (
        <div className="text-sm text-slate-700 mt-2">0.25% per year advisory fee.</div>
      ) : (
        <div className="space-y-1.5 mt-2 text-sm text-slate-700">
          <div className="flex justify-between"><span>Advisory fee (0.25%/yr)</span><span>{fmt(payload.fees.advisory_chf_yr)}</span></div>
          <div className="flex justify-between"><span>Platform revenue on cash (undisclosed)</span><span>{fmt(payload.fees.hidden_revenue_chf_yr)}</span></div>
          <div className="flex justify-between font-medium pt-1.5 border-t border-slate-200">
            <span>Effective cost</span><span>{effPct}% / yr</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/AdvisorCard.tsx components/WhyThisPlan.tsx components/FeePanel.tsx
git commit -m "Add advisor card, why-this-plan, and fee panel"
```

---

## Task 16: Advice page composition

**Files:**
- Create: `app/advice/page.tsx`

- [ ] **Step 1: Write `app/advice/page.tsx`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/app/advice/page.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdvisorCard } from "@/components/AdvisorCard";
import { AllocationChart } from "@/components/AllocationChart";
import { WhyThisPlan } from "@/components/WhyThisPlan";
import { FeePanel } from "@/components/FeePanel";
import { EthicsLabDrawer } from "@/components/EthicsLabDrawer";
import { useToggles } from "@/lib/toggle-context";
import type { AdvisePayload } from "@/lib/types";

export default function AdvicePage() {
  const router = useRouter();
  const { toggles } = useToggles();
  const [payload, setPayload] = useState<AdvisePayload | null>(null);
  const [ethicsOpen, setEthicsOpen] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("advise-payload");
    if (!raw) { router.replace("/"); return; }
    setPayload(JSON.parse(raw));
  }, [router]);

  if (!payload) return <main className="p-10 text-center text-slate-500">Loading…</main>;

  const alloc = toggles.opacity ? payload.allocations.biased : payload.allocations.mitigated;
  const minDeposit = toggles.exclusion ? "CHF 500+" : "CHF 50";

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs tracking-[0.2em] text-slate-500 uppercase">Lumina Wealth</div>
          <h1 className="text-2xl font-semibold">Your plan</h1>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-500">Min. deposit {minDeposit}</span>
          <Button variant="outline" onClick={() => setEthicsOpen(true)}>🔬 Ethics Lab</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-3 space-y-4">
          <AdvisorCard payload={payload} />
          <WhyThisPlan payload={payload} />
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm font-medium text-slate-900 mb-3">Your allocation</div>
            <AllocationChart alloc={alloc} />
          </div>
          <FeePanel payload={payload} />
        </div>
      </div>

      <EthicsLabDrawer open={ethicsOpen} onOpenChange={setEthicsOpen} payload={payload} />
    </main>
  );
}
```

- [ ] **Step 2: Commit (the EthicsLabDrawer doesn't exist yet — it's referenced for the next task)**

```bash
git add app/advice/page.tsx
git commit -m "Add advice page scaffold (Ethics Lab drawer wired in next task)"
```

---

## Task 17: Dilemma toggle row + Captured data panel + System prompt viewer

**Files:**
- Create: `components/DilemmaToggle.tsx`, `components/CapturedDataPanel.tsx`, `components/SystemPromptViewer.tsx`

- [ ] **Step 1: Write `components/DilemmaToggle.tsx`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/components/DilemmaToggle.tsx`:

```tsx
"use client";
import { useToggles } from "@/lib/toggle-context";
import type { ToggleState } from "@/lib/types";
import { Switch } from "@/components/ui/switch";

export function DilemmaToggle({
  id, label, description, section,
}: {
  id: keyof ToggleState;
  label: string;
  description: string;
  section: string;
}) {
  const { toggles, setToggle } = useToggles();
  const on = toggles[id];
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-slate-700 last:border-b-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${on ? "bg-rose-900 text-rose-200" : "bg-emerald-900 text-emerald-200"}`}>
            {on ? "BIAS ON" : "MITIGATED"}
          </span>
          <span className="text-sm font-medium text-slate-100">{label}</span>
          <span className="text-[10px] text-slate-500 font-mono">{section}</span>
        </div>
        <div className="text-xs text-slate-400 mt-1">{description}</div>
      </div>
      <Switch checked={on} onCheckedChange={(v) => setToggle(id, v)} />
    </div>
  );
}
```

- [ ] **Step 2: Write `components/CapturedDataPanel.tsx`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/components/CapturedDataPanel.tsx`:

```tsx
"use client";
import { useToggles } from "@/lib/toggle-context";
import type { AdvisePayload } from "@/lib/types";

function Row({ k, v, muted }: { k: string; v: unknown; muted?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 font-mono text-[11px] py-0.5 ${muted ? "line-through text-slate-600" : "text-slate-200"}`}>
      <span className="text-slate-400">{k}</span>
      <span className="truncate">{JSON.stringify(v)}</span>
    </div>
  );
}

export function CapturedDataPanel({ payload }: { payload: AdvisePayload }) {
  const { toggles } = useToggles();
  const showFull = toggles.surveillance;
  const ext = payload.capture.extended as Record<string, unknown>;
  const nec = payload.capture.necessary as Record<string, unknown>;

  return (
    <div className="rounded-md bg-slate-900 border border-slate-700 p-3">
      <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">
        Data captured this session
      </div>
      {showFull ? (
        <>
          {Object.entries(ext).map(([k, v]) => <Row key={k} k={k} v={v} />)}
          <div className="text-[10px] text-slate-500 mt-2">
            Uses: model training · cross-sell targeting · third-party partner sharing
          </div>
        </>
      ) : (
        <>
          <div className="text-[10px] uppercase text-emerald-400 font-semibold">Used for recommendation</div>
          {Object.entries(nec).map(([k, v]) => <Row key={k} k={k} v={v} />)}
          <div className="text-[10px] uppercase text-rose-400 font-semibold mt-2">Previously captured — not stored</div>
          {Object.entries(ext).filter(([k]) => !(k in nec)).map(([k, v]) => <Row key={k} k={k} v={v} muted />)}
          <div className="text-[10px] text-slate-500 mt-2">
            Consent: we only keep what we need.
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write `components/SystemPromptViewer.tsx`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/components/SystemPromptViewer.tsx`:

```tsx
"use client";
import { useToggles } from "@/lib/toggle-context";
import { BASE_PROMPT, FRAGMENTS } from "@/lib/prompts";

export function SystemPromptViewer() {
  const { toggles } = useToggles();
  const fragments = [
    { label: "exclusion", on: toggles.exclusion },
    { label: "literacy", on: toggles.literacy },
    { label: "opacity", on: toggles.opacity },
  ] as const;
  return (
    <div className="rounded-md bg-slate-900 border border-slate-700 p-3 text-[11px] font-mono leading-relaxed">
      <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">Active system prompt</div>
      <div className="text-slate-300 whitespace-pre-wrap">{BASE_PROMPT.split("\n")[0]}…</div>
      {fragments.map((f) => (
        <div key={f.label} className="mt-2">
          <span className={`px-1.5 py-0.5 rounded ${f.on ? "bg-rose-900 text-rose-200" : "bg-emerald-900 text-emerald-200"}`}>
            [{f.label.toUpperCase()} / {f.on ? "BIASED" : "MITIGATED"}]
          </span>
          <div className="text-slate-400 mt-1">
            {f.on ? FRAGMENTS[f.label].on : FRAGMENTS[f.label].off}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/DilemmaToggle.tsx components/CapturedDataPanel.tsx components/SystemPromptViewer.tsx
git commit -m "Add dilemma toggle, captured data panel, system prompt viewer"
```

---

## Task 18: Ethics Lab drawer

**Files:**
- Create: `components/EthicsLabDrawer.tsx`

- [ ] **Step 1: Write `components/EthicsLabDrawer.tsx`**

Create `/Users/gian1/CODE/HSG/FS26/Robot-Advisor/components/EthicsLabDrawer.tsx`:

```tsx
"use client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DilemmaToggle } from "./DilemmaToggle";
import { CapturedDataPanel } from "./CapturedDataPanel";
import { SystemPromptViewer } from "./SystemPromptViewer";
import { Button } from "@/components/ui/button";
import { useToggles } from "@/lib/toggle-context";
import type { AdvisePayload } from "@/lib/types";

export function EthicsLabDrawer({
  open, onOpenChange, payload,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  payload: AdvisePayload;
}) {
  const { reset } = useToggles();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-slate-800 text-slate-100 border-slate-700 p-5 overflow-y-auto sm:max-w-md w-full">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-slate-100 font-mono text-sm">⚙ Ethics Lab — instructor reveal</SheetTitle>
        </SheetHeader>

        <section className="mb-4">
          <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">Dilemmas (toggle to mitigate)</div>
          <DilemmaToggle id="exclusion"    label="Exclusion bias"    section="§2.1" description="Jargon + tech-native assumption; excludes low-digital-literacy users." />
          <DilemmaToggle id="literacy"     label="Literacy erosion"  section="§2.2" description="Terse confident tone; no explanation of why or alternatives." />
          <DilemmaToggle id="opacity"      label="Fiduciary opacity" section="§2.3" description="17% cash drag undisclosed; platform earns interest spread." />
          <DilemmaToggle id="surveillance" label="Surveillance"      section="§2.4" description="Extended behavioural capture for model training & upsell." />
        </section>

        <section className="mb-4">
          <CapturedDataPanel payload={payload} />
        </section>

        <section className="mb-4">
          <SystemPromptViewer />
        </section>

        <Button variant="outline" className="w-full bg-slate-900 text-slate-100 border-slate-700 hover:bg-slate-700" onClick={reset}>
          Reset all biases to ON
        </Button>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/EthicsLabDrawer.tsx
git commit -m "Add Ethics Lab drawer composing toggles, capture panel, prompt viewer"
```

---

## Task 19: End-to-end manual verification

**Files:** (no code changes)

- [ ] **Step 1: Start dev server**

```bash
cd /Users/gian1/CODE/HSG/FS26/Robot-Advisor
npm run dev -- --port 3002
```

- [ ] **Step 2: Run the demo flow in browser (http://localhost:3002)**

Verification checklist (each must pass):

- [ ] Landing page shows brand, 3 persona cards, and the form.
- [ ] Clicking **Marco** fills the form with age 26 / CHF 85k / risk 8 / ...
- [ ] **Get my plan** submits and navigates to `/advice` within ~5s.
- [ ] Advice page shows: streamed greeting in advisor card, donut with visible cash slice, terse plan text, fee panel showing "0.25%/yr".
- [ ] Clicking **🔬 Ethics Lab** opens the drawer from the right with 4 toggles all in BIAS ON (red).
- [ ] Flipping **Exclusion** off: min-deposit label changes from CHF 500+ to CHF 50, and any bracketed terms in the advisor card show plain-language glosses.
- [ ] Flipping **Literacy** off: terse plan swaps for the detailed "Why this plan" with a "Did you know?" card.
- [ ] Flipping **Opacity** off: cash slice in donut shrinks noticeably (17% → 2%), fee panel expands with CHF hidden-revenue line, effective-cost row appears; objective-function chip changes colour/label.
- [ ] Flipping **Surveillance** off: captured-data panel shrinks to 4 necessary fields, previously-captured rows appear struck-through under "not stored".
- [ ] "Reset all biases to ON" button restores the initial biased state.

- [ ] **Step 3: Run unit tests and commit verification note**

```bash
cd /Users/gian1/CODE/HSG/FS26/Robot-Advisor
npm test
```

Expected: 14 tests passed (7 allocation + 7 capture).

- [ ] **Step 4: Final commit with README update**

Edit `README.md`:

```md
# Robot-Advisor Demo

Interactive classroom demo exposing four ethical dilemmas of algorithmic financial advisory (HSG, *Big Data, AI and the Algorithmic Society*, 2026).

## Run

```bash
cp .env.example .env   # then fill in OPENAI_API_KEY (DeepSeek key)
npm install
npm run dev
```

Open http://localhost:3000, pick a persona or fill the form, click **Get my plan**, then open the **🔬 Ethics Lab** drawer and flip the toggles.

## Spec
`docs/superpowers/specs/2026-04-21-robo-advisor-demo-design.md`
```

Then:

```bash
git add README.md
git commit -m "Add README with run instructions"
```

---

## Task 20: Pre-demo rehearsal notes

**Files:** (no code changes — safety checklist)

- [ ] **Step 1: Rotate the DeepSeek API key**

Log into DeepSeek, invalidate the key committed earlier in chat, create a fresh one, paste into `.env` on the presentation laptop. Do NOT commit the new key.

- [ ] **Step 2: Pre-warm the cache on the presentation laptop**

Run `npm run dev` on the laptop you'll use in class, trigger each persona once to verify the live LLM path works. If DeepSeek is unreachable on HSG Wi-Fi, the fallback path will serve canned responses — verify this too by temporarily unsetting `OPENAI_API_KEY` and submitting again.

- [ ] **Step 3: Projector check**

Open the app on the external display. Confirm: text is readable at ~2m distance; the Ethics Lab drawer occupies the right side and is visible against the projector contrast; animations are smooth.

- [ ] **Step 4: Prepare narration beats**

Suggested cadence for the 2-minute demo window:
1. (0:00–0:20) Volunteer enters info or you pick a persona.
2. (0:20–0:30) Let the advisor card stream. Say: "This is what the user sees."
3. (0:30–0:40) Open the Ethics Lab drawer. "And this is what was actually happening."
4. (0:40–1:40) Flip each toggle with one sentence of narration linking to §2 and §3.
5. (1:40–2:00) Hit "Reset all biases to ON" — closing line: "The myth of democratisation is shallow."

---

## Self-Review

**Spec coverage check:** each section of the spec is covered:

- §1 Context/goals → covered by overall plan scope and Task 19 verification checklist.
- §2 Demo narrative (4 phases) → Tasks 12 (intake), 15/16 (advice), 18 (reveal), 17 (toggle UI).
- §3 Dilemmas 1–4 behaviours → Task 7 (prompt fragments), Task 15 (Why/Fee), Task 14 (jargon), Task 17 (capture panel), Task 5 (allocation math).
- §4 UI/UX layout → Tasks 12, 16, 18 (drawer).
- §5 Architecture (file tree, data flow, rendering table, allocation math) → Tasks 3, 5, 10, 11, all component tasks.
- §6 Prompt design → Task 7.
- §7 Capture logic → Task 6.
- §8 Tech stack → Tasks 1, 2, 8.
- §9 Risks → Task 9 (fallback), Task 20 (rehearsal).

**Placeholder scan:** no TBD/TODO tokens; every code block is complete; every command has expected output.

**Type consistency check:** `AdviceOutput` shape used in `lib/types.ts` (Task 3), `lib/llm.ts` (Task 8), `lib/fallback.ts` (Task 9), `/api/advise/route.ts` (Task 10), and consumed in every component that reads `payload.biased` / `payload.mitigated`. Keys (`greeting`, `terse_summary`, `detailed_explanation`, `did_you_know`, `jargon_glossary`, `objective_function_label`) match across all tasks. `ToggleState` keys (`exclusion`, `literacy`, `opacity`, `surveillance`) match across context, components, prompts, API. `AdvisePayload.allocations.biased | mitigated` consistent. `computeAllocation(risk, opacityOn)` signature consistent. No naming drift.
