"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function Sidebar() {
  const p = usePathname();
  return (
    <aside className="sidebar">
      <div className="logo-block">
        <span style={{ fontSize:28, fontWeight:700, letterSpacing:"-1.5px", color:"#2d3142" }}>VIC</span>
      </div>
      <div className="nav-section">
        <div className="nav-label">Advisor</div>
        <Link href="/" className={`nav-item${p==="/"?" active":""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14"/></svg>
          New profile
        </Link>
        <Link href="/results" className={`nav-item${p==="/results"?" active":""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          My portfolio
        </Link>
      </div>
      <div className="sidebar-foot">For illustration only · Not advice</div>
    </aside>
  );
}
