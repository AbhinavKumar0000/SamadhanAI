import { NegotiationInput, SettlementRange } from "./types";

export function computeSettlementRange(input: NegotiationInput): {
  total_liability: number;
  range: SettlementRange;
} {
  const invoiceAmount = Number(input.invoice_amount) || 0;
  const statutoryInterest = Number(input.statutory_interest) || 0;
  const winProbability = Number(input.win_probability);

  const totalLiability = invoiceAmount + statutoryInterest;

  let confidenceFactor = 0.7;
  if (winProbability > 0.8) {
    confidenceFactor = 0.95;
  } else if (winProbability > 0.6) {
    confidenceFactor = 0.9;
  } else if (winProbability > 0.4) {
    confidenceFactor = 0.8;
  }

  const lower = totalLiability * confidenceFactor;
  const upper = totalLiability;

  const range: SettlementRange = {
    lower_bound: Math.round(lower),
    upper_bound: Math.round(upper),
    confidence_factor: confidenceFactor,
  };

  return {
    total_liability: Math.round(totalLiability),
    range,
  };
}

