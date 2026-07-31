import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { apiClient } from "@openapi/zodiosClient";
import {
  AutonomyLevel,
  ResidentDto,
  UserPreferencesDto,
  autonomyLevelValues,
} from "@type/openapiTypes";
import UserPreferencesForm from "@components/userPreferences/UserPreferencesForm";
import LoadingPage from "./generic/LoadingPage";
import { CALL_POLICY_FLOOR } from "@utils/callPolicyFloor";
import { notifySuccess } from "@utils/notifyUtil";
import { Avatar, Label, ListBox, Select } from "@heroui/react";
import { useUser } from "../hooks/useUser";

export default function ResidentSettingsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const user = useUser();

  const [resident, setResident] = useState<ResidentDto | null>(null);
  const [preferences, setPreferences] = useState<UserPreferencesDto | null>(null);
  const [picture, setPicture] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    const [res, prefs] = await Promise.all([
      apiClient.getResident({ queries: { userId: id } }),
      apiClient.getUserPreferences({ queries: { userId: id } }),
    ]);
    setResident(res);
    setPreferences(prefs);
    // fetched apart: a resident without picture must not block the page
    apiClient
      .getUserPicture({ queries: { userId: id } })
      .then(setPicture)
      .catch(() => setPicture(null));
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!id) return <p>error</p>;
  if (!resident || !preferences) return <LoadingPage />;

  const handleSave = async (prefs: UserPreferencesDto, file: File | null) => {
    const actions: Promise<unknown>[] = [
      apiClient.updateUserPreferences(prefs, { queries: { userId: id } }),
    ];

    if (file) {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      actions.push(
        fetch(`/elder-rings/api/user/set-picture/of-user?userId=${id}`, {
          method: "POST",
          body: formDataObj,
        }),
      );
    }

    await Promise.all(actions);
    await fetchData();
    notifySuccess(t("Components.UserPreferencesForm.PreferencesUpdated"));
  };

  const handleAutonomyChange = async (level: AutonomyLevel) => {
    await apiClient.updateResidentSettings({ autonomyLevel: level }, { queries: { userId: id } });
    await fetchData();
  };

  return (
    <div className="flex flex-col m-8 p-4 gap-4 rounded-xl bg-white/60 flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <Avatar.Image
            src={resident.picture ? `data:image/*;base64,${resident.picture}` : undefined}
            alt={`${resident.firstName} ${resident.lastName}`}
          />
          <Avatar.Fallback>
            {resident.firstName?.[0]}
            {resident.lastName?.[0]}
          </Avatar.Fallback>
        </Avatar>
        <h1 className="text-3xl font-semibold">
          {t("Pages.ResidentSettingsPage.Title", {
            name: `${resident.firstName} ${resident.lastName}`,
          })}
        </h1>
      </div>

      {user.userType === "STAFF" && (
        <Select
          className="max-w-xs"
          value={resident.autonomyLevel ?? null}
          variant="secondary"
          onChange={(value) => {
            if (value == null || Array.isArray(value)) return;
            handleAutonomyChange(value as AutonomyLevel);
          }}
        >
          <Label className="text-lg font-semibold">
            {t("Pages.ResidentSettingsPage.AutonomyLevel")}
          </Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {autonomyLevelValues.map((level) => (
                <ListBox.Item key={level} id={level} textValue={t(`Enums.AutonomyLevel.${level}`)}>
                  {t(`Enums.AutonomyLevel.${level}`)}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      )}

      <UserPreferencesForm
        preferences={preferences}
        onSave={handleSave}
        showPictureSection
        pictureBase64={picture}
        showCallPolicySection
        callPolicyFloor={
          resident.autonomyLevel ? CALL_POLICY_FLOOR[resident.autonomyLevel] : undefined
        }
        lockMode={user.userType === "STAFF" ? "manage" : "readonly"}
      />
    </div>
  );
}
