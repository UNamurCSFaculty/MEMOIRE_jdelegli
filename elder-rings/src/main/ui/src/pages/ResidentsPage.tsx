import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@openapi/zodiosClient";
import { ContactDto } from "@type/openapiTypes";
import { IconSettings, IconStartCall } from "@components/icons/favouriteIcons";
import { useNavigate } from "react-router-dom";
import { useStartCall } from "../hooks/useStartCall";
import BackHomeButton from "@components/navigation/BackHomeButton";
import PendingRequestsBadge from "@components/addContact/PendingRequestsBadge";
import UserCard from "@components/users/UserCard";

function ResidentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const startCall = useStartCall();
  const [residents, setResidents] = useState<ContactDto[]>([]);
  const [dndMap, setDndMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      const res = await apiClient.getResidents();
      setResidents(res);

      const dndEntries = await Promise.all(
        res.map(async (resident) => {
          const dndStatus = await apiClient.getUserDndStatus({
            queries: { userId: resident.id },
          });
          return [resident.id, dndStatus.active] as [string, boolean];
        }),
      );
      setDndMap(Object.fromEntries(dndEntries));
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center flex-1 min-h-0 p-4 m-8 gap-4 bg-white/60 rounded-xl">
      <h1 className="text-3xl font-semibold w-full">{t("Pages.ResidentsPage.Title")}</h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] auto-rows-max gap-6 flex-1 w-full overflow-y-auto min-h-0 p-2 -m-2">
        {residents.map((resident) => {
          const name = `${resident.firstName} ${resident.lastName}`;
          return (
            <UserCard
              key={resident.id}
              user={resident}
              pictureAlt={t("Pages.ResidentsPage.PictureAlt", { name })}
              dndLabel={dndMap[resident.id!] ? t("Pages.ResidentsPage.DoNotDisturb") : undefined}
              actions={[
                {
                  label: t("Pages.ResidentsPage.Call", { name }),
                  icon: <IconStartCall />,
                  variant: "primary",
                  className: "bg-success",
                  isDisabled: dndMap[resident.id!],
                  onClick: () => startCall(resident),
                },
                {
                  label: t("Pages.ResidentsPage.Settings", { name }),
                  icon: <IconSettings />,
                  variant: "primary",
                  onClick: () => navigate(`/residents/${resident.id}/settings`),
                },
              ]}
            >
              <PendingRequestsBadge userId={resident.id!} className="absolute -top-2 -right-2" />
            </UserCard>
          );
        })}
      </div>
      <BackHomeButton />
    </div>
  );
}

export default ResidentsPage;
