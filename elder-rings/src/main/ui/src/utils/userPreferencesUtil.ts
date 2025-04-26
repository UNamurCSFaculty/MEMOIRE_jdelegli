import { setDefaultOptions } from "date-fns";
import i18n, { dateFnsLocales, SupportedLanguage } from "../locales/i18n";
import { UserPreferencesDto } from "@type/openapiTypes";

export const textSizeScaleMap: Record<string, string> = {
  SM: "80%",
  MD: "100%",
  LG: "140%",
  XL: "175%",
  XXL: "200%",
};

export function applyUserPreferences(preferences: UserPreferencesDto) {
  const lang = preferences.general?.lang;
  const textSize = preferences.visual?.textSize;

  if (lang && Object.values(SupportedLanguage).includes(lang as SupportedLanguage)) {
    i18n.changeLanguage(lang);
    setDefaultOptions({ locale: dateFnsLocales[lang as SupportedLanguage] });
  }

  const scale = textSizeScaleMap[textSize ?? "MD"] ?? "100%";
  document.documentElement.style.fontSize = scale;
}
