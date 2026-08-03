import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@openapi/zodiosClient";
import { notifySuccess } from "@utils/notifyUtil";
import { useUserPreferences } from "./useUserPreferences";
import { useDndStatus } from "./useDndStatus";

/**
 * Toggles the resident's do-not-disturb mode: continuous when no
 * auto-disable duration is configured, timed otherwise.
 * Shared by the home menu button and the TV remote button.
 */
export function useToggleDnd() {
  const { t } = useTranslation();
  const { userPreferences, refreshUserPreferences } = useUserPreferences();
  const { active: dndActive } = useDndStatus();

  return useCallback(async () => {
    const durationMinutes = userPreferences.dnd?.durationMinutes ?? null;
    const activate = !dndActive;

    const resp = await apiClient.updateCurrentUserPreferences({
      ...userPreferences,
      dnd: {
        ...userPreferences.dnd,
        enabled: activate && durationMinutes == null,
        until:
          activate && durationMinutes != null
            ? new Date(Date.now() + durationMinutes * 60_000).toISOString()
            : undefined,
      },
    });
    await refreshUserPreferences();
    notifySuccess(
      t("Common.DndToggle.Notification", {
        status: resp.dnd?.active ? t("Common.DndToggle.Enabled") : t("Common.DndToggle.Disabled"),
      }),
    );
  }, [dndActive, userPreferences, refreshUserPreferences, t]);
}
