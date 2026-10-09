import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import PageLoader from "../components/common/PageLoader";

export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <PageLoader message="Checking authentication..." />;
  }

  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
