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

  useEffect(() => {
    apiClient.getResidents().then((res) => {
      setResidents(res);
    });
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
            </Card.Content>
            <Card.Footer className="flex gap-2">
              <Button
                variant="primary"
                className="bg-success"
                isIconOnly
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
