import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Engineering & Datasets — SamadhanAI",
  description:
    "Complete dataset documentation for SamadhanAI MSME dispute resolution AI system.",
};

const datasets = [
  {
    id: "msme-legal-dispute-classification-dataset",
    label: "M1 Dataset",
    name: "MSME Legal Dispute Classification Dataset",
    hfPath: "abhinavdread/msme-legal-dispute-classification-dataset",
    description:
      "Labeled corpus of MSME legal dispute narratives classified into six statutory sub-categories: payment delay, contract breach, quality dispute, delivery failure, documentation dispute, and statutory violation.",
    size: "2,155 labeled samples",
    features: ["text (dispute narrative)", "label_name (6 classes)", "label (integer index)"],
    cleaning: [
      "Removed LLM chatty prefix phrases",
      "Stripped markdown formatting artifacts",
      "Removed samples shorter than 50 characters",
      "Verified label distribution for stratification",
    ],
    split: "80% train / 20% test, stratified by label, random_state=42",
    governance: "Real-world MSME dispute narratives scraped from Indian Kanoon, labeled using Gemini 1.5 Pro.",
  },
  {
    id: "msme-document-presence-dataset",
    label: "M2 Dataset",
    name: "MSME Document Presence Dataset",
    hfPath: "abhinavdread/msme-document-presence-dataset",
    description:
      "Multi-label structured dataset for binary document presence classification. Five binary label columns indicating presence of Invoice, Purchase Order, Delivery Challan, GST Certificate, and Contract.",
    size: "5 independent XGBoost models, stratified splits",
    features: ["text (case description)", "invoice_present", "po_present", "delivery_present", "gst_present", "contract_present"],
    cleaning: [
      "Applied clean_llm_text() to remove AI-generated prefixes",
      "Dropped rows with cleaned text length below 10 characters",
      "Binary label balance verified across all five document types",
      "TF-IDF vocabulary capped at 8,000 features",
    ],
    split: "80% train / 20% test per document model, stratified, random_state=42",
    governance: "Real-world MSME case filings from Indian Kanoon, filtered for document-heavy disputes.",
  },
  {
    id: "msme-payment-dispute-dataset",
    label: "M3 Dataset",
    name: "MSME Payment Dispute Dataset",
    hfPath: "abhinavdread/msme-payment-dispute-dataset",
    description:
      "Structured tabular dataset of MSME payment dispute cases with engineered features for outcome prediction. Contains buyer-seller attributes, invoice details, document completeness scores, statutory compliance flags, and binary outcome.",
    size: "Tabular structured records",
    features: ["invoice_amount", "days_overdue", "document_completeness_score", "buyer_category", "prior_disputes", "statutory_interest_applicable", "outcome"],
    cleaning: [
      "Median imputation for missing amounts by buyer-category",
      "One-hot encoded buyer category (5 classes)",
      "Statutory interest flag derived from days_overdue > 45",
      "Removed records with implausible invoice amounts",
    ],
    split: "Standard stratified 80/20 split by outcome label",
    governance: "Structured records derived from real Kanoon filings and statutory interest schedules. DPDP Act compliant.",
  },
  {
    id: "msme-dispute-document-corpus",
    label: "M4 Corpus",
    name: "MSME Dispute Document Corpus",
    hfPath: "abhinavdread/msme-dispute-document-corpus",
    description:
      "Curated legal document corpus for RAG-grounded LLM drafting. Contains MSMED Act statutory text, settlement templates, prior MSME Facilitation Council awards, and legal notice templates.",
    size: "Structured legal corpus",
    features: ["document_type", "content", "section_reference", "relevance_tags"],
    cleaning: [
      "Manually curated statutory sections from MSMED Act, 2006",
      "Normalized settlement template formatting",
      "Chunked documents at paragraph level for retrieval",
      "Indexed with semantic similarity metadata",
    ],
    split: "Single corpus — used for RAG retrieval at inference",
    governance: "Contains only public statutory documents and verified Kanoon legal precedents.",
  },
];

const pipelineSteps = [
  { step: "01", label: "Raw Data Collection", desc: "Scraping MSME case filings from Indian Kanoon matching MSMED Act keywords." },
  { step: "02", label: "Text Cleaning", desc: "LLM prefix removal, length filtering, encoding normalization" },
  { step: "03", label: "Stratified Splitting", desc: "80/20 splits with label stratification, random_state=42" },
  { step: "04", label: "Feature Engineering", desc: "TF-IDF vectorization, tabular feature derivation, label encoding" },
  { step: "05", label: "Imputation", desc: "Median imputation for tabular numeric features by category group" },
  { step: "06", label: "Governance Audit", desc: "No PII, real Kanoon data source, Gemini-based labeling documented" },
];

export default function DatasetsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Page header */}
      <div className="border-b border-[#E5E2DB] bg-white">
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-10">
          <Link href="/" className="text-xs text-[#9C9A95] hover:text-[#1A1915] transition-colors flex items-center gap-1 mb-6">
            ← Back to Home
          </Link>
          <div className="section-label mb-2">Data Engineering</div>
          <h1 className="text-2xl font-bold text-[#1A1915] tracking-tight mb-3">
            Dataset Construction
          </h1>
          <p className="text-sm text-[#6B6860] max-w-2xl leading-relaxed">
            All SamadhanAI datasets are constructed in-house. No external proprietary data,
            no third-party labeling, no black-box augmentation. Fully auditable, DPDP Act compliant.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">

        {/* Principles */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Real-World Foundation", desc: "All datasets constructed from Indian Kanoon case filings and verified statutory texts." },
              { label: "No Third-Party Labeling", desc: "Augmentation and labeling pipelines are fully documented. GPT/Gemini labeling is version-controlled." },
              { label: "Fully Auditable Pipeline", desc: "Every preprocessing step — cleaning, splitting, imputation — is logged and reproducible." },
            ].map((p) => (
              <div key={p.label} className="bg-white border border-[#E5E2DB] rounded-lg p-5">
                <div className="w-4 h-0.5 bg-[#D97706] rounded mb-3" />
                <h3 className="text-sm font-semibold text-[#1A1915] mb-1.5">{p.label}</h3>
                <p className="text-xs text-[#9C9A95] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data Pipeline */}
        <section>
          <div className="text-xs font-semibold text-[#D97706] uppercase tracking-wider mb-4">Data Engineering Pipeline</div>
          <div className="bg-white border border-[#E5E2DB] rounded-lg overflow-hidden">
            {pipelineSteps.map((step, i) => (
              <div
                key={step.step}
                className={`flex items-start gap-5 px-5 py-4 hover:bg-[#FAF9F7] transition-colors ${i < pipelineSteps.length - 1 ? "border-b border-[#E5E2DB]" : ""}`}
              >
                <span className="font-mono text-xs font-semibold text-[#D97706] mt-0.5 shrink-0 w-5">{step.step}</span>
                <div>
                  <div className="text-sm font-medium text-[#1A1915] mb-0.5">{step.label}</div>
                  <div className="text-xs text-[#9C9A95]">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dataset docs */}
        <section>
          <div className="text-xs font-semibold text-[#D97706] uppercase tracking-wider mb-4">Dataset Documentation</div>
          <div className="space-y-5">
            {datasets.map((ds) => (
              <div key={ds.id} className="bg-white border border-[#E5E2DB] rounded-lg overflow-hidden">
                {/* Dataset header */}
                <div className="px-5 py-4 bg-[#F4F2EE] border-b border-[#E5E2DB] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="tag">{ds.label}</span>
                    <h3 className="text-sm font-semibold text-[#1A1915]">{ds.name}</h3>
                  </div>
                  <a
                    href={`https://huggingface.co/datasets/${ds.hfPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-xs shrink-0"
                  >
                    HuggingFace →
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E5E2DB]">
                  {/* Left */}
                  <div className="p-5">
                    <p className="text-xs text-[#6B6860] leading-relaxed mb-4">{ds.description}</p>
                    <div className="text-[10px] font-mono text-[#CCC9C0] mb-1">{ds.size}</div>
                    <div className="text-[10px] font-semibold text-[#9C9A95] uppercase tracking-wider mb-2">Features</div>
                    <div className="flex flex-wrap gap-1.5">
                      {ds.features.map((f) => (
                        <span key={f} className="font-mono text-[10px] px-2 py-0.5 bg-[#F4F2EE] border border-[#E5E2DB] text-[#6B6860] rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="p-5">
                    <div className="text-[10px] font-semibold text-[#9C9A95] uppercase tracking-wider mb-2">Cleaning Methodology</div>
                    <div className="space-y-1.5 mb-4">
                      {ds.cleaning.map((c, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D97706] shrink-0" />
                          <span className="text-xs text-[#6B6860]">{c}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-[#E5E2DB]">
                      <div className="text-[10px] font-semibold text-[#9C9A95] uppercase tracking-wider mb-1">Split Strategy</div>
                      <div className="text-xs text-[#6B6860]">{ds.split}</div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#E5E2DB]">
                      <div className="text-[10px] font-semibold text-[#9C9A95] uppercase tracking-wider mb-1">Data Governance</div>
                      <div className="text-xs text-[#6B6860]">{ds.governance}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-3 pt-4 border-t border-[#E5E2DB]">
          <Link href="/" className="btn-outline text-xs">← Home</Link>
          <Link href="/#models" className="btn-outline text-xs">View Models</Link>
        </div>
      </div>
    </div>
  );
}
