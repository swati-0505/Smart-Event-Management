// MetricCard.jsx
// Dashboard metric card — horizontal layout with trend indicator.

import { TrendingUp, TrendingDown } from "lucide-react";

const colorMap = {
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  green: { bg: "bg-emerald-100", text: "text-emerald-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  amber: { bg: "bg-amber-100", text: "text-amber-600" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-600" },
  red: { bg: "bg-red-100", text: "text-red-600" },
};

function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp = true,
  trendLabel = "vs last month",
  color = "blue",
  delay = "",
}) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`card card--metric animate-fade-in-up ${delay} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.bg} ${c.text}`}
          >
            <Icon size={20} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tracking-tight text-theme-primary">
              {value}
            </p>
            <p className="mt-0.5 text-xs font-medium text-theme-muted truncate">
              {label}
            </p>
          </div>
        </div>

        {trend && (
          <div className="text-right shrink-0">
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                trendUp ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {trend}
            </span>
            <p className="mt-0.5 text-[10px] text-theme-dim">{trendLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MetricCard;