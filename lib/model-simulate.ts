/**
 * Simulated model responses when HuggingFace Spaces are unavailable (404, sleeping, etc.).
 * Matches the logic from ModelTester so pipeline demo works offline.
 */

export function simulateM1(text: string): object {
  const t = String(text || "").toLowerCase();
  let label = "payment_delay";
  let confidence = 0.82;
  if (t.includes("quality") || t.includes("defect")) {
    label = "quality_dispute";
    confidence = 0.79;
  } else if (t.includes("contract") || t.includes("breach")) {
    label = "contract_breach";
    confidence = 0.74;
  } else if (t.includes("delivery") || t.includes("consignment")) {
    label = "delivery_failure";
    confidence = 0.77;
  } else if (t.includes("document") || t.includes("invoice missing")) {
    label = "documentation_dispute";
    confidence = 0.71;
  } else if (t.includes("statutory") || t.includes("msmed act")) {
    label = "statutory_violation";
    confidence = 0.86;
  }
  const probs: Record<string, number> = {
    payment_delay: 0.09,
    contract_breach: 0.06,
    quality_dispute: 0.04,
    delivery_failure: 0.05,
    documentation_dispute: 0.04,
    statutory_violation: 0.03,
  };
  probs[label] = confidence;
  const rest = 1 - confidence;
  const otherKeys = Object.keys(probs).filter((k) => k !== label);
  otherKeys.forEach((k) => {
    probs[k] = parseFloat((rest / otherKeys.length).toFixed(3));
  });
  return {
    label,
    label_index: [
      "payment_delay",
      "contract_breach",
      "quality_dispute",
      "delivery_failure",
      "documentation_dispute",
      "statutory_violation",
    ].indexOf(label),
    confidence: parseFloat(confidence.toFixed(3)),
    probabilities: Object.fromEntries(
      Object.entries(probs).map(([k, v]) => [k, parseFloat(v.toFixed(3))])
    ),
    _simulated: true,
  };
}

export function simulateM2(text: string): object {
  const t = String(text || "").toLowerCase();
  const has = (kws: string[]) => kws.some((k) => t.includes(k));
  const invoicePresent = has(["invoice", "inv-", "inv "]);
  const poPresent = has(["purchase order", "po-", "po ", "po number"]);
  const deliveryPresent = has([
    "delivery challan",
    "dc-",
    "consignment",
    "dc number",
    "delivery",
  ]);
  const gstPresent = has(["gstin", "gst", "registration"]);
  const contractPresent =
    has(["contract", "agreement"]) && !has(["no contract", "contract not"]);
  const docs: Record<string, boolean> = {
    invoice: invoicePresent,
    purchase_order: poPresent,
    delivery_challan: deliveryPresent,
    gst_certificate: gstPresent,
    contract: contractPresent,
  };
  const presentCount = Object.values(docs).filter(Boolean).length;
  return {
    completeness_score: parseFloat((presentCount / 5).toFixed(2)),
    missing_documents: Object.entries(docs)
      .filter(([, v]) => !v)
      .map(([k]) => k),
    present_documents: Object.entries(docs)
      .filter(([, v]) => v)
      .map(([k]) => k),
    results: Object.fromEntries(
      Object.entries(docs).map(([k, v]) => [
        k,
        {
          present: v,
          confidence: v
            ? parseFloat((0.97 + Math.random() * 0.02).toFixed(3))
            : parseFloat((0.05 + Math.random() * 0.1).toFixed(3)),
        },
      ])
    ),
    _simulated: true,
  };
}

export function simulateM3(payload: {
  invoice_amount: number;
  days_overdue: number;
  document_completeness_score: number;
  buyer_category: string;
  prior_disputes_count: number;
}): object {
  const { days_overdue, document_completeness_score, buyer_category, invoice_amount } = payload;
  const days = Number(days_overdue) || 0;
  const doc = Number(document_completeness_score) || 0.5;
  const buyer = String(buyer_category);
  const amount = Number(invoice_amount) || 100000;
  const buyerMod =
    buyer === "government" ? 0.1 : buyer === "large_enterprise" ? 0.05 : 0;
  const rawWin = Math.min(
    0.97,
    0.3 + (days / 200) * 0.4 + doc * 0.25 + buyerMod + (amount > 500000 ? 0.05 : 0)
  );
  const rbiRate = 6.5;
  const intRate = rbiRate * 3;
  const interest = Math.round(amount * (intRate / 100) * (days / 365));
  return {
    win_probability: parseFloat(rawWin.toFixed(3)),
    settlement_probability: parseFloat(Math.min(0.98, rawWin * 0.85).toFixed(3)),
    calibrated: true,
    statutory_interest_applicable: true,
    shap_explanation: {
      days_overdue: parseFloat((days / 500).toFixed(3)),
      document_completeness_score: parseFloat((doc * 0.2).toFixed(3)),
      invoice_amount: parseFloat((amount / 5_000_000).toFixed(3)),
      buyer_category: parseFloat(buyerMod.toFixed(3)),
      prior_disputes_count: 0.02,
    },
    statutory_interest: { rate_pct: intRate, estimated_amount_rs: interest },
    _simulated: true,
  };
}

export function simulateM4(payload: {
  invoice_amount: number;
  days_overdue: number;
  agreed_period_days: number;
  rbi_bank_rate_pct: number;
}): object {
  const { invoice_amount, days_overdue, agreed_period_days, rbi_bank_rate_pct } =
    payload;
  const amount = Number(invoice_amount) || 1;
  const days = Number(days_overdue) || 0;
  const rbiRate = Number(rbi_bank_rate_pct) || 6.5;
  const intRate = rbiRate * 3;
  const interest = Math.round(amount * (intRate / 100) * (days / 365));
  return {
    eligible: days > 0,
    statutory_rate_pct: intRate,
    statutory_interest_rs: interest,
    total_payable_rs: amount + interest,
    reasoning_trace: [
      `Section 15: Payment agreed within ${agreed_period_days} days — overdue by ${days} days`,
      `Section 16: Statutory rate = 3 × RBI Bank Rate = 3 × ${rbiRate}% = ${intRate}% p.a.`,
      `Interest = ₹${amount.toLocaleString()} × ${intRate}% × ${days}/365 = ₹${interest.toLocaleString()}`,
      `Section 17: Total payable = ₹${amount.toLocaleString()} + ₹${interest.toLocaleString()} = ₹${(amount + interest).toLocaleString()}`,
    ],
    _simulated: true,
  };
}
