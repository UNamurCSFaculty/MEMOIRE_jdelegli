import { useEffect, useState } from "react";
import { UserDndWindowDto, dayOfWeekValues } from "@type/openapiTypes";
import { useUserPreferences } from "./useUserPreferences";

// getDay(): 0 = Sunday, dayOfWeekValues starts at MONDAY
const dayOfWeekOf = (date: Date) => dayOfWeekValues[(date.getDay() + 6) % 7];

/**
 * Mirrors DndWindow.isActiveAt on the backend: end before start means the
 * window crosses midnight into the next day (schema.org convention).
 * Times are "HH:mm:ss" strings, comparable lexicographically.
 */
const isWindowActiveAt = (window: UserDndWindowDto, date: Date) => {
  if (window.day == null || window.start == null || window.end == null) return false;

  const day = dayOfWeekOf(date);
  const time = date.toTimeString().slice(0, 8);

  if (window.start < window.end) {
    return day === window.day && time >= window.start && time < window.end;
  }
  const dayRank = dayOfWeekValues.indexOf(window.day);
  const nextDay = dayOfWeekValues[(dayRank + 1) % 7];
  return (day === window.day && time >= window.start) || (day === nextDay && time < window.end);
};

/**
 * Effective do-not-disturb status, reactive to time: mirrors the backend
 * rule (manual toggle, a not-yet-expired timed activation or a weekly
 * window) and ticks so the status follows timers and windows by itself.
 */
export function useDndStatus() {
  const { userPreferences } = useUserPreferences();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const dnd = userPreferences.dnd;
  const until = dnd?.until ? new Date(dnd.until) : null;

  const active =
    (dnd?.enabled ?? false) ||
    (until !== null && until.getTime() > now) ||
    (dnd?.windows ?? []).some((w) => isWindowActiveAt(w, new Date(now)));

  return { active, until: until && until.getTime() > now ? until : null };
}
