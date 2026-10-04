import { apiGet } from "./api";

const PAID = ["paid", "completed", "confirmed", "success"];
const CANCELLED = ["refunded", "failed", "cancelled", "canceled"];
const COLORS = [
  "bg-indigo-500",
  "bg-purple-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-pink-500",
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toList(data) {
  if (Array.isArray(data)) return data;
  const inner = data?.data ?? data?.items ?? data?.events ?? data?.payments;
  return Array.isArray(inner) ? inner : [];
}

function cleanLabel(value) {
  return String(value || "").replace(/[;:,.\s]+$/, "").trim();
}

function statusOf(p) {
  return String(p.payment_status ?? p.status ?? "").toLowerCase();
}

// Chart buckets for the selected period
function buildBuckets(period) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const buckets = [];

  if (period === "This Week") {
    const offset = (now.getDay() + 6) % 7; // Monday = 0
    for (let i = 0; i < 7; i++) {
      const from = new Date(y, m, now.getDate() - offset + i);
      const to = new Date(y, m, now.getDate() - offset + i + 1);
      buckets.push({ label: DAYS[from.getDay()], from, to });
    }
  } else if (period === "This Month") {
    const last = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= last; d += 7) {
      const endDay = Math.min(d + 6, last);
      buckets.push({
        label: `${d}-${endDay}`,
        from: new Date(y, m, d),
        to: new Date(y, m, endDay + 1),
      });
    }
  } else {
    const first = period === "This Quarter" ? Math.floor(m / 3) * 3 : 0;
    const count = period === "This Quarter" ? 3 : 12;
    for (let i = 0; i < count; i++) {
      const from = new Date(y, first + i, 1);
      const to = new Date(y, first + i + 1, 1);
      buckets.push({ label: MONTHS[from.getMonth()], from, to });
    }
  }
  return buckets;
}

export async function getReportData(period = "This Month") {
  const [eventsRes, paymentsRes] = await Promise.allSettled([
    apiGet("/events/"),
    apiGet("/payments/"),
  ]);

  if (eventsRes.status === "rejected") throw eventsRes.reason;

  const events = toList(eventsRes.value);
  const payments = paymentsRes.status === "fulfilled" ? toList(paymentsRes.value) : [];

  const buckets = buildBuckets(period);
  const from = buckets[0].from;
  const to = buckets[buckets.length - 1].to;
  const within = (d) => d && d >= from && d < to;
  const inBucket = (d, b) => d && d >= b.from && d < b.to;

  const periodEvents = events.filter((e) => within(toDate(e.date)));
  const periodPayments = payments.filter((p) =>
    within(toDate(p.payment_date ?? p.created_at))
  );
  const paid = periodPayments.filter((p) => PAID.includes(statusOf(p)));
  const cancelled = periodPayments.filter((p) => CANCELLED.includes(statusOf(p)));
  const revenue = paid.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  // Chart: paid tickets per bucket (kept under the `registrations` key)
  const monthly = buckets.map((b) => ({
    month: b.label,
    registrations: paid.filter((p) =>
      inBucket(toDate(p.payment_date ?? p.created_at), b)
    ).length,
  }));

  // Categories: share of events in this period
  const counts = {};
  periodEvents.forEach((e) => {
    const name = cleanLabel(e.category) || "Other";
    counts[name] = (counts[name] || 0) + 1;
  });
  const categories = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count], i) => ({
      name,
      value: Math.round((count / periodEvents.length) * 100),
      color: COLORS[i % COLORS.length],
    }));

  // Top events: most paid tickets in this period
  const byEvent = {};
  paid.forEach((p) => {
    if (!p.event_id) return;
    const key = String(p.event_id);
    byEvent[key] = byEvent[key] || { tickets: 0, revenue: 0 };
    byEvent[key].tickets += 1;
    byEvent[key].revenue += parseFloat(p.amount) || 0;
  });
  const top_events = Object.entries(byEvent)
    .map(([id, stats]) => {
      const ev = events.find((e) => String(e.event_id ?? e.id) === id);
      return {
        name: ev?.title || "Unknown event",
        registrations: stats.tickets,
        revenue: `₹${stats.revenue.toLocaleString("en-IN")}`,
        _revenue: stats.revenue,
      };
    })
    .sort((a, b) => b.registrations - a.registrations || b._revenue - a._revenue)
    .slice(0, 5);

  return {
    kpis: {
      total_events: { value: periodEvents.length },
      tickets_sold: { value: paid.length },
      revenue: { value: `₹${revenue.toLocaleString("en-IN")}` },
      cancellations: { value: cancelled.length },
    },
    monthly,
    categories,
    top_events,
    chartLabel: "Tickets Sold",
    trendLabel: `${period} · paid tickets`,
  };
}

export async function exportReport() {
  throw new Error("Use the Export button in the Reports page.");
}

export default { getReportData, exportReport };