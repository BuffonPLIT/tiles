import React from "react";

export function renderGrid({ imageSize, pxPerMm, tileWidthMm, tileLengthMm, groutPx, strokeWidth }) {
  if (!imageSize || !pxPerMm) return null;

  const shortPx = Math.min(tileWidthMm, tileLengthMm) * pxPerMm;
  const longPx = Math.max(tileWidthMm, tileLengthMm) * pxPerMm;

  if (shortPx <= 0 || longPx <= 0) return null;

  const stepX = shortPx + groutPx;
  const stepY = longPx + groutPx;

  const cols = Math.ceil(imageSize.width / stepX) + 2;
  const rows = Math.ceil(imageSize.height / stepY) + 2;

  const rects = [];

  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const x = col * stepX + groutPx / 2;
      const y = row * stepY + groutPx / 2;

      rects.push(
        <rect
          key={`grid-${row}-${col}`}
          x={x}
          y={y}
          width={shortPx}
          height={longPx}
          fill="none"
          stroke="red"
          strokeWidth={strokeWidth}
          opacity={0.5}
        />
      );
    }
  }

  return rects;
}
