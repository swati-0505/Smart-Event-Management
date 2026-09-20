// Home.jsx
// Dashboard — metrics, upcoming events, quick access, goals, reminders.
// Home.jsx
// Dashboard — metrics, upcoming events, quick access, goals, reminders.

import {
  Calendar,
  Users,
  UserPlus,
  Sparkles,
  Plus,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";

import MetricCard from "../components/dashboard/MetricCard";
import UpcomingEvents from "../components/dashboard/UpcomingEvents";
import QuickAccess from "../components/dashboard/QuickAccess";
import Goals from "../components/dashboard/Goals";
import Reminders from "../components/dashboard/Reminders";

/* -------------------- Animated Greeting -------------------- */

function AnimatedGreeting() {
  const fullText = "Hello, Admin";

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
    }, 70);

    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="mt-1 text-3xl font-bold text-theme-primary sm:text-4xl">
      <span className="inline-block">
        {displayed}

        {!done && (
          <span className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-indigo-500 align-middle" />
        )}
      </span>

      {done && (
        <span className="ml-2 inline-block animate-[wave_1.5s_ease-in-out_infinite] origin-[70%_70%]">
          👋
        </span>
      )}
    </h1>
  );
}

/* -------------------- Live Date -------------------- */

function LiveDate() {
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    function updateDate() {
      const now = new Date();

      setDateLabel(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
    }

    updateDate();

    const interval = setInterval(updateDate, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-sm font-medium text-theme-muted">
      {dateLabel}
    </p>
  );
}

/* -------------------- Home -------------------- */

function Home({ onPageChange }) {
  return (
    <div className="w-full min-w-0 max-w-full space-y-10 overflow-hidden">

      {/* ================= HEADER ================= */}

      <div className="flex w-full min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">

        {/* Greeting */}
        <div className="min-w-0 flex-1">
          <LiveDate />

          <AnimatedGreeting />

          <p className="mt-1.5 text-sm text-theme-muted">
            Here's what's happening with your events today.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex min-w-0 flex-wrap items-center gap-2 xl:justify-end">
          <button
            type="button"
            onClick={() => onPageChange("events")}
            className="btn-primary shrink-0"
          >
            <Plus size={16} />
            Create Event
          </button>

          <button
            type="button"
            onClick={() => onPageChange("registrations")}
            className="btn-secondary shrink-0"
          >
            <ClipboardList size={16} />
            View Registrations
          </button>

          <button
            type="button"
            onClick={() => onPageChange("users")}
            className="btn-secondary shrink-0"
          >
            <UserPlus size={16} />
            Add User
          </button>

          <button
            type="button"
            onClick={() => onPageChange("reports")}
            className="btn-secondary shrink-0"
          >
            <BarChart3 size={16} />
            Generate Report
          </button>
        </div>
      </div>

      {/* ================= METRICS ================= */}

      <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="min-w-0">
          <MetricCard
            icon={Calendar}
            label="Total Events"
            value="12"
            trend="+20%"
            trendLabel="vs. last month"
            iconColor="indigo"
            delay="stagger-1"
          />
        </div>

        <div className="min-w-0">
          <MetricCard
            icon={Users}
            label="Total Registrations"
            value="1,248"
            trend="+15%"
            trendLabel="vs. last month"
            iconColor="blue"
            delay="stagger-2"
          />
        </div>

        <div className="min-w-0">
          <MetricCard
            icon={UserPlus}
            label="Active Users"
            value="956"
            trend="+32%"
            trendLabel="vs. last month"
            iconColor="green"
            delay="stagger-3"
          />
        </div>

        <div className="min-w-0">
          <MetricCard
            icon={Sparkles}
            label="AI Assistant"
            value="24"
            trendLabel="Queries this week"
            iconColor="purple"
            delay="stagger-4"
          />
        </div>
      </div>

      {/* ================= MAIN DASHBOARD ================= */}

      <div className="grid w-full min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

        {/* Left Column */}
        <div className="min-w-0 space-y-10">
          <UpcomingEvents
            onViewAll={() => onPageChange("events")}
          />

          <QuickAccess
            onNavigate={onPageChange}
          />

          <Goals />
        </div>

        {/* Right Column */}
        <div className="min-w-0 space-y-10">
          <Reminders />
        </div>

      </div>
    </div>
  );
}

export default Home;