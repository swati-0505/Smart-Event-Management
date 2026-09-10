// Events.jsx
// This component displays the events management page.
// It handles search, filtering, event creation, editing, and deletion.

import { useState, useEffect, useMemo } from "react";
import { CalendarPlus, Search, X } from "lucide-react";
import { getEvents, createEvent, updateEvent, cancelEvent } from "../services/eventService";

function Events() {
  // State for events list
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for local search (input in the page)
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  // State for status filter
  const [statusFilter, setStatusFilter] = useState("ALL");

  // State for create/edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    capacity: "",
    status: "UPCOMING",
  });

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Function to load events from service
  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);

      // Call service to get events
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setError("Failed to load events. Please try again.");
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter events based on search and status
  const filteredEvents = useMemo(() => {
    const search = localSearchQuery.trim().toLowerCase();

    return events.filter((event) => {
      // Check if event has required fields
      if (!event.title || !event.venue_name) return false;

      const matchesSearch =
        !search ||
        event.title.toLowerCase().includes(search) ||
        event.venue_name.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, localSearchQuery, statusFilter]);

  // Handle form input changes
  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Handle form submission (create or edit)
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      if (editingEventId) {
        // Update existing event
        const updated = await updateEvent(editingEventId, formData);
        setEvents((prev) =>
          prev.map((event) => (event.event_id === editingEventId ? updated : event))
        );
      } else {
        // Create new event
        const newEvent = await createEvent(formData);
        setEvents((prev) => [...prev, newEvent]);
      }

      // Close modal and reset form
      setShowModal(false);
      setEditingEventId(null);
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        venue: "",
        capacity: "",
        status: "UPCOMING",
      });
    } catch (err) {
      console.error("Error saving event:", err);
      alert("Failed to save event. Please try again.");
    }
  }

  // Handle edit button click
  function handleEdit(eventId) {
    const eventToEdit = events.find((event) => event.event_id === eventId);
    if (eventToEdit) {
      setEditingEventId(eventId);
      setFormData({
        title: eventToEdit.title,
        description: eventToEdit.description,
        date: eventToEdit.start_time.split("T")[0],
        time: eventToEdit.start_time.split("T")[1],
        venue: eventToEdit.venue_name,
        capacity: eventToEdit.capacity,
        status: eventToEdit.status,
      });
      setShowModal(true);
    }
  }

  // Handle delete button click
  async function handleDelete(eventId) {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        // Call service to delete event
        setEvents((prev) => prev.filter((event) => event.event_id !== eventId));
      } catch (err) {
        console.error("Error deleting event:", err);
        alert("Failed to delete event.");
      }
    }
  }

  // Handle cancel button click
  async function handleCancel(eventId) {
    if (window.confirm("Are you sure you want to cancel this event?")) {
      try {
        const cancelled = await cancelEvent(eventId);
        setEvents((prev) =>
          prev.map((event) => (event.event_id === eventId ? cancelled : event))
        );
      } catch (err) {
        console.error("Error cancelling event:", err);
        alert("Failed to cancel event.");
      }
    }
  }

  // Determine status badge class
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
      {/* Page header with create button */}
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
            onClick={() => {
              setEditingEventId(null);
              setFormData({
                title: "",
                description: "",
                date: "",
                time: "",
                venue: "",
                capacity: "",
                status: "UPCOMING",
              });
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-theme-accent px-4 py-2.5 text-sm font-semibold text-theme-primary transition hover:bg-theme-accent-hover"
          >
            <CalendarPlus size={16} strokeWidth={2} />
            Create Event
          </button>
        </div>
      </header>

      {/* Search and filter bar */}
      <section className="admin-section overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-theme p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-md border border-theme-accent/20 bg-theme-accent/5 px-3 py-2.5">
            <Search size={15} strokeWidth={1.7} className="shrink-0 text-theme-accent/75" />

            <input
              type="text"
              value={localSearchQuery}
              onChange={(event) => setLocalSearchQuery(event.target.value)}
              placeholder="Search events..."
              className="min-w-0 flex-1 bg-transparent text-xs text-theme-secondary outline-none placeholder:text-theme-dim"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-xs text-theme-secondary outline-none transition focus:border-theme-accent/40 sm:w-auto"
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
            <table className="w-full min-w-[950px]">
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
                          {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-theme-muted">
                        {event.venue_name}
                      </td>
                      <td className="px-6 py-5 text-sm text-theme-secondary">
                        {event.capacity}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`admin-status ${getStatusClass(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-theme-muted">
                        {event.created_by || "Yugant"}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleEdit(event.event_id)}
                            className="inline-flex items-center gap-1 rounded-md border border-theme-accent/20 bg-theme-accent/5 px-2.5 py-1.5 text-[11px] font-medium text-theme-accent transition hover:bg-theme-accent/15 hover:border-theme-accent/40"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>

                          {/* Cancel Button */}
                          <button
                            type="button"
                            onClick={() => handleCancel(event.event_id)}
                            className="inline-flex items-center gap-1 rounded-md border border-orange-500/20 bg-orange-500/5 px-2.5 py-1.5 text-[11px] font-medium text-orange-500/90 transition hover:bg-orange-500/15 hover:border-orange-500/40"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(event.event_id)}
                            className="inline-flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-[11px] font-medium text-red-500/90 transition hover:bg-red-500/15 hover:border-red-500/40"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-sm text-theme-muted">
                      No events match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-lg border border-theme bg-theme-secondary p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-theme-primary">
                {editingEventId ? "Edit Event" : "Create New Event"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingEventId(null);
                }}
                className="text-theme-muted transition hover:text-theme-primary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-theme-accent/40 resize-none"
                />
              </div>

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

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEventId(null);
                  }}
                  className="rounded-md border border-theme px-4 py-2.5 text-sm text-theme-secondary transition hover:bg-theme-primary/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-theme-accent px-4 py-2.5 text-sm font-semibold text-theme-primary transition hover:bg-theme-accent-hover"
                >
                  {editingEventId ? "Update Event" : "Create Event"}
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