import React from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function PageLoader({ message = "Loading..." }) {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
        textAlign: "center",
      }}
      aria-live="polite"
    >
      <LoadingSpinner size="lg" />
      <p style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.95rem" }}>
        {message}
      </p>
    </div>
  );
}
