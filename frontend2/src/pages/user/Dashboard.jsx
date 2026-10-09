import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import {
  Ticket,
  Calendar,
  User,
  ArrowRight,
  CheckCircle2,
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import { getUserRegistrations } from "../../services/registrationService";
import { getEventById } from "../../services/eventService";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Badge from "../../components/common/Badge";


const DashboardCanvas = lazy(() =>
  import("../../components/three/DashboardCanvas")
);

export default function UserDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [eventsMap, setEventsMap] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUserDashboard = () => {
    setLoading(true);
    setError("");

    getUserRegistrations(user.id)
      .then(async (regs) => {
        const activeRegs = Array.isArray(regs)
          ? regs.filter((r) => r.status?.toLowerCase() !== "cancelled")
          : [];
        setRegistrations(activeRegs);

        const eventIds = [...new Set(activeRegs.map((r) => r.event_id))];
        const map = {};
        await Promise.all(
          eventIds.map(async (id) => {
            try {
              map[id] = await getEventById(id);
            } catch (e) {
              console.warn("Could not fetch event", id, e);
            }
          })
        );
        setEventsMap(map);
      })
      .catch((err) => setError(err.message || "Failed to load dashboard data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.id) {
      loadUserDashboard();
    }
    const handleRegistrationChange = () => {
      if (user?.id) {
        loadUserDashboard();
      }
    };
    window.addEventListener("registration-changed", handleRegistrationChange);
    return () => {
      window.removeEventListener("registration-changed", handleRegistrationChange);
    };
  }, [user]);

  if (loading) return <PageLoader message="Loading your dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={loadUserDashboard} />;

  const validRegs = registrations.filter((r) => r.status?.toLowerCase() !== "cancelled");
  const confirmedCount = validRegs.filter((r) => r.status?.toLowerCase() === "confirmed" || r.status?.toUpperCase() === "CONFIRMED").length;
  const upcomingEvents = Object.values(eventsMap).filter(
    (e) => e?.event_date && new Date(e.event_date) > new Date()
  );

  const stats = [
    {
      icon: <Ticket size={22} />,
      value: validRegs.length,
      label: "Active Registrations",
      bg: "rgba(99, 102, 241, 0.15)",
      color: "var(--color-primary)",
    },
    {
      icon: <CheckCircle2 size={22} />,
      value: confirmedCount,
      label: "Confirmed Passes",
      bg: "rgba(34, 197, 94, 0.12)",
      color: "#16a34a",
    },
    {
      icon: <Calendar size={22} />,
      value: upcomingEvents.length,
      label: "Upcoming Events",
      bg: "rgba(245, 158, 11, 0.12)",
      color: "#d97706",
    },
    {
      icon: <Star size={22} />,
      value: registrations.length,
      label: "Total Attended",
      bg: "rgba(168, 85, 247, 0.12)",
      color: "#9333ea",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", position: "relative" }}>

      
      <div
        style={{
          position: "relative",
          borderRadius: "var(--radius-2xl)",
          overflow: "hidden",
          minHeight: "220px",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 75%, #6366f1 100%)",
        }}
      >
        
        <Suspense fallback={null}>
          <DashboardCanvas />
        </Suspense>

        
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "2.5rem 2.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "rgba(199, 210, 254, 0.9)",
                textTransform: "uppercase",
                background: "rgba(255,255,255,0.08)",
                padding: "3px 10px",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Sparkles size={12} /> SmartEvent Dashboard
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.15,
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            }}
          >
            Welcome back,{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #c7d2fe, #a5b4fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {user?.name || "Attendee"}!
            </span>{" "}
            👋
          </h1>

          <p
            style={{
              color: "rgba(199, 210, 254, 0.85)",
              fontSize: "1rem",
              maxWidth: "560px",
              lineHeight: 1.6,
            }}
          >
            Track your registered events, access ticket confirmations, and
            discover upcoming technology conferences — all in one place.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
            <Link
              to="/events"
              className="btn btn-sm"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                backdropFilter: "blur(8px)",
              }}
            >
              <TrendingUp size={15} /> Explore Events
            </Link>
            <Link
              to="/my-events"
              className="btn btn-sm"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(199, 210, 254, 0.9)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Ticket size={15} /> My Registrations
            </Link>
          </div>
        </div>
      </div>

      
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "var(--shadow-lg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "14px",
                background: s.bg,
                color: s.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {s.icon}
            </div>
            <div>
              <span
                style={{
                  fontSize: "2rem",
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  display: "block",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </span>
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
            My Active Registrations
          </h2>
          <Link to="/my-events" className="btn btn-outline btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {validRegs.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No active registrations"
            description="You haven't registered for any upcoming events yet."
            action={
              <Link to="/events" className="btn btn-primary btn-sm">
                Explore Events
              </Link>
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {validRegs.slice(0, 5).map((reg) => {
              const event = eventsMap[reg.event_id];
              const dateObj = event?.event_date ? new Date(event.event_date) : null;
              const isPast = dateObj && dateObj < new Date();
              return (
                <div
                  key={reg.id || reg.registration_id}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.25rem",
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-color)",
                    gap: "1rem",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-tertiary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: isPast
                          ? "rgba(107,114,128,0.12)"
                          : "rgba(99, 102, 241, 0.12)",
                        color: isPast ? "var(--text-muted)" : "var(--color-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "0.975rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {event ? event.title : "Loading event…"}
                      </h4>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {dateObj
                          ? dateObj.toLocaleDateString(undefined, {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : `Registered: ${reg.registered_at ? new Date(reg.registered_at).toLocaleDateString() : "Recently"}`}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Badge variant={reg.status === "CONFIRMED" ? "success" : "neutral"}>
                      {reg.status || "CONFIRMED"}
                    </Badge>
                    {event && (
                      <Link
                        to={`/events/${event.event_id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        Details <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
