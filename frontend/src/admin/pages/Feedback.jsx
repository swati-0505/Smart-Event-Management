// Feedback.jsx
// Feedback management — service-driven with fallback.

import { useState, useMemo } from "react";
import { Search, Star, MessageSquare, TrendingUp, Filter } from "lucide-react";
import PageWrapper from "../components/common/PageWrapper";
import Badge from "../components/common/Badge";
import { useApiWithFallback } from "../hooks/useApiWithFallback";

const SAMPLE = [
  { id: "s1", user: "Rahul Sharma", event: "Tech Summit 2026", rating: 5, comment: "Great event! Very well organized. The speakers were excellent and the venue was perfect.", date: "20 Aug 2026" },
  { id: "s2", user: "Ananya Verma", event: "Design Workshop", rating: 4, comment: "Good workshop, could be more hands-on. The theory part was a bit long.", date: "22 Aug 2026" },
  { id: "s3", user: "Arjun Mehta", event: "Startup Meetup", rating: 5, comment: "Amazing networking opportunity! Met so many founders and investors.", date: "24 Aug 2026" },
  { id: "s4", user: "Priya Singh", event: "AI Conference", rating: 3, comment: "Content was good but the audio system had issues. Could be better.", date: "26 Aug 2026" },
  { id: "s5", user: "Karan Patel", event: "Cultural Fest", rating: 5, comment: "Best cultural event I've attended! The performances were outstanding.", date: "28 Aug 2026" },
  { id: "s6", user: "Sneha Reddy", event: "Tech Summit 2026", rating: 4, comment: "Well organized event. Food could be improved though.", date: "30 Aug 2026" },
];

// Placeholder fetcher — replace with real getFeedback service when ready
const fetchFeedback = async () => [];

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={n <= rating ? "fill-amber-400 text-amber-400" : "text-theme-dim"}
        />
      ))}
    </div>
  );
}

function ratingVariant(rating) {
  if (rating >= 4) return "success";
  if (rating >= 3) return "warning";
  return "danger";
}

function Feedback() {
  const { data: feedback, loading, usingFallback } =
    useApiWithFallback(fetchFeedback, SAMPLE);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return feedback.filter((f) => {
      const user = (f.user || f.user_name || "").toLowerCase();
      const event = (f.event || f.event_title || "").toLowerCase();
      const comment = (f.comment || "").toLowerCase();
      const matchS = !s || user.includes(s) || event.includes(s) || comment.includes(s);

      let matchF = true;
      if (filter === "5 Stars") matchF = f.rating === 5;
      else if (filter === "4 Stars") matchF = f.rating === 4;
      else if (filter === "3 Stars") matchF = f.rating === 3;
      else if (filter === "Low Ratings") matchF = f.rating <= 2;

      return matchS && matchF;
    });
  }, [feedback, search, filter]);

  const stats = useMemo(() => {
    const total = feedback.length;
    const avg = total > 0
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1)
      : "0.0";
    const fiveStar = feedback.filter((f) => f.rating === 5).length;
    const lowRatings = feedback.filter((f) => f.rating <= 2).length;
    return { total, avg, fiveStar, lowRatings };
  }, [feedback]);

  const statCards = [
    { icon: MessageSquare, label: "Total Reviews", value: stats.total, color: "indigo" },
    { icon: Star, label: "Avg. Rating", value: stats.avg, color: "amber" },
    { icon: TrendingUp, label: "5-Star Reviews", value: stats.fiveStar, color: "emerald" },
    { icon: Filter, label: "Low Ratings", value: stats.lowRatings, color: "red" },
  ];

  const statColors = {
    indigo: "bg-indigo-100 text-indigo-600",
    amber: "bg-amber-100 text-amber-600",
    emerald: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Feedback</h1>
            <p className="mt-1 text-sm text-theme-muted">
              Reviews and ratings from event attendees.
            </p>
          </div>
          {!loading && (
            <span className="badge badge-info shrink-0">
              {filtered.length} reviews
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${statColors[s.color]}`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xl font-bold tracking-tight text-theme-primary">
                      {s.value}
                    </p>
                    <p className="text-xs text-theme-muted">{s.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-theme bg-theme-tertiary px-3 py-2">
            <Search size={15} className="text-theme-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, event or comment..."
              className="min-w-0 flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-dim"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-theme bg-theme-tertiary px-3 py-2 text-sm text-theme-primary outline-none"
          >
            {["All", "5 Stars", "4 Stars", "3 Stars", "Low Ratings"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="card p-12 text-center text-sm text-theme-muted">
            Loading feedback...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <MessageSquare size={24} />
            </div>
            <p className="text-sm font-semibold text-theme-primary">No feedback found</p>
            <p className="text-xs text-theme-muted">Try changing filters or search terms.</p>
          </div>
        ) : (
          <>
            {usingFallback && (
              <div className="rounded-lg border border-amber-300 bg-amber-100 px-4 py-2.5 text-[11px] font-bold text-amber-900">
                Demo data — connect backend to see real feedback.
              </div>
            )}

            <div className="space-y-4">
              {filtered.map((f, idx) => {
                const userName = f.user || f.user_name || "Anonymous";
                const eventName = f.event || f.event_title || "—";
                const regDate = f.date || f.created_at || "—";

                return (
                  <div
                    key={f.id}
                    className={`card animate-fade-in-up stagger-${(idx % 6) + 1} p-5`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-theme-primary">
                            {userName}
                          </p>
                          <span className="text-xs text-theme-dim">·</span>
                          <p className="text-xs text-theme-muted">{eventName}</p>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <RatingStars rating={f.rating} />
                          <Badge variant={ratingVariant(f.rating)}>
                            {f.rating}/5
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-theme-secondary">
                          {f.comment}
                        </p>
                        <p className="mt-2 text-[11px] text-theme-dim">{regDate}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export default Feedback;