import React, { useEffect, useState } from "react";
import { MapPin, Plus, Edit2, Trash2, Building, Users } from "lucide-react";
import { getVenues, createVenue, updateVenue, deleteVenue } from "../../services/venueService";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function AdminVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    capacity: 200,
  });

  const loadVenues = () => {
    setLoading(true);
    setError("");
    getVenues()
      .then((data) => setVenues(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || "Failed to load venues."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const openCreateModal = () => {
    setFormData({ name: "", address: "", city: "", capacity: 200 });
    setCreateModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditTarget(v);
    setFormData({
      name: v.name || "",
      address: v.address || "",
      city: v.city || "",
      capacity: v.capacity || 200,
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createVenue({
        ...formData,
        capacity: Number(formData.capacity),
      });
      setVenues((prev) => [created, ...prev]);
      setCreateModalOpen(false);
    } catch (err) {
      alert(err.message || "Failed to create venue.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    setSubmitting(true);
    try {
      const updated = await updateVenue(editTarget.venue_id, {
        ...formData,
        capacity: Number(formData.capacity),
      });
      setVenues((prev) =>
        prev.map((v) => (v.venue_id === editTarget.venue_id ? updated : v))
      );
      setEditTarget(null);
    } catch (err) {
      alert(err.message || "Failed to update venue.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteVenue(deleteTarget.venue_id);
      setVenues((prev) => prev.filter((v) => v.venue_id !== deleteTarget.venue_id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || "Failed to delete venue.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader message="Fetching registered event venues..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadVenues} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "var(--font-3xl)", fontWeight: 800 }}>Manage Venues</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Configure event locations, city groupings, and total seating capacities.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> Add Venue Location
        </button>
      </div>

      {venues.length === 0 ? (
        <EmptyState icon={MapPin} title="No venues registered" description="Add your first venue to start scheduling events." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {venues.map((v) => (
            <div key={v.venue_id} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Building size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>{v.name}</h3>
                    <span style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>{v.city}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button onClick={() => openEditModal(v)} className="btn btn-ghost btn-icon" title="Edit Venue">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setDeleteTarget(v)} className="btn btn-ghost btn-icon" style={{ color: "var(--color-danger)" }} title="Delete Venue">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "auto" }}>
                <div>📍 <strong>Address:</strong> {v.address}</div>
                <div>👥 <strong>Capacity:</strong> {v.capacity} seats</div>
              </div>
            </div>
          ))}
        </div>
      )}

      
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Add Venue Location" maxWidth="500px">
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="venue_name">Venue Name *</label>
            <input
              id="venue_name"
              type="text"
              required
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Grand Tech Convention Center"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="city">City *</label>
            <input
              id="city"
              type="text"
              required
              className="form-input"
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="e.g. San Francisco"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">Address *</label>
            <input
              id="address"
              type="text"
              required
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="123 Innovation Way"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="capacity">Seating Capacity *</label>
            <input
              id="capacity"
              type="number"
              min="1"
              required
              className="form-input"
              value={formData.capacity}
              onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="button" onClick={() => setCreateModalOpen(false)} disabled={submitting} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Saving..." : "Create Venue"}
            </button>
          </div>
        </form>
      </Modal>

      
      <Modal isOpen={Boolean(editTarget)} onClose={() => setEditTarget(null)} title="Edit Venue Location" maxWidth="500px">
        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit_name">Venue Name</label>
            <input
              id="edit_name"
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit_city">City</label>
            <input
              id="edit_city"
              type="text"
              className="form-input"
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit_address">Address</label>
            <input
              id="edit_address"
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit_capacity">Seating Capacity</label>
            <input
              id="edit_capacity"
              type="number"
              min="1"
              className="form-input"
              value={formData.capacity}
              onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="button" onClick={() => setEditTarget(null)} disabled={submitting} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Saving..." : "Update Venue"}
            </button>
          </div>
        </form>
      </Modal>

      
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Venue"
        message={`Are you sure you want to delete venue "${deleteTarget?.name}"?`}
        confirmLabel="Yes, Delete Venue"
        confirmVariant="danger"
        loading={submitting}
      />
    </div>
  );
}
