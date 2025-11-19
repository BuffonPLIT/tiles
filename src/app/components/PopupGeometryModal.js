"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function PopupGeometryModal({
  open,
  onClose,
  initialValues, // { tileWidthMm, tileLengthMm, groutMm }
  onSave,
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setValues(initialValues);
  }, [open, initialValues]);

  const update = (field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px 24px",
          borderRadius: 12,
          width: 350,
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h3 style={{ margin: 0 }}>{t("tile_geometry")}</h3>

        <label>
          {t("tile_width_mm")}:{" "}
          <input type="number" value={values.tileWidthMm} onChange={(e) => update("tileWidthMm", Number(e.target.value) || 0)} />
        </label>

        <label>
          {t("tile_length_mm")}:{" "}
          <input type="number" value={values.tileLengthMm} onChange={(e) => update("tileLengthMm", Number(e.target.value) || 0)} />
        </label>

        <label>
          {t("grout_mm")}: <input type="number" value={values.groutMm} onChange={(e) => update("groutMm", Number(e.target.value) || 0)} />
        </label>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            style={{ flex: 1, padding: "8px 0" }}
            onClick={() => {
              onSave(values);
              onClose();
            }}
          >
            {t("save")}
          </button>

          <button style={{ flex: 1, padding: "8px 0" }} onClick={onClose}>
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
