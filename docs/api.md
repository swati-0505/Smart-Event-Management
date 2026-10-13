# API Documentation

This document summarizes the main HTTP API routes defined in the Smart Event Management System backend. Routes are implemented using FastAPI and use request/response schemas, service functions, and database sessions.

## 1. Authentication API

Base path: `/api/auth`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Log in with credentials and obtain a token | Public |
| GET | `/api/auth/me` | Retrieve the current authenticated user's profile | Authenticated user |

Registration checks whether the email is already registered and returns an error if it is. Passwords are hashed before being stored.

## 2. Event API

Base path: `/api/events`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/events/` | Retrieve all events | Public |
| GET | `/api/events/published` | Retrieve published events | Public |
| GET | `/api/events/{event_id}` | Retrieve an event by its ID | Public |
| POST | `/api/events/` | Create an event | Admin |
| PUT | `/api/events/{event_id}` | Update an event | Admin |
| DELETE | `/api/events/{event_id}` | Delete an event | Admin |

Event identifiers use UUIDs. The backend delegates event operations to the event service.

## 3. User API

The repository contains user routes in both `backend/app/api/users.py` and `backend/app/routers/user.py`. Check how these routers are registered in the application before assuming all routes are active together.

### User routes in `backend/app/api/users.py`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/users/` | List users | Admin |
| GET | `/api/users/{user_id}` | Retrieve a user by ID | Admin |

### User routes in `backend/app/routers/user.py`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/users/` | List users | Admin |
| GET | `/api/users/email/{email}` | Retrieve a user by email | Admin |
| GET | `/api/users/{user_id}` | Retrieve a user by ID | Admin |
| POST | `/api/users/` | Create a user | Admin |
| PATCH | `/api/users/{user_id}/role` | Update a user's role | Main admin |
| DELETE | `/api/users/{user_id}` | Delete a user | Admin |

The user-management routes use service functions and response schemas. Role changes require the `require_main_admin` dependency in the router implementation.

## 4. Registration API

Base path: `/api/registrations`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/registrations/` | List registrations | Admin |
| GET | `/api/registrations/{registration_id}` | Retrieve a registration by ID | Authenticated user; ownership restrictions apply |
| POST | `/api/registrations/` | Create a registration | Authenticated user |
| GET | `/api/registrations/user/{user_id}` | Retrieve registrations for a user | Authenticated user; verify ownership checks |
| GET | `/api/registrations/event/{event_id}` | Retrieve registrations for an event | Admin |
| PUT | `/api/registrations/{registration_id}/cancel` | Cancel a registration | Authenticated user; ownership restrictions apply |

Registration operations are handled by the registration service. The implementation checks the current user's permissions when retrieving or cancelling individual registrations.

## 5. Venue API

Base path: `/api/venues`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/venues/` | Create a venue | Admin |
| GET | `/api/venues/` | List venues | Public |
| GET | `/api/venues/{venue_id}` | Retrieve a venue by ID | Public |
| PUT | `/api/venues/{venue_id}` | Update a venue | Admin |
| DELETE | `/api/venues/{venue_id}` | Delete a venue | Admin |

Creating a venue accepts venue details such as name, address, city, and capacity. Venue operations are handled by the venue service.

## 6. Payment API

Base path: `/api/payments`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/payments/` | List payments | Admin |
| GET | `/api/payments/{payment_id}` | Retrieve a payment by ID | Admin |
| GET | `/api/payments/user/{user_id}` | Retrieve payments for a user | Admin |
| GET | `/api/payments/event/{event_id}` | Retrieve payments for an event | Admin |
| POST | `/api/payments/` | Create a payment record | Authenticated user |
| PUT | `/api/payments/{payment_id}/status` | Update payment status | Admin |

Payment routes use the payment service and payment schemas. These routes document the backend interface; they do not, by themselves, confirm integration with a live payment gateway.

## 7. Feedback API

Base path: `/api/feedback`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/feedback/` | Retrieve all feedback | Admin |
| GET | `/api/feedback/event/{event_id}` | Retrieve feedback for an event | Admin |
| GET | `/api/feedback/user/{user_id}` | Retrieve feedback for a user | Admin |
| POST | `/api/feedback/` | Submit feedback | Verify authentication and ownership checks in the implementation |

Feedback operations use the feedback service and feedback schemas.

## 8. Administration API

Base path: `/api/admin`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Retrieve admin dashboard information | Admin |
| GET | `/api/admin/cache/status` | Retrieve Redis cache health and statistics | Admin |
| DELETE | `/api/admin/cache/clear` | Clear Redis cache entries | Verify the actual permission dependency |

The cache-clear route's summary says Main Admin only, but the displayed implementation uses `require_admin`. Confirm the actual permission check before documenting it as restricted to Main Admin.

## 9. AI Chat and Knowledge API

The following paths are defined in `backend/app/api/chat.py`. Confirm the router registration in `backend/app/main.py` before treating these paths as complete externally accessible URLs.

| Method | Route path | Purpose | Access |
|---|---|---|---|
| POST | `/chat` | Send a message to the AI assistant | Optional authentication in the route dependency |
| GET | `/chat/sessions` | List the current user's chat sessions | Authenticated user |
| DELETE | `/chat/sessions/{session_id}` | Delete a chat session | Authenticated user |
| DELETE | `/chat/sessions` | Delete multiple chat sessions | Authenticated user |
| GET | `/chat/sessions/{session_id}` | Retrieve messages for a chat session | Authenticated user |
| GET | `/admin/agent-activity` | List recent agent activity | Admin |
| GET | `/admin/agent-activity/{run_id}` | Retrieve agent run details | Admin |
| POST | `/admin/knowledge/upload` | Upload a knowledge document | Admin |
| POST | `/admin/knowledge/ingest` | Ingest knowledge documents | Admin |
| GET | `/admin/knowledge/status` | Retrieve knowledge ingestion status | Admin |

The AI routes integrate with the agent, chat memory, observability, and retrieval-augmented generation (RAG) modules. Knowledge upload and ingestion accept options for reprocessing and selecting a target index.

## 10. General API Notes

- The backend uses FastAPI and Pydantic schemas for request validation and response formatting.
- Database operations use SQLAlchemy sessions.
- UUIDs are used for several resource identifiers.
- Authentication and role-based access control are enforced through dependencies such as `get_current_user`, `require_admin`, and `require_main_admin`.
- Missing resources may return HTTP `404`, while duplicate registration emails return HTTP `400`.
- For the authoritative interactive API reference, start the backend and inspect its generated FastAPI documentation, typically available at `/docs` if the application retains the default OpenAPI documentation route.
- Verify router registration and permissions against the current source before using this document as a complete API contract.
