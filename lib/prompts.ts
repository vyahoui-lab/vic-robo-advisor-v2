import type { IntakeData } from "./types";

const STYLE: Record<string, string> = {
  tech: "Tech & AI: Nasdaq-100, semiconductor ETFs, global tech funds.",
  esg: "ESG/Sustainable: SRI-labeled funds, green bonds, impact funds.",
  value: "Value: MSCI World Value, undervalued equities, quality factor.",
  dividend: "Dividend: MSCI High Dividend Yield, dividend aristocrats.",
  balanced: "Balanced: classic MSCI World + bond mix.",
  emerging: "Emerging Markets: MSCI EM, India, Southeast Asia.",
  realestate: "Real Estate: REIT ETFs, global property funds.",
  commodities: "Commodities: gold ETFs, broad commodity ETFs, energy.",
  bonds: "Fixed Income: aggregate bond ETFs, government bonds, investment grade.",
};

const RISK: Record<string, string> = {
  low: "Conservative: ~40% equity, ~50% bonds, ~10% cash.",
  medium: "Balanced: ~65% equity, ~30% bonds, ~5% cash.",
  high: "Aggressive: ~85% equity, ~12% bonds, ~3% cash.",
};

function horizonRule(years: number): string {
  if (years <= 3) return "SHORT horizon (≤3 years): prioritise capital preservation. Use mostly short-duration bond ETFs and money market funds. Avoid high-volatility equities.";
  if (years <= 7) return "MEDIUM horizon (4-7 years): balanced approach. Mix equities and bonds. Avoid highly speculative assets.";
  return "LONG horizon (≥8 years): can accept more volatility for higher long-term returns. Favour equity ETFs over bonds.";
}

function currencyRule(currency: string): string {
  const rules: Record<string, string> = {
    CHF: "Prefer CHF-hedged funds or funds listed on SIX Swiss Exchange. Avoid unhedged USD exposure.",
    USD: "Prefer USD-denominated funds listed on US exchanges or Xetra. S&P 500, Nasdaq ETFs are appropriate.",
    EUR: "Prefer EUR-denominated funds listed on Xetra or Euronext Amsterdam. UCITS ETFs in EUR.",
    GBP: "Prefer GBP-denominated funds listed on London Stock Exchange (LSE).",
    JPY: "Prefer globally diversified UCITS ETFs. Note: few ETFs are JPY-denominated, EUR/USD alternatives are acceptable.",
    AUD: "Prefer globally diversified UCITS ETFs. USD/EUR alternatives are acceptable.",
    CAD: "Prefer globally diversified UCITS ETFs. USD alternatives are acceptable.",
    CNY: "Prefer globally diversified UCITS ETFs. USD/EUR alternatives are acceptable.",
    HKD: "Prefer globally diversified UCITS ETFs. USD alternatives are acceptable.",
    SGD: "Prefer globally diversified UCITS ETFs. USD/EUR alternatives are acceptable.",
  };
  return rules[currency] ?? "Prefer globally diversified UCITS ETFs.";
}

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
- Use ONLY real funds with valid ISINs
- allocation_pct must sum to exactly 100
- Blend the selected investment themes proportionally
- Strictly follow the horizon and currency rules provided`;

export function buildPrompt(data: IntakeData): string {
  const styleList = (data.styles ?? [data.style]).map(s => STYLE[s]).join("\n- ");
  const maxLines = data.amount_chf < 9500 ? 3 : 6;
  const minLines = data.amount_chf < 9500 ? 2 : 4;

  return `Investor profile:
- Amount: ${data.currency ?? "CHF"} ${data.amount_chf.toLocaleString()}
- Horizon: ${data.horizon_years} years → ${horizonRule(data.horizon_years)}
- Risk: ${data.risk} — ${RISK[data.risk]}
- Investment themes (blend these):
- ${styleList}
- Currency rule: ${currencyRule(data.currency ?? "CHF")}

Number of portfolio lines: minimum ${minLines}, maximum ${maxLines}.

Return the JSON portfolio.`;
}
