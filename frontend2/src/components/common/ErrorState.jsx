import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorState({
  title = "Something went wrong",
  message = "Failed to load data. Please try again.",
  onRetry,
}) {
  return (
    <div
      style={{
        padding: "2.5rem 1.5rem",
        textAlign: "center",
        background: "var(--bg-elevated)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        margin: "1rem 0",
      }}
      role="alert"
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#fee2e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-danger)",
        }}
      >
        <AlertTriangle size={28} />
      </div>
      <div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
          {title}
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem", maxWidth: "450px" }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm" style={{ marginTop: "0.5rem" }}>
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  );
}
