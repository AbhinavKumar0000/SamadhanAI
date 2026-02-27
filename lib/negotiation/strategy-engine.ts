import {
  BuyerCategory,
  NegotiationInput,
  NegotiationRole,
  StrategyResult,
} from "./types";

function baseStrategyLabel(winProbability: number): string {
  if (winProbability > 0.75) return "Firm stance. Minimal concession.";
  if (winProbability >= 0.5) return "Structured compromise recommended.";
  return "Early settlement advisable.";
}

function derivePosture(
  winProbability: number,
  documentScore: number,
  role: NegotiationRole,
  buyerCategory: BuyerCategory,
  priorDisputesCount: number
): string {
  const highWin = winProbability > 0.75;
  const midWin = winProbability >= 0.5 && winProbability <= 0.75;
  const lowDocs = documentScore < 0.7;
  const repeatDefaulter = priorDisputesCount > 0;
  const isGovt = buyerCategory === "Govt";

  if (role === "claimant") {
    if (highWin && !lowDocs && !isGovt) {
      return "Assertive claimant posture with limited flexibility within the band.";
    }
    if ((highWin || midWin) && lowDocs) {
      return "Cautious claimant posture due to documentation gaps; negotiate within mid-band.";
    }
    if (lowDocs && !highWin) {
      return "Risk-sensitive claimant posture; focus on preserving statutory minimums.";
    }
    if (repeatDefaulter && !isGovt) {
      return "Assertive but rules-grounded posture highlighting buyer's past defaults.";
    }
    return "Balanced claimant posture with structured concessions tied to documentation quality.";
  }

  if (highWin && !lowDocs && !repeatDefaulter) {
    return "Conciliatory buyer posture acknowledging strong claimant position; aim for closure within band.";
  }
  if (midWin && !lowDocs) {
    return "Negotiating buyer posture targeting mid-band outcome with phased payment options.";
  }
  if (lowDocs) {
    return "Evidence-focused buyer posture seeking clarification and phased settlement.";
  }
  if (repeatDefaulter) {
    return "Compliance-oriented buyer posture to avoid escalation and reputational risk.";
  }
  if (isGovt) {
    return "Procedurally cautious buyer posture aligned with public sector approval workflows.";
  }

  return "Pragmatic buyer posture targeting time-bound, interest-inclusive settlement.";
}

function computeEscalationRisk(
  winProbability: number,
  documentScore: number,
  priorDisputesCount: number
): boolean {
  if (priorDisputesCount > 1) return true;
  if (winProbability > 0.8 && documentScore >= 0.7) return true;
  if (winProbability < 0.4 && documentScore < 0.7) return true;
  return false;
}

export function computeStrategy(input: NegotiationInput): StrategyResult {
  const winProbability = Number(input.win_probability);
  const documentScore = Number(input.document_completeness_score);

  let label = baseStrategyLabel(winProbability);

  if (documentScore < 0.7) {
    if (label === "Firm stance. Minimal concession.") {
      label = "Firm stance tempered by documentation gaps.";
    } else if (label === "Structured compromise recommended.") {
      label = "Structured compromise with emphasis on curing documentation gaps.";
    }
  }

  const posture = derivePosture(
    winProbability,
    documentScore,
    input.role,
    input.buyer_category,
    input.prior_disputes_count
  );

  const escalation_risk = computeEscalationRisk(
    winProbability,
    documentScore,
    input.prior_disputes_count
  );

  const strategy: StrategyResult = {
    label,
    posture,
    escalation_risk,
  };

  return strategy;
}

