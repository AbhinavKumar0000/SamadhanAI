import {
  NegotiationInput,
  NegotiationOffer,
  NegotiationState,
  NegotiationStatus,
  SettlementRange,
} from "./types";

const store = new Map<string, NegotiationState>();

function deriveCaseId(input: NegotiationInput): string {
  const buyer = input.buyer_category;
  const role = input.role;
  const invoice = Number.isFinite(input.invoice_amount) ? input.invoice_amount : 0;
  const days = Number.isFinite(input.days_overdue) ? input.days_overdue : 0;
  const disputes = Number.isFinite(input.prior_disputes_count)
    ? input.prior_disputes_count
    : 0;
  return [
    "msme",
    buyer,
    role,
    String(invoice),
    String(days),
    String(disputes),
  ].join("|");
}

function evaluateStatus(
  previousStatus: NegotiationStatus,
  offers: NegotiationOffer[],
  settlementRange: SettlementRange
): NegotiationStatus {
  if (offers.length === 0) return previousStatus;

  const last = offers[offers.length - 1];
  const amount = last.amount;

  if (
    amount >= settlementRange.lower_bound &&
    amount <= settlementRange.upper_bound
  ) {
    return "settled";
  }

  if (offers.length >= 4 && amount < settlementRange.lower_bound * 0.6) {
    return "escalated";
  }

  return previousStatus;
}

export function updateNegotiationState(
  input: NegotiationInput,
  settlementRange: SettlementRange
): NegotiationState {
  const caseId = deriveCaseId(input);
  const existing = store.get(caseId);

  const baseState: NegotiationState =
    existing ?? {
      case_id: caseId,
      offers: [],
      status: "ongoing",
    };

  const offers = [...baseState.offers];

  if (typeof input.current_offer === "number" && input.current_offer > 0) {
    const offer: NegotiationOffer = {
      role: input.role,
      amount: Math.round(input.current_offer),
      timestamp: new Date().toISOString(),
    };
    offers.push(offer);
  }

  const status = evaluateStatus(baseState.status, offers, settlementRange);

  const nextState: NegotiationState = {
    case_id: caseId,
    offers,
    status,
  };

  store.set(caseId, nextState);

  return nextState;
}

