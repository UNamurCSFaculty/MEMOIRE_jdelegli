import { useEffect, useMemo } from "react";
import { basePath } from "../../../basepath.config";
import { useUserPreferences } from "../../hooks/useUserPreferences";

export default function SoundPlayer() {
  const { userPreferences } = useUserPreferences();
  const enabled = userPreferences?.audio?.playInterfaceSounds;

  const navSound = useMemo(() => new Audio(basePath + "/api/media/sounds/click.wav"), []);
  const selectSound = useMemo(() => new Audio(basePath + "/api/media/sounds/navigate.mp3"), []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowLeft":
        case "ArrowDown":
        case "ArrowUp":
          navSound.currentTime = 0;
          navSound.play().catch((err) => console.error(err));
          break;
        case "Enter":
          selectSound.play().catch(() => {});
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [enabled, navSound, selectSound]);

  return null;
}
