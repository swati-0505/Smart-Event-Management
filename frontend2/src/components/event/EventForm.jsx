import React, { useState, useEffect } from "react";
import { getVenues } from "../../services/venueService";
import { LoadingSpinner } from "../common/LoadingSpinner";

export default function EventForm({ initialData = null, onSubmit, onCancel, submitting = false }) {
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [error, setError] = useState("");
  const [locationMode, setLocationMode] = useState(
    initialData?.address && !initialData?.venue_id ? "custom" : "venue"
  );

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "General",
    venue_id: initialData?.venue_id || "",
    address: initialData?.address || "",
    event_date: initialData?.event_date ? new Date(initialData.event_date).toISOString().slice(0, 16) : "",
    end_time: initialData?.end_time ? new Date(initialData.end_time).toISOString().slice(0, 16) : "",
    registration_deadline: initialData?.registration_deadline ? new Date(initialData.registration_deadline).toISOString().slice(0, 16) : "",
    capacity: initialData?.capacity || 100,
    ticket_price: initialData?.ticket_price || 0,
    status: initialData?.status || "published",
  });

  useEffect(() => {
    let isMounted = true;
    getVenues()
      .then((data) => {
        if (isMounted) {
          setVenues(Array.isArray(data) ? data : []);
          setLoadingVenues(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load venues.");
          setLoadingVenues(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (locationMode === "venue" && !formData.venue_id) {
      setError("Please select a venue.");
      return;
    }
    if (locationMode === "custom" && !formData.address.trim()) {
      setError("Please enter an event address.");
      return;
    }
    if (!formData.event_date) {
      setError("Event start date & time is required.");
      return;
    }

    if (formData.end_time && new Date(formData.end_time) <= new Date(formData.event_date)) {
      setError("End time must be after event start date.");
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description || null,
      category: formData.category,
      venue_id: locationMode === "venue" ? formData.venue_id : null,
      address: locationMode === "custom" ? formData.address.trim() : null,
      event_date: new Date(formData.event_date).toISOString(),
      end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
      registration_deadline: formData.registration_deadline ? new Date(formData.registration_deadline).toISOString() : null,
      capacity: Number(formData.capacity),
      ticket_price: Number(formData.ticket_price || 0),
    };

    if (initialData) {
      payload.status = formData.status;
    }

    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {error && (
        <div style={{ padding: "0.75rem", background: "#fee2e2", color: "var(--color-danger)", borderRadius: "var(--radius-md)", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="title">Event Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="form-input"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. AI Summit 2026"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="category">Category *</label>
        <input
          id="category"
          name="category"
          type="text"
          required
          className="form-input"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g. Technology, Workshop, Business"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="location_mode">Event Location *</label>
        <select
          id="location_mode"
          className="form-select"
          value={locationMode}
          onChange={(e) => setLocationMode(e.target.value)}
        >
          <option value="venue">Choose a saved venue</option>
          <option value="custom">Enter a custom address</option>
        </select>
      </div>

      {locationMode === "venue" ? (
        <div className="form-group">
          <label className="form-label" htmlFor="venue_id">Venue *</label>
          {loadingVenues ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <LoadingSpinner size="sm" /> Loading venues...
            </div>
          ) : (
            <select
              id="venue_id"
              name="venue_id"
              required
              className="form-select"
              value={formData.venue_id}
              onChange={handleChange}
            >
              <option value="">-- Select a Venue --</option>
              {venues.map((v) => (
                <option key={v.venue_id} value={v.venue_id}>
                  {v.name} ({v.city} - Cap: {v.capacity})
                </option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <div className="form-group">
          <label className="form-label" htmlFor="event_address">Custom Event Address *</label>
          <input
            id="event_address"
            name="address"
            type="text"
            required
            className="form-input"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter the full address for this event"
          />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="event_date">Start Date & Time *</label>
          <input
            id="event_date"
            name="event_date"
            type="datetime-local"
            required
            className="form-input"
            value={formData.event_date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="end_time">End Date & Time</label>
          <input
            id="end_time"
            name="end_time"
            type="datetime-local"
            className="form-input"
            value={formData.end_time}
            onChange={handleChange}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="registration_deadline">Registration Deadline</label>
          <input
            id="registration_deadline"
            name="registration_deadline"
            type="datetime-local"
            className="form-input"
            value={formData.registration_deadline}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="capacity">Capacity *</label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            required
            className="form-input"
            value={formData.capacity}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="ticket_price">Ticket Price (₹) *</label>
          <input
            id="ticket_price"
            name="ticket_price"
            type="number"
            min="0"
            step="0.01"
            className="form-input"
            value={formData.ticket_price}
            onChange={handleChange}
            placeholder="0.00 (Enter 0 for Free)"
          />
        </div>
      </div>

      {initialData && (
        <div className="form-group">
          <label className="form-label" htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="form-textarea"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your event..."
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={submitting} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? "Saving..." : initialData ? "Update Event" : "Create Event"}
        </button>
      </div>
    </form>
  );
}
