// StatCard.jsx
// Reusable metric card component with icon, value, and trend.

function StatCard({ label, value, note, icon: Icon, color = "gold" }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      {/* Background glow */}
      <div className="stat-card-glow"></div>

      {/* Content */}
      <div className="stat-card-content">
        {/* Icon */}
        {Icon && (
          <div className="stat-card-icon">
            <Icon size={18} strokeWidth={1.8} />
          </div>
        )}

        {/* Label */}
        <p className="stat-card-label">{label}</p>

        {/* Value */}
        <p className="stat-card-value">{value}</p>

        {/* Note / Trend */}
        {note && (
          <div className="stat-card-note">
            <span className="stat-card-note-dot"></span>
            <span>{note}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;