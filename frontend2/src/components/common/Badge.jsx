import React from "react";

export default function Badge({ variant = "primary", children, className = "" }) {
  return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
}
