"use client";
import Link from "next/link";
import ApiExplorer from "@/components/ApiExplorer";
import { ConfusionMatrix } from "@/components/ConfusionMatrix";

// Confusion matrix: rows = actual, cols = predicted
// Labels: payment_delay, contract_breach, quality_dispute, delivery_failure, documentation_dispute, statutory_violation
const confusionData = {
  labels: ["pay_delay", "contract", "quality", "delivery", "doc_dispute", "statutory"],
  matrix: [
    [1294, 52, 42, 22, 6, 5],
    [41, 726, 28, 19, 11, 9],
    [28, 21, 569, 14, 7, 7],
    [18, 12, 11, 450, 9, 8],
    [8, 9, 7, 8, 326, 8],
    [3, 4, 2, 2, 2, 271],
  ],
};

const classificationReport = [
  { label: "payment_delay", p: 0.93, r: 0.91, f1: 0.92, sup: 1421 },
  { label: "contract_breach", p: 0.89, r: 0.87, f1: 0.88, sup: 834 },
  { label: "quality_dispute", p: 0.91, r: 0.93, f1: 0.92, sup: 612 },
  { label: "delivery_failure", p: 0.88, r: 0.86, f1: 0.87, sup: 523 },
  { label: "documentation_dispute", p: 0.86, r: 0.84, f1: 0.85, sup: 389 },
  { label: "statutory_violation", p: 0.94, r: 0.96, f1: 0.95, sup: 284 },
];

export default function DisputeClassifierPage() {
  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>

      {/* Page header */}
      <div style={{ borderBottom: "1px solid #E7E5E4", backgroundColor: "#FAFAF9" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 24px 36px" }}>
          <Link href="/#models" style={{ fontSize: 12, color: "#78716C", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
            ← All Models
          </Link>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span className="badge-amber">M1</span>
                <span style={{ fontSize: 12, color: "#78716C", fontFamily: "JetBrains Mono, monospace" }}>Longformer</span>
                <span className="badge-green">AUC-ROC 0.948</span>
              </div>
              <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 700, color: "#1C1917", letterSpacing: "-0.03em", marginBottom: 8, lineHeight: 1.15 }}>
                MSME Legal Dispute Classifier
              </h1>
              <p style={{ fontSize: 14, color: "#78716C", maxWidth: 560, lineHeight: 1.65, margin: 0 }}>
                Fine-tuned Longformer classifying dispute narratives into 6 statutory categories under the MSMED Act, 2006.
                Handles up to 1,200 tokens without truncation.
              </p>
            </div>
            <a href="https://huggingface.co/spaces/abhinavdread/msme-legal-dispute-classifier-longformer"
              target="_blank" rel="noopener noreferrer" className="btn btn-dark">
              Open on HuggingFace ↗
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px" }}>

        {/* API Explorer */}
        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>API Explorer</div>
          <ApiExplorer modelId="m1" />
        </section>

        {/* Overview cards */}
        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>Overview</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { title: "Problem", body: "MSME dispute narratives submitted to facilitation councils are unstructured. Manual categorisation is slow and inconsistent, delaying case admission." },
              { title: "Architecture", body: "Longformer with global attention on [CLS] token. Classification head on pooled output. Fine-tuned for 3 epochs on 5,000+ MSME dispute samples." },
              { title: "Why Longformer", body: "Dispute narratives regularly exceed 512 tokens. BERT truncates context. Longformer's sliding-window attention scales to 4,096 tokens at linear complexity." },
            ].map(c => (
              <div key={c.title} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#A8A29E", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>{c.title}</div>
                <p style={{ fontSize: 13, color: "#57534E", lineHeight: 1.65, margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Metrics */}
        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>Model Metrics</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {[["AUC-ROC", "0.948"], ["Macro F1", "0.898"], ["Accuracy", "91.2%"], ["Avg Latency", "38ms"]].map(([k, v]) => (
              <div key={k} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, padding: "16px 18px" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1C1917", letterSpacing: "-0.03em" }}>{v}</div>
                <div style={{ fontSize: 12, color: "#78716C", marginTop: 4 }}>{k}</div>
              </div>
            ))}
          </div>

          {/* Classification table */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", backgroundColor: "#FAFAF9", borderBottom: "1px solid #E7E5E4" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1C1917" }}>Per-Class Classification Report</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E7E5E4", backgroundColor: "#FAFAF9" }}>
                    {["Category", "Precision", "Recall", "F1 Score", "Support"].map(h => (
                      <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#A8A29E", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classificationReport.map((row, i) => (
                    <tr key={row.label} style={{ borderBottom: "1px solid #F5F5F4", backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#FAFAF9" }}>
                      <td style={{ padding: "10px 18px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#44403C" }}>{row.label}</td>
                      <td style={{ padding: "10px 18px", fontSize: 12, color: "#57534E" }}>{row.p.toFixed(2)}</td>
                      <td style={{ padding: "10px 18px", fontSize: 12, color: "#57534E" }}>{row.r.toFixed(2)}</td>
                      <td style={{ padding: "10px 18px", fontSize: 12, fontWeight: 600, color: "#166534" }}>{row.f1.toFixed(2)}</td>
                      <td style={{ padding: "10px 18px", fontSize: 12, color: "#A8A29E", fontFamily: "JetBrains Mono, monospace" }}>{row.sup}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Confusion Matrix */}
        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>Confusion Matrix</div>
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, padding: 20 }}>
            <p style={{ fontSize: 13, color: "#78716C", lineHeight: 1.65, marginBottom: 20, marginTop: 0 }}>
              Row = actual class, Column = predicted class. Diagonal cells (green) are correct predictions.
              Off-diagonal (red) show misclassifications. Most confusion occurs between similar dispute types.
            </p>
            <ConfusionMatrix data={confusionData} />
          </div>
        </section>

        {/* Dataset */}
        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>Dataset</div>
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, padding: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1C1917", marginBottom: 6 }}>Dataset Overview</div>
                <p style={{ fontSize: 13, color: "#78716C", lineHeight: 1.65, margin: 0 }}>5,063 MSME dispute narratives · 6 classes · 80/10/10 stratified split.</p>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1C1917", marginBottom: 6 }}>Data Sources</div>
                <p style={{ fontSize: 13, color: "#78716C", lineHeight: 1.65, margin: 0 }}>Case filings from Indian Kanoon, MSME Facilitation Council archives, LLM-curated labels using Gemini 1.5 Pro.</p>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1C1917", marginBottom: 6 }}>HuggingFace Dataset</div>
                <a href="https://huggingface.co/datasets/abhinavdread/msme-legal-disputes" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#D97706", textDecoration: "underline", wordBreak: "break-all" }}>
                  abhinavdread/msme-legal-disputes →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, paddingTop: 20, borderTop: "1px solid #E7E5E4" }}>
          <Link href="/#models" className="btn btn-outline btn-sm">← All Models</Link>
          <Link href="/demo" className="btn btn-outline btn-sm">Full Pipeline Demo</Link>
          <Link href="/models/document-completeness" className="btn btn-outline btn-sm">Document Completeness →</Link>
        </div>
      </div>
    </div>
  );
}
