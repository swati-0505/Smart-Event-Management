// Speakers.jsx
// Speakers management — sample data (no backend yet).

import { useState, useMemo } from "react";
import { Search, Plus, Mail, Globe } from "lucide-react";
import PageWrapper from "../components/common/PageWrapper";

const sampleSpeakers = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    role: "AI Research Lead",
    company: "Google DeepMind",
    email: "priya@example.com",
    events: 5,
    color: "from-indigo-500 to-purple-600",
  },
  {
    id: 2,
    name: "Rahul Verma",
    role: "CTO",
    company: "TechNova",
    email: "rahul@example.com",
    events: 8,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 3,
    name: "Sarah Khan",
    role: "Product Designer",
    company: "Figma",
    email: "sarah@example.com",
    events: 3,
    color: "from-pink-500 to-rose-600",
  },
  {
    id: 4,
    name: "Arjun Mehta",
    role: "Startup Mentor",
    company: "YC Alumni",
    email: "arjun@example.com",
    events: 12,
    color: "from-amber-500 to-orange-600",
  },
];

function Speakers() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return sampleSpeakers;
    return sampleSpeakers.filter(
      (sp) =>
        sp.name.toLowerCase().includes(s) ||
        sp.role.toLowerCase().includes(s) ||
        sp.company.toLowerCase().includes(s)
    );
  }, [search]);

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Speakers</h1>
            <p className="mt-1 text-sm text-theme-muted">
              Manage speakers and their sessions.
            </p>
          </div>
          <button type="button" className="btn-primary shrink-0">
            <Plus size={16} />
            Add Speaker
          </button>
        </div>

        {/* Search */}
        <div className="card flex items-center gap-2 p-3">
          <Search size={16} className="text-theme-muted" />
          <input
            id="speakers-search"
            name="speakers-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search speakers..."
            className="min-w-0 flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-dim"
          />
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((speaker, idx) => (
            <div
              key={speaker.id}
              className={`card card-interactive p-5 stagger-${(idx % 6) + 1}`}
            >
              {/* Avatar */}
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${speaker.color} text-xl font-bold text-white shadow-md`}
              >
                {speaker.name.charAt(0)}
              </div>

              {/* Name + Role */}
              <h3 className="mt-4 text-center text-base font-bold text-theme-primary">
                {speaker.name}
              </h3>
              <p className="mt-0.5 text-center text-xs text-theme-muted">
                {speaker.role}
              </p>
              <p className="mt-0.5 text-center text-xs font-medium text-indigo-600">
                {speaker.company}
              </p>

              {/* Stats */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="badge badge-info">
                  {speaker.events} events
                </span>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-center gap-2 border-t border-theme pt-3">
                <button
                  type="button"
                  className="btn-ghost"
                  aria-label="Send email"
                >
                  <Mail size={15} />
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  aria-label="Website"
                >
                  <Globe size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default Speakers;