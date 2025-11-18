"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tileToolSettings_v1";
const SETTINGS_VERSION = 1;

const defaultSettings = {
  version: SETTINGS_VERSION,

  tileSettings: {
    tileWidthMm: 1200,
    tileLengthMm: 600,
    groutMm: 2,
    rotationDeg: 0,
    pattern: "grid",
    tileFillColor: "#797249ff",
    tileBorderColor: "#534e32",
    groutColor: "#ffffff",
    tileOpacity: 0.5,
    rowOffsetMm: 0,
    patternOffsetMmX: 0,
    patternOffsetMmY: 0,
  },

  view: {
    zoom: 1,
  },

  calibration: {
    knownDistanceMm: 1000,
  },
};

function sanitize(stored) {
  if (!stored || typeof stored !== "object") return defaultSettings;

  return {
    version: SETTINGS_VERSION,

    tileSettings: {
      ...defaultSettings.tileSettings,
      ...(stored.tileSettings || {}),
    },

    view: {
      ...defaultSettings.view,
      ...(stored.view || {}),
    },

    calibration: {
      ...defaultSettings.calibration,
      ...(stored.calibration || {}),
    },
  };
}

export function usePersistentSettings() {
  // ✔ SSR & first render: always defaultSettings
  const [settings, setSettings] = useState(defaultSettings);

  // ✔ Then load from localStorage on the client
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const safe = sanitize(parsed);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettings(safe);
    } catch (e) {
      console.warn("Failed to load settings", e);
    }
  }, []);

  // ✔ Save to localStorage whenever settings change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("Failed to save settings", e);
    }
  }, [settings]);

  return [settings, setSettings];
}
