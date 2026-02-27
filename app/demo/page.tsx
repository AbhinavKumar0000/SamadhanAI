"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

// Model proxy endpoints (server-side, avoids CORS + HTML error handling)
const MODEL_API = {
  m1: "/api/models/m1",
  m2: "/api/models/m2",
  m3: "/api/models/m3",
  m4: "/api/models/m4",
  m5: "/api/models/m5-negotiation",
};

type StepId = "input" | "asr" | "ocr" | "m1" | "m2" | "m3" | "m4" | "m5" | "rag";

interface StepState {
  id: StepId;
  label: string;
  status: "pending" | "running" | "done" | "skip" | "error";
  result?: unknown;
  error?: string;
  input?: unknown;
  output?: unknown;
}

const STEPS: { id: StepId; label: string }[] = [
  { id: "input", label: "Input Processing" },
  { id: "asr", label: "ASR (SarvamAI)" },
  { id: "ocr", label: "OCR (SarvamAI)" },
  { id: "m1", label: "M1 Dispute Classifier" },
  { id: "m2", label: "M2 Doc Completeness" },
  { id: "m3", label: "M3 Payment Predictor" },
  { id: "m4", label: "M4 Rule Engine" },
  { id: "m5", label: "M5 Negotiation Engine" },
  { id: "rag", label: "RAG Analysis" },
];

export default function DemoPage() {
  const [inputMode, setInputMode] = useState<"text" | "voice" | "doc" | "all">("text");
  const [textInput, setTextInput] = useState("");
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<StepState[]>(
    STEPS.map((s) => ({ ...s, status: "pending" as const }))
  );
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [pipelineContext, setPipelineContext] = useState<{
    caseNarrative: string;
    m1Result: unknown;
    m2Result: unknown;
    m3Result: unknown;
    m4Result: unknown;
    m5Result: unknown;
  } | null>(null);
  const [structuredInputs, setStructuredInputs] = useState({
    invoice_amount: "250000",
    days_overdue: "67",
    document_completeness_score: "0.8",
    buyer_category: "large_enterprise",
    prior_disputes_count: "0",
    agreed_period_days: "45",
    rbi_bank_rate_pct: "6.5",
  });
  const [isRecording, setIsRecording] = useState(false);
  const [expandedStep, setExpandedStep] = useState<StepId | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const docInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    setVoiceFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setVoiceFile(new File([blob], "recording.webm", { type: "audio/webm" }));
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (e) {
      alert("Microphone access denied. Please allow microphone and try again.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  const updateStep = (id: StepId, update: Partial<StepState>) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...update } : s))
    );
  };

  const runPipeline = async () => {
    setRunning(true);
    setAnalysis(null);
    setChatMessages([]);
    setPipelineContext(null);
    setSteps(STEPS.map((s) => ({ ...s, status: "pending" as const })));

    let caseText = textInput.trim();
    const needAsr = (inputMode === "voice" || inputMode === "all") && voiceFile;
    const needOcr = (inputMode === "doc" || inputMode === "all") && docFile;

    if (needAsr) {
      updateStep("asr", { status: "running", input: { audio: voiceFile!.name, size: voiceFile!.size } });
      try {
        const fd = new FormData();
        fd.append("file", voiceFile!);
        const r = await fetch("/api/sarvam/asr", { method: "POST", body: fd });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "ASR failed");
        caseText = (caseText ? caseText + "\n\n" : "") + (data.transcript || "");
        updateStep("asr", { status: "done", result: data, output: data });
      } catch (e) {
        updateStep("asr", { status: "error", error: String(e), output: undefined });
      }
    } else {
      updateStep("asr", { status: "skip", input: null, output: null });
    }

    if (needOcr) {
      updateStep("ocr", { status: "running", input: { file: docFile!.name, size: docFile!.size } });
      try {
        const fd = new FormData();
        fd.append("file", docFile!);
        const r = await fetch("/api/sarvam/ocr", { method: "POST", body: fd });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "OCR failed");
        caseText = (caseText ? caseText + "\n\n" : "") + (data.extracted_text || "");
        updateStep("ocr", { status: "done", result: data, output: data });
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        updateStep("ocr", {
          status: "error",
          error:
            errMsg.includes("API key") || errMsg.includes("403")
              ? "Check SARVAM_API_KEY in .env.local"
              : errMsg.length > 80
                ? errMsg.slice(0, 80) + "… (see console)"
                : errMsg + ". Tip: Paste document text in Text field if OCR fails.",
          output: undefined,
        });
      }
    } else {
      updateStep("ocr", { status: "skip", input: null, output: null });
    }

    if (!caseText) {
      updateStep("input", {
        status: "error",
        error: "No text from input",
        input: {
          textInput: textInput.trim(),
          voiceFile: voiceFile?.name,
          docFile: docFile?.name,
        },
      });
      setRunning(false);
      return;
    }
    updateStep("input", {
      status: "done",
      input: {
        textInput: textInput.trim(),
        voiceFile: voiceFile?.name ?? null,
        docFile: docFile?.name ?? null,
      },
      output: { combinedCaseText: caseText },
    });

    // M1
    const m1Input = { text: caseText };
    updateStep("m1", { status: "running", input: m1Input });
    let m1Result: unknown = null;
    try {
      const r = await fetch(MODEL_API.m1, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: caseText }),
      });
      const m1Data = await r.json();
      m1Result = m1Data;
      if (!r.ok) throw new Error(m1Data.error || "M1 failed");
      updateStep("m1", { status: "done", result: m1Result, output: m1Result });
    } catch (e) {
      updateStep("m1", { status: "error", error: String(e), output: undefined });
    }

    // M2
    const m2Input = { text: caseText };
    updateStep("m2", { status: "running", input: m2Input });
    let m2Result: unknown = null;
    try {
      const r = await fetch(MODEL_API.m2, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: caseText }),
      });
      const m2Data = await r.json();
      m2Result = m2Data;
      if (!r.ok) throw new Error(m2Data.error || "M2 failed");
      const completeness =
        (m2Result as { completeness_score?: number })?.completeness_score ?? 0.8;
      setStructuredInputs((prev) => ({
        ...prev,
        document_completeness_score: String(completeness),
      }));
      updateStep("m2", { status: "done", result: m2Result, output: m2Result });
    } catch (e) {
      updateStep("m2", { status: "error", error: String(e), output: undefined });
    }

    // M3
    const m3Input = {
      invoice_amount: Number(structuredInputs.invoice_amount),
      days_overdue: Number(structuredInputs.days_overdue),
      document_completeness_score: Number(structuredInputs.document_completeness_score),
      buyer_category: structuredInputs.buyer_category,
      prior_disputes_count: Number(structuredInputs.prior_disputes_count),
    };
    updateStep("m3", { status: "running", input: m3Input });
    let m3Result: unknown = null;
    try {
      const r = await fetch(MODEL_API.m3, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(m3Input),
      });
      const m3Data = await r.json();
      m3Result = m3Data;
      if (!r.ok) throw new Error(m3Data.error || "M3 failed");
      updateStep("m3", { status: "done", result: m3Result, output: m3Result });
    } catch (e) {
      updateStep("m3", { status: "error", error: String(e), output: undefined });
    }

    // M4
    const m4Input = {
      invoice_amount: Number(structuredInputs.invoice_amount),
      days_overdue: Number(structuredInputs.days_overdue),
      agreed_period_days: Number(structuredInputs.agreed_period_days),
      rbi_bank_rate_pct: Number(structuredInputs.rbi_bank_rate_pct),
    };
    updateStep("m4", { status: "running", input: m4Input });
    let m4Result: unknown = null;
    try {
      const r = await fetch(MODEL_API.m4, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(m4Input),
      });
      const m4Data = await r.json();
      m4Result = m4Data;
      if (!r.ok) throw new Error(m4Data.error || "M4 failed");
      updateStep("m4", { status: "done", result: m4Result, output: m4Result });
    } catch (e) {
      updateStep("m4", { status: "error", error: String(e), output: undefined });
    }

    // M5 Negotiation Engine — uses M3 win_probability, M4 statutory_interest, structured inputs
    const buyerCat = String(structuredInputs.buyer_category || "medium");
    const m5BuyerCategory =
      buyerCat === "micro" ? "Micro" :
      buyerCat === "small" ? "Small" :
      buyerCat === "medium" ? "Medium" :
      buyerCat === "large_enterprise" ? "Large" :
      buyerCat === "government" ? "Govt" : "Medium";
    const m4Obj = m4Result as { statutory_interest_rs?: number; statutory_interest?: { estimated_amount_rs?: number } } | null;
    const statutoryInterest =
      (m4Obj?.statutory_interest_rs ?? m4Obj?.statutory_interest?.estimated_amount_rs) ?? 0;
    const m3Obj = m3Result as { win_probability?: number } | null;
    const winProbability = m3Obj?.win_probability ?? 0.74;
    const m5Input = {
      invoice_amount: Number(structuredInputs.invoice_amount),
      days_overdue: Number(structuredInputs.days_overdue),
      win_probability: winProbability,
      statutory_interest: statutoryInterest,
      document_completeness_score: Number(structuredInputs.document_completeness_score),
      buyer_category: m5BuyerCategory,
      prior_disputes_count: Number(structuredInputs.prior_disputes_count),
      current_offer: null,
      role: "claimant",
    };
    updateStep("m5", { status: "running", input: m5Input });
    let m5Result: unknown = null;
    try {
      const r = await fetch(MODEL_API.m5, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(m5Input),
      });
      const m5Data = await r.json();
      m5Result = m5Data;
      if (!r.ok) throw new Error(m5Data.error || "M5 failed");
      updateStep("m5", { status: "done", result: m5Result, output: m5Result });
    } catch (e) {
      updateStep("m5", { status: "error", error: String(e), output: undefined });
    }

    // RAG (Gemini) — includes M5 negotiation result
    const ragInput = { caseNarrative: caseText, m1Result, m2Result, m3Result, m4Result, m5Result };
    updateStep("rag", { status: "running", input: ragInput });
    try {
      const r = await fetch("/api/gemini/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseNarrative: caseText,
          m1Result,
          m2Result,
          m3Result,
          m4Result,
          m5Result,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "RAG failed");
      setAnalysis(data.analysis || "");
      setPipelineContext({
        caseNarrative: caseText,
        m1Result,
        m2Result,
        m3Result,
        m4Result,
        m5Result,
      });
      updateStep("rag", { status: "done", result: { analysis: data.analysis }, output: { analysis: data.analysis } });
    } catch (e) {
      updateStep("rag", { status: "error", error: String(e), output: undefined });
    }

    setRunning(false);
  };

  const sendChat = async () => {
    const q = chatInput.trim();
    if (!q || !pipelineContext || chatLoading) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: q }]);
    setChatLoading(true);
    try {
      const r = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pipelineContext,
          messages: [...chatMessages, { role: "user", content: q }],
          question: q,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Chat failed");
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.reply || "" }]);
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${e instanceof Error ? e.message : "Chat failed"}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const doneCount = steps.filter((s) => s.status === "done").length;
  const skipCount = steps.filter((s) => s.status === "skip").length;
  const progress = Math.round(
    ((doneCount + skipCount) / steps.length) * 100
  );

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
      {/* Page header */}
      <div
        style={{
          borderBottom: "1px solid #E5E5E4",
          backgroundColor: "#FAFAF9",
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 24px 36px" }}>
          <Link
            href="/"
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
            ← Home
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
                <span className="badge-amber">Pipeline Demo</span>
                <span
                  style={{
                    fontSize: 12,
                    color: "#78716C",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  SarvamAI + M1–M5 + RAG
                </span>
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
                Full Pipeline Demo
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
                Upload a document, record voice, or type your dispute narrative.
                The pipeline runs ASR/OCR → M1–M5 → RAG to produce an
                actionable analysis including negotiation strategy and draft.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px" }}>
        {/* Input mode */}
        <section style={{ marginBottom: 32 }}>
          <div className="label-tag" style={{ marginBottom: 12 }}>
            Input Mode
          </div>
          <div
            style={{
              display: "flex",
              gap: 0,
              border: "1.5px solid #E7E5E4",
              borderRadius: 8,
              overflow: "hidden",
              width: "fit-content",
            }}
          >
            {[
              { id: "text" as const, label: "Text / Chat" },
              { id: "voice" as const, label: "Voice" },
              { id: "doc" as const, label: "Document" },
              { id: "all" as const, label: "All" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setInputMode(m.id)}
                style={{
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  backgroundColor: inputMode === m.id ? "#1C1917" : "#FFFFFF",
                  color: inputMode === m.id ? "#FFFFFF" : "#78716C",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </section>

        {/* Inputs */}
        <section
          style={{
            marginBottom: 32,
            border: "1.5px solid #E7E5E4",
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid #E7E5E4",
              backgroundColor: "#FAFAF9",
              fontSize: 13,
              fontWeight: 600,
              color: "#57534E",
            }}
          >
            Input
          </div>
          <div style={{ padding: 20 }}>
            {(inputMode === "text" || inputMode === "all") && (
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#A8A29E",
                    letterSpacing: "0.07em",
                    marginBottom: 6,
                  }}
                >
                  Text / Chat
                </label>
                <textarea
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="e.g. Buyer defaulted on Invoice INV-2024-001 dated 15-Jan-2024. Rs 2,50,000 outstanding. 67 days elapsed since agreed payment date."
                  style={{
                    width: "100%",
                    fontSize: 13,
                    padding: "10px 12px",
                    fontFamily: "inherit",
                    border: "1px solid #E7E5E4",
                    borderRadius: 6,
                    backgroundColor: "#FAFAF9",
                    color: "#1C1917",
                    resize: "vertical",
                    outline: "none",
                    lineHeight: 1.5,
                  }}
                />
              </div>
            )}
            {(inputMode === "voice" || inputMode === "all") && (
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#A8A29E",
                    letterSpacing: "0.07em",
                    marginBottom: 6,
                  }}
                >
                  Live Voice Recording (SarvamAI ASR, &lt; 30s)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="btn btn-amber btn-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <span style={{ fontSize: 14 }}>●</span> Start Recording
                    </button>
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          height: 28,
                        }}
                        aria-hidden
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                          <div
                            key={i}
                            style={{
                              width: 4,
                              height: 12,
                              borderRadius: 2,
                              backgroundColor: "#D97706",
                              transformOrigin: "bottom",
                              animation: "wave 0.6s ease-in-out infinite",
                              animationDelay: `${i * 0.07}s`,
                            }}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="btn btn-outline btn-sm"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          borderColor: "#DC2626",
                          color: "#DC2626",
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: "#DC2626",
                            animation: "pulse 1s infinite",
                          }}
                        />
                        Stop Recording
                      </button>
                    </>
                  )}
                  {voiceFile && !isRecording && (
                    <span style={{ fontSize: 12, color: "#166534" }}>
                      ✓ {voiceFile.name} ({(voiceFile.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
              </div>
            )}
            {(inputMode === "doc" || inputMode === "all") && (
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#A8A29E",
                    letterSpacing: "0.07em",
                    marginBottom: 6,
                  }}
                >
                  Document (PDF or image)
                </label>
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".pdf,application/pdf,.png,.jpg,.jpeg,image/png,image/jpeg,image/jpg"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="btn btn-outline btn-sm"
                >
                  {docFile ? docFile.name : "Choose PDF or image"}
                </button>
              </div>
            )}

            {/* Structured inputs for M3/M4 */}
            <details
              style={{
                marginTop: 16,
                border: "1px solid #E7E5E4",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <summary
                style={{
                  padding: "10px 14px",
                  backgroundColor: "#FAFAF9",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#57534E",
                  cursor: "pointer",
                }}
              >
                M3 / M4 Structured Inputs (optional)
              </summary>
              <div
                style={{
                  padding: 16,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  ["invoice_amount", "Invoice Amount (₹)", "250000"],
                  ["days_overdue", "Days Overdue", "67"],
                  ["document_completeness_score", "Doc Score (0–1)", "0.8"],
                  ["agreed_period_days", "Agreed Period (days)", "45"],
                  ["rbi_bank_rate_pct", "RBI Rate (%)", "6.5"],
                ].map(([key, label, def]) => (
                  <div key={key}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#A8A29E",
                        marginBottom: 4,
                      }}
                    >
                      {label}
                    </label>
                    <input
                      type="text"
                      value={
                        structuredInputs[
                          key as keyof typeof structuredInputs
                        ] ?? def
                      }
                      onChange={(e) =>
                        setStructuredInputs((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        fontSize: 12,
                        padding: "6px 10px",
                        fontFamily: "var(--font-geist-mono), monospace",
                        border: "1px solid #E7E5E4",
                        borderRadius: 6,
                        backgroundColor: "#FFFFFF",
                      }}
                    />
                  </div>
                ))}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#A8A29E",
                      marginBottom: 4,
                    }}
                  >
                    Buyer Category
                  </label>
                  <select
                    value={structuredInputs.buyer_category}
                    onChange={(e) =>
                      setStructuredInputs((prev) => ({
                        ...prev,
                        buyer_category: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      fontSize: 12,
                      padding: "6px 10px",
                      border: "1px solid #E7E5E4",
                      borderRadius: 6,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    {["micro", "small", "medium", "large_enterprise", "government"].map(
                      (c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </details>
          </div>
        </section>

        {/* Run button & progress */}
        <section style={{ marginBottom: 32 }}>
          <button
            onClick={runPipeline}
            disabled={
              running ||
              (!textInput.trim() && !voiceFile && !docFile)
            }
            className="btn btn-dark"
            style={{
              marginBottom: 20,
              opacity:
                running || (!textInput.trim() && !voiceFile && !docFile)
                  ? 0.6
                  : 1,
              cursor:
                running || (!textInput.trim() && !voiceFile && !docFile)
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {running ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#FFF",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Running pipeline...
              </>
            ) : (
              "▶ Run Full Pipeline"
            )}
          </button>

          {/* Progress bar */}
          <div
            style={{
              height: 8,
              backgroundColor: "#F5F5F4",
              borderRadius: 4,
              overflow: "hidden",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                backgroundColor: "#D97706",
                borderRadius: 4,
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {/* Step list with expandable input/output */}
          <div
            style={{
              border: "1px solid #E7E5E4",
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: "#FAFAF9",
            }}
          >
            {steps.map((s) => {
              const hasDetails = Boolean(
                (s.input !== undefined && s.input !== null) ||
                (s.output !== undefined && s.output !== null) ||
                s.result
              );
              const isExpanded = expandedStep === s.id;
              return (
                <div
                  key={s.id}
                  style={{
                    borderBottom:
                      s.id !== steps[steps.length - 1].id
                        ? "1px solid #E7E5E4"
                        : "none",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      hasDetails &&
                      setExpandedStep(isExpanded ? null : s.id)
                    }
                    onKeyDown={(e) =>
                      hasDetails &&
                      (e.key === "Enter" || e.key === " ") &&
                      setExpandedStep(isExpanded ? null : s.id)
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 16px",
                      cursor: hasDetails ? "pointer" : "default",
                      backgroundColor: isExpanded ? "#FAFAF9" : undefined,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        flexShrink: 0,
                        ...(s.status === "done"
                          ? {
                              backgroundColor: "#D1FAE5",
                              color: "#065F46",
                            }
                          : s.status === "running"
                            ? {
                                backgroundColor: "#FEF3C7",
                                color: "#92400E",
                              }
                            : s.status === "error"
                              ? {
                                  backgroundColor: "#FEE2E2",
                                  color: "#991B1B",
                                }
                              : s.status === "skip"
                                ? {
                                    backgroundColor: "#F5F5F4",
                                    color: "#A8A29E",
                                  }
                                : {
                                    backgroundColor: "#F5F5F4",
                                    color: "#A8A29E",
                                  }),
                      }}
                    >
                      {s.status === "done"
                        ? "✓"
                        : s.status === "running"
                          ? "…"
                          : s.status === "skip"
                            ? "−"
                            : s.status === "error"
                              ? "!"
                              : "○"}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#1C1917",
                        flex: 1,
                      }}
                    >
                      {s.label}
                    </span>
                    {hasDetails && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#78716C",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {isExpanded ? "▼" : "▶"} View I/O
                      </span>
                    )}
                    {s.error && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#DC2626",
                          maxWidth: 280,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.error}
                      </span>
                    )}
                  </div>
                  {isExpanded && hasDetails && (
                    <div
                      style={{
                        padding: "12px 16px 16px 44px",
                        borderTop: "1px solid #E7E5E4",
                        backgroundColor: "#FAFAF9",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#A8A29E",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            marginBottom: 6,
                          }}
                        >
                          Input
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            padding: 12,
                            fontSize: 11,
                            fontFamily: "JetBrains Mono, monospace",
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E7E5E4",
                            borderRadius: 6,
                            overflow: "auto",
                            maxHeight: 200,
                            color: "#44403C",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {JSON.stringify(
                            s.input !== undefined ? s.input : "(none)",
                            null,
                            2
                          )}
                        </pre>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#A8A29E",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            marginBottom: 6,
                          }}
                        >
                          Output
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            padding: 12,
                            fontSize: 11,
                            fontFamily: "JetBrains Mono, monospace",
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E7E5E4",
                            borderRadius: 6,
                            overflow: "auto",
                            maxHeight: 200,
                            color: "#44403C",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {JSON.stringify(
                            s.output !== undefined
                              ? s.output
                              : s.result !== undefined
                                ? s.result
                                : s.error
                                  ? { error: s.error }
                                  : "(pending)",
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* M5 Negotiation summary (when pipeline ran successfully) */}
        {steps.find((s) => s.id === "m5" && s.status === "done" && s.result) && (() => {
          const m5 = steps.find((s) => s.id === "m5")?.result as {
            total_liability?: number;
            recommended_settlement_range?: { lower_bound?: number; upper_bound?: number };
            strategy?: { label?: string; posture?: string };
            draft_message?: string;
          } | undefined;
          if (!m5) return null;
          const range = m5.recommended_settlement_range;
          return (
            <section
              style={{
                marginBottom: 32,
                border: "1.5px solid #FDE68A",
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: "#FFFBEB",
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid #FDE68A",
                  backgroundColor: "#FEF3C7",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#92400E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <span>M5 Negotiation Engine</span>
                <Link href="/models/negotiation-engine" className="btn btn-amber btn-sm" style={{ textDecoration: "none" }}>
                  Open Negotiation Engine →
                </Link>
              </div>
              <div style={{ padding: 18 }}>
                {m5.total_liability != null && range && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#A8A29E", letterSpacing: "0.06em", marginBottom: 4 }}>Settlement band</div>
                    <div style={{ fontSize: 13, color: "#44403C" }}>
                      Total liability: ₹{m5.total_liability.toLocaleString("en-IN")}
                      {range.lower_bound != null && range.upper_bound != null && (
                        <> · Recommend: ₹{range.lower_bound.toLocaleString("en-IN")} – ₹{range.upper_bound.toLocaleString("en-IN")}</>
                      )}
                    </div>
                  </div>
                )}
                {m5.strategy?.label && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#A8A29E", letterSpacing: "0.06em", marginBottom: 4 }}>Strategy</div>
                    <div style={{ fontSize: 13, color: "#44403C" }}>{m5.strategy.label} — {m5.strategy.posture}</div>
                  </div>
                )}
                {m5.draft_message && (
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ fontSize: 12, fontWeight: 600, color: "#92400E", cursor: "pointer" }}>View draft message</summary>
                    <pre style={{ margin: "8px 0 0", whiteSpace: "pre-wrap", fontSize: 12, lineHeight: 1.6, color: "#57534E", fontFamily: "var(--font-geist-mono)" }}>
                      {m5.draft_message}
                    </pre>
                  </details>
                )}
              </div>
            </section>
          );
        })()}

        {/* RAG Analysis output */}
        {analysis && (
          <section
            style={{
              border: "1.5px solid #E7E5E4",
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid #E7E5E4",
                backgroundColor: "#F0FDF4",
                fontSize: 13,
                fontWeight: 600,
                color: "#166534",
              }}
            >
              RAG Analysis
            </div>
            <div
              className="prose prose-stone prose-sm max-w-none"
              style={{
                padding: 24,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#44403C",
              }}
            >
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p style={{ margin: "0 0 12px" }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                  ul: ({ children }) => <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: "0 0 12px", paddingLeft: 20 }}>{children}</ol>,
                  li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          </section>
        )}

        {/* Q&A Chat - Ask questions about the analyzed document */}
        {pipelineContext && analysis && (
          <section
            style={{
              marginTop: 32,
              border: "1.5px solid #E7E5E4",
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid #E7E5E4",
                backgroundColor: "#FAFAF9",
                fontSize: 13,
                fontWeight: 600,
                color: "#57534E",
              }}
            >
              Ask about the document
            </div>
            <div style={{ padding: 16 }}>
              <div
                style={{
                  maxHeight: 320,
                  overflowY: "auto",
                  marginBottom: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {chatMessages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      backgroundColor: m.role === "user" ? "#1C1917" : "#F5F5F4",
                      color: m.role === "user" ? "#FFFFFF" : "#44403C",
                      fontSize: 13,
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.content}
                  </div>
                ))}
                {chatLoading && (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      padding: "10px 14px",
                      borderRadius: 10,
                      backgroundColor: "#F5F5F4",
                      fontSize: 13,
                      color: "#78716C",
                    }}
                  >
                    …
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChat()}
                  placeholder="Ask a question about the case or analysis…"
                  disabled={chatLoading}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    fontSize: 13,
                    border: "1px solid #E7E5E4",
                    borderRadius: 8,
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={sendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="btn btn-dark btn-sm"
                  style={{ padding: "10px 18px" }}
                >
                  Send
                </button>
              </div>
              <p style={{ fontSize: 11, color: "#A8A29E", marginTop: 8, marginBottom: 0 }}>
                Context from M1–M4 is retained for this session. Ask follow-up questions.
              </p>
            </div>
          </section>
        )}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}@keyframes wave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}`}</style>
    </div>
  );
}
