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
  tileOpacity,
  patternOffsetMmX,
  patternOffsetMmY,
}) {
  if (!imageSize || !pxPerMm) return null;

  const widthPx = tileWidthMm * pxPerMm;
  const heightPx = tileLengthMm * pxPerMm;

  if (widthPx <= 0 || heightPx <= 0 || groutPx < 0) return null;

  const stepX = widthPx + groutPx;
  const stepY = heightPx + groutPx;

  const rowOffsetPx = (rowOffsetMm || 0) * pxPerMm;

  // NEW: глобальный сдвиг паттерна (в пикселях)
  const patternOffsetX = (patternOffsetMmX || 0) * pxPerMm;
  const patternOffsetY = (patternOffsetMmY || 0) * pxPerMm;

  const baseCols = Math.ceil(imageSize.width / stepX);
  const baseRows = Math.ceil(imageSize.height / stepY);

  const diag = Math.sqrt(imageSize.width * imageSize.width + imageSize.height * imageSize.height);

  const extraCols = Math.ceil(diag / stepX) + 4;
  const extraRows = Math.ceil(diag / stepY) + 4;

  const colStart = -extraCols;
  const colEnd = baseCols + extraCols;
  const rowStart = -extraRows;
  const rowEnd = baseRows + extraRows;

  const tileStroke = 1;
  const elements = [];

  const groutStrokeColor = groutColor ?? "red";
  const tileStrokeColor = tileBorderColor ?? "yellow";
  const fillColor = tileFillColor ?? "none";

  for (let row = rowStart; row <= rowEnd; row++) {
    const shiftX = row * rowOffsetPx;

    for (let col = colStart; col <= colEnd; col++) {
      // 🔑 здесь добавляем глобальный сдвиг сетки
      const baseX = col * stepX + shiftX + patternOffsetX;
      const baseY = row * stepY + patternOffsetY;

      elements.push(
        <rect
          key={`tile-${row}-${col}`}
          x={baseX}
          y={baseY}
          width={widthPx}
          height={heightPx}
          fill={fillColor}
          fillOpacity={tileOpacity ?? 1}
          stroke={tileStrokeColor}
          strokeWidth={tileStroke}
        />
      );

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
