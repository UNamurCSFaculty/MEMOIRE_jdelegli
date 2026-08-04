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
import { notifyError, notifySuccess } from "@utils/notifyUtil";
import { Avatar, Label, ListBox, Select } from "@heroui/react";
import { useUser } from "../hooks/useUser";
import { ContactRequestWithUser } from "@components/addContact/ContactRequestModal";
import { IconCheck, IconClose } from "@components/icons/favouriteIcons";
import ResidentTutors from "@components/residentSettings/ResidentTutors";
import UserRow from "@components/users/UserRow";

export default function ResidentSettingsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const user = useUser();

  const [resident, setResident] = useState<ResidentDto | null>(null);
  const [preferences, setPreferences] = useState<UserPreferencesDto | null>(null);
  const [picture, setPicture] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<ContactRequestWithUser[]>([]);

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

    // fetch pending requests of the resident
    apiClient
      .getPendingRequestsOfUser({ queries: { userId: id } })
      .then((requests) =>
        Promise.all(
          requests.map(async (request) => {
            const requester = await apiClient.getUser({ queries: { userId: request.requesterId } });
            return { request, requester };
          }),
        ),
      )
      .then(setPendingRequests)
      .catch(() => setPendingRequests([]));
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

  const handleRequestResponse = async (requestId: string, accepted: boolean) => {
    const entry = pendingRequests.find((r) => r.request.id === requestId);
    try {
      await apiClient.respondToContactRequest(undefined, {
        queries: { accepted },
        params: { requestId },
      });
      setPendingRequests((prev) => prev.filter((r) => r.request.id !== requestId));
      notifySuccess(
        t(
          accepted
            ? "Pages.ResidentSettingsPage.RequestAccepted"
            : "Pages.ResidentSettingsPage.RequestDeclined",
          { name: `${entry?.requester.firstName} ${entry?.requester.lastName}` },
        ),
      );
    } catch {
      notifyError(t("Pages.ResidentSettingsPage.RequestResponseFailed"));
    }
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

      <section className="flex flex-col gap-2 max-h-60 overflow-y-auto">
        <h2 className="text-lg font-semibold">
          {t("Pages.ResidentSettingsPage.PendingRequestsTitle")}
        </h2>
        {pendingRequests.length === 0 && (
          <p className="text-sm italic text-slate-700">
            {t("Pages.ResidentSettingsPage.NoPendingRequests")}
          </p>
        )}
        {pendingRequests.map(({ request, requester }) => (
          <UserRow
            key={request.id}
            user={requester}
            actions={[
              {
                icon: <IconCheck />,
                label: t("Pages.ResidentSettingsPage.AcceptRequest"),
                onClick: () => handleRequestResponse(request.id!, true),
                variant: "primary",
              },
              {
                icon: <IconClose />,
                label: t("Pages.ResidentSettingsPage.DeclineRequest"),
                onClick: () => handleRequestResponse(request.id!, false),
                variant: "danger",
              },
            ]}
          />
        ))}
      </section>

      {user.userType === "STAFF" && <ResidentTutors residentId={id} />}

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
        showDndAutoDisable={resident.autonomyLevel !== "DEPENDENT"}
        requireDndAutoDisable={resident.autonomyLevel === "INTERMEDIATE"}
      />
    </div>
  );
}
