"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

export const defaultNS = "common";
export const LANG_STORAGE_KEY = "app_lang";

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: "pl", // single SSR/initial language
    fallbackLng: "pl",
    ns: [defaultNS],
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  });

export default i18n;
