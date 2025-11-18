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

  // Use exact user-entered size, without swapping
  const widthPx = tileWidthMm * pxPerMm; // tile width along X
  const heightPx = tileLengthMm * pxPerMm; // tile length along Y

  if (widthPx <= 0 || heightPx <= 0 || groutPx < 0) return null;

  // spacing between tile origins
  const stepX = widthPx + groutPx;
  const stepY = heightPx + groutPx;

  // row shift in px
  const rowOffsetPx = (rowOffsetMm || 0) * pxPerMm;

  // base counts to cover image rect
  const baseCols = Math.ceil(imageSize.width / stepX);
  const baseRows = Math.ceil(imageSize.height / stepY);

  // diagonal of image — conservative measure of how far corners can go on rotation
  const diag = Math.sqrt(imageSize.width * imageSize.width + imageSize.height * imageSize.height);

  // extra rows/cols to safely cover rotated image + row offsets
  const extraCols = Math.ceil(diag / stepX) + 4;
  const extraRows = Math.ceil(diag / stepY) + 4;

  const colStart = -extraCols;
  const colEnd = baseCols + extraCols;
  const rowStart = -extraRows;
  const rowEnd = baseRows + extraRows;

  const tileStroke = 1; // visual tile border width
  const elements = [];

  const groutStrokeColor = groutColor ?? "red";
  const tileStrokeColor = tileBorderColor ?? "yellow";
  const fillColor = tileFillColor ?? "none";

  for (let row = rowStart; row <= rowEnd; row++) {
    // shift for this row
    const shiftX = row * rowOffsetPx;

    for (let col = colStart; col <= colEnd; col++) {
      const baseX = col * stepX + shiftX;
      const baseY = row * stepY;

      // ---- Tile ----
      elements.push(
        <rect
          key={`tile-${row}-${col}`}
          x={baseX}
          y={baseY}
          width={widthPx}
          height={heightPx}
          fill={fillColor}
          stroke={tileStrokeColor}
          strokeWidth={tileStroke} // NOT grout, just outline
          opacity={0.9}
        />
      );

      // ---- Grout segments (right & bottom edges) ----

      // vertical grout on the right
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

      // horizontal grout at the bottom
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
