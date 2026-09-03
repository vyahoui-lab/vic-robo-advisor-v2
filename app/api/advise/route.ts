import { NextResponse } from "next/server";
import { z } from "zod";
import type { PortfolioOutput } from "@/lib/types";
import { SYSTEM_PROMPT, buildPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const StyleEnum = z.enum(["tech", "esg", "value", "dividend", "balanced", "emerging", "realestate", "commodities", "bonds", "crypto"]);

const Schema = z.object({
  amount_chf: z.number().min(100).max(10000000),
  horizon_years: z.number().int().min(1).max(50),
  risk: z.enum(["low", "medium", "high"]),
  style: StyleEnum,
  styles: z.array(StyleEnum).optional(),
  scope: z.enum(["swiss", "international", "mixed"]),
  currency: z.string().optional(),
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

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400, headers: CORS });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400, headers: CORS });
  const data = { ...parsed.data, styles: parsed.data.styles ?? [parsed.data.style] };

  const withAmounts = (lines: PortfolioOutput["lines"]) =>
    lines.map(l => ({ ...l, amount_chf: Math.round(l.allocation_pct / 100 * data.amount_chf) }));

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ...FALLBACK, lines: withAmounts(FALLBACK.lines) }, { headers: CORS });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const prompt = SYSTEM_PROMPT + "\n\n" + buildPrompt(data);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini HTTP error:", res.status, errText);
      return NextResponse.json({ ...FALLBACK, lines: withAmounts(FALLBACK.lines) }, { headers: CORS });
    }

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text) {
      console.error("Empty response from Gemini");
      return NextResponse.json({ ...FALLBACK, lines: withAmounts(FALLBACK.lines) }, { headers: CORS });
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", text);
      return NextResponse.json({ ...FALLBACK, lines: withAmounts(FALLBACK.lines) }, { headers: CORS });
    }

    const result = JSON.parse(jsonMatch[0]) as PortfolioOutput;
    return NextResponse.json({ ...result, lines: withAmounts(result.lines) }, { headers: CORS });

  } catch (err) {
    clearTimeout(timeout);
    console.error("API error:", err);
    return NextResponse.json({ ...FALLBACK, lines: withAmounts(FALLBACK.lines) }, { headers: CORS });
  }
}
