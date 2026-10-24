import React, { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Calendar, MapPin, Users } from "lucide-react";
import { getAllEvents, createEvent, updateEvent, deleteEvent } from "../../services/eventService";
import { getVenues } from "../../services/venueService";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EventForm from "../../components/event/EventForm";
import Badge from "../../components/common/Badge";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [venuesMap, setVenuesMap] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError("");

    Promise.all([getAllEvents(), getVenues()])
      .then(([eventsData, venuesData]) => {
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        const map = {};
        if (Array.isArray(venuesData)) {
          venuesData.forEach((v) => (map[v.venue_id] = v));
        }
        setVenuesMap(map);
      })
      .catch((err) => setError(err.message || "Failed to load events."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (payload) => {
    setSubmitting(true);
    try {
      const newEv = await createEvent(payload);
      setEvents((prev) => [newEv, ...prev]);
      setCreateModalOpen(false);
    } catch (err) {
      alert(err.message || "Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (payload) => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      const updated = await updateEvent(editTarget.event_id, payload);
      setEvents((prev) =>
        prev.map((e) => (e.event_id === editTarget.event_id ? updated : e))
      );
      setEditTarget(null);
    } catch (err) {
      alert(err.message || "Failed to update event.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteEvent(deleteTarget.event_id);
      setEvents((prev) => prev.filter((e) => e.event_id !== deleteTarget.event_id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || "Failed to delete event.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (ev.title && ev.title.toLowerCase().includes(q)) ||
      (ev.category && ev.category.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return <PageLoader message="Loading event catalogue..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "var(--font-3xl)", fontWeight: 800 }}>Manage Events</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Create, update, or remove events across all venue categories.
          </p>
        </div>

        <button onClick={() => setCreateModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Create New Event
        </button>
      </div>

      
      <div className="card" style={{ padding: "0.875rem 1.25rem" }}>
        <div style={{ position: "relative", maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search events by title or category..."
            className="form-input"
            style={{ paddingLeft: "2.5rem" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events match search"
          description="Try modifying your search criteria or create a new event."
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Event Title</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Category</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Venue</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Date</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Available Seats</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev) => {
                  const venue = venuesMap[ev.venue_id];
                  const dateObj = ev.event_date ? new Date(ev.event_date) : null;
                  return (
                    <tr key={ev.event_id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "1rem 1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {ev.title}
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <Badge variant="primary">{ev.category}</Badge>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)" }}>
                        {venue ? `${venue.name} (${venue.city})` : ev.address || "Venue TBA"}
                      </td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)" }}>
                        {dateObj ? dateObj.toLocaleDateString() : "TBA"}
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <span style={{ fontWeight: 600 }}>{ev.available_seats}</span> / {ev.capacity}
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                          <Badge variant={ev.status === "published" ? "success" : "warning"}>
                            {ev.status || "published"}
                          </Badge>
                          {ev.is_completed && <Badge variant="neutral">Completed</Badge>}
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => setEditTarget(ev)}
                            className="btn btn-ghost btn-icon"
                            title="Edit Event"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(ev)}
                            className="btn btn-ghost btn-icon"
                            style={{ color: "var(--color-danger)" }}
                            title="Delete Event"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Event" maxWidth="650px">
        <EventForm onSubmit={handleCreateSubmit} onCancel={() => setCreateModalOpen(false)} submitting={submitting} />
      </Modal>

      
      <Modal isOpen={Boolean(editTarget)} onClose={() => setEditTarget(null)} title="Edit Event" maxWidth="650px">
        {editTarget && (
          <EventForm initialData={editTarget} onSubmit={handleEditSubmit} onCancel={() => setEditTarget(null)} submitting={submitting} />
        )}
      </Modal>

      
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete Event"
        confirmVariant="danger"
        loading={submitting}
      />
    </div>
  );
}
