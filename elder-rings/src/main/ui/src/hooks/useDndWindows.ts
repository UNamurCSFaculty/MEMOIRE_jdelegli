import { UserDndWindowDto, dayOfWeekValues } from "@type/openapiTypes";

// Canonical night window used as default for a new row
const NIGHT_START = "21:00:00";
const NIGHT_END = "07:00:00";

// getDay(): 0 = Sunday, dayOfWeekValues starts at MONDAY
const currentDay = (): UserDndWindowDto["day"] => dayOfWeekValues[(new Date().getDay() + 6) % 7];

// Windows without a day sort last; same-day windows keep their insertion order
const dayRank = (day: UserDndWindowDto["day"]) =>
  day == null ? dayOfWeekValues.length : dayOfWeekValues.indexOf(day);

export function useDndWindows(
  windows: UserDndWindowDto[],
  onChange: (windows: UserDndWindowDto[]) => void,
) {
  // Every operation below indexes into this sorted view, not the raw prop
  const sortedWindows = [...windows].sort((a, b) => dayRank(a.day) - dayRank(b.day));

  const addWindow = () =>
    onChange([...sortedWindows, { day: currentDay(), start: NIGHT_START, end: NIGHT_END }]);

  const updateWindow = <Field extends keyof UserDndWindowDto>(
    index: number,
    field: Field,
    value: UserDndWindowDto[Field],
  ) => {
    const updated = [...sortedWindows];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeWindow = (index: number) => onChange(sortedWindows.filter((_, i) => i !== index));

  // Replaces every window with one identical window per day,
  // based on the first row (or the canonical night if the list is empty)
  const applyToWeek = () => {
    const model = sortedWindows[0] ?? { start: NIGHT_START, end: NIGHT_END };
    onChange(dayOfWeekValues.map((day) => ({ ...model, day })));
  };

  // start === end would silently mean a 24h window: flag it in the UI
  const isInvalid = (window: UserDndWindowDto) => window.start === window.end;

  return { sortedWindows, addWindow, updateWindow, removeWindow, applyToWeek, isInvalid };
}
