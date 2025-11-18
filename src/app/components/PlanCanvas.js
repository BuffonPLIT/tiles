import React, { useRef, useState } from "react";

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

  // Hidden <img> to read natural size
  const handleHiddenImageLoad = (e) => {
    const img = e.currentTarget;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  // Mouse down for panning
  const handleMouseDown = (e) => {
    if (!imageSrc) return;
    if (calibration.isCalibrating) {
      // During calibration we do not pan
      return;
    }
    if (e.button !== 0) return; // only left mouse button

    setIsPanning(true);
    setPanStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isPanning || !panStart) return;

    const dx = e.clientX - panStart.mouseX;
    const dy = e.clientY - panStart.mouseY;

    setOffset({
      x: panStart.offsetX + dx,
      y: panStart.offsetY + dy,
    });
  };

  const stopPanning = () => {
    setIsPanning(false);
    setPanStart(null);
  };

  // Click for calibration points
  const handleClickForCalibration = (e) => {
    if (!calibration.isCalibrating || !svgRef.current || !imageSize) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const newPoints = [...calibration.points, { x, y }];

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

  // Tile grid: herringbone pattern (ёлочка) via <polygon>
  const renderTiles = () => {
    if (!imageSize || !pxPerMm || !imageSrc) return null;

    const { tileWidthMm, tileLengthMm, groutMm, rotationDeg, pattern } = tileSettings;

    const w = tileWidthMm * pxPerMm;
    const h = tileLengthMm * pxPerMm;
    const grout = groutMm * pxPerMm;

    if (w <= 0 || h <= 0) return null;

    const centerX = imageSize.width / 2;
    const centerY = imageSize.height / 2;

    // Calibration line
    let calibrationLine = null;
    if (calibration.points.length === 2) {
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
      // --- Simple rectangular grid layout ---
      const stepX = w + grout;
      const stepY = h + grout;

      const cols = Math.ceil(imageSize.width / stepX) + 2;
      const rows = Math.ceil(imageSize.height / stepY) + 2;

      const rects = [];

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * stepX + grout / 2;
          const y = row * stepY + grout / 2;

          rects.push(
            <rect
              key={`grid-${row}-${col}`}
              x={x}
              y={y}
              width={w}
              height={h}
              fill="none"
              stroke="red"
              strokeWidth={grout > 1 ? grout : 1}
              opacity={0.5}
            />
          );
        }
      }

      tilesContent = rects;
    } else {
      // --- Herringbone layout (ёлочка) via polygons ---
      const step = w + h + grout;
      const cols = Math.ceil(imageSize.width / step) + 2;
      const rows = Math.ceil(imageSize.height / step) + 2;

      const tiles = [];

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const baseX = col * step;
          const baseY = row * step;

          const isEven = (row + col) % 2 === 0;

          // Tile center
          const cx = baseX + step / 2;
          const cy = baseY + step / 2;

          // Axis-aligned rectangle points around center
          const x0 = cx - w / 2 + grout / 2;
          const y0 = cy - h / 2 + grout / 2;
          const x1 = cx + w / 2 - grout / 2;
          const y1 = cy + h / 2 - grout / 2;

          const points = `${x0},${y0} ${x1},${y0} ${x1},${y1} ${x0},${y1}`;

          const tileRotation = isEven ? 90 : 0; // classical herringbone

          tiles.push(
            <g key={`h-${row}-${col}`} transform={`rotate(${tileRotation}, ${cx}, ${cy})`}>
              <polygon points={points} fill="none" stroke="red" strokeWidth={grout > 1 ? grout : 1} opacity={0.5} />
            </g>
          );
        }
      }

      tilesContent = tiles;
    }

    return (
      <>
        {calibrationLine}
        <g transform={`rotate(${rotationDeg}, ${centerX}, ${centerY})`}>{tilesContent}</g>
      </>
    );
  };

  // Export current SVG (plan + tiles) to PNG
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

  // Simple PDF export strategy: open PNG in new tab and user can "Save as PDF" via browser print
  const handleExportPdf = () => {
    // Reuse PNG export, but open resulting PNG in new tab
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
      // дальше пользователь может через Ctrl+P сохранить как PDF
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
          {/* Hidden image to detect natural size */}
          {!imageSize && <img ref={hiddenImgRef} src={imageSrc} alt="hidden" style={{ display: "none" }} onLoad={handleHiddenImageLoad} />}

          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopPanning}
            onMouseLeave={stopPanning}
            onClick={handleClickForCalibration}
            style={{
              position: "relative",
              flex: 1,
              border: "1px solid #ccc",
              overflow: "hidden",
              cursor: calibration.isCalibrating ? "crosshair" : isPanning ? "grabbing" : "grab",
              minHeight: 300,
            }}
          >
            {imageSize && (
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
                  {renderTiles()}
                </svg>
              </div>
            )}
          </div>

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button onClick={handleExportPng}>Экспорт PNG</button>
            <button onClick={handleExportPdf}>Экспорт PDF (через печать)</button>
          </div>
        </>
      )}
    </>
  );
}
