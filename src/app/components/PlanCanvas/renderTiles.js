import React from "react";
import { renderGrid } from "./renderGrid";
import { renderHerringboneLines } from "./renderHerringboneLines";

export function renderTiles({ imageSize, imageSrc, pxPerMm, tileSettings, calibration }) {
  if (!imageSize || !pxPerMm || !imageSrc) return null;

  const {
    tileWidthMm,
    tileLengthMm,
    groutMm,
    rotationDeg,
    pattern,
    tileFillColor,
    tileBorderColor,
    groutColor,
    rowOffsetMm,
    tileOpacity,
    patternOffsetMmX,
    patternOffsetMmY,
    showTileBorder,
  } = tileSettings;

  const groutPx = groutMm * pxPerMm;

  if (tileWidthMm <= 0 || tileLengthMm <= 0 || groutPx < 0) return null;

  const centerX = imageSize.width / 2;
  const centerY = imageSize.height / 2;

  // border is allowed only when grout is exactly 0
  const effectiveShowTileBorder = groutMm <= 0 && !!showTileBorder;

  let calibrationLine = null;
  if (calibration.points && calibration.points.length === 2) {
    calibrationLine = (
      <line
        x1={calibration.points[0].x}
        y1={calibration.points[0].y}
        x2={calibration.points[1].x}
        y2={calibration.points[1].y}
        stroke="blue"
        strokeWidth={2}
      />
    );
  }

  let tilesContent = null;

  if (pattern === "grid") {
    tilesContent = renderGrid({
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
      showTileBorder: effectiveShowTileBorder,
    });
  } else {
    tilesContent = renderHerringboneLines({
      imageSize,
      pxPerMm,
      tileWidthMm,
      tileLengthMm,
      groutPx,
      groutColor,
      tileFillColor,
      tileBorderColor,
      tileOpacity,
      patternOffsetMmX,
      patternOffsetMmY,
      showTileBorder: effectiveShowTileBorder,
    });
  }

  if (!tilesContent) return calibrationLine;

  return (
    <>
      {calibrationLine}
      <g transform={`rotate(${rotationDeg}, ${centerX}, ${centerY})`}>{tilesContent}</g>
    </>
  );
}
