import type { IntakeData } from "./types";

const STYLE: Record<string, string> = {
  tech: "Tech & AI: Nasdaq-100, semiconductor ETFs, global tech funds.",
  esg: "ESG/Sustainable: SRI-labeled funds, green bonds, impact funds.",
  value: "Value: MSCI World Value, undervalued equities, quality factor.",
  dividend: "Dividend: MSCI High Dividend Yield, dividend aristocrats.",
  balanced: "Balanced: classic MSCI World + bond mix.",
  emerging: "Emerging Markets: MSCI EM, India, Southeast Asia.",
};

const SCOPE: Record<string, string> = {
  swiss: "Prioritise CHF-denominated funds on SIX Swiss Exchange. At least 50% Swiss-listed.",
  international: "Focus on global ETFs on Xetra or Euronext. MSCI World, S&P 500, Nasdaq.",
  mixed: "Mix of Swiss-listed CHF funds and international ETFs.",
};

const RISK: Record<string, string> = {
  low: "Conservative: ~40% equity, ~50% bonds, ~10% cash. Expected return ~3-5%/yr.",
  medium: "Balanced: ~65% equity, ~30% bonds, ~5% cash. Expected return ~6-8%/yr.",
  high: "Aggressive: ~85% equity, ~12% bonds, ~3% cash. Expected return ~8-12%/yr.",
};

export const SYSTEM_PROMPT = `You are VIC, a portfolio advisor for the Vic Investment Club.
Return ONLY a JSON object — no prose outside JSON.

JSON schema:
{
  "summary": string (max 2 sentences, plain English),
  "lines": [
    {
      "name": string,
      "isin": string,
      "type": string,
      "allocation_pct": number,
      "amount_chf": number,
      "ter_pct": number,
      "exchange": string,
      "currency": string
    }
  ]
}

Rules:
- 4 to 6 lines, sum to exactly 100%
- Real funds with valid ISINs only
- Blend the selected investment themes proportionally`;

export function buildPrompt(data: IntakeData): string {
  const styleList = (data.styles ?? [data.style]).map(s => STYLE[s]).join("\n- ");
  return `Investor profile:
- Amount: CHF ${data.amount_chf.toLocaleString()}
- Horizon: ${data.horizon_years} years
- Risk: ${data.risk} — ${RISK[data.risk]}
- Investment themes (blend these): 
- ${styleList}
- Scope: ${data.scope} — ${SCOPE[data.scope]}

Return the JSON portfolio blending all selected themes.`;
}
