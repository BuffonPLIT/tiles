"use client";

import React, { useMemo } from "react";
import { renderTiles } from "./renderTiles";

function PlanSvg({
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
  const tilesOverlay = useMemo(() => {
    if (!imageSrc || !imageSize) return null;

    return renderTiles({
      imageSize,
      imageSrc,
      pxPerMm,
      tileSettings,
      calibration,
    });
  }, [imageSize, imageSrc, pxPerMm, tileSettings, calibration]);

  if (!imageSrc || !imageSize) {
    return (
      <div
        ref={containerRef}
        style={{
          flex: 1,
          border: "1px solid #ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
          color: "#777",
        }}
      >
        Загрузите изображение плана
      </div>
    );
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
          {tilesOverlay}
        </svg>
      </div>
    </div>
  );
}

export default React.memo(PlanSvg);
