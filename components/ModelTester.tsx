"use client";

import { useState } from "react";

export type ModelTestConfig = {
  modelId: "m1" | "m2" | "m3" | "m4";
  label: string;
  endpoint: string;
  inputFields: {
    key: string;
    label: string;
    type: "textarea" | "text" | "number" | "select";
    placeholder?: string;
    options?: string[];
    defaultValue?: string | number;
  }[];
  simulateResponse: (inputs: Record<string, string | number>) => object;
};

const MODELS: ModelTestConfig[] = [
  {
    modelId: "m1",
    label: "Dispute Classifier",
    endpoint: "POST /predict",
    inputFields: [
      {
        key: "text",
        label: "Dispute Narrative",
        type: "textarea",
        placeholder:
          "Enter a dispute description, e.g: Buyer defaulted on Invoice INV-2024-001 dated 15-Jan-2024 amounting to Rs 2,50,000. No payment received within the 45-day statutory period...",
        defaultValue: "Buyer defaulted on Invoice INV-2024-001 dated 15-Jan-2024 amounting to Rs 2,50,000. 67 days have elapsed beyond the MSMED statutory payment deadline. Legal notice sent on 01-Mar-2024 with no response.",
      },
    ],
    simulateResponse: (inputs) => {
      const text = String(inputs.text || "").toLowerCase();
      let label = "payment_delay";
      let confidence = 0.82;
      if (text.includes("quality") || text.includes("defect")) { label = "quality_dispute"; confidence = 0.79; }
      else if (text.includes("contract") || text.includes("breach")) { label = "contract_breach"; confidence = 0.74; }
      else if (text.includes("delivery") || text.includes("consignment")) { label = "delivery_failure"; confidence = 0.77; }
      else if (text.includes("document") || text.includes("invoice missing")) { label = "documentation_dispute"; confidence = 0.71; }
      else if (text.includes("statutory") || text.includes("msmed act")) { label = "statutory_violation"; confidence = 0.86; }

      const probs: Record<string, number> = {
        payment_delay: 0.09, contract_breach: 0.06, quality_dispute: 0.04,
        delivery_failure: 0.05, documentation_dispute: 0.04, statutory_violation: 0.03,
      };
      probs[label] = confidence;
      // normalize rest
      const rest = 1 - confidence;
      const otherKeys = Object.keys(probs).filter(k => k !== label);
      otherKeys.forEach(k => { probs[k] = parseFloat((rest / otherKeys.length).toFixed(3)); });

      return {
        label,
        label_index: ["payment_delay", "contract_breach", "quality_dispute", "delivery_failure", "documentation_dispute", "statutory_violation"].indexOf(label),
        confidence: parseFloat(confidence.toFixed(3)),
        probabilities: Object.fromEntries(Object.entries(probs).map(([k, v]) => [k, parseFloat(v.toFixed(3))])),
      };
    },
  },
  {
    modelId: "m2",
    label: "Document Completeness",
    endpoint: "POST /evaluate-case",
    inputFields: [
      {
        key: "text",
        label: "Case Description",
        type: "textarea",
        placeholder: "Describe the documents available in the case...",
        defaultValue: "Invoice INV-2024-001 attached for Rs 2,50,000. Purchase Order PO-876 signed by buyer on 10-Jan. GSTIN 29ABCDE1234F1Z5 verified. Delivery challan DC-001 enclosed. Contract agreement not submitted.",
      },
    ],
    simulateResponse: (inputs) => {
      const text = String(inputs.text || "").toLowerCase();
      const has = (kws: string[]) => kws.some(k => text.includes(k));
      const invoicePresent = has(["invoice", "inv-", "inv "]);
      const poPresent = has(["purchase order", "po-", "po ", "po number"]);
      const deliveryPresent = has(["delivery challan", "dc-", "consignment", "dc number", "delivery"]);
      const gstPresent = has(["gstin", "gst", "registration"]);
      const contractPresent = has(["contract", "agreement"]) && !has(["no contract", "contract not"]);
      const docs: Record<string, boolean> = { invoice: invoicePresent, po: poPresent, delivery: deliveryPresent, gst: gstPresent, contract: contractPresent };
      const presentCount = Object.values(docs).filter(Boolean).length;
      return {
        results: Object.fromEntries(Object.entries(docs).map(([k, v]) => [k, { present: v, confidence: v ? +(0.97 + Math.random() * 0.02).toFixed(3) : +(0.05 + Math.random() * 0.1).toFixed(3) }])),
        completeness_score: parseFloat((presentCount / 5).toFixed(2)),
        missing_documents: Object.entries(docs).filter(([, v]) => !v).map(([k]) => k),
      };
    },
  },
  {
    modelId: "m3",
    label: "Payment Predictor",
    endpoint: "POST /predict",
    inputFields: [
      { key: "invoice_amount", label: "Invoice Amount (Rs)", type: "number", placeholder: "250000", defaultValue: 250000 },
      { key: "days_overdue", label: "Days Overdue", type: "number", placeholder: "67", defaultValue: 67 },
      { key: "document_completeness_score", label: "Doc Completeness (0–1)", type: "number", placeholder: "0.8", defaultValue: 0.8 },
      { key: "buyer_category", label: "Buyer Category", type: "select", options: ["micro", "small", "medium", "large_enterprise", "government"], defaultValue: "large_enterprise" },
      { key: "prior_disputes", label: "Prior Disputes", type: "number", placeholder: "0", defaultValue: 0 },
    ],
    simulateResponse: (inputs) => {
      const days = Number(inputs.days_overdue) || 0;
      const doc = Number(inputs.document_completeness_score) || 0.5;
      const buyer = String(inputs.buyer_category);
      const amount = Number(inputs.invoice_amount) || 100000;
      const buyerMod = buyer === "government" ? 0.1 : buyer === "large_enterprise" ? 0.05 : 0;
      const rawWin = Math.min(0.97, 0.3 + (days / 200) * 0.4 + doc * 0.25 + buyerMod + (amount > 500000 ? 0.05 : 0));
      const rbiRate = 6.5;
      const intRate = rbiRate * 3;
      const interest = Math.round(amount * (intRate / 100) * (days / 365));
      return {
        win_probability: parseFloat(rawWin.toFixed(3)),
        settlement_probability: parseFloat(Math.min(0.98, rawWin * 0.85).toFixed(3)),
        calibrated: true,
        shap_explanation: {
          days_overdue: parseFloat((days / 500).toFixed(3)),
          document_completeness_score: parseFloat((doc * 0.2).toFixed(3)),
          invoice_amount: parseFloat((amount / 5_000_000).toFixed(3)),
          buyer_category: parseFloat(buyerMod.toFixed(3)),
        },
        statutory_interest: { rate_pct: intRate, estimated_amount_rs: interest },
      };
    },
  },
  {
    modelId: "m4",
    label: "Legal Rule Engine",
    endpoint: "POST /evaluate-case",
    inputFields: [
      { key: "invoice_amount", label: "Invoice Amount (Rs)", type: "number", placeholder: "250000", defaultValue: 250000 },
      { key: "days_overdue", label: "Days Overdue", type: "number", placeholder: "67", defaultValue: 67 },
      { key: "agreed_period_days", label: "Agreed Payment Period (days)", type: "number", placeholder: "45", defaultValue: 45 },
      { key: "rbi_bank_rate_pct", label: "RBI Bank Rate (%)", type: "number", placeholder: "6.5", defaultValue: 6.5 },
    ],
    simulateResponse: (inputs) => {
      const amount = Number(inputs.invoice_amount) || 1;
      const days = Number(inputs.days_overdue) || 0;
      const rbiRate = Number(inputs.rbi_bank_rate_pct) || 6.5;
      const intRate = rbiRate * 3;
      const interest = Math.round(amount * (intRate / 100) * (days / 365));
      return {
        eligible: days > 0,
        days_overdue: days,
        statutory_interest_rate_pct: intRate,
        statutory_interest_amount_rs: interest,
        total_amount_payable_rs: amount + interest,
        reasoning_trace: [
          `Invoice amount: Rs ${amount.toLocaleString()}`,
          `Days overdue: ${days} (beyond agreed ${inputs.agreed_period_days}-day period)`,
          `Rate: 3 × RBI ${rbiRate}% = ${intRate}% p.a. [Section 16, MSMED Act 2006]`,
          `Interest: ${amount} × ${intRate / 100} × ${days}/365 = Rs ${interest.toLocaleString()}`,
          `Total payable: Rs ${(amount + interest).toLocaleString()}`,
        ],
        statutory_sections: ["Section 15", "Section 16", "Section 17"],
      };
    },
  },
];

export default function ModelTester({ modelId }: { modelId: "m1" | "m2" | "m3" | "m4" }) {
  const config = MODELS.find(m => m.modelId === modelId)!;
  const [inputs, setInputs] = useState<Record<string, string | number>>(() =>
    Object.fromEntries(config.inputFields.map(f => [f.key, f.defaultValue ?? ""]))
  );
  const [result, setResult] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);

  const run = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      try {
        setResult(config.simulateResponse(inputs));
      } catch {
        setResult({ error: "Inference failed. Check inputs." });
      }
      setLoading(false);
    }, 600 + Math.random() * 400);
  };

  return (
    <div className="rounded-lg border border-[#E5E2DB] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-[#F4F2EE] border-b border-[#E5E2DB] flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#D97706] uppercase tracking-wider">Model Inference Tester</span>
          <p className="text-sm font-medium text-[#1A1915] mt-0.5">{config.label}</p>
        </div>
        <code className="text-xs font-mono text-[#6B6860] bg-white border border-[#E5E2DB] px-2.5 py-1 rounded">
          {config.endpoint}
        </code>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E2DB]">
        {/* Inputs */}
        <div className="p-5 bg-white">
          <div className="text-[10px] text-[#9C9A95] font-mono uppercase tracking-wider mb-4">Input Parameters</div>
          <div className="space-y-4">
            {config.inputFields.map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-[#2D2C28] mb-1.5">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    value={String(inputs[field.key] ?? "")}
                    onChange={e => setInputs(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full text-xs font-mono text-[#2D2C28] bg-[#FAF9F7] border border-[#E5E2DB] rounded px-3 py-2 resize-none focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 transition-colors placeholder:text-[#CCC9C0]"
                  />
                ) : field.type === "select" ? (
                  <select
                    value={String(inputs[field.key] ?? "")}
                    onChange={e => setInputs(p => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full text-xs font-mono text-[#2D2C28] bg-[#FAF9F7] border border-[#E5E2DB] rounded px-3 py-2 focus:outline-none focus:border-[#D97706] transition-colors"
                  >
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={String(inputs[field.key] ?? "")}
                    onChange={e => setInputs(p => ({ ...p, [field.key]: field.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full text-xs font-mono text-[#2D2C28] bg-[#FAF9F7] border border-[#E5E2DB] rounded px-3 py-2 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 transition-colors placeholder:text-[#CCC9C0]"
                  />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="mt-5 w-full btn-accent text-xs py-2.5 justify-center disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Running inference...
              </span>
            ) : "Run Inference"}
          </button>
        </div>

        {/* Output */}
        <div className="p-5 bg-[#FAF9F7]">
          <div className="text-[10px] text-[#9C9A95] font-mono uppercase tracking-wider mb-4">Model Output</div>
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center py-10 text-center">
              <div className="w-8 h-8 rounded-full bg-[#F4F2EE] border border-[#E5E2DB] flex items-center justify-center mb-3">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v6M7 11v1" stroke="#CCC9C0" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="7" cy="7" r="6" stroke="#CCC9C0" strokeWidth="1" fill="none" />
                </svg>
              </div>
              <p className="text-xs text-[#CCC9C0]">Set inputs and click Run Inference</p>
            </div>
          )}
          {loading && (
            <div className="h-full flex items-center justify-center py-10">
              <div className="text-xs text-[#9C9A95] font-mono animate-pulse">Calling model...</div>
            </div>
          )}
          {result && !loading && (
            <pre className="code-block text-xs leading-relaxed overflow-auto max-h-72">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
          {result && !loading && (
            <p className="mt-3 text-[10px] text-[#CCC9C0] font-mono">
              Simulated inference · Production endpoint on HuggingFace Spaces
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
