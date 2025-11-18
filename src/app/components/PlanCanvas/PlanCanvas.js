"use client";

import React, { useRef, useState } from "react";
import PlanSvg from "./PlanSvg";

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
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const hiddenImgRef = useRef(null);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null); // {mouseX, mouseY, offsetX, offsetY}

  // ⚡ refs для rAF-оптимизации pan
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

  // === Hidden image natural size ===
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
    if (e.button !== 0) return; // only left button

    setIsPanning(true);
    setPanStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    });

    // ⚡ сбрасываем "следующий" offset на текущий
    nextOffsetRef.current = offset;
  };

  const handleMouseMove = (e) => {
    if (!isPanning || !panStart) return;

    const dx = e.clientX - panStart.mouseX;
    const dy = e.clientY - panStart.mouseY;

    const newOffset = {
      x: panStart.offsetX + dx,
      y: panStart.offsetY + dy,
    };

    // ⚡ только сохраняем offset, без немедленного setOffset
    nextOffsetRef.current = newOffset;

    // ⚡ один setOffset на кадр через requestAnimationFrame
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

    // ⚡ отменяем запланированный кадр, если есть
    if (panFrameRef.current !== null) {
      window.cancelAnimationFrame(panFrameRef.current);
      panFrameRef.current = null;
    }
  };

  const handleMouseUp = () => {
    stopPanning();
  };

  const handleMouseLeave = () => {
    stopPanning();
  };

  // === Calibration click on SVG ===
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

    const svgBlob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = imageSize.width;
      canvas.height = imageSize.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = "plan-tiles.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
        },
        "image/png",
        1.0
      );
    };
    img.src = url;
  };

  // === Export "PDF" через печать PNG ===
  const handleExportPdf = () => {
    if (!svgRef.current || !imageSize) return;

    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    if (!source.match(/^<svg[^>]+xmlns=/)) {
      source = source.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const svgBlob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });
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
      win.document.write(
        `<html><head><title>Plan Export</title></head><body style="margin:0"><img src="${pngUrl}" style="width:100%;height:auto"/></body></html>`
      );
      win.document.close();
    };
    img.src = url;
  };

  return (
    <>
      <div style={{ marginBottom: 8 }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      {!imageSrc && <p>Загрузите план квартиры, чтобы начать работу.</p>}

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

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button onClick={handleExportPng}>Экспорт PNG</button>
            <button onClick={handleExportPdf}>Экспорт PDF (через печать)</button>
          </div>
        </>
      )}
    </>
  );
}
