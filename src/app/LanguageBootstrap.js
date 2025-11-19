"use client";

import { useEffect } from "react";
import i18n, { LANG_STORAGE_KEY } from "../../i18n";

export default function LanguageBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }
  }, []);

  return null;
}
