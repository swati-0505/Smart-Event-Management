# Event Policy

## Creating events

Only users with the ADMIN role may create, update or cancel events. Every event
requires a title, category, venue, start date and time, and a capacity.

## Event lifecycle

Events move through three statuses:

- **draft** — created but not visible to users. Not open for registration.
- **published** — visible and open for registration.
- **cancelled** — no longer running. Registration history is retained.

Cancelled events are never deleted, so that registration and attendance records
remain available for reporting.

## Capacity changes

An event's capacity may be increased at any time. It may be reduced only to a
number at or above the count of existing confirmed registrations; the system
rejects reductions that would invalidate bookings already made.

## Categories

Events are grouped by category, for example workshop, seminar, hackathon,
conference or cultural. Category is used for search and filtering and should
describe the event's format rather than its subject.

## Scheduling

An event must have a venue assigned before it can be published. Two events may not
be scheduled at the same venue within three hours of each other; the system checks
for this conflict when an event is created.

## Communication

Participants are contacted using the email address on their account. Keeping that
address current is the participant's responsibility.
