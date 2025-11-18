"use client";

import React, { useState, useEffect } from "react";
import PopupGeometryModal from "./PopupGeometryModal";

function Sidebar({
  tileSettings,
  onTileSettingsChange,
  zoom,
  onZoomChange,
  calibration,
  onChangeKnownDistance,
  onStartCalibration,
  pxPerMm,
  stats,
}) {
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

      {/* ============================= */}
      {/*      TILE GEOMETRY (POPUP)    */}
      {/* ============================= */}
      <section>
        <h3>Геометрия плитки</h3>

        <button onClick={() => setGeoModalOpen(true)}>Изменить геометрию…</button>

        <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
          Текущие размеры: {localSettings.tileWidthMm} × {localSettings.tileLengthMm} мм, шов {localSettings.groutMm} мм
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          <label>
            Сдвиг ряда (мм):{" "}
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
            Укладка ёлочкой (herringbone)
          </label>
        </div>
      </section>

      {/* ============================= */}
      {/*            COLORS             */}
      {/* ============================= */}
      <section>
        <h3>Цвета</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label>
            Цвет плитки:{" "}
            <input type="color" value={localSettings.tileFillColor} onChange={(e) => update("tileFillColor", e.target.value)} />
          </label>

          <label>
            Прозрачность:{" "}
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
            Цвет границы:{" "}
            <input type="color" value={localSettings.tileBorderColor} onChange={(e) => update("tileBorderColor", e.target.value)} />
          </label>

          <label>
            Цвет шва: <input type="color" value={localSettings.groutColor} onChange={(e) => update("groutColor", e.target.value)} />
          </label>
        </div>
      </section>

      {/* ============================= */}
      {/*         OFFSET & ROTATION     */}
      {/* ============================= */}
      <section>
        <h3>Смещение и поворот</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label>
            Смещение X (мм):{" "}
            <input
              type="number"
              value={localSettings.patternOffsetMmX ?? 0}
              onChange={(e) => update("patternOffsetMmX", e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </label>

          <label>
            Смещение Y (мм):{" "}
            <input
              type="number"
              value={localSettings.patternOffsetMmY ?? 0}
              onChange={(e) => update("patternOffsetMmY", e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </label>

          <label>
            Поворот (°):{" "}
            <input type="number" value={localSettings.rotationDeg} onChange={(e) => update("rotationDeg", Number(e.target.value) || 0)} />
          </label>

          <small style={{ color: "#666" }}>Положительное X — вправо, положительное Y — вниз.</small>
        </div>
      </section>

      {/* ============================= */}
      {/*             ZOOM              */}
      {/* ============================= */}
      <section>
        <h3>Масштаб</h3>
        <div>
          <input type="range" min={0.25} max={10} step={0.05} value={zoom} onChange={(e) => onZoomChange(Number(e.target.value))} />
          <span style={{ marginLeft: 8 }}>{Math.round(zoom * 100)}%</span>
        </div>
      </section>

      {/* ============================= */}
      {/*         CALIBRATION          */}
      {/* ============================= */}
      <section>
        <h3>Калибровка</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label>
            Известное расстояние (мм):{" "}
            <input type="number" value={calibration.knownDistanceMm} onChange={(e) => onChangeKnownDistance(Number(e.target.value) || 0)} />
          </label>

          <button onClick={onStartCalibration}>
            {calibration.isCalibrating ? "Кликните по двум точкам на плане..." : "Начать калибровку"}
          </button>

          <div style={{ marginTop: 4, fontSize: 12 }}>Текущий масштаб: {pxPerMm ? `${pxPerMm.toFixed(3)} px / мм` : "не откалиброван"}</div>
        </div>
      </section>
    </>
  );
}

export default React.memo(Sidebar);
