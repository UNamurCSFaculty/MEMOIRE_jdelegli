import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../hooks/useUser";

/**
 * The self-service preferences page is meant for staff, tutors and
 * autonomous residents: other residents are sent back home so they cannot
 * change their settings by accident.
 */
function PreferencesAccessRoute() {
  const user = useUser();

  const allowed = user.userType !== "RESIDENT" || user.autonomyLevel === "AUTONOMOUS";

  if (!allowed) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default PreferencesAccessRoute;
