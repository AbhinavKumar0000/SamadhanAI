import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SamadhanAI",
  description:
    "A fully in-house, Make in India AI system for MSME dispute classification, statutory computation, document validation, and outcome prediction under the MSMED Act, 2006.",
  keywords: ["SamadhanAI", "MSME", "dispute resolution", "AI", "MSMED Act", "Make in India"],
  openGraph: {
    title: "SamadhanAI — AI-Enabled Dispute Intelligence for MSMEs",
    description: "Fully in-house AI pipeline for MSME dispute resolution under the MSMED Act, 2006.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased bg-white text-[#1A1915]">
        <Navigation />
        <main>{children}</main>
        <footer style={{ borderTop: "1px solid #E5E2DB", backgroundColor: "#FAFAF9" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: "#D97706" }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1915", letterSpacing: "-0.02em" }}>SamadhanAI</span>
                </div>
                <p style={{ fontSize: 13, color: "#78716C", lineHeight: 1.65, maxWidth: 320, margin: 0 }}>
                  AI-Enabled Virtual Negotiation and Dispute Intelligence for MSMEs.
                  Designed and engineered in India under the MSMED Act, 2006.
                </p>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#A8A29E", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-geist-mono)", marginBottom: 12 }}>Models</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["Dispute Classifier", "/models/dispute-classifier"], ["Document Completeness", "/models/document-completeness"], ["Payment Predictor", "/models/payment-predictor"], ["Rule Engine", "/models/rule-engine"]].map(([l, h]) => (
                    <Link key={l} href={h} style={{ fontSize: 13, color: "#78716C", textDecoration: "none" }}>{l}</Link>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#A8A29E", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-geist-mono)", marginBottom: 12 }}>Resources</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["Datasets", "/datasets"], ["HuggingFace", "https://huggingface.co/abhinavdread"], ["API Reference", "/#api"], ["Architecture", "/#architecture"]].map(([l, h]) => (
                    <a key={l} href={h} target={h.startsWith("http") ? "_blank" : undefined} rel={h.startsWith("http") ? "noopener noreferrer" : undefined}
                      style={{ fontSize: 13, color: "#78716C", textDecoration: "none" }}>{l}</a>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ paddingTop: 24, borderTop: "1px solid #E5E2DB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 12, color: "#A8A29E", margin: 0, fontFamily: "var(--font-geist-mono)" }}>Designed and engineered in India</p>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 14, height: 3, borderRadius: 1, backgroundColor: "#FF9933", opacity: 0.7 }} />
                <div style={{ width: 14, height: 3, borderRadius: 1, backgroundColor: "#E5E2DB" }} />
                <div style={{ width: 14, height: 3, borderRadius: 1, backgroundColor: "#138808", opacity: 0.6 }} />
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
