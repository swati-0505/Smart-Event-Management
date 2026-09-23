// Events.jsx
// Events management — with advanced filters + CSV export.

import { useState, useMemo } from "react";
import {
  Plus, Search, MoreVertical, Clock, MapPin, Users,
  Edit2, Trash2, Calendar, Check, Download,
} from "lucide-react";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import AdvancedFilters, {
  FilterSection,
  FilterChips,
  FilterCheckboxList,
  FilterTrigger,
} from "../components/common/AdvancedFilters";
import { useApiWithFallback } from "../hooks/useApiWithFallback";
import { exportToCsv } from "../utils/exportCsv";
import {
  getEvents, createEvent, updateEvent, deleteEvent,
} from "../services/eventService";
import { toast } from "sonner";

const STATUS_VARIANT = {
  Upcoming: "info",
  Active: "success",
  Today: "warning",
  Cancelled: "danger",
  Completed: "neutral",
};

const CATEGORIES = [
  "Tech Conference",
  "Workshop",
  "Networking",
  "Corporate Event",
  "Technology",
  "Business",
  "Cultural",
];

const DATE_RANGES = ["Today", "This Week", "This Month", "This Year"];

const CSV_COLUMNS = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "venue", label: "Venue", transform: (e) => e.venue || e.venue_name || "" },
  { key: "capacity", label: "Capacity" },
  { key: "registered", label: "Registered" },
  { key: "status", label: "Status" },
];

const SAMPLE = [
  { id: "s1", title: "AI for a Better Tomorrow", category: "Tech Conference", date: "20 Sep 2026", time: "9:00 AM - 5:00 PM", venue: "Chennai Convention Center", capacity: 500, registered: 420, status: "Upcoming" },
  { id: "s2", title: "Product Innovation Workshop", category: "Workshop", date: "25 Sep 2026", time: "10:00 AM - 1:00 PM", venue: "T-Hub, Chennai", capacity: 120, registered: 98, status: "Upcoming" },
  { id: "s3", title: "Networking Night", category: "Networking", date: "28 Sep 2026", time: "6:00 PM - 9:00 PM", venue: "ITC Grand Chola, Chennai", capacity: 200, registered: 156, status: "Upcoming" },
  { id: "s4", title: "Annual Company Meet", category: "Corporate Event", date: "10 Oct 2026", time: "9:00 AM - 6:00 PM", venue: "Chennai Trade Center", capacity: 800, registered: 650, status: "Active" },
  { id: "s5", title: "Tech Summit 2026", category: "Technology", date: "15 Nov 2026", time: "10:00 AM - 4:00 PM", venue: "Main Auditorium", capacity: 500, registered: 340, status: "Upcoming" },
  { id: "s6", title: "Startup Pitch Night", category: "Business", date: "22 Nov 2026", time: "5:00 PM - 9:00 PM", venue: "Innovation Hub", capacity: 150, registered: 120, status: "Upcoming" },
];

const EMPTY_FORM = {
  title: "", date: "", time: "", venue: "", capacity: "", category: "", status: "Upcoming",
};

function Events() {
  const { data: events, setData: setEvents, loading, usingFallback } =
    useApiWithFallback(getEvents, SAMPLE);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categories, setCategories] = useState([]);
  const [dateRange, setDateRange] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (categories.length > 0) n++;
    if (dateRange !== "All") n++;
    return n;
  }, [categories, dateRange]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const now = new Date();

    return events.filter((e) => {
      const title = (e.title || "").toLowerCase();
      const venue = (e.venue || e.venue_name || "").toLowerCase();
      if (s && !title.includes(s) && !venue.includes(s)) return false;

      if (statusFilter !== "All" && e.status !== statusFilter) return false;

      if (categories.length > 0 && !categories.includes(e.category)) return false;

      if (dateRange !== "All" && e.date) {
        const eventDate = new Date(e.date);
        if (isNaN(eventDate)) return false;
        const diffDays = Math.floor((eventDate - now) / (1000 * 60 * 60 * 24));
        if (dateRange === "Today" && diffDays !== 0) return false;
        if (dateRange === "This Week" && (diffDays < 0 || diffDays > 7)) return false;
        if (dateRange === "This Month" && (diffDays < 0 || diffDays > 30)) return false;
        if (dateRange === "This Year" && (diffDays < 0 || diffDays > 365)) return false;
      }

      return true;
    });
  }, [events, search, statusFilter, categories, dateRange]);

  function resetFilters() {
    setCategories([]);
    setDateRange("All");
  }

  function handleExport() {
    try {
      exportToCsv(filtered, CSV_COLUMNS, "events");
      toast.success(`Exported ${filtered.length} events`);
    } catch (err) {
      toast.error(err.message || "Export failed");
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(ev) {
    setEditing(ev);
    setForm({
      title: ev.title || "",
      date: ev.date || "",
      time: ev.time || "",
      venue: ev.venue || ev.venue_name || "",
      capacity: ev.capacity || "",
      category: ev.category || "",
      status: ev.status || "Upcoming",
    });
    setShowModal(true);
    setOpenMenu(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editing) {
      setEvents((prev) =>
        prev.map((x) => (x.id === editing.id ? { ...x, ...form } : x))
      );
      try { await updateEvent(editing.id, form); } catch { /* offline ok */ }
    } else {
      const newEvent = { id: `new-${Date.now()}`, ...form, registered: 0 };
      setEvents((prev) => [newEvent, ...prev]);
      try { await createEvent(form); } catch { /* offline ok */ }
    }
    setShowModal(false);
    toast.success(editing ? "Event updated" : "Event created");
  }

  async function confirmDelete() {
    const id = deleteTarget?.id;
    if (!id) return;
    setEvents((prev) => prev.filter((x) => x.id !== id));
    try { await deleteEvent(id); } catch { /* offline ok */ }
    toast.success("Event deleted");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary">Events</h1>
          <p className="mt-1 text-sm text-theme-muted">
            Create, manage, and monitor all your events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="btn-secondary disabled:opacity-50"
          >
            <Download size={16} />
            Export
          </button>
          <button type="button" onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Create Event
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card relative flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5">
          <Search size={15} className="text-theme-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="min-w-0 flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-dim"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none"
          >
            {["All", "Upcoming", "Active", "Today", "Cancelled"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>

          <div className="relative">
            <FilterTrigger
              onClick={() => setShowFilters((v) => !v)}
              activeCount={activeFilterCount}
            />

            <AdvancedFilters
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              onReset={resetFilters}
              activeCount={activeFilterCount}
            >
              <FilterSection title="Date Range">
                <FilterChips
                  options={["All", ...DATE_RANGES]}
                  value={dateRange}
                  onChange={setDateRange}
                />
              </FilterSection>

              <FilterSection title="Categories">
                <FilterCheckboxList
                  options={CATEGORIES}
                  value={categories}
                  onChange={setCategories}
                />
              </FilterSection>
            </AdvancedFilters>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card p-12 text-center text-sm text-theme-muted">
          Loading events...
        </div>
      ) : (
        <>
          {usingFallback && (
            <div className="rounded-lg border border-amber-300 bg-amber-100 px-4 py-2.5 text-[11px] font-bold text-amber-900">
              Demo data — connect backend to see real events.
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state__icon">
                  <Calendar size={24} />
                </div>
                <p className="empty-state__title">No events found</p>
                <p className="empty-state__desc">
                  Try adjusting filters or create a new event to get started.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((event, idx) => (
                <div
                  key={event.id}
                  className={`card card--metric card-interactive animate-fade-in-up stagger-${(idx % 6) + 1} relative p-5`}
                >
                  <div className="flex items-start justify-between">
                    <Badge variant={STATUS_VARIANT[event.status] || "neutral"}>
                      {event.status}
                    </Badge>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenMenu(openMenu === event.id ? null : event.id)}
                        className="btn-ghost"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenu === event.id && (
                        <div className="animate-scale-in absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-theme bg-theme-secondary shadow-lg">
                          <button
                            type="button"
                            onClick={() => openEdit(event)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-theme-secondary transition hover:bg-theme-hover"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget(event);
                              setOpenMenu(null);
                            }}
                            className="flex w-full items-center gap-2 border-t border-theme px-3 py-2 text-xs text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-theme-primary">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {event.category}
                  </p>

                  <div className="mt-4 space-y-2 text-xs text-theme-muted">
                    <p className="flex items-center gap-2"><Calendar size={13} /> {event.date}</p>
                    <p className="flex items-center gap-2"><Clock size={13} /> {event.time}</p>
                    <p className="flex items-center gap-2"><MapPin size={13} /> {event.venue || event.venue_name}</p>
                    <p className="flex items-center gap-2">
                      <Users size={13} /> {event.registered || 0}/{event.capacity} registered
                    </p>
                  </div>

                  <div className="mt-4 progress-bar">
                    <div
                      className="progress-fill bg-indigo-500"
                      style={{
                        width: `${event.capacity ? ((event.registered || 0) / event.capacity) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Event" : "Create New Event"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">
              Event Title
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Tech Fest 2025"
              className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">Date</label>
              <input
                type="text"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="08 Jul 2025"
                className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">Time</label>
              <input
                type="text"
                required
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                placeholder="10:00 AM - 4:00 PM"
                className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">Venue</label>
              <input
                type="text"
                required
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="Auditorium"
                className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">Capacity</label>
              <input
                type="number"
                required
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                placeholder="500"
                className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Technology"
                className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
              >
                {["Upcoming", "Active", "Today", "Cancelled", "Completed"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary w-full sm:w-auto">
              <Check size={14} />
              {editing ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Event?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

export default Events;