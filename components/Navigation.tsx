"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const modelLinks = [
  { label: "M1 · Dispute Classifier", href: "/models/dispute-classifier", tag: "Longformer" },
  { label: "M2 · Document Completeness", href: "/models/document-completeness", tag: "XGBoost" },
  { label: "M3 · Payment Predictor", href: "/models/payment-predictor", tag: "LightGBM" },
  { label: "M4 · Legal Rule Engine", href: "/models/rule-engine", tag: "Deterministic" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModelsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.85)",
        borderBottom: scrolled ? "1px solid #E7E5E4" : "1px solid transparent",
        backdropFilter: "blur(12px)",
        transition: "all 0.2s",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <div style={{ width: 3, height: 20, backgroundColor: "#D97706", borderRadius: 2 }} />
          <span style={{ fontSize: 17, fontWeight: 800, color: "#1C1917", letterSpacing: "-0.03em" }}>
            SamadhanAI
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }} className="hidden md:flex">
          {[
            { label: "Architecture", href: "/#architecture" },
            { label: "Datasets", href: "/datasets" },
            { label: "API", href: "/#api" },
            { label: "Pipeline Demo", href: "/demo" },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{
                padding: "5px 12px", fontSize: 13, fontWeight: 500, color: "#57534E",
                borderRadius: 6, textDecoration: "none", transition: "all 0.15s",
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = "#F5F5F4"; (e.target as HTMLElement).style.color = "#1C1917"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = "transparent"; (e.target as HTMLElement).style.color = "#57534E"; }}
            >
              {link.label}
            </a>
          ))}

          {/* Models dropdown — click toggle */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setModelsOpen(prev => !prev)}
              style={{
                display: "flex", alignItems: "center", gap: 4, padding: "5px 12px",
                fontSize: 13, fontWeight: 500, color: modelsOpen ? "#1C1917" : "#57534E",
                backgroundColor: modelsOpen ? "#F5F5F4" : "transparent",
                borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
              aria-expanded={modelsOpen}
              aria-haspopup="listbox"
            >
              Models
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{ transition: "transform 0.2s", transform: modelsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <path d="M2.5 4L6 7.5L9.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dropdown panel */}
            {modelsOpen && (
              <div
                style={{
                  position: "absolute", top: "calc(100% + 6px)", left: 0,
                  width: 240, backgroundColor: "#FFFFFF",
                  border: "1px solid #E7E5E4", borderRadius: 8,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.10)", overflow: "hidden",
                  zIndex: 100,
                }}
              >
                {modelLinks.map(m => (
                  <Link
                    key={m.href}
                    href={m.href}
                    onClick={() => setModelsOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", textDecoration: "none", transition: "background 0.1s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#FAFAF9"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#1C1917", fontFamily: "Inter, system-ui, sans-serif" }}>{m.label}</span>
                    <span style={{
                      fontSize: 10, color: "#78716C", fontFamily: "JetBrains Mono, monospace",
                      backgroundColor: "#F5F5F4", padding: "1px 6px", borderRadius: 4,
                    }}>
                      {m.tag}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a href="https://huggingface.co/abhinavdread" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#78716C", textDecoration: "none", fontFamily: "var(--font-geist-mono)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#1C1917"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#78716C"; }}
          >
            HuggingFace
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M3 1h7v7M10 1L1 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <a href="https://github.com/abhinavdread" target="_blank" rel="noopener noreferrer"
            className="btn btn-dark btn-sm"
          >
            GitHub
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            padding: 6, border: "1px solid #E7E5E4", borderRadius: 6,
            backgroundColor: "transparent", cursor: "pointer", color: "#57534E",
          }}
          aria-label="Toggle menu"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            {menuOpen ? (
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <>
                <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #E7E5E4", padding: "12px 24px 16px" }}>
          {[{ label: "Architecture", href: "/#architecture" }, { label: "Datasets", href: "/datasets" }, { label: "API", href: "/#api" }, { label: "Pipeline Demo", href: "/demo" }].map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              style={{ display: "block", padding: "8px 0", fontSize: 14, color: "#57534E", textDecoration: "none", borderBottom: "1px solid #F5F5F4" }}>
              {l.label}
            </a>
          ))}
          <div style={{ borderTop: "1px solid #E7E5E4", marginTop: 8, paddingTop: 8 }}>
            <div style={{ fontSize: 10, color: "#A8A29E", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>Models</div>
            {modelLinks.map(m => (
              <Link key={m.href} href={m.href} onClick={() => setMenuOpen(false)}
                style={{ display: "block", padding: "6px 0", fontSize: 12, color: "#78716C", textDecoration: "none", fontFamily: "JetBrains Mono, monospace" }}>
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
