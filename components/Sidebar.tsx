"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function Sidebar() {
  const p = usePathname();
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sidebarStyle: React.CSSProperties = {
    width: 200, background: "#fff", borderRight: "1px solid #e4e3de",
    display: "flex", flexDirection: "column",
    position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 99,
    transform: mobile && !open ? "translateX(-100%)" : "translateX(0)",
    transition: "transform 0.25s ease",
  };

  const navItem = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 9, padding: "9px 20px",
    fontSize: 13, color: active ? "#2d3142" : "#4a506b",
    textDecoration: "none", borderRight: active ? "2px solid #2d3142" : "2px solid transparent",
    background: active ? "#eef0f7" : "transparent", fontWeight: active ? 600 : 400,
    touchAction: "manipulation",
  });

  return (
    <>
      {/* Hamburger */}
      {mobile && (
        <div
          onClick={() => setOpen(o => !o)}
          style={{
            position: "fixed", top: 10, left: 10, zIndex: 200,
            background: "#2d3142", color: "#fff", borderRadius: 8,
            width: 42, height: 42, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", touchAction: "manipulation",
          }}
        >
          {open
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          }
        </div>
      )}

      {/* Overlay */}
      {mobile && open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 98 }} />
      )}

      <aside style={sidebarStyle}>
        <div style={{ padding: 20, borderBottom: "1px solid #e4e3de" }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-1.5px", color: "#2d3142" }}>VIC</div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9099ab", marginTop: 3 }}>Investment Club · Robo Advisor</div>
        </div>
        <div style={{ padding: "16px 0 4px" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9099ab", padding: "4px 20px 6px", fontWeight: 500 }}>Advisor</div>
          <Link href="/" style={navItem(p === "/")} onClick={() => setOpen(false)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14"/></svg>
            New profile
          </Link>
          <Link href="/results" style={navItem(p === "/results")} onClick={() => setOpen(false)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            My portfolio
          </Link>
        </div>
        <div style={{ marginTop: "auto", borderTop: "1px solid #e4e3de", padding: "14px 20px", fontSize: 11, color: "#9099ab" }}>
          For illustration only · Not advice
        </div>
      </aside>
    </>
  );
}
