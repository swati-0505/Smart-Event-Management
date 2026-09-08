// StatCard.jsx
// Reusable metric card component.

function StatCard({ label, value, note }) {
  return (
    <div className="admin-metric rounded-lg p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-theme-muted">
        {label}
      </p>

      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.02em] text-theme-primary">
        {value}
      </p>

      <p className="mt-3 text-[11px] font-medium text-theme-accent">
        {note}
      </p>
    </div>
  );
}

export default StatCard;