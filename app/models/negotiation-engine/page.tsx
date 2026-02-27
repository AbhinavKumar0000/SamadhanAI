"use client";

import { useState } from "react";
import Link from "next/link";

type BuyerCategory = "Micro" | "Small" | "Medium" | "Large" | "Govt";
type Role = "claimant" | "buyer";

interface SettlementRange {
  lower_bound: number;
  upper_bound: number;
}

interface Strategy {
  label: string;
  posture: string;
  escalation_risk: boolean;
}

interface NegotiationOffer {
  role: Role;
  amount: number;
  timestamp: string;
}

interface NegotiationState {
  status: "ongoing" | "settled" | "escalated";
  offer_history: NegotiationOffer[];
}

interface NegotiationResponse {
  total_liability: number;
  recommended_settlement_range: SettlementRange;
  strategy: Strategy;
  negotiation_state: NegotiationState;
  draft_message: string;
}

const defaultPayload = {
  invoice_amount: 250000,
  days_overdue: 67,
  win_probability: 0.74,
  statutory_interest: 8945,
  document_completeness_score: 0.8,
  buyer_category: "Medium" as BuyerCategory,
  prior_disputes_count: 0,
  current_offer: null as number | null,
  role: "claimant" as Role,
};

export default function NegotiationEnginePage() {
  const [form, setForm] = useState(defaultPayload);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NegotiationResponse | null>(null);

  const handleChange = (key: keyof typeof form, value: string) => {
    if (key === "buyer_category") {
      setForm((prev) => ({ ...prev, buyer_category: value as BuyerCategory }));
      return;
    }
    if (key === "role") {
      setForm((prev) => ({ ...prev, role: value as Role }));
      return;
    }
    if (key === "current_offer" && value.trim() === "") {
      setForm((prev) => ({ ...prev, current_offer: null }));
      return;
    }
    const numKeys: Array<keyof typeof form> = [
      "invoice_amount",
      "days_overdue",
      "win_probability",
      "statutory_interest",
      "document_completeness_score",
      "prior_disputes_count",
      "current_offer",
    ];
    if (numKeys.includes(key)) {
      const n = Number(value);
      setForm((prev) => ({ ...prev, [key]: value === "" || Number.isNaN(n) ? (key === "current_offer" ? null : prev[key]) : n }));
      return;
    }
    setForm((prev) => ({ ...prev, [key]: value as never }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/models/m5-negotiation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = typeof data?.error === "string" ? data.error : "Negotiation engine error";
        setError(msg);
        setResult(null);
        setLoading(false);
        return;
      }
      setResult(data as NegotiationResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const range = result?.recommended_settlement_range;
  const total = result?.total_liability ?? null;

  let lowerPercent = 0;
  let upperPercent = 0;
  if (range && total && total > 0) {
    lowerPercent = Math.max(0, Math.min(100, (range.lower_bound / total) * 100));
    upperPercent = 100;
  }

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid #E7E5E4", backgroundColor: "#FAFAF9" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 24px 36px" }}>
          <Link
            href="/#models"
            style={{
              fontSize: 12,
              color: "#78716C",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 20,
            }}
          >
            ← All Models
          </Link>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span className="badge-amber">M5</span>
                <span
                  style={{
                    fontSize: 12,
                    color: "#78716C",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  Deterministic Bands + Gemini Drafting
                </span>
                <span className="badge-stone">Negotiation Engine</span>
              </div>
              <h1
                style={{
                  fontSize: "clamp(20px,3vw,28px)",
                  fontWeight: 700,
                  color: "#1C1917",
                  letterSpacing: "-0.03em",
                  marginBottom: 8,
                  lineHeight: 1.15,
                }}
              >
                MSME Negotiation Engine
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "#78716C",
                  maxWidth: 560,
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                Hybrid negotiation engine that computes deterministic settlement bands, recommends strategy, and uses Gemini only
                as a controlled drafting layer for formal negotiation messages.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px" }}>
        <section style={{ marginBottom: 32 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>
            Input Configuration
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(280px, 1.2fr) minmax(260px, 0.9fr)",
              gap: 20,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E7E5E4",
                borderRadius: 8,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#A8A29E",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Case Parameters
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#A8A29E",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Invoice Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={form.invoice_amount}
                    onChange={(e) => handleChange("invoice_amount", e.target.value)}
                    style={{
                      width: "100%",
                      fontSize: 13,
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: "1px solid #E7E5E4",
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#A8A29E",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Days Overdue
                  </label>
                  <input
                    type="number"
                    value={form.days_overdue}
                    onChange={(e) => handleChange("days_overdue", e.target.value)}
                    style={{
                      width: "100%",
                      fontSize: 13,
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: "1px solid #E7E5E4",
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#A8A29E",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Win Probability (0–1)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={1}
                    value={form.win_probability}
                    onChange={(e) => handleChange("win_probability", e.target.value)}
                    style={{
                      width: "100%",
                      fontSize: 13,
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: "1px solid #E7E5E4",
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#A8A29E",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Statutory Interest (₹)
                  </label>
                  <input
                    type="number"
                    value={form.statutory_interest}
                    onChange={(e) => handleChange("statutory_interest", e.target.value)}
                    style={{
                      width: "100%",
                      fontSize: 13,
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: "1px solid #E7E5E4",
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#A8A29E",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Document Completeness (0–1)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={1}
                    value={form.document_completeness_score}
                    onChange={(e) =>
                      handleChange("document_completeness_score", e.target.value)
                    }
                    style={{
                      width: "100%",
                      fontSize: 13,
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: "1px solid #E7E5E4",
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#A8A29E",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Buyer Category
                  </label>
                  <select
                    value={form.buyer_category}
                    onChange={(e) => handleChange("buyer_category", e.target.value)}
                    style={{
                      width: "100%",
                      fontSize: 13,
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: "1px solid #E7E5E4",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    {["Micro", "Small", "Medium", "Large", "Govt"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#A8A29E",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Prior Disputes Count
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.prior_disputes_count}
                    onChange={(e) =>
                      handleChange("prior_disputes_count", e.target.value)
                    }
                    style={{
                      width: "100%",
                      fontSize: 13,
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: "1px solid #E7E5E4",
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#A8A29E",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    style={{
                      width: "100%",
                      fontSize: 13,
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: "1px solid #E7E5E4",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <option value="claimant">Claimant (MSME)</option>
                    <option value="buyer">Buyer</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#A8A29E",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Current Offer (₹, optional)
                  </label>
                  <input
                    type="number"
                    value={form.current_offer ?? ""}
                    onChange={(e) => handleChange("current_offer", e.target.value)}
                    style={{
                      width: "100%",
                      fontSize: 13,
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: "1px solid #E7E5E4",
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  />
                </div>
              </div>
              {error && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: "#B91C1C",
                    backgroundColor: "#FEF2F2",
                    borderRadius: 6,
                    padding: "8px 10px",
                    border: "1px solid #FECACA",
                  }}
                >
                  {error}
                </div>
              )}
              <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn btn-dark btn-sm"
                >
                  {loading ? "Running Negotiation Engine…" : "Run Negotiation Engine"}
                </button>
                {result && (
                  <span
                    style={{
                      fontSize: 11,
                      color:
                        result.negotiation_state.status === "settled"
                          ? "#166534"
                          : result.negotiation_state.status === "escalated"
                          ? "#B45309"
                          : "#78716C",
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  >
                    Status: {result.negotiation_state.status}
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E7E5E4",
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#57534E",
                    marginBottom: 8,
                  }}
                >
                  Deterministic Settlement Band
                </div>
                {result && range && total ? (
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#78716C",
                        marginBottom: 8,
                      }}
                    >
                      Total liability: ₹{total.toLocaleString("en-IN")}
                    </div>
                    <div
                      style={{
                        position: "relative",
                        height: 16,
                        borderRadius: 999,
                        backgroundColor: "#F5F5F4",
                        overflow: "hidden",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: `${lowerPercent}%`,
                          width: `${upperPercent - lowerPercent}%`,
                          top: 0,
                          bottom: 0,
                          backgroundImage:
                            "linear-gradient(90deg, #FCD34D, #D97706)",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 11,
                        color: "#78716C",
                        fontFamily: "var(--font-geist-mono)",
                      }}
                    >
                      <span>
                        Lower: ₹{range.lower_bound.toLocaleString("en-IN")}
                      </span>
                      <span>
                        Upper: ₹{range.upper_bound.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#A8A29E",
                      margin: 0,
                    }}
                  >
                    Run the engine to view settlement band.
                  </p>
                )}
              </div>

              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E7E5E4",
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#57534E",
                    marginBottom: 8,
                  }}
                >
                  Strategy Recommendation
                </div>
                {result ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1C1917",
                      }}
                    >
                      {result.strategy.label}
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#57534E",
                        margin: 0,
                      }}
                    >
                      {result.strategy.posture}
                    </p>
                    <div
                      style={{
                        fontSize: 11,
                        color: result.strategy.escalation_risk
                          ? "#B45309"
                          : "#16A34A",
                        fontFamily: "var(--font-geist-mono)",
                        marginTop: 4,
                      }}
                    >
                      Escalation risk:{" "}
                      {result.strategy.escalation_risk ? "High" : "Controlled"}
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#A8A29E",
                      margin: 0,
                    }}
                  >
                    Strategy will appear here after running the engine.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>
            Drafted Negotiation Message
          </div>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E7E5E4",
              borderRadius: 8,
              padding: 18,
              minHeight: 140,
            }}
          >
            {result ? (
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "#44403C",
                  fontFamily: "var(--font-geist-mono)",
                }}
              >
                {result.draft_message}
              </pre>
            ) : (
              <p
                style={{
                  fontSize: 13,
                  color: "#A8A29E",
                  margin: 0,
                }}
              >
                Gemini will generate a controlled, formal negotiation draft once the engine
                is executed.
              </p>
            )}
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>
            Offer History
          </div>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E7E5E4",
              borderRadius: 8,
              padding: 16,
            }}
          >
            {result && result.negotiation_state.offer_history.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {result.negotiation_state.offer_history.map((offer, idx) => (
                  <div
                    key={`${offer.timestamp}-${idx}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      padding: "6px 8px",
                      borderRadius: 6,
                      backgroundColor: idx % 2 === 0 ? "#FAFAF9" : "#FFFFFF",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        color: "#44403C",
                      }}
                    >
                      {offer.role === "claimant" ? "Claimant" : "Buyer"}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        color: "#1C1917",
                      }}
                    >
                      ₹{offer.amount.toLocaleString("en-IN")}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        color: "#A8A29E",
                      }}
                    >
                      {new Date(offer.timestamp).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontSize: 13,
                  color: "#A8A29E",
                  margin: 0,
                }}
              >
                Submit an offer to start building negotiation history. The engine will
                keep the history in-memory for the current case configuration.
              </p>
            )}
          </div>
        </section>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 20,
            borderTop: "1px solid #E7E5E4",
          }}
        >
          <Link href="/models/rule-engine" className="btn btn-outline btn-sm">
            ← Rule Engine
          </Link>
          <Link href="/demo" className="btn btn-outline btn-sm">
            View Full Pipeline →
          </Link>
        </div>
      </div>
    </div>
  );
}

