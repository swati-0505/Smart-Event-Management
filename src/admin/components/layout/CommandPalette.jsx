// CommandPalette.jsx
// Modern command palette (Ctrl+K) for quick navigation and actions.

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  LayoutDashboard,
  CalendarDays,
  Building2,
  ClipboardList,
  CreditCard,
  MessageSquare,
  Users,
  Bot,
  Activity,
  Settings,
  Plus,
  ArrowRight,
  Command,
  X,
} from "lucide-react";

function CommandPalette({
  isOpen,
  onClose,
  onPageChange,
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // All available commands
  const allCommands = useMemo(
    () => [
      // PAGES
      {
        id: "page-dashboard",
        category: "Pages",
        label: "Dashboard",
        icon: LayoutDashboard,
        action: () => onPageChange("dashboard"),
        keywords: "home overview",
      },
      {
        id: "page-events",
        category: "Pages",
        label: "Events",
        icon: CalendarDays,
        action: () => onPageChange("events"),
        keywords: "event management",
      },
      {
        id: "page-venues",
        category: "Pages",
        label: "Venues",
        icon: Building2,
        action: () => onPageChange("venues"),
        keywords: "venue location",
      },
      {
        id: "page-registrations",
        category: "Pages",
        label: "Registrations",
        icon: ClipboardList,
        action: () => onPageChange("registrations"),
        keywords: "registration signup",
      },
      {
        id: "page-payments",
        category: "Pages",
        label: "Payments",
        icon: CreditCard,
        action: () => onPageChange("payments"),
        keywords: "payment transaction money",
      },
      {
        id: "page-feedback",
        category: "Pages",
        label: "Feedback",
        icon: MessageSquare,
        action: () => onPageChange("feedback"),
        keywords: "feedback review rating",
      },
      {
        id: "page-users",
        category: "Pages",
        label: "Users",
        icon: Users,
        action: () => onPageChange("users"),
        keywords: "user account",
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
        id: "page-agent",
        category: "Pages",
        label: "Agent Activity",
        icon: Activity,
        action: () => onPageChange("agent-activity"),
        keywords: "agent activity logs",
      },
      {
        id: "page-settings",
        category: "Pages",
        label: "Settings",
        icon: Settings,
        action: () => onPageChange("settings"),
        keywords: "settings config preferences",
      },

      // ACTIONS
      {
        id: "action-create-event",
        category: "Actions",
        label: "Create New Event",
        icon: Plus,
        action: () => {
          onPageChange("events");
        },
        keywords: "create new add event",
      },
      {
        id: "action-add-venue",
        category: "Actions",
        label: "Add New Venue",
        icon: Plus,
        action: () => {
          onPageChange("venues");
        },
        keywords: "add new venue",
      },
    ],
    [onPageChange]
  );

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands;

    const q = query.toLowerCase().trim();

    return allCommands.filter((cmd) => {
      const labelMatch = cmd.label.toLowerCase().includes(q);
      const keywordMatch = cmd.keywords?.toLowerCase().includes(q);
      const categoryMatch = cmd.category.toLowerCase().includes(q);

      return labelMatch || keywordMatch || categoryMatch;
    });
  }, [query, allCommands]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups = {};

    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  // Flatten for keyboard navigation
  const flatList = useMemo(
    () => filteredCommands,
    [filteredCommands]
  );

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
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

  // Scroll selected item into view
  useEffect(() => {
    const selectedEl = listRef.current?.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    selectedEl?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Render groups
  let flatIndex = 0;

  return (
    <div
      className="cmd-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="cmd-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="cmd-input-wrapper">
          <Search size={18} className="cmd-input-icon" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, actions..."
            className="cmd-input"
            autoComplete="off"
          />

          <button
            type="button"
            onClick={onClose}
            className="cmd-close-btn"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="cmd-results" ref={listRef}>
          {flatList.length === 0 && (
            <div className="cmd-empty">
              <Search size={24} className="cmd-empty-icon" />
              <p className="cmd-empty-title">No results found</p>
              <p className="cmd-empty-desc">
                Try searching for pages, actions, or settings
              </p>
            </div>
          )}

          {Object.entries(groupedCommands).map(([category, items]) => (
            <div key={category} className="cmd-group">
              <p className="cmd-group-label">{category}</p>

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
                    className={`cmd-item ${
                      isSelected ? "cmd-item-selected" : ""
                    }`}
                  >
                    <div className="cmd-item-icon">
                      <Icon size={16} strokeWidth={1.8} />
                    </div>

                    <span className="cmd-item-label">{cmd.label}</span>

                    <ArrowRight
                      size={14}
                      className="cmd-item-arrow"
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="cmd-footer">
          <div className="cmd-footer-hint">
            <kbd className="cmd-kbd">↑</kbd>
            <kbd className="cmd-kbd">↓</kbd>
            <span>Navigate</span>
          </div>

          <div className="cmd-footer-hint">
            <kbd className="cmd-kbd">↵</kbd>
            <span>Select</span>
          </div>

          <div className="cmd-footer-hint">
            <kbd className="cmd-kbd">Esc</kbd>
            <span>Close</span>
          </div>

          <div className="cmd-footer-brand">
            <Command size={12} />
            <span>Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;