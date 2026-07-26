import { Navigate, Outlet, useParams } from "react-router-dom";
import { useUser } from "../../hooks/useUser";

function ResidentAccessRoute() {
  const user = useUser();
  const { id } = useParams();

  const allowed =
    user.userType === "STAFF" || (user.userType === "FAMILY" && user.tutorOfResidentId === id);

  if (!allowed) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default ResidentAccessRoute;
