"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import type { InvestmentStyle, MarketScope, RiskLevel } from "@/lib/types";

const STYLES: { id: InvestmentStyle; icon: string; name: string; desc: string }[] = [
  { id: "tech",      icon: "🤖", name: "Tech & AI",      desc: "Nasdaq, semis, cloud" },
  { id: "esg",       icon: "🌱", name: "ESG",            desc: "Sustainable, green" },
  { id: "value",     icon: "💎", name: "Value",          desc: "Undervalued, quality" },
  { id: "dividend",  icon: "💰", name: "Dividend",       desc: "Income, yield" },
  { id: "balanced",  icon: "⚖️", name: "Balanced",       desc: "Classic 60/40" },
  { id: "emerging",  icon: "🌏", name: "Emerging",       desc: "EM, India, SEA" },
  { id: "realestate",icon: "🏠", name: "Real Estate",    desc: "REITs, property" },
  { id: "commodities",icon:"🪙", name: "Commodities",    desc: "Gold, oil, metals" },
  { id: "bonds",     icon: "📄", name: "Bonds",          desc: "Fixed income, safety" },
];

const RISKS: { id: RiskLevel; name: string; desc: string; ret: string }[] = [
  { id: "low",    name: "Conservative", desc: "Mostly bonds",     ret: "~3–5% / yr" },
  { id: "medium", name: "Balanced",     desc: "Mix stocks/bonds", ret: "~6–8% / yr" },
  { id: "high",   name: "Aggressive",   desc: "Mostly stocks",    ret: "~8–12% / yr" },
];

const CURRENCIES = [
  { code: "CHF", flag: "🇨🇭", name: "Swiss Franc" },
  { code: "USD", flag: "🇺🇸", name: "US Dollar" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", flag: "🇬🇧", name: "British Pound" },
  { code: "JPY", flag: "🇯🇵", name: "Japanese Yen" },
  { code: "AUD", flag: "🇦🇺", name: "Australian Dollar" },
  { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar" },
  { code: "CNY", flag: "🇨🇳", name: "Chinese Yuan" },
  { code: "HKD", flag: "🇭🇰", name: "Hong Kong Dollar" },
  { code: "SGD", flag: "🇸🇬", name: "Singapore Dollar" },
];

const card = (on: boolean): React.CSSProperties => ({
  border: `1.5px solid ${on ? "#2d3142" : "#e4e3de"}`,
  borderRadius: 10, padding: 12, cursor: "pointer",
  background: on ? "#eef0f7" : "#fff",
  userSelect: "none", WebkitUserSelect: "none", touchAction: "manipulation",
});

export default function Home() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [horizon, setHorizon] = useState("");
  const [risk, setRisk] = useState<RiskLevel>("medium");
  const [styles, setStyles] = useState<InvestmentStyle[]>(["balanced"]);
  const [currency, setCurrency] = useState("CHF");
  const [loading, setLoading] = useState(false);

  function toggleStyle(id: InvestmentStyle) {
    setStyles(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(s => s !== id) : prev
        : [...prev, id]
    );
  }

  function submit() {
    if (loading) return;
    setLoading(true);
    const intake = {
      amount_chf: parseInt(amount.replace(/[^0-9]/g, ""), 10) || 10000,
      horizon_years: parseInt(horizon, 10) || 10,
      risk, style: styles[0], styles,
      scope: "mixed" as MarketScope,
      currency,
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(intake)));
    router.push(`/results?d=${encoded}`);
  }

  const lbl: React.CSSProperties = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9099ab", fontWeight: 600, marginBottom: 12 };

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <div className="topbar"><div className="topbar-title">Build my portfolio</div></div>
        <div className="content">
          <div className="form-wrap">
            <div className="hero">
              <div className="hero-eyebrow">VIC Investment Club · Robo Advisor</div>
              <h1 className="hero-h1">What should I invest in?</h1>
              <p className="hero-sub">5 questions. Get your personalised portfolio with exact ETFs, ISINs, and amounts.</p>
            </div>

            {/* 01 Amount */}
            <div className="field">
              <div style={lbl}>01 — Amount to invest</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#4a506b" }}>{currency}</span>
                <input className="amount-input" type="text" inputMode="numeric"
                  value={amount} onChange={e => setAmount(e.target.value)} placeholder="10,000" />
              </div>
            </div>

            {/* 02 Horizon */}
            <div className="field">
              <div style={lbl}>02 — Investment horizon</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <input className="amount-input" type="text" inputMode="numeric"
                  style={{ width: 80 }}
                  value={horizon} onChange={e => setHorizon(e.target.value)} placeholder="10" />
                <span style={{ fontSize: 16, fontWeight: 600, color: "#4a506b" }}>years</span>
              </div>
            </div>

            {/* 03 Risk */}
            <div className="field">
              <div style={lbl}>03 — Risk level</div>
              <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                {RISKS.map(r => (
                  <div key={r.id} style={card(risk === r.id)} onClick={() => setRisk(r.id)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#2d3142" }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "#9099ab", marginTop: 2 }}>{r.desc}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>{r.ret}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "#9099ab", marginTop: 10, display: "flex", gap: 5, lineHeight: 1.5 }}>
                <span>⚠️</span>
                <span>Expected return ranges are indicative, based on historical data, imply risk, are not guaranteed, and apply over the long term only.</span>
              </div>
            </div>

            {/* 04 Style — 9 options */}
            <div className="field">
              <div style={lbl}>04 — What do you believe in? <span style={{ fontWeight: 400, fontSize: 10, textTransform: "none", letterSpacing: 0 }}>select one or more</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {STYLES.map(s => (
                  <div key={s.id} style={card(styles.includes(s.id))} onClick={() => toggleStyle(s.id)}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#2d3142" }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: "#9099ab", marginTop: 2 }}>{s.desc}</div>
                    {styles.includes(s.id) && <div style={{ fontSize: 10, color: "#2d3142", marginTop: 4, fontWeight: 700 }}>✓</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* 05 Currency */}
            <div className="field">
              <div style={lbl}>05 — Investment currency</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8 }}>
                {CURRENCIES.map(c => (
                  <div key={c.code} style={card(currency === c.code)} onClick={() => setCurrency(c.code)}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{c.flag}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#2d3142" }}>{c.code}</div>
                    <div style={{ fontSize: 9, color: "#9099ab", marginTop: 2 }}>{c.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div style={{ paddingTop: 24 }}>
              <div onClick={submit} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                height: 52, background: loading ? "#9099ab" : "#2d3142", color: "#fff",
                borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
                touchAction: "manipulation", userSelect: "none", WebkitUserSelect: "none",
              }}>
                {loading ? "Loading…" : "→ Get my portfolio"}
              </div>
            </div>

            <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #e4e3de" }}>
              <a href="https://www.linkedin.com/company/vic-investment-club" target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9099ab", textDecoration: "none" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Follow VIC Investment Club on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
