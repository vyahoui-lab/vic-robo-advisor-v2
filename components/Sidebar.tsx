"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Sidebar() {
  const p = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="hamburger"
        aria-label="Toggle menu"
      >
        {open
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        }
      </button>

      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="logo-block">
          <div style={{fontSize:26,fontWeight:700,letterSpacing:"-1.5px",color:"var(--vic)"}}>VIC</div>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--vic-faint)",marginTop:3}}>Investment Club · Robo Advisor</div>
        </div>
        <div className="nav-section">
          <div className="nav-label">Advisor</div>
          <Link href="/" className={`nav-item${p==="/"?" active":""}`} onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14"/></svg>
            New profile
          </Link>
          <Link href="/results" className={`nav-item${p==="/results"?" active":""}`} onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            My portfolio
          </Link>
        </div>
        <div className="sidebar-foot">For illustration only · Not advice</div>
      </aside>
    </>
  );
}
