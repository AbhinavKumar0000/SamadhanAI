import { NextRequest, NextResponse } from "next/server";
import AdmZip from "adm-zip";

export const maxDuration = 180;

const KEY = process.env.SARVAM_API_KEY;

async function extractTextFromZip(buffer: Buffer): Promise<string> {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  const textParts: string[] = [];
  for (const e of entries) {
    if (!e.isDirectory && (e.entryName.endsWith(".md") || e.entryName.endsWith(".txt") || e.entryName.endsWith(".html"))) {
      textParts.push(zip.readAsText(e));
    }
  }
  return textParts.join("\n\n") || "(No text extracted)";
}
const BASE = "https://api.sarvam.ai/doc-digitization/job/v1";

async function createJob(): Promise<{ job_id?: string }> {
  const res = await fetch(`${BASE}`, {
    method: "POST",
    headers: {
      "api-subscription-key": KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      job_parameters: {
        language: "en-IN",
        output_format: "md",
      },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data?.error?.message ?? data?.message ?? data?.detail ?? `Create job failed: ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data;
}

async function getUploadUrls(jobId: string, fileName: string) {
  const res = await fetch(`${BASE}/upload-files`, {
    method: "POST",
    headers: {
      "api-subscription-key": KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ job_id: jobId, files: [fileName] }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Get upload URLs failed: ${res.status}`);
  }
  return res.json();
}

async function startJob(jobId: string) {
  const res = await fetch(`${BASE}/${jobId}/start`, {
    method: "POST",
    headers: { "api-subscription-key": KEY! },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Start job failed: ${res.status}`);
  }
  return res.json();
}

async function getStatus(jobId: string) {
  const res = await fetch(`${BASE}/${jobId}/status`, {
    headers: { "api-subscription-key": KEY! },
  });
  if (!res.ok) throw new Error(`Status failed: ${res.status}`);
  return res.json();
}

async function getDownloadUrls(jobId: string) {
  const res = await fetch(`${BASE}/${jobId}/download-files`, {
    method: "POST",
    headers: { "api-subscription-key": KEY! },
  });
  if (!res.ok) throw new Error(`Download URLs failed: ${res.status}`);
  return res.json();
}

export async function POST(req: NextRequest) {
  if (!KEY) {
    return NextResponse.json(
      { error: "SARVAM_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No document file provided" },
        { status: 400 }
      );
    }

    const fileName = file.name || "document.pdf";
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const jobRes = await createJob();
    const jobId = jobRes.job_id;
    if (!jobId) throw new Error("No job_id in response");

    const uploadRes = await getUploadUrls(jobId, fileName);
    const uploadUrls = uploadRes?.upload_urls;
    if (!uploadUrls || typeof uploadUrls !== "object")
      throw new Error("No upload URLs in response");

    const fileDetails =
      uploadUrls[fileName] ??
      uploadUrls[Object.keys(uploadUrls)[0]];
    const uploadUrl =
      typeof fileDetails === "object" ? fileDetails?.file_url : null;
    if (!uploadUrl) throw new Error("No upload URL in upload_urls");

    const uploadResp = await fetch(uploadUrl, {
      method: "PUT",
      body: buffer,
      headers: {
        "Content-Type": "application/pdf",
        "x-ms-blob-type": "BlockBlob",
      },
    });
    if (!uploadResp.ok) {
      const errText = await uploadResp.text();
      throw new Error(`Upload failed: ${uploadResp.status} - ${errText.slice(0, 200)}`);
    }

    await startJob(jobId);

    const maxPolls = 60;
    const pollInterval = 2000;
    for (let i = 0; i < maxPolls; i++) {
      await new Promise((r) => setTimeout(r, pollInterval));
      const status = await getStatus(jobId);
      const state = status?.job_state;
      if (state === "Completed" || state === "PartiallyCompleted") {
        const downloadRes = await getDownloadUrls(jobId);
        const urls = downloadRes?.download_urls;
        if (urls && typeof urls === "object") {
          const firstKey = Object.keys(urls)[0];
          const downloadUrl = urls[firstKey]?.file_url;
          if (downloadUrl) {
            const zipRes = await fetch(downloadUrl);
            const zipBuffer = await zipRes.arrayBuffer();
            const text = await extractTextFromZip(Buffer.from(zipBuffer));
            return NextResponse.json({
              job_id: jobId,
              state,
              extracted_text: text,
            });
          }
        }
      }
      if (state === "Failed") {
        throw new Error(status?.error_message || "OCR job failed");
      }
    }
    throw new Error("OCR processing timed out");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[OCR]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
