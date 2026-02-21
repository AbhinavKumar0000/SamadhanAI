import { NextRequest, NextResponse } from "next/server";
import { simulateM4 } from "@/lib/model-simulate";

const BASE = "https://abhinavdread-msme-legal-rule-engine.hf.space";

async function callGradio(data: unknown[], apiName = "evaluate-case"): Promise<unknown> {
  const postRes = await fetch(`${BASE}/call/${apiName}`, {
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
    const getRes = await fetch(`${BASE}/call/${apiName}/${eventId}`);
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
  agreed_period_days: 45,
  rbi_bank_rate_pct: 6.5,
};

export async function POST(req: NextRequest) {
  const payload = { ...defaultPayload };
  try {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    payload.invoice_amount = Number(body?.invoice_amount ?? 250000);
    payload.days_overdue = Number(body?.days_overdue ?? 67);
    payload.agreed_period_days = Number(body?.agreed_period_days ?? 45);
    payload.rbi_bank_rate_pct = Number(body?.rbi_bank_rate_pct ?? 6.5);
  } catch { /* use defaults */ }

  try {
    const gradioData = [payload.invoice_amount, payload.days_overdue, payload.agreed_period_days, payload.rbi_bank_rate_pct];
    try {
      const out = await callGradio(gradioData, "evaluate-case");
      const obj = typeof out === "object" && out !== null ? out : {};
      return NextResponse.json(obj);
    } catch {
      try {
        const out2 = await callGradio(gradioData, "predict");
        const obj = typeof out2 === "object" && out2 !== null ? out2 : {};
        return NextResponse.json(obj);
      } catch { /* fall through */ }
      const res = await fetch(`${BASE}/evaluate-case`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const t = await res.text();
      if (t.startsWith("{") && res.ok) {
        const data = JSON.parse(t);
        return NextResponse.json(data);
      }
      throw new Error("HF unavailable");
    }
  } catch {
    return NextResponse.json(simulateM4(payload));
  }
}
