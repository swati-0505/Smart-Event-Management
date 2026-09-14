// MetricCard.jsx
// Dashboard metric card — improved typography hierarchy.

import { TrendingUp } from "lucide-react";

const iconColorMap = {
  indigo: "bg-indigo-100 text-indigo-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-emerald-100 text-emerald-600",
  purple: "bg-purple-100 text-purple-600",
  orange: "bg-orange-100 text-orange-600",
  red: "bg-red-100 text-red-600",
};

function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  iconColor = "indigo",
  badge,
  delay = "",
}) {
  return (
    <div className={`card card-interactive animate-fade-in-up ${delay} p-5`}>
      {/* Icon + Badge */}
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconColorMap[iconColor]}`}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
        {badge && <span className="badge badge-info">{badge}</span>}
      </div>

      {/* Label — small, muted, uppercase-ish */}
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-theme-muted">
        {label}
      </p>

      {/* Value — big, bold, tight tracking */}
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-theme-primary sm:text-[34px]">
        {value}
      </p>

      {/* Trend */}
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
            <TrendingUp size={12} />
            {trend}
          </span>
          <span className="text-theme-muted">{trendLabel}</span>
        </div>
      )}
      {!trend && trendLabel && (
        <p className="mt-3 text-xs text-theme-muted">{trendLabel}</p>
      )}
    </div>
  );
}

export default MetricCard;