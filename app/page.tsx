"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { HighLevelDiagram } from "@/components/HighLevelDiagram";
import { LowLevelDiagram } from "@/components/LowLevelDiagram";

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; } },
      { threshold: 0.06 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useFadeIn();
  return (
    <div ref={ref} style={{ opacity: 0, transform: "translateY(16px)", transition: `opacity 0.55s ${delay}ms ease, transform 0.55s ${delay}ms ease` }}>
      {children}
    </div>
  );
}

// ── Indian Tricolor SVG Flag ──────────────────────────────────────────────────
function IndiaFlag({ width = 32, height = 21 }: { width?: number; height?: number }) {
  const r = height / 3;
  const cx = width / 2, cy = height / 2;
  const spokes = 24;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width={width} height={r} fill="#FF9933" />
      <rect x="0" y={r} width={width} height={r} fill="#FFFFFF" />
      <rect x="0" y={r * 2} width={width} height={r} fill="#138808" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="#000080" strokeWidth="0.7" />
      <circle cx={cx} cy={cy} r={r * 0.09} fill="#000080" />
      {Array.from({ length: spokes }).map((_, i) => {
        const angle = (i * 360) / spokes;
        const rad = (angle * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * r * 0.09;
        const y1 = cy + Math.sin(rad) * r * 0.09;
        const x2 = cx + Math.cos(rad) * r * 0.55;
        const y2 = cy + Math.sin(rad) * r * 0.55;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000080" strokeWidth="0.5" />;
      })}
    </svg>
  );
}

// ── Real SVG Tech Stack Icons ─────────────────────────────────────────────────
const stackItems: { label: string; cat: string; icon: React.ReactNode }[] = [
  { label: "Python", cat: "Runtime", icon: <svg viewBox="0 0 24 24" width="20" height="20"><path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.963 3.403 5.963h2.031v-2.868s-.109-3.402 3.35-3.402h5.766s3.24.052 3.24-3.13V3.19S18.28 0 11.914 0zm-3.21 1.848a1.044 1.044 0 1 1 0 2.088 1.044 1.044 0 0 1 0-2.088z" fill="#366994" /><path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752H12v-.826h8.1S24 18.21 24 12.031c0-6.18-3.403-5.963-3.403-5.963h-2.031v2.868s.109 3.402-3.35 3.402H9.45s-3.24-.052-3.24 3.13V20.81S5.72 24 12.086 24zm3.21-1.848a1.044 1.044 0 1 1 0-2.088 1.044 1.044 0 0 1 0 2.088z" fill="#FFC331" /></svg> },
  { label: "FastAPI", cat: "Backend", icon: <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.624 21.36v-7.555H7.2L13.08 2.64v7.555h4.176L11.376 21.36z" fill="#009688" /></svg> },
  { label: "Next.js", cat: "Frontend", icon: <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm4.594 16.875L7.2 6h-1.8v11.999h1.8v-8.1l8.1 10.8c.507-.166.999-.373 1.474-.618L16.594 16.875zM15.6 6h1.8v12h-1.8V6z" fill="#1A1A1A" /></svg> },
  { label: "TypeScript", cat: "Language", icon: <svg viewBox="0 0 24 24" width="20" height="20"><path d="M0 12v12h24V0H0zm19.341-.956c.61.152 1.074.423 1.501.865.221.236.549.666.575.77.008.03-1.036.73-1.668 1.123-.023.015-.115-.084-.217-.236-.31-.45-.633-.644-1.128-.678-.727-.05-1.196.331-1.192.967.003.305.042.476.174.72.223.39.714.645 2.048.982 1.55.388 2.315.77 2.751 1.515.268.472.33.612.33 1.16.003.597-.1.958-.345 1.415-.568 1.062-1.735 1.652-3.095 1.652-.83 0-1.56-.162-2.17-.492-.594-.317-1.127-.856-1.38-1.378-.078-.155-.237-.552-.23-.562.01-.009.174-.112.367-.23l1.08-.622.313-.182.124.218c.18.316.45.614.757.807.357.225.627.3 1.07.3.717 0 1.177-.328 1.24-.877.001-.056.006-.112.006-.168 0-.19-.031-.3-.12-.468-.138-.263-.396-.42-1.478-.717-1.34-.36-2.07-.742-2.518-1.453-.282-.45-.366-.726-.37-1.25 0-.56.1-.892.39-1.372.547-.893 1.512-1.35 2.685-1.344.49.003.962.076 1.406.215zM13.068 12.01l.006.975H10.92v6.876H9.016V12.985H6.87v-.955c0-.528.012-.966.027-.976.012-.011 1.399-.016 3.093-.014l3.072.007.006.963z" fill="#3178C6" /></svg> },
  { label: "Longformer", cat: "NLP", icon: <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="12" fill="#FFD21E" /><text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="800" fill="#1A1A1A" fontFamily="sans-serif">HF</text></svg> },
  { label: "XGBoost", cat: "ML", icon: <svg viewBox="0 0 24 24" width="20" height="20"><rect width="24" height="24" rx="4" fill="#2C6EBF" /><path d="M4 18 L8 12 L12 15 L16 8 L20 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg> },
  { label: "LightGBM", cat: "ML", icon: <svg viewBox="0 0 24 24" width="20" height="20"><rect width="24" height="24" rx="4" fill="#00B2A9" /><path d="M5 20 L9 14 L12 17 L15 10 L19 13 M15 10 L19 10 L19 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg> },
  { label: "SHAP", cat: "XAI", icon: <svg viewBox="0 0 24 24" width="20" height="20"><rect width="24" height="24" rx="4" fill="#FF0052" /><path d="M12 4 L19 9 L16 17 L8 17 L5 9 Z" stroke="white" strokeWidth="1.5" fill="none" /><circle cx="12" cy="12" r="2" fill="white" /></svg> },
  { label: "HuggingFace", cat: "Platform", icon: <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="11" fill="#FFD21E" stroke="#FBBF24" strokeWidth="1" /><ellipse cx="9" cy="11" rx="1.8" ry="2" fill="#1A1A1A" /><ellipse cx="15" cy="11" rx="1.8" ry="2" fill="#1A1A1A" /><path d="M8 15.5 Q12 18.5 16 15.5" stroke="#1A1A1A" strokeWidth="1.2" strokeLinecap="round" fill="none" /></svg> },
  { label: "MLflow", cat: "Registry", icon: <svg viewBox="0 0 24 24" width="20" height="20"><rect width="24" height="24" rx="4" fill="#0194E2" /><path d="M4 12 Q8 6 12 12 Q16 18 20 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" /></svg> },
  { label: "Kubernetes", cat: "Orchestration", icon: <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2L21.18 7.5v9L12 22 2.82 16.5v-9L12 2z" fill="#326CE5" /><path d="M12 6v12M6.5 9l9.52 5.5M17.5 9L8 14.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" /><circle cx="12" cy="12" r="2" fill="white" /></svg> },
  { label: "MeghRaj", cat: "Infra", icon: <svg viewBox="0 0 24 24" width="20" height="20"><rect width="24" height="24" rx="4" fill="#FF9933" /><path d="M5 14C5 11.5 7 9.5 9.5 9.5H10C10.8 7.5 12.8 6 15 6C18 6 20.5 8.5 20.5 11.5H21C22.3 11.5 23 12.5 23 13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" /></svg> },
  { label: "Sarvam AI", cat: "ASR/OCR", icon: <span style={{ fontSize: 10, fontWeight: 700, color: "#4C1D95", fontFamily: "var(--font-geist-mono, monospace)" }}>sarvamai</span> },
  { label: "TF-IDF", cat: "Features", icon: <svg viewBox="0 0 24 24" width="20" height="20"><rect width="24" height="24" rx="4" fill="#6366F1" /><rect x="5" y="14" width="3" height="5" rx="1" fill="white" /><rect x="10" y="10" width="3" height="9" rx="1" fill="white" /><rect x="15" y="6" width="3" height="13" rx="1" fill="white" /></svg> },
  { label: "Uvicorn", cat: "ASGI", icon: <svg viewBox="0 0 24 24" width="20" height="20"><rect width="24" height="24" rx="4" fill="#4B5563" /><path d="M8 5 L16 12 L8 19" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { label: "Scikit-learn", cat: "ML", icon: <svg viewBox="0 0 24 24" width="20" height="20"><rect width="24" height="24" rx="4" fill="#F7931E" /><circle cx="12" cy="12" r="6" stroke="white" strokeWidth="2" fill="none" /><line x1="12" y1="6" x2="12" y2="18" stroke="white" strokeWidth="1.5" /><line x1="6" y1="12" x2="18" y2="12" stroke="white" strokeWidth="1.5" /></svg> },
];

const models = [
  { id: "m1", tag: "M1", href: "/models/dispute-classifier", name: "Dispute Classifier", tech: "Longformer", metric: "AUC-ROC 0.948", desc: "Fine-tuned Longformer classifying MSME dispute narratives into 6 statutory categories. Handles up to 1,200 tokens." },
  { id: "m2", tag: "M2", href: "/models/document-completeness", name: "Document Completeness", tech: "XGBoost + SHAP", metric: "F1 0.99", desc: "Five independent XGBoost classifiers detect presence of mandatory dispute documents, with SHAP attribution for every prediction." },
  { id: "m3", tag: "M3", href: "/models/payment-predictor", name: "Payment Outcome Predictor", tech: "LightGBM + Platt Calibration", metric: "AUC-ROC 0.891", desc: "Calibrated probability of winning a payment dispute. Platt scaling ensures legal defensibility of predicted probabilities." },
  { id: "m4", tag: "M4", href: "/models/rule-engine", name: "Legal Rule Engine", tech: "Deterministic / MSMED Act", metric: "100% exact", desc: "Pure deterministic engine encoding Sections 15 to 22 of MSMED Act. Computes exact compound interest and timeline violations." },
];

const apiRoutes = [
  { method: "POST", path: "/predict", svc: "M1 Dispute Classifier", desc: "Classify dispute into 6 MSMED Act categories" },
  { method: "POST", path: "/evaluate-case", svc: "M2 Document Completeness", desc: "Detect 5 mandatory document types, completeness score" },
  { method: "POST", path: "/predict", svc: "M3 Payment Predictor", desc: "Calibrated win probability with SHAP attributions" },
  { method: "POST", path: "/evaluate-case", svc: "M4 Rule Engine", desc: "Exact interest computation per MSMED Act Section 16" },
  { method: "GET", path: "/health", svc: "All services", desc: "Health check and model version info" },
];

function StackPill({ label, cat, icon }: { label: string; cat: string; icon: React.ReactNode }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "8px 16px", borderRadius: 9999,
      border: "1px solid #E7E5E4", backgroundColor: "#FFFFFF",
      marginRight: 12, flexShrink: 0,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1917", lineHeight: 1.2, whiteSpace: "nowrap" }}>{label}</div>
        <div style={{ fontSize: 10, color: "#A8A29E", fontFamily: "var(--font-geist-mono)", lineHeight: 1 }}>{cat}</div>
      </div>
    </div>
  );
}

// ── Scrolling headline ────────────────────────────────────────────────────────
const bannerPhrases = [
  { text: "Dispute Classification", accent: false },
  { text: "Statutory Computation", accent: true },
  { text: "Document Validation", accent: false },
  { text: "Outcome Prediction", accent: true },
  { text: "Legal Intelligence", accent: false },
  { text: "SHAP Explainability", accent: true },
];

function ScrollingBanner() {
  const items = [...bannerPhrases, ...bannerPhrases];
  return (
    <div style={{
      position: "relative", width: "100%", overflow: "hidden",
      padding: "28px 0", borderTop: "1px solid #F0EFED", borderBottom: "1px solid #F0EFED",
      backgroundColor: "#FAFAF9",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(to right, #FAFAF9, transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(to left, #FAFAF9, transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{
        display: "flex", alignItems: "center", width: "max-content",
        animation: "marquee 30s linear infinite",
      }}>
        {items.map((p, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
            <span style={{
              fontSize: "clamp(26px, 4.8vw, 56px)", fontWeight: 800,
              letterSpacing: "-0.04em", lineHeight: 1,
              color: p.accent ? "#D97706" : "#1C1917",
              whiteSpace: "nowrap",
            }}>{p.text}</span>
            <span style={{
              display: "inline-block", width: 6, height: 6, borderRadius: "50%",
              backgroundColor: "#D6D3D1", margin: "0 28px", flexShrink: 0,
            }} />
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [diagTab, setDiagTab] = useState<"high" | "low">("high");
  const doubled = [...stackItems, ...stackItems];

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="hero-container" style={{ borderBottom: "1px solid #E7E5E4", paddingTop: 40, overflow: "hidden", position: "relative" }}>

        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "20px 24px 0", position: "relative", zIndex: 1 }}>
          {/* Centered Hero Layout with Glassmorphism */}
          <div className="normal-panel" style={{ padding: "48px 40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 32 }}>
            <div>
              {/* Brand Row - Official Branding */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, marginBottom: 24, flexWrap: "wrap" }}>
                {/* MSME Logo */}
                <Image src="/msme-logo-new.png" alt="Ministry of MSME" width={140} height={70} style={{ objectFit: "contain" }} />

                <div style={{ width: 1, height: 24, backgroundColor: "#E7E5E4" }} />

                {/* Make in India Lion */}
                <Image src="/make-in-india-new.png" alt="Make in India Lion" width={140} height={70} style={{ objectFit: "contain" }} priority />

                <div style={{ width: 1, height: 24, backgroundColor: "#E7E5E4" }} />

                {/* ODR Logo */}
                <Image src="/odr-logo-new.webp" alt="ODR Portal" width={120} height={60} style={{ objectFit: "contain" }} />
              </div>

              <h1 style={{
                fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800,
                color: "#1C1917", letterSpacing: "-0.04em",
                lineHeight: 1.05, marginBottom: 16, marginTop: 0,
              }}>
                Samadhan AI
              </h1>

              <p style={{ fontSize: 15, color: "#57534E", lineHeight: 1.75, maxWidth: 540, marginBottom: 32, marginTop: 0 }}>
                A fully in-house AI system for MSME dispute classification, statutory computation,
                document validation, and outcome prediction built for the MSMED Act, 2006.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
                <a href="#architecture" className="btn btn-dark">
                  View Architecture
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5h9M7 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a href="#models" className="btn btn-outline">Explore Models</a>
                <a href="https://huggingface.co/abhinavdread" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  HuggingFace
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 9L9 2M9 2H4M9 2v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
      <div style={{ marginTop: 24 }}>
        <ScrollingBanner />
      </div>

      {/* Quick stats bar */}
      <div style={{ backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            {[["4", "In-house Models"], ["0.948", "Best AUC-ROC"], ["< 50ms", "Avg Inference"], ["F1 0.99", "Document Score"]].map(([v, l], i) => (
              <div key={l} style={{ padding: "20px 28px", borderRight: i < 3 ? "1px solid #F0EFED" : "none" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#1C1917", letterSpacing: "-0.04em" }}>{v}</div>
                <div style={{ fontSize: 12.5, color: "#78716C", marginTop: 3, fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>




      {/* ── ARCHITECTURE ──────────────────────────────────────────────────── */}
      <section id="architecture" style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 24px" }}>
        <FadeIn>
          <div style={{ marginBottom: 32 }}>
            <div className="label-tag" style={{ marginBottom: 8 }}>Architecture</div>
            <h2 className="section-h2" style={{ marginBottom: 10 }}>System Architecture</h2>
            <p style={{ fontSize: 14, color: "#78716C", maxWidth: 540, lineHeight: 1.65 }}>
              End-to-end pipeline from dispute intake through AI analysis to legally defensible output.
              Click any amber node to view model details.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={80}>
          <div style={{ display: "flex", gap: 0, border: "1.5px solid #E7E5E4", borderRadius: 8, overflow: "hidden", width: "fit-content", marginBottom: 20 }}>
            {(["high", "low"] as const).map(tab => (
              <button key={tab} onClick={() => setDiagTab(tab)} style={{
                padding: "8px 22px", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                backgroundColor: diagTab === tab ? "#1C1917" : "#FFFFFF",
                color: diagTab === tab ? "#FFFFFF" : "#78716C",
                border: "none", cursor: "pointer", transition: "all 0.15s",
              }}>
                {tab === "high" ? "High-Level" : "Low-Level Pipeline"}
              </button>
            ))}
          </div>
          <div style={{ border: "1.5px solid #E7E5E4", borderRadius: 10, overflow: "hidden", backgroundColor: "#FFFFFF" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid #E7E5E4", backgroundColor: "#FAFAF9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#57534E" }}>
                {diagTab === "high" ? "High-Level Architecture: Application, AI Model and Data Layers" : "Low-Level Pipeline: Data flow from intake to final output"}
              </span>
              <span style={{ fontSize: 11, color: "#A8A29E" }}>Amber nodes = in-house models (clickable)</span>
            </div>
            <div style={{ padding: "20px 16px" }}>
              {diagTab === "high" ? <HighLevelDiagram /> : <LowLevelDiagram />}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── MODELS ────────────────────────────────────────────────────────── */}
      <section id="models" style={{ backgroundColor: "#FAFAF9", borderTop: "1px solid #E7E5E4", borderBottom: "1px solid #E7E5E4" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 24px" }}>
          <FadeIn>
            <div style={{ marginBottom: 32 }}>
              <div className="label-tag" style={{ marginBottom: 8 }}>Models</div>
              <h2 className="section-h2" style={{ marginBottom: 10 }}>In-House AI Models</h2>
              <p style={{ fontSize: 14, color: "#78716C", maxWidth: 540, lineHeight: 1.65 }}>
                Four purpose-built models. Zero reliance on general-purpose LLM API calls in the core pipeline.
              </p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {models.map((m, i) => (
              <FadeIn key={m.id} delay={i * 60}>
                <Link href={m.href} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E7E5E4", borderRadius: 10, padding: 22, height: "100%", transition: "border-color 0.15s, box-shadow 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#D6D3D1"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E7E5E4"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#78350F", backgroundColor: "#FDE68A", border: "1px solid #FCD34D", borderRadius: 5, padding: "3px 9px", fontFamily: "var(--font-geist-mono)", letterSpacing: "0.06em" }}>{m.tag}</span>
                      <span style={{ fontSize: 10.5, color: "#166534", backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{m.metric}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1C1917", marginBottom: 5, letterSpacing: "-0.02em" }}>{m.name}</div>
                    <div style={{ fontSize: 11.5, color: "#A8A29E", fontFamily: "var(--font-geist-mono)", marginBottom: 12 }}>{m.tech}</div>
                    <p style={{ fontSize: 13.5, color: "#44403C", lineHeight: 1.65, margin: 0 }}>{m.desc}</p>
                    <div style={{ marginTop: 16, fontSize: 12.5, color: "#B45309", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      View model
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── API REFERENCE ─────────────────────────────────────────────────── */}
      <section id="api" style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 24px" }}>
        <FadeIn>
          <div style={{ marginBottom: 32 }}>
            <div className="label-tag" style={{ marginBottom: 8 }}>API Reference</div>
            <h2 className="section-h2" style={{ marginBottom: 10 }}>Endpoints</h2>
            <p style={{ fontSize: 14, color: "#78716C", maxWidth: 540, lineHeight: 1.65 }}>
              All endpoints are available on HuggingFace Spaces. Visit individual model pages for the interactive API explorer.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={80}>
          <div style={{ border: "1.5px solid #E7E5E4", borderRadius: 10, overflow: "hidden" }}>
            {apiRoutes.map((r, i) => (
              <div key={r.path + r.svc} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", borderBottom: i < apiRoutes.length - 1 ? "1px solid #F5F5F4" : "none", backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#FAFAF9" }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, fontFamily: "var(--font-geist-mono)", backgroundColor: r.method === "GET" ? "#F0FDF4" : "#FFFBEB", color: r.method === "GET" ? "#166534" : "#92400E", border: `1px solid ${r.method === "GET" ? "#BBF7D0" : "#FDE68A"}`, padding: "2px 8px", borderRadius: 4, minWidth: 40, textAlign: "center" }}>{r.method}</span>
                <code style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "#1C1917", fontWeight: 600, minWidth: 140 }}>{r.path}</code>
                <span style={{ fontSize: 11, color: "#A8A29E", minWidth: 160 }}>{r.svc}</span>
                <span style={{ fontSize: 12.5, color: "#57534E" }}>{r.desc}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <Link href="/models/dispute-classifier" className="btn btn-dark btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Try API Explorer
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── TECH STACK ────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#FAFAF9", borderTop: "1.5px solid #E7E5E4", borderBottom: "1.5px solid #E7E5E4", padding: "56px 0" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px 28px" }}>
          <div className="label-tag" style={{ marginBottom: 8, textAlign: "center" }}>Technology Stack</div>
          <h2 className="section-h2" style={{ textAlign: "center", marginBottom: 4 }}>Built with Purpose</h2>
          <p style={{ textAlign: "center", fontSize: 14, color: "#78716C", lineHeight: 1.65 }}>
            Every tool chosen for legal defensibility, performance, and Indian infrastructure compatibility.
          </p>
        </div>
        <div className="marquee-wrap" style={{ marginBottom: 12 }}>
          <div className="marquee-track">
            {doubled.map((item, i) => <StackPill key={i} {...item} />)}
          </div>
        </div>
        <div className="marquee-wrap">
          <div className="marquee-track" style={{ animationDirection: "reverse", animationDuration: "34s" }}>
            {[...doubled].reverse().map((item, i) => <StackPill key={i} {...item} />)}
          </div>
        </div>
      </section>

      {/* ── RESPONSIBLE AI + MAKE IN INDIA ────────────────────────────────── */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 24px" }}>
        <FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ border: "1.5px solid #FDE68A", borderRadius: 10, padding: 28, backgroundColor: "#FFFBEB" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <IndiaFlag width={32} height={21} />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#78350F", letterSpacing: "-0.02em" }}>Make in India</span>
              </div>
              <p style={{ fontSize: 14, color: "#92400E", lineHeight: 1.7, margin: 0 }}>
                All four AI models are trained and deployed in-house on Indian infrastructure.
                Zero reliance on foreign AI APIs for core intelligence. Hosted on MeghRaj Kubernetes Cluster.
              </p>
            </div>
            <div style={{ border: "1.5px solid #BBF7D0", borderRadius: 10, padding: 28, backgroundColor: "#F0FDF4" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="9" stroke="#16A34A" strokeWidth="1.5" />
                  <path d="M7 11l3 3 5-5" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#166534", letterSpacing: "-0.02em" }}>Responsible AI</span>
              </div>
              <p style={{ fontSize: 14, color: "#166534", lineHeight: 1.7, margin: 0 }}>
                SHAP explanations on every prediction. Real-world data scraped from Indian Kanoon, filtered and labeled using Gemini 1.5 Pro. No real MSME case PII.
                Deterministic rule engine for legally binding computations. DPDP Act compliant.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
