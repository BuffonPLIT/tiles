import React from "react";

export function renderGrid({
  imageSize,
  pxPerMm,
  tileWidthMm,
  tileLengthMm,
  groutPx,
  tileFillColor,
  tileBorderColor,
  groutColor,
  rowOffsetMm,
}) {
  if (!imageSize || !pxPerMm) return null;

  // ВАЖНО: используем размеры как есть, НЕ min/max
  const widthPx = tileWidthMm * pxPerMm; // ширина плитки по X
  const heightPx = tileLengthMm * pxPerMm; // длина плитки по Y

  if (widthPx <= 0 || heightPx <= 0 || groutPx < 0) return null;

  // Шов = расстояние между плитками
  const stepX = widthPx + groutPx;
  const stepY = heightPx + groutPx;

  // Сдвиг ряда в пикселях
  const rowOffsetPx = (rowOffsetMm || 0) * pxPerMm;

  const cols = Math.ceil(imageSize.width / stepX) + 4;
  const rows = Math.ceil(imageSize.height / stepY) + 4;

  const tileStroke = 1; // визуальная толщина границы плитки
  const elements = [];

  const groutStrokeColor = groutColor ?? "red";
  const tileStrokeColor = tileBorderColor ?? "yellow";
  const fillColor = tileFillColor ?? "none";

  for (let row = -2; row < rows; row++) {
    // сдвиг этого ряда по X
    const shiftX = row * rowOffsetPx;

    for (let col = -2; col < cols; col++) {
      const baseX = col * stepX + shiftX;
      const baseY = row * stepY;

      // ---- Плитка ----
      elements.push(
        <rect
          key={`tile-${row}-${col}`}
          x={baseX}
          y={baseY}
          width={widthPx}
          height={heightPx}
          fill={fillColor}
          stroke={tileStrokeColor}
          strokeWidth={tileStroke} // это не шов, просто контур
          opacity={0.9}
        />
      );

      // ---- Швы (красные сегменты по правому и нижнему краю плитки) ----

      // вертикальный шов справа
      const vX = baseX + widthPx + groutPx / 2;
      const vY1 = baseY;
      const vY2 = baseY + heightPx;

      elements.push(
        <line
          key={`joint-v-${row}-${col}`}
          x1={vX}
          y1={vY1}
          x2={vX}
          y2={vY2}
          stroke={groutStrokeColor}
          strokeWidth={groutPx}
          opacity={0.7}
        />
      );

      // горизонтальный шов снизу
      const hY = baseY + heightPx + groutPx / 2;
      const hX1 = baseX;
      const hX2 = baseX + widthPx;

      elements.push(
        <line
          key={`joint-h-${row}-${col}`}
          x1={hX1}
          y1={hY}
          x2={hX2}
          y2={hY}
          stroke={groutStrokeColor}
          strokeWidth={groutPx}
          opacity={0.7}
        />
      );
    }
  }

  return elements;
}
