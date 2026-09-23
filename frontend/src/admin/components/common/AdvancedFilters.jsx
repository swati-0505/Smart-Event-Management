// AdvancedFilters.jsx
// Reusable advanced filter panel — dropdown popover style.

import { useRef, useEffect } from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";

function AdvancedFilters({ isOpen, onClose, onReset, activeCount = 0, children }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="animate-scale-in absolute right-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-xl border border-theme bg-theme-secondary shadow-xl sm:w-80"
    >
      <div className="flex items-center justify-between border-b border-theme px-4 py-3">
        <p className="text-sm font-bold text-theme-primary">Filters</p>
        <button
          type="button"
          onClick={onClose}
          className="text-theme-muted transition hover:text-theme-primary"
        >
          <X size={14} />
        </button>
      </div>

      <div className="max-h-[60vh] space-y-4 overflow-y-auto p-4">{children}</div>

      <div className="flex items-center justify-between border-t border-theme px-4 py-3">
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] font-semibold text-theme-muted transition hover:text-theme-primary"
        >
          Reset all
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-indigo-700"
        >
          Apply{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
      </div>
    </div>
  );
}

// Filter section wrapper
export function FilterSection({ title, children }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-theme-dim">
        {title}
      </p>
      {children}
    </div>
  );
}

// Chip-style option group
export function FilterChips({ options, value, onChange, multi = false }) {
  const values = multi ? value : [value];
  function toggle(opt) {
    if (multi) {
      onChange(
        values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]
      );
    } else {
      onChange(opt);
    }
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
              active
                ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                : "border-theme bg-theme-tertiary text-theme-secondary hover:border-indigo-200"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// Checkbox-style category list
export function FilterCheckboxList({ options, value, onChange }) {
  return (
    <div className="space-y-1.5">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() =>
              onChange(active ? value.filter((v) => v !== opt) : [...value, opt])
            }
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium text-theme-secondary transition hover:bg-theme-hover"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                active
                  ? "border-indigo-500 bg-indigo-500 text-white"
                  : "border-theme bg-theme-tertiary"
              }`}
            >
              {active && <Check size={10} strokeWidth={3} />}
            </span>
            <span className="flex-1">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

// Filter button trigger
export function FilterTrigger({ onClick, activeCount = 0 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
        activeCount > 0
          ? "border-indigo-500 bg-indigo-50 text-indigo-600"
          : "border-theme bg-theme-tertiary text-theme-secondary hover:border-indigo-200"
      }`}
    >
      <SlidersHorizontal size={14} />
      Filter
      {activeCount > 0 && (
        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
          {activeCount}
        </span>
      )}
    </button>
  );
}

export default AdvancedFilters;