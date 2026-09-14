// CalendarPage.jsx
// Fully responsive calendar — mobile/tablet/desktop optimized.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Search, SlidersHorizontal,
  Sparkles, Clock, MapPin, ArrowRight, X, Check, RefreshCw,
} from "lucide-react";
import { getCalendarEvents, getUpcomingEvents } from "../services/calendarService";
import Modal from "../components/common/Modal";

/* ---------------- Constants ---------------- */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

const VIEW_MODES = [
  { key: "yearly", label: "Year" },
  { key: "monthly", label: "Month" },
  { key: "weekly", label: "Week" },
  { key: "daily", label: "Day" },
];

const CATEGORIES = [
  { name: "Office", dot: "bg-blue-500" },
  { name: "International", dot: "bg-indigo-500" },
  { name: "Personal", dot: "bg-emerald-500" },
  { name: "Misc", dot: "bg-pink-500" },
  { name: "Holiday", dot: "bg-orange-500" },
  { name: "Missed", dot: "bg-gray-400" },
];

const STATUS_OPTIONS = [
  { key: "all", label: "All" },
  { key: "confirmed", label: "Confirmed" },
  { key: "pending", label: "Pending" },
];

const PERIOD_OPTIONS = [
  { key: "all", label: "All time" },
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
];

/* ---------------- Helpers ---------------- */

function toMondayIndex(date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function eventKey(year, month, day) {
  return `${year}-${month + 1}-${day}`;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* ---------------- Component ---------------- */

function CalendarPage() {
  const today = new Date();

  const [eventsMap, setEventsMap] = useState({});
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cursor, setCursor] = useState(new Date(2026, 5, 18));
  const [view, setView] = useState("monthly");
  const [selectedDay, setSelectedDay] = useState(18);

  const [search, setSearch] = useState("");
  const [activeCategories, setActiveCategories] = useState(CATEGORIES.map((c) => c.name));
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const filterRef = useRef(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [eventsRes, upcomingRes] = await Promise.all([
        getCalendarEvents(),
        getUpcomingEvents(3),
      ]);
      setEventsMap(eventsRes.events || {});
      setUpcoming(upcomingRes || []);
    } catch (err) {
      setError("Failed to load calendar. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function onClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterPanel(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function shift(step) {
    const next = new Date(cursor);
    if (view === "daily") next.setDate(next.getDate() + step);
    else if (view === "weekly") next.setDate(next.getDate() + step * 7);
    else if (view === "monthly") next.setMonth(next.getMonth() + step);
    else next.setFullYear(next.getFullYear() + step);
    setCursor(next);
  }

  function jumpToday() {
    const now = new Date();
    setCursor(now);
    setSelectedDay(now.getDate());
  }

  function toggleCategory(name) {
    setActiveCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  function resetFilters() {
    setSearch("");
    setActiveCategories(CATEGORIES.map((c) => c.name));
    setStatusFilter("all");
    setPeriodFilter("all");
  }

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (statusFilter !== "all") count++;
    if (periodFilter !== "all") count++;
    if (activeCategories.length !== CATEGORIES.length) count++;
    return count;
  }, [search, statusFilter, periodFilter, activeCategories]);

  const filteredEvents = useMemo(() => {
    const out = {};
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    Object.entries(eventsMap).forEach(([key, list]) => {
      const filtered = list.filter((e) => {
        if (!activeCategories.includes(e.category)) return false;
        if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (statusFilter !== "all" && e.status !== statusFilter) return false;

        if (periodFilter !== "all") {
          const [y, m, d] = key.split("-").map(Number);
          const eventDate = new Date(y, m - 1, d);
          const diffDays = Math.floor((eventDate - todayMidnight) / (1000 * 60 * 60 * 24));
          if (periodFilter === "today" && diffDays !== 0) return false;
          if (periodFilter === "week" && (diffDays < 0 || diffDays > 7)) return false;
          if (periodFilter === "month" && (diffDays < 0 || diffDays > 30)) return false;
        }
        return true;
      });
      if (filtered.length) out[key] = filtered;
    });
    return out;
  }, [eventsMap, activeCategories, search, statusFilter, periodFilter]);

  function getFilteredEvents(y, m, d) {
    return filteredEvents[eventKey(y, m, d)] || [];
  }

  const subtitle = useMemo(() => {
    if (view === "yearly") return `${year}`;
    if (view === "monthly") {
      const last = new Date(year, month + 1, 0).getDate();
      return `${MONTHS_SHORT[month]} 01 - ${MONTHS_SHORT[month]} ${last}, ${year}`;
    }
    if (view === "weekly") {
      const start = new Date(cursor);
      start.setDate(start.getDate() - toMondayIndex(start));
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()} - ${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    }
    return cursor.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [view, cursor, year, month]);

  /* ============ LOADING ============ */
  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-2xl bg-theme-tertiary" />
          <div className="h-64 animate-pulse rounded-2xl bg-theme-tertiary" />
        </div>
        <div className="h-[600px] animate-pulse rounded-2xl bg-theme-tertiary" />
      </div>
    );
  }

  /* ============ ERROR ============ */
  if (error) {
    return (
      <div className="card flex flex-col items-center gap-3 p-12 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button type="button" onClick={loadData} className="btn-primary">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  /* ============ VIEWS ============ */

  function YearView() {
    return (
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {MONTHS_SHORT.map((name, mi) => {
            const days = new Date(year, mi + 1, 0).getDate();
            const firstIdx = toMondayIndex(new Date(year, mi, 1));
            const cells = [];
            for (let i = 0; i < firstIdx; i++) cells.push(null);
            for (let d = 1; d <= days; d++) cells.push(d);

            return (
              <button
                key={mi}
                type="button"
                onClick={() => {
                  setCursor(new Date(year, mi, 1));
                  setView("monthly");
                }}
                className="group rounded-xl border border-theme bg-theme-secondary p-3 text-left transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-theme-primary">{name}</p>
                  <ArrowRight size={11} className="text-theme-dim opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="grid grid-cols-7 gap-px">
                  {WEEKDAYS_SHORT.map((d, i) => (
                    <span key={i} className="text-center text-[7px] font-bold text-theme-dim">{d}</span>
                  ))}
                  {cells.map((day, i) => {
                    if (day === null) return <span key={i} />;
                    const has = getFilteredEvents(year, mi, day).length > 0;
                    const isToday = isSameDay(new Date(year, mi, day), today);
                    return (
                      <span
                        key={i}
                        className={[
                          "flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] font-semibold",
                          isToday ? "bg-indigo-600 text-white" : has ? "bg-indigo-100 text-indigo-600" : "text-theme-dim",
                        ].join(" ")}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function MonthView() {
    const days = new Date(year, month + 1, 0).getDate();
    const firstIdx = toMondayIndex(new Date(year, month, 1));
    const cells = [];
    for (let i = 0; i < firstIdx; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    const tail = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < tail; i++) cells.push(null);

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 border-b border-theme">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className="border-r border-theme py-2 text-center text-[9px] font-bold uppercase tracking-wider text-theme-muted last:border-r-0 sm:text-[10px] sm:py-2.5"
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={idx}
                  className="min-h-[60px] border-b border-r border-theme bg-theme-tertiary/40 sm:min-h-[90px] lg:min-h-[110px]"
                />
              );
            }

            const list = getFilteredEvents(year, month, day);
            const isToday = isSameDay(new Date(year, month, day), today);
            const isSelected = day === selectedDay;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={[
                  "group relative flex min-h-[60px] flex-col border-b border-r border-theme p-1 text-left transition-colors sm:min-h-[90px] sm:p-1.5 lg:min-h-[110px] lg:p-2",
                  isSelected ? "bg-indigo-50/60" : "hover:bg-theme-hover",
                ].join(" ")}
              >
                <div className="mb-0.5 flex items-center justify-between sm:mb-1">
                  <span
                    className={[
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold sm:h-6 sm:w-6 sm:text-[11px]",
                      isToday ? "bg-indigo-600 text-white shadow-sm"
                        : isSelected ? "bg-indigo-100 text-indigo-700"
                        : "text-theme-primary",
                    ].join(" ")}
                  >
                    {day}
                  </span>
                  {list.length > 0 && (
                    <span className="text-[8px] font-semibold text-theme-dim sm:text-[9px]">
                      {list.length > 3 ? list.length : ""}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-0.5 sm:gap-1">
                  {/* Desktop: show event text */}
                  {list.slice(0, 3).map((ev, i) => (
                    <div
                      key={i}
                      className={`hidden truncate rounded px-1.5 py-[3px] text-[9px] font-semibold text-white sm:block ${ev.color}`}
                    >
                      {ev.time} {ev.title}
                    </div>
                  ))}

                  {/* Mobile: show dots only */}
                  <div className="flex flex-wrap gap-0.5 sm:hidden">
                    {list.slice(0, 4).map((ev, i) => (
                      <span key={i} className={`h-1.5 w-1.5 rounded-full ${ev.color}`} />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function WeekView() {
    const start = new Date(cursor);
    start.setDate(start.getDate() - toMondayIndex(start));

    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });

    const hours = Array.from({ length: 15 }, (_, i) => i + 7);

    return (
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-[640px]">
          <div className="sticky top-0 z-10 grid grid-cols-[48px_repeat(7,1fr)] border-b border-theme bg-theme-secondary sm:grid-cols-[64px_repeat(7,1fr)]">
            <div className="border-r border-theme" />
            {week.map((d, i) => {
              const isToday = isSameDay(d, today);
              return (
                <div key={i} className="border-r border-theme py-2 text-center last:border-r-0 sm:py-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-theme-muted sm:text-[10px]">
                    {WEEKDAYS[i]}
                  </p>
                  <p
                    className={[
                      "mx-auto mt-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7 sm:text-sm",
                      isToday ? "bg-indigo-600 text-white" : "text-theme-primary",
                    ].join(" ")}
                  >
                    {d.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          {hours.map((h) => (
            <div key={h} className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-theme sm:grid-cols-[64px_repeat(7,1fr)]">
              <div className="border-r border-theme py-2 pr-1 text-right sm:pr-2">
                <span className="text-[9px] font-medium text-theme-muted sm:text-[10px]">
                  {h > 12 ? h - 12 : h} {h >= 12 ? "P" : "A"}
                </span>
              </div>
              {week.map((d, i) => {
                const hourEvents = getFilteredEvents(d.getFullYear(), d.getMonth(), d.getDate())
                  .filter((e) => parseInt(e.time.split(":")[0]) === h);
                return (
                  <div key={i} className="min-h-[48px] border-r border-theme p-0.5 last:border-r-0 sm:min-h-[56px] sm:p-1">
                    {hourEvents.map((ev, j) => (
                      <div
                        key={j}
                        className={`truncate rounded-md px-1 py-0.5 text-[9px] font-semibold text-white sm:px-1.5 sm:py-1 sm:text-[10px] ${ev.color}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function DayView() {
    const events = getFilteredEvents(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
    const hours = Array.from({ length: 15 }, (_, i) => i + 7);

    return (
      <div className="flex-1 overflow-y-auto">
        {hours.map((h) => {
          const hourEvents = events.filter((e) => parseInt(e.time.split(":")[0]) === h);
          return (
            <div key={h} className="flex border-b border-theme last:border-b-0">
              <div className="w-14 shrink-0 py-2 pr-2 text-right sm:w-20 sm:py-3 sm:pr-3">
                <span className="text-[10px] font-medium text-theme-muted sm:text-[11px]">
                  {h > 12 ? h - 12 : h} {h >= 12 ? "PM" : "AM"}
                </span>
              </div>
              <div className="min-h-[56px] flex-1 border-l border-theme p-2 pl-3 sm:min-h-[64px] sm:pl-4">
                {hourEvents.map((ev, i) => (
                  <div
                    key={i}
                    className={`mb-2 flex items-center gap-3 rounded-lg ${ev.color} px-3 py-2 text-white shadow-sm sm:px-4 sm:py-2.5`}
                  >
                    <div className="flex-1">
                      <p className="text-xs font-bold sm:text-sm">{ev.title}</p>
                      <p className="mt-0.5 text-[10px] opacity-90">
                        {ev.time} · {ev.duration} · {ev.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ============ SIDEBAR PANEL (LEFT) ============ */
  function LeftPanel() {
    return (
      <div className="space-y-4">
        {/* Create event */}
        <div className="rounded-2xl border border-theme bg-theme-secondary p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-md">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-theme-primary">Create Event</p>
              <p className="text-[11px] text-theme-muted">Host and manage events</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateEvent(true)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:scale-[0.98]"
          >
            <Plus size={14} />
            Create Event
          </button>
        </div>

        <MiniCalendar />

        {/* Categories */}
        <div className="rounded-2xl border border-theme bg-theme-secondary p-4">
          <p className="mb-3 text-sm font-bold text-theme-primary">Categories</p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => {
              const active = activeCategories.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggleCategory(c.name)}
                  className={[
                    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-medium transition",
                    active ? "text-theme-secondary" : "text-theme-dim opacity-60",
                  ].join(" ")}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${c.dot} transition ${active ? "opacity-100" : "opacity-40"}`} />
                  <span className="truncate">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming */}
        <div className="rounded-2xl border border-theme bg-theme-secondary p-4">
          <p className="text-sm font-bold text-theme-primary">Upcoming Events</p>
          <p className="mt-0.5 mb-3 flex items-center gap-1 text-[10px] text-theme-muted">
            <Clock size={10} />
            Don't miss scheduled events
          </p>

          <div className="space-y-3">
            {upcoming.map((e, i) => (
              <div
                key={e.id || i}
                className="relative overflow-hidden rounded-xl border border-theme bg-theme-tertiary p-3 transition hover:border-indigo-200"
              >
                <div className={`absolute left-0 top-0 h-full w-1 ${e.color}`} />
                <div className="ml-2">
                  <div className="flex items-center justify-between text-[9px] text-theme-muted">
                    <span className="flex items-center gap-1">
                      <Clock size={9} />
                      {e.time}
                    </span>
                    <span>{e.date}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-snug text-theme-primary">
                    {e.title}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-theme-muted">
                    <MapPin size={9} />
                    {e.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ============ MINI CALENDAR ============ */
  function MiniCalendar() {
    const days = new Date(year, month + 1, 0).getDate();
    const firstIdx = toMondayIndex(new Date(year, month, 1));
    const cells = [];
    for (let i = 0; i < firstIdx; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);

    return (
      <div className="rounded-2xl border border-theme bg-theme-secondary p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-theme-primary">
            {MONTHS[month]} {year}
          </p>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="rounded-md p-1 text-theme-muted transition hover:bg-theme-hover"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="rounded-md p-1 text-theme-muted transition hover:bg-theme-hover"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS_SHORT.map((d, i) => (
            <span key={i} className="text-center text-[9px] font-bold text-theme-dim">{d}</span>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <span key={i} />;
            const has = getFilteredEvents(year, month, day).length > 0;
            const isToday = isSameDay(new Date(year, month, day), today);
            const isSel = day === selectedDay;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={[
                  "relative flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-semibold transition",
                  isSel ? "bg-indigo-600 text-white shadow-sm"
                    : isToday ? "bg-indigo-100 text-indigo-700"
                    : "text-theme-secondary hover:bg-theme-hover",
                ].join(" ")}
              >
                {day}
                {has && !isSel && (
                  <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ============ FILTER PANEL ============ */
  function FilterPanel() {
    return (
      <div
        ref={filterRef}
        className="animate-scale-in absolute right-0 top-full z-30 mt-2 w-[calc(100vw-1.5rem)] max-w-xs overflow-hidden rounded-xl border border-theme bg-theme-secondary shadow-xl sm:w-72"
      >
        <div className="flex items-center justify-between border-b border-theme px-4 py-3">
          <p className="text-sm font-bold text-theme-primary">Filters</p>
          <button type="button" onClick={() => setShowFilterPanel(false)} className="text-theme-muted hover:text-theme-primary">
            <X size={14} />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-theme-dim">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatusFilter(s.key)}
                  className={[
                    "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition",
                    statusFilter === s.key
                      ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                      : "border-theme bg-theme-tertiary text-theme-secondary",
                  ].join(" ")}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-theme-dim">Period</p>
            <div className="flex flex-wrap gap-1.5">
              {PERIOD_OPTIONS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriodFilter(p.key)}
                  className={[
                    "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition",
                    periodFilter === p.key
                      ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                      : "border-theme bg-theme-tertiary text-theme-secondary",
                  ].join(" ")}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-theme-dim">Categories</p>
            <div className="space-y-1.5">
              {CATEGORIES.map((c) => {
                const active = activeCategories.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggleCategory(c.name)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium text-theme-secondary transition hover:bg-theme-hover"
                  >
                    <span className={[
                      "flex h-4 w-4 items-center justify-center rounded border transition",
                      active ? "border-indigo-500 bg-indigo-500 text-white" : "border-theme bg-theme-tertiary",
                    ].join(" ")}>
                      {active && <Check size={10} strokeWidth={3} />}
                    </span>
                    <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                    <span className="flex-1">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-theme px-4 py-3">
          <button type="button" onClick={resetFilters} className="text-[11px] font-semibold text-theme-muted hover:text-theme-primary">
            Reset all
          </button>
          <button
            type="button"
            onClick={() => setShowFilterPanel(false)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700"
          >
            Apply
          </button>
        </div>
      </div>
    );
  }

  /* ============ MAIN RENDER ============ */
  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      {/* LEFT PANEL — mobile: drawer toggle, desktop: always visible */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setShowMobileSidebar(true)}
          className="btn-secondary w-full text-xs"
        >
          <Sparkles size={14} />
          Show Options
        </button>

        {showMobileSidebar && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileSidebar(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="animate-slide-in-right absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-theme-primary p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-theme-primary">Options</h2>
                <button type="button" onClick={() => setShowMobileSidebar(false)} className="btn-ghost">
                  <X size={18} />
                </button>
              </div>
              <LeftPanel />
            </div>
          </div>
        )}
      </div>

      {/* Desktop Left Panel */}
      <div className="hidden lg:block">
        <LeftPanel />
      </div>

      {/* MAIN CALENDAR */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-theme bg-theme-secondary">
        {/* Toolbar — responsive */}
        <div className="flex flex-col gap-3 border-b border-theme p-3 sm:p-4">
          {/* Top row: title + nav */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-theme-primary sm:text-base">
                {MONTHS[month]}, {year}
              </p>
              <p className="truncate text-[10px] text-theme-muted">{subtitle}</p>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => shift(-1)}
                className="rounded-lg border border-theme p-1.5 text-theme-muted transition hover:bg-theme-hover sm:p-2"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={jumpToday}
                className="rounded-lg border border-theme px-2.5 py-1.5 text-[11px] font-semibold text-theme-secondary transition hover:bg-theme-hover sm:px-3"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => shift(1)}
                className="rounded-lg border border-theme p-1.5 text-theme-muted transition hover:bg-theme-hover sm:p-2"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Second row: search + filter + views */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[140px] sm:max-w-[200px]">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events"
                className="w-full rounded-lg border border-theme bg-theme-tertiary py-1.5 pl-7 pr-2 text-[11px] text-theme-primary outline-none placeholder:text-theme-dim focus:border-indigo-400"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilterPanel((v) => !v)}
                className={[
                  "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition",
                  activeFilterCount > 0
                    ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                    : "border-theme text-theme-secondary hover:bg-theme-hover",
                ].join(" ")}
              >
                <SlidersHorizontal size={11} />
                <span className="hidden sm:inline">Filter</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {showFilterPanel && <FilterPanel />}
            </div>

            {/* Views */}
            <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-theme bg-theme-tertiary p-0.5">
              {VIEW_MODES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setView(v.key)}
                  className={[
                    "rounded-md px-2 py-1 text-[10px] font-semibold transition sm:px-2.5",
                    view === v.key
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-theme-muted hover:text-theme-primary",
                  ].join(" ")}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View content */}
        <div className="flex flex-1 flex-col">
          {view === "yearly" && <YearView />}
          {view === "monthly" && <MonthView />}
          {view === "weekly" && <WeekView />}
          {view === "daily" && <DayView />}
        </div>
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateEvent}
        onClose={() => setShowCreateEvent(false)}
        title="Create New Event"
        maxWidth="max-w-2xl"
      >
        <CreateEventForm onClose={() => setShowCreateEvent(false)} />
      </Modal>
    </div>
  );
}

/* ============================================================
   Create Event Form
   ============================================================ */
function CreateEventForm({ onClose }) {
  const [form, setForm] = useState({
    title: "", date: "", time: "", venue: "", capacity: "", category: "Office",
  });
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    alert(`✅ Event "${form.title}" created successfully!`);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">Event Title</label>
        <input
          type="text" required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g., Tech Fest 2025"
          className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">Date</label>
          <input type="date" required value={form.date} onChange={(e) => update("date", e.target.value)}
            className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">Time</label>
          <input type="time" required value={form.time} onChange={(e) => update("time", e.target.value)}
            className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">Venue</label>
          <input type="text" required value={form.venue} onChange={(e) => update("venue", e.target.value)}
            placeholder="e.g., Auditorium"
            className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">Capacity</label>
          <input type="number" required value={form.capacity} onChange={(e) => update("capacity", e.target.value)}
            placeholder="500"
            className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">Category</label>
        <select value={form.category} onChange={(e) => update("category", e.target.value)}
          className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400">
          <option>Office</option>
          <option>International</option>
          <option>Personal</option>
          <option>Misc</option>
          <option>Holiday</option>
        </select>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-3">
        <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50 sm:w-auto">
          {saving ? "Creating..." : "Create Event"}
        </button>
      </div>
    </form>
  );
}

export default CalendarPage;