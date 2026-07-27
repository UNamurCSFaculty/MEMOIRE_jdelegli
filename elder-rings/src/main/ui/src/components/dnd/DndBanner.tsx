import { useTranslation } from "react-i18next";
import { useDndStatus } from "../../hooks/useDndStatus";
import { IconDoNotDisturb } from "@components/icons/favouriteIcons";

export default function DndBanner() {
  const { t } = useTranslation();
  const { active, until } = useDndStatus();

  if (!active) return null;

  return (
    <div className="flex items-center gap-3 bg-red-100 text-red-900 rounded-lg px-4 py-2">
      <IconDoNotDisturb className="w-6 h-6" />
      <span className="font-semibold">
        {until
          ? t("Components.DndBanner.ActiveUntil", {
              time: until.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            })
          : t("Components.DndBanner.Active")}
      </span>
    </div>
  );
}
