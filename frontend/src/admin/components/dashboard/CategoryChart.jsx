// CategoryChart.jsx
// Donut chart showing event category distribution.

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Conference", value: 35, color: "#6366f1" },
  { name: "Workshop", value: 25, color: "#10b981" },
  { name: "Networking", value: 20, color: "#f59e0b" },
  { name: "Corporate", value: 15, color: "#a855f7" },
  { name: "Others", value: 5, color: "#94a3b8" },
];

function CategoryChart() {
  return (
    <div className="card animate-fade-in-up p-5">
      <h2 className="mb-3 text-base font-bold text-theme-primary">
        Event Categories
      </h2>

      <div className="flex items-center gap-3">
        {/* Donut */}
        <div className="h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={38}
                outerRadius={60}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: item.color }}
                />
                <span className="text-theme-secondary">{item.name}</span>
              </div>
              <span className="font-semibold text-theme-primary">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryChart;