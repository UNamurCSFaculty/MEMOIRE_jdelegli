import { useEffect, useState } from "react";
import { useUserPreferences } from "./useUserPreferences";

/**
 * Effective do-not-disturb status, reactive to time: mirrors the backend
 * rule (manual toggle or a not-yet-expired timed activation) and ticks
 * so the status switches off by itself when the timer expires.
 */
export function useDndStatus() {
  const { userPreferences } = useUserPreferences();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const until = userPreferences.dnd?.until ? new Date(userPreferences.dnd.until) : null;

  const active =
    (userPreferences.dnd?.enabled ?? false) || (until !== null && until.getTime() > now);

  return { active, until: until && until.getTime() > now ? until : null };
}
