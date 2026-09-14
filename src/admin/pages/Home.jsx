// Home.jsx
// Dashboard — animated greeting with rolling text + ghost.

import {
  Calendar, Users, UserPlus, Sparkles, Plus,
  ClipboardList, BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import MetricCard from "../components/dashboard/MetricCard";
import UpcomingEvents from "../components/dashboard/UpcomingEvents";
import QuickAccess from "../components/dashboard/QuickAccess";
import Goals from "../components/dashboard/Goals";
import Reminders from "../components/dashboard/Reminders";

/* -------------------- Ghost Animation -------------------- */
function Ghost() {
  return (
    <span className="ghost" aria-hidden="true">
      <span className="ghost__body">
        {/* Pupils + eyes (rendered behind body grid) */}
        <span className="ghost__pupil ghost__pupil--left" />
        <span className="ghost__pupil ghost__pupil--right" />
        <span className="ghost__eye ghost__eye--left" />
        <span className="ghost__eye ghost__eye--right" />

        {/* Head top blocks */}
        <span className="ghost__top ghost__top--0" />
        <span className="ghost__top ghost__top--1" />
        <span className="ghost__top ghost__top--2" />
        <span className="ghost__top ghost__top--3" />
        <span className="ghost__top ghost__top--4" />

        {/* Bottom strips */}
        <span className="ghost__st ghost__st--0" />
        <span className="ghost__st ghost__st--1" />
        <span className="ghost__st ghost__st--2" />
        <span className="ghost__st ghost__st--3" />
        <span className="ghost__st ghost__st--4" />
        <span className="ghost__st ghost__st--5" />

        {/* Flickering tails (18) */}
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className={`ghost__an ghost__an--${i + 1}`} />
        ))}
      </span>
      <span className="ghost__shadow" />
    </span>
  );
}

/* -------------------- Animated Greeting -------------------- */
function AnimatedGreeting() {
  const fullText = "Hello, ";
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

  // Rolling words for the second part
  const rollingWords = ["Admin", "User", "Manager", "Organizer", "Admin"];

  return (
    <h1 className="mt-1 flex flex-wrap items-center gap-x-2 text-2xl font-extrabold tracking-tight text-theme-primary sm:text-3xl md:text-4xl lg:text-[42px]">
      {/* Typing part */}
      <span className="inline-block">
        {displayed}
        {!done && (
          <span className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-indigo-500 align-middle" />
        )}
      </span>

      {/* Rolling words */}
      {done && (
        <span className="rolling-words">
          {rollingWords.map((word, i) => (
            <span key={i} className="rolling-words__item">
              {word}
            </span>
          ))}
        </span>
      )}

      {/* Ghost */}
      {done && <Ghost />}
    </h1>
  );
}

/* -------------------- Live Date -------------------- */
function LiveDate() {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function update() {
      setLabel(
        new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
    }
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-theme-dim sm:text-xs">
      {label}
    </p>
  );
}

/* -------------------- Home -------------------- */
function Home({ onPageChange }) {
  const actionButtons = [
    { label: "Create Event", short: "Create", page: "events", icon: Plus, primary: true },
    { label: "View Registrations", short: "Registrations", page: "registrations", icon: ClipboardList },
    { label: "Add User", short: "Add User", page: "users", icon: UserPlus },
    { label: "Generate Report", short: "Reports", page: "reports", icon: BarChart3 },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ============ HEADER ============ */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <LiveDate />
          <AnimatedGreeting />
          <p className="mt-2 text-sm leading-6 text-theme-muted sm:text-[15px]">
            Here's what's happening with your events today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {actionButtons.map((btn, i) => {
            const Icon = btn.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onPageChange(btn.page)}
                className={`${btn.primary ? "btn-primary" : "btn-secondary"} text-xs sm:text-sm`}
              >
                <Icon size={14} />
                <span className="sm:hidden">{btn.short}</span>
                <span className="hidden sm:inline">{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============ METRICS ============ */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <MetricCard
          icon={Calendar}
          label="Total Events"
          value="12"
          trend="+20%"
          trendLabel="vs. last month"
          iconColor="indigo"
          delay="stagger-1"
        />
        <MetricCard
          icon={Users}
          label="Total Registrations"
          value="1,248"
          trend="+15%"
          trendLabel="vs. last month"
          iconColor="blue"
          delay="stagger-2"
        />
        <MetricCard
          icon={UserPlus}
          label="Active Users"
          value="956"
          trend="+32%"
          trendLabel="vs. last month"
          iconColor="green"
          delay="stagger-3"
        />
        <MetricCard
          icon={Sparkles}
          label="AI Assistant"
          value="24"
          trendLabel="Queries this week"
          iconColor="purple"
          delay="stagger-4"
        />
      </div>

      {/* ============ MAIN GRID ============ */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5 sm:space-y-6">
          <UpcomingEvents onViewAll={() => onPageChange("events")} />
          <QuickAccess onNavigate={onPageChange} />
          <Goals />
        </div>

        <div className="space-y-5 sm:space-y-6">
          <Reminders />
        </div>
      </div>
    </div>
  );
}

export default Home;