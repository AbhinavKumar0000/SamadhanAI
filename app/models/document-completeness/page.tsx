"use client";
import Link from "next/link";
import ApiExplorer from "@/components/ApiExplorer";
import { ConfusionMatrix } from "@/components/ConfusionMatrix";

// Aggregate confusion matrix across all 5 document classifiers
// Labels: [Present, Absent], matrix[actual][predicted]
const confusionData = {
  labels: ["Present", "Absent"],
  matrix: [
    [4821, 62],
    [38, 4629],
  ],
};

const docMetrics = [
  { doc: "Invoice", p: 0.99, r: 1.00, f1: 0.99 },
  { doc: "Purchase Order", p: 0.98, r: 0.99, f1: 0.99 },
  { doc: "Delivery Challan", p: 0.97, r: 0.97, f1: 0.97 },
  { doc: "GSTIN Certificate", p: 0.99, r: 1.00, f1: 0.99 },
  { doc: "Contract", p: 0.96, r: 0.95, f1: 0.96 },
];

const shapFeatures = [
  ["invoice_amount_inr", 0.31, "Higher amounts indicate formal transactions including invoice"],
  ["payment_terms_mentioned", 0.24, "Explicit payment terms text implies contractual documentation"],
  ["gstin_present", 0.19, "GST number presence implies GSTIN certificate submission"],
  ["order_number_present", 0.15, "Explicit PO numbers correlate with purchase order presence"],
  ["delivery_date_mentioned", 0.11, "Delivery date in text correlates with delivery challan presence"],
];

export default function DocumentCompletenessPage() {
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
                <span className="badge-amber">M2</span>
                <span style={{ fontSize: 12, color: "#78716C", fontFamily: "JetBrains Mono, monospace" }}>XGBoost + SHAP</span>
                <span className="badge-green">F1 0.99</span>
              </div>
              <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 700, color: "#1C1917", letterSpacing: "-0.03em", marginBottom: 8, lineHeight: 1.15 }}>
                Document Completeness Engine
              </h1>
              <p style={{ fontSize: 14, color: "#78716C", maxWidth: 560, lineHeight: 1.65, margin: 0 }}>
                Five independent XGBoost classifiers detect presence of mandatory MSME dispute documents
                from case description text, with SHAP attribution for every prediction.
              </p>
            </div>
            <a href="https://huggingface.co/spaces/abhinavdread/msme-document-presence-xgboost"
              target="_blank" rel="noopener noreferrer" className="btn btn-dark">
              Open on HuggingFace ↗
            </a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px" }}>

        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>API Explorer</div>
          <ApiExplorer modelId="m2" />
        </section>

        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>Overview</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { title: "Problem", body: "Facilitation councils reject ~38% of MSME cases due to missing documents. Manual checking is error-prone. Automated detection with explainability flags missing documents instantly." },
              { title: "Architecture", body: "TF-IDF vectorization → five independent XGBoost binary classifiers. SHAP TreeExplainer generates per-prediction feature importances for all five document types." },
              { title: "Design Decision", body: "Independent binary classifiers per document type outperform single multi-label models at this data scale. SHAP explainability is a hard requirement for audit-readiness." },
            ].map(c => (
              <div key={c.title} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#A8A29E", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>{c.title}</div>
                <p style={{ fontSize: 13, color: "#57534E", lineHeight: 1.65, margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>Per-Document Metrics</div>
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E7E5E4", backgroundColor: "#FAFAF9" }}>
                  {["Document Type", "Precision", "Recall", "F1 Score"].map(h => (
                    <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#A8A29E", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docMetrics.map((r, i) => (
                  <tr key={r.doc} style={{ borderBottom: "1px solid #F5F5F4", backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#FAFAF9" }}>
                    <td style={{ padding: "10px 18px", fontSize: 13, fontWeight: 500, color: "#1C1917" }}>{r.doc}</td>
                    <td style={{ padding: "10px 18px", fontSize: 12, color: "#57534E" }}>{r.p.toFixed(2)}</td>
                    <td style={{ padding: "10px 18px", fontSize: 12, color: "#57534E" }}>{r.r.toFixed(2)}</td>
                    <td style={{ padding: "10px 18px", fontSize: 12, fontWeight: 600, color: "#166534" }}>{r.f1.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>Top SHAP Features</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shapFeatures.map(([feat, imp, desc]) => (
              <div key={String(feat)} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <code style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#44403C", minWidth: 200 }}>{feat}</code>
                <div style={{ flex: 1, minWidth: 100, backgroundColor: "#F5F5F4", borderRadius: 3, height: 6 }}>
                  <div style={{ backgroundColor: "#D97706", height: 6, borderRadius: 3, width: `${Number(imp) * 100 / 0.31}%` }} />
                </div>
                <span style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#D97706", minWidth: 30, textAlign: "right" }}>{imp}</span>
                <span style={{ fontSize: 12, color: "#78716C", flex: 2 }}>{desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Confusion Matrix */}
        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>Confusion Matrix</div>
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, padding: 20 }}>
            <p style={{ fontSize: 13, color: "#78716C", lineHeight: 1.65, marginBottom: 20, marginTop: 0 }}>
              Aggregate confusion matrix across all 5 independent document classifiers on the test set.
              Near-perfect diagonal reflects the F1 0.99 performance across Invoice, PO, Challan, GSTIN, and Contract detection.
            </p>
            <ConfusionMatrix data={confusionData} />
          </div>
        </section>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, paddingTop: 20, borderTop: "1px solid #E7E5E4" }}>
          <Link href="/models/dispute-classifier" className="btn btn-outline btn-sm">← Dispute Classifier</Link>
          <Link href="/demo" className="btn btn-outline btn-sm">Full Pipeline Demo</Link>
          <Link href="/models/payment-predictor" className="btn btn-outline btn-sm">Payment Predictor →</Link>
        </div>
      </div>
    </div>
  );
}
