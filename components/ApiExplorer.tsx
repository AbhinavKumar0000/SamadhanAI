"use client";

import { useState } from "react";

// ─── Model configurations ─────────────────────────────────────────────────────
const MODELS = {
  m1: {
    name: "Dispute Classifier",
    tag: "M1",
    method: "POST",
    endpoint: "/predict",
    baseUrl: "https://abhinavdread-msme-legal-dispute-classifier-longformer.hf.space",
    description: "Classifies dispute narrative into one of six statutory categories under MSMED Act, 2006.",
    fields: [
      {
        key: "text",
        label: "Dispute Narrative",
        type: "textarea" as const,
        placeholder: "e.g. The buyer has defaulted on Invoice INV-2024-001 dated 15 January 2024. Amount Rs 2,50,000 remains outstanding. 67 days have elapsed since the agreed payment date of 45 days under the MSMED Act 2006.",
        required: true,
      },
    ],
    sampleRequest: `{
  "text": "Buyer defaulted on Invoice INV-2024-001 dated 15-Jan-2024. Rs 2,50,000 outstanding. 67 days elapsed since agreed payment date."
}`,
    sampleResponse: `{
  "label": "payment_delay",
  "confidence": 0.847,
  "label_index": 4,
  "probabilities": {
    "payment_delay": 0.847,
    "contract_breach": 0.053,
    "quality_dispute": 0.042,
    "delivery_failure": 0.031,
    "documentation_dispute": 0.018,
    "statutory_violation": 0.009
  }
}`,
    latency: "38ms",
    curlCmd: `curl -X POST "https://abhinavdread-msme-legal-dispute-classifier-longformer.hf.space/predict" \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Buyer defaulted on Invoice INV-2024-001..."}'`,
  },
  m2: {
    name: "Document Completeness",
    tag: "M2",
    method: "POST",
    endpoint: "/evaluate-case",
    baseUrl: "https://abhinavdread-msme-document-presence-xgboost.hf.space",
    description: "Detects presence of five mandatory MSME dispute documents from case description text.",
    fields: [
      {
        key: "text",
        label: "Case Description",
        type: "textarea" as const,
        placeholder: "e.g. Invoice INV-001 for Rs 2.5L submitted. Purchase Order PO-876 attached. GSTIN 27AADCS0472N1Z1 verified. Contract not yet submitted by buyer.",
        required: true,
      },
    ],
    sampleRequest: `{
  "text": "Invoice INV-001 for Rs 2.5L. PO-876 signed. GSTIN verified. Contract not submitted."
}`,
    sampleResponse: `{
  "completeness_score": 0.75,
  "missing_documents": ["contract"],
  "present_documents": ["invoice", "po", "gst", "delivery_challan"],
  "results": {
    "invoice": { "present": true, "confidence": 0.98 },
    "purchase_order": { "present": true, "confidence": 0.96 },
    "delivery_challan": { "present": true, "confidence": 0.91 },
    "gst_certificate": { "present": true, "confidence": 0.99 },
    "contract": { "present": false, "confidence": 0.87 }
  }
}`,
    latency: "24ms",
    curlCmd: `curl -X POST "https://abhinavdread-msme-document-presence-xgboost.hf.space/evaluate-case" \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Invoice INV-001 for Rs 2.5L..."}'`,
  },
  m3: {
    name: "Payment Predictor",
    tag: "M3",
    method: "POST",
    endpoint: "/predict",
    baseUrl: "https://abhinavdread-msme-payment-outcome-predictor-lightgbm.hf.space",
    description: "Predicts win probability for MSME payment disputes using calibrated LightGBM classifier.",
    fields: [
      { key: "invoice_amount", label: "Invoice Amount (₹)", type: "number" as const, placeholder: "250000" },
      { key: "days_overdue", label: "Days Overdue", type: "number" as const, placeholder: "67" },
      { key: "document_completeness_score", label: "Document Completeness (0–1)", type: "number" as const, placeholder: "0.8" },
      { key: "buyer_category", label: "Buyer Category", type: "select" as const, options: ["micro", "small", "medium", "large_enterprise", "government"] },
      { key: "prior_disputes_count", label: "Prior Disputes Count", type: "number" as const, placeholder: "0" },
    ],
    sampleRequest: `{
  "invoice_amount": 250000,
  "days_overdue": 67,
  "document_completeness_score": 0.8,
  "buyer_category": "large_enterprise",
  "prior_disputes_count": 0
}`,
    sampleResponse: `{
  "win_probability": 0.743,
  "settlement_probability": 0.631,
  "calibrated": true,
  "statutory_interest_applicable": true,
  "shap_explanation": {
    "days_overdue": 0.183,
    "document_completeness_score": 0.147,
    "invoice_amount": 0.112,
    "buyer_category": 0.089,
    "prior_disputes_count": 0.041
  }
}`,
    latency: "12ms",
    curlCmd: `curl -X POST "https://abhinavdread-msme-payment-outcome-predictor-lightgbm.hf.space/predict" \\
  -H "Content-Type: application/json" \\
  -d '{"invoice_amount":250000,"days_overdue":67,...}'`,
  },
  m4: {
    name: "Legal Rule Engine",
    tag: "M4",
    method: "POST",
    endpoint: "/evaluate-case",
    baseUrl: "https://abhinavdread-msme-legal-rule-engine.hf.space",
    description: "Deterministic MSMED Act statutory rule engine. Computes exact compound interest and validates timelines.",
    fields: [
      { key: "invoice_amount", label: "Invoice Amount (₹)", type: "number" as const, placeholder: "250000" },
      { key: "days_overdue", label: "Days Overdue", type: "number" as const, placeholder: "67" },
      { key: "agreed_period_days", label: "Agreed Period (days)", type: "number" as const, placeholder: "45" },
      { key: "rbi_bank_rate_pct", label: "RBI Bank Rate (%)", type: "number" as const, placeholder: "6.5" },
    ],
    sampleRequest: `{
  "invoice_amount": 250000,
  "days_overdue": 67,
  "agreed_period_days": 45,
  "rbi_bank_rate_pct": 6.5
}`,
    sampleResponse: `{
  "eligible": true,
  "statutory_rate_pct": 19.5,
  "statutory_interest_rs": 8945,
  "total_payable_rs": 258945,
  "reasoning_trace": [
    "Section 15: Payment agreed within 45 days — overdue by 67 days",
    "Section 16: Statutory rate = 3 × RBI Bank Rate = 3 × 6.5% = 19.5% p.a.",
    "Interest = ₹2,50,000 × 19.5% × 67/365 = ₹8,945",
    "Section 17: Total payable = ₹2,50,000 + ₹8,945 = ₹2,58,945"
  ]
}`,
    latency: "4ms",
    curlCmd: `curl -X POST "https://abhinavdread-msme-legal-rule-engine.hf.space/evaluate-case" \\
  -H "Content-Type: application/json" \\
  -d '{"invoice_amount":250000,"days_overdue":67,"rbi_bank_rate_pct":6.5}'`,
  },
};

type ModelKey = keyof typeof MODELS;
type ViewMode = "playground" | "curl" | "schema";

// ─── Simulated inference delay ────────────────────────────────────────────────
async function simulateInference(modelId: ModelKey, _inputs: Record<string, string>): Promise<string> {
  const delays: Record<ModelKey, number> = { m1: 820, m2: 600, m3: 350, m4: 120 };
  await new Promise(r => setTimeout(r, delays[modelId]));
  return MODELS[modelId].sampleResponse;
}

export default function ApiExplorer({ modelId }: { modelId: ModelKey }) {
  const model = MODELS[modelId];
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [view, setView] = useState<ViewMode>("playground");
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setResponse(null);
    const t0 = performance.now();
    const resp = await simulateInference(modelId, inputs);
    const t1 = performance.now();
    setElapsed(Math.round(t1 - t0));
    setResponse(resp);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response || model.sampleResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const fillSample = () => {
    // Pre-fill fields with sample values parsed from sampleRequest
    try {
      const parsed = JSON.parse(model.sampleRequest);
      const filled: Record<string, string> = {};
      model.fields.forEach(f => {
        if (parsed[f.key] !== undefined) filled[f.key] = String(parsed[f.key]);
      });
      setInputs(filled);
    } catch { /* ignore */ }
  };

  return (
    <div style={{ border: "1px solid #E7E5E4", borderRadius: 10, overflow: "hidden", backgroundColor: "#FFFFFF" }}>

      {/* Header bar */}
      <div style={{ backgroundColor: "#FAFAF9", borderBottom: "1px solid #E7E5E4", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", backgroundColor: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A", padding: "2px 8px", borderRadius: 4, fontFamily: "inter" }}>
            {model.tag}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1C1917" }}>{model.name}</span>
          <span style={{ fontSize: 11, color: "#78716C" }}>{model.description}</span>
        </div>
        <a href={`${model.baseUrl}`} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 11, color: "#78716C", textDecoration: "none", fontFamily: "JetBrains Mono, monospace" }}
          onMouseEnter={e => (e.target as HTMLElement).style.color = "#1C1917"}
          onMouseLeave={e => (e.target as HTMLElement).style.color = "#78716C"}
        >
          HuggingFace Space ↗
        </a>
      </div>

      {/* Endpoint strip */}
      <div style={{ padding: "10px 18px", borderBottom: "1px solid #E7E5E4", display: "flex", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF" }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", fontFamily: "JetBrains Mono, monospace",
          backgroundColor: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A", padding: "2px 8px", borderRadius: 4,
        }}>
          {model.method}
        </span>
        <code style={{ fontSize: 12, color: "#78716C", fontFamily: "JetBrains Mono, monospace" }}>
          {model.baseUrl}
        </code>
        <code style={{ fontSize: 12, color: "#1C1917", fontFamily: "JetBrains Mono, monospace", fontWeight: 600 }}>
          {model.endpoint}
        </code>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#A8A29E", fontFamily: "JetBrains Mono, monospace" }}>avg {model.latency}</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", borderBottom: "1px solid #E7E5E4", backgroundColor: "#FFFFFF" }}>
        {(["playground", "curl", "schema"] as ViewMode[]).map(tab => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            style={{
              padding: "9px 16px", fontSize: 12, fontWeight: 500, fontFamily: "inherit",
              color: view === tab ? "#1C1917" : "#78716C",
              borderBottom: view === tab ? "2px solid #D97706" : "2px solid transparent",
              backgroundColor: "transparent", border: "none", borderBottomWidth: 2,
              borderBottomStyle: "solid", borderBottomColor: view === tab ? "#D97706" : "transparent",
              cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s",
              letterSpacing: "-0.01em",
            }}
          >
            {tab === "playground" ? "⚡ Playground" : tab === "curl" ? "⌘ cURL" : "◈ Schema"}
          </button>
        ))}
      </div>

      {/* Playground view */}
      {view === "playground" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 320 }}>
          {/* Left: inputs */}
          <div style={{ padding: 18, borderRight: "1px solid #E7E5E4" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#A8A29E", letterSpacing: "0.07em", textTransform: "uppercase" }}>Request Body</span>
              <button onClick={fillSample}
                style={{ fontSize: 11, color: "#D97706", backgroundColor: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", padding: 0 }}>
                Fill sample
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {model.fields.map(field => (
                <div key={field.key}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#57534E", marginBottom: 4, fontFamily: "JetBrains Mono, monospace" }}>
                    {field.key}
                    {("required" in field && field.required) && <span style={{ color: "#DC2626", marginLeft: 2 }}>*</span>}
                  </label>
                  <div style={{ fontSize: 11, color: "#A8A29E", marginBottom: 4 }}>{field.label}</div>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={4}
                      value={inputs[field.key] || ""}
                      onChange={e => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{
                        width: "100%", fontSize: 12, padding: "8px 10px", fontFamily: "inherit",
                        border: "1px solid #E7E5E4", borderRadius: 6, backgroundColor: "#FAFAF9",
                        color: "#1C1917", resize: "vertical", outline: "none", lineHeight: 1.5,
                      }}
                      onFocus={e => { e.target.style.borderColor = "#D97706"; e.target.style.backgroundColor = "#FFFFFF"; }}
                      onBlur={e => { e.target.style.borderColor = "#E7E5E4"; e.target.style.backgroundColor = "#FAFAF9"; }}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={inputs[field.key] || ""}
                      onChange={e => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={{
                        width: "100%", fontSize: 12, padding: "7px 10px", fontFamily: "inherit",
                        border: "1px solid #E7E5E4", borderRadius: 6, backgroundColor: "#FAFAF9",
                        color: inputs[field.key] ? "#1C1917" : "#A8A29E", outline: "none", cursor: "pointer",
                      }}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={inputs[field.key] || ""}
                      onChange={e => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{
                        width: "100%", fontSize: 12, padding: "7px 10px", fontFamily: "JetBrains Mono, monospace",
                        border: "1px solid #E7E5E4", borderRadius: 6, backgroundColor: "#FAFAF9",
                        color: "#1C1917", outline: "none",
                      }}
                      onFocus={e => { e.target.style.borderColor = "#D97706"; e.target.style.backgroundColor = "#FFFFFF"; }}
                      onBlur={e => { e.target.style.borderColor = "#E7E5E4"; e.target.style.backgroundColor = "#FAFAF9"; }}
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleRun}
              disabled={loading}
              style={{
                marginTop: 16, width: "100%", padding: "10px 0", fontSize: 13, fontWeight: 600,
                color: "#FFFFFF", backgroundColor: loading ? "#A8A29E" : "#1C1917",
                border: "none", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background-color 0.15s",
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#FFF", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Running inference...
                </>
              ) : "▶ Run Request"}
            </button>
          </div>

          {/* Right: response */}
          <div style={{ padding: 18, backgroundColor: "#FAFAF9", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#A8A29E", letterSpacing: "0.07em", textTransform: "uppercase" }}>Response</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {response && (
                  <>
                    <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#166534", backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", padding: "2px 7px", borderRadius: 4 }}>
                      200 OK
                    </span>
                    <span style={{ fontSize: 10, color: "#78716C", fontFamily: "JetBrains Mono, monospace" }}>{elapsed}ms</span>
                    <button onClick={handleCopy}
                      style={{ fontSize: 11, color: "#78716C", backgroundColor: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div style={{ flex: 1, borderRadius: 6, overflow: "hidden", border: "1px solid #E7E5E4" }}>
              {!response && !loading && (
                <div style={{
                  height: "100%", minHeight: 200, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  backgroundColor: "#F5F5F4", color: "#A8A29E", gap: 8,
                }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" opacity={0.4}>
                    <circle cx="14" cy="14" r="12" stroke="#78716C" strokeWidth="1.5" />
                    <path d="M10 14l3 3 5-5" stroke="#78716C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 12 }}>Click Run to see response</span>
                </div>
              )}
              {loading && (
                <div style={{
                  height: "100%", minHeight: 200, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  backgroundColor: "#F5F5F4", color: "#A8A29E", gap: 8,
                }}>
                  <span style={{ display: "inline-block", width: 20, height: 20, border: "2px solid #E7E5E4", borderTopColor: "#D97706", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  <span style={{ fontSize: 12 }}>Running inference...</span>
                </div>
              )}
              {response && (
                <pre style={{
                  margin: 0, padding: "14px 16px", fontFamily: "JetBrains Mono, monospace",
                  fontSize: 11.5, lineHeight: 1.75, color: "#1C1917", backgroundColor: "#FFFFFF",
                  overflow: "auto", height: "100%",
                }}>
                  {response}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* cURL view */}
      {view === "curl" && (
        <div style={{ padding: 18 }}>
          <div style={{ fontSize: 11, color: "#78716C", marginBottom: 10 }}>Copy and paste into your terminal to run this request:</div>
          <div style={{ position: "relative" }}>
            <pre style={{
              margin: 0, padding: "16px 16px", fontFamily: "JetBrains Mono, monospace",
              fontSize: 12, lineHeight: 1.7, color: "#D6D3D1", backgroundColor: "#1C1917",
              borderRadius: 8, overflow: "auto", whiteSpace: "pre-wrap",
            }}>
              {model.curlCmd}
            </pre>
            <button
              onClick={() => { navigator.clipboard.writeText(model.curlCmd); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
              style={{
                position: "absolute", top: 10, right: 10, fontSize: 11, fontWeight: 500,
                color: "#78716C", backgroundColor: "#292524", border: "1px solid #3C3A38",
                borderRadius: 5, padding: "3px 10px", cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Schema view */}
      {view === "schema" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ padding: 18, borderRight: "1px solid #E7E5E4" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#A8A29E", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>Request Schema</div>
            <pre style={{
              margin: 0, padding: "14px 16px", fontFamily: "JetBrains Mono, monospace",
              fontSize: 11.5, lineHeight: 1.7, color: "#1C1917", backgroundColor: "#FAFAF9",
              borderRadius: 6, border: "1px solid #E7E5E4", overflow: "auto",
            }}>
              {model.sampleRequest}
            </pre>
          </div>
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#A8A29E", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>Response Schema</div>
            <pre style={{
              margin: 0, padding: "14px 16px", fontFamily: "JetBrains Mono, monospace",
              fontSize: 11.5, lineHeight: 1.7, color: "#1C1917", backgroundColor: "#FAFAF9",
              borderRadius: 6, border: "1px solid #E7E5E4", overflow: "auto",
            }}>
              {model.sampleResponse}
            </pre>
          </div>
        </div>
      )}

      {/* Spin animation */}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
