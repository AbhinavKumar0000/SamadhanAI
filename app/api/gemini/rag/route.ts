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
    const { caseNarrative, m1Result, m2Result, m3Result, m4Result } = body;

    const prompt = `You are a legal analyst for MSME disputes under the MSMED Act, 2006. Synthesize all pipeline model outputs below into one integrated, actionable analysis of the case document.

CASE NARRATIVE:
${caseNarrative || "Not provided"}

M1 – DISPUTE CLASSIFIER:
${JSON.stringify(m1Result || {}, null, 2)}

M2 – DOCUMENT COMPLETENESS:
${JSON.stringify(m2Result || {}, null, 2)}

M3 – PAYMENT OUTCOME PREDICTOR:
${JSON.stringify(m3Result || {}, null, 2)}

M4 – LEGAL RULE ENGINE:
${JSON.stringify(m4Result || {}, null, 2)}

Write a clear, professional analysis that integrates findings from all four models. Include:
1. Dispute type and confidence (from M1)
2. Document gaps and completeness (from M2)
3. Win probability and key factors (from M3)
4. Statutory interest and total payable (from M4)
5. Recommended next steps

Use plain text with line breaks. Avoid markdown formatting like ** or #. Use simple headings like "Summary:", "Document Status:", etc. Provide a complete analysis for all sections.`;

    const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
    let data: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } } | null = null;
    let lastError: string | null = null;

    for (const model of models) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 4096,
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
        { error: lastError || "Gemini request failed" },
        { status: 500 }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response generated";
    return NextResponse.json({ analysis: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
