import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import {
  IconContact,
  IconEvent,
  IconGear,
  IconDoNotDisturb,
  IconRooms,
} from "@components/icons/favouriteIcons";
import { useTranslation } from "react-i18next";
import WeatherSnippet from "@components/weather/WeatherSnippet";
import { apiClient } from "@openapi/zodiosClient";
import { notifySuccess } from "@utils/notifyUtil";
import { Button } from "@heroui/react";
import { useUser } from "../hooks/useUser";

export default function HomeMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useUser();

  const toggleDoNotDisturb = useCallback(async () => {
    const current = await apiClient.getCurrentUserPreferences();
    await apiClient
      .updateCurrentUserPreferences({
        ...current,
        general: {
          ...current?.general,
          doNotDisturb: !current?.general?.doNotDisturb,
        },
      })
      .then((resp) => {
        notifySuccess(
          t(`Pages.HomeMenu.DoNotDisturbButton.notification`, {
            status: resp.general?.doNotDisturb
              ? t("Pages.HomeMenu.DoNotDisturbButton.Enabled")
              : t("Pages.HomeMenu.DoNotDisturbButton.Disabled"),
          }),
        );
      });
  }, [t]);

  const options = useMemo(
    () => [
      {
        label: "Contacts",
        onClick: () => navigate("/contacts"),
        icon: IconContact,
      },
      {
        label: "Events",
        onClick: () => navigate("/events"),
        icon: IconEvent,
      },
      {
        label: "Preference",
        onClick: () => navigate("/user-preferences"),
        icon: IconGear,
      },
      {
        label: "Weather",
        onClick: () => navigate("/weather"),
        render: () => <WeatherSnippet />,
      },
      {
        label: "DoNotDisturbButton.Label",
        onClick: () => toggleDoNotDisturb(),
        icon: IconDoNotDisturb,
      },
      ...(user.userType === "STAFF"
        ? [
            {
              label: "Residents",
              onClick: () => navigate("/residents"),
              icon: IconRooms,
            },
          ]
        : []),
    ],
    [navigate, toggleDoNotDisturb, user.userType],
  );

  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const COLS = 2;

  useEffect(() => {
    buttonsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const total = options.length;
      const currentIdx = buttonsRef.current.findIndex((b) => b === document.activeElement);
      if (currentIdx === -1) return;

      const totalRows = Math.ceil(total / COLS);
      const row = Math.floor(currentIdx / COLS);
      const col = currentIdx % COLS;
      let targetIdx: number | null = null;

      switch (e.key) {
        case "ArrowRight":
          targetIdx = (currentIdx + 1) % total;
          break;
        case "ArrowLeft":
          targetIdx = (currentIdx - 1 + total) % total;
          break;
        case "ArrowDown": {
          const nextRow = (row + 1) % totalRows;
          targetIdx = Math.min(nextRow * COLS + col, total - 1);
          break;
        }
        case "ArrowUp": {
          const prevRow = (row - 1 + totalRows) % totalRows;
          targetIdx = Math.min(prevRow * COLS + col, total - 1);
          break;
        }
      }

      if (targetIdx !== null) {
        e.preventDefault();
        buttonsRef.current[targetIdx]?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options]);

  return (
    <div className="flex items-center justify-center w-screen h-screen p-6">
      <div className="grid grid-cols-2 auto-rows-fr gap-4 w-full h-full">
        {options.map((option, index) => {
          const isAloneOnRow = index === options.length - 1 && options.length % 2 === 1;
          return (
            <Button
              ref={(el) => {
                buttonsRef.current[index] = el;
              }}
              variant="ghost"
              fullWidth
              key={option.label}
              onClick={option.onClick}
              className={twMerge(
                "h-full transition-all duration-200 backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white rounded-2xl flex flex-col items-center justify-center text-center shadow-lg focus:outline-none",
                isAloneOnRow && "col-span-2",
              )}
            >
              {option.render ? (
                option.render()
              ) : (
                <option.icon className="mb-4 drop-shadow w-32 h-32" />
              )}
              <span className="text-3xl font-semibold drop-shadow">
                {t(`Pages.HomeMenu.${option.label}`)}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
