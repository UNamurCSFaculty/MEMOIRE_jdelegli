import { useTranslation } from "react-i18next";
import { parseTime } from "@internationalized/date";
import { Button, ListBox, Select, TimeField } from "@heroui/react";
import { IconAdd, IconRemove } from "@components/icons/favouriteIcons";
import { UserDndWindowDto, dayOfWeekValues } from "@type/openapiTypes";
import { useDndWindows } from "../../hooks/useDndWindows";

interface DndWindowsEditorProps {
  windows: UserDndWindowDto[];
  onChange: (windows: UserDndWindowDto[]) => void;
}

export default function DndWindowsEditor({ windows, onChange }: Readonly<DndWindowsEditorProps>) {
  const { t } = useTranslation();
  const { sortedWindows, addWindow, updateWindow, removeWindow, applyToWeek, isInvalid } =
    useDndWindows(windows, onChange);

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-white/70 p-3 dark:bg-black/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-md font-semibold">{t("Components.DndWindowsEditor.Title")}</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            onPress={applyToWeek}
            variant="secondary"
            aria-label={t("Components.DndWindowsEditor.ApplyToWeek")}
          >
            {t("Components.DndWindowsEditor.ApplyToWeek")}
          </Button>
          <Button
            onPress={addWindow}
            variant="secondary"
            aria-label={t("Components.DndWindowsEditor.AddWindow")}
          >
            <IconAdd />
            {t("Components.DndWindowsEditor.AddWindow")}
          </Button>
        </div>
      </div>
      {sortedWindows.length === 0 && (
        <p className="text-sm italic text-slate-700 dark:text-slate-200">
          {t("Components.DndWindowsEditor.NoWindows")}
        </p>
      )}
      {sortedWindows.map((window, index) => (
        <div key={index} className="flex flex-col gap-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center">
            <Select
              value={window.day ?? null}
              variant="secondary"
              aria-label={t("Components.DndWindowsEditor.Day")}
              onChange={(value) => {
                if (value == null || Array.isArray(value)) return;
                updateWindow(index, "day", value as UserDndWindowDto["day"]);
              }}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {dayOfWeekValues.map((day) => (
                    <ListBox.Item key={day} id={day} textValue={t(`Enums.DayOfWeek.${day}`)}>
                      {t(`Enums.DayOfWeek.${day}`)}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            <TimeField
              value={window.start ? parseTime(window.start) : null}
              onChange={(value) => {
                if (value) updateWindow(index, "start", value.toString());
              }}
              hourCycle={24}
              aria-label={t("Components.DndWindowsEditor.Start")}
            >
              <TimeField.Group>
                <TimeField.Input>
                  {(segment) => <TimeField.Segment segment={segment} />}
                </TimeField.Input>
              </TimeField.Group>
            </TimeField>
            <TimeField
              value={window.end ? parseTime(window.end) : null}
              onChange={(value) => {
                if (value) updateWindow(index, "end", value.toString());
              }}
              hourCycle={24}
              aria-label={t("Components.DndWindowsEditor.End")}
            >
              <TimeField.Group>
                <TimeField.Input>
                  {(segment) => <TimeField.Segment segment={segment} />}
                </TimeField.Input>
              </TimeField.Group>
            </TimeField>
            <Button
              onPress={() => removeWindow(index)}
              isIconOnly
              variant="danger-soft"
              aria-label={t("Components.DndWindowsEditor.RemoveWindow")}
              className="justify-self-start sm:justify-self-center"
            >
              <IconRemove />
            </Button>
          </div>
          {isInvalid(window) && (
            <p className="text-sm text-red-600">
              {t("Components.DndWindowsEditor.SameTimesError")}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
