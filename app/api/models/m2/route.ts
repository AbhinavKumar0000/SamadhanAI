import { NextRequest, NextResponse } from "next/server";
import { simulateM2 } from "@/lib/model-simulate";

const BASE = "https://abhinavdread-msme-document-presence-xgboost.hf.space";

async function callGradio(data: unknown[], apiName = "predict"): Promise<unknown> {
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

export async function POST(req: NextRequest) {
  let text = "";
  try {
    const body = await req.json();
    text = body?.text ?? (Array.isArray(body?.data) ? body.data[0] : "") ?? "";

    try {
      const out = await callGradio([text], "evaluate-case");
      const obj = typeof out === "object" && out !== null ? out : { completeness_score: 0.8, results: {} };
      return NextResponse.json(obj);
    } catch {
      const res = await fetch(`${BASE}/call/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [text] }),
      });
      const altText = await res.text();
      if (altText.startsWith("{") && altText.includes("event_id")) {
        const altData = JSON.parse(altText);
        const eid = altData.event_id;
        for (let j = 0; j < 60; j++) {
          await new Promise((r) => setTimeout(r, 500));
          const g = await fetch(`${BASE}/call/predict/${eid}`);
          const gt = await g.text();
          const gm = gt.match(/event:\s*complete[\s\S]*?data:\s*(.+)/);
          if (gm) {
            try {
              const parsed = JSON.parse(gm[1]);
              const outVal = Array.isArray(parsed) ? parsed[0] : parsed;
              const obj = typeof outVal === "object" && outVal !== null ? outVal : { completeness_score: 0.8, results: {} };
              return NextResponse.json(obj);
            } catch { /* fall through */ }
          }
        }
      }
      const res2 = await fetch(`${BASE}/evaluate-case`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const t = await res2.text();
      if (!t.startsWith("{")) throw new Error("Model returned non-JSON");
      const data = JSON.parse(t);
      if (!res2.ok) return NextResponse.json(data, { status: res2.status });
      return NextResponse.json(data);
    }
  } catch (e) {
    const simulated = simulateM2(text || "Invoice attached. Purchase order signed.");
    return NextResponse.json(simulated);
  }
}
