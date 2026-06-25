export type InvestmentStyle = "tech" | "esg" | "value" | "dividend" | "balanced" | "emerging" | "realestate" | "commodities" | "bonds";
export type MarketScope = "swiss" | "international" | "mixed";
export type RiskLevel = "low" | "medium" | "high";

export type IntakeData = {
  amount_chf: number;
  horizon_years: number;
  risk: RiskLevel;
  style: InvestmentStyle;
  styles: InvestmentStyle[];
  scope: MarketScope;
  currency?: string;
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
