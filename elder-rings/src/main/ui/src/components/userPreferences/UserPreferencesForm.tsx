import { useEffect, useState } from "react";
import { apiClient } from "@openapi/zodiosClient";
import { UserPreferencesDto, textSizeDtoValues } from "@type/openapiTypes";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import AudioSampleTest from "./AudioSampleTest";
import { useTranslation } from "react-i18next";
import { SupportedLanguage } from "../../locales/i18n";
import { notifySuccess } from "@utils/notifyUtil";
import isEqual from "lodash/isEqual";
import { Button, Checkbox, Divider, Input, NumberInput, Select, SelectItem } from "@heroui/react";
import { IconAdd, IconRemove } from "@components/icons/favouriteIcons";
import { basePath } from "../../../basepath.config";
import BackHomeButton from "@components/navigation/BackHomeButton";

export default function UserPreferencesForm() {
  const { t } = useTranslation();
  const { userPreferences, refreshUserPreferences } = useUserPreferences();
  const [formData, setFormData] = useState<UserPreferencesDto | null>(null);
  const [initialPreferences, setInitialPreferences] = useState<UserPreferencesDto | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [userPicture, setUserPicture] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getCurrentUserPicture().then((resp) => setUserPicture(resp));
  }, []);

  useEffect(() => {
    if (userPreferences) {
      setFormData(userPreferences);
      setInitialPreferences(userPreferences);
    }
  }, [userPreferences]);

  if (!formData) return null;

  const handleChange = <
    Section extends keyof UserPreferencesDto,
    Value = NonNullable<UserPreferencesDto[Section]> extends infer SectionType
      ? SectionType extends object
        ? SectionType[keyof SectionType]
        : never
      : never
  >(
    section: Section,
    key: keyof NonNullable<UserPreferencesDto[Section]>,
    value: Value
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
    const actions = [];

    if (!isEqual(formData, initialPreferences)) {
      actions.push(apiClient.updateCurrentUserPreferences(formData));
    }

    if (file) {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      actions.push(
        fetch("/elder-rings/api/user/set-picture", {
          method: "POST",
          body: formDataObj,
        })
      );
    }

    try {
      await Promise.all(actions);
      await refreshUserPreferences?.();
      notifySuccess(t("Components.UserPreferencesForm.PreferencesUpdated"));
      setInitialPreferences(formData);
      setFile(null);
    } catch (err) {
      console.error("Failed to update preferences", err);
    }
  };

  const updateAudioFilter = (index: number, field: "frequency" | "gain", value: number) => {
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col grow h-full overflow-auto p-4">
      {/* Profile Picture */}
      <div className="flex flex-wrap gap-8 justify-start">
        <section className="w-1/3">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">
              {t("Components.UserPreferencesForm.ProfilePicture")}
            </h2>
            <Divider className="" />
            <img
              src={
                userPicture
                  ? `data:image/*;base64,${userPicture}`
                  : basePath + "/picture-user-default.jpg"
              }
              alt={t("Components.UserPreferencesForm.PersonalPicture")}
              className="w-64 object-contain"
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-80"
            />
          </div>
        </section>

        <div className="flex flex-col gap-4 w-1/3">
          {/* General */}
          <section>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">
                {t("Components.UserPreferencesForm.GeneralTitle")}
              </h2>
              <Divider className="" />
              <Checkbox
                isSelected={formData.general?.isPublic}
                onValueChange={(e) => handleChange("general", "isPublic", e)}
                aria-label={t("Components.UserPreferencesForm.IsPublicProfile")}
              >
                {t("Components.UserPreferencesForm.IsPublicProfile")}
              </Checkbox>
              <Select
                className="max-w-xs"
                label={t("Components.UserPreferencesForm.Language")}
                aria-label={t("Components.UserPreferencesForm.Language")}
                selectedKeys={formData.general?.lang ? [formData.general?.lang] : []}
                variant="flat"
                onChange={(e) => {
                  console.log(e.target.value);
                  handleChange("general", "lang", e.target.value);
                }}
              >
                {Object.values(SupportedLanguage).map((lang) => (
                  <SelectItem key={lang} textValue={t(`Enums.Language.${lang.toUpperCase()}`)}>
                    {t(`Enums.Language.${lang.toUpperCase()}`)}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </section>

          {/* Visual */}
          <section>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">
                {t("Components.UserPreferencesForm.VisualTitle")}
              </h2>
              <Divider className="" />
              <Checkbox
                isSelected={formData.visual?.readTextOnScreen}
                onValueChange={(e) => handleChange("visual", "readTextOnScreen", e)}
                aria-label={t("Components.UserPreferencesForm.ReadTextOnScreen")}
              >
                {t("Components.UserPreferencesForm.ReadTextOnScreen")}
              </Checkbox>
              <Select
                className="max-w-xs"
                label={t("Components.UserPreferencesForm.TextSize")}
                aria-label={t("Components.UserPreferencesForm.TextSize")}
                selectedKeys={formData.visual?.textSize ? [formData.visual?.textSize] : []}
                variant="flat"
                onChange={(e) => {
                  console.log(e.target.value);
                  handleChange("visual", "textSize", e.target.value);
                }}
              >
                {textSizeDtoValues.map((value) => (
                  <SelectItem key={value} textValue={t(`Enums.TextSizeDto.${value}`)}>
                    {t(`Enums.TextSizeDto.${value}`)}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </section>
        </div>

        {/* Audio */}
        <section>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">
              {t("Components.UserPreferencesForm.AudioTitle")}
            </h2>
            <Divider className="" />
            <Checkbox
              isSelected={formData.audio?.compression}
              onValueChange={(e) => handleChange("audio", "compression", e)}
              aria-label={t("Components.UserPreferencesForm.EnableAudioCompression")}
            >
              {t("Components.UserPreferencesForm.EnableAudioCompression")}
            </Checkbox>
            <Checkbox
              isSelected={formData.audio?.playInterfaceSounds}
              onValueChange={(e) => handleChange("audio", "playInterfaceSounds", e)}
              aria-label={t("Components.UserPreferencesForm.PlayInterfaceSounds")}
            >
              {t("Components.UserPreferencesForm.PlayInterfaceSounds")}
            </Checkbox>
            <div className="flex flex-col gap-2 pl-2">
              <h3 className="text-md font-semibold">
                {t("Components.UserPreferencesForm.AudioFilters")}
              </h3>
              {formData.audio?.filters?.map((filter, index) => (
                <div key={index} className="flex items-center gap-2">
                  <NumberInput
                    placeholder={t("Components.UserPreferencesForm.FrequencyPlaceholder")}
                    value={filter.frequency}
                    onValueChange={(e) => updateAudioFilter(index, "frequency", e)}
                    aria-label={t("Components.UserPreferencesForm.FrequencyPlaceholder")}
                    size="sm"
                    minValue={100}
                    maxValue={20000}
                    className="w-32"
                  />
                  <NumberInput
                    placeholder={t("Components.UserPreferencesForm.GainPlaceholder")}
                    value={filter.gain}
                    onValueChange={(e) => updateAudioFilter(index, "gain", e)}
                    aria-label={t("Components.UserPreferencesForm.GainPlaceholder")}
                    size="sm"
                    minValue={-100}
                    maxValue={100}
                    className="w-32"
                  />
                  <Button
                    onPress={() => removeAudioFilter(index)}
                    isIconOnly
                    aria-label={t("Components.UserPreferencesForm.RemoveFilter")}
                    color="danger"
                    variant="light"
                  >
                    <IconRemove />
                  </Button>
                </div>
              ))}
              <Button
                onPress={addAudioFilter}
                aria-label={t("Components.UserPreferencesForm.AddFilter")}
                variant="light"
                startContent={<IconAdd />}
                color="primary"
              >
                {t("Components.UserPreferencesForm.AddFilter")}
              </Button>
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
          color="primary"
          size="lg"
        >
          {t("Components.UserPreferencesForm.SavePreferences")}
        </Button>
        <BackHomeButton variant="solid" size="lg" color="primary" />
      </div>
    </form>
  );
}
