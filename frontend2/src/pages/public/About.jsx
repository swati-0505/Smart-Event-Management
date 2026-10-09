import React from "react";
import { Shield, Cpu, Users, Award } from "lucide-react";

export default function About() {
  return (
    <div style={{ padding: "4rem 0 6rem" }}>
      <div className="container" style={{ maxWidth: "850px" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span className="badge badge-primary" style={{ marginBottom: "0.75rem" }}>About Us</span>
          <h1 style={{ fontSize: "var(--font-4xl)", fontWeight: 900, marginBottom: "1rem" }}>
            Reinventing Event Management
          </h1>
          <p style={{ fontSize: "var(--font-lg)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            SmartEvent is a modern, AI-integrated platform built to simplify how organizations host, manage, and scale high-impact events.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
          <div className="card">
            <Cpu size={28} style={{ color: "var(--color-primary)", marginBottom: "0.75rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>AI-Driven Insights</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Retrieval-augmented generation (RAG) assistant connected directly to event policies and venue statistics.
            </p>
          </div>

          <div className="card">
            <Shield size={28} style={{ color: "var(--color-success)", marginBottom: "0.75rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Enterprise Security</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              JWT authenticated role-based access control protecting user data and administrative powers.
            </p>
          </div>

          <div className="card">
            <Users size={28} style={{ color: "var(--color-info)", marginBottom: "0.75rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Seamless Registration</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Real-time seat capacity updates and instant check-in verification for attendees.
            </p>
          </div>

          <div className="card">
            <Award size={28} style={{ color: "var(--color-warning)", marginBottom: "0.75rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Venue Intelligence</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Intelligent venue matching based on geographical cities and attendee capacities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
