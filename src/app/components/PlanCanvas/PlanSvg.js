"use client";

import React from "react";
import { renderTiles } from "./renderTiles";

export default function PlanSvg({
  imageSrc,
  imageSize,
  zoom,
  offset,
  containerRef,
  svgRef,
  pxPerMm,
  tileSettings,
  calibration,
  isPanning,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onClick,
}) {
  if (!imageSrc || !imageSize) {
    return null;
  }

  const cursor = calibration.isCalibrating ? "crosshair" : isPanning ? "grabbing" : "grab";

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        position: "relative",
        flex: 1,
        border: "1px solid #ccc",
        overflow: "hidden",
        cursor,
        minHeight: 300,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: offset.x,
          top: offset.y,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
        }}
      >
        <svg ref={svgRef} width={imageSize.width} height={imageSize.height}>
          <image href={imageSrc} x="0" y="0" width={imageSize.width} height={imageSize.height} />
          {renderTiles({
            imageSize,
            imageSrc,
            pxPerMm,
            tileSettings,
            calibration,
          })}
        </svg>
      </div>
    </div>
  );
}
