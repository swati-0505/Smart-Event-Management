// AttendeeChart.jsx
// Line chart showing attendee trends over time.

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { date: "Aug 17", attendees: 65 },
  { date: "Aug 24", attendees: 95 },
  { date: "Aug 31", attendees: 85 },
  { date: "Sep 07", attendees: 150 },
  { date: "Sep 14", attendees: 90 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-theme bg-theme-secondary px-3 py-2 shadow-lg">
      <p className="text-[10px] font-semibold text-theme-muted">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-theme-primary">
        {payload[0].value} attendees
      </p>
    </div>
  );
}

function AttendeeChart() {
  return (
    <div className="card animate-fade-in-up p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-theme-primary">
          Attendee Overview
        </h2>
        <select
          className="rounded-lg border border-theme bg-theme-tertiary px-2.5 py-1.5 text-[11px] font-medium text-theme-secondary outline-none"
          defaultValue="30"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Chart */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="attendeeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-color)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#6366f1", strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="attendees"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
              fill="url(#attendeeFill)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AttendeeChart;