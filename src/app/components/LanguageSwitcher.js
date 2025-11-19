"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { LANG_STORAGE_KEY } from "../../../i18n";

const FLAG_SRC = "/flags/pl-by.png"; // 74×40

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLng = i18n.language.startsWith("by") ? "by" : "pl";

  const handleChange = (lng) => {
    if (lng === currentLng) return;

    i18n.changeLanguage(lng);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANG_STORAGE_KEY, lng);
    }
  };

  return (
    <div
      style={{
        display: "inline-flex",
        border: "1px solid #ccc",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 12,
        userSelect: "none",
      }}
    >
      <button
        type="button"
        aria-label="Polski"
        onClick={() => handleChange("pl")}
        style={{
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: currentLng === "pl" ? "default" : "pointer",
          opacity: currentLng === "pl" ? 1 : 0.35,
        }}
      >
        <div style={{ width: 37, height: 40, overflow: "hidden" }}>
          <img
            src={FLAG_SRC}
            alt="PL / BY"
            style={{
              width: 74,
              height: 40,
              objectFit: "cover",
              transform: "translateX(0)",
              display: "block",
            }}
          />
        </div>
      </button>

      <button
        type="button"
        aria-label="Беларуская"
        onClick={() => handleChange("by")}
        style={{
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: currentLng === "by" ? "default" : "pointer",
          opacity: currentLng === "by" ? 1 : 0.35,
        }}
      >
        <div style={{ width: 37, height: 40, overflow: "hidden" }}>
          <img
            src={FLAG_SRC}
            alt="PL / BY"
            style={{
              width: 74,
              height: 40,
              objectFit: "cover",
              transform: "translateX(-37px)",
              display: "block",
            }}
          />
        </div>
      </button>
    </div>
  );
}

export default React.memo(LanguageSwitcher);
