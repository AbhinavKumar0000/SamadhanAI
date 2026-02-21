"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────
type NodeType = "input" | "processing" | "inhouse" | "orchestrator" | "output";

interface PNode {
  id: string;
  label: string;
  sub?: string;
  tag?: string;
  x: number; y: number;
  w: number; h: number;
  type: NodeType;
  href?: string;
}

interface PEdge {
  from: string;
  to: string;
  label?: string;
}

// ─── Palette (light mode, claude-inspired) ───────────────────────────────
const PALETTE: Record<NodeType, { bg: string; border: string; text: string; subText: string; tagBg: string; tagText: string }> = {
  input: { bg: "#FFFFFF", border: "#D6D3CB", text: "#1A1915", subText: "#9C9A95", tagBg: "#F4F2EE", tagText: "#6B6860" },
  processing: { bg: "#FAFAF8", border: "#D6D3CB", text: "#2D2C28", subText: "#9C9A95", tagBg: "#F4F2EE", tagText: "#6B6860" },
  inhouse: { bg: "#FFFBEB", border: "#D97706", text: "#92400E", subText: "#B45309", tagBg: "#FEF3C7", tagText: "#92400E" },
  orchestrator: { bg: "#F4F2EE", border: "#CCC9C0", text: "#1A1915", subText: "#6B6860", tagBg: "#EFEDE9", tagText: "#6B6860" },
  output: { bg: "#F0FDF4", border: "#059669", text: "#065F46", subText: "#059669", tagBg: "#D1FAE5", tagText: "#065F46" },
};

// ─── Layout ──────────────────────────────────────────────────────────────
const NODES: PNode[] = [
  // Row 0 – User Input
  { id: "text", label: "Text Input", x: 60, y: 30, w: 120, h: 44, type: "input" },
  { id: "voice", label: "Voice Input", x: 210, y: 30, w: 120, h: 44, type: "input" },
  { id: "docs", label: "Upload Docs", sub: "Invoice / PO", x: 360, y: 30, w: 130, h: 44, type: "input" },

  // Row 1 – Processing
  { id: "asr", label: "ASR Engine", sub: "SarvamAI", x: 80, y: 140, w: 140, h: 52, type: "processing" },
  { id: "ocr", label: "OCR Engine", sub: "SarvamAI", x: 280, y: 140, w: 140, h: 52, type: "processing" },

  // Row 2 – In-house AI
  { id: "m1", label: "Dispute Classifier", sub: "Longformer", tag: "M1", x: 20, y: 270, w: 170, h: 60, type: "inhouse", href: "/models/dispute-classifier" },
  { id: "m2", label: "Doc Completeness", sub: "XGBoost + SHAP", tag: "M2", x: 210, y: 270, w: 170, h: 60, type: "inhouse", href: "/models/document-completeness" },
  { id: "m4", label: "Legal Rule Engine", sub: "Deterministic", tag: "M4", x: 500, y: 270, w: 165, h: 60, type: "inhouse", href: "/models/rule-engine" },

  // Row 2b – Orchestrator
  { id: "orch", label: "Orchestrator", sub: "Route + Aggregate", x: 395, y: 140, w: 155, h: 52, type: "orchestrator" },

  // Row 3 – Outcome
  { id: "m3", label: "Payment Predictor", sub: "LightGBM + Platt", tag: "M3", x: 210, y: 395, w: 170, h: 60, type: "inhouse", href: "/models/payment-predictor" },
  { id: "shap", label: "Explainability", sub: "SHAP + Trace", x: 430, y: 395, w: 150, h: 60, type: "orchestrator" },

  // Row 4 – Output
  { id: "o1", label: "Settlement Draft", x: 30, y: 530, w: 145, h: 46, type: "output" },
  { id: "o2", label: "Win Probability", x: 195, y: 530, w: 145, h: 46, type: "output" },
  { id: "o3", label: "Legal Trace", x: 360, y: 530, w: 130, h: 46, type: "output" },
  { id: "o4", label: "Negotiation Guide", x: 505, y: 530, w: 145, h: 46, type: "output" },
];

const EDGES: PEdge[] = [
  { from: "text", to: "asr" },
  { from: "voice", to: "asr" },
  { from: "docs", to: "ocr" },
  { from: "asr", to: "m1" },
  { from: "asr", to: "m2" },
  { from: "ocr", to: "m2" },
  { from: "m1", to: "orch" },
  { from: "m2", to: "orch" },
  { from: "orch", to: "m3" },
  { from: "orch", to: "m4" },
  { from: "m3", to: "shap" },
  { from: "m4", to: "shap" },
  { from: "shap", to: "o1" },
  { from: "shap", to: "o2" },
  { from: "shap", to: "o3" },
  { from: "shap", to: "o4" },
];

function getNode(id: string) { return NODES.find(n => n.id === id)!; }
function center(n: PNode) { return { x: n.x + n.w / 2, y: n.y + n.h / 2 }; }

function edgePath(a: PNode, b: PNode): string {
  const from = { x: center(a).x, y: a.y + a.h };
  const to = { x: center(b).x, y: b.y };
  const cy = (from.y + to.y) / 2;
  return `M${from.x},${from.y} C${from.x},${cy} ${to.x},${cy} ${to.x},${to.y}`;
}

// ─── Component ────────────────────────────────────────────────────────────
export default function PipelineDiagram() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      setTick((ts - startRef.current) * 0.025);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const dashOffset = -(tick % 24);

  const SVG_W = 690;
  const SVG_H = 620;

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[#E5E2DB] bg-[#FAF9F7]">
      <div className="px-5 py-4 border-b border-[#E5E2DB] flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-[#D97706] uppercase tracking-wider mb-0.5">Low-Level Pipeline</div>
          <div className="text-xs text-[#9C9A95]">Click any amber node to open its model page</div>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[#9C9A95]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-[#FFFBEB] border border-[#D97706]" />
            In-House AI — clickable
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-[#F0FDF4] border border-[#059669]" />
            Output
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        aria-label="SamadhanAI pipeline diagram"
      >
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0.5 L5.5,3 L0,5.5 Z" fill="#CCC9C0" />
          </marker>
          <marker id="arr-gold" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0.5 L5.5,3 L0,5.5 Z" fill="#D97706" />
          </marker>
          <marker id="arr-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0.5 L5.5,3 L0,5.5 Z" fill="#059669" />
          </marker>
          <filter id="node-shadow" x="-10%" y="-10%" width="120%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1A1915" floodOpacity="0.07" />
          </filter>
          <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#D97706" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Section row labels */}
        {[
          { label: "USER INPUT", y: 14 },
          { label: "INPUT PROCESSING", y: 124 },
          { label: "AI ANALYSIS", y: 254 },
          { label: "OUTCOME ENGINE", y: 378 },
          { label: "FINAL OUTPUT", y: 514 },
        ].map(s => (
          <text key={s.label} x={12} y={s.y} fontSize="8" fill="#CCC9C0" fontWeight="600" letterSpacing="1.5" fontFamily="Inter, system-ui">
            {s.label}
          </text>
        ))}

        {/* ── Edges ── */}
        {EDGES.map(e => {
          const a = getNode(e.from), b = getNode(e.to);
          const d = edgePath(a, b);
          const isGold = b.type === "inhouse" || a.type === "inhouse";
          const isGreen = b.type === "output";
          const isHov = hovered === e.from || hovered === e.to;
          const stroke = isGreen ? "#059669" : isGold ? "#D97706" : "#CCC9C0";
          const marker = isGreen ? "url(#arr-green)" : isGold ? "url(#arr-gold)" : "url(#arr)";
          return (
            <g key={`${e.from}-${e.to}`}>
              <path d={d} fill="none" stroke={stroke} strokeWidth={0.5} strokeOpacity={0.25} />
              <path
                d={d} fill="none"
                stroke={stroke}
                strokeWidth={isHov ? 1.5 : 1}
                strokeOpacity={isHov ? 0.9 : 0.4}
                strokeDasharray="7 5"
                strokeDashoffset={dashOffset}
                markerEnd={marker}
                style={{ transition: "stroke-width 0.2s, stroke-opacity 0.2s" }}
              />
            </g>
          );
        })}

        {/* ── Nodes ── */}
        {NODES.map(node => {
          const p = PALETTE[node.type];
          const isHov = hovered === node.id;
          const isClickable = !!node.href;
          const filter = isHov && isClickable ? "url(#glow-amber)" : isHov ? "url(#node-shadow)" : undefined;

          return (
            <g
              key={node.id}
              style={{ cursor: isClickable ? "pointer" : "default" }}
              filter={filter}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => { if (node.href) router.push(node.href); }}
            >
              <rect
                x={node.x} y={node.y} width={node.w} height={node.h}
                rx={6}
                fill={p.bg}
                stroke={isHov && isClickable ? "#D97706" : p.border}
                strokeWidth={isHov && isClickable ? 1.5 : 1}
                style={{ transition: "stroke 0.15s, stroke-width 0.15s" }}
              />

              {/* Tag badge */}
              {node.tag && (
                <g>
                  <rect x={node.x + 7} y={node.y + 7} width={22} height={13} rx={3} fill={p.tagBg} />
                  <text x={node.x + 18} y={node.y + 17.5} textAnchor="middle" fontSize="7" fontWeight="700"
                    fill={p.tagText} fontFamily="monospace" letterSpacing="0.5">{node.tag}</text>
                </g>
              )}

              {/* Main label */}
              <text
                x={node.tag ? node.x + node.w / 2 + 6 : node.x + node.w / 2}
                y={node.sub ? node.y + node.h / 2 - 5 : node.y + node.h / 2 + 4}
                textAnchor="middle" fontSize="9.5" fontWeight={node.type === "inhouse" ? "600" : "500"}
                fill={isHov ? (isClickable ? "#92400E" : "#1A1915") : p.text}
                fontFamily="Inter, system-ui"
                style={{ transition: "fill 0.15s" }}
              >
                {node.label}
              </text>

              {/* Sub label */}
              {node.sub && (
                <text
                  x={node.x + node.w / 2} y={node.y + node.h / 2 + 11}
                  textAnchor="middle" fontSize="7.5" fill={p.subText} fontFamily="Inter, system-ui"
                >
                  {node.sub}
                </text>
              )}

              {/* Arrow indicator for clickable */}
              {isClickable && isHov && (
                <text x={node.x + node.w - 10} y={node.y + 13} fontSize="9" fill="#D97706" fontFamily="Arial">→</text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      <div className="px-5 py-3 border-t border-[#E5E2DB] h-9 flex items-center">
        {hovered && NODES.find(n => n.id === hovered && n.href) ? (
          <span className="text-xs text-[#D97706] font-medium">
            Click to open model page →
          </span>
        ) : (
          <span className="text-[10px] text-[#CCC9C0] font-mono">
            Animated data flow · In-house models built &amp; trained indigenously
          </span>
        )}
      </div>
    </div>
  );
}
