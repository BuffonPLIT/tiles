"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [current, setCurrent] = useState("pl");

  // Load saved language on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem("app_lang");
    if (saved === "pl" || saved === "by") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrent(saved);
      i18n.changeLanguage(saved);
    }
  }, [i18n]);

  const handleChange = (lng) => {
    setCurrent(lng);
    i18n.changeLanguage(lng);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("app_lang", lng);
    }
  };

  const baseBtn = {
    padding: "2px 8px",
    fontSize: 12,
    borderRadius: 4,
    cursor: "pointer",
    background: "#f5f5f5",

    // no shorthand!
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ccc",
    color: "#000",
  };

  const activeBtn = {
    ...baseBtn,
    background: "#333",
    color: "#fff",

    // atomic border change
    borderColor: "#333",
  };

  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginBottom: 8 }}>
      <button type="button" onClick={() => handleChange("pl")} style={current === "pl" ? activeBtn : baseBtn}>
        PL
      </button>

      <button type="button" onClick={() => handleChange("by")} style={current === "by" ? activeBtn : baseBtn}>
        BY
      </button>
    </div>
  );
}

export default LanguageSwitcher;
