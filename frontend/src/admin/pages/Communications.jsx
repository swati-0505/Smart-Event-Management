// Communications.jsx
// Communications — messages, emails, notifications.

import { useState } from "react";
import {
  Search,
  Send,
  Mail,
  MessageSquare,
  Bell,
  Users,
  MoreVertical,
} from "lucide-react";
import PageWrapper from "../components/common/PageWrapper";
import { toast } from "sonner";

const inbox = [
  {
    id: 1,
    type: "email",
    from: "Priya Sharma",
    subject: "Speaker confirmation for AI Conference",
    preview: "Hi, I'd be happy to speak at the event...",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    type: "message",
    from: "Rahul Verma",
    subject: "Venue availability question",
    preview: "Can we book the auditorium for 25 Sep?",
    time: "25 min ago",
    unread: true,
  },
  {
    id: 3,
    type: "notification",
    from: "System",
    subject: "Payment received",
    preview: "₹499 received from user #4521",
    time: "1 hour ago",
    unread: false,
  },
  {
    id: 4,
    type: "email",
    from: "Sarah Khan",
    subject: "Feedback on last event",
    preview: "The event was great, but I suggest...",
    time: "3 hours ago",
    unread: false,
  },
];

const typeIcons = {
  email: Mail,
  message: MessageSquare,
  notification: Bell,
};

const typeColors = {
  email: "bg-blue-100 text-blue-600",
  message: "bg-emerald-100 text-emerald-600",
  notification: "bg-amber-100 text-amber-600",
};

function Communications() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = inbox.filter((msg) => {
    const s = search.trim().toLowerCase();
    const matchS =
      !s ||
      msg.from.toLowerCase().includes(s) ||
      msg.subject.toLowerCase().includes(s);
    const matchF = filter === "all" || msg.type === filter;
    return matchS && matchF;
  });

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">
              Communications
            </h1>
            <p className="mt-1 text-sm text-theme-muted">
              Messages, emails and notifications in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast.success("Compose opened")}
            className="btn-primary shrink-0"
          >
            <Send size={16} />
            Compose
          </button>
        </div>

        {/* Filters */}
        <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-theme bg-theme-tertiary px-3 py-2">
            <Search size={15} className="text-theme-muted" />
            <input
              id="comm-search"
              name="comm-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="min-w-0 flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-dim"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-theme bg-theme-tertiary p-0.5">
            {[
              { key: "all", label: "All" },
              { key: "email", label: "Emails" },
              { key: "message", label: "Messages" },
              { key: "notification", label: "Alerts" },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  filter === f.key
                    ? "bg-indigo-600 text-white"
                    : "text-theme-muted hover:text-theme-primary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inbox list */}
        <div className="card divide-y divide-[var(--border-color)] overflow-hidden">
          {filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-theme-muted">
              No messages found.
            </div>
          )}

          {filtered.map((msg) => {
            const Icon = typeIcons[msg.type] || Mail;
            return (
              <div
                key={msg.id}
                className={`flex cursor-pointer items-start gap-3 p-4 transition hover:bg-theme-hover ${
                  msg.unread ? "bg-indigo-50/30" : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColors[msg.type]}`}
                >
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-theme-primary">
                      {msg.from}
                    </p>
                    <span className="shrink-0 text-[11px] text-theme-dim">
                      {msg.time}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-theme-secondary">
                    {msg.subject}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-theme-muted">
                    {msg.preview}
                  </p>
                </div>

                {/* Unread dot + menu */}
                <div className="flex shrink-0 items-center gap-2">
                  {msg.unread && (
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  )}
                  <button
                    type="button"
                    className="btn-ghost"
                    aria-label="Message actions"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}

export default Communications;