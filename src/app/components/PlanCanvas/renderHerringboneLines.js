import React from "react";

export function renderHerringboneLines({
  imageSize,
  pxPerMm,
  tileWidthMm,
  tileLengthMm,
  groutPx,
  tileFillColor,
  tileBorderColor,
  tileOpacity,
  patternOffsetMmX,
  patternOffsetMmY,
  showTileBorder, // NEW: controls border visibility
}) {
  if (!imageSize || !pxPerMm) return null;

  const widthPx = tileWidthMm * pxPerMm;
  const lengthPx = tileLengthMm * pxPerMm;

  if (!Number.isFinite(widthPx) || !Number.isFinite(lengthPx) || widthPx <= 0 || lengthPx <= 0) {
    return null;
  }

  // ----------------------------------------------------
  // Distance between guiding lines:
  //   projected tile width + projected grout width
  //   BUT grout projected is groutPx * sqrt(2)
  // ----------------------------------------------------
  const lineSpacingX = widthPx / Math.SQRT2 + groutPx / Math.SQRT2;
  if (!Number.isFinite(lineSpacingX) || lineSpacingX <= 0) return null;

  // ----------------------------------------------------
  // Distance between tile centers along a single line:
  // (tile length + grout width) * sqrt(2)
  // ----------------------------------------------------
  const centerStepY = (lengthPx + groutPx) * Math.SQRT2;
  if (!Number.isFinite(centerStepY) || centerStepY <= 0) return null;

  const offsetX = (patternOffsetMmX || 0) * pxPerMm;
  const offsetY = (patternOffsetMmY || 0) * pxPerMm;

  const margin = Math.max(imageSize.width, imageSize.height) * 2;

  // Always 1 px for visibility
  const groutStrokeWidth = 1;
  const groutStrokeColor = "red";

  const tileStrokeColor = tileBorderColor ?? "yellow";
  const fillColor = tileFillColor ?? "none";
  const tileStrokeWidth = 0.6;

  const tiles = [];
  const lines = [];

  let lineIndex = 0;

  for (let x = -margin; x <= imageSize.width + margin; x += lineSpacingX) {
    const xPos = x + offsetX;

    // Guiding red line
    lines.push(
      <line
        key={`hb-line-${lineIndex}`}
        x1={xPos}
        y1={-margin + offsetY}
        x2={xPos}
        y2={imageSize.height + margin + offsetY}
        stroke={groutStrokeColor}
        strokeWidth={groutStrokeWidth}
        opacity={0.8}
      />
    );

    const isOddLine = lineIndex % 2 === 1;
    const tileAngle = isOddLine ? 45 : 135;

    // Even lines have half-step Y phase shift
    const phaseY = isOddLine ? 0 : -centerStepY / 2;

    let tileIndex = 0;

    // Tile centers along this guiding line
    for (let y = -margin; y <= imageSize.height + margin; y += centerStepY) {
      const cy = y + offsetY + phaseY;
      const cx = xPos;

      const tileX = cx - widthPx / 2;
      const tileY = cy - lengthPx / 2;

      tiles.push(
        <rect
          key={`hb-tile-${lineIndex}-${tileIndex}`}
          x={tileX}
          y={tileY}
          width={widthPx}
          height={lengthPx}
          fill={fillColor}
          fillOpacity={tileOpacity ?? 1}
          stroke={showTileBorder ? tileStrokeColor : "transparent"}
          strokeWidth={showTileBorder ? tileStrokeWidth : 0}
          transform={`rotate(${tileAngle}, ${cx}, ${cy})`}
        />
      );

      tileIndex += 1;
    }

    lineIndex += 1;
  }

  return [...tiles, ...lines];
}
