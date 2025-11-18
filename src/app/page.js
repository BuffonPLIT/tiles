"use client";

import React, { useEffect, useMemo, useState } from "react";

import Sidebar from "./components/Sidebar";
import PlanCanvas from "./components/PlanCanvas/PlanCanvas";

const STORAGE_KEY = "tileToolSettings_v1";

export default function Page() {
  // Image & scale
  const [imageSrc, setImageSrc] = useState(null);
  const [imageSize, setImageSize] = useState(null); // { width, height }
  const [pxPerMm, setPxPerMm] = useState(null);

  // View
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Tile settings
  const [tileSettings, setTileSettings] = useState({
    tileWidthMm: 1200,
    tileLengthMm: 600,
    groutMm: 2,
    rotationDeg: 0,
    pattern: "grid",

    tileFillColor: "#a72ac0",
    tileBorderColor: "#000000",
    groutColor: "#ffffff",
    tileOpacity: 0.5,

    rowOffsetMm: 0, // NEW: сдвиг следующего ряда относительно предыдущего (мм)

    // NEW: смещение сетки относительно плана (мм)
    patternOffsetMmX: 0, // вправо/влево
    patternOffsetMmY: 0, // вниз/вверх (ось Y SVG)
  });

  // Calibration settings
  const [calibration, setCalibration] = useState({
    knownDistanceMm: 1000,
    points: [], // [{x, y}, ...] in image coords
    isCalibrating: false,
  });

  // --- Load settings from localStorage ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);

      if (data.tileSettings) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTileSettings((prev) => ({
          ...prev,
          ...data.tileSettings,
        }));
      }
      if (typeof data.zoom === "number") {
        setZoom(data.zoom);
      }
      if (typeof data.knownDistanceMm === "number") {
        setCalibration((prev) => ({
          ...prev,
          knownDistanceMm: data.knownDistanceMm,
        }));
      }
    } catch (e) {
      console.warn("Failed to parse saved settings", e);
    }
  }, []);

  // --- Save settings to localStorage ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const payload = {
      tileSettings,
      zoom,
      knownDistanceMm: calibration.knownDistanceMm,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [tileSettings, zoom, calibration.knownDistanceMm]);

  // --- Start calibration ---
  const handleStartCalibration = () => {
    if (!imageSrc) return;
    setCalibration((prev) => ({
      ...prev,
      points: [],
      isCalibrating: true,
    }));
  };

  // --- Tile usage stats (approximate) ---
  const stats = useMemo(() => {
    const { tileWidthMm, tileLengthMm } = tileSettings;

    if (!imageSize || !pxPerMm || tileWidthMm <= 0 || tileLengthMm <= 0) {
      return null;
    }

    // Plan size in mm
    const widthMm = imageSize.width / pxPerMm;
    const heightMm = imageSize.height / pxPerMm;
    const areaM2 = (widthMm * heightMm) / 1_000_000;

    // Single tile area
    const tileAreaM2 = (tileWidthMm * tileLengthMm) / 1_000_000;

    const rawCount = areaM2 / tileAreaM2;
    const fullTiles = Math.ceil(rawCount);
    const reserveTiles = Math.ceil(fullTiles * 1.1); // +10% reserve

    return {
      areaM2,
      tileAreaM2,
      rawCount,
      fullTiles,
      reserveTiles,
    };
  }, [imageSize, pxPerMm, tileSettings.tileWidthMm, tileSettings.tileLengthMm]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        fontFamily: "sans-serif",
      }}
    >
      {/* Left: plan + overlay + export */}
      <div
        style={{
          flex: 2,
          borderRight: "1px solid #ddd",
          padding: 16,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <PlanCanvas
          imageSrc={imageSrc}
          setImageSrc={setImageSrc}
          imageSize={imageSize}
          setImageSize={setImageSize}
          pxPerMm={pxPerMm}
          setPxPerMm={setPxPerMm}
          zoom={zoom}
          setZoom={setZoom}
          offset={offset}
          setOffset={setOffset}
          tileSettings={tileSettings}
          calibration={calibration}
          setCalibration={setCalibration}
        />
      </div>

      {/* Right: controls + stats */}
      <div
        style={{
          flex: 1,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Sidebar
          tileSettings={tileSettings}
          onTileSettingsChange={setTileSettings}
          zoom={zoom}
          onZoomChange={setZoom}
          calibration={calibration}
          onChangeKnownDistance={(value) => setCalibration((prev) => ({ ...prev, knownDistanceMm: value }))}
          onStartCalibration={handleStartCalibration}
          pxPerMm={pxPerMm}
          stats={stats}
        />
      </div>
    </div>
  );
}
