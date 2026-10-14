import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Zap,
  Bot,
  Star,
} from "lucide-react";
import { getPublishedEvents } from "../../services/eventService";
import { getVenues } from "../../services/venueService";
import EventGrid from "../../components/event/EventGrid";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";


const HeroCanvas = lazy(() => import("../../components/three/HeroCanvas"));

export default function Home() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHomeData = () => {
    setLoading(true);
    setError("");
    Promise.all([getPublishedEvents(), getVenues()])
      .then(([eventData, venueData]) => {
        setEvents(Array.isArray(eventData) ? eventData : []);
        setVenues(Array.isArray(venueData) ? venueData : []);
      })
      .catch((err) => setError(err.message || "Failed to load events and venues."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const features = [
    {
      icon: <Zap size={22} />,
      title: "Instant Registration",
      desc: "Reserve seats for tech summits and workshops in seconds with real-time seat tracking.",
      bg: "rgba(99, 102, 241, 0.12)",
      color: "#6366f1",
    },
    {
      icon: <MapPin size={22} />,
      title: "Smart Venues",
      desc: "Automated venue capacity monitoring and location optimization across top tech hubs.",
      bg: "rgba(34, 197, 94, 0.1)",
      color: "#16a34a",
    },
    {
      icon: <Bot size={22} />,
      title: "AI Assistant",
      desc: "Integrated RAG-powered assistant to answer event schedules, policies, and ticketing queries.",
      bg: "rgba(59, 130, 246, 0.1)",
      color: "#2563eb",
    },
    {
      icon: <ShieldCheck size={22} />,
      title: "Secure Passes",
      desc: "Every ticket cryptographically verified. Tamper-proof passes for every attendee.",
      bg: "rgba(168, 85, 247, 0.1)",
      color: "#9333ea",
    },
  ];

  const stats = [
    { value: loading ? "..." : events.length, label: "Published Events" },
    { value: loading ? "..." : venues.length, label: "Venues" },
    {
      value: loading ? "..." : events.reduce((total, event) => total + (event.available_seats || 0), 0),
      label: "Seats Available",
    },
  ];

  return (
    <div>
      
      <section
        style={{
          background: "linear-gradient(135deg, #030712 0%, #0f0c29 35%, #1e1b4b 65%, #2d1b69 100%)",
          color: "#fff",
          padding: "5.5rem 0 7rem",
          position: "relative",
          overflow: "hidden",
          minHeight: "600px",
        }}
      >
        
        <Suspense fallback={null}>
          <HeroCanvas />
        </Suspense>

        
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(99, 102, 241, 0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(3,7,18,0.7) 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        
        <div
          className="container"
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1.1rem",
              borderRadius: "var(--radius-full)",
              background: "rgba(99, 102, 241, 0.18)",
              border: "1px solid rgba(99, 102, 241, 0.45)",
              color: "#a5b4fc",
              fontSize: "0.82rem",
              fontWeight: 700,
              marginBottom: "2rem",
              letterSpacing: "0.04em",
              backdropFilter: "blur(6px)",
            }}
          >
            <Sparkles size={14} /> Intelligent Event Management Platform
          </div>

          
          <h1
            style={{
              fontSize: "clamp(2.2rem, 6vw, 4rem)",
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: "-0.025em",
              marginBottom: "1.5rem",
              background:
                "linear-gradient(180deg, #ffffff 0%, #c7d2fe 55%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
            }}
          >
            Discover, Plan, &amp; Experience
            <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg, #818cf8, #c4b5fd, #a5b4fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Extraordinary Events
            </span>
          </h1>

          
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "#94a3b8",
              lineHeight: 1.7,
              marginBottom: "2.75rem",
              maxWidth: "680px",
              marginInline: "auto",
            }}
          >
            Seamlessly browse top conferences, workshops, and corporate
            gatherings — powered by AI-driven search, automated venue
            allocation, and real-time seat tracking.
          </p>

          
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "1rem",
              marginBottom: "3.5rem",
            }}
          >
            <Link
              to="/events"
              className="btn btn-primary btn-lg"
              style={{
                boxShadow: "0 0 30px rgba(99, 102, 241, 0.45)",
                fontSize: "1rem",
              }}
            >
              Explore All Events <ArrowRight size={18} />
            </Link>
            <Link
              to="/register"
              className="btn btn-lg"
              style={{
                background: "rgba(255,255,255,0.07)",
                color: "#c7d2fe",
                borderColor: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                fontSize: "1rem",
              }}
            >
              Join SmartEvent
            </Link>
          </div>

          
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "2.5rem",
              paddingTop: "2rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 900,
                    color: "#c7d2fe",
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "#64748b",
                    fontWeight: 600,
                    marginTop: "0.25rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section
        style={{
          padding: "5rem 0",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div className="container">
          
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "var(--color-primary)",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              <Star size={12} /> Why SmartEvent
            </span>
            <h2
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              Everything you need, in one platform
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "12px",
                    background: f.bg,
                    color: f.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{f.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section style={{ padding: "5rem 0", background: "var(--bg-primary)" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "2.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "var(--color-primary)",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                <Sparkles size={12} /> Featured
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                }}
              >
                Upcoming Events
              </h2>
            </div>
            <Link to="/events" className="btn btn-outline btn-sm">
              View All Events <ArrowRight size={14} />
            </Link>
          </div>

          {error ? (
            <ErrorState message={error} onRetry={loadHomeData} />
          ) : loading ? (
            <PageLoader message="Loading upcoming events..." />
          ) : (
            <EventGrid
              events={events.slice(0, 6)}
              emptyTitle="No events available"
              emptyDescription="Check back soon for new scheduled events."
            />
          )}
        </div>
      </section>
    </div>
  );
}
