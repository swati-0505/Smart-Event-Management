import React from "react";

export function LoadingSpinner({ size = "md", className = "" }) {
  const sizeMap = {
    sm: "16px",
    md: "28px",
    lg: "40px",
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div
      aria-label="Loading"
      style={{
        width: dim,
        height: dim,
        border: "3px solid var(--border-color)",
        borderTopColor: "var(--color-primary)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        display: "inline-block",
      }}
      className={className}
    />
  );
}

export default LoadingSpinner;
