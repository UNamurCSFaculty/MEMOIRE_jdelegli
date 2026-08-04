import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@openapi/zodiosClient";
import { ContactDto } from "@type/openapiTypes";
import { IconStartCall } from "@components/icons/favouriteIcons";
import { useStartCall } from "../hooks/useStartCall";
import { useUser } from "../hooks/useUser";
import BackHomeButton from "@components/navigation/BackHomeButton";
import UserCard from "@components/users/UserCard";

function StaffPage() {
  const { t } = useTranslation();
  const user = useUser();
  const startCall = useStartCall();
  const [staffMembers, setStaffMembers] = useState<ContactDto[]>([]);
  const [dndMap, setDndMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      const res = await apiClient.getStaffMembers();
      const others = res.filter((member) => member.id !== user.id);
      setStaffMembers(others);

      const dndEntries = await Promise.all(
        others.map(async (member) => {
          const dndStatus = await apiClient.getUserDndStatus({
            queries: { userId: member.id },
          });
          return [member.id, dndStatus.active] as [string, boolean];
        }),
      );
      setDndMap(Object.fromEntries(dndEntries));
    };
    fetchData();
  }, [user.id]);

  return (
    <div className="flex flex-col items-center flex-1 min-h-0 p-4 m-8 gap-4 bg-white/60 rounded-xl">
      <h1 className="text-3xl font-semibold w-full">{t("Pages.StaffPage.Title")}</h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] auto-rows-max gap-6 flex-1 w-full overflow-y-auto min-h-0 p-2 -m-2">
        {staffMembers.map((member) => {
          const name = `${member.firstName} ${member.lastName}`;
          return (
            <UserCard
              key={member.id}
              user={member}
              pictureAlt={t("Pages.StaffPage.PictureAlt", { name })}
              dndLabel={dndMap[member.id!] ? t("Pages.StaffPage.DoNotDisturb") : undefined}
              actions={[
                {
                  label: t("Pages.StaffPage.Call", { name }),
                  icon: <IconStartCall />,
                  variant: "primary",
                  className: "bg-success",
                  isDisabled: dndMap[member.id!],
                  onClick: () => startCall(member),
                },
              ]}
            />
          );
        })}
      </div>
      <BackHomeButton />
    </div>
  );
}

export default StaffPage;
