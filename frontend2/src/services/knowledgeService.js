import { apiDelete, apiGet, apiPost, apiRequest, buildQuery } from "./api/client";

/** Extensions accepted by POST /admin/knowledge/upload (backend SUPPORTED set). */
export const KNOWLEDGE_SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".pptx",
  ".xlsx",
  ".html",
  ".htm",
  ".csv",
  ".json",
  ".xml",
  ".md",
  ".txt",
  ".markdown",
];

export const KNOWLEDGE_ACCEPT = KNOWLEDGE_SUPPORTED_EXTENSIONS.join(",");

/** Soft client limit — keeps uploads predictable; backend still validates type. */
export const KNOWLEDGE_MAX_FILE_BYTES = 10 * 1024 * 1024;

const UPLOAD_TIMEOUT_MS = 600000;
const INGEST_TIMEOUT_MS = 180000;

export function getFileExtension(filename) {
  const name = String(filename || "").trim();
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot).toLowerCase();
}

export function validateKnowledgeFile(file) {
  if (!file || !(file instanceof File)) {
    return "Please choose a file to upload.";
  }
  const filename = (file.name || "").trim();
  if (!filename || filename === "." || filename === "..") {
    return "A valid filename is required.";
  }
  if (filename.includes("/") || filename.includes("\\") || filename.includes("\0")) {
    return "Filename contains invalid characters.";
  }
  const ext = getFileExtension(filename);
  if (!KNOWLEDGE_SUPPORTED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type '${ext || "(none)"}'. Supported: ${KNOWLEDGE_SUPPORTED_EXTENSIONS.join(", ")}`;
  }
  if (file.size <= 0) {
    return "The selected file is empty.";
  }
  if (file.size > KNOWLEDGE_MAX_FILE_BYTES) {
    return `File is too large (max ${Math.round(KNOWLEDGE_MAX_FILE_BYTES / (1024 * 1024))} MB).`;
  }
  return null;
}

export async function getKnowledgeStatus(options) {
  return apiGet("/admin/knowledge/status", options);
}

/**
 * Upload one document and ingest it into the RAG knowledge base.
 * @param {File} file
 * @param {{ force?: boolean, targetIndex?: 'nvidia' }} [opts]
 */
export async function uploadKnowledgeDocument(file, opts = {}) {
  const validationError = validateKnowledgeFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const query = buildQuery({
    force: opts.force ? "true" : undefined,
    target_index: opts.targetIndex || undefined,
  });
  const formData = new FormData();
  formData.append("file", file, file.name);

  return apiRequest(`/admin/knowledge/upload${query}`, {
    method: "POST",
    body: formData,
    timeoutMs: UPLOAD_TIMEOUT_MS,
  });
}

/**
 * Re-index all documents already on the server under KNOWLEDGE_DOCS_DIR.
 * @param {{ force?: boolean, targetIndex?: 'nvidia' }} [opts]
 */
export async function ingestKnowledge(opts = {}) {
  const query = buildQuery({
    force: opts.force ? "true" : undefined,
    target_index: opts.targetIndex || undefined,
  });
  return apiPost(`/admin/knowledge/ingest${query}`, undefined, {
    timeoutMs: INGEST_TIMEOUT_MS,
  });
}

/**
 * Delete one indexed document (DB row, vectors, and source file).
 * @param {string} filename
 */
export async function deleteKnowledgeDocument(filename) {
  const name = String(filename || "").trim();
  if (!name || name === "." || name === ".." || name.includes("/") || name.includes("\\")) {
    throw new Error("Invalid document filename.");
  }
  return apiDelete(`/admin/knowledge/documents/${encodeURIComponent(name)}`);
}
