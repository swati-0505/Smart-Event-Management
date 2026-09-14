// Reports.jsx
// Fully responsive reports & analytics.
// Mobile: stacked charts | Tablet: 2-col KPIs | Desktop: full dashboard

import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Download, Calendar, Users,
  BarChart3, PieChart, Activity, RefreshCw,
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

  /* ============ LOADING ============ */
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary sm:text-3xl">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-xs text-theme-muted sm:text-sm">Loading...</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
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

  /* ============ ERROR ============ */
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-2xl font-bold text-theme-primary sm:text-3xl">
          Reports & Analytics
        </h1>
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button type="button" onClick={loadReports} className="btn-primary">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.monthly.map((d) => d.registrations));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ============ HEADER ============ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary sm:text-3xl">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-xs text-theme-muted sm:text-sm">
            Insights and statistics about your events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="flex-1 rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-xs text-theme-primary outline-none sm:flex-initial sm:text-sm"
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
            className="btn-primary whitespace-nowrap text-xs disabled:opacity-50 sm:text-sm"
          >
            <Download size={14} />
            <span className="hidden sm:inline">
              {exporting ? "Exporting..." : "Export"}
            </span>
            <span className="sm:hidden">{exporting ? "..." : "Export"}</span>
          </button>
        </div>
      </div>

      {/* ============ KPI CARDS ============ */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Object.entries(data.kpis).map(([key, kpi], idx) => {
          const config = KPI_CONFIG[key];
          if (!config) return null;
          const Icon = config.icon;
          return (
            <div
              key={key}
              className={`card animate-fade-in-up stagger-${idx + 1} p-3 sm:p-5`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${COLOR_MAP[config.color]}`}
                >
                  <Icon size={16} className="sm:hidden" />
                  <Icon size={20} className="hidden sm:block" />
                </div>
                <span
                  className={`inline-flex items-center gap-0.5 text-[10px] font-semibold sm:gap-1 sm:text-xs ${
                    kpi.trend_up ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {kpi.trend_up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {kpi.trend}
                </span>
              </div>
              <p className="mt-3 text-[11px] text-theme-muted sm:mt-4 sm:text-sm">
                {config.label}
              </p>
              <p className="mt-0.5 text-xl font-bold text-theme-primary sm:mt-1 sm:text-3xl">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* ============ CHARTS ============ */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Bar Chart */}
        <div className="card animate-fade-in-up p-4 sm:p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <h2 className="text-sm font-bold text-theme-primary sm:text-base">
              Monthly Registrations
            </h2>
            <BarChart3 size={16} className="text-theme-muted sm:hidden" />
            <BarChart3 size={18} className="hidden text-theme-muted sm:block" />
          </div>

          <div className="flex h-44 items-end justify-between gap-1.5 sm:h-56 sm:gap-2.5 lg:h-64 lg:gap-3">
            {data.monthly.map((d, idx) => {
              const height = (d.registrations / maxValue) * 100;
              return (
                <div
                  key={idx}
                  className="flex flex-1 flex-col items-center gap-1 sm:gap-2"
                >
                  <span className="text-[9px] font-semibold text-theme-secondary sm:text-[10px]">
                    {d.registrations}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-purple-500 transition-all duration-500 hover:from-indigo-600 hover:to-purple-600"
                    style={{ height: `${height}%`, minHeight: "6px" }}
                  />
                  <span className="text-[9px] font-medium text-theme-muted sm:text-[11px]">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card animate-fade-in-up p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <h2 className="text-sm font-bold text-theme-primary sm:text-base">
              Event Categories
            </h2>
            <PieChart size={16} className="text-theme-muted sm:hidden" />
            <PieChart size={18} className="hidden text-theme-muted sm:block" />
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {data.categories.map((cat, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                  <span className="font-medium text-theme-secondary">
                    {cat.name}
                  </span>
                  <span className="font-bold text-theme-primary">
                    {cat.value}%
                  </span>
                </div>
                <div className="mt-1 progress-bar sm:mt-1.5">
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

      {/* ============ TOP EVENTS ============ */}
      <div className="card animate-fade-in-up overflow-hidden">
        <div className="border-b border-theme p-4 sm:p-5">
          <h2 className="text-sm font-bold text-theme-primary sm:text-base">
            Top Performing Events
          </h2>
        </div>

        {/* Desktop: Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[600px]">
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

        {/* Mobile: Cards */}
        <div className="divide-y divide-theme md:hidden">
          {data.top_events.map((event, idx) => (
            <div
              key={idx}
              className="animate-fade-in-up p-4"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <p className="text-sm font-bold text-theme-primary">
                {event.name}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                <span className="text-theme-muted">
                  {event.registrations} regs
                </span>
                <span className="badge badge-success">{event.attendance}</span>
                <span className="font-bold text-theme-primary">
                  ⭐ {event.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reports;