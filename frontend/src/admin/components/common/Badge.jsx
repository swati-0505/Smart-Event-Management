// Badge.jsx
// Reusable status badge component.

function Badge({ variant = "neutral", children }) {
  const variants = {
    success: "badge badge-success",
    warning: "badge badge-warning",
    danger: "badge badge-danger",
    info: "badge badge-info",
    neutral: "badge badge-neutral",
  };
  return <span className={variants[variant] || variants.neutral}>{children}</span>;
}

export default Badge;