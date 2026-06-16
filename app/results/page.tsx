"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import type { PortfolioOutput, IntakeData } from "@/lib/types";

type Stored = PortfolioOutput & { intake: IntakeData };

function fmtChf(n: number) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(n);
}

const RISK_LABEL: Record<string, string> = { low: "Conservative", medium: "Balanced", high: "Aggressive" };
const STYLE_ICON: Record<string, string> = { tech: "🤖", esg: "🌱", value: "💎", dividend: "💰", balanced: "⚖️", emerging: "🌏" };

function Results() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<Stored | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const encoded = searchParams.get("d");
    if (!encoded) { router.replace("/"); return; }
    try {
      const intake = JSON.parse(decodeURIComponent(atob(encoded))) as IntakeData;
      fetch("/api/advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intake),
      })
        .then(r => r.json())
        .then(json => setData({ ...json, intake }))
        .catch(() => setError(true));
    } catch {
      router.replace("/");
    }
  }, [router, searchParams]);

  if (error) return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <div className="topbar"><div className="topbar-title">Error</div></div>
        <div className="content" style={{ textAlign: "center", paddingTop: 60 }}>
          <p style={{ color: "var(--red)", marginBottom: 16 }}>Something went wrong. Please try again.</p>
          <button className="btn-ghost" onClick={() => router.push("/")}>← Back</button>
        </div>
      </main>
    </div>
  );

  if (!data) return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <div className="topbar"><div className="topbar-title">Building your portfolio…</div></div>
        <div className="content"><div className="loading-wrap"><div className="spinner"></div><div className="loading-text">Selecting ETFs · Checking ISINs · Computing allocations</div></div></div>
      </main>
    </div>
  );

  const avgTer = data.lines.reduce((s, l) => s + l.ter_pct * l.allocation_pct / 100, 0);
  const annualCost = Math.round(data.intake.amount_chf * avgTer / 100);

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <div className="topbar-title">My portfolio</div>
          <button className="btn-ghost" onClick={() => router.push("/")}>← New profile</button>
        </div>
        <div className="content">
          <div className="summary-box">
            <div className="summary-label">VIC recommendation</div>
            <div className="summary-text">{data.summary}</div>
          </div>

          <div className="kpi-row">
            <div className="kpi">
              <div className="kpi-label">Total invested</div>
              <div className="kpi-val">{fmtChf(data.intake.amount_chf)}</div>
              <div className="kpi-sub">{data.intake.horizon_years} year horizon</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Profile</div>
              <div className="kpi-val" style={{ fontSize: 16, paddingTop: 4 }}>
                {STYLE_ICON[data.intake.style]} {RISK_LABEL[data.intake.risk]}
              </div>
              <div className="kpi-sub">{data.intake.scope} focus</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Avg TER cost/yr</div>
              <div className="kpi-val">{fmtChf(annualCost)}</div>
              <div className="kpi-sub">{avgTer.toFixed(2)}% of portfolio</div>
            </div>
          </div>

          <div className="portfolio-card">
            <div className="portfolio-header">
              <div className="portfolio-title">Your portfolio lines</div>
              <div className="portfolio-meta">{data.lines.length} positions · {fmtChf(data.intake.amount_chf)} total</div>
            </div>
            <div className="line-row line-row-header">
              <div className="line-header-text">Fund</div>
              <div className="line-header-text" style={{ textAlign: "right" }}>Weight</div>
              <div className="line-header-text" style={{ textAlign: "right" }}>Amount</div>
              <div className="line-header-text" style={{ textAlign: "right" }}>TER</div>
            </div>
            {data.lines.map((l) => (
              <div key={l.isin} className="line-row">
                <div>
                  <div className="line-name">{l.name}</div>
                  <div className="line-isin">{l.isin}</div>
                  <div className="line-meta">{l.exchange} · {l.currency}</div>
                  <div className="line-type">{l.type}</div>
                  <div className="bar-wrap"><div className="bar-fill" style={{ width: `${l.allocation_pct}%` }}></div></div>
                </div>
                <div><div className="line-pct">{l.allocation_pct}%</div></div>
                <div><div className="line-amount">{fmtChf(l.amount_chf)}</div></div>
                <div><div className="line-ter">{l.ter_pct.toFixed(2)}%</div></div>
              </div>
            ))}
          </div>

          <div className="disclaimer">
            Vic Investment Club · For illustration and educational purposes only · Not regulated financial advice · Always verify ISINs before investing
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="loading-wrap"><div className="spinner"></div></div>}>
      <Results />
    </Suspense>
  );
}
