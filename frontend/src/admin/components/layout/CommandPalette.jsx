// CommandPalette.jsx
// Modern command palette (Ctrl+K) for quick navigation.

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
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
  ArrowRight,
  Command,
  X,
} from "lucide-react";

function CommandPalette({ isOpen, onClose, onPageChange }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const allCommands = useMemo(
    () => [
      {
        id: "page-home",
        category: "Pages",
        label: "Dashboard",
        icon: LayoutDashboard,
        action: () => onPageChange("home"),
        keywords: "home dashboard overview",
      },
      {
        id: "page-events",
        category: "Pages",
        label: "Events",
        icon: CalendarDays,
        action: () => onPageChange("events"),
        keywords: "events management",
      },
      {
        id: "page-calendar",
        category: "Pages",
        label: "Create Event",
        icon: PlusCircle,
        action: () => onPageChange("calendar"),
        keywords: "create event calendar",
      },
      {
        id: "page-registrations",
        category: "Pages",
        label: "Attendees",
        icon: Users,
        action: () => onPageChange("registrations"),
        keywords: "attendees registrations users",
      },
      {
        id: "page-speakers",
        category: "Pages",
        label: "Speakers",
        icon: Mic,
        action: () => onPageChange("speakers"),
        keywords: "speakers presenters",
      },
      {
        id: "page-venues",
        category: "Pages",
        label: "Venues",
        icon: MapPin,
        action: () => onPageChange("venues"),
        keywords: "venues locations",
      },
      {
        id: "page-tickets",
        category: "Pages",
        label: "Tickets",
        icon: Ticket,
        action: () => onPageChange("tickets"),
        keywords: "tickets payments revenue",
      },
      {
        id: "page-communications",
        category: "Pages",
        label: "Communications",
        icon: MessageSquare,
        action: () => onPageChange("communications"),
        keywords: "communications messages emails",
      },
      {
        id: "page-feedback",
        category: "Pages",
        label: "Feedback",
        icon: Star,
        action: () => onPageChange("feedback"),
        keywords: "feedback reviews ratings stars comments",
      },
      {
        id: "page-reports",
        category: "Pages",
        label: "Analytics",
        icon: BarChart3,
        action: () => onPageChange("reports"),
        keywords: "reports analytics stats",
      },
      {
        id: "page-ai",
        category: "Pages",
        label: "AI Assistant",
        icon: Bot,
        action: () => onPageChange("ai-assistant"),
        keywords: "ai chat assistant bot",
      },
      {
        id: "page-settings",
        category: "Pages",
        label: "Settings",
        icon: Settings,
        action: () => onPageChange("settings"),
        keywords: "settings config preferences",
      },
    ],
    [onPageChange]
  );

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase().trim();
    return allCommands.filter((cmd) => {
      return (
        cmd.label.toLowerCase().includes(q) ||
        cmd.keywords?.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
      );
    });
  }, [query, allCommands]);

  const groupedCommands = useMemo(() => {
    const groups = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const flatList = useMemo(() => filteredCommands, [filteredCommands]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatList.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : flatList.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatList[selectedIndex]) {
          flatList[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, flatList, selectedIndex, onClose]);

  useEffect(() => {
    const selectedEl = listRef.current?.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    selectedEl?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[15vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-theme bg-theme-secondary shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-theme px-4 py-3">
          <Search size={18} className="text-theme-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, actions..."
            className="flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-dim"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-theme-muted transition hover:bg-theme-hover hover:text-theme-primary"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2" ref={listRef}>
          {flatList.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <Search size={24} className="text-theme-dim" />
              <p className="text-sm font-medium text-theme-primary">
                No results found
              </p>
              <p className="text-xs text-theme-muted">
                Try searching for pages or actions
              </p>
            </div>
          )}

          {Object.entries(groupedCommands).map(([category, items]) => (
            <div key={category} className="mb-2">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-theme-dim">
                {category}
              </p>
              {items.map((cmd) => {
                const currentIndex = flatIndex++;
                const Icon = cmd.icon;
                const isSelected = currentIndex === selectedIndex;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    data-index={currentIndex}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-theme-secondary hover:bg-theme-hover"
                    }`}
                  >
                    <Icon size={16} strokeWidth={1.8} />
                    <span className="flex-1 text-sm font-medium">
                      {cmd.label}
                    </span>
                    <ArrowRight
                      size={14}
                      className={`transition ${
                        isSelected ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-theme px-4 py-2.5 text-[11px] text-theme-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-theme bg-theme-tertiary px-1.5 py-0.5 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="rounded border border-theme bg-theme-tertiary px-1.5 py-0.5 font-mono text-[10px]">
                ↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-theme bg-theme-tertiary px-1.5 py-0.5 font-mono text-[10px]">
                ↵
              </kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-theme bg-theme-tertiary px-1.5 py-0.5 font-mono text-[10px]">
                Esc
              </kbd>
              Close
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command size={11} />
            <span>Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;