import React from "react";

export function renderGrid({ imageSize, pxPerMm, tileWidthMm, tileLengthMm, groutPx, tileFillColor, tileBorderColor, groutColor }) {
  if (!imageSize || !pxPerMm) return null;

  // short = меньшая сторона, long = большая
  const shortPx = Math.min(tileWidthMm, tileLengthMm) * pxPerMm;
  const longPx = Math.max(tileWidthMm, tileLengthMm) * pxPerMm;

  if (shortPx <= 0 || longPx <= 0 || groutPx < 0) return null;

  // Шов = расстояние между плитками
  const stepX = shortPx + groutPx;
  const stepY = longPx + groutPx;

  const cols = Math.ceil(imageSize.width / stepX) + 2;
  const rows = Math.ceil(imageSize.height / stepY) + 2;

  const tileStroke = 1; // визуальная толщина границы плитки
  const margin = Math.max(imageSize.width, imageSize.height);

  const elements = [];

  // 1) Плитки: заливка + граница
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const x = col * stepX;
      const y = row * stepY;

      elements.push(
        <rect
          key={`tile-${row}-${col}`}
          x={x}
          y={y}
          width={shortPx}
          height={longPx}
          fill={tileFillColor ?? "none"} // цвет плитки
          stroke={tileBorderColor ?? "yellow"} // граница плитки
          strokeWidth={tileStroke} // не шов, просто обводка
          opacity={0.9}
        />
      );
    }
  }

  // 2) Швы: красные (или заданные) линии по центру зазоров

  // Вертикальные швы между колонками
  for (let col = -1; col <= cols; col++) {
    const tileX = col * stepX;
    const jointX = tileX + shortPx + groutPx / 2; // центр шва по X

    elements.push(
      <line
        key={`v-joint-${col}`}
        x1={jointX}
        y1={-margin}
        x2={jointX}
        y2={imageSize.height + margin}
        stroke={groutColor ?? "red"} // цвет шва
        strokeWidth={groutPx} // толщина шва
        opacity={0.7}
      />
    );
  }

  // Горизонтальные швы между рядами
  for (let row = -1; row <= rows; row++) {
    const tileY = row * stepY;
    const jointY = tileY + longPx + groutPx / 2; // центр шва по Y

    elements.push(
      <line
        key={`h-joint-${row}`}
        x1={-margin}
        y1={jointY}
        x2={imageSize.width + margin}
        y2={jointY}
        stroke={groutColor ?? "red"}
        strokeWidth={groutPx}
        opacity={0.7}
      />
    );
  }

  return elements;
}
