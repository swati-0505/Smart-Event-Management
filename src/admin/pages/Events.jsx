// Events.jsx
// Event management page — handles listing, filtering, creation, editing,
// cancellation and deletion of events.

import { useState, useEffect, useMemo } from "react";
import { CalendarPlus, Search, X } from "lucide-react";
import {
  getEvents,
  createEvent,
  updateEvent,
  cancelEvent,
  deleteEvent,
} from "../services/eventService";

// Empty form state — used for resetting create/edit modal
const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  time: "",
  venue: "",
  capacity: "",
  status: "UPCOMING",
};

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Load events on mount
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
      console.error("Failed to load events:", err);
      setError("Could not load events. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Filter by search text and status
  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return events.filter((event) => {
      if (!event.title || !event.venue_name) return false;

      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.venue_name.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function openCreateModal() {
    setEditingEventId(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingEventId(null);
    setFormData(EMPTY_FORM);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      if (editingEventId) {
        const updated = await updateEvent(editingEventId, formData);

        setEvents((prev) =>
          prev.map((item) =>
            item.event_id === editingEventId ? { ...item, ...updated } : item
          )
        );
      } else {
        const created = await createEvent(formData);
        setEvents((prev) => [...prev, created]);
      }

      closeModal();
    } catch (err) {
      console.error("Failed to save event:", err);
      alert("Could not save the event. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(eventId) {
    const target = events.find((event) => event.event_id === eventId);
    if (!target) return;

    const [datePart, timePart] = target.start_time.split("T");

    setEditingEventId(eventId);
    setFormData({
      title: target.title,
      description: target.description,
      date: datePart,
      time: timePart,
      venue: target.venue_name,
      capacity: target.capacity,
      status: target.status,
    });
    setShowModal(true);
  }

  async function handleCancel(eventId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this event?"
    );
    if (!confirmed) return;

    try {
      const cancelled = await cancelEvent(eventId);

      setEvents((prev) =>
        prev.map((item) =>
          item.event_id === eventId ? { ...item, status: cancelled.status } : item
        )
      );
    } catch (err) {
      console.error("Failed to cancel event:", err);
      alert("Could not cancel the event.");
    }
  }

  async function handleDelete(eventId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await deleteEvent(eventId);
      setEvents((prev) => prev.filter((item) => item.event_id !== eventId));
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Could not delete the event.");
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case "UPCOMING":
        return "admin-status-upcoming";
      case "ACTIVE":
      case "CONFIRMED":
        return "admin-status-confirmed";
      case "PENDING":
        return "admin-status-pending";
      case "CANCELLED":
        return "admin-status-cancelled";
      default:
        return "admin-status-pending";
    }
  }

  return (
    <div>
      {/* Page header */}
      <header className="mb-7 sm:mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Event Management
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-theme-primary sm:text-[34px]">
              Events
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-theme-muted">
              Create, manage, and monitor your events from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-theme-accent px-4 py-2.5 text-sm font-semibold text-theme-primary transition hover:bg-theme-accent-hover"
          >
            <CalendarPlus size={16} strokeWidth={2} />
            Create Event
          </button>
        </div>
      </header>

      {/* Search & filter bar */}
      <section className="admin-section overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-theme p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-md border border-theme-accent/20 bg-theme-accent/5 px-3 py-2.5">
            <Search
              size={15}
              strokeWidth={1.7}
              className="shrink-0 text-theme-accent/75"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search events..."
              className="min-w-0 flex-1 bg-transparent text-xs text-theme-secondary outline-none placeholder:text-theme-dim"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="px-6 py-12 text-center text-sm text-theme-muted">
            Loading events...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="px-6 py-12 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Events table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-theme text-left">
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Event
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Venue
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Capacity
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Created By
                  </th>
                  <th className="px-6 py-4 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <tr
                      key={event.event_id}
                      className="border-b border-theme transition hover:bg-theme-primary/5 last:border-b-0"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-theme-primary">
                          {event.title}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm text-theme-muted">
                          {new Date(event.start_time).toLocaleDateString()}
                        </p>
                        <p className="mt-1 text-[11px] text-theme-dim">
                          {new Date(event.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-theme-muted">
                        {event.venue_name}
                      </td>

                      <td className="px-6 py-5 text-sm text-theme-secondary">
                        {event.capacity}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`admin-status ${getStatusClass(
                            event.status
                          )}`}
                        >
                          {event.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-theme-muted">
                        {event.created_by || "Admin"}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleEdit(event.event_id)}
                            className="expand-btn expand-btn-edit"
                            aria-label="Edit event"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="expand-btn-icon"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>

                          {/* Cancel */}
                          <button
                            type="button"
                            onClick={() => handleCancel(event.event_id)}
                            className="expand-btn expand-btn-cancel"
                            aria-label="Cancel event"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="expand-btn-icon"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(event.event_id)}
                            className="expand-btn expand-btn-delete"
                            aria-label="Delete event"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="expand-btn-icon"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-sm text-theme-muted"
                    >
                      No events match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-lg border border-theme bg-theme-secondary p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-theme-primary">
                {editingEventId ? "Edit Event" : "Create New Event"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="text-theme-muted transition hover:text-theme-primary"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                  Event Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Tech Summit 2026"
                  className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-theme-accent/40"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description of the event..."
                  className="w-full resize-none rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-theme-accent/40"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-theme-accent/40"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-theme-accent/40"
                  />
                </div>
              </div>

              {/* Venue & Capacity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                    Venue
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Main Auditorium"
                    className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-theme-accent/40"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 500"
                    className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-theme-accent/40"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-theme-accent/40"
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-theme px-4 py-2.5 text-sm text-theme-secondary transition hover:bg-theme-primary/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-theme-accent px-4 py-2.5 text-sm font-semibold text-theme-primary transition hover:bg-theme-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingEventId
                    ? "Update Event"
                    : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;