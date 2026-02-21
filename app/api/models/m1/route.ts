import { NextRequest, NextResponse } from "next/server";
import { simulateM1 } from "@/lib/model-simulate";

const BASE = "https://abhinavdread-msme-legal-dispute-classifier-longformer.hf.space";

async function callGradio(data: unknown[]): Promise<unknown> {
  let postRes = await fetch(`${BASE}/call/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  if (postRes.status === 502) {
    await new Promise((r) => setTimeout(r, 30000));
    postRes = await fetch(`${BASE}/call/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
  }
  const postText = await postRes.text();
  if (!postText.startsWith("{")) {
    throw new Error("Gradio API returned non-JSON");
  }
  const postData = JSON.parse(postText);
  const eventId = postData?.event_id;
  if (!eventId) throw new Error(postData?.error || "No event_id");
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 500));
    const getRes = await fetch(`${BASE}/call/predict/${eventId}`);
    const getText = await getRes.text();
    const complete = getText.match(/event:\s*complete[\s\S]*?data:\s*(.+)/);
    if (complete) {
      try {
        return JSON.parse(complete[1])[0];
      } catch {
        return { data: complete[1] };
      }
    }
    if (getText.includes("event: error")) {
      const err = getText.match(/data:\s*(.+)/);
      throw new Error(err ? err[1] : "Prediction failed");
    }
  }
  throw new Error("Prediction timed out");
}

export async function POST(req: NextRequest) {
  let text = "";
  try {
    const body = await req.json();
    text = body?.text ?? (Array.isArray(body?.data) ? body.data[0] : "") ?? "";

    try {
      const out = await callGradio([text]);
      const obj = typeof out === "object" && out !== null ? out : { label: out };
      return NextResponse.json(obj);
    } catch {
      let res = await fetch(`${BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.status === 502) {
        await new Promise((r) => setTimeout(r, 30000));
        res = await fetch(`${BASE}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      }
      const t = await res.text();
      if (!t.startsWith("{")) throw new Error("Model returned non-JSON");
      const data = JSON.parse(t);
      if (!res.ok) return NextResponse.json(data, { status: res.status });
      return NextResponse.json(data);
    }
  } catch (e) {
    // Fallback: HF Space may be 404, sleeping, or return HTML
    const simulated = simulateM1(text || "Buyer defaulted on invoice.");
    return NextResponse.json(simulated);
  }
}
