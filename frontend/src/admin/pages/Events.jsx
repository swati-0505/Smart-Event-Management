// Events.jsx
// Events management — service-driven, backend-ready.

import { useState, useEffect, useMemo } from "react";
import {
  Plus, Search, MoreVertical, Clock, MapPin,
  Users, Edit2, Trash2, X, Calendar, RefreshCw, Check,
} from "lucide-react";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import {
  getEvents, createEvent, updateEvent, deleteEvent,
} from "../services/eventService";

const STATUS_VARIANT = {
  Upcoming: "info",
  Active: "success",
  Today: "warning",
  Cancelled: "danger",
  Completed: "neutral",
};

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const [form, setForm] = useState({
    title: "", date: "", time: "", venue: "", capacity: "", category: "", status: "Upcoming",
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setError("Failed to load events.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return events.filter((e) => {
      const matchS =
        !s ||
        e.title.toLowerCase().includes(s) ||
        e.venue.toLowerCase().includes(s);
      const matchStatus = statusFilter === "All" || e.status === statusFilter;
      return matchS && matchStatus;
    });
  }, [events, search, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", date: "", time: "", venue: "", capacity: "", category: "", status: "Upcoming" });
    setShowModal(true);
  }

  function openEdit(ev) {
    setEditing(ev);
    setForm({ ...ev });
    setShowModal(true);
    setOpenMenu(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        const updated = await updateEvent(editing.id, form);
        setEvents((prev) => prev.map((x) => (x.id === editing.id ? updated : x)));
      } else {
        const created = await createEvent(form);
        setEvents((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save event.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((x) => x.id !== id));
      setOpenMenu(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete event.");
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary">Events</h1>
          <p className="mt-1 text-sm text-theme-muted">
            Create, manage, and monitor all your events.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Create Event
        </button>
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none"
        >
          <option>All</option>
          <option>Upcoming</option>
          <option>Active</option>
          <option>Today</option>
          <option>Cancelled</option>
        </select>
      </div>

      {loading && (
        <div className="card p-12 text-center text-sm text-theme-muted">
          Loading events...
        </div>
      )}

      {error && (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button type="button" onClick={loadEvents} className="btn-primary">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <Calendar size={40} className="mx-auto text-theme-dim" />
              <p className="mt-3 text-sm text-theme-muted">No events found.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((event, idx) => (
                <div
                  key={event.id}
                  className={`card card-interactive animate-fade-in-up stagger-${(idx % 6) + 1} relative p-5`}
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
                            onClick={() => handleDelete(event.id)}
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
                    <p className="flex items-center gap-2"><MapPin size={13} /> {event.venue}</p>
                    <p className="flex items-center gap-2"><Users size={13} /> {event.registered}/{event.capacity} registered</p>
                  </div>

                  <div className="mt-4 progress-bar">
                    <div
                      className="progress-fill bg-indigo-500"
                      style={{
                        width: `${event.capacity ? (event.registered / event.capacity) * 100 : 0}%`,
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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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
                <option>Upcoming</option>
                <option>Active</option>
                <option>Today</option>
                <option>Cancelled</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check size={14} />
              {editing ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Events;