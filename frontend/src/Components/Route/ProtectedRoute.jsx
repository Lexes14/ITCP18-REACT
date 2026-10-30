import { Navigate } from "react-router-dom";
import { getUser } from "../../Utils/helpers.jsx";
const ProtectedRoute = ({ children, isAdmin = false }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (isAdmin && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};
export default ProtectedRoute;
