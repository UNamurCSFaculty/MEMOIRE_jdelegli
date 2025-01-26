import { setDefaultOptions } from "date-fns";
import { fr as frFnsDate } from "date-fns/locale";
import translationFr from "./fr/translation.json";
import translationZodFr from "./fr/zodTranslation.json";
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

setDefaultOptions({ locale: frFnsDate });

export type BundleEnum = keyof (typeof resources)["fr"];
export interface CodeLabelBundle {
  value: string;
  label: string;
}

export const resources = {
  fr: {
    translation: translationFr,
    zod: translationZodFr,
  },
};

z.setErrorMap(zodI18nMap);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "fr",
    supportedLngs: ["fr"],
    interpolation: { escapeValue: false },
  });

export default i18n;
