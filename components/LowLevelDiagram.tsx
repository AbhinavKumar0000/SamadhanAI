"use client";
import { useRouter } from "next/navigation";

// ── SarvamAI inline logo ─────────────────────────────────────────────────────
function SarvamLogo({ size = 13 }: { size?: number }) {
  return (
    <span style={{
      fontSize: size,
      fontWeight: 700,
      color: "#4C1D95",
      fontFamily: "var(--font-geist-mono, monospace)"
    }}>
      sarvamai
    </span>
  );
}

// ── Down arrow between rows ───────────────────────────────────────────────────
function DownArrow({ short = false }: { short?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: short ? "5px 0" : "10px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 1.5, height: short ? 10 : 18, backgroundColor: "#C7C4BF" }} />
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1L6 7L11 1" stroke="#C7C4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

// ── Section pill label ────────────────────────────────────────────────────────
function SectionLabel({
  text, color = "#44403C", bg = "#F5F5F4", border = "#E7E5E4"
}: { text: string; color?: string; bg?: string; border?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, marginTop: 2 }}>
      <div style={{
        fontSize: 10, fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase",
        color, backgroundColor: bg, border: `1px solid ${border}`,
        borderRadius: 9999, padding: "4px 14px",
      }}>{text}</div>
    </div>
  );
}

// ── Box variants ──────────────────────────────────────────────────────────────
function InputBox({ label, icon }: { label: string; icon: string }) {
  return (
    <div style={{
      border: "1.5px solid #D6D3D1", borderRadius: 8, backgroundColor: "#FAFAF9",
      padding: "10px 16px", textAlign: "center", minWidth: 110, flex: 1,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#1C1917" }}>{label}</div>
    </div>
  );
}

function SarvamBox({ label, sub }: { label: string; sub: string }) {
  return (
    <div style={{
      border: "1.5px solid #C4B5FD", borderRadius: 8, backgroundColor: "#F5F3FF",
      padding: "10px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start",
    }}>
      <SarvamLogo size={13} />
      <div style={{ fontSize: 12, fontWeight: 700, color: "#4C1D95" }}>{label}</div>
      <div style={{ fontSize: 10.5, color: "#7C3AED", lineHeight: 1.4 }}>{sub}</div>
    </div>
  );
}

function ModelBox({
  tag, label, sub, router, route, fullWidth = false
}: {
  tag: string; label: string; sub: string;
  router: ReturnType<typeof useRouter>; route: string; fullWidth?: boolean;
}) {
  return (
    <button
      onClick={() => router.push(route)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 9,
        width: fullWidth ? "100%" : undefined,
        flex: fullWidth ? undefined : 1,
        minWidth: 180,
        padding: "9px 12px", borderRadius: 8, cursor: "pointer",
        border: "1.5px solid #FDE68A", backgroundColor: "#FFFBEB",
        textAlign: "left", transition: "background-color 0.12s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#FEF3C7"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#FFFBEB"; }}
    >
      <span style={{
        fontSize: 9.5, fontWeight: 800, color: "#92400E",
        backgroundColor: "#FDE68A", borderRadius: 4, padding: "2px 5px",
        fontFamily: "var(--font-geist-mono, monospace)", flexShrink: 0, marginTop: 1,
      }}>{tag}</span>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#78350F", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 10.5, color: "#B45309", lineHeight: 1.4 }}>{sub}</div>
      </div>
    </button>
  );
}

function NeutralBox({
  label, sub, fullWidth = false, tint = "#F5F5F4", border = "#D6D3D1", textColor = "#44403C"
}: {
  label: string; sub: string; fullWidth?: boolean;
  tint?: string; border?: string; textColor?: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 9,
      width: fullWidth ? "100%" : undefined,
      flex: fullWidth ? undefined : 1,
      padding: "9px 12px", borderRadius: 8,
      border: `1px solid ${border}`, backgroundColor: tint,
    }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: textColor, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 10.5, color: textColor, opacity: 0.75, lineHeight: 1.4 }}>{sub}</div>
      </div>
    </div>
  );
}

function OutputBox({ label, sub }: { label: string; sub: string }) {
  return (
    <div style={{
      border: "1.5px solid #86EFAC", borderRadius: 8, backgroundColor: "#F0FDF4",
      padding: "10px 12px", flex: 1, minWidth: 120, textAlign: "center",
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 10, color: "#15803D", lineHeight: 1.4 }}>{sub}</div>
    </div>
  );
}

function LegendItem({ color, border, text }: { color: string; border: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: color, border: `1.5px solid ${border}` }} />
      <span style={{ fontSize: 11, color: "#78716C" }}>{text}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LowLevelDiagram() {
  const router = useRouter();

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ minWidth: 720, maxWidth: 960, margin: "0 auto", padding: "8px 4px" }}>

        {/* ROW 1: USER INPUT */}
        <SectionLabel text="User Input" />
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <InputBox label="Text Input" icon="✎" />
          <InputBox label="Voice / Audio" icon="♪" />
          <InputBox label="Upload Documents" icon="⊞" />
        </div>

        <DownArrow />

        {/* ROW 2: INPUT PROCESSING — SarvamAI */}
        <SectionLabel text="Input Processing (SarvamAI)" color="#4C1D95" bg="#F5F3FF" border="#C4B5FD" />
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <SarvamBox label="ASR Model" sub="Speech to text, language detection, Indian language support" />
          <SarvamBox label="OCR Engine" sub="Document OCR, Invoice / PO / Image text extraction" />
        </div>

        <DownArrow />

        {/* ROW 3: LEGAL INTELLIGENCE */}
        <SectionLabel text="Legal Intelligence Layer" color="#92400E" bg="#FFFBEB" border="#FDE68A" />
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <ModelBox tag="M1" label="Dispute Classifier" sub="Category prediction · MSMD Act §5" router={router} route="/models/dispute-classifier" />
          <ModelBox tag="M2" label="Document Completeness" sub="Missing doc detection · Completeness score" router={router} route="/models/document-completeness" />
        </div>

        <DownArrow />

        {/* ROW 4: TWO PARALLEL ENGINES */}
        <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>

          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <SectionLabel text="Outcome Engine" color="#166534" bg="#F0FDF4" border="#BBF7D0" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <ModelBox tag="M3" label="Outcome Predictor" sub="Win probability · Platt-calibrated" router={router} route="/models/payment-predictor" fullWidth />
              <ModelBox tag="M4" label="Legal Rule Engine" sub="Section 16 interest · MSMED Act rules" router={router} route="/models/rule-engine" fullWidth />
              <NeutralBox label="SHAP Explainability" sub="Feature attribution · Audit trace" fullWidth />
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <SectionLabel text="Negotiation Engine" color="#92400E" bg="#FFFBEB" border="#FDE68A" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <ModelBox tag="M5" label="Negotiation Engine" sub="Settlement bands · Strategy · Gemini drafting" router={router} route="/models/negotiation-engine" fullWidth />
              <NeutralBox label="Sentiment and Tone" sub="Detect negotiation stance" fullWidth tint="#FFFBEB" border="#FDE68A" textColor="#92400E" />
              <NeutralBox label="Negotiation Playbook" sub="Timeline and bond recommendations" fullWidth tint="#FFFBEB" border="#FDE68A" textColor="#92400E" />
            </div>
          </div>

        </div>

        <DownArrow />

        {/* ROW 5: LLM DRAFTING */}
        <SectionLabel text="LLM Drafting Service" color="#6B21A8" bg="#FAF5FF" border="#E9D5FF" />
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 8 }}>
          <NeutralBox label="MSMED Act 2006" sub="Statutory provisions" tint="#FAF5FF" border="#E9D5FF" textColor="#581C87" />
          <NeutralBox label="Settlement Templates" sub="Precedent formats" tint="#FAF5FF" border="#E9D5FF" textColor="#581C87" />
          <NeutralBox label="Prior Awards" sub="Facilitation council orders" tint="#FAF5FF" border="#E9D5FF" textColor="#581C87" />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}><DownArrow short /></div>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <NeutralBox label="RAG Pipeline" sub="Retrieve, Rank, Context window" tint="#FAF5FF" border="#E9D5FF" textColor="#581C87" />
          <NeutralBox label="LLM Generator" sub="Draft generation, language model" tint="#FAF5FF" border="#E9D5FF" textColor="#581C87" />
        </div>

        <DownArrow />

        {/* ROW 6: OUTPUT */}
        <SectionLabel text="Final Output" color="#166534" bg="#F0FDF4" border="#86EFAC" />
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <OutputBox label="Settlement Draft" sub="Legally compliant document" />
          <OutputBox label="Win Probability" sub="Dashboard and SHAP trace" />
          <OutputBox label="Legal Explanation" sub="Section-by-section reasoning" />
          <OutputBox label="Negotiation Report" sub="Strategy and timeline" />
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginTop: 18, paddingTop: 14, borderTop: "1px solid #F0EFED", justifyContent: "flex-end" }}>
          <LegendItem color="#FFFBEB" border="#FDE68A" text="In-house AI model (clickable)" />
          <LegendItem color="#F5F3FF" border="#C4B5FD" text="SarvamAI service" />
          <LegendItem color="#F5F5F4" border="#D6D3D1" text="Processing module" />
          <LegendItem color="#F0FDF4" border="#86EFAC" text="Final output" />
        </div>

      </div>
    </div>
  );
}
