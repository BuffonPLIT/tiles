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
  showTileBorder, // controls tile border visibility
}) {
  if (!imageSize || !pxPerMm) return null;

  const widthPx = tileWidthMm * pxPerMm;
  const heightPx = tileLengthMm * pxPerMm;

  if (!Number.isFinite(widthPx) || !Number.isFinite(heightPx) || widthPx <= 0 || heightPx <= 0 || groutPx < 0) {
    return null;
  }

  // -------------------------------------------------------
  // Grout handling
  // -------------------------------------------------------
  const hasGrout = groutPx > 0;

  // geometric gap between tiles
  const groutGapPx = hasGrout ? groutPx : 0;

  // visible grout line thickness (0 if grout disabled)
  const groutStrokeWidth = hasGrout ? Math.max(groutPx, 1) : 0;

  // -------------------------------------------------------
  // Grid geometry
  // -------------------------------------------------------
  const stepX = widthPx + groutGapPx;
  const stepY = heightPx + groutGapPx;

  // helper: correct modulo for negative values
  const mod = (value, period) => {
    if (!Number.isFinite(period) || period === 0) return 0;
    const r = value % period;
    return r < 0 ? r + period : r;
  };

  // raw per-row offset in px
  const rawRowOffsetPx = (rowOffsetMm || 0) * pxPerMm;

  const patternOffsetX = (patternOffsetMmX || 0) * pxPerMm;
  const patternOffsetY = (patternOffsetMmY || 0) * pxPerMm;

  const baseCols = Math.ceil(imageSize.width / stepX);
  const baseRows = Math.ceil(imageSize.height / stepY);

  const diag = Math.sqrt(imageSize.width ** 2 + imageSize.height ** 2);

  const extraCols = Math.ceil(diag / stepX) + 4;
  const extraRows = Math.ceil(diag / stepY) + 4;

  const colStart = -extraCols;
  const colEnd = baseCols + extraCols;
  const rowStart = -extraRows;
  const rowEnd = baseRows + extraRows;

  // -------------------------------------------------------
  // Styling
  // -------------------------------------------------------
  const tileStrokeWidth = showTileBorder ? 0.6 : 0;
  const tileStroke = showTileBorder ? tileBorderColor ?? "yellow" : "transparent";
  const fillColor = tileFillColor ?? "none";
  const groutStrokeColor = groutColor ?? "red";

  const elements = [];

  // -------------------------------------------------------
  // Rendering tiles and grout lines
  // -------------------------------------------------------
  for (let row = rowStart; row <= rowEnd; row++) {
    // ✅ key idea:
    // effective shift for row N:
    //   shiftX = (N * rawRowOffsetPx) mod stepX
    const shiftX = mod(row * rawRowOffsetPx, stepX);

    for (let col = colStart; col <= colEnd; col++) {
      const baseX = col * stepX + shiftX + patternOffsetX;
      const baseY = row * stepY + patternOffsetY;

      // --- Tile rect ---
      elements.push(
        <rect
          key={`tile-${row}-${col}`}
          x={baseX}
          y={baseY}
          width={widthPx}
          height={heightPx}
          fill={fillColor}
          fillOpacity={tileOpacity ?? 1}
          stroke={tileStroke}
          strokeWidth={tileStrokeWidth}
        />
      );

      // --- Grout joints ---
      if (hasGrout) {
        const vX = baseX + widthPx + groutGapPx / 2;
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
            strokeWidth={groutStrokeWidth}
            opacity={0.7}
          />
        );

        const hY = baseY + heightPx + groutGapPx / 2;
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
            strokeWidth={groutStrokeWidth}
            opacity={0.7}
          />
        );
      }
    }
  }

  return elements;
}
