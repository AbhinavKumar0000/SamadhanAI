import { NextRequest, NextResponse } from "next/server";
import { NegotiationInput, NegotiationApiResponse } from "@/lib/negotiation/types";
import { computeSettlementRange } from "@/lib/negotiation/settlement-calculator";
import { computeStrategy } from "@/lib/negotiation/strategy-engine";
import { updateNegotiationState } from "@/lib/negotiation/state-machine";
import { draftNegotiationMessage } from "@/lib/negotiation/gemini-drafting";

function parseInput(body: unknown): NegotiationInput {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const b = body as Record<string, unknown>;

  const invoice_amount = Number(b.invoice_amount);
  const days_overdue = Number(b.days_overdue);
  const win_probability = Number(b.win_probability);
  const statutory_interest = Number(b.statutory_interest);
  const document_completeness_score = Number(b.document_completeness_score);
  const prior_disputes_count = Number(b.prior_disputes_count ?? 0);
  const current_offer =
    b.current_offer === null || b.current_offer === undefined
      ? null
      : Number(b.current_offer);

  const buyer_category_raw = String(b.buyer_category ?? "");
  const buyer_category =
    buyer_category_raw === "Micro" ||
    buyer_category_raw === "Small" ||
    buyer_category_raw === "Medium" ||
    buyer_category_raw === "Large" ||
    buyer_category_raw === "Govt"
      ? buyer_category_raw
      : "Medium";

  const role_raw = String(b.role ?? "");
  const role = role_raw === "buyer" ? "buyer" : "claimant";

  if (!Number.isFinite(invoice_amount) || invoice_amount <= 0) {
    throw new Error("invoice_amount must be a positive number");
  }
  if (!Number.isFinite(days_overdue) || days_overdue < 0) {
    throw new Error("days_overdue must be a non-negative number");
  }
  if (!Number.isFinite(win_probability) || win_probability < 0 || win_probability > 1) {
    throw new Error("win_probability must be between 0 and 1");
  }
  if (!Number.isFinite(statutory_interest) || statutory_interest < 0) {
    throw new Error("statutory_interest must be a non-negative number");
  }
  if (
    !Number.isFinite(document_completeness_score) ||
    document_completeness_score < 0 ||
    document_completeness_score > 1
  ) {
    throw new Error("document_completeness_score must be between 0 and 1");
  }
  if (!Number.isFinite(prior_disputes_count) || prior_disputes_count < 0) {
    throw new Error("prior_disputes_count must be a non-negative number");
  }
  if (current_offer !== null && (!Number.isFinite(current_offer) || current_offer <= 0)) {
    throw new Error("current_offer must be null or a positive number");
  }

  return {
    invoice_amount,
    days_overdue,
    win_probability,
    statutory_interest,
    document_completeness_score,
    buyer_category,
    prior_disputes_count,
    current_offer,
    role,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = parseInput(body);

    const settlement = computeSettlementRange(input);
    const strategy = computeStrategy(input);
    const state = updateNegotiationState(input, settlement.range);

    const draft = await draftNegotiationMessage({
      input,
      total_liability: settlement.total_liability,
      settlement_range: settlement.range,
      strategy,
      state,
    });

    const response: NegotiationApiResponse = {
      total_liability: settlement.total_liability,
      recommended_settlement_range: {
        lower_bound: settlement.range.lower_bound,
        upper_bound: settlement.range.upper_bound,
      },
      strategy,
      negotiation_state: {
        status: state.status,
        offer_history: state.offers,
      },
      draft_message: draft.drafted_message,
    };

    return NextResponse.json(response);
  } catch (e) {
    const msg =
      e instanceof Error && e.message
        ? e.message
        : "Unable to process negotiation request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

