// ActivityFeed.jsx
// Shows recent system activity in a clean timeline format.

import { useState } from "react";
import {
  CalendarPlus,
  UserPlus,
  Building2,
  Zap,
  Activity,
} from "lucide-react";

const mockActivities = [
  {
    id: 1,
    type: "event",
    title: "New event created",
    description: "Tech Summit 2026",
    time: "12 min ago",
  },
  {
    id: 2,
    type: "registration",
    title: "Registration received",
    description: "Design Workshop",
    time: "25 min ago",
  },
  {
    id: 3,
    type: "venue",
    title: "Venue updated",
    description: "Innovation Hall",
    time: "1 hr ago",
  },
  {
    id: 4,
    type: "status",
    title: "Event status changed",
    description: "Startup Meetup",
    time: "2 hrs ago",
  },
];

function ActivityFeed() {
  const [activities] = useState(mockActivities);

  function getIcon(type) {
    switch (type) {
      case "event":
        return CalendarPlus;
      case "registration":
        return UserPlus;
      case "venue":
        return Building2;
      case "status":
        return Zap;
      default:
        return Activity;
    }
  }

  function getColorClass(type) {
    switch (type) {
      case "event":
        return "activity-icon-gold";
      case "registration":
        return "activity-icon-green";
      case "venue":
        return "activity-icon-blue";
      case "status":
        return "activity-icon-purple";
      default:
        return "activity-icon-gold";
    }
  }

  return (
    <section className="dash-panel">
      {/* Header */}
      <div className="dash-panel-header">
        <div>
          <p className="dash-panel-tag">System</p>
          <h2 className="dash-panel-title">Recent Activity</h2>
        </div>
      </div>

      {/* Timeline */}
      <div className="activity-timeline">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          return (
            <div key={activity.id} className="activity-item">
              <div
                className={`activity-icon ${getColorClass(activity.type)}`}
              >
                <Icon size={14} strokeWidth={2} />
              </div>

              <div className="activity-content">
                <p className="activity-title">{activity.title}</p>
                <p className="activity-desc">{activity.description}</p>
                <p className="activity-time">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ActivityFeed;