import React from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, CheckCircle2 } from "lucide-react";
import Badge from "../common/Badge";
import { getEventImageUrl } from "../../utils/eventImage";

export default function EventCard({ event, isRegistered, actionLabel, onAction }) {
  if (!event) return null;

  const eventId = event.event_id || event.id;
  const imageUrl = getEventImageUrl(event);
  
  const dateObj = event.event_date ? new Date(event.event_date) : null;
  const dateStr = dateObj
    ? dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    : "TBA";

  const venueName = event.venue_name || event.venue || event.address || "Venue TBA";

  const defaultBtnLabel = isRegistered ? "Registered • View Pass" : "Register Event →";
  const btnLabel = actionLabel || defaultBtnLabel;

  return (
    <div
      className="card card-hover"
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: 0,
        height: "100%",
      }}
    >
      <div style={{ position: "relative", height: "180px", width: "100%", overflow: "hidden" }}>
        <img
          src={imageUrl}
          alt={event.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
        <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "0.5rem" }}>
          <Badge variant="primary">{event.category || "General"}</Badge>
          {event.is_completed && (
            <Badge variant="neutral">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                <CheckCircle2 size={12} /> Completed
              </span>
            </Badge>
          )}
          {isRegistered && <Badge variant="success">Registered</Badge>}
        </div>
        <div style={{ position: "absolute", top: "12px", right: "12px" }}>
          <Badge variant={Number(event.ticket_price || 0) > 0 ? "warning" : "success"}>
            {Number(event.ticket_price || 0) > 0 ? `₹${Number(event.ticket_price).toFixed(0)}` : "Free"}
          </Badge>
        </div>
      </div>

      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1, gap: "0.75rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
          {event.title}
        </h3>

        {event.description && (
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {event.description}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "auto", fontSize: "0.825rem", color: "var(--text-muted)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={14} />
            <span>{dateStr}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPin size={14} />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{venueName}</span>
          </div>
          {event.available_seats !== undefined && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Users size={14} />
              <span>{event.available_seats} / {event.capacity} seats left</span>
            </div>
          )}
        </div>

        {!event.is_completed && (
          <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)", marginTop: "0.25rem" }}>
            {onAction ? (
              <button onClick={() => onAction(event)} className={`btn btn-sm ${isRegistered ? "btn-secondary" : "btn-primary"}`} style={{ width: "100%" }}>
                {btnLabel}
              </button>
            ) : (
              <Link to={`/events/${eventId}`} className={`btn btn-sm ${isRegistered ? "btn-secondary" : "btn-primary"}`} style={{ width: "100%" }}>
                {btnLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
