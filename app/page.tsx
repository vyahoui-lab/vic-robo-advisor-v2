"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import type { InvestmentStyle, MarketScope, RiskLevel } from "@/lib/types";

const STYLES: { id: InvestmentStyle; icon: string; name: string; desc: string }[] = [
  { id:"tech",     icon:"🤖", name:"Tech & AI",    desc:"Nasdaq, semis, cloud" },
  { id:"esg",      icon:"🌱", name:"ESG",          desc:"Sustainable, green" },
  { id:"value",    icon:"💎", name:"Value",        desc:"Undervalued, quality" },
  { id:"dividend", icon:"💰", name:"Dividend",     desc:"Income, yield" },
  { id:"balanced", icon:"⚖️", name:"Balanced",     desc:"Classic 60/40" },
  { id:"emerging", icon:"🌏", name:"Emerging",     desc:"EM, India, SEA" },
];

const RISKS: { id: RiskLevel; name: string; desc: string; return: string }[] = [
  { id:"low",    name:"Conservative", desc:"Mostly bonds",       return:"~3–5% / yr" },
  { id:"medium", name:"Balanced",     desc:"Mix stocks/bonds",   return:"~6–8% / yr" },
  { id:"high",   name:"Aggressive",   desc:"Mostly stocks",      return:"~8–12% / yr" },
];

const SCOPES: { id: MarketScope; flag: string; name: string; desc: string }[] = [
  { id:"swiss",         flag:"🇨🇭", name:"Swiss",         desc:"SIX, CHF-denominated" },
  { id:"international", flag:"🌍", name:"International",  desc:"MSCI World, S&P, Nasdaq" },
  { id:"mixed",         flag:"⚖️", name:"Mixed",          desc:"Both Swiss + global" },
];

export default function Home() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [horizon, setHorizon] = useState("");
  const [risk, setRisk] = useState<RiskLevel>("medium");
  const [styles, setStyles] = useState<InvestmentStyle[]>(["balanced"]);
  const [scope, setScope] = useState<MarketScope>("mixed");
  const [loading, setLoading] = useState(false);

  function toggleStyle(id: InvestmentStyle) {
    setStyles(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(s => s !== id) : prev
        : [...prev, id]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = {
      amount_chf: parseInt(amount.replace(/[^0-9]/g, ""), 10) || 10000,
      horizon_years: parseInt(horizon, 10) || 10,
      risk,
      style: styles[0],
      styles,
      scope,
    };
    try {
      const res = await fetch("/api/advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      sessionStorage.setItem("vic-portfolio", JSON.stringify({ ...json, intake: data }));
      router.push("/results");
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <div className="topbar-title">Build my portfolio</div>
        </div>
        <div className="content">
          <div className="form-wrap">
            <div className="hero">
              <div className="hero-eyebrow">VIC Investment Club · Robo Advisor</div>
              <h1 className="hero-h1">What should I invest in?</h1>
              <p className="hero-sub">5 questions. Get your personalised portfolio with exact ETFs, ISINs, and amounts.</p>
            </div>

            <form onSubmit={submit}>
              {/* 01 Amount */}
              <div className="field">
                <div className="field-label">01 — Amount to invest</div>
                <div className="amount-row">
                  <span className="amount-prefix">CHF</span>
                  <input className="amount-input" type="text" inputMode="numeric"
                    value={amount} onChange={e => setAmount(e.target.value)} placeholder="10,000" />
                </div>
              </div>

              {/* 02 Horizon — free input */}
              <div className="field">
                <div className="field-label">02 — Investment horizon</div>
                <div className="amount-row">
                  <input className="amount-input" type="text" inputMode="numeric"
                    style={{ width: 80 }}
                    value={horizon} onChange={e => setHorizon(e.target.value)} placeholder="10" />
                  <span className="amount-prefix">years</span>
                </div>
              </div>

              {/* 03 Risk */}
              <div className="field">
                <div className="field-label">03 — Risk level</div>
                <div className="risk-row">
                  {RISKS.map(r => (
                    <button key={r.id} type="button"
                      className={`risk-card${risk === r.id ? " on" : ""}`}
                      onClick={() => setRisk(r.id)}>
                      <div className="risk-name">{r.name}</div>
                      <div className="risk-desc">{r.desc}</div>
                      <div className="risk-return">{r.return}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 04 Style — multi-select */}
              <div className="field">
                <div className="field-label">04 — What do you believe in? <span style={{fontWeight:400, textTransform:"none", letterSpacing:0, color:"var(--vic-faint)", fontSize:10}}>(select one or more)</span></div>
                <div className="style-grid">
                  {STYLES.map(s => (
                    <button key={s.id} type="button"
                      className={`style-card${styles.includes(s.id) ? " on" : ""}`}
                      onClick={() => toggleStyle(s.id)}>
                      <div className="style-icon">{s.icon}</div>
                      <div className="style-name">{s.name}</div>
                      <div className="style-desc">{s.desc}</div>
                      {styles.includes(s.id) && <div style={{fontSize:10,color:"var(--vic)",marginTop:4,fontWeight:600}}>✓ Selected</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* 05 Scope */}
              <div className="field">
                <div className="field-label">05 — Swiss or international?</div>
                <div className="scope-grid">
                  {SCOPES.map(s => (
                    <button key={s.id} type="button"
                      className={`scope-card${scope === s.id ? " on" : ""}`}
                      onClick={() => setScope(s.id)}>
                      <div className="scope-flag">{s.flag}</div>
                      <div className="scope-name">{s.name}</div>
                      <div className="scope-desc">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="submit-row">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Building your portfolio…" : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      Get my portfolio
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* LinkedIn link */}
            <div style={{marginTop:32, paddingTop:16, borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", gap:8}}>
              <a href="https://www.linkedin.com/company/vic-investment-club" target="_blank" rel="noopener noreferrer"
                style={{display:"flex", alignItems:"center", gap:6, fontSize:11, color:"var(--vic-faint)", textDecoration:"none", transition:"color 0.1s"}}
                onMouseOver={e => (e.currentTarget.style.color = "var(--vic)")}
                onMouseOut={e => (e.currentTarget.style.color = "var(--vic-faint)")}>
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
