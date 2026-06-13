import type { IntakeData } from "./types";

const STYLE: Record<string, string> = {
  tech: "Focus on technology: Nasdaq-100, semiconductor ETFs, global tech funds.",
  esg: "Focus on ESG/sustainable funds with SRI label, green bonds.",
  value: "Focus on value factor ETFs: MSCI World Value, undervalued equities.",
  dividend: "Focus on high-dividend ETFs: MSCI High Dividend Yield, dividend aristocrats.",
  balanced: "Classic diversified mix: MSCI World, bonds, some cash.",
  emerging: "Focus on emerging markets: MSCI EM, India, Southeast Asia.",
};

const SCOPE: Record<string, string> = {
  swiss: "Prioritise CHF-denominated funds listed on SIX Swiss Exchange. At least 50% Swiss-listed.",
  international: "Focus on global ETFs listed on Xetra or Euronext. MSCI World, S&P 500, Nasdaq.",
  mixed: "Mix of Swiss-listed CHF funds and international ETFs.",
};

const RISK: Record<string, string> = {
  low: "Conservative: 40% equity, 50% bonds, 10% cash.",
  medium: "Balanced: 65% equity, 30% bonds, 5% cash.",
  high: "Aggressive: 85% equity, 12% bonds, 3% cash.",
};

export const SYSTEM_PROMPT = `You are VIC, a portfolio advisor for the Vic Investment Club.
A retail investor gives you their profile. You return ONLY a JSON object — no prose outside JSON.

JSON schema:
{
  "summary": string (max 2 sentences, plain English, no jargon),
  "lines": [
    {
      "name": string,        // Full official fund name
      "isin": string,        // Valid 12-char ISIN — must be real and correct
      "type": string,        // "ETF" | "Equity" | "Bond ETF" | "Money Market"
      "allocation_pct": number,  // % of portfolio (all lines sum to 100)
      "amount_chf": number,      // allocation_pct * total amount
      "ter_pct": number,         // TER as decimal e.g. 0.20
      "exchange": string,        // e.g. "Xetra" "SIX Swiss Exchange" "Euronext Amsterdam"
      "currency": string         // "CHF" "USD" "EUR"
    }
  ]
}

Rules:
- 4 to 6 lines only
- All lines must sum to exactly 100%
- Use ONLY real funds with valid ISINs — never invent an ISIN
- Keep it simple and practical for a retail investor`;

export function buildPrompt(data: IntakeData): string {
  return `Investor profile:
- Amount to invest: CHF ${data.amount_chf.toLocaleString()}
- Horizon: ${data.horizon_years} years
- Risk: ${data.risk} — ${RISK[data.risk]}
- Style: ${data.style} — ${STYLE[data.style]}
- Market scope: ${data.scope} — ${SCOPE[data.scope]}

Return the JSON portfolio.`;
}
