"use client";

import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PlanSvg from "./PlanSvg";
import { Button, Stack } from "@mui/material";

export default function PlanCanvas({
  imageSrc,
  setImageSrc,
  imageSize,
  setImageSize,
  pxPerMm,
  setPxPerMm,
  zoom,
  setZoom,
  offset,
  setOffset,
  tileSettings,
  calibration,
  setCalibration,
}) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => setIsClient(true), []);

  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const hiddenImgRef = useRef(null);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);

  const panFrameRef = useRef(null);
  const nextOffsetRef = useRef(offset);

  // === File upload ===
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result;
      if (typeof src === "string") {
        setImageSrc(src);
        setImageSize(null);
        setPxPerMm(null);
        setCalibration((prev) => ({
          ...prev,
          points: [],
          isCalibrating: false,
        }));
        setOffset({ x: 0, y: 0 });
        setZoom(1);
      }
    };
    reader.readAsDataURL(file);
  };

  // Hidden image size
  const handleHiddenImageLoad = (e) => {
    const img = e.currentTarget;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  // === Panning ===
  const handleMouseDown = (e) => {
    if (!imageSrc) return;
    if (calibration.isCalibrating) return;
    if (e.button !== 0) return;

    setIsPanning(true);
    setPanStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    });

    nextOffsetRef.current = offset;
  };

  const handleMouseMove = (e) => {
    if (!isPanning || !panStart) return;

    const dx = e.clientX - panStart.mouseX;
    const dy = e.clientY - panStart.mouseY;

    nextOffsetRef.current = {
      x: panStart.offsetX + dx,
      y: panStart.offsetY + dy,
    };

    if (panFrameRef.current === null) {
      panFrameRef.current = window.requestAnimationFrame(() => {
        setOffset(nextOffsetRef.current);
        panFrameRef.current = null;
      });
    }
  };

  const stopPanning = () => {
    setIsPanning(false);
    setPanStart(null);

    if (panFrameRef.current !== null) {
      window.cancelAnimationFrame(panFrameRef.current);
      panFrameRef.current = null;
    }
  };

  const handleMouseUp = stopPanning;
  const handleMouseLeave = stopPanning;

  // === Calibration click ===
  const handleCanvasClick = (e) => {
    if (!calibration.isCalibrating || !svgRef.current || !imageSize) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const newPoints = [...(calibration.points || []), { x, y }];

    if (newPoints.length === 2) {
      const [p1, p2] = newPoints;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;

      const distPx = Math.sqrt(dx * dx + dy * dy);

      if (calibration.knownDistanceMm > 0) {
        const newPxPerMm = distPx / calibration.knownDistanceMm;
        setPxPerMm(newPxPerMm);
      }

      setCalibration({
        knownDistanceMm: calibration.knownDistanceMm,
        points: newPoints,
        isCalibrating: false,
      });
    } else {
      setCalibration({
        ...calibration,
        points: newPoints,
      });
    }
  };

  // === Export PNG ===
  const handleExportPng = () => {
    if (!svgRef.current || !imageSize) return;

    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    if (!source.match(/^<svg[^>]+xmlns=/)) {
      source = source.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = imageSize.width;
      canvas.height = imageSize.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = "plan-tiles.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pngUrl);
      });
    };
    img.src = url;
  };

  // === Export PDF via print ===
  const handleExportPdf = () => {
    if (!svgRef.current || !imageSize) return;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);

    if (!source.match(/^<svg[^>]+xmlns=/)) {
      source = source.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = imageSize.width;
      canvas.height = imageSize.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");

      const win = window.open();
      if (!win) return;
      win.document.write(`<html><body style="margin:0"><img src="${pngUrl}" style="width:100%"/></body></html>`);
      win.document.close();
    };
    img.src = url;
  };

  return (
    <>
      <div style={{ marginBottom: 8 }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      {!imageSrc && <p>{isClient ? t("upload_plan") : "Загрузите план квартиры, чтобы начать работу."}</p>}

      {imageSrc && (
        <>
          {!imageSize && <img ref={hiddenImgRef} src={imageSrc} alt="hidden" style={{ display: "none" }} onLoad={handleHiddenImageLoad} />}

          <PlanSvg
            imageSrc={imageSrc}
            imageSize={imageSize}
            zoom={zoom}
            offset={offset}
            containerRef={containerRef}
            svgRef={svgRef}
            pxPerMm={pxPerMm}
            tileSettings={tileSettings}
            calibration={calibration}
            isPanning={isPanning}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleCanvasClick}
          />

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button variant="outlined" size="small" onClick={handleExportPng}>
              {isClient ? t("export_png") : "Экспорт PNG"}
            </Button>
            <Button variant="outlined" size="small" onClick={handleExportPdf}>
              {isClient ? t("export_pdf") : "Экспорт PDF (через печать)"}
            </Button>
          </Stack>
        </>
      )}
    </>
  );
}
