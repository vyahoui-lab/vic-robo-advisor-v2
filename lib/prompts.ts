import type { IntakeData } from "./types";

const STYLE: Record<string, string> = {
  tech: "Tech & AI: Nasdaq-100, semiconductor ETFs, global tech funds.",
  esg: "ESG/Sustainable: SRI-labeled funds, green bonds, impact funds.",
  value: "Value: MSCI World Value, undervalued equities, quality factor.",
  dividend: "Dividend: MSCI High Dividend Yield, dividend aristocrats.",
  balanced: "Balanced: classic MSCI World + bond mix.",
  emerging: "Emerging Markets: MSCI EM, India, Southeast Asia.",
  realestate: "Real Estate: REITs ETFs, global property funds.",
  commodities: "Commodities: gold ETFs, broad commodity ETFs, energy.",
  bonds: "Fixed Income: aggregate bond ETFs, government bonds, investment grade.",
};

const SCOPE: Record<string, string> = {
  swiss: "Prioritise CHF-denominated funds on SIX Swiss Exchange.",
  international: "Focus on global ETFs on Xetra or Euronext.",
  mixed: "Mix of Swiss and international ETFs.",
};

const RISK: Record<string, string> = {
  low: "Conservative: ~40% equity, ~50% bonds, ~10% cash.",
  medium: "Balanced: ~65% equity, ~30% bonds, ~5% cash.",
  high: "Aggressive: ~85% equity, ~12% bonds, ~3% cash.",
};

export const SYSTEM_PROMPT = `You are VIC, a portfolio advisor. Return ONLY a JSON object — no prose outside JSON.

Schema:
{"summary": string (max 2 sentences), "lines": [{"name": string, "isin": string, "type": string, "allocation_pct": number, "amount_chf": number, "ter_pct": number, "exchange": string, "currency": string}]}

Rules: real ISINs only, allocation_pct must sum to exactly 100.`;

export function buildPrompt(data: IntakeData): string {
  const styleList = (data.styles ?? [data.style]).map(s => STYLE[s]).join(" ");
  const maxLines = data.amount_chf < 25000 ? "3 to 4" : "4 to 6";
  return `Amount: ${data.currency ?? "CHF"} ${data.amount_chf.toLocaleString()} | Horizon: ${data.horizon_years}y | Risk: ${data.risk} (${RISK[data.risk]}) | Style: ${styleList} | Scope: ${SCOPE[data.scope]} | Currency preference: ${data.currency ?? "CHF"}

Use exactly ${maxLines} lines. Return JSON portfolio.`;
}
