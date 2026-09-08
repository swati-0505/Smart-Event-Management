// Feedback.jsx
// This component displays the feedback management page.
// It handles search and rating filtering.

import { useState, useEffect, useMemo } from "react";
import { Search, Star } from "lucide-react";
import { getFeedback } from "../services/feedbackService";

function Feedback() {
  // State for feedback list
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for search and rating filter
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");

  // Load feedback on component mount
  useEffect(() => {
    loadFeedback();
  }, []);

  // Function to load feedback from service
  async function loadFeedback() {
    try {
      setLoading(true);
      setError(null);

      // Call service to get feedback
      const data = await getFeedback();
      setFeedbackList(data);
    } catch (err) {
      setError("Failed to load feedback. Please try again.");
      console.error("Error loading feedback:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter feedback based on search and rating
  const filteredFeedback = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return feedbackList.filter((feedback) => {
      const matchesSearch =
        !search ||
        feedback.user_name.toLowerCase().includes(search) ||
        feedback.event_title.toLowerCase().includes(search) ||
        feedback.comment.toLowerCase().includes(search);

      const matchesRating =
        ratingFilter === "ALL" || feedback.rating === parseInt(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [feedbackList, searchQuery, ratingFilter]);

  // Helper to render stars
  function renderStars(rating) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            className={star <= rating ? "fill-[#d7a63a] text-[#d7a63a]" : "text-white/20"}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <header className="mb-7 sm:mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d7a63a]">
          Operations
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
              Feedback
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
              View and manage participant feedback.
            </p>
          </div>
        </div>
      </header>

      {/* Search and filter bar */}
      <section className="admin-section overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-md border border-[#d7a63a]/20 bg-[#d7a63a]/[0.05] px-3 py-2.5">
            <Search size={15} strokeWidth={1.7} className="shrink-0 text-[#d7a63a]/75" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by user, event, or comment..."
              className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
            className="w-full rounded-md border border-white/[0.08] bg-[#151515] px-3 py-2.5 text-xs text-white/65 outline-none transition focus:border-[#d7a63a]/40 sm:w-auto"
          >
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="px-6 py-12 text-center text-sm text-white/30">
            Loading feedback...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="px-6 py-12 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Feedback table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-white/[0.07] text-left">
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    User
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Event
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Comment
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredFeedback.length > 0 ? (
                  filteredFeedback.map((feedback) => (
                    <tr
                      key={feedback.feedback_id}
                      className="border-b border-white/[0.055] transition hover:bg-white/[0.02] last:border-b-0"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-white/85">
                          {feedback.user_name}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-white/55">
                        {feedback.event_title}
                      </td>
                      <td className="px-6 py-5">
                        {renderStars(feedback.rating)}
                      </td>
                      <td className="px-6 py-5 text-sm text-white/45">
                        <p className="max-w-md line-clamp-2">{feedback.comment}</p>
                      </td>
                      <td className="px-6 py-5 text-sm text-white/45">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-white/30">
                      No feedback match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Feedback;