"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import type { PortfolioOutput, IntakeData } from "@/lib/types";

type Stored = PortfolioOutput & { intake: IntakeData };

function fmt(n: number) {
  return new Intl.NumberFormat("de-CH", { maximumFractionDigits: 0 }).format(n);
}

const RISK_LABEL: Record<string, string> = { low: "Conservative", medium: "Balanced", high: "Aggressive" };
const STYLE_ICON: Record<string, string> = {
  tech: "🤖", esg: "🌱", value: "💎", dividend: "💰", balanced: "⚖️",
  emerging: "🌏", realestate: "🏠", commodities: "🪙", bonds: "📄",
  healthcare: "🧬", financials: "🏦", agriculture: "🌾",
};

const RISK_RETURN: Record<string, { ret: string; vol: number; retVal: number }> = {
  low:    { ret: "~3–5%",   vol: 20, retVal: 35 },
  medium: { ret: "~6–8%",   vol: 50, retVal: 60 },
  high:   { ret: "~8–12%",  vol: 80, retVal: 85 },
};

const COLORS = ["#2d3142","#4b5580","#6b7ab0","#8b93b5","#bcc1d4","#dde0ea"];

function DonutChart({ lines }: { lines: PortfolioOutput["lines"] }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 56;
  const ir = 34;

  let cumPct = 0;
  const slices = lines.map((l, i) => {
    const startAngle = (cumPct / 100) * 2 * Math.PI - Math.PI / 2;
    cumPct += l.allocation_pct;
    const endAngle = (cumPct / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + ir * Math.cos(startAngle);
    const iy1 = cy + ir * Math.sin(startAngle);
    const ix2 = cx + ir * Math.cos(endAngle);
    const iy2 = cy + ir * Math.sin(endAngle);
    const large = l.allocation_pct > 50 ? 1 : 0;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`;
    return { d, color: COLORS[i % COLORS.length], name: l.name.split(" ").slice(0, 2).join(" "), pct: l.allocation_pct };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color} stroke="#fff" strokeWidth="1.5" />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#2d3142" fontWeight="600">Allocation</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="#9099ab">{lines.length} positions</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#4a506b" }}>{s.name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2d3142", marginLeft: "auto", paddingLeft: 8 }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskReturnChart({ risk }: { risk: string }) {
  const data = RISK_RETURN[risk] ?? RISK_RETURN.medium;
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#2d3142", marginBottom: 10 }}>Risk / Return profile</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#9099ab" }}>Expected volatility</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#2d3142" }}>{data.vol}%</span>
          </div>
          <div style={{ height: 8, background: "#e4e3de", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${data.vol}%`, background: risk === "high" ? "#dc2626" : risk === "medium" ? "#f59e0b" : "#16a34a", borderRadius: 4, transition: "width 0.5s" }} />
          </div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#9099ab" }}>Expected return potential</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a" }}>{data.ret} / yr</span>
          </div>
          <div style={{ height: 8, background: "#e4e3de", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${data.retVal}%`, background: "#16a34a", borderRadius: 4, transition: "width 0.5s" }} />
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#9099ab", marginTop: 2 }}>⚠️ Indicative only. Past performance is not a guarantee of future results.</div>
      </div>
    </div>
  );
}

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
    <div className="shell"><Sidebar />
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
    <div className="shell"><Sidebar />
      <main className="main">
        <div className="topbar"><div className="topbar-title">Building your portfolio…</div></div>
        <div className="content"><div className="loading-wrap"><div className="spinner"></div><div className="loading-text">Selecting ETFs · Checking ISINs · Computing allocations</div></div></div>
      </main>
    </div>
  );

  const avgTer = data.lines.reduce((s, l) => s + l.ter_pct * l.allocation_pct / 100, 0);
  const annualCost = Math.round(data.intake.amount_chf * avgTer / 100);

  return (
    <div className="shell"><Sidebar />
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
              <div className="kpi-val">{fmt(data.intake.amount_chf)}</div>
              <div className="kpi-sub">{data.intake.horizon_years} year horizon</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Profile</div>
              <div className="kpi-val" style={{ fontSize: 16, paddingTop: 4 }}>
                {STYLE_ICON[data.intake.style]} {RISK_LABEL[data.intake.risk]}
              </div>
              <div className="kpi-sub">{data.intake.currency ?? "CHF"}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Avg TER cost/yr</div>
              <div className="kpi-val">{fmt(annualCost)}</div>
              <div className="kpi-sub">{avgTer.toFixed(2)}% of portfolio</div>
            </div>
          </div>

          <div className="portfolio-card">
            <div className="portfolio-header">
              <div className="portfolio-title">Your portfolio lines</div>
              <div className="portfolio-meta">{data.lines.length} positions · {fmt(data.intake.amount_chf)} total</div>
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
                <div><div className="line-amount">{fmt(l.amount_chf)}</div></div>
                <div><div className="line-ter">{l.ter_pct.toFixed(2)}%</div></div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ background: "#fff", border: "1px solid #e4e3de", borderRadius: 10, padding: "18px 20px", marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <DonutChart lines={data.lines} />
            <RiskReturnChart risk={data.intake.risk} />
          </div>

          {/* Methodology */}
          <div style={{ background: "#f8f8f6", border: "1px solid #e4e3de", borderRadius: 10, padding: "16px 20px", marginTop: 16 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9099ab", fontWeight: 600, marginBottom: 8 }}>
              🧠 How this portfolio was built
            </div>
            <p style={{ fontSize: 13, color: "#4a506b", lineHeight: 1.7 }}>
              Your answers were analysed using <strong style={{ color: "#2d3142" }}>Modern Portfolio Theory (MPT)</strong> — the academic framework for balancing expected return against risk, developed by Harry Markowitz. Based on your risk level, the AI allocates across <strong style={{ color: "#2d3142" }}>equities, bonds, and alternatives</strong>, weighted by your investment convictions. It then selects real, low-cost ETFs with valid ISINs, minimising total expense ratio (TER) drag on your returns. The portfolio is generated in real time by a <strong style={{ color: "#2d3142" }}>large language model (LLM) API</strong>, trained on financial data and guided by finance theory.
            </p>
          </div>

          <div className="disclaimer">
            VIC Investment Club · For illustration and educational purposes only · Not regulated financial advice · Always verify ISINs before investing
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
