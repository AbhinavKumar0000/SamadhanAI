"use client";
import Link from "next/link";
import ApiExplorer from "@/components/ApiExplorer";


const rules = [
  { section: "Section 15", desc: "Buyer must make payment within 15 days of acceptance or agreed period (max 45 days)." },
  { section: "Section 16", desc: "On default, compound interest at 3× RBI Bank Rate accrues from the agreed payment date." },
  { section: "Section 17", desc: "Buyer must pay principal plus all accrued compound interest to the MSME seller." },
  { section: "Section 18", desc: "Either party may refer dispute to Micro and Small Enterprises Facilitation Council." },
  { section: "Section 22", desc: "Buyer's income tax deduction lapses if MSME payment not made within deadline." },
];

export default function RuleEnginePage() {
  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid #E7E5E4", backgroundColor: "#FAFAF9" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 24px 36px" }}>
          <Link href="/#models" style={{ fontSize: 12, color: "#78716C", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
            ← All Models
          </Link>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span className="badge-amber">M4</span>
                <span style={{ fontSize: 12, color: "#78716C", fontFamily: "JetBrains Mono, monospace" }}>Deterministic · Python</span>
                <span className="badge-stone">No ML · Statutory Logic</span>
              </div>
              <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 700, color: "#1C1917", letterSpacing: "-0.03em", marginBottom: 8, lineHeight: 1.15 }}>
                MSME Legal Rule Engine
              </h1>
              <p style={{ fontSize: 14, color: "#78716C", maxWidth: 560, lineHeight: 1.65, margin: 0 }}>
                Pure deterministic rule engine encoding MSMED Act, 2006 statutory provisions (Sections 15–22).
                Computes exact compound interest, validates payment timelines, and generates full reasoning traces.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ border: "1px solid #E7E5E4", borderRadius: 8, padding: "12px 16px", backgroundColor: "#FAFAF9" }}>
                <div style={{ fontSize: 10, color: "#A8A29E", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Status</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1917" }}>100% Deterministic · No ML</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px" }}>

        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>API Explorer</div>
          <ApiExplorer modelId="m4" />
        </section>

        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>Overview</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { title: "Problem", body: "MSME claimants need exact statutory interest computations per the MSMED Act. Any ML approximation is legally indefensible." },
              { title: "Design", body: "Pure Python implementation of Sections 15–22 of MSMED Act, 2006. RBI bank rates encoded as versioned constants. No external rate APIs." },
              { title: "Why Deterministic", body: "Legal amounts must be exact and reproducible. A probabilistic model predicting '≈₹12,000 interest' cannot serve as basis for a binding facilitation order." },
            ].map(c => (
              <div key={c.title} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#A8A29E", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>{c.title}</div>
                <p style={{ fontSize: 13, color: "#57534E", lineHeight: 1.65, margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>Encoded Statutory Provisions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rules.map(r => (
              <div key={r.section} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, padding: "12px 16px", display: "flex", gap: 16 }}>
                <code style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#D97706", fontWeight: 600, minWidth: 100, flexShrink: 0 }}>{r.section}</code>
                <p style={{ fontSize: 13, color: "#57534E", lineHeight: 1.6, margin: 0 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>Interest Computation Formula</div>
          <pre style={{
            margin: 0, padding: "18px 20px", backgroundColor: "#1C1917", borderRadius: 8,
            fontFamily: "JetBrains Mono, monospace", fontSize: 12, lineHeight: 1.75, color: "#A8A29E",
            overflow: "auto", whiteSpace: "pre-wrap",
          }}>{`# MSMED Act, 2006 — Section 16 Compound Interest

statutory_rate   = rbi_bank_rate × 3          # 3× RBI Bank Rate
daily_rate       = statutory_rate / 365
interest_amount  = principal × daily_rate × days_overdue

# Example Calculation:
# RBI Bank Rate : 6.5%  →  Statutory Rate : 19.5% p.a.
# Invoice       : ₹2,50,000
# Days Overdue  : 67
# Interest      = 2,50,000 × (19.5/365) × 67 = ₹8,945
# Total Payable = ₹2,50,000 + ₹8,945 = ₹2,58,945`}</pre>
        </section>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, paddingTop: 20, borderTop: "1px solid #E7E5E4" }}>
          <Link href="/models/payment-predictor" className="btn btn-outline btn-sm">← Payment Predictor</Link>
          <Link href="/demo" className="btn btn-outline btn-sm">Full Pipeline Demo</Link>
          <Link href="/models/negotiation-engine" className="btn btn-outline btn-sm">Negotiation Engine →</Link>
        </div>
      </div>
    </div>
  );
}
