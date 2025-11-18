import React from "react";

export function renderHerringboneLines({ imageSize, pxPerMm, tileWidthMm, groutPx, groutColor, patternOffsetMmX, patternOffsetMmY }) {
  if (!imageSize || !pxPerMm) return null;

  const widthPx = tileWidthMm * pxPerMm;
  const spacing = widthPx / Math.SQRT2;
  if (!Number.isFinite(spacing) || spacing <= 0) return null;

  const offsetX = (patternOffsetMmX || 0) * pxPerMm;
  const offsetY = (patternOffsetMmY || 0) * pxPerMm;

  const lines = [];
  const margin = Math.max(imageSize.width, imageSize.height) * 2;

  // 🔹 визуальная толщина шва (минимум 1 px)
  const groutStrokeWidth = Math.max(groutPx, 1);

  for (let x = -margin; x <= imageSize.width + margin; x += spacing) {
    const xPos = x + offsetX;

    lines.push(
      <line
        key={`hb-line-${x.toFixed(2)}`}
        x1={xPos}
        y1={-margin + offsetY}
        x2={xPos}
        y2={imageSize.height + margin + offsetY}
        stroke={groutColor ?? "red"}
        strokeWidth={groutStrokeWidth}
        opacity={0.5}
      />
    );
  }

  return lines;
}
