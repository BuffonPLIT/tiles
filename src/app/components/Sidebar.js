import React from "react";

export default function Sidebar({
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
  const handleChangeNumber = (updater) => (e) => {
    const value = Number(e.target.value);
    updater(Number.isFinite(value) ? value : 0);
  };

  return (
    <>
      <section>
        <h3>Параметры плитки</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* уже существующие поля */}
          <label>
            Ширина плитки (мм):{" "}
            <input
              type="number"
              value={tileSettings.tileWidthMm ?? ""}
              onChange={(e) =>
                onTileSettingsChange({
                  ...tileSettings,
                  tileWidthMm: e.target.value === "" ? 0 : Number(e.target.value),
                })
              }
            />
          </label>
          <label>
            Длина плитки (мм):{" "}
            <input
              type="number"
              value={tileSettings.tileLengthMm ?? ""}
              onChange={(e) =>
                onTileSettingsChange({
                  ...tileSettings,
                  tileLengthMm: e.target.value === "" ? 0 : Number(e.target.value),
                })
              }
            />
          </label>
          <label>
            Толщина шва (мм):{" "}
            <input
              type="number"
              value={tileSettings.groutMm ?? ""}
              onChange={(e) =>
                onTileSettingsChange({
                  ...tileSettings,
                  groutMm: e.target.value === "" ? 0 : Number(e.target.value),
                })
              }
            />
          </label>

          {/* NEW: сдвиг ряда */}
          <label>
            Сдвиг ряда (мм):{" "}
            <input
              type="number"
              value={tileSettings.rowOffsetMm ?? ""}
              onChange={(e) =>
                onTileSettingsChange({
                  ...tileSettings,
                  rowOffsetMm: e.target.value === "" ? 0 : Number(e.target.value),
                })
              }
            />
          </label>

          <label style={{ marginTop: 8 }}>
            <input
              type="checkbox"
              checked={tileSettings.pattern === "herringbone"}
              onChange={(e) =>
                onTileSettingsChange({
                  ...tileSettings,
                  pattern: e.target.checked ? "herringbone" : "grid",
                })
              }
            />{" "}
            Укладка ёлочкой (herringbone)
          </label>
        </div>
      </section>

      {/* NEW: цвета */}
      <section>
        <h3>Цвета</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label>
            Цвет плитки:{" "}
            <input
              type="color"
              value={tileSettings.tileFillColor}
              onChange={(e) =>
                onTileSettingsChange({
                  ...tileSettings,
                  tileFillColor: e.target.value,
                })
              }
            />
          </label>
          <label>
            Цвет границы плитки:{" "}
            <input
              type="color"
              value={tileSettings.tileBorderColor}
              onChange={(e) =>
                onTileSettingsChange({
                  ...tileSettings,
                  tileBorderColor: e.target.value,
                })
              }
            />
          </label>
          <label>
            Цвет шва:{" "}
            <input
              type="color"
              value={tileSettings.groutColor}
              onChange={(e) =>
                onTileSettingsChange({
                  ...tileSettings,
                  groutColor: e.target.value,
                })
              }
            />
          </label>
        </div>
      </section>

      <section>
        <h3>Поворот сетки</h3>
        <label>
          Угол (°):{" "}
          <input
            type="number"
            value={tileSettings.rotationDeg}
            onChange={(e) =>
              onTileSettingsChange({
                ...tileSettings,
                rotationDeg: Number(e.target.value) || 0,
              })
            }
          />
        </label>
      </section>

      <section>
        <h3>Масштаб (Zoom)</h3>
        <div>
          <input type="range" min={0.25} max={3} step={0.05} value={zoom} onChange={(e) => onZoomChange(Number(e.target.value))} />
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
          <small>
            1. Введите реальное расстояние (мм), например между стенами. <br />
            2. Нажмите «Начать калибровку». <br />
            3. Кликните по двум точкам на плане.
          </small>
          <div style={{ marginTop: 4, fontSize: 12 }}>Текущий масштаб: {pxPerMm ? `${pxPerMm.toFixed(3)} px / мм` : "не откалиброван"}</div>
        </div>
      </section>

      <section>
        <h3>Расход плитки (приблизительно)</h3>
        {stats ? (
          <div style={{ fontSize: 14 }}>
            <div>
              Площадь плана: {stats.areaM2.toFixed(2)} м<sup>2</sup>
            </div>
            <div>
              Площадь 1 плитки: {stats.tileAreaM2.toFixed(3)} м<sup>2</sup>
            </div>
            <div>Теоретическое количество плиток: {stats.rawCount.toFixed(1)}</div>
            <div>Округлённо (цельные): {stats.fullTiles} шт.</div>
            <div>С запасом (~10%): {stats.reserveTiles} шт.</div>
          </div>
        ) : (
          <p style={{ fontSize: 13 }}>Для расчёта нужно: загрузить план и выполнить калибровку масштаба.</p>
        )}
      </section>
    </>
  );
}
