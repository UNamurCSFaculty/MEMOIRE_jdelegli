import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { IconContact, IconEvent, IconGear } from "@components/icons/favouriteIcons";
import { useTranslation } from "react-i18next";
import WeatherSnippet from "@components/weather/WeatherSnippet";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { basePath } from "../../basepath.config";

const options = [
  {
    label: "Contacts",
    route: "/contacts",
    icon: IconContact,
  },
  {
    label: "Events",
    route: "/events",
    icon: IconEvent,
  },
  {
    label: "Preference",
    route: "/user-preferences",
    icon: IconGear,
  },
  {
    label: "Weather",
    route: "/weather",
    render: () => <WeatherSnippet />,
  },
];

export default function HomeMenu() {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userPreferences } = useUserPreferences();

  const nbElementPerRow = 2;

  const navSound = new Audio(basePath + "/api/media/sounds/click.wav");
  const selectSound = new Audio(basePath + "/api/media/sounds/navigate.mp3");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const row = Math.floor(focusedIndex / nbElementPerRow);

      // Navigation sounds
      if (userPreferences?.audio?.playInterfaceSounds) {
        switch (e.key) {
          case "ArrowRight":
          case "ArrowLeft":
          case "ArrowDown":
          case "ArrowUp":
            navSound.currentTime = 0;
            navSound.play().catch((e) => {
              console.error(e);
            });
            break;
          case "Enter":
            selectSound.play().catch(() => {});
        }
      }

      // Navigation actions
      switch (e.key) {
        case "ArrowRight":
          setFocusedIndex((prev) => (prev >= options.length - 1 ? 0 : prev + 1));
          break;
        case "ArrowLeft":
          setFocusedIndex((prev) => (prev === 0 ? options.length - 1 : prev - 1));
          break;
        case "ArrowDown":
          setFocusedIndex((prev) => (row === 1 ? prev - nbElementPerRow : prev + nbElementPerRow));
          break;
        case "ArrowUp":
          setFocusedIndex((prev) => (row === 0 ? prev + nbElementPerRow : prev - nbElementPerRow));
          break;
        case "Enter":
          navigate(options[focusedIndex].route);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, navigate]);

  return (
    <div className="flex items-center justify-center w-screen h-screen p-12">
      <div className="grid grid-cols-2 grid-rows-2 gap-8 w-full h-full ">
        {options.map((option, index) => {
          return (
            <button
              key={option.label}
              onClick={() => navigate(option.route)}
              className={twMerge(
                "transition-all duration-200 backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white rounded-2xl flex flex-col items-center justify-center text-center shadow-lg focus:outline-none",
                focusedIndex === index && "ring-4 ring-white scale-105 bg-white/20"
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
