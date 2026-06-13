"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import type { IntakeData, InvestmentStyle, MarketScope, RiskLevel } from "@/lib/types";

const STYLES: { id: InvestmentStyle; icon: string; name: string; desc: string }[] = [
  { id:"tech",     icon:"🤖", name:"Tech & AI",    desc:"Nasdaq, semis, cloud" },
  { id:"esg",      icon:"🌱", name:"ESG",          desc:"Sustainable, green" },
  { id:"value",    icon:"💎", name:"Value",        desc:"Undervalued, quality" },
  { id:"dividend", icon:"💰", name:"Dividend",     desc:"Income, yield" },
  { id:"balanced", icon:"⚖️", name:"Balanced",     desc:"Classic 60/40" },
  { id:"emerging", icon:"🌏", name:"Emerging",     desc:"EM, India, SEA" },
];

const RISKS: { id: RiskLevel; name: string; desc: string }[] = [
  { id:"low",    name:"Conservative", desc:"Mostly bonds" },
  { id:"medium", name:"Balanced",     desc:"Mix stocks/bonds" },
  { id:"high",   name:"Aggressive",   desc:"Mostly stocks" },
];

const SCOPES: { id: MarketScope; flag: string; name: string; desc: string }[] = [
  { id:"swiss",         flag:"🇨🇭", name:"Swiss",         desc:"SIX, CHF-denominated" },
  { id:"international", flag:"🌍", name:"International",  desc:"MSCI World, S&P, Nasdaq" },
  { id:"mixed",         flag:"⚖️", name:"Mixed",          desc:"Both Swiss + global" },
];

const HORIZONS = [3, 5, 10, 15, 20];

export default function Home() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [horizon, setHorizon] = useState(10);
  const [risk, setRisk] = useState<RiskLevel>("medium");
  const [style, setStyle] = useState<InvestmentStyle>("balanced");
  const [scope, setScope] = useState<MarketScope>("mixed");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data: IntakeData = {
      amount_chf: parseInt(amount.replace(/[^0-9]/g, ""), 10) || 10000,
      horizon_years: horizon,
      risk, style, scope,
    };
    try {
      const res = await fetch("/api/advise", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data) });
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
              <div className="field">
                <div className="field-label">01 — Amount to invest</div>
                <div className="amount-row">
                  <span className="amount-prefix">CHF</span>
                  <input className="amount-input" type="text" inputMode="numeric"
                    value={amount} onChange={e => setAmount(e.target.value)} placeholder="10,000" />
                </div>
              </div>

              <div className="field">
                <div className="field-label">02 — Investment horizon</div>
                <div className="pill-group">
                  {HORIZONS.map(h => (
                    <button key={h} type="button" className={`pill${horizon===h?" on":""}`} onClick={() => setHorizon(h)}>
                      {h} years
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <div className="field-label">03 — Risk level</div>
                <div className="risk-row">
                  {RISKS.map(r => (
                    <button key={r.id} type="button" className={`risk-card${risk===r.id?" on":""}`} onClick={() => setRisk(r.id)}>
                      <div className="risk-name">{r.name}</div>
                      <div className="risk-desc">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <div className="field-label">04 — What excites you?</div>
                <div className="style-grid">
                  {STYLES.map(s => (
                    <button key={s.id} type="button" className={`style-card${style===s.id?" on":""}`} onClick={() => setStyle(s.id)}>
                      <div className="style-icon">{s.icon}</div>
                      <div className="style-name">{s.name}</div>
                      <div className="style-desc">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <div className="field-label">05 — Swiss or international?</div>
                <div className="scope-grid">
                  {SCOPES.map(s => (
                    <button key={s.id} type="button" className={`scope-card${scope===s.id?" on":""}`} onClick={() => setScope(s.id)}>
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
          </div>
        </div>
      </main>
    </div>
  );
}
