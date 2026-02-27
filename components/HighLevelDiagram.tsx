"use client";
import { useRouter } from "next/navigation";

// ── SarvamAI inline SVG logo — full wordmark pill  ────────────────────────────
function SarvamLogo({ size = 14 }: { size?: number }) {
  return (
    <span style={{
      fontSize: size,
      fontWeight: 700,
      color: "#4C1D95",
      fontFamily: "var(--font-geist-mono, monospace)"
    }}>
      sarvamai
    </span>
  );
}

// ── M-tag pill ─────────────────────────────────────────────────────────────────
function MTag({ tag }: { tag: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: "#d97706",
      backgroundColor: "#fffbeb", border: "1px solid #fde68a",
      borderRadius: 6, padding: "2px 7px",
      fontFamily: "var(--font-geist-mono, monospace)", letterSpacing: "0.04em",
      flexShrink: 0,
    }}>{tag}</span>
  );
}

const appServices = [
  "1. Case Intake Service",
  "2. Document Processing Service",
  "3. Legal Intelligence Service",
  "4. Prediction Engine Service",
  "5. Negotiation Engine Service",
  "6. LLM Drafting Service",
  "7. Explainability and Audit Service",
];

const aiModels: {
  label: string; sub: string;
  type: "inhouse" | "sarvam" | "external";
  tag?: string; route?: string;
}[] = [
    { label: "ASR Model", sub: "Speech-to-text, language detection", type: "sarvam" },
    { label: "OCR Engine", sub: "Text extraction from documents", type: "sarvam" },
    { label: "Dispute Classifier", sub: "Category prediction · MSMED Act", type: "inhouse", tag: "M1", route: "/models/dispute-classifier" },
    { label: "Document Completeness", sub: "Missing doc detection and scoring", type: "inhouse", tag: "M2", route: "/models/document-completeness" },
    { label: "Outcome Predictor", sub: "Win probability, Platt-calibrated", type: "inhouse", tag: "M3", route: "/models/payment-predictor" },
    { label: "Sentiment Model", sub: "Fine-tuned small transformer", type: "external" },
    { label: "LLM Drafting", sub: "RAG-based generation engine", type: "external" },
    { label: "Legal Rule Engine", sub: "Deterministic · MSMED Act rules", type: "inhouse", tag: "M4", route: "/models/rule-engine" },
    { label: "Negotiation Engine", sub: "Settlement bands · Strategy · Gemini drafting", type: "inhouse", tag: "M5", route: "/models/negotiation-engine" },
  ];

const dataLayer = [
  "PostgreSQL · Case Data",
  "Object Storage · Documents",
  "Feature Store · ML features",
  "MLflow · Model Registry",
  "Audit Logs · Immutable",
];

function FlowArrow() {
  return (
    <div style={{ display: "flex", alignItems: "center", flexShrink: 0, padding: "0 6px" }}>
      <div style={{ width: 24, height: 1.5, backgroundColor: "#C7C4BF" }} />
      <svg width="10" height="14" viewBox="0 0 10 14" fill="none" style={{ marginLeft: -1 }}>
        <path d="M2 2L8 7L2 12" stroke="#C7C4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function HighLevelDiagram() {
  const router = useRouter();

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ minWidth: 920, padding: "8px 4px" }}>

        {/* ── Main horizontal flow ── */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>

          {/* 1 · Web App */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              border: "1px solid #e2e8f0", borderRadius: 12, backgroundColor: "#ffffff",
              padding: "20px 16px", textAlign: "center", width: 120,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
            }}>
              <svg width="24" height="22" viewBox="0 0 22 20" fill="none">
                <rect x="1" y="3" width="20" height="14" rx="3" stroke="#64748b" strokeWidth="1.5" />
                <path d="M1 7.5h20" stroke="#64748b" strokeWidth="1.5" />
                <circle cx="4" cy="5.25" r="1" fill="#f59e0b" />
                <circle cx="7" cy="5.25" r="1" fill="#cbd5e1" />
                <circle cx="10" cy="5.25" r="1" fill="#cbd5e1" />
              </svg>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>Web App</div>
              <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.4 }}>Unified Interface</div>
            </div>
          </div>

          <FlowArrow />

          {/* 2 · API Gateway */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              border: "1px solid #bae6fd", borderRadius: 12, backgroundColor: "#f0f9ff",
              padding: "20px 16px", textAlign: "center", width: 120,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L21 6.5v11L12 22 3 17.5v-11L12 2z" stroke="#0ea5e9" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="#0ea5e9" strokeWidth="1.5" />
              </svg>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#075985", lineHeight: 1.2 }}>Gateway</div>
              <div style={{ fontSize: 10, color: "#0369a1", lineHeight: 1.4 }}>Security & Auth</div>
            </div>
          </div>

          <FlowArrow />

          {/* 3 · Application Layer */}
          <div style={{
            flex: 1, border: "1px solid #e2e8f0", borderRadius: 12,
            backgroundColor: "#ffffff", overflow: "hidden",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
          }}>
            <div style={{
              backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0",
              padding: "10px 14px", textAlign: "center",
              fontSize: 10, fontWeight: 800, color: "#64748b",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Intelligence Center
            </div>

            <div style={{ display: "flex", height: "100%" }}>
              {/* Services column */}
              <div style={{ width: 190, borderRight: "1px solid #e2e8f0", padding: "16px 14px", flexShrink: 0, backgroundColor: "#fcfdff" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Back-end Modules</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {appServices.map(s => (
                    <div key={s} style={{
                      fontSize: 11, color: "#334155", lineHeight: 1.4,
                      padding: "5px 8px", borderRadius: 6, backgroundColor: "#ffffff",
                      border: "1px solid #f1f5f9",
                    }}>{s}</div>
                  ))}
                </div>
              </div>

              {/* AI Model Layer column */}
              <div style={{ flex: 1, borderRight: "1.5px solid #E7E5E4", overflow: "hidden" }}>
                <div style={{
                  backgroundColor: "#FFFBEB", borderBottom: "1.5px solid #FDE68A",
                  padding: "7px 12px", textAlign: "center",
                  fontSize: 9, fontWeight: 800, color: "#92400E",
                  letterSpacing: "0.09em", textTransform: "uppercase",
                }}>
                  AI Model Layer
                </div>
                <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
                  {aiModels.map(m => {
                    if (m.type === "sarvam") {
                      return (
                        <div key={m.label} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "8px 12px", borderRadius: 8,
                          border: "1px solid #e0e7ff", backgroundColor: "#f5f7ff", gap: 8,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <SarvamLogo size={13} />
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#4338ca" }}>{m.label}</span>
                          </div>
                          <span style={{ fontSize: 9.5, color: "#6366f1", fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap" }}>{m.sub}</span>
                        </div>
                      );
                    }
                    if (m.type === "inhouse") {
                      return (
                        <button
                          key={m.label}
                          onClick={() => router.push(m.route!)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            width: "100%", padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                            border: "1px solid #fde68a", backgroundColor: "#fffdf5",
                            textAlign: "left", gap: 8, transition: "all 0.15s ease",
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#fff9db"; (e.currentTarget as HTMLElement).style.borderColor = "#facc15"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#fffdf5"; (e.currentTarget as HTMLElement).style.borderColor = "#fde68a"; }}
                          title="Click to view model page"
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            {m.tag && <MTag tag={m.tag} />}
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#92400e" }}>{m.label}</span>
                          </div>
                          <span style={{ fontSize: 9.5, color: "#d97706", whiteSpace: "nowrap", fontFamily: "var(--font-geist-mono)" }}>{m.sub}</span>
                        </button>
                      );
                    }
                    return (
                      <div key={m.label} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "6px 10px", borderRadius: 6,
                        border: "1px solid #E7E5E4", backgroundColor: "#FAFAF9", gap: 8,
                      }}>
                        <span style={{ fontSize: 11.5, fontWeight: 500, color: "#57534E" }}>{m.label}</span>
                        <span style={{ fontSize: 9.5, color: "#A8A29E", fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap" }}>{m.sub}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Data Layer */}
                <div style={{ margin: "0 10px 12px", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", backgroundColor: "#f8fafc" }}>
                  <div style={{
                    backgroundColor: "#f1f5f9", padding: "8px 10px", textAlign: "center",
                    fontSize: 9, fontWeight: 800, color: "#64748b",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    borderBottom: "1px solid #e2e8f0",
                  }}>Data Residency</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, padding: 10 }}>
                    {dataLayer.map(d => (
                      <div key={d} style={{
                        fontSize: 10, color: "#475569", padding: "5px 8px",
                        borderRadius: 6, border: "1px solid #e2e8f0", backgroundColor: "#ffffff", lineHeight: 1.4,
                      }}>{d}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FlowArrow />

          {/* 4 · MeghRaj */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              border: "1px solid #bae6fd", borderRadius: 12, backgroundColor: "#f0f9ff",
              padding: "20px 16px", textAlign: "center", width: 120,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
            }}>
              <svg width="26" height="22" viewBox="0 0 24 20" fill="none">
                <path d="M5 16C3.2 15.4 1 13.2 1 10.5C1 7.5 3.5 5 6.5 5H7C8 2.5 10.5 1 13 1C16.5 1 19.5 3.8 19.5 7.5H20C22 7.5 23 9 23 10.5C23 12.5 21.5 14 19.5 14" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 16l3-3 3 3M12 13v7" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#075985", lineHeight: 1.2 }}>Cloud Infra</div>
              <div style={{ fontSize: 10, color: "#0369a1", lineHeight: 1.4 }}>NIC MeghRaj Cluster</div>
            </div>
          </div>

        </div>

        {/* ── Legend ── */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18, marginTop: 14, paddingTop: 12, borderTop: "1px solid #F0EFED", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, border: "1.5px solid #FDE68A", backgroundColor: "#FFFBEB" }} />
            <span style={{ fontSize: 11, color: "#78716C" }}>In-house model (clickable)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, border: "1.5px solid #C4B5FD", backgroundColor: "#F5F3FF" }} />
            <span style={{ fontSize: 11, color: "#78716C" }}>SarvamAI (external)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, border: "1px solid #E7E5E4", backgroundColor: "#FAFAF9" }} />
            <span style={{ fontSize: 11, color: "#78716C" }}>External / Third-party</span>
          </div>
        </div>

      </div>
    </div>
  );
}
