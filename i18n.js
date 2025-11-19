"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

// Default namespace
export const defaultNS = "common";

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: "pl", // default UI language
    fallbackLng: "pl", // fallback (if translation missing)
    ns: [defaultNS],
    defaultNS,

    interpolation: {
      escapeValue: false, // react already protects against XSS
    },

    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  });

export default i18n;
