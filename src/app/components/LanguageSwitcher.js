"use client";

import React from "react";
import { useTranslation } from "react-i18next";

const FLAG_SRC = "/flags/pl-by.png";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLng = i18n.language.startsWith("by") ? "by" : "pl";

  const handleChange = (lng) => {
    if (lng === currentLng) return;
    i18n.changeLanguage(lng);
  };

  return (
    <div
      style={{
        display: "inline-flex",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 12,
        userSelect: "none",
      }}
    >
      {/* Left half (PL) */}
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
        <div
          style={{
            width: 37,
            height: 40,
            overflow: "hidden",
          }}
        >
          <img
            src={FLAG_SRC}
            alt="PL / BY"
            style={{
              width: 74,
              height: 40,
              objectFit: "cover",
              transform: "translateX(0)", // левая половина
              display: "block",
            }}
          />
        </div>
      </button>

      {/* Right half (BY) */}
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
        <div
          style={{
            width: 37,
            height: 40,
            overflow: "hidden",
          }}
        >
          <img
            src={FLAG_SRC}
            alt="PL / BY"
            style={{
              width: 74,
              height: 40,
              objectFit: "cover",
              transform: "translateX(-37px)", // правая половина
              display: "block",
            }}
          />
        </div>
      </button>
    </div>
  );
}

export default React.memo(LanguageSwitcher);
