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
  scope: z.enum(["swiss", "international", "mixed"]),
});

const FALLBACK: PortfolioOutput = {
  summary: "A diversified portfolio built for your profile. Based on your risk level and horizon, we recommend a mix of global equities and bonds.",
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
  const data = parsed.data;

  const withAmounts = (lines: PortfolioOutput["lines"]) =>
    lines.map(l => ({ ...l, amount_chf: Math.round(l.allocation_pct / 100 * data.amount_chf) }));

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "dummy") {
    return NextResponse.json({ ...FALLBACK, lines: withAmounts(FALLBACK.lines) });
  }

  try {
    const prompt = `${SYSTEM_PROMPT}\n\n${buildPrompt(data)}`;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
        }),
      }
    );

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean) as PortfolioOutput;
    return NextResponse.json({ ...result, lines: withAmounts(result.lines) });
  } catch (err) {
    console.error("Gemini error", err);
    return NextResponse.json({ ...FALLBACK, lines: withAmounts(FALLBACK.lines) });
  }
}
