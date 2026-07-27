import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { apiClient } from "@openapi/zodiosClient";
import { ContactDto } from "@type/openapiTypes";
import { Avatar, Button, Card } from "@heroui/react";
import { IconSettings, IconStartCall } from "@components/icons/favouriteIcons";
import { useNavigate } from "react-router-dom";
import { useStartCall } from "../hooks/useStartCall";
import BackHomeButton from "@components/navigation/BackHomeButton";

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
    <div className="flex flex-col items-center h-full p-4 m-8 gap-4 bg-white/60 rounded-xl">
      <h1 className="text-3xl font-semibold w-full">{t("Pages.ResidentsPage.Title")}</h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] auto-rows-max gap-6 flex-1 w-full overflow-y-auto min-h-0">
        {residents.map((resident) => (
          <Card key={resident.id} className="items-center gap-4 p-6">
            <Avatar className="size-24">
              <Avatar.Image
                src={resident.picture ? `data:image/*;base64,${resident.picture}` : undefined}
                alt={t("Pages.ResidentsPage.PictureAlt", {
                  name: `${resident.firstName} ${resident.lastName}`,
                })}
              />
              <Avatar.Fallback>
                {resident.firstName?.[0]}
                {resident.lastName?.[0]}
              </Avatar.Fallback>
            </Avatar>
            <Card.Content className="text-center">
              <Card.Title className="text-xl font-semibold">
                {resident.firstName} {resident.lastName}
              </Card.Title>
              {dndMap[resident.id!] && (
                <p className="mt-1 inline-flex items-center gap-2 bg-red-100 text-red-900 py-1 px-3 rounded-full text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  {t("Pages.ResidentsPage.DoNotDisturb")}
                </p>
              )}
            </Card.Content>
            <Card.Footer className="flex gap-2">
              <Button
                variant="primary"
                className="bg-success"
                isIconOnly
                isDisabled={dndMap[resident.id!]}
                onPress={() => startCall(resident)}
                aria-label={t("Pages.ResidentsPage.Call", {
                  name: `${resident.firstName} ${resident.lastName}`,
                })}
              >
                <IconStartCall />
              </Button>
              <Button
                isIconOnly
                variant="primary"
                onPress={() => navigate(`/residents/${resident.id}/settings`)}
                aria-label={t("Pages.ResidentsPage.Settings", {
                  name: `${resident.firstName} ${resident.lastName}`,
                })}
              >
                <IconSettings />
              </Button>
            </Card.Footer>
          </Card>
        ))}
      </div>
      <BackHomeButton />
    </div>
  );
}

export default ResidentsPage;
