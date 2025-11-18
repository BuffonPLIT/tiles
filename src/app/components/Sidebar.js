import React, { useState, useEffect } from "react";

function Sidebar({
  tileSettings,
  onTileSettingsChange,
  zoom,
  onZoomChange,
  calibration,
  onChangeKnownDistance,
  onStartCalibration,
  pxPerMm,
  stats, // currently unused, but passed from parent
}) {
  // Local copy of tile settings for debounced updates
  const [localSettings, setLocalSettings] = useState(tileSettings);

  // Sync local state when parent tileSettings change (e.g. after localStorage load)
  useEffect(() => {
    setLocalSettings(tileSettings);
  }, [tileSettings]);

  // Debounce: apply changes to parent after 700ms of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      // avoid redundant update when local state just mirrors props
      if (localSettings === tileSettings) return;
      onTileSettingsChange(localSettings);
    }, 700);

    return () => clearTimeout(timer);
  }, [localSettings, tileSettings, onTileSettingsChange]);

  // Update helper
  const update = (field, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <section>
        <h3>Параметры плитки</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label>
            Длина плитки (мм):{" "}
            <input
              type="number"
              value={localSettings.tileWidthMm ?? ""}
              onChange={(e) => update("tileWidthMm", e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </label>

          <label>
            Ширина плитки (мм):{" "}
            <input
              type="number"
              value={localSettings.tileLengthMm ?? ""}
              onChange={(e) => update("tileLengthMm", e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </label>

          <label>
            Толщина шва (мм):{" "}
            <input
              type="number"
              value={localSettings.groutMm ?? ""}
              onChange={(e) => update("groutMm", e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </label>

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

      <section>
        <h3>Цвета</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label>
            Цвет плитки:{" "}
            <input type="color" value={localSettings.tileFillColor} onChange={(e) => update("tileFillColor", e.target.value)} />
          </label>

          <label>
            Прозрачность плитки:{" "}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={localSettings.tileOpacity ?? 1}
              onChange={(e) => update("tileOpacity", Number(e.target.value))}
            />
            {Math.round((localSettings.tileOpacity ?? 1) * 100)}%
          </label>

          <label>
            Цвет границы плитки:{" "}
            <input type="color" value={localSettings.tileBorderColor} onChange={(e) => update("tileBorderColor", e.target.value)} />
          </label>

          <label>
            Цвет шва: <input type="color" value={localSettings.groutColor} onChange={(e) => update("groutColor", e.target.value)} />
          </label>
        </div>
      </section>

      <section>
        <h3>Смещение сетки</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label>
            Смещение по X (мм):{" "}
            <input
              type="number"
              value={localSettings.patternOffsetMmX ?? 0}
              onChange={(e) => update("patternOffsetMmX", e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </label>

          <label>
            Смещение по Y (мм):{" "}
            <input
              type="number"
              value={localSettings.patternOffsetMmY ?? 0}
              onChange={(e) => update("patternOffsetMmY", e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </label>

          <small style={{ color: "#666" }}>Положительное X — вправо, положительное Y — вниз.</small>
        </div>
      </section>

      <section>
        <h3>Поворот сетки</h3>
        <label>
          Угол (°):{" "}
          <input type="number" value={localSettings.rotationDeg} onChange={(e) => update("rotationDeg", Number(e.target.value) || 0)} />
        </label>
      </section>

      <section>
        <h3>Масштаб (Zoom)</h3>
        <div>
          <input type="range" min={0.25} max={10} step={0.05} value={zoom} onChange={(e) => onZoomChange(Number(e.target.value))} />
          <span style={{ marginLeft: 8 }}>{Math.round(zoom * 100)}%</span>
        </div>
      </section>

      <section>
        <h3>Калибровка масштаба</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label>
            Известное расстояние (мм):{" "}
            <input type="number" value={calibration.knownDistanceMm} onChange={(e) => onChangeKnownDistance(Number(e.target.value) || 0)} />
          </label>

          <button onClick={onStartCalibration}>
            {calibration.isCalibrating ? "Кликните по двум точкам на плане..." : "Начать калибровку"}
          </button>
        </div>

        <div style={{ marginTop: 4, fontSize: 12 }}>Текущий масштаб: {pxPerMm ? `${pxPerMm.toFixed(3)} px / мм` : "не откалиброван"}</div>
      </section>
    </>
  );
}

export default React.memo(Sidebar);
