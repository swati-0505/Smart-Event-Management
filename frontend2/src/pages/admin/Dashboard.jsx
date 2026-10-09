import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  Ticket,
  MapPin,
  MessageSquare,
  CreditCard,
  Bot,
  Activity,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getDashboardStats } from "../../services/adminService";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = () => {
    setLoading(true);
    setError("");
    getDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => setError(err.message || "Failed to load dashboard statistics."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return <PageLoader message="Gathering system analytics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadStats} />;
  }

  const statCards = [
    { label: "Total Events", value: stats?.total_events || 0, icon: Calendar, color: "var(--color-primary)", path: "/admin/events" },
    { label: "Registrations", value: stats?.total_registrations || 0, icon: Ticket, color: "#10b981", path: "/admin/registrations" },
    { label: "Registered Users", value: stats?.total_users || 0, icon: Users, color: "#3b82f6", path: "/admin/users" },
    { label: "Venues Allocated", value: stats?.total_venues || 0, icon: MapPin, color: "#f59e0b", path: "/admin/venues" },
    { label: "Feedback Entries", value: stats?.total_feedback || 0, icon: MessageSquare, color: "#8b5cf6", path: "/admin/feedback" },
    { label: "Payment Records", value: stats?.total_payments || 0, icon: CreditCard, color: "#ec4899", path: "/admin/payments" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #311b92 100%)",
          color: "#fff",
          padding: "2rem 2.5rem",
          borderRadius: "var(--radius-2xl)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <span className="badge badge-primary" style={{ marginBottom: "0.5rem" }}>Live Overview</span>
          <h1 style={{ fontSize: "var(--font-3xl)", fontWeight: 800, marginBottom: "0.5rem" }}>
            Admin Control Panel
          </h1>
          <p style={{ opacity: 0.9, fontSize: "0.95rem", maxWidth: "600px" }}>
            Manage platform events, monitor real-time registrations, inspect AI logs, and configure venues.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/admin/ai-chat" className="btn btn-primary" style={{ boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)" }}>
            <Bot size={18} /> Open AI Assistant
          </Link>
        </div>
      </div>

      
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.path}
              className="card card-hover"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.25rem 1.5rem",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {card.label}
                </span>
                <span style={{ fontSize: "1.875rem", fontWeight: 900, color: "var(--text-primary)" }}>
                  {card.value}
                </span>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: `${card.color}15`,
                  color: card.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={24} />
              </div>
            </Link>
          );
        })}
      </div>

      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Activity size={22} style={{ color: "var(--color-primary)" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>AI Agent Operations</h3>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Review real-time tool calls, model reasoning latencies, and user request histories.
          </p>
          <Link to="/admin/agent-activity" className="btn btn-secondary btn-sm" style={{ marginTop: "auto" }}>
            Inspect Agent Logs <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Calendar size={22} style={{ color: "var(--color-success)" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Event Scheduling</h3>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Create new events, assign venue allocations, and set registration deadline parameters.
          </p>
          <Link to="/admin/events" className="btn btn-secondary btn-sm" style={{ marginTop: "auto" }}>
            Manage Events <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
