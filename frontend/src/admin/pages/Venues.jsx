// Venues.jsx
// Venues management — with ConfirmDialog for delete.

import { useState, useMemo } from "react";
import { Search, MapPin, Users, Plus, Check, Trash2, MoreVertical } from "lucide-react";
import PageWrapper from "../components/common/PageWrapper";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useApiWithFallback } from "../hooks/useApiWithFallback";
import { getVenues, createVenue, deleteVenue } from "../services/venueService";
import { toast } from "sonner";

const SAMPLE = [
  { id: "s1", name: "Chennai Convention Center", address: "123 Anna Salai, Nandanam, Chennai", capacity: 2000 },
  { id: "s2", name: "ITC Grand Chola", address: "63 Mount Road, Guindy, Chennai", capacity: 800 },
  { id: "s3", name: "T-Hub Auditorium", address: "Plot No 1, Raidurgam, Hyderabad", capacity: 500 },
  { id: "s4", name: "Main Auditorium", address: "123 University Road, Hyderabad", capacity: 500 },
  { id: "s5", name: "Innovation Hall", address: "45 Tech Park, Whitefield, Bengaluru", capacity: 200 },
  { id: "s6", name: "Conference Room A", address: "78 Business District, Bengaluru", capacity: 100 },
];

const EMPTY_FORM = { name: "", address: "", capacity: "" };

function Venues() {
  const { data: venues, setData: setVenues, loading, usingFallback } =
    useApiWithFallback(getVenues, SAMPLE);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return venues;
    return venues.filter(
      (v) =>
        v.name?.toLowerCase().includes(s) ||
        v.address?.toLowerCase().includes(s)
    );
  }, [venues, search]);

  async function handleSubmit(e) {
    e.preventDefault();
    const newVenue = {
      id: `new-${Date.now()}`,
      ...form,
      capacity: parseInt(form.capacity) || 0,
    };
    setVenues((prev) => [newVenue, ...prev]);
    setShowModal(false);
    setForm(EMPTY_FORM);
    try { await createVenue(newVenue); } catch { /* offline ok */ }
    toast.success("Venue added");
  }

  async function confirmDelete() {
    const id = deleteTarget?.id;
    if (!id) return;
    setVenues((prev) => prev.filter((v) => v.id !== id));
    try { await deleteVenue(id); } catch { /* offline ok */ }
    toast.success("Venue deleted");
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Venues</h1>
            <p className="mt-1 text-sm text-theme-muted">
              Manage all event venues and their capacity.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary shrink-0"
          >
            <Plus size={16} /> Add Venue
          </button>
        </div>

        {/* Search */}
        <div className="card flex items-center gap-2 p-3">
          <Search size={16} className="text-theme-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venues..."
            className="min-w-0 flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-dim"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="card p-12 text-center text-sm text-theme-muted">
            Loading venues...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state__icon">
                <MapPin size={24} />
              </div>
              <p className="empty-state__title">No venues yet</p>
              <p className="empty-state__desc">
                Add your first venue to start creating events.
              </p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="btn-primary mt-2"
              >
                <Plus size={14} /> Add Venue
              </button>
            </div>
          </div>
        ) : (
          <>
            {usingFallback && (
              <div className="rounded-lg border border-amber-300 bg-amber-100 px-4 py-2.5 text-[11px] font-bold text-amber-900">
                Demo data — connect backend to see real venues.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((venue, idx) => (
                <div
                  key={venue.id || idx}
                  className={`card card-interactive p-5 stagger-${(idx % 6) + 1} relative`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                      <MapPin size={20} />
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu(openMenu === venue.id ? null : venue.id)
                        }
                        className="btn-ghost"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenu === venue.id && (
                        <div className="animate-scale-in absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-theme bg-theme-secondary shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget(venue);
                              setOpenMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-theme-primary">
                    {venue.name || "Untitled"}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-theme-muted">
                    {venue.address || "No address"}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-theme-muted">
                    <Users size={12} />
                    <span>Capacity: {venue.capacity || "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Add Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add New Venue"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: "name", label: "Venue Name", type: "text", placeholder: "e.g., Chennai Convention Center" },
              { name: "address", label: "Address", type: "text", placeholder: "Full address" },
              { name: "capacity", label: "Capacity", type: "number", placeholder: "500" },
            ].map((f) => (
              <div key={f.name}>
                <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  required={f.name !== "capacity"}
                  value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
                />
              </div>
            ))}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary w-full sm:w-auto">
                <Check size={14} /> Add Venue
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="Delete Venue?"
          message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </PageWrapper>
  );
}

export default Venues;