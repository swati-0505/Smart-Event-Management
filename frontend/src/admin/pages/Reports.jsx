// Reports.jsx
// Reports & Analytics — service-driven, backend-ready.

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Users,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
} from "lucide-react";
import { getReportData, exportReport } from "../services/reportService";

const KPI_CONFIG = {
  total_events: { label: "Total Events", icon: Calendar, color: "indigo" },
  total_registrations: { label: "Total Registrations", icon: Users, color: "blue" },
  avg_attendance: { label: "Avg. Attendance", icon: Activity, color: "green" },
  cancellations: { label: "Cancellations", icon: TrendingDown, color: "orange" },
};

const COLOR_MAP = {
  indigo: "bg-indigo-100 text-indigo-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-emerald-100 text-emerald-600",
  orange: "bg-orange-100 text-orange-600",
};

function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("This Month");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReports();
  }, [period]);

  async function loadReports() {
    try {
      setLoading(true);
      setError(null);
      const res = await getReportData(period);
      setData(res);
    } catch (err) {
      setError("Failed to load report data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      setExporting(true);
      const res = await exportReport("csv");
      alert(res.message || "Report exported!");
    } catch (err) {
      console.error(err);
      alert("Failed to export report.");
    } finally {
      setExporting(false);
    }
  }

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-theme-muted">Loading...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse p-5">
              <div className="h-11 w-11 rounded-xl bg-theme-tertiary" />
              <div className="mt-4 h-3 w-20 rounded bg-theme-tertiary" />
              <div className="mt-2 h-8 w-24 rounded bg-theme-tertiary" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- ERROR ---------- */
  if (error) {
    return (
      <div className="space-y-10">
        <h1 className="text-3xl font-bold text-theme-primary">Reports & Analytics</h1>
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button type="button" onClick={loadReports} className="btn-primary">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---------- MAIN ---------- */
  const maxValue = Math.max(...data.monthly.map((d) => d.registrations));

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-sm text-theme-muted">
            Insights and statistics about your events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="btn-primary disabled:opacity-50"
          >
            <Download size={16} />
            {exporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(data.kpis).map(([key, kpi], idx) => {
          const config = KPI_CONFIG[key];
          if (!config) return null;
          const Icon = config.icon;
          return (
            <div
              key={key}
              className={`card animate-fade-in-up stagger-${idx + 1} p-5`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${COLOR_MAP[config.color]}`}
                >
                  <Icon size={20} />
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    kpi.trend_up ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {kpi.trend_up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.trend}
                </span>
              </div>
              <p className="mt-4 text-sm text-theme-muted">{config.label}</p>
              <p className="mt-1 text-3xl font-bold text-theme-primary">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card animate-fade-in-up p-5 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-theme-primary">
              Monthly Registrations
            </h2>
            <BarChart3 size={18} className="text-theme-muted" />
          </div>
          <div className="flex h-64 items-end justify-between gap-3">
            {data.monthly.map((d, idx) => {
              const height = (d.registrations / maxValue) * 100;
              return (
                <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] font-semibold text-theme-secondary">
                    {d.registrations}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-linear-to-t from-indigo-500 to-purple-500 transition-all duration-500 hover:from-indigo-600 hover:to-purple-600"
                    style={{ height: `${height}%`, minHeight: "8px" }}
                  />
                  <span className="text-[11px] font-medium text-theme-muted">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card animate-fade-in-up p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-theme-primary">
              Event Categories
            </h2>
            <PieChart size={18} className="text-theme-muted" />
          </div>
          <div className="space-y-3">
            {data.categories.map((cat, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-theme-secondary">
                    {cat.name}
                  </span>
                  <span className="font-bold text-theme-primary">
                    {cat.value}%
                  </span>
                </div>
                <div className="mt-1.5 progress-bar">
                  <div
                    className={`progress-fill ${cat.color}`}
                    style={{ width: `${cat.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Events */}
      <div className="card animate-fade-in-up overflow-hidden">
        <div className="border-b border-theme p-5">
          <h2 className="text-base font-bold text-theme-primary">
            Top Performing Events
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-150">
            <thead>
              <tr className="border-b border-theme bg-theme-tertiary text-left">
                {["Event", "Registrations", "Attendance", "Rating"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-theme-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.top_events.map((event, idx) => (
                <tr
                  key={idx}
                  className="border-b border-theme transition hover:bg-theme-hover last:border-b-0"
                >
                  <td className="px-5 py-4 text-sm font-semibold text-theme-primary">
                    {event.name}
                  </td>
                  <td className="px-5 py-4 text-sm text-theme-secondary">
                    {event.registrations}
                  </td>
                  <td className="px-5 py-4">
                    <span className="badge badge-success">{event.attendance}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-theme-primary">
                    ⭐ {event.rating}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;