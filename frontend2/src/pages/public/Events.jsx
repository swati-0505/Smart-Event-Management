import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { getPublishedEvents } from "../../services/eventService";
import { getUserRegistrations } from "../../services/registrationService";
import { useAuth } from "../../auth/AuthProvider";
import EventGrid from "../../components/event/EventGrid";
import EventFilters from "../../components/event/EventFilters";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";

export default function Events() {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const loadEvents = () => {
    setLoading(true);
    setError("");
    Promise.all([
      getPublishedEvents(),
      isAuthenticated && user?.id ? getUserRegistrations(user.id).catch(() => []) : Promise.resolve([]),
    ])
      .then(([eventsData, regsData]) => {
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setUserRegistrations(Array.isArray(regsData) ? regsData : []);
      })
      .catch((err) => setError(err.message || "Failed to load events."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();

    const handleRegistrationChange = () => {
      loadEvents();
    };
    window.addEventListener("registration-changed", handleRegistrationChange);
    return () => {
      window.removeEventListener("registration-changed", handleRegistrationChange);
    };
  }, [user, isAuthenticated]);

  const registeredEventIds = useMemo(() => {
    const set = new Set();
    userRegistrations.forEach((r) => {
      if (r.status?.toLowerCase() !== "cancelled") {
        set.add(r.event_id);
      }
    });
    return set;
  }, [userRegistrations]);

  
  const categories = useMemo(() => {
    const set = new Set();
    events.forEach((ev) => {
      if (!ev.is_completed && ev.category) set.add(ev.category);
    });
    return Array.from(set);
  }, [events]);

  
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (ev.is_completed) return false;
      const matchesCat = selectedCategory === "ALL" || ev.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (ev.title && ev.title.toLowerCase().includes(q)) ||
        (ev.description && ev.description.toLowerCase().includes(q)) ||
        (ev.category && ev.category.toLowerCase().includes(q)) ||
        (ev.address && ev.address.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  return (
    <div style={{ padding: "3rem 0 5rem" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "var(--font-4xl)", fontWeight: 900, marginBottom: "0.5rem" }}>
              Explore Events
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-lg)" }}>
              Find technology conferences, interactive workshops, and networking sessions.
            </p>
          </div>
          <Link to="/completed-events" className="btn btn-secondary">
            <CheckCircle2 size={17} /> Completed Events
          </Link>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={loadEvents} />
        ) : loading ? (
          <PageLoader message="Fetching available events..." />
        ) : (
          <>
            <EventFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
            />

            <EventGrid
              events={filteredEvents}
              registeredEventIds={registeredEventIds}
              emptyTitle="No events found"
              emptyDescription={
                searchQuery || selectedCategory !== "ALL"
                  ? "Try adjusting your filters or search terms."
                  : "No published events are available right now."
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
