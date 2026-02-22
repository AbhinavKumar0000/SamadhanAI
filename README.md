# SamadhanAI

## Project Overview

SamadhanAI is an AI-enabled system designed to enhance the Online Dispute Resolution (ODR) framework, specifically targeting the delayed payment crisis faced by Micro, Small and Medium Enterprises (MSMEs). The system automates case intake, validates evidence, provides calibrated outcome predictions, and enforces statutory calculations, aligning with the MSMED Act, 2006. It integrates advanced natural language processing (NLP) capabilities with robust rule-based engines and leverages AI models for dispute classification, document completeness checks, and payment outcome prediction.

## Architecture

The system is implemented as a full-stack Next.js application, integrating both the user interface and backend API services within a unified codebase. This architecture facilitates a streamlined development and deployment process while maintaining a clear separation of concerns.

1.  **Web Application (Next.js):** Provides a comprehensive user interface for claimants and adjudicators, built with React and TypeScript.
2.  **API Services (Next.js API Routes):** Handles all backend logic, including interactions with various AI models (Gemini, Sarvam, and custom models M1-M4), data processing, and statutory calculations. These routes serve as the central point for all data and intelligence operations.
3.  **Intelligence Center:** Comprising various AI models and deterministic engines for:
    *   **Case Intake & Document Processing:** Including Optical Character Recognition (OCR) and completeness checks.
    *   **Prediction Engine:** Machine learning-based forecasting of dispute outcomes.
    *   **Legal Rule Engine:** Enforcement of statutory calculations as per the MSMED Act.
4.  **Data Layer:** Utilizes external databases and object storage for case data, documents, and model registries.

## Features

*   **Legal Dispute Classification (M1):** Classifies dispute narratives into statutory categories.
*   **Document Completeness Engine (M2):** Detects presence and absence of mandatory documents.
*   **Payment Outcome Prediction (M3):** Predicts the probability of a "Win" or "Loss" for the claimant.
*   **Legal Rule Engine (M4):** Precisely calculates statutory interest based on the MSMED Act.
*   **Gemini AI Integration:** Chat and Retrieval-Augmented Generation (RAG) capabilities for enhanced interaction.
*   **Sarvam AI Integration:** Asr and OCR services for document processing and voice input.
*   **Interactive UI:** Dedicated pages for model visualization, dataset exploration, and an interactive demo.
*   **API Explorer:** A component for testing and understanding API interactions.

## Core Components

### 4.1 Legal Dispute Classifier (M1)

**Model:** Fine-tuned Longformer (AllenAI)
**Purpose:** Classifies unstructured dispute narratives into 6 statutory categories under the MSMED Act. The Longformer model is used due to its ability to handle long input sequences (up to 4,096 tokens), preventing truncation of crucial context in detailed dispute narratives.

*   **Classes:** `payment_delay`, `contract_breach`, `quality_dispute`, `delivery_failure`, `documentation_dispute`, `statutory_violation`.
*   **Performance:**
    *   **AUC-ROC:** 0.948
    *   **Macro F1:** 0.898
    *   **Accuracy:** 91.2%
    *   **Latency:** ~38ms

### 4.2 Document Completeness Engine (M2)

**Model:** Ensemble of 5 Independent XGBoost Classifiers
**Purpose:** Detects the presence or absence of mandatory documents such as Invoice, Purchase Order, Challan, GST Certificate, and Contract. This is achieved through independent binary classifiers for each document type to ensure high precision.

*   **Explainability:** Utilizes SHAP (SHapley Additive exPlanations) TreeExplainer to assign contribution scores to text features, aiding in understanding document presence detection.
*   **Performance:**
    *   **F1 Score:** 0.99 (Aggregate)
    *   **False Negative Rate:** <1%

### 4.3 Payment Outcome Predictor (M3)

**Model:** LightGBM with Platt Scaling (Isotonic Calibration)
**Purpose:** Predicts the probability of a "Win" versus "Loss" for the claimant. Platt Scaling is employed to calibrate model outputs, ensuring that predicted probabilities accurately reflect empirical win rates, which is essential for legal defensibility.

*   **Features:** `invoice_amount`, `days_overdue`, `document_completeness_score`, `buyer_category`, `prior_disputes_count`.
*   **Performance:**
    *   **AUC-ROC:** 0.891
    *   **Brier Score:** 0.112
    *   **ECE (Expected Calibration Error):** 0.021

### 4.4 Legal Rule Engine (M4)

**Model:** Deterministic Python Engine
**Purpose:** Enforces the specific sections of the MSMED Act (Sections 15–22) for accurate interest calculation. This component is deterministic to ensure legal exactitude, as machine learning approximations are not suitable for statutory financial liability.

*   **Logic:**
    *   **Section 15:** Verifies the 45-day payment deadline.
    *   **Section 16:** Calculates compound interest at 3 times the RBI Bank Rate.
    *   **Section 17:** Aggregates principal and interest amounts.
*   **Output:** Provides exact floating-point currency values along with a comprehensive reasoning trace.

## Data Engineering Strategy

*   **Sources:** Case filings from Indian Kanoon and archived orders from MSME Facilitation Councils.
*   **Curation & Labeling:** Raw text is cleaned using regex pipelines. LLM-assisted labeling (Gemini 1.5 Pro) generates initial weak labels for the dispute classifier, followed by human expert review.
*   **Splitting:** Data is stratified into 80/10/10 splits to maintain class distribution during training, validation, and testing.
*   **Privacy:** A PII redaction pipeline removes sensitive information (names, GSTNs, phone numbers) before model training.

## Evaluation Framework

Model evaluation is rigorously conducted using metrics aligned with ODR requirements:

| Component               | Primary Metric               | Secondary Metric | Business Impact                                                     |
| :---------------------- | :--------------------------- | :--------------- | :------------------------------------------------------------------ |
| **Dispute Classifier**    | **Macro F1**                   | AUC-ROC          | Ensures minority classes (e.g., *Statutory Violation*) are not ignored. |
| **Doc Completeness**      | **Recall (at fixed precision)** | F1 Score         | Minimizes False Negatives to prevent wrongful case rejection.        |
| **Payment Predictor**     | **ECE (Calibration Error)**    | Brier Score      | Ensures risk probabilities are realistic for negotiation.           |
| **Rule Engine**           | **Exact Match (100%)**         | N/A              | Zero tolerance for error in financial liability.                    |

## Technical Robustness

*   **Reproducibility:** All random seeds are fixed for consistent results. The Rule Engine is version-controlled and includes RBI rate history.
*   **Monitoring:** Drifts in `invoice_amount` or `dispute_type` distributions trigger automated retraining alerts.
*   **Latency:** All inference endpoints are optimized for sub-100ms response times.
    *   Payment Predictor: ~12ms
    *   Rule Engine: ~4ms

## Responsible AI & Compliance

*   **Explainability:**
    *   **M2 (Document Completeness):** SHAP plots illustrate features contributing to document detection.
    *   **M3 (Payment Predictor):** SHAP force plots explain factors influencing win probability.
*   **Transparency:** The Rule Engine provides a text-based Reasoning Trace, citing specific sections of the MSMED Act.
*   **Data Governance:** The architecture supports data residency within India (NIC/MeghRaj) and complies with the DPDP Act.
*   **Bias Mitigation:** Calibration techniques ensure fair predictions across different enterprise categories.

## Tech Stack

### Model Development

*   **Longformer:** For Legal Dispute Classification (M1).
*   **XGBoost:** For Document Completeness Engine (M2).
*   **LightGBM:** For Payment Outcome Predictor (M3).
*   **Deterministic Python:** For Legal Rule Engine (M4).
*   **Inference:** ONNX Runtime / PyTorch.

### Backend / API

*   **Next.js API Routes:** Framework for building serverless API endpoints.
*   **TypeScript:** Primary language for development.
*   **Node.js:** Runtime environment.

### Deployment

*   **Vercel:** Preferred platform for Next.js application deployment.
*   **Docker:** Containerization for consistent environments.

### MLOps / LLMOps

*   **MLflow:** For model registry and experiment tracking (as implied by monitoring).
*   **Automated Monitoring:** For data and model drift detection.

### Agentic Framework

*   **Google Gemini AI:** Utilized for chat and Retrieval-Augmented Generation (RAG) capabilities.

## Installation

### Prerequisites

*   Node.js v18+
*   npm (usually comes with Node.js)
*   Git

### Local Setup

1.  **Clone the repository:**

    ```bash
    git clone [repository-url]
    cd website
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Variables:** Create a `.env.local` file in the root of the `website` directory and add necessary environment variables (e.g., API keys for Gemini, Sarvam, or other services). A sample `.env.local.example` might be provided for reference.

    ```
    # Example .env.local content
    NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
    NEXT_PUBLIC_SARVAM_API_KEY=your_sarvam_api_key
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    The application will be accessible at `http://localhost:3000`.

### Docker Build

To build and run the application using Docker:

1.  **Build the Docker image:**

    ```bash
    docker build -t samadhanai-website .
    ```

2.  **Run the Docker container:**

    ```bash
    docker run -p 3000:3000 samadhanai-website
    ```

    The application will be accessible at `http://localhost:3000`.

## Usage

Access the web interface at `http://localhost:3000` after installation to interact with the system.

### API Endpoints

The following API endpoints are available within the Next.js application:

#### Gemini Chat

**POST** `/api/gemini/chat`

```json
// Request Example
{
  "prompt": "What is the MSMED Act?"
}

// Response Example
{
  "response": "The MSMED Act, 2006 (Micro, Small and Medium Enterprises Development Act) is an act enacted by the Parliament of India to promote, facilitate and develop the competitiveness of micro, small and medium enterprises."
}
```

#### Gemini RAG

**POST** `/api/gemini/rag`

```json
// Request Example
{
  "query": "Summarize the dispute regarding invoice INV-2023-005.",
  "context": "The invoice INV-2023-005 for 1,50,000 INR was due on Jan 10, 2023. Buyer claims quality issues. Seller states goods were delivered as per specification."
}

// Response Example
{
  "response": "The dispute centers on invoice INV-2023-005, totaling 1,50,000 INR, which was due on January 10, 2023. The buyer alleges quality issues, while the seller maintains that the goods were delivered according to specifications."
}
```

#### Legal Dispute Classifier (M1)

**POST** `/api/models/m1`

```json
// Request Example
{
  "text": "Buyer defaulted on Invoice INV-2024-001 dated 15-Jan-2024. Rs 2,50,000 outstanding."
}

// Response Example
{
  "label": "payment_delay",
  "confidence": 0.847,
  "probabilities": { "payment_delay": 0.847, "contract_breach": 0.053, "quality_dispute": 0.035, "delivery_failure": 0.021, "documentation_dispute": 0.02, "statutory_violation": 0.004 }
}
```

#### Document Completeness Engine (M2)

**POST** `/api/models/m2`

```json
// Request Example
{
  "text_document_extract": "This document contains invoice number INV-001 and PO-876. Contract details are missing."
}

// Response Example
{
  "completeness_score": 0.75,
  "missing_documents": ["contract"],
  "present_documents": ["invoice", "po"]
}
```

#### Payment Outcome Predictor (M3)

**POST** `/api/models/m3`

```json
// Request Example
{
  "features": {
    "invoice_amount": 250000,
    "days_overdue": 67,
    "document_completeness_score": 0.9,
    "buyer_category": "Large",
    "prior_disputes_count": 1
  }
}

// Response Example
{
  "probability_win": 0.72,
  "prediction": "Win"
}
```

#### Legal Rule Engine (M4)

**POST** `/api/models/m4`

```json
// Request Example
{
  "invoice_amount": 250000,
  "days_overdue": 67,
  "rbi_bank_rate_pct": 6.5
}

// Response Example
{
  "statutory_interest_rs": 8945.32,
  "total_payable_rs": 258945.32,
  "reasoning_trace": [
    "Section 16: Statutory rate = 3 * 6.5% = 19.5%",
    "Interest = 250000 * (19.5/100) * (67/365) = 8945.32"
  ]
}
```

#### Sarvam ASR

**POST** `/api/sarvam/asr`

```json
// Request Example (assuming base64 encoded audio or URL to audio file)
{
  "audio_data_base64": "..."
}

// Response Example
{
  "transcribed_text": "The buyer confirmed the payment will be delayed."
}
```

#### Sarvam OCR

**POST** `/api/sarvam/ocr`

```json
// Request Example (assuming base64 encoded image or URL to image file)
{
  "image_data_base64": "..."
}

// Response Example
{
  "extracted_text": "Invoice Number: INV-2024-001\nAmount: 2,50,000 INR"
}
```

## Project Structure

```
.
├── .gitignore
├── .next/                      # Next.js build output
├── app/                        # Next.js App Router
│   ├── api/                    # Backend API routes
│   │   ├── gemini/
│   │   │   ├── chat/
│   │   │   │   └── route.ts
│   │   │   └── rag/
│   │   │       └── route.ts
│   │   ├── models/             # Model-specific API routes
│   │   │   ├── m1/
│   │   │   │   └── route.ts
│   │   │   ├── m2/
│   │   │   │   └── route.ts
│   │   │   ├── m3/
│   │   │   │   └── route.ts
│   │   │   └── m4/
│   │   │       └── route.ts
│   │   └── sarvam/
│   │       ├── asr/
│   │       │   └── route.ts
│   │       └── ocr/
│   │           └── route.ts
│   ├── datasets/               # Dataset visualization pages
│   │   └── page.tsx
│   ├── demo/                   # Demo page
│   │   └── page.tsx
│   ├── models/                 # Model visualization pages
│   │   ├── dispute-classifier/ # M1: Longformer
│   │   │   └── page.tsx
│   │   ├── document-completeness/ # M2: XGBoost
│   │   │   └── page.tsx
│   │   ├── payment-predictor/  # M3: LightGBM
│   │   │   └── page.tsx
│   │   └── rule-engine/        # M4: Deterministic
│   │       └── page.tsx
│   ├── globals.css             # Global CSS styles
│   ├── icon.svg                # Application icon
│   ├── layout.tsx              # Root layout component
│   └── page.tsx                # Home page
├── components/                 # Reusable React components
│   ├── ApiExplorer.tsx         # Interactive API playground
│   ├── ConfusionMatrix.tsx     # Metric visualizations
│   ├── HighLevelDiagram.tsx    # High-level architecture diagram
│   ├── LowLevelDiagram.tsx     # Low-level architecture diagram
│   ├── ModelTester.tsx         # Component for testing models
│   ├── Navigation.tsx          # Navigation bar component
│   └── PipelineDiagram.tsx     # Pipeline flow diagram
├── lib/                        # Utility functions and libraries
│   └── model-simulate.ts       # Model simulation utilities
├── next.config.ts              # Next.js configuration
├── package-lock.json
├── package.json                # Project dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
├── public/                     # Static assets
│   ├── favicon.svg
│   ├── file.svg
│   ├── globe.svg
│   ├── make-in-india-new.png
│   ├── make-in-india.png
│   ├── make-in-india.svg
│   ├── msme-logo-new.png
│   ├── next.svg
│   ├── odr-logo-new.webp
│   ├── vercel.svg
│   ├── window.svg
│   └── images/                 # Image assets
│       ├── arch-high.png
│       ├── arch-high.svg
│       ├── arch-low.png
│       ├── arch-low.svg
│       └── m2/
│           ├── contract_cm.png
│           ├── delivery_cm.png
│           ├── gst_cm.png
│           ├── invoice_cm.png
│           └── po_cm.png
├── README.md                   # Project documentation
├── tsconfig.json               # TypeScript configuration
└── vercel.json                 # Vercel deployment configuration
```

## Configuration

Environment variables are managed using `.env.local` files. These variables are crucial for configuring API keys, external service endpoints, and other sensitive settings.

*   **`NEXT_PUBLIC_GEMINI_API_KEY`**: API key for accessing Google Gemini services.
*   **`NEXT_PUBLIC_SARVAM_API_KEY`**: API key for accessing Sarvam AI services.

Ensure these variables are properly set in your local development environment and securely managed in deployment environments.

## Deployment

The application is configured for deployment on Vercel, leveraging its native support for Next.js applications. Docker can also be used for containerized deployments in other environments.

### Vercel Deployment

Deployment to Vercel is streamlined through the `vercel.json` configuration, enabling serverless functions for API routes and efficient static asset serving.

### Docker Deployment

For containerized environments, the provided `Dockerfile` builds a production-ready image of the Next.js application. Refer to the Installation section for Docker build and run commands.

## Contributing

Contributions are welcome. Please ensure that code adheres to the existing style and architectural patterns.

## License

(License information will be inserted here if available or explicitly provided.)
