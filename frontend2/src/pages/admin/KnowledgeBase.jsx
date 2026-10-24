import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  RefreshCw,
  Upload,
  AlertTriangle,
  Database,
  Layers,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getKnowledgeStatus,
  uploadKnowledgeDocument,
  ingestKnowledge,
  deleteKnowledgeDocument,
  validateKnowledgeFile,
  KNOWLEDGE_ACCEPT,
  KNOWLEDGE_MAX_FILE_BYTES,
  KNOWLEDGE_SUPPORTED_EXTENSIONS,
} from "../../services/knowledgeService";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";

function formatBytes(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusPill({ ok, labelOk, labelBad }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.3rem 0.7rem",
        borderRadius: "var(--radius-md)",
        fontSize: "0.75rem",
        fontWeight: 700,
        backgroundColor: ok ? "#dcfce7" : "#fef3c7",
        color: ok ? "#166534" : "#92400e",
      }}
    >
      {ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
      {ok ? labelOk : labelBad}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        padding: "1.1rem 1.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
          fontWeight: 600,
        }}
      >
        <Icon size={15} />
        {label}
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.2 }}>{value}</div>
      {hint ? (
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{hint}</div>
      ) : null}
    </div>
  );
}

export default function KnowledgeBase() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [forceUpload, setForceUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reingestOpen, setReingestOpen] = useState(false);
  const [forceReingest, setForceReingest] = useState(false);
  const [reingesting, setReingesting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const loadStatus = useCallback(() => {
    setLoading(true);
    setError("");
    getKnowledgeStatus()
      .then((data) => setStatus(data))
      .catch((err) => setError(err.message || "Failed to load knowledge base status."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const pickFile = (file) => {
    if (!file) {
      setSelectedFile(null);
      setFileError("");
      return;
    }
    const validation = validateKnowledgeFile(file);
    setSelectedFile(file);
    setFileError(validation || "");
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    pickFile(file);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0] || null;
    pickFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setFileError("Please choose a file to upload.");
      return;
    }
    const validation = validateKnowledgeFile(selectedFile);
    if (validation) {
      setFileError(validation);
      return;
    }

    setUploading(true);
    setFileError("");
    try {
      const result = await uploadKnowledgeDocument(selectedFile, { force: forceUpload });
      toast.success(
        result?.status === "skipped"
          ? `${result.filename} already indexed (unchanged). Enable “Force re-index” to replace it.`
          : `Indexed ${result.filename} (${result.chunk_count || 0} chunks).`
      );
      setSelectedFile(null);
      setForceUpload(false);
      loadStatus();
    } catch (err) {
      const message = err.message || "Upload failed.";
      setFileError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleReingestConfirm = async () => {
    setReingesting(true);
    try {
      const results = await ingestKnowledge({ force: forceReingest });
      const list = Array.isArray(results) ? results : [];
      const failed = list.filter((r) => r.status === "failed").length;
      const indexed = list.filter((r) => r.status === "indexed" || r.status === "updated").length;
      const skipped = list.filter((r) => r.status === "skipped").length;
      if (failed > 0) {
        toast.warning(`Re-index finished with ${failed} failure(s). Indexed: ${indexed}, skipped: ${skipped}.`);
      } else {
        toast.success(`Re-index complete. Indexed: ${indexed}, skipped: ${skipped}.`);
      }
      setReingestOpen(false);
      setForceReingest(false);
      loadStatus();
    } catch (err) {
      toast.error(err.message || "Re-index failed.");
    } finally {
      setReingesting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.filename) return;
    setDeleting(true);
    try {
      const result = await deleteKnowledgeDocument(deleteTarget.filename);
      toast.success(
        `Deleted ${result.filename} (${result.chunks_removed ?? 0} vector chunk(s) removed).`
      );
      setDeleteTarget(null);
      loadStatus();
    } catch (err) {
      toast.error(err.message || "Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !status) {
    return <PageLoader message="Loading knowledge base..." />;
  }

  if (error && !status) {
    return <ErrorState message={error} onRetry={loadStatus} />;
  }

  const documents = Array.isArray(status?.documents) ? status.documents : [];
  const indexReady = Boolean(status?.staged_nvidia_ready);
  const indexHealthMessage =
    status?.index_health_message ||
    (indexReady ? "OpenRouter index ready" : "Index empty or not ready");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: "var(--font-3xl)", fontWeight: 800, margin: 0 }}>
            Knowledge Base
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.35rem" }}>
            Upload policy documents for the AI assistant RAG index. Admin and Main Admin only.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              cursor: uploading || reingesting ? "not-allowed" : "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={forceReingest}
              disabled={uploading || reingesting}
              onChange={(e) => setForceReingest(e.target.checked)}
            />
            Force re-index
          </label>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadStatus}
            disabled={uploading || reingesting || loading}
          >
            <RefreshCw size={16} style={{ marginRight: "0.4rem" }} />
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setReingestOpen(true)}
            disabled={uploading || reingesting}
          >
            <Database size={16} style={{ marginRight: "0.4rem" }} />
            Re-index all
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "1rem",
        }}
      >
        <StatCard
          icon={FileText}
          label="Documents"
          value={status?.document_count ?? 0}
        />
        <StatCard
          icon={Layers}
          label="Chunks"
          value={status?.chunk_count ?? 0}
          hint={`Provider: ${status?.embedding_provider || "openrouter"}`}
        />
        <StatCard
          icon={Database}
          label="Active index"
          value={status?.active_embedding_index || "nvidia"}
          hint={status?.embedding_model || undefined}
        />
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "0.6rem",
            padding: "1.1rem 1.25rem",
          }}
        >
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>
            Index health
          </div>
          <StatusPill
            ok={indexReady}
            labelOk="OpenRouter index ready"
            labelBad="Index not ready"
          />
          {!indexReady && indexHealthMessage ? (
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.35 }}>
              {indexHealthMessage}
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="card"
        style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.35rem" }}
      >
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>Upload document</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
            Supported: {KNOWLEDGE_SUPPORTED_EXTENSIONS.join(", ")}. Max size{" "}
            {formatBytes(KNOWLEDGE_MAX_FILE_BYTES)}. File is validated, saved, then indexed
            immediately.
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!uploading) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!uploading) fileInputRef.current?.click();
            }
          }}
          style={{
            border: `2px dashed ${dragOver ? "var(--color-primary)" : "var(--border-color)"}`,
            borderRadius: "var(--radius-lg)",
            backgroundColor: dragOver ? "var(--color-primary-light)" : "var(--bg-secondary)",
            padding: "1.75rem 1.25rem",
            textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.7 : 1,
            transition: "border-color var(--transition-fast), background-color var(--transition-fast)",
          }}
        >
          <Upload size={28} style={{ color: "var(--color-primary)", marginBottom: "0.6rem" }} />
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
            {selectedFile ? selectedFile.name : "Drop a file here or click to browse"}
          </div>
          {selectedFile ? (
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              {formatBytes(selectedFile.size)}
            </div>
          ) : (
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              One file at a time
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={KNOWLEDGE_ACCEPT}
            onChange={onFileChange}
            disabled={uploading}
            style={{ display: "none" }}
          />
        </div>

        {fileError ? (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "#fee2e2",
              color: "var(--color-danger)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.875rem",
            }}
          >
            {fileError}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={forceUpload}
              disabled={uploading}
              onChange={(e) => setForceUpload(e.target.checked)}
            />
            Force re-index if this file already exists unchanged
          </label>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={uploading || !selectedFile || Boolean(fileError)}
          >
            {uploading ? (
              <>
                <RefreshCw
                  size={16}
                  className="spin"
                  style={{ marginRight: "0.4rem", animation: "spin 1s linear infinite" }}
                />
                Uploading & indexing…
              </>
            ) : (
              <>
                <Upload size={16} style={{ marginRight: "0.4rem" }} />
                Upload & index
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: "1.35rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 1rem" }}>
          Indexed documents
        </h2>
        {documents.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No documents indexed"
            description="Upload a policy or FAQ document to populate the RAG knowledge base."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ padding: "0.65rem 0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    Filename
                  </th>
                  <th style={{ padding: "0.65rem 0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    Type
                  </th>
                  <th style={{ padding: "0.65rem 0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    Chunks
                  </th>
                  <th style={{ padding: "0.65rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, width: "72px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.filename}
                    style={{ borderBottom: "1px solid var(--border-color)" }}
                  >
                    <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                        <FileText size={15} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                        {doc.filename}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-secondary)" }}>
                      {doc.doc_type || "—"}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-secondary)" }}>
                      {doc.chunks ?? 0}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        style={{ color: "var(--color-danger)" }}
                        title={`Delete ${doc.filename}`}
                        disabled={uploading || reingesting || deleting}
                        onClick={() => setDeleteTarget(doc)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={reingestOpen}
        onClose={() => {
          if (!reingesting) setReingestOpen(false);
        }}
        onConfirm={handleReingestConfirm}
        title="Re-index knowledge base"
        message={
          forceReingest
            ? "This will re-process every document on the server, even unchanged ones. Embedding may take a while."
            : "This will scan server documents and index only new or changed files. Unchanged files are skipped."
        }
        confirmLabel={forceReingest ? "Force re-index all" : "Re-index changed"}
        confirmVariant={forceReingest ? "danger" : "primary"}
        loading={reingesting}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete knowledge document"
        message={
          deleteTarget
            ? `Permanently delete "${deleteTarget.filename}"? This removes the source file, database metadata, and all pgvector embeddings for this document only. Other documents are not affected.`
            : "Permanently delete this document?"
        }
        confirmLabel="Yes, Delete"
        confirmVariant="danger"
        loading={deleting}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
