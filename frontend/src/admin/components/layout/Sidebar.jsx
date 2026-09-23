// Sidebar.jsx
// Admin sidebar navigation with all pages + Create Event modal.

import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Users,
  Mic,
  MapPin,
  Ticket,
  MessageSquare,
  Star,
  BarChart3,
  Bot,
  Settings,
  Sparkles,
  Check,
} from "lucide-react";
import Modal from "../common/Modal";
import { createEvent } from "../../services/eventService";
import { toast } from "sonner";

const mainNav = [
  { label: "Dashboard", page: "home", icon: LayoutDashboard },
  { label: "Events", page: "events", icon: CalendarDays },
  { label: "Create Event", page: "calendar", icon: PlusCircle },
  { label: "Attendees", page: "registrations", icon: Users },
  { label: "Speakers", page: "speakers", icon: Mic },
  { label: "Venues", page: "venues", icon: MapPin },
  { label: "Tickets", page: "tickets", icon: Ticket },
  { label: "Communications", page: "communications", icon: MessageSquare },
  { label: "Feedback", page: "feedback", icon: Star },
  { label: "Analytics", page: "reports", icon: BarChart3 },
  { label: "AI Assistant", page: "ai-assistant", icon: Bot },
  { label: "Settings", page: "settings", icon: Settings },
];

function Sidebar({ currentPage, onPageChange, sidebarOpen, onClose }) {
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    capacity: "",
  });

  function handleNavClick(page) {
    onPageChange(page);
    if (typeof window !== "undefined" && window.innerWidth < 1024 && onClose) {
      onClose();
    }
  }

  function openCreateModal() {
    setForm({ title: "", date: "", time: "", venue: "", capacity: "" });
    setShowCreate(true);
  }

  function closeCreateModal() {
    setShowCreate(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSaving(true);
    try {
      await createEvent({
        title: form.title,
        date: form.date,
        time: form.time,
        venue: form.venue,
        capacity: parseInt(form.capacity, 10) || 0,
      });

      toast.success(`Event "${form.title}" created`);
      setShowCreate(false);
      setForm({ title: "", date: "", time: "", venue: "", capacity: "" });
      onPageChange("events");
    } catch (err) {
      console.error("Failed to create event:", err);
      toast.error(
        err?.message || "Failed to create event. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-65 flex-col",
          "border-r border-theme bg-theme-secondary",
          "transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex h-18 items-center gap-3 border-b border-theme px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight text-theme-primary">
              Smart Event
            </p>
            <p className="text-[11px] font-medium text-theme-muted">
              Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-0.5">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => handleNavClick(item.page)}
                  className={`nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} strokeWidth={1.9} />
                  <span className="flex-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom CTA Card */}
        <div className="border-t border-theme p-3">
          <div className="rounded-xl bg-theme-accent-light p-4 text-center">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600/10">
              <Sparkles size={18} className="text-indigo-600" />
            </div>

            <p className="text-xs font-bold text-theme-primary">
              Make Every Event a Success!
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              <PlusCircle size={13} />
              Create Event
            </button>
          </div>
        </div>
      </aside>

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreate}
        onClose={closeCreateModal}
        title="Create New Event"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="sb-event-title"
              className="mb-1.5 block text-xs font-semibold text-theme-secondary"
            >
              Event Title
            </label>
            <input
              id="sb-event-title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g., Tech Fest 2026"
              className="w-full rounded-lg border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sb-event-date"
                className="mb-1.5 block text-xs font-semibold text-theme-secondary"
              >
                Date
              </label>
              <input
                id="sb-event-date"
                name="date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="w-full rounded-lg border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-indigo-400"
              />
            </div>
            <div>
              <label
                htmlFor="sb-event-time"
                className="mb-1.5 block text-xs font-semibold text-theme-secondary"
              >
                Time
              </label>
              <input
                id="sb-event-time"
                name="time"
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm((p) => ({ ...p, time: e.target.value }))
                }
                className="w-full rounded-lg border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sb-event-venue"
                className="mb-1.5 block text-xs font-semibold text-theme-secondary"
              >
                Venue
              </label>
              <input
                id="sb-event-venue"
                name="venue"
                type="text"
                value={form.venue}
                onChange={(e) =>
                  setForm((p) => ({ ...p, venue: e.target.value }))
                }
                placeholder="e.g., Auditorium"
                className="w-full rounded-lg border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-indigo-400"
              />
            </div>
            <div>
              <label
                htmlFor="sb-event-capacity"
                className="mb-1.5 block text-xs font-semibold text-theme-secondary"
              >
                Capacity
              </label>
              <input
                id="sb-event-capacity"
                name="capacity"
                type="number"
                value={form.capacity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, capacity: e.target.value }))
                }
                placeholder="500"
                className="w-full rounded-lg border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={closeCreateModal}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.title.trim()}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                "Creating..."
              ) : (
                <>
                  <Check size={14} /> Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Sidebar;