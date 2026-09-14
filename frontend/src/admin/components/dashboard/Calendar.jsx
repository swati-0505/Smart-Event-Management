// CalendarPage.jsx
// Full-page calendar with Day / Week / Month / Year views.
// Layout: left panel (create, mini calendar, categories, upcoming) + main grid.

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  ArrowRight,
} from "lucide-react";

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

const VIEW_MODES = [
  { key: "yearly", label: "Year" },
  { key: "monthly", label: "Month" },
  { key: "weekly", label: "Week" },
  { key: "daily", label: "Day" },
];

const CATEGORIES = [
  { name: "Office", color: "bg-blue-500", dot: "bg-blue-500" },
  { name: "International", color: "bg-indigo-500", dot: "bg-indigo-500" },
  { name: "Personal", color: "bg-emerald-500", dot: "bg-emerald-500" },
  { name: "Misc", color: "bg-pink-500", dot: "bg-pink-500" },
  { name: "Holiday", color: "bg-orange-500", dot: "bg-orange-500" },
  { name: "Missed", color: "bg-gray-400", dot: "bg-gray-400" },
];

/* ---------------- Mock data ---------------- */

// Key format: "YYYY-M-D"
const EVENTS = {
  "2026-6-3": [
    { title: "Team Discussion", time: "09:00", duration: "1h", color: "bg-emerald-500", category: "Office" },
  ],
  "2026-6-5": [
    { title: "Client Meeting", time: "10:00", duration: "1h", color: "bg-purple-500", category: "International" },
  ],
  "2026-6-7": [
    { title: "Sprint Planning", time: "11:00", duration: "2h", color: "bg-blue-500", category: "Office" },
    { title: "Lunch with Team", time: "13:00", duration: "1h", color: "bg-emerald-500", category: "Personal" },
  ],
  "2026-6-11": [
    { title: "Interview Round", time: "09:00", duration: "1h", color: "bg-purple-500", category: "Office" },
    { title: "Design Review", time: "14:00", duration: "1h", color: "bg-emerald-500", category: "Personal" },
  ],
  "2026-6-12": [
    { title: "Real Estate Call", time: "09:00", duration: "1h", color: "bg-emerald-500", category: "Office" },
    { title: "Mid Year Report", time: "08:30", duration: "2h", color: "bg-blue-500", category: "Misc" },
  ],
  "2026-6-16": [
    { title: "Quarterly Review", time: "09:00", duration: "2h", color: "bg-purple-500", category: "Office" },
  ],
  "2026-6-17": [
    { title: "Product Demo", time: "09:00", duration: "1h", color: "bg-blue-500", category: "Personal" },
  ],
  "2026-6-18": [
    { title: "Birthday Event", time: "09:00", duration: "1h", color: "bg-emerald-500", category: "Personal" },
    { title: "Client Call", time: "11:00", duration: "1h", color: "bg-pink-500", category: "International" },
    { title: "Team Outing", time: "15:00", duration: "3h", color: "bg-orange-500", category: "Holiday" },
  ],
  "2026-6-19": [
    { title: "Property Tour", time: "09:00", duration: "1h", color: "bg-purple-500", category: "Office" },
    { title: "Conference", time: "13:00", duration: "4h", color: "bg-blue-500", category: "Misc" },
  ],
  "2026-6-22": [
    { title: "Team Interview", time: "09:00", duration: "1h", color: "bg-emerald-500", category: "Office" },
  ],
  "2026-6-24": [
    { title: "Team Lunch", time: "12:00", duration: "1h", color: "bg-blue-500", category: "Office" },
  ],
  "2026-6-25": [
    { title: "Strategy Meeting", time: "09:00", duration: "2h", color: "bg-purple-500", category: "Personal" },
  ],
  "2026-6-26": [
    { title: "Product Launch", time: "10:00", duration: "3h", color: "bg-purple-500", category: "Office" },
  ],
  "2026-6-30": [
    { title: "Monthly Reporting", time: "09:00", duration: "2h", color: "bg-pink-500", category: "Office" },
  ],
};

const UPCOMING_EVENTS = [
  {
    time: "09:00 - 12:00",
    date: "18 June, 2026",
    title: "Next Quarterly Staff Briefing: Company Growth & Future Market Trends",
    location: "Cornevie, New York",
    color: "bg-emerald-500",
  },
  {
    time: "13:00 - 14:00",
    date: "18 June, 2026",
    title: "Zoom Meeting With Our Paris Branch: Ways To Attract More Customers",
    location: "Online, Zoom",
    color: "bg-purple-500",
  },
  {
    time: "10:00 - 11:30",
    date: "20 June, 2026",
    title: "Design System Review: Component Library v2 Updates",
    location: "Design Studio, Floor 3",
    color: "bg-indigo-500",
  },
];

/* ---------------- Helpers ---------------- */

// Convert Sunday=0 to Monday-based index (Monday=0, Sunday=6)
function toMondayIndex(date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function eventKey(year, month, day) {
  return `${year}-${month + 1}-${day}`;
}

function formatDateKey(date) {
  return eventKey(date.getFullYear(), date.getMonth(), date.getDate());
}

function getEvents(year, month, day) {
  return EVENTS[eventKey(year, month, day)] || [];
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

  // Start in June 2026 to match mock data
  const [cursor, setCursor] = useState(new Date(2026, 5, 18));
  const [view, setView] = useState("monthly");
  const [selectedDay, setSelectedDay] = useState(18);
  const [search, setSearch] = useState("");
  const [activeCategories, setActiveCategories] = useState(
    CATEGORIES.map((c) => c.name)
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  /* ------- Navigation ------- */

  function shift(step) {
    const next = new Date(cursor);
    if (view === "daily") next.setDate(next.getDate() + step);
    else if (view === "weekly") next.setDate(next.getDate() + step * 7);
    else if (view === "monthly") next.setMonth(next.getMonth() + step);
    else next.setFullYear(next.getFullYear() + step);
    setCursor(next);
  }

  function jumpToday() {
    setCursor(new Date(2026, 5, 18));
    setSelectedDay(18);
  }

  function toggleCategory(name) {
    setActiveCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  /* ------- Filter logic ------- */

  const filteredEvents = useMemo(() => {
    const out = {};
    Object.entries(EVENTS).forEach(([key, list]) => {
      const filtered = list.filter((e) => {
        const matchesCat = activeCategories.includes(e.category);
        const matchesSearch =
          !search ||
          e.title.toLowerCase().includes(search.toLowerCase());
        return matchesCat && matchesSearch;
      });
      if (filtered.length) out[key] = filtered;
    });
    return out;
  }, [activeCategories, search]);

  function getFilteredEvents(y, m, d) {
    return filteredEvents[eventKey(y, m, d)] || [];
  }

  /* ------- Header subtitle ------- */

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

  /* ============================================================
     Views
     ============================================================ */

  function YearView() {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
                  <ArrowRight
                    size={11}
                    className="text-theme-dim opacity-0 transition group-hover:opacity-100"
                  />
                </div>
                <div className="grid grid-cols-7 gap-px">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <span
                      key={i}
                      className="text-center text-[7px] font-bold text-theme-dim"
                    >
                      {d}
                    </span>
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
                          isToday
                            ? "bg-indigo-600 text-white"
                            : has
                            ? "bg-indigo-100 text-indigo-600"
                            : "text-theme-dim",
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
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-theme">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="border-r border-theme py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-theme-muted last:border-r-0"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={idx}
                  className="min-h-[110px] border-b border-r border-theme bg-theme-tertiary/40"
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
                  "group relative flex min-h-[110px] flex-col border-b border-r border-theme p-2 text-left transition-colors",
                  isSelected
                    ? "bg-indigo-50/60"
                    : "hover:bg-theme-hover",
                ].join(" ")}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={[
                      "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                      isToday
                        ? "bg-indigo-600 text-white shadow-sm"
                        : isSelected
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-theme-primary",
                    ].join(" ")}
                  >
                    {day}
                  </span>
                  {list.length > 3 && (
                    <span className="text-[9px] font-semibold text-theme-dim">
                      {list.length}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  {list.slice(0, 3).map((ev, i) => (
                    <div
                      key={i}
                      className={`truncate rounded px-1.5 py-[3px] text-[9px] font-semibold text-white ${ev.color} transition group-hover:brightness-110`}
                    >
                      {ev.time} {ev.title}
                    </div>
                  ))}
                  {list.length > 3 && (
                    <span className="pl-1 text-[9px] font-semibold text-theme-muted">
                      +{list.length - 3} more
                    </span>
                  )}
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
      <div className="flex-1 overflow-y-auto">
        {/* Day header */}
        <div className="sticky top-0 z-10 grid grid-cols-[64px_repeat(7,1fr)] border-b border-theme bg-theme-secondary">
          <div className="border-r border-theme" />
          {week.map((d, i) => {
            const isToday = isSameDay(d, today);
            return (
              <div
                key={i}
                className="border-r border-theme py-3 text-center last:border-r-0"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-theme-muted">
                  {WEEKDAYS[i]}
                </p>
                <p
                  className={[
                    "mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold",
                    isToday
                      ? "bg-indigo-600 text-white"
                      : "text-theme-primary",
                  ].join(" ")}
                >
                  {d.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Hour rows */}
        {hours.map((h) => (
          <div
            key={h}
            className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-theme"
          >
            <div className="border-r border-theme py-2 pr-2 text-right">
              <span className="text-[10px] font-medium text-theme-muted">
                {h > 12 ? h - 12 : h} {h >= 12 ? "PM" : "AM"}
              </span>
            </div>
            {week.map((d, i) => {
              const hourEvents = getFilteredEvents(
                d.getFullYear(),
                d.getMonth(),
                d.getDate()
              ).filter((e) => parseInt(e.time.split(":")[0]) === h);

              return (
                <div
                  key={i}
                  className="min-h-[56px] border-r border-theme p-1 last:border-r-0"
                >
                  {hourEvents.map((ev, j) => (
                    <div
                      key={j}
                      className={`truncate rounded-md px-1.5 py-1 text-[10px] font-semibold text-white ${ev.color} transition hover:brightness-110`}
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
    );
  }

  function DayView() {
    const events = getFilteredEvents(
      cursor.getFullYear(),
      cursor.getMonth(),
      cursor.getDate()
    );
    const hours = Array.from({ length: 15 }, (_, i) => i + 7);

    return (
      <div className="flex-1 overflow-y-auto">
        {hours.map((h) => {
          const hourEvents = events.filter(
            (e) => parseInt(e.time.split(":")[0]) === h
          );
          return (
            <div
              key={h}
              className="flex border-b border-theme last:border-b-0"
            >
              <div className="w-20 shrink-0 py-3 pr-3 text-right">
                <span className="text-[11px] font-medium text-theme-muted">
                  {h > 12 ? h - 12 : h} {h >= 12 ? "PM" : "AM"}
                </span>
              </div>
              <div className="min-h-[64px] flex-1 border-l border-theme p-2 pl-4">
                {hourEvents.map((ev, i) => (
                  <div
                    key={i}
                    className={`mb-2 flex items-center gap-3 rounded-lg ${ev.color} px-4 py-2.5 text-white shadow-sm transition hover:brightness-110`}
                  >
                    <div className="flex-1">
                      <p className="text-xs font-bold">{ev.title}</p>
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

  /* ============================================================
     Mini Calendar (left panel)
     ============================================================ */

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
              className="rounded-md p-1 text-theme-muted transition hover:bg-theme-hover hover:text-theme-primary"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="rounded-md p-1 text-theme-muted transition hover:bg-theme-hover hover:text-theme-primary"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span
              key={i}
              className="text-center text-[9px] font-bold text-theme-dim"
            >
              {d}
            </span>
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
                  isSel
                    ? "bg-indigo-600 text-white shadow-sm"
                    : isToday
                    ? "bg-indigo-100 text-indigo-700"
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

  /* ============================================================
     Main render
     ============================================================ */

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <CalendarIcon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-theme-primary">
              My Calendar
            </h1>
            <p className="text-[11px] text-theme-muted">
              Plan, track and organize everything in one place
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-md">
            Y
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* ================= LEFT PANEL ================= */}
        <div className="space-y-4">
          {/* Create event */}
          <div className="rounded-2xl border border-theme bg-theme-secondary p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-md">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-theme-primary">
                  Create Event
                </p>
                <p className="text-[11px] text-theme-muted">
                  Host and manage events
                </p>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 hover:shadow-md active:scale-[0.98]"
            >
              <Plus size={14} />
              Create Event
            </button>
          </div>

          {/* Mini calendar */}
          <MiniCalendar />

          {/* Categories */}
          <div className="rounded-2xl border border-theme bg-theme-secondary p-4">
            <p className="mb-3 text-sm font-bold text-theme-primary">
              Categories
            </p>
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
                      active
                        ? "text-theme-secondary"
                        : "text-theme-dim opacity-60",
                    ].join(" ")}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${c.dot} transition ${
                        active ? "opacity-100" : "opacity-40"
                      }`}
                    />
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming */}
          <div className="rounded-2xl border border-theme bg-theme-secondary p-4">
            <p className="text-sm font-bold text-theme-primary">
              Upcoming Events
            </p>
            <p className="mt-0.5 mb-3 flex items-center gap-1 text-[10px] text-theme-muted">
              <Clock size={10} />
              Don't miss scheduled events
            </p>

            <div className="space-y-3">
              {UPCOMING_EVENTS.map((e, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-xl border border-theme bg-theme-tertiary p-3 transition hover:border-indigo-200 hover:shadow-sm"
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
                    <p className="mt-1 text-[11px] font-semibold leading-snug text-theme-primary line-clamp-2">
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

            <button
              type="button"
              className="mt-3 w-full rounded-lg border border-theme bg-theme-tertiary py-2 text-[11px] font-semibold text-theme-secondary transition hover:bg-theme-hover"
            >
              See More
            </button>
          </div>
        </div>

        {/* ================= MAIN CALENDAR ================= */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-theme bg-theme-secondary">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-theme p-4">
            <div>
              <p className="text-base font-bold text-theme-primary">
                {MONTHS[month]}, {year}
              </p>
              <p className="mt-0.5 text-[10px] text-theme-muted">{subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => shift(-1)}
                className="rounded-lg border border-theme p-1.5 text-theme-muted transition hover:bg-theme-hover hover:text-theme-primary"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={jumpToday}
                className="rounded-lg border border-theme px-3 py-1.5 text-[11px] font-semibold text-theme-secondary transition hover:bg-theme-hover"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => shift(1)}
                className="rounded-lg border border-theme p-1.5 text-theme-muted transition hover:bg-theme-hover hover:text-theme-primary"
              >
                <ChevronRight size={14} />
              </button>

              <div className="relative hidden sm:block">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-muted"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events"
                  className="w-[150px] rounded-lg border border-theme bg-theme-tertiary py-1.5 pl-7 pr-2 text-[11px] text-theme-primary outline-none transition focus:border-indigo-400 placeholder:text-theme-dim"
                />
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-theme px-2.5 py-1.5 text-[11px] font-semibold text-theme-secondary transition hover:bg-theme-hover"
              >
                <SlidersHorizontal size={11} />
                Filter
              </button>

              {/* View switcher */}
              <div className="flex items-center gap-0.5 rounded-lg border border-theme bg-theme-tertiary p-0.5">
                {VIEW_MODES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setView(v.key)}
                    className={[
                      "rounded-md px-2.5 py-1 text-[10px] font-semibold transition",
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

          {/* Body */}
          <div className="flex flex-1 flex-col">
            {view === "yearly" && <YearView />}
            {view === "monthly" && <MonthView />}
            {view === "weekly" && <WeekView />}
            {view === "daily" && <DayView />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;