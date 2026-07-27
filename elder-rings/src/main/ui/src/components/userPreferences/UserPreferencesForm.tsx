import { useEffect, useState } from "react";
import { UserPreferencesDto, textSizeDtoValues } from "@type/openapiTypes";
import AudioSampleTest from "./AudioSampleTest";
import { useTranslation } from "react-i18next";
import { SupportedLanguage } from "../../locales/i18n";
import {
  Button,
  Checkbox,
  Input,
  Label,
  ListBox,
  NumberField,
  Select,
  Separator,
} from "@heroui/react";
import { IconAdd, IconRemove } from "@components/icons/favouriteIcons";
import { basePath } from "../../../basepath.config";
import BackHomeButton from "@components/navigation/BackHomeButton";
import { CallPolicyFloor } from "@utils/callPolicyFloor";

interface UserPreferencesFormProps {
  preferences: UserPreferencesDto;
  onSave: (preferences: UserPreferencesDto, file: File | null) => Promise<void>;
  showPictureSection?: boolean;
  pictureBase64?: string | null;
  showCallPolicySection?: boolean;
  callPolicyFloor?: CallPolicyFloor;
}

export default function UserPreferencesForm({
  preferences,
  onSave,
  showPictureSection = false,
  pictureBase64,
  showCallPolicySection = false,
  callPolicyFloor,
}: Readonly<UserPreferencesFormProps>) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<UserPreferencesDto | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setFormData(preferences);
  }, [preferences]);

  if (!formData) return null;

  const handleChange = <
    Section extends keyof UserPreferencesDto,
    Value = NonNullable<UserPreferencesDto[Section]> extends infer SectionType
      ? SectionType extends object
        ? SectionType[keyof SectionType]
        : never
      : never,
  >(
    section: Section,
    key: keyof NonNullable<UserPreferencesDto[Section]>,
    value: Value,
  ) => {
    setFormData((prev) => {
      const currentSection = prev![section];
      return {
        ...prev!,
        [section]: currentSection
          ? {
              ...currentSection,
              [key]: value,
            }
          : ({ [key]: value } as UserPreferencesDto[Section]),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData, file);
      setFile(null);
    } catch (err) {
      console.error("Failed to update preferences", err);
    }
  };

  const updateAudioFilter = (
    index: number,
    field: "frequency" | "gain",
    value: number | undefined,
  ) => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return;
    }

    const updatedFilters = formData.audio?.filters ? [...formData.audio.filters] : [];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    setFormData((prev) => ({
      ...prev!,
      audio: {
        ...prev!.audio,
        filters: updatedFilters,
      },
    }));
  };

  const addAudioFilter = () => {
    setFormData((prev) => ({
      ...prev!,
      audio: {
        ...prev!.audio,
        filters: prev!.audio?.filters
          ? [...prev!.audio.filters, { frequency: 1000, gain: 0 }]
          : [{ frequency: 1000, gain: 0 }],
      },
    }));
  };

  const removeAudioFilter = (index: number) => {
    setFormData((prev) => ({
      ...prev!,
      audio: {
        ...prev!.audio,
        filters: prev!.audio?.filters?.filter((_, i) => i !== index),
      },
    }));
  };

  // Effective state: manually enabled or a timed activation still running
  const dndCurrentlyActive =
    (formData.dnd?.enabled ?? false) ||
    (formData.dnd?.until != null && new Date(formData.dnd.until).getTime() > Date.now());

  return (
    <form onSubmit={handleSubmit} className="flex flex-col grow h-full overflow-auto">
      {/* Profile Picture */}
      <div className="flex flex-wrap gap-8 justify-start">
        {showPictureSection && (
          <section className="flex-1">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">
                {t("Components.UserPreferencesForm.ProfilePicture")}
              </h2>
              <Separator />
              <img
                src={
                  pictureBase64
                    ? `data:image/*;base64,${pictureBase64}`
                    : basePath + "/picture-user-default.jpg"
                }
                alt={t("Components.UserPreferencesForm.PersonalPicture")}
                className="w-64 object-contain"
              />
              <Label htmlFor="personal-picture-input">
                {t("Components.UserPreferencesForm.PersonalPicture")}
              </Label>
              <Input
                id="personal-picture-input"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-80"
              />
            </div>
          </section>
        )}

        <div className="flex flex-col gap-4 flex-1">
          {/* General */}
          <section>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">
                {t("Components.UserPreferencesForm.GeneralTitle")}
              </h2>
              <Separator />
              <Checkbox
                isSelected={formData.general?.isPublic}
                onChange={(isSelected: boolean) => handleChange("general", "isPublic", isSelected)}
                aria-label={t("Components.UserPreferencesForm.IsPublicProfile")}
              >
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>
                  {t("Components.UserPreferencesForm.IsPublicProfile")}
                </Checkbox.Content>
              </Checkbox>
              <Select
                className="max-w-xs"
                value={formData.general?.lang ?? null}
                variant="secondary"
                onChange={(value) => {
                  if (value == null || Array.isArray(value)) return;
                  handleChange(
                    "general",
                    "lang",
                    value as NonNullable<UserPreferencesDto["general"]>["lang"],
                  );
                }}
              >
                <Label>{t("Components.UserPreferencesForm.Language")}</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {Object.values(SupportedLanguage).map((lang) => (
                      <ListBox.Item
                        key={lang}
                        id={lang}
                        textValue={t(`Enums.Language.${lang.toUpperCase()}`)}
                      >
                        {t(`Enums.Language.${lang.toUpperCase()}`)}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </section>

          {/* Visual */}
          <section>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">
                {t("Components.UserPreferencesForm.VisualTitle")}
              </h2>
              <Separator />
              <Checkbox
                isSelected={formData.visual?.readTextOnScreen}
                onChange={(isSelected: boolean) =>
                  handleChange("visual", "readTextOnScreen", isSelected)
                }
                aria-label={t("Components.UserPreferencesForm.ReadTextOnScreen")}
              >
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>
                  {t("Components.UserPreferencesForm.ReadTextOnScreen")}
                </Checkbox.Content>
              </Checkbox>
              <Select
                className="max-w-xs"
                value={formData.visual?.textSize ?? null}
                variant="secondary"
                onChange={(value) => {
                  if (value == null || Array.isArray(value)) return;
                  handleChange(
                    "visual",
                    "textSize",
                    value as NonNullable<UserPreferencesDto["visual"]>["textSize"],
                  );
                }}
              >
                <Label>{t("Components.UserPreferencesForm.TextSize")}</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {textSizeDtoValues.map((value) => (
                      <ListBox.Item
                        key={value}
                        id={value}
                        textValue={t(`Enums.TextSizeDto.${value}`)}
                      >
                        {t(`Enums.TextSizeDto.${value}`)}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </section>

          {/* Do not disturb */}
          <section>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">
                {t("Components.UserPreferencesForm.DndTitle")}
              </h2>
              <Separator />
              <Checkbox
                isSelected={dndCurrentlyActive}
                onChange={(isSelected: boolean) => {
                  // Manual master switch: stays on until unchecked, and
                  // unchecking also cancels a running timed activation.
                  // The timed mode only applies to the resident's home button.
                  handleChange("dnd", "enabled", isSelected);
                  if (!isSelected) {
                    handleChange("dnd", "until", undefined);
                  }
                }}
                aria-label={t("Components.UserPreferencesForm.DndEnabled")}
              >
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>
                  {t("Components.UserPreferencesForm.DndEnabled")}
                  {!formData.dnd?.enabled && formData.dnd?.until && (
                    <span className="text-sm text-gray-600">
                      {" "}
                      {t("Components.UserPreferencesForm.DndActiveUntil", {
                        time: new Date(formData.dnd.until).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      })}
                    </span>
                  )}
                </Checkbox.Content>
              </Checkbox>
              <Checkbox
                isSelected={formData.dnd?.durationMinutes != null}
                onChange={(isSelected: boolean) =>
                  handleChange("dnd", "durationMinutes", isSelected ? 60 : undefined)
                }
                aria-label={t("Components.UserPreferencesForm.DndAutoDisable")}
              >
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>
                  {t("Components.UserPreferencesForm.DndAutoDisable")}
                </Checkbox.Content>
              </Checkbox>
              {formData.dnd?.durationMinutes != null && (
                <NumberField
                  value={formData.dnd.durationMinutes}
                  onChange={(value) => {
                    if (typeof value !== "number" || !Number.isFinite(value)) return;
                    handleChange("dnd", "durationMinutes", value);
                  }}
                  minValue={1}
                  maxValue={480}
                  aria-label={t("Components.UserPreferencesForm.DndDurationMinutes")}
                  className="max-w-xs"
                >
                  <Label>{t("Components.UserPreferencesForm.DndDurationMinutes")}</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input className="w-full min-w-0 text-center" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                </NumberField>
              )}
            </div>
          </section>

          {showCallPolicySection && (
            <section>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">
                  {t("Components.UserPreferencesForm.CallPolicyTitle")}
                </h2>
                <Separator />
                <Checkbox
                  isSelected={formData.callPolicy?.autoAnswer ?? false}
                  isDisabled={callPolicyFloor?.autoAnswer === true}
                  onChange={(isSelected: boolean) =>
                    handleChange("callPolicy", "autoAnswer", isSelected)
                  }
                  aria-label={t("Components.UserPreferencesForm.AutoAnswer")}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    {t("Components.UserPreferencesForm.AutoAnswer")}
                  </Checkbox.Content>
                </Checkbox>
                <Checkbox
                  isSelected={formData.callPolicy?.cameraOnByDefault ?? false}
                  isDisabled={callPolicyFloor?.cameraOnByDefault === true}
                  onChange={(isSelected: boolean) =>
                    handleChange("callPolicy", "cameraOnByDefault", isSelected)
                  }
                  aria-label={t("Components.UserPreferencesForm.CameraOnByDefault")}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    {t("Components.UserPreferencesForm.CameraOnByDefault")}
                  </Checkbox.Content>
                </Checkbox>
              </div>
            </section>
          )}
        </div>

        {/* Audio */}
        <section className="flex-1">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">
              {t("Components.UserPreferencesForm.AudioTitle")}
            </h2>
            <Separator />
            <Checkbox
              isSelected={formData.audio?.compression}
              onChange={(isSelected: boolean) => handleChange("audio", "compression", isSelected)}
              aria-label={t("Components.UserPreferencesForm.EnableAudioCompression")}
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content>
                {t("Components.UserPreferencesForm.EnableAudioCompression")}
              </Checkbox.Content>
            </Checkbox>
            <Checkbox
              isSelected={formData.audio?.playInterfaceSounds}
              onChange={(isSelected: boolean) =>
                handleChange("audio", "playInterfaceSounds", isSelected)
              }
              aria-label={t("Components.UserPreferencesForm.PlayInterfaceSounds")}
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content>
                {t("Components.UserPreferencesForm.PlayInterfaceSounds")}
              </Checkbox.Content>
            </Checkbox>
            <div className="flex flex-col gap-3 rounded-lg bg-white/70 p-3 dark:bg-black/30">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-md font-semibold">
                  {t("Components.UserPreferencesForm.AudioFilters")}
                </h3>
                <Button
                  onPress={addAudioFilter}
                  aria-label={t("Components.UserPreferencesForm.AddFilter")}
                  variant="secondary"
                >
                  <IconAdd />
                  {t("Components.UserPreferencesForm.AddFilter")}
                </Button>
              </div>
              {formData.audio?.filters?.length && formData.audio?.filters?.length > 0 && (
                <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 text-sm italic text-slate-700 sm:grid dark:text-slate-200">
                  <p>{t("Components.UserPreferencesForm.FrequencyPlaceholder")}</p>
                  <p>{t("Components.UserPreferencesForm.GainPlaceholder")}</p>
                  <span className="sr-only">
                    {t("Components.UserPreferencesForm.RemoveFilter")}
                  </span>
                </div>
              )}
              {formData.audio?.filters?.map((filter, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
                >
                  <NumberField
                    value={filter.frequency}
                    onChange={(value) => updateAudioFilter(index, "frequency", value)}
                    aria-label={t("Components.UserPreferencesForm.FrequencyPlaceholder")}
                    minValue={100}
                    maxValue={20000}
                    className="min-w-28 w-full"
                  >
                    <NumberField.Group>
                      <NumberField.DecrementButton />
                      <NumberField.Input
                        placeholder={t("Components.UserPreferencesForm.FrequencyPlaceholder")}
                      />
                      <NumberField.IncrementButton />
                    </NumberField.Group>
                  </NumberField>
                  <NumberField
                    value={filter.gain}
                    onChange={(value) => updateAudioFilter(index, "gain", value)}
                    aria-label={t("Components.UserPreferencesForm.GainPlaceholder")}
                    minValue={-100}
                    maxValue={100}
                    className="min-w-28 w-full"
                  >
                    <NumberField.Group>
                      <NumberField.DecrementButton />
                      <NumberField.Input
                        placeholder={t("Components.UserPreferencesForm.GainPlaceholder")}
                      />
                      <NumberField.IncrementButton />
                    </NumberField.Group>
                  </NumberField>
                  <Button
                    onPress={() => removeAudioFilter(index)}
                    isIconOnly
                    aria-label={t("Components.UserPreferencesForm.RemoveFilter")}
                    variant="danger-soft"
                    className="justify-self-start sm:justify-self-center"
                  >
                    <IconRemove />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 pl-2">
              <h3 className="text-md font-semibold">
                {t("Components.UserPreferencesForm.TestConfigTitle")}
              </h3>
              <AudioSampleTest
                eqBands={formData.audio?.filters ?? []}
                compression={formData.audio?.compression ?? false}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-center mt-auto gap-2">
        <Button
          type="submit"
          aria-label={t("Components.UserPreferencesForm.SavePreferences")}
          size="lg"
        >
          {t("Components.UserPreferencesForm.SavePreferences")}
        </Button>
        <BackHomeButton size="lg" />
      </div>
    </form>
  );
}
