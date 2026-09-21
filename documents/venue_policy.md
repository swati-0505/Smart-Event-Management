# Venue Policy

## Venue records

Each venue has a name, address, city and maximum capacity. Capacity is the
occupancy limit for the space and may not be exceeded by an event's registration
capacity.

## Availability

A venue is treated as unavailable if another event with `draft` or `published`
status is scheduled there within three hours either side of the requested time.
This window covers setup, the event itself, and clearing the space afterwards.

Cancelled events do not block a venue. Cancelling an event frees its slot
immediately.

## Booking priority

Venue slots are allocated in the order events are created. There is no priority
tier; an event already holding a slot keeps it unless it is cancelled or
rescheduled by an administrator.

## Capacity matching

An event's capacity may not exceed the venue's capacity. When checking
availability, both the schedule conflict and the size requirement are evaluated,
and either one failing makes the venue unavailable for that booking.

## Facilities

Requests for specific facilities such as projectors, audio systems or accessible
seating should be raised with the venue administrator when the event is created.
Facility availability is not tracked by the system and is not guaranteed by a
successful availability check.
