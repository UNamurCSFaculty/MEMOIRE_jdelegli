import { Locale, setDefaultOptions } from "date-fns";
import { fr as frFnsDate, enUS as enFnsDate, nl as nlFnsDate } from "date-fns/locale";
import translationFr from "./fr/translation.json";
import translationZodFr from "./fr/zodTranslation.json";
import translationEn from "./en/translation.json";
import translationNl from "./nl/translation.json";
import translationZodNl from "./nl/zodTranslation.json";
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Define enum for supported languages
export enum SupportedLanguage {
  FR = "fr",
  EN = "en",
  NL = "nl",
}

// Used to sync with date-fns locale per language
const dateFnsLocales: Record<SupportedLanguage, Locale> = {
  [SupportedLanguage.FR]: frFnsDate,
  [SupportedLanguage.EN]: enFnsDate,
  [SupportedLanguage.NL]: nlFnsDate,
};

// Set the initial default locale (can be updated later dynamically)
setDefaultOptions({ locale: dateFnsLocales[SupportedLanguage.FR] });

export const resources = {
  [SupportedLanguage.FR]: {
    translation: translationFr,
    zod: translationZodFr,
  },
  [SupportedLanguage.EN]: {
    translation: translationEn,
  },
  [SupportedLanguage.NL]: {
    translation: translationNl,
    zod: translationZodNl,
  },
} as const;

z.setErrorMap(zodI18nMap);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: SupportedLanguage.FR,
    supportedLngs: Object.values(SupportedLanguage),
    interpolation: { escapeValue: false },
  });

export default i18n;
export { dateFnsLocales };
