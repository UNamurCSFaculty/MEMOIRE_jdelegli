import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface RedirectToDefaultPageProps {
  path: string;
  absolute?: boolean;
}

// Can be also be replaced by <Navigate to="path" replace />
export default function RedirectToDefaultPage({
  path,
  absolute,
}: Readonly<RedirectToDefaultPageProps>) {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (absolute === true) {
      navigate(path);
    } else {
      navigate(location.pathname + path);
    }
  }, [navigate, location, absolute, path]);
  return <></>;
}
