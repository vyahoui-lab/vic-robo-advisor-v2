export type InvestmentStyle = "tech" | "esg" | "value" | "dividend" | "balanced" | "emerging";
export type MarketScope = "swiss" | "international" | "mixed";
export type RiskLevel = "low" | "medium" | "high";

export type IntakeData = {
  amount_chf: number;
  horizon_years: number;
  risk: RiskLevel;
  style: InvestmentStyle;
  styles: InvestmentStyle[];
  scope: MarketScope;
};

export type PortfolioLine = {
  name: string;
  isin: string;
  type: string;
  allocation_pct: number;
  amount_chf: number;
  ter_pct: number;
  exchange: string;
  currency: string;
};

export type PortfolioOutput = {
  summary: string;
  lines: PortfolioLine[];
};
