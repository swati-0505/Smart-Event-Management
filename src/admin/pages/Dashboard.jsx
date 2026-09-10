// Dashboard.jsx
// This component displays the admin dashboard.
// It fetches metrics from the dashboard service and displays them.
// Later, this data will come from the backend API.

import { useState, useEffect } from "react";
import StatCard from "../components/dashboard/StatCard";
import UpcomingEvents from "../components/dashboard/UpcomingEvents";
import RecentRegistrations from "../components/dashboard/RecentRegistrations";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import { getDashboardMetrics } from "../services/dashboardService";

function Dashboard({ searchQuery = "" }) {
  // State for dashboard metrics
  const [metrics, setMetrics] = useState({
    total_events: 0,
    total_registrations: 0,
    total_venues: 0,
    upcoming_events: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dashboard metrics on component mount
  useEffect(() => {
    loadMetrics();
  }, []);

  // Function to load dashboard metrics from service
  async function loadMetrics() {
    try {
      setLoading(true);
      setError(null);

      // Call service to get metrics
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Error loading dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Page header */}
      <header className="mb-7 sm:mb-9">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Overview
        </p>

        <h1 className="admin-page-title mt-2 text-[28px] font-semibold text-theme-primary sm:text-[34px]">
          Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-theme-muted">
          Overview of your event operations and recent activity.
        </p>
      </header>

      {/* Loading state */}
      {loading && (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="admin-metric h-[100px] animate-pulse bg-theme-primary/5" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-md border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Metrics grid */}
      {!loading && !error && (
        <section className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <StatCard
            label="Total Events"
            value={metrics.total_events}
            note="+4 this month"
          />

          <StatCard
            label="Registrations"
            value={metrics.total_registrations}
            note="+12%"
          />

          <StatCard
            label="Active Venues"
            value={metrics.total_venues}
            note="2 available"
          />

          <StatCard
            label="Upcoming Events"
            value={metrics.upcoming_events}
            note="Next 30 days"
          />
        </section>
      )}

      <section className="mt-6 sm:mt-7">
        <UpcomingEvents searchQuery={searchQuery} />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <RecentRegistrations />
        <ActivityFeed />
      </section>
    </div>
  );
}

export default Dashboard;