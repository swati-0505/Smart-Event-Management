// PromoBanner.jsx
// Promotional banner — uses secondary styling to avoid competing with primary CTA.

import { Calendar, ArrowRight } from "lucide-react";

function PromoBanner({ onGetStarted }) {
  return (
    <div className="promo-banner animate-fade-in-up">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="promo-banner-icon">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-theme-primary">
              Planning a new event?
            </p>
            <p className="mt-0.5 text-xs text-theme-secondary">
              Create, manage and promote your event with ease.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGetStarted}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-theme bg-theme-secondary px-4 py-2.5 text-xs font-semibold text-theme-primary transition hover:border-indigo-300 hover:text-indigo-600"
        >
          Learn More
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default PromoBanner;