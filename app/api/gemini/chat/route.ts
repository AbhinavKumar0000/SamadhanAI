import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const {
      caseNarrative,
      m1Result,
      m2Result,
      m3Result,
      m4Result,
      m5Result,
      messages,
      question,
    } = body as {
      caseNarrative?: string;
      m1Result?: unknown;
      m2Result?: unknown;
      m3Result?: unknown;
      m4Result?: unknown;
      m5Result?: unknown;
      messages?: Array<{ role: "user" | "assistant"; content: string }>;
      question?: string;
    };

    const contextBlock = `## Document & Pipeline Analysis Context (your memory)

**Case narrative:**
${caseNarrative || "Not provided"}

**M1 – Dispute classification:** ${JSON.stringify(m1Result || {}, null, 2)}

**M2 – Document completeness:** ${JSON.stringify(m2Result || {}, null, 2)}

**M3 – Payment outcome:** ${JSON.stringify(m3Result || {}, null, 2)}

**M4 – Legal rule engine:** ${JSON.stringify(m4Result || {}, null, 2)}

**M5 – Negotiation engine:** ${JSON.stringify(m5Result || {}, null, 2)}`;

    const systemPrompt = `You are a legal analyst assistant for MSME disputes under the MSMED Act, 2006. You have access to the document analysis context above (case narrative + M1–M5 pipeline outputs). Answer the user's questions based on this context. Be concise, professional, and cite specific findings from the pipeline when relevant. If the question cannot be answered from the context, say so.`;

    const msgs = messages && messages.length > 0 ? messages : [];
    const lastUser = msgs.filter((m) => m.role === "user").pop();
    const userPrompt = question || lastUser?.content || "Please help.";

    let conversation = `${contextBlock}\n\n---\n${systemPrompt}\n\n---\n\n`;
    for (const m of msgs.slice(0, -1)) {
      conversation += m.role === "user" ? `User: ${m.content}\n\n` : `Assistant: ${m.content}\n\n`;
    }
    conversation += `User: ${userPrompt}`;

    const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
    let data: {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    } | null = null;
    let lastError: string | null = null;

    for (const model of models) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: conversation }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
        }
      );
      data = await res.json();
      if (res.ok) break;
      lastError = data?.error?.message || `HTTP ${res.status}`;
      if (res.status === 404) continue;
      return NextResponse.json(
        { error: lastError },
        { status: res.status >= 400 ? res.status : 500 }
      );
    }

    if (!data || !data?.candidates?.[0]) {
      return NextResponse.json(
        { error: lastError || "Chat request failed" },
        { status: 500 }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response generated";
    return NextResponse.json({ reply: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
