import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";
import { apiClient } from "@openapi/zodiosClient";

interface PendingRequestsBadgeProps {
  userId: string;
  className?: string;
}

/**
 * Count bubble for a resident's pending contact requests.
 * Fetches its own data and renders nothing when there is no pending request.
 * Positioning is up to the caller through className (e.g. "absolute -top-2 -right-2").
 */
export default function PendingRequestsBadge({
  userId,
  className,
}: Readonly<PendingRequestsBadgeProps>) {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    apiClient
      .getPendingRequestsOfUser({ queries: { userId } })
      .then((requests) => setCount(requests.length))
      .catch(() => setCount(0));
  }, [userId]);

  if (count === 0) return null;

  const label = t("Components.PendingRequestsBadge.Label", { count });

  return (
    <span
      className={twMerge(
        "flex items-center justify-center w-6 h-6 px-1.5 rounded-full bg-red-600 text-white text-sm font-semibold shadow",
        className,
      )}
      aria-label={label}
      title={label}
    >
      {count}
    </span>
  );
}
