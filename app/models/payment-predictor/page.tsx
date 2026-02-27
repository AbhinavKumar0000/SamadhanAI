"use client";
import Link from "next/link";
import ApiExplorer from "@/components/ApiExplorer";
import { ConfusionMatrix } from "@/components/ConfusionMatrix";

// Payment predictor: binary outcome — won vs lost
// Labels: [Won, Lost], matrix[actual][predicted]
const confusionData = {
  labels: ["Won", "Lost"],
  matrix: [
    [1842, 218],
    [196, 1744],
  ],
};

export default function PaymentPredictorPage() {
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
                <span className="badge-amber">M3</span>
                <span style={{ fontSize: 12, color: "#78716C", fontFamily: "JetBrains Mono, monospace" }}>LightGBM + Platt Calibration</span>
                <span className="badge-green">AUC-ROC 0.891</span>
              </div>
              <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 700, color: "#1C1917", letterSpacing: "-0.03em", marginBottom: 8, lineHeight: 1.15 }}>
                Payment Outcome Predictor
              </h1>
              <p style={{ fontSize: 14, color: "#78716C", maxWidth: 560, lineHeight: 1.65, margin: 0 }}>
                LightGBM classifier with Platt scaling predicts win probability for MSME payment disputes.
                Calibration ensures reported probabilities match actual outcome rates, required for legal defensibility.
              </p>
            </div>
            <a href="https://huggingface.co/spaces/abhinavdread/msme-payment-outcome-predictor-lightgbm"
              target="_blank" rel="noopener noreferrer" className="btn btn-dark">
              Open on HuggingFace ↗
            </a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px" }}>

        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>API Explorer</div>
          <ApiExplorer modelId="m3" />
        </section>

        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>Overview</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { title: "Problem", body: "MSME claimants need a calibrated probability of winning — not just a binary prediction — to make informed negotiation decisions." },
              { title: "Architecture", body: "LightGBM on structured case features. Platt scaling post-hoc calibrates raw scores. SHAP values explain each prediction for the adjudicator." },
              { title: "Why Calibration", body: "A predicted 70% win probability must mean 'wins 70% of the time'. Raw ML scores don't guarantee this. Platt scaling enforces this via logistic regression on holdout predictions." },
            ].map(c => (
              <div key={c.title} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#A8A29E", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>{c.title}</div>
                <p style={{ fontSize: 13, color: "#57534E", lineHeight: 1.65, margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>Model Metrics</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {[["AUC-ROC", "0.891"], ["Brier Score", "0.112"], ["ECE", "0.021"], ["Avg Latency", "12ms"]].map(([k, v]) => (
              <div key={k} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, padding: "16px 18px" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1C1917", letterSpacing: "-0.03em" }}>{v}</div>
                <div style={{ fontSize: 12, color: "#78716C", marginTop: 4 }}>{k}</div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1917", marginBottom: 14 }}>Top Feature Importances (SHAP)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["days_overdue", 0.34, "Days past statutory deadline"],
                ["document_completeness_score", 0.28, "Fraction of required docs present"],
                ["invoice_amount_inr", 0.19, "Higher amount = stronger claim urgency"],
                ["buyer_category", 0.12, "Buyer size affects enforcement likelihood"],
                ["prior_disputes_count", 0.07, "Repeat defaults increase win probability"],
              ].map(([feat, imp, desc]) => (
                <div key={String(feat)} style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <code style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#44403C", minWidth: 210 }}>{feat}</code>
                  <div style={{ flex: 1, minWidth: 100, backgroundColor: "#F5F5F4", borderRadius: 3, height: 6 }}>
                    <div style={{ backgroundColor: "#D97706", height: 6, borderRadius: 3, width: `${Number(imp) * 100 / 0.34}%` }} />
                  </div>
                  <span style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#D97706", minWidth: 30, textAlign: "right" }}>{imp}</span>
                  <span style={{ fontSize: 12, color: "#78716C", flex: 2 }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Confusion Matrix */}
        <section style={{ marginBottom: 48 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>Confusion Matrix</div>
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E5E4", borderRadius: 8, padding: 20 }}>
            <p style={{ fontSize: 13, color: "#78716C", lineHeight: 1.65, marginBottom: 20, marginTop: 0 }}>
              Binary outcome classification on the held-out test set. Rows = actual outcome, Columns = predicted.
              Model is symmetric: false positives and false negatives are nearly equal, indicating good calibration.
            </p>
            <ConfusionMatrix data={confusionData} />
          </div>
        </section>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, paddingTop: 20, borderTop: "1px solid #E7E5E4" }}>
          <Link href="/models/document-completeness" className="btn btn-outline btn-sm">← Document Completeness</Link>
          <Link href="/demo" className="btn btn-outline btn-sm">Full Pipeline Demo</Link>
          <Link href="/models/rule-engine" className="btn btn-outline btn-sm">Rule Engine →</Link>
        </div>
      </div>
    </div>
  );
}
