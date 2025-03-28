import { speakText } from "@utils/speechUtils";
import { useUserPreferences } from "./useUserPreferences";

export function useTTS() {
  const { userPreferences } = useUserPreferences(); // or your auth context

  return (text: string) =>
    speakText(
      text,
      userPreferences?.general?.lang,
      userPreferences?.visual?.readTextOnScreen ?? false
    );
}
