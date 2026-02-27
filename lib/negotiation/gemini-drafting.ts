import { GeminiDraftInput, GeminiDraftOutput } from "./types";

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-1.5-flash"];

export async function draftNegotiationMessage(
  payload: GeminiDraftInput
): Promise<GeminiDraftOutput> {
  const key = process.env.GEMINI_API_KEY;

  const {
    input,
    total_liability,
    settlement_range,
    strategy,
    state,
  } = payload;

  const numbersBlock = JSON.stringify(
    {
      invoice_amount: input.invoice_amount,
      days_overdue: input.days_overdue,
      statutory_interest: input.statutory_interest,
      total_liability,
      win_probability: input.win_probability,
      document_completeness_score: input.document_completeness_score,
      buyer_category: input.buyer_category,
      prior_disputes_count: input.prior_disputes_count,
      current_offer: input.current_offer,
      settlement_range,
      strategy,
      negotiation_state: state,
      role: input.role,
    },
    null,
    2
  );

  const prompt = `You are drafting a formal negotiation message for an MSME payment dispute under the MSMED Act, 2006.

The numeric values below are authoritative and complete. You must not invent, guess, or adjust any numeric value outside this list. If you refer to amounts, use only these exact values.

DATA (read-only):
${numbersBlock}

Draft a concise, professional negotiation message for the party identified by "role".

Strict requirements:
- Do NOT introduce any new numeric amounts beyond the ones in DATA.
- Do NOT change, round, or re-scale the amounts; refer to them as-is.
- When referring to settlement, only reference the band "recommended_settlement_range.lower_bound" to "recommended_settlement_range.upper_bound" and the "total_liability".
- Do NOT propose any fresh counter-offer amount outside this band.
- Preserve neutrality and legal tone suitable for a government facilitation council.

Structure the output exactly as:

Message:
<formal message, 2–5 short paragraphs, plain text>

Reasoning:
<2–4 bullet-style sentences explaining why this message is appropriate, referring only to the numbers and strategy above.>`;

  if (!key) {
    const fallbackText = `Message:
Recommended settlement communication referencing total liability of ₹${total_liability.toLocaleString(
      "en-IN"
    )} within the computed band from ₹${settlement_range.lower_bound.toLocaleString(
      "en-IN"
    )} to ₹${settlement_range.upper_bound.toLocaleString(
      "en-IN"
    )}, following a "${strategy.label}" posture for the ${input.role}.

Reasoning:
- Drafted with Gemini disabled; using deterministic summary only.
- Based on computed total liability, settlement band, win probability, and documentation strength.
- No additional numeric values have been introduced beyond the deterministic engine.`;

    return {
      drafted_message: fallbackText,
      summary_reasoning:
        "Gemini key not configured; returned deterministic fallback summary based on settlement band and strategy.",
    };
  }

  let lastError: string | null = null;
  let text = "";

  for (const model of GEMINI_MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 640,
          },
        }),
      }
    );

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };

    if (res.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      text =
        data.candidates[0].content?.parts?.[0]?.text ??
        "No response generated.";
      break;
    }

    lastError = data?.error?.message || `HTTP ${res.status}`;
    if (res.status === 404) continue;
    break;
  }

  if (!text) {
    const fallbackText = `Message:
Recommended settlement communication referencing total liability of ₹${total_liability.toLocaleString(
      "en-IN"
    )} within the computed band from ₹${settlement_range.lower_bound.toLocaleString(
      "en-IN"
    )} to ₹${settlement_range.upper_bound.toLocaleString(
      "en-IN"
    )}, following a "${strategy.label}" posture for the ${input.role}.

Reasoning:
- Gemini request failed: ${lastError ?? "unknown error"}.
- Fallback deterministic summary based on settlement band and strategy.
- No additional numeric values have been introduced beyond the deterministic engine.`;

    return {
      drafted_message: fallbackText,
      summary_reasoning:
        "Gemini request failed; returned deterministic fallback summary based on settlement band and strategy.",
    };
  }

  const messageIndex = text.indexOf("Message:");
  const reasoningIndex = text.indexOf("Reasoning:");

  let draftedMessage = text.trim();
  let summaryReasoning = "";

  if (messageIndex !== -1 && reasoningIndex !== -1 && reasoningIndex > messageIndex) {
    draftedMessage = text.slice(messageIndex + "Message:".length, reasoningIndex).trim();
    summaryReasoning = text.slice(reasoningIndex + "Reasoning:".length).trim();
  } else if (reasoningIndex !== -1) {
    draftedMessage = text.slice(0, reasoningIndex).trim();
    summaryReasoning = text.slice(reasoningIndex + "Reasoning:".length).trim();
  } else {
    draftedMessage = text.trim();
    summaryReasoning =
      "Reasoning embedded in drafted message; Gemini did not return a separate reasoning block.";
  }

  return {
    drafted_message: draftedMessage,
    summary_reasoning: summaryReasoning,
  };
}

