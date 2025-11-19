"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PopupGeometryModal from "./PopupGeometryModal";
import LanguageSwitcher from "./LanguageSwitcher";

function Sidebar({
  tileSettings,
  onTileSettingsChange,
  zoom,
  onZoomChange,
  calibration,
  onChangeKnownDistance,
  onStartCalibration,
  pxPerMm,
  onCenterView,
}) {
  const { t } = useTranslation();

  // flag to avoid calling t() during SSR
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Local copy of settings to reduce renders (debounced sync)
  const [localSettings, setLocalSettings] = useState(tileSettings);

  // Modal state for geometry editing
  const [isGeoModalOpen, setGeoModalOpen] = useState(false);

  // Sync local state when parent tileSettings change (e.g. after loading from storage)
  useEffect(() => {
    setLocalSettings(tileSettings);
  }, [tileSettings]);

  // Debounced propagation of changes to parent state (700ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSettings === tileSettings) return; // skip redundant sync
      onTileSettingsChange(localSettings);
    }, 700);

    return () => clearTimeout(timer);
  }, [localSettings, tileSettings, onTileSettingsChange]);

  // Helper: update a single field in local state
  const update = (field, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // helpers to render translated / fallback text
  const txtTileGeometry = isClient ? t("tile_geometry") : "Геометрия плитки";
  const txtChangeGeometry = isClient ? t("change_geometry") : "Изменить геометрию…";
  const txtCurrentDimensions = isClient ? t("current_dimensions") : "Текущие размеры";
  const txtGroutMm = isClient ? t("grout_mm") : "Шов (мм)";
  const txtRowOffset = isClient ? t("row_offset_mm") : "Сдвиг ряда (мм)";
  const txtHerringbone = isClient ? t("herringbone") : "Укладка ёлочкой";

  // новые ключи для остальных текстов
  const txtColors = isClient ? t("colors") : "Цвета";
  const txtTileColor = isClient ? t("tile_color") : "Цвет плитки";
  const txtOpacity = isClient ? t("opacity") : "Прозрачность";
  const txtBorderColor = isClient ? t("border_color") : "Цвет границы";
  const txtGroutColor = isClient ? t("grout_color") : "Цвет шва";
  const txtShowBorder = isClient ? t("show_tile_border") : "Показывать границы плитки";
  const txtOnlyZero = isClient ? t("only_with_zero_grout") : "(доступно только при шве 0 мм)";

  const txtOffsetAndRotation = isClient ? t("offset_and_rotation") : "Смещение и поворот";
  const txtOffsetX = isClient ? t("offset_x") : "Смещение X (мм)";
  const txtOffsetY = isClient ? t("offset_y") : "Смещение Y (мм)";
  const txtRotationDeg = isClient ? t("rotation_deg") : "Поворот (°)";
  const txtOffsetHint = isClient ? t("offset_hint") : "Положительное X — вправо, положительное Y — вниз.";

  const txtZoom = isClient ? t("zoom") : "Масштаб (Zoom)";
  const txtCenter = isClient ? t("center") : "Центрировать";

  const txtCalibration = isClient ? t("calibration") : "Калибровка";
  const txtKnownDistance = isClient ? t("known_distance_mm") : "Известное расстояние (мм)";
  const txtStartCalibration = isClient ? t("start_calibration") : "Начать калибровку";
  const txtClickTwoPoints = isClient ? t("click_two_points") : "Кликните по двум точкам на плане...";
  const txtCurrentScale = isClient ? t("current_scale") : "Текущий масштаб";
  const txtNotCalibrated = isClient ? t("not_calibrated") : "не откалиброван";

  return (
    <>
      {/* Geometry popup */}
      <PopupGeometryModal
        open={isGeoModalOpen}
        onClose={() => setGeoModalOpen(false)}
        initialValues={{
          tileWidthMm: localSettings.tileWidthMm,
          tileLengthMm: localSettings.tileLengthMm,
          groutMm: localSettings.groutMm,
        }}
        onSave={(newValues) => {
          // Batch update for performance
          setLocalSettings((prev) => ({
            ...prev,
            ...newValues,
          }));
        }}
      />
      <LanguageSwitcher />
      {/* ============================= */}
      {/*      TILE GEOMETRY (POPUP)    */}
      {/* ============================= */}
      <section>
        <h3>{txtTileGeometry}</h3>

        <button onClick={() => setGeoModalOpen(true)}>{txtChangeGeometry}</button>

        <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
          {txtCurrentDimensions}: {localSettings.tileWidthMm} × {localSettings.tileLengthMm} мм, {txtGroutMm} {localSettings.groutMm}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          <label>
            {txtRowOffset}:{" "}
            <input
              type="number"
              value={localSettings.rowOffsetMm ?? ""}
              onChange={(e) => update("rowOffsetMm", e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </label>

          <label style={{ marginTop: 8 }}>
            <input
              type="checkbox"
              checked={localSettings.pattern === "herringbone"}
              onChange={(e) => update("pattern", e.target.checked ? "herringbone" : "grid")}
            />{" "}
            {txtHerringbone} (herringbone)
          </label>
        </div>
      </section>

      {/* ============================= */}
      {/*            COLORS             */}
      {/* ============================= */}
      <section>
        <h3>{txtColors}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label>
            {txtTileColor}:{" "}
            <input type="color" value={localSettings.tileFillColor} onChange={(e) => update("tileFillColor", e.target.value)} />
          </label>

          <label>
            {txtOpacity}:{" "}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={localSettings.tileOpacity ?? 1}
              onChange={(e) => update("tileOpacity", Number(e.target.value))}
            />{" "}
            {Math.round((localSettings.tileOpacity ?? 1) * 100)}%
          </label>

          <label>
            {txtBorderColor}:{" "}
            <input type="color" value={localSettings.tileBorderColor} onChange={(e) => update("tileBorderColor", e.target.value)} />
          </label>

          <label>
            {txtGroutColor}: <input type="color" value={localSettings.groutColor} onChange={(e) => update("groutColor", e.target.value)} />
          </label>

          {(() => {
            const groutValue = localSettings.groutMm ?? 0;
            const canToggleBorder = groutValue <= 0;
            const effectiveShowTileBorder = canToggleBorder ? localSettings.showTileBorder : false;

            return (
              <label style={{ marginTop: 8, opacity: canToggleBorder ? 1 : 0.5 }}>
                <input
                  type="checkbox"
                  checked={effectiveShowTileBorder}
                  disabled={!canToggleBorder}
                  onChange={(e) => {
                    if (!canToggleBorder) return;
                    update("showTileBorder", e.target.checked);
                  }}
                />{" "}
                {txtShowBorder}
                {!canToggleBorder && <span style={{ marginLeft: 4, fontSize: 11, color: "#888" }}>{txtOnlyZero}</span>}
              </label>
            );
          })()}
        </div>
      </section>

      {/* ============================= */}
      {/*         OFFSET & ROTATION     */}
      {/* ============================= */}
      <section>
        <h3>{txtOffsetAndRotation}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label>
            {txtOffsetX}:{" "}
            <input
              type="number"
              value={localSettings.patternOffsetMmX ?? 0}
              onChange={(e) => update("patternOffsetMmX", e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </label>

          <label>
            {txtOffsetY}:{" "}
            <input
              type="number"
              value={localSettings.patternOffsetMmY ?? 0}
              onChange={(e) => update("patternOffsetMmY", e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </label>

          <label>
            {txtRotationDeg}:{" "}
            <input type="number" value={localSettings.rotationDeg} onChange={(e) => update("rotationDeg", Number(e.target.value) || 0)} />
          </label>

          <small style={{ color: "#666" }}>{txtOffsetHint}</small>
        </div>
      </section>

      {/* ============================= */}
      {/*             ZOOM              */}
      {/* ============================= */}
      <section>
        <h3>{txtZoom}</h3>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="range" min={0.25} max={10} step={0.05} value={zoom} onChange={(e) => onZoomChange(Number(e.target.value))} />

          <span>{Math.round(zoom * 100)}%</span>

          <button
            onClick={onCenterView}
            style={{
              padding: "4px 8px",
              fontSize: 12,
              cursor: "pointer",
              border: "1px solid #ccc",
              borderRadius: 4,
              background: "#f2f2f2",
            }}
          >
            {txtCenter}
          </button>
        </div>
      </section>

      {/* ============================= */}
      {/*         CALIBRATION          */}
      {/* ============================= */}
      <section>
        <h3>{txtCalibration}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label>
            {txtKnownDistance}:{" "}
            <input type="number" value={calibration.knownDistanceMm} onChange={(e) => onChangeKnownDistance(Number(e.target.value) || 0)} />
          </label>

          <button onClick={onStartCalibration}>{calibration.isCalibrating ? txtClickTwoPoints : txtStartCalibration}</button>

          <div style={{ marginTop: 4, fontSize: 12 }}>
            {txtCurrentScale}: {pxPerMm ? `${pxPerMm.toFixed(3)} px / мм` : txtNotCalibrated}
          </div>
        </div>
      </section>
    </>
  );
}

export default React.memo(Sidebar);
