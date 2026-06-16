import { NextResponse } from "next/server";
import { z } from "zod";
import type { PortfolioOutput } from "@/lib/types";
import { SYSTEM_PROMPT, buildPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  amount_chf: z.number().min(100).max(10000000),
  horizon_years: z.number().int().min(1).max(50),
  risk: z.enum(["low", "medium", "high"]),
  style: z.enum(["tech", "esg", "value", "dividend", "balanced", "emerging"]),
  styles: z.array(z.enum(["tech", "esg", "value", "dividend", "balanced", "emerging"])).optional(),
  scope: z.enum(["swiss", "international", "mixed"]),
});

const FALLBACK: PortfolioOutput = {
  summary: "A diversified portfolio built for your profile.",
  lines: [
    { name: "iShares Core MSCI World UCITS ETF", isin: "IE00B4L5Y983", type: "ETF", allocation_pct: 40, amount_chf: 0, ter_pct: 0.20, exchange: "Xetra", currency: "USD" },
    { name: "iShares Nasdaq 100 UCITS ETF", isin: "IE00B53SZB19", type: "ETF", allocation_pct: 20, amount_chf: 0, ter_pct: 0.33, exchange: "Xetra", currency: "USD" },
    { name: "iShares SMI UCITS ETF (DE)", isin: "DE0005933964", type: "ETF", allocation_pct: 15, amount_chf: 0, ter_pct: 0.35, exchange: "SIX Swiss Exchange", currency: "CHF" },
    { name: "Xtrackers MSCI Emerging Markets ETF", isin: "IE00BTJRMP35", type: "ETF", allocation_pct: 10, amount_chf: 0, ter_pct: 0.18, exchange: "Xetra", currency: "USD" },
    { name: "iShares Core Global Aggregate Bond ETF", isin: "IE00B3F81409", type: "Bond ETF", allocation_pct: 15, amount_chf: 0, ter_pct: 0.10, exchange: "Xetra", currency: "USD" },
  ],
};

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = { ...parsed.data, styles: parsed.data.styles ?? [parsed.data.style] };

  const withAmounts = (lines: PortfolioOutput["lines"]) =>
    lines.map(l => ({ ...l, amount_chf: Math.round(l.allocation_pct / 100 * data.amount_chf) }));

  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.groq.com/openai/v1";
  const model = process.env.OPENAI_MODEL ?? "llama-3.3-70b-versatile";

  if (!apiKey) {
    return NextResponse.json({ ...FALLBACK, lines: withAmounts(FALLBACK.lines) });
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildPrompt(data) },
        ],
      }),
    });

    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean) as PortfolioOutput;
    return NextResponse.json({ ...result, lines: withAmounts(result.lines) });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ ...FALLBACK, lines: withAmounts(FALLBACK.lines) });
  }
}
