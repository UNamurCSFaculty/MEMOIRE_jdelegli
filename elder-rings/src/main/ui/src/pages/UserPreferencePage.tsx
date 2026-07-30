import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import isEqual from "lodash/isEqual";

import UserPreferencesForm from "@components/userPreferences/UserPreferencesForm";
import { apiClient } from "@openapi/zodiosClient";
import { UserPreferencesDto } from "@type/openapiTypes";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { notifySuccess } from "@utils/notifyUtil";

export default function UserPreferencePage() {
  const { t } = useTranslation();
  const { userPreferences, refreshUserPreferences } = useUserPreferences();
  const [userPicture, setUserPicture] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getCurrentUserPicture().then((resp) => setUserPicture(resp));
  }, []);

  const handleSave = async (preferences: UserPreferencesDto, file: File | null) => {
    const actions = [];

    if (!isEqual(preferences, userPreferences)) {
      actions.push(apiClient.updateCurrentUserPreferences(preferences));
    }

    if (file) {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      actions.push(
        fetch("/elder-rings/api/user/set-picture", { method: "POST", body: formDataObj }),
      );
    }

    await Promise.all(actions);
    await refreshUserPreferences();
    notifySuccess(t("Components.UserPreferencesForm.PreferencesUpdated"));
  };

  return (
    <div className="flex m-8 rounded-xl bg-white/60 flex-1 min-h-0 p-4">
      <UserPreferencesForm
        preferences={userPreferences}
        onSave={handleSave}
        showPictureSection
        pictureBase64={userPicture}
      />
    </div>
  );
}
