// Venues.jsx
// This component displays the venues management page.
// It handles search, filtering, and venue creation.

import { useState, useEffect, useMemo } from "react";
import { MapPin, Plus, Search, X } from "lucide-react";
import { getVenues, createVenue } from "../services/venueService";

function Venues() {
  // State for venues list
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for search
  const [searchQuery, setSearchQuery] = useState("");

  // State for create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    capacity: "",
  });

  // Load venues on component mount
  useEffect(() => {
    loadVenues();
  }, []);

  // Function to load venues from service
  async function loadVenues() {
    try {
      setLoading(true);
      setError(null);

      // Call service to get venues
      const data = await getVenues();
      setVenues(data);
    } catch (err) {
      setError("Failed to load venues. Please try again.");
      console.error("Error loading venues:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter venues based on search
  const filteredVenues = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return venues.filter((venue) => {
      const matchesSearch =
        !search ||
        venue.name.toLowerCase().includes(search) ||
        venue.city.toLowerCase().includes(search) ||
        venue.address.toLowerCase().includes(search);

      return matchesSearch;
    });
  }, [venues, searchQuery]);

  // Handle form input changes
  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Handle form submission
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      // Call service to create venue
      const newVenue = await createVenue(formData);

      // Add new venue to local state
      setVenues((prev) => [...prev, newVenue]);

      // Close modal and reset form
      setShowCreateModal(false);
      setFormData({
        name: "",
        address: "",
        city: "",
        capacity: "",
      });
    } catch (err) {
      console.error("Error creating venue:", err);
      alert("Failed to create venue. Please try again.");
    }
  }

  return (
    <div>
      {/* Page header with create button */}
      <header className="mb-7 sm:mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Operations
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-theme-primary sm:text-[34px]">
              Venues
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-theme-muted">
              Manage event venues and their availability.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-theme-accent px-4 py-2.5 text-sm font-semibold text-theme-primary transition hover:bg-theme-accent-hover"
          >
            <Plus size={16} strokeWidth={2} />
            Add Venue
          </button>
        </div>
      </header>

      {/* Search bar */}
      <section className="admin-section overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-theme p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-md border border-theme-accent/20 bg-theme-accent/5 px-3 py-2.5">
            <Search size={15} strokeWidth={1.7} className="shrink-0 text-theme-accent/75" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search venues..."
              className="min-w-0 flex-1 bg-transparent text-xs text-theme-secondary outline-none placeholder:text-theme-dim"
            />
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="px-6 py-12 text-center text-sm text-theme-muted">
            Loading venues...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="px-6 py-12 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Venues table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-theme text-left">
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Venue
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Address
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    City
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Capacity
                  </th>
                  <th className="px-6 py-4 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredVenues.length > 0 ? (
                  filteredVenues.map((venue) => (
                    <tr
                      key={venue.venue_id}
                      className="border-b border-theme transition hover:bg-theme-primary/5 last:border-b-0"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-theme-primary">
                          {venue.name}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-theme-muted">
                        {venue.address}
                      </td>
                      <td className="px-6 py-5 text-sm text-theme-muted">
                        {venue.city}
                      </td>
                      <td className="px-6 py-5 text-sm text-theme-secondary">
                        {venue.capacity}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          className="text-xs text-theme-muted transition hover:text-theme-accent"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-theme-muted">
                      No venues match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create Venue Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-lg border border-theme bg-theme-secondary p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-theme-primary">Add New Venue</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-theme-muted transition hover:text-theme-primary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                  Venue Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Main Auditorium"
                  className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-theme-accent/40"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 123 University Road"
                  className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-theme-accent/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Hyderabad"
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

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md border border-theme px-4 py-2.5 text-sm text-theme-secondary transition hover:bg-theme-primary/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-theme-accent px-4 py-2.5 text-sm font-semibold text-theme-primary transition hover:bg-theme-accent-hover"
                >
                  Add Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Venues;