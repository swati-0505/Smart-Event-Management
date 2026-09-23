// Home.jsx
// Dashboard — fetches metrics from service, with fallback when backend is empty.

import { useState, useEffect } from "react";
import { Calendar, Users, IndianRupee, Star, Plus } from "lucide-react";

import MetricCard from "../components/dashboard/MetricCard";
import UpcomingEvents from "../components/dashboard/UpcomingEvents";
import AttendeeChart from "../components/dashboard/AttendeeChart";
import CategoryChart from "../components/dashboard/CategoryChart";
import RecentActivity from "../components/dashboard/RecentActivity";
import PromoBanner from "../components/dashboard/PromoBanner";
import { getDashboardMetrics } from "../services/dashboardService";

/* -------------------- Fallback Data -------------------- */
const FALLBACK_METRICS = {
  total_events: { value: "12", trend: "+20%", trendUp: true },
  total_attendees: { value: "1,245", trend: "+12%", trendUp: true },
  total_revenue: { value: "₹2.4L", trend: "+18%", trendUp: true },
  avg_rating: { value: "4.8", trend: "+0.3", trendUp: true },
};

/* -------------------- Animated Greeting -------------------- */
function AnimatedGreeting() {
  const fullText = "Welcome back, Admin";
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayed(fullText.slice(0, index));
        index++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-2xl font-bold tracking-tight text-theme-primary sm:text-3xl">
      <span className="inline-block">
        {displayed}
        {!done && (
          <span className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-indigo-500 align-middle" />
        )}
      </span>
      {done && <span className="ml-1.5">👋</span>}
    </h1>
  );
}

/* -------------------- Live Date -------------------- */
function LiveDate() {
  const [dateLabel, setDateLabel] = useState("");
  useEffect(() => {
    const now = new Date();
    setDateLabel(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    );
  }, []);
  return <p className="text-xs font-medium text-theme-muted">{dateLabel}</p>;
}

/* -------------------- Home -------------------- */
function Home({ onPageChange }) {
  const [metrics, setMetrics] = useState(FALLBACK_METRICS);
  const [usingFallback, setUsingFallback] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await getDashboardMetrics();

        // Normalize backend response — handle multiple shapes
        if (data && (data.total_events !== undefined || data.totalEvents !== undefined)) {
          const normalized = {
            total_events: normalizeMetric(data.total_events || data.totalEvents, "12"),
            total_attendees: normalizeMetric(
              data.total_attendees || data.totalAttendees || data.total_registrations,
              "1,245"
            ),
            total_revenue: normalizeMetric(
              data.total_revenue || data.totalRevenue || data.revenue,
              "₹2.4L"
            ),
            avg_rating: normalizeMetric(
              data.avg_rating || data.avgRating || data.rating,
              "4.8"
            ),
          };
          setMetrics(normalized);
          setUsingFallback(false);
        } else {
          // Empty backend — keep fallback
          setMetrics(FALLBACK_METRICS);
          setUsingFallback(true);
        }
      } catch (err) {
        console.warn("Dashboard metrics failed, using fallback:", err);
        setMetrics(FALLBACK_METRICS);
        setUsingFallback(true);
      }
    }
    loadMetrics();
  }, []);

  // Normalize — service could return just a number, or { value, trend }
  function normalizeMetric(raw, fallbackValue) {
    if (raw === undefined || raw === null) {
      return { value: fallbackValue, trend: null, trendUp: true };
    }
    if (typeof raw === "object" && raw.value !== undefined) {
      return {
        value: String(raw.value),
        trend: raw.trend || null,
        trendUp: raw.trendUp !== undefined ? raw.trendUp : raw.trend_up ?? true,
      };
    }
    return { value: String(raw), trend: null, trendUp: true };
  }

  const metricCards = [
    {
      icon: Calendar,
      label: "Total Events",
      value: metrics.total_events.value,
      trend: metrics.total_events.trend,
      trendUp: metrics.total_events.trendUp,
      color: "blue",
    },
    {
      icon: Users,
      label: "Total Attendees",
      value: metrics.total_attendees.value,
      trend: metrics.total_attendees.trend,
      trendUp: metrics.total_attendees.trendUp,
      color: "green",
    },
    {
      icon: IndianRupee,
      label: "Total Revenue",
      value: metrics.total_revenue.value,
      trend: metrics.total_revenue.trend,
      trendUp: metrics.total_revenue.trendUp,
      color: "purple",
    },
    {
      icon: Star,
      label: "Avg. Rating",
      value: metrics.avg_rating.value,
      trend: metrics.avg_rating.trend,
      trendUp: metrics.avg_rating.trendUp,
      color: "amber",
    },
  ];

  return (
    <div className="w-full min-w-0 max-w-full space-y-5 overflow-hidden">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <AnimatedGreeting />
          <p className="mt-1 text-sm text-theme-muted">
            Here's what's happening with your events today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 text-xs font-medium text-theme-muted sm:flex">
            <Calendar size={14} />
            <LiveDate />
          </div>
          <button
            type="button"
            onClick={() => onPageChange("events")}
            className="btn-primary shrink-0"
          >
            <Plus size={16} />
            Create New Event
          </button>
        </div>
      </div>

      {/* ================= METRICS ================= */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((m, idx) => (
          <MetricCard
            key={m.label}
            icon={m.icon}
            label={m.label}
            value={m.value}
            trend={m.trend}
            trendUp={m.trendUp}
            color={m.color}
            delay={`stagger-${idx + 1}`}
          />
        ))}
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="min-w-0 space-y-5">
          <UpcomingEvents onViewAll={() => onPageChange("events")} />
        </div>

        <div className="min-w-0 space-y-5">
          <AttendeeChart />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <CategoryChart />
            <RecentActivity />
          </div>
        </div>
      </div>

      {/* ================= PROMO BANNER ================= */}
      <PromoBanner onGetStarted={() => onPageChange("events")} />
    </div>
  );
}

export default Home;