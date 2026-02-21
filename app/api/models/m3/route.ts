import { NextRequest, NextResponse } from "next/server";
import { simulateM3 } from "@/lib/model-simulate";

const BASE = "https://abhinavdread-msme-payment-outcome-predictor-lightgbm.hf.space";

async function callGradio(data: unknown[]): Promise<unknown> {
  const postRes = await fetch(`${BASE}/call/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  const postText = await postRes.text();
  if (!postText.startsWith("{")) throw new Error("Gradio API returned non-JSON");
  const postData = JSON.parse(postText);
  const eventId = postData?.event_id;
  if (!eventId) throw new Error(postData?.error || "No event_id");
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 500));
    const getRes = await fetch(`${BASE}/call/predict/${eventId}`);
    const getText = await getRes.text();
    const m = getText.match(/event:\s*complete[\s\S]*?data:\s*(.+)/);
    if (m) {
      try {
        return JSON.parse(m[1])[0];
      } catch {
        return { data: m[1] };
      }
    }
    if (getText.includes("event: error")) throw new Error("Prediction failed");
  }
  throw new Error("Prediction timed out");
}

const defaultPayload = {
  invoice_amount: 250000,
  days_overdue: 67,
  document_completeness_score: 0.8,
  buyer_category: "large_enterprise",
  prior_disputes_count: 0,
};

export async function POST(req: NextRequest) {
  let payload = { ...defaultPayload } as typeof defaultPayload & { prior_disputes_count: number };
  try {
    const body = await req.json();
    payload = {
      invoice_amount: Number(body.invoice_amount ?? 250000),
      days_overdue: Number(body.days_overdue ?? 67),
      document_completeness_score: Number(body.document_completeness_score ?? 0.8),
      buyer_category: String(body.buyer_category ?? "large_enterprise"),
      prior_disputes_count: Number(body.prior_disputes_count ?? body.prior_disputes ?? 0),
    };
    const gradioData = [payload.invoice_amount, payload.days_overdue, payload.document_completeness_score, payload.buyer_category, payload.prior_disputes_count];

    try {
      const out = await callGradio(gradioData);
      const obj = typeof out === "object" && out !== null ? out : { win_probability: 0.7 };
      return NextResponse.json(obj);
    } catch {
      const res = await fetch(`${BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const t = await res.text();
      if (!t.startsWith("{")) throw new Error("Model returned non-JSON");
      const data = JSON.parse(t);
      if (!res.ok) return NextResponse.json(data, { status: res.status });
      return NextResponse.json(data);
    }
  } catch (e) {
    const simulated = simulateM3(payload);
    return NextResponse.json(simulated);
  }
}
