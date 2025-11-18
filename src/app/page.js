"use client";

import React, { useMemo, useState } from "react";

import Sidebar from "./components/Sidebar";
import PlanCanvas from "./components/PlanCanvas/PlanCanvas";

import { usePersistentSettings } from "./hooks/usePersistentSettings";

export default function Page() {
  // Persistent settings (tileSettings + view + calibration)
  const [settings, setSettings] = usePersistentSettings();

  // Unpacked for readability
  const tileSettings = settings.tileSettings;
  const zoom = settings.view.zoom;
  const knownDistanceMm = settings.calibration.knownDistanceMm;

  // Local (non-persistent) states
  const [imageSrc, setImageSrc] = useState(null);
  const [imageSize, setImageSize] = useState(null);
  const [pxPerMm, setPxPerMm] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Update helpers
  const updateTileSettings = (newState) =>
    setSettings((prev) => ({
      ...prev,
      tileSettings: { ...prev.tileSettings, ...newState },
    }));

  const updateZoom = (value) =>
    setSettings((prev) => ({
      ...prev,
      view: { ...prev.view, zoom: value },
    }));

  const updateKnownDistance = (value) =>
    setSettings((prev) => ({
      ...prev,
      calibration: { ...prev.calibration, knownDistanceMm: value },
    }));

  // Calibration state stored outside persistent storage
  const [calibration, setCalibration] = useState({
    points: [],
    isCalibrating: false,
  });

  // Start calibration
  const handleStartCalibration = () => {
    if (!imageSrc) return;
    setCalibration({
      points: [],
      isCalibrating: true,
    });
  };

  // Compute stats
  const stats = useMemo(() => {
    const { tileWidthMm, tileLengthMm } = tileSettings;

    if (!imageSize || !pxPerMm || tileWidthMm <= 0 || tileLengthMm <= 0) return null;

    const widthMm = imageSize.width / pxPerMm;
    const heightMm = imageSize.height / pxPerMm;
    const areaM2 = (widthMm * heightMm) / 1_000_000;

    const tileAreaM2 = (tileWidthMm * tileLengthMm) / 1_000_000;

    const rawCount = areaM2 / tileAreaM2;
    const fullTiles = Math.ceil(rawCount);
    const reserveTiles = Math.ceil(fullTiles * 1.1);

    return { areaM2, tileAreaM2, rawCount, fullTiles, reserveTiles };
  }, [imageSize, pxPerMm, tileSettings.tileWidthMm, tileSettings.tileLengthMm]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        fontFamily: "sans-serif",
      }}
    >
      {/* LEFT SIDE */}
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
          setZoom={updateZoom}
          offset={offset}
          setOffset={setOffset}
          tileSettings={tileSettings}
          calibration={{ ...calibration, knownDistanceMm }}
          setCalibration={setCalibration}
        />
      </div>

      {/* RIGHT SIDE */}
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
          onTileSettingsChange={updateTileSettings}
          zoom={zoom}
          onZoomChange={updateZoom}
          calibration={{ ...calibration, knownDistanceMm }}
          onChangeKnownDistance={updateKnownDistance}
          onStartCalibration={handleStartCalibration}
          pxPerMm={pxPerMm}
          stats={stats}
        />
      </div>
    </div>
  );
}
