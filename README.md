# SamadhanAI

## Overview

SamadhanAI is an AI-powered Online Dispute Resolution (ODR) Intelligence Platform designed to address delayed payment disputes affecting Micro, Small, and Medium Enterprises (MSMEs) in India. The system automates and streamlines the dispute resolution lifecycle, from case intake and evidence validation to outcome prediction and statutory compliance.

Engineered for reliability and seamless integration, the platform provides a robust, deployable solution for government and enterprise stakeholders. It aligns with the legal frameworks of the MSMED Act, 2006, to ensure that all automated processes are legally sound and enforceable.

## System Architecture

The platform is built on a multi-layered architecture that ensures a clear separation of concerns, scalability, and maintainability.

### Application Layer
The user-facing interface, built with Next.js and React, provides a comprehensive portal for claimants and adjudicators. It facilitates case submission, document upload, and visualization of case analytics and model outputs.

### Intelligence Layer
This is the core of the platform, hosting a suite of machine learning models and deterministic engines. It performs all computational tasks, including dispute classification, document analysis, risk prediction, statutory calculations, and negotiation strategy and drafting.

### Statutory Engine Layer
A deterministic rule-based engine that precisely implements the financial liability clauses of the MSMED Act, 2006. It calculates statutory interest and penalties with full transparency and legal exactitude, providing a clear reasoning trace for all calculations.

### Data Layer
Manages all persistent data, including case files, evidentiary documents, and model artifacts. The system is designed to integrate with secure, scalable databases and object storage solutions, ensuring data integrity and residency.

### External AI Integrations
The platform leverages external, state-of-the-art AI services for specialized tasks. These include:
- **Google Gemini:** For advanced chat and Retrieval-Augmented Generation (RAG) functionalities.
- **Sarvam AI:** For high-accuracy Optical Character Recognition (OCR) and Automated Speech Recognition (ASR).

## Core Intelligence Modules

SamadhanAI integrates five primary intelligence modules (M1-M5) that work in concert to process and analyze disputes.

### M1: Legal Dispute Classifier
- **Purpose:** Automatically categorizes unstructured dispute narratives into predefined legal classes under the MSMED Act.
- **Model Type:** A transformer-based long-context classifier, optimized for detailed dispute narratives up to 4,096 tokens.
- **Business Function:** Triages incoming cases to the correct processing pathway and provides structured data for downstream analytics.
- **Key Performance Indicators:** Achieves 91.2% accuracy and a macro F1-score of 0.898, ensuring reliable classification across all dispute types.

### M2: Document Completeness Engine
- **Purpose:** Verifies the presence of mandatory evidentiary documents (e.g., Invoice, Purchase Order, GST Certificate).
- **Model Type:** An ensemble of high-precision XGBoost classifiers, with one model per document type.
- **Business Function:** Ensures that a case file is complete before proceeding to adjudication, reducing manual checks and administrative burden. Features SHAP-based explainability to identify text features signaling a document's presence.
- **Key Performance Indicators:** Aggregate F1-score of 0.99 with a false negative rate below 1%.

### M3: Payment Outcome Predictor
- **Purpose:** Forecasts the likely outcome of a dispute, predicting a "Win" or "Loss" for the claimant.
- **Model Type:** A LightGBM model with applied probability calibration (Platt Scaling).
- **Business Function:** Provides a calibrated risk assessment to inform negotiation, settlement discussions, and adjudicatory strategy. Probability calibration is applied to ensure legally defensible risk estimates.
- **Key Performance Indicators:** Achieves an Expected Calibration Error (ECE) of 0.021, indicating highly reliable probability scores.

### M4: Legal Rule Engine
- **Purpose:** Calculates the precise statutory interest owed on delayed payments.
- **Model Type:** A deterministic engine implementing Sections 15–22 of the MSMED Act.
- **Business Function:** Guarantees regulatory compliance by programmatically enforcing financial penalties. It generates an exact, auditable calculation of liabilities, removing ambiguity and the risk of human error.
- **Key Performance Indicators:** 100% exact match on all statutory calculations.

### M5: Negotiation Engine
- **Purpose:** Computes deterministic settlement bands, recommends negotiation strategy, and produces formal negotiation messages for claimants or buyers.
- **Model Type:** Hybrid engine combining rule-based settlement bands and strategy logic with a controlled Gemini drafting layer for message generation.
- **Business Function:** Informs settlement discussions by providing a defensible settlement range, posture (e.g., hold firm, accommodate), and escalation risk. The drafting layer produces legally appropriate, formal text for use in correspondence.
- **Key Performance Indicators:** Stateful negotiation state; settlement bands derived from M3 win probability and M4 statutory outputs.

## End-to-End Workflow

A dispute proceeds through a standardized, automated workflow designed for efficiency and legal compliance.

1.  **Case Intake:** A claimant initiates a dispute through the application portal, submitting a narrative and relevant documents.
2.  **Document Processing:** The system uses OCR and ASR to digitize and extract text from all submitted evidence. A PII redaction pipeline sanitizes the data.
3.  **Classification:** The **Dispute Classifier (M1)** analyzes the narrative to assign a statutory classification. The **Document Completeness Engine (M2)** verifies that all required documents are present.
4.  **Risk Prediction:** The **Payment Predictor (M3)** analyzes case features to generate a calibrated probability of the claimant winning the dispute.
5.  **Statutory Calculation:** If a payment delay is established, the **Legal Rule Engine (M4)** computes the exact compound interest due as mandated by the MSMED Act.
6.  **Negotiation:** The **Negotiation Engine (M5)** consumes M3 and M4 outputs to compute settlement bands, recommend strategy, and draft formal negotiation messages. The full pipeline demo runs M1 through M5 and passes all results to the RAG analysis.
7.  **Output:** The system generates a comprehensive case file, including the dispute classification, completeness check, risk assessment, statutory breakdown with reasoning trace, settlement band and strategy (M5), and an integrated RAG analysis.

## Responsible AI & Compliance

The platform is designed with operational safety, fairness, and transparency as core tenets.

- **Explainability:** Model decisions are accompanied by explanations where appropriate. The Document Completeness (M2) and Payment Predictor (M3) models use SHAP plots to provide feature attributions, while the Rule Engine (M4) produces a step-by-step reasoning trace that cites specific sections of the law. The Negotiation Engine (M5) exposes deterministic settlement bands and strategy rationale.
- **Transparency:** All automated calculations performed by the Statutory Engine are fully auditable and traceable to the legal source code.
- **Data Governance:** The architecture is designed to comply with the Digital Personal Data Protection (DPDP) Act and supports data residency requirements, including deployment on national cloud infrastructure (e.g., NIC/MeghRaj).
- **Fairness:** Bias mitigation techniques, such as probability calibration, are employed to ensure that predictions are fair and equitable across different categories of enterprises.

## API Reference

The platform exposes a set of RESTful API endpoints for integration with external systems.

#### Gemini Chat
**POST** `/api/gemini/chat`
- **Payload:** `{ "prompt": "What is the MSMED Act?" }`
- **Response:** `{ "response": "..." }`

#### Gemini RAG
**POST** `/api/gemini/rag`
- **Payload:** `{ "query": "Summarize the dispute.", "context": "..." }`
- **Response:** `{ "response": "..." }`

#### M1: Legal Dispute Classifier
**POST** `/api/models/m1`
- **Payload:** `{ "text": "Buyer defaulted on Invoice..." }`
- **Response:** `{ "label": "payment_delay", "confidence": 0.847, ... }`

#### M2: Document Completeness Engine
**POST** `/api/models/m2`
- **Payload:** `{ "text_document_extract": "This document contains..." }`
- **Response:** `{ "completeness_score": 0.75, "missing_documents": ["contract"], ... }`

#### M3: Payment Outcome Predictor
**POST** `/api/models/m3`
- **Payload:** `{ "features": { "invoice_amount": 250000, ... } }`
- **Response:** `{ "probability_win": 0.72, "prediction": "Win" }`

#### M4: Legal Rule Engine
**POST** `/api/models/m4`
- **Payload:** `{ "invoice_amount": 250000, "days_overdue": 67, ... }`
- **Response:** `{ "statutory_interest_rs": 8945.32, "reasoning_trace": [...] }`

#### M5: Negotiation Engine
**POST** `/api/models/m5-negotiation`
- **Payload:** `{ "invoice_amount": 250000, "days_overdue": 67, "win_probability": 0.74, "statutory_interest": 8945, "document_completeness_score": 0.8, "buyer_category": "Medium", "prior_disputes_count": 0, "current_offer": null, "role": "claimant" }`
- **Response:** `{ "total_liability": 258945, "recommended_settlement_range": { "lower_bound": 200000, "upper_bound": 258945 }, "strategy": { "label": "...", "posture": "...", "escalation_risk": false }, "negotiation_state": { "status": "ongoing", "offer_history": [] }, "draft_message": "..." }`

#### Sarvam ASR & OCR
- **POST** `/api/sarvam/asr`
- **POST** `/api/sarvam/ocr`

## Deployment

The SamadhanAI platform is architected for production deployment and can be hosted in various environments.

- **Vercel:** As a Next.js application, the platform is optimized for serverless deployment on Vercel, which handles API routes, web hosting, and static asset delivery. The `vercel.json` file contains pre-configured settings.
- **Docker:** A `Dockerfile` is provided to build a production-ready container image of the application. This allows for deployment to any container orchestration platform (e.g., Kubernetes) or cloud provider.
- **Local Setup:** For development and testing, the application can be run locally using Node.js. Clone the repository, install dependencies via `npm install`, and run the development server with `npm run dev`. An environment file (`.env.local`) is required to store API keys and other configuration secrets.
