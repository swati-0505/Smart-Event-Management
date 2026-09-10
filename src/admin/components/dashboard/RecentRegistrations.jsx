// RecentRegistrations.jsx
// Shows recent registrations in a clean list format.

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { getRegistrations } from "../../services/registrationService";

function RecentRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function loadRegistrations() {
    try {
      const data = await getRegistrations();
      setRegistrations(data.slice(0, 4));
    } catch (err) {
      console.error("Error loading registrations:", err);
    } finally {
      setLoading(false);
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case "CONFIRMED":
        return "reg-status reg-status-confirmed";
      case "PENDING":
        return "reg-status reg-status-pending";
      case "CANCELLED":
        return "reg-status reg-status-cancelled";
      default:
        return "reg-status reg-status-pending";
    }
  }

  return (
    <section className="dash-panel">
      {/* Header */}
      <div className="dash-panel-header">
        <div>
          <p className="dash-panel-tag">Activity</p>
          <h2 className="dash-panel-title">Recent Registrations</h2>
        </div>

        <button type="button" className="dash-panel-action">
          <span>View all</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="reg-list">
        {loading && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="reg-item reg-item-skeleton">
                <div className="reg-avatar-skeleton" />
                <div className="reg-info-skeleton">
                  <div className="skeleton-line w-40" />
                  <div className="skeleton-line w-60" />
                </div>
              </div>
            ))}
          </>
        )}

        {!loading && registrations.length === 0 && (
          <div className="dash-empty">
            <p>No registrations yet</p>
          </div>
        )}

        {!loading &&
          registrations.map((reg) => (
            <div key={reg.registration_id} className="reg-item">
              <div className="reg-avatar">
                {reg.user_name.charAt(0).toUpperCase()}
              </div>

              <div className="reg-info">
                <p className="reg-name">{reg.user_name}</p>
                <p className="reg-event">{reg.event_title}</p>
              </div>

              <div className="reg-meta">
                <span className={getStatusClass(reg.status)}>
                  {reg.status}
                </span>
                <p className="reg-date">
                  {new Date(reg.registration_date).toLocaleDateString(
                    "en-GB",
                    { day: "2-digit", month: "short" }
                  )}
                </p>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

export default RecentRegistrations;