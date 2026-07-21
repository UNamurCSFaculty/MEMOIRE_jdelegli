import { useUser } from "../../hooks/useUser";
import { Navigate, Outlet } from "react-router-dom";

export default function StaffRoute() {
  const user = useUser();

  if (user.userType !== "STAFF") return <Navigate to="/" replace />;
  return <Outlet />;
}
