export type BuyerCategory = "Micro" | "Small" | "Medium" | "Large" | "Govt";

export type NegotiationRole = "claimant" | "buyer";

export interface NegotiationInput {
  invoice_amount: number;
  days_overdue: number;
  win_probability: number;
  statutory_interest: number;
  document_completeness_score: number;
  buyer_category: BuyerCategory;
  prior_disputes_count: number;
  current_offer: number | null;
  role: NegotiationRole;
}

export interface SettlementRange {
  lower_bound: number;
  upper_bound: number;
  confidence_factor: number;
}

export interface StrategyResult {
  label: string;
  posture: string;
  escalation_risk: boolean;
}

export type NegotiationStatus = "ongoing" | "settled" | "escalated";

export interface NegotiationOffer {
  role: NegotiationRole;
  amount: number;
  timestamp: string;
}

export interface NegotiationState {
  case_id: string;
  offers: NegotiationOffer[];
  status: NegotiationStatus;
}

export interface GeminiDraftInput {
  input: NegotiationInput;
  total_liability: number;
  settlement_range: SettlementRange;
  strategy: StrategyResult;
  state: NegotiationState;
}

export interface GeminiDraftOutput {
  drafted_message: string;
  summary_reasoning: string;
}

export interface NegotiationApiResponse {
  total_liability: number;
  recommended_settlement_range: {
    lower_bound: number;
    upper_bound: number;
  };
  strategy: StrategyResult;
  negotiation_state: {
    status: NegotiationStatus;
    offer_history: NegotiationOffer[];
  };
  draft_message: string;
}

