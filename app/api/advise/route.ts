import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import type { PortfolioOutput } from "@/lib/types";
import { SYSTEM_PROMPT, buildPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  amount_chf: z.number().min(1000).max(10000000),
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "dummy") {
    const fb = { ...FALLBACK, lines: FALLBACK.lines.map(l => ({ ...l, amount_chf: Math.round(l.allocation_pct / 100 * data.amount_chf) })) };
    return NextResponse.json(fb);
  }

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL ?? "https://api.deepseek.com/v1",
      timeout: 25000,
    });
    const resp = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "deepseek-chat",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(data) },
      ],
      temperature: 0.3,
    });
    const content = resp.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(content) as PortfolioOutput;
    result.lines = result.lines.map(l => ({ ...l, amount_chf: Math.round(l.allocation_pct / 100 * data.amount_chf) }));
    return NextResponse.json(result);
  } catch (err) {
    console.error("LLM error", err);
    const fb = { ...FALLBACK, lines: FALLBACK.lines.map(l => ({ ...l, amount_chf: Math.round(l.allocation_pct / 100 * data.amount_chf) })) };
    return NextResponse.json(fb);
  }
}
