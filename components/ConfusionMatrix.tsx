/* ConfusionMatrix.tsx — coded div-based confusion matrix diagram (no images) */
"use client";

type CM = {
  labels: string[];
  matrix: number[][]; // matrix[actual][predicted]
};

function getColor(value: number, max: number, isCorrect: boolean): string {
  const intensity = value / max;
  if (isCorrect) {
    const g = Math.round(180 + intensity * 75);
    const r = Math.round(220 - intensity * 80);
    return `rgb(${r}, ${g}, ${Math.round(200 - intensity * 80)})`;
  } else {
    if (intensity === 0) return "#FAFAFA";
    const r = Math.round(230 + intensity * 25);
    const g = Math.round(240 - intensity * 120);
    const b = Math.round(240 - intensity * 130);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export function ConfusionMatrix({ data, title }: { data: CM; title?: string }) {
  const n = data.labels.length;
  const max = Math.max(...data.matrix.flat().filter(v => v > 0));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {title && (
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1C1917", marginBottom: 18, letterSpacing: "-0.02em" }}>{title}</div>
      )}
      <div style={{ display: "inline-block" }}>
        {/* Predicted label header */}
        <div style={{ display: "flex", marginLeft: 120 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#A8A29E", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
            Predicted
          </div>
        </div>
        <div style={{ display: "flex" }}>
          {/* Actual label — rotated via stacked column */}
          <div style={{ width: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{
              writingMode: "vertical-rl", transform: "rotate(180deg)",
              fontSize: 12, fontWeight: 700, color: "#A8A29E", letterSpacing: "0.07em", textTransform: "uppercase",
            }}>
              Actual
            </div>
          </div>

          <div>
            {/* Column labels */}
            <div style={{ display: "flex", marginLeft: 96 }}>
              {data.labels.map(l => (
                <div key={l} style={{
                  width: 72, flexShrink: 0, fontSize: 11.5, color: "#57534E",
                  fontFamily: "var(--font-geist-mono)", textAlign: "center",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  padding: "2px 2px 8px", transform: "rotate(-35deg)", transformOrigin: "bottom left",
                  height: 56, display: "flex", alignItems: "flex-end", fontWeight: 500,
                }}>
                  {l.replace(/_/g, " ")}
                </div>
              ))}
            </div>

            {/* Rows */}
            {data.matrix.map((row, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                {/* Row label */}
                <div style={{
                  width: 96, flexShrink: 0, fontSize: 11.5, color: "#57534E",
                  fontFamily: "var(--font-geist-mono)", textAlign: "right",
                  paddingRight: 12, overflow: "hidden", textOverflow: "ellipsis",
                  whiteSpace: "nowrap", fontWeight: 500,
                }}>
                  {data.labels[i].replace(/_/g, " ")}
                </div>
                {/* Cells */}
                {row.map((val, j) => {
                  const isDiag = i === j;
                  const bg = getColor(val, max, isDiag);
                  const textColor = isDiag && val > max * 0.3 ? "#FFFFFF" : val > max * 0.4 ? "#FFFFFF" : "#1C1917";
                  return (
                    <div key={j} style={{
                      width: 72, height: 56, flexShrink: 0,
                      backgroundColor: bg,
                      border: "1px solid rgba(255,255,255,0.8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: isDiag ? 700 : 500,
                      color: textColor,
                      fontFamily: "var(--font-geist-mono)",
                      borderRadius: 3,
                      transition: "all 0.1s",
                    }}>
                      {val > 0 ? val : ""}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: "rgb(140, 220, 160)" }} />
            <span style={{ fontSize: 13, color: "#78716C" }}>Correct (diagonal)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: "rgb(230, 120, 110)" }} />
            <span style={{ fontSize: 13, color: "#78716C" }}>Misclassification</span>
          </div>
          <div style={{ fontSize: 13, color: "#A8A29E" }}>Darker = more predictions</div>
        </div>
      </div>
    </div>
  );
}
