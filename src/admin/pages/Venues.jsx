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
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d7a63a]">
          Operations
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
              Venues
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
              Manage event venues and their availability.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d7a63a] px-4 py-2.5 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#e3b957]"
          >
            <Plus size={16} strokeWidth={2} />
            Add Venue
          </button>
        </div>
      </header>

      {/* Search bar */}
      <section className="admin-section overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-md border border-[#d7a63a]/20 bg-[#d7a63a]/[0.05] px-3 py-2.5">
            <Search size={15} strokeWidth={1.7} className="shrink-0 text-[#d7a63a]/75" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search venues..."
              className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="px-6 py-12 text-center text-sm text-white/30">
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
                <tr className="border-b border-white/[0.07] text-left">
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Venue
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Address
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    City
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Capacity
                  </th>
                  <th className="px-6 py-4 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredVenues.length > 0 ? (
                  filteredVenues.map((venue) => (
                    <tr
                      key={venue.venue_id}
                      className="border-b border-white/[0.055] transition hover:bg-white/[0.02] last:border-b-0"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-white/85">
                          {venue.name}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-white/45">
                        {venue.address}
                      </td>
                      <td className="px-6 py-5 text-sm text-white/45">
                        {venue.city}
                      </td>
                      <td className="px-6 py-5 text-sm text-white/50">
                        {venue.capacity}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          className="text-xs text-white/40 transition hover:text-[#d7a63a]"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-white/30">
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
          <div className="w-full max-w-lg rounded-lg border border-white/[0.08] bg-[#111111] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Add New Venue</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-white/40 transition hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  Venue Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Main Auditorium"
                  className="w-full rounded-md border border-white/[0.08] bg-[#151515] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d7a63a]/40"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 123 University Road"
                  className="w-full rounded-md border border-white/[0.08] bg-[#151515] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d7a63a]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Hyderabad"
                    className="w-full rounded-md border border-white/[0.08] bg-[#151515] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d7a63a]/40"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 500"
                    className="w-full rounded-md border border-white/[0.08] bg-[#151515] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d7a63a]/40"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md border border-white/[0.08] px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#d7a63a] px-4 py-2.5 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#e3b957]"
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