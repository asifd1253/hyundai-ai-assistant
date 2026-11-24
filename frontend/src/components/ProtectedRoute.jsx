import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Wait until authentication check is complete
  if (loading) {
    return <h2>Checking authentication...</h2>;
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Allow authenticated users to access nested routes
  return <Outlet />;
};

export default ProtectedRoute;
