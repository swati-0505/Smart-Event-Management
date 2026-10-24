from sqlalchemy.orm import Session
from app.core.permissions import require_admin_actor
from app.models.user import User
from app.models.event import Event
from app.models.registration import Registration
from app.models.venue import Venue
from app.models.feedback import Feedback
from app.models.payment import Payment

def get_dashboard_stats(db: Session, *, actor_id):
    require_admin_actor(db, actor_id)
    return {'total_users': db.query(User).count(), 'total_events': db.query(Event).count(), 'total_registrations': db.query(Registration).count(), 'total_venues': db.query(Venue).count(), 'total_feedback': db.query(Feedback).count(), 'total_payments': db.query(Payment).count()}