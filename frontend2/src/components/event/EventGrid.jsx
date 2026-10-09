import React from "react";
import EventCard from "./EventCard";
import EmptyState from "../common/EmptyState";
import { Calendar } from "lucide-react";

export default function EventGrid({ events = [], registeredEventIds, actionLabel, onAction, emptyTitle, emptyDescription }) {
  if (!events || events.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title={emptyTitle || "No events found"}
        description={emptyDescription || "There are no events matching your criteria."}
      />
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1.5rem",
        width: "100%",
      }}
    >
      {events.map((event) => {
        const id = event.event_id || event.id;
        const isRegistered = registeredEventIds ? registeredEventIds.has(id) : false;
        return (
          <EventCard
            key={id}
            event={event}
            isRegistered={isRegistered}
            actionLabel={actionLabel}
            onAction={onAction}
          />
        );
      })}
    </div>
  );
}
