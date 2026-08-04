import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@openapi/zodiosClient";
import { ContactDto } from "@type/openapiTypes";
import { Button, Input, Label } from "@heroui/react";
import { IconAdd, IconRemove } from "@components/icons/favouriteIcons";
import { notifyError, notifySuccess } from "@utils/notifyUtil";
import UserRow from "@components/users/UserRow";

interface ResidentTutorsProps {
  residentId: string;
}

export default function ResidentTutors({ residentId }: Readonly<ResidentTutorsProps>) {
  const { t } = useTranslation();
  const [tutors, setTutors] = useState<ContactDto[]>([]);
  const [families, setFamilies] = useState<ContactDto[]>([]);
  const [search, setSearch] = useState("");

  const fetchTutors = useCallback(() => {
    apiClient
      .getResidentTutors({ queries: { residentId } })
      .then(setTutors)
      .catch(() => setTutors([]));
  }, [residentId]);

  useEffect(() => {
    fetchTutors();
    apiClient
      .getFamilies()
      .then(setFamilies)
      .catch(() => setFamilies([]));
  }, [fetchTutors]);

  const query = search.trim().toLowerCase();
  const matches =
    query === ""
      ? []
      : families
          .filter((family) => tutors.every((tutor) => tutor.id !== family.id)) // Remove already assigned tutors from the list of matches
          .filter(
            (family) =>
              family.username?.toLowerCase().includes(query) ||
              family.firstName?.toLowerCase().includes(query) ||
              family.lastName?.toLowerCase().includes(query),
          );

  const handleAssign = async (family: ContactDto) => {
    try {
      await apiClient.assignTutor(undefined, {
        queries: { residentId, tutorId: family.id },
      });
      setSearch("");
      fetchTutors();
      notifySuccess(
        t("Components.ResidentTutors.TutorAdded", {
          name: `${family.firstName} ${family.lastName}`,
        }),
      );
    } catch {
      notifyError(t("Components.ResidentTutors.ActionFailed"));
    }
  };

  const handleRemove = async (tutor: ContactDto) => {
    try {
      await apiClient.removeTutor(undefined, {
        queries: { residentId, tutorId: tutor.id },
      });
      fetchTutors();
      notifySuccess(
        t("Components.ResidentTutors.TutorRemoved", {
          name: `${tutor.firstName} ${tutor.lastName}`,
        }),
      );
    } catch {
      notifyError(t("Components.ResidentTutors.ActionFailed"));
    }
  };

  return (
    <section className="flex flex-col gap-2 max-h-60 overflow-y-auto p-1 -m-1">
      <h2 className="text-lg font-semibold">{t("Components.ResidentTutors.Title")}</h2>
      {tutors.length === 0 && (
        <p className="text-sm italic text-slate-700">{t("Components.ResidentTutors.NoTutors")}</p>
      )}
      {tutors.map((tutor) => (
        <UserRow
          key={tutor.id}
          user={tutor}
          actions={[
            {
              onClick: () => handleRemove(tutor),
              label: t("Components.ResidentTutors.RemoveTutor", {
                name: `${tutor.firstName} ${tutor.lastName}`,
              }),
              icon: <IconRemove />,
              variant: "danger",
            },
          ]}
        />
      ))}

      <Label htmlFor="tutor-search">{t("Components.ResidentTutors.SearchLabel")}</Label>
      <Input
        id="tutor-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("Components.ResidentTutors.SearchPlaceholder")}
        className="max-w-xs"
      />
      {matches.map((family) => (
        <div
          key={family.id}
          className="flex items-center gap-4 bg-white/30 p-2 rounded-lg max-w-xl"
        >
          <p>
            {family.firstName} {family.lastName}{" "}
            <span className="text-sm text-slate-600">({family.username})</span>
          </p>
          <Button
            className="ml-auto"
            isIconOnly
            variant="primary"
            onPress={() => handleAssign(family)}
            aria-label={t("Components.ResidentTutors.AddTutor", {
              name: `${family.firstName} ${family.lastName}`,
            })}
          >
            <IconAdd />
          </Button>
        </div>
      ))}
      {query !== "" && matches.length === 0 && (
        <p className="text-sm italic text-slate-700">{t("Components.ResidentTutors.NoMatch")}</p>
      )}
    </section>
  );
}
