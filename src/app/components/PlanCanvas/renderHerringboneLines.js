import React from "react";

export function renderHerringboneLines({ imageSize, pxPerMm, tileWidthMm, groutPx, strokeWidth }) {
  if (!imageSize || !pxPerMm) return null;

  const widthPx = tileWidthMm * pxPerMm;
  const spacing = widthPx / Math.SQRT2;

  if (!Number.isFinite(spacing) || spacing <= 0) {
    return null;
  }

  const lines = [];
  const margin = Math.max(imageSize.width, imageSize.height) * 2;

  for (let x = -margin; x <= imageSize.width + margin; x += spacing) {
    lines.push(
      <line
        key={`hb-line-${x.toFixed(2)}`}
        x1={x}
        y1={-margin}
        x2={x}
        y2={imageSize.height + margin}
        stroke="red"
        strokeWidth={strokeWidth}
        opacity={0.5}
      />
    );
  }

  return lines;
}
