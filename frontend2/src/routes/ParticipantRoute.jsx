import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import PageLoader from "../components/common/PageLoader";

export default function ParticipantRoute({ children }) {
  const { isAuthenticated, isParticipant, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader message="Verifying participant permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isParticipant) {
    return <Navigate to="/admin/registrations" replace />;
  }

  return children;
}
