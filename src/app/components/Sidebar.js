"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PopupGeometryModal from "./PopupGeometryModal";
import LanguageSwitcher from "./LanguageSwitcher";

// MUI
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Slider,
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
  Stack,
  Tooltip,
} from "@mui/material";

function Sidebar({
  tileSettings,
  onTileSettingsChange,
  zoom,
  onZoomChange,
  calibration,
  onChangeKnownDistance,
  onStartCalibration,
  pxPerMm,
  onCenterView,
}) {
  const { t } = useTranslation();

  // flag to avoid calling t() during SSR
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Local copy of settings to reduce renders (debounced sync)
  const [localSettings, setLocalSettings] = useState(tileSettings);

  // Modal state for geometry editing
  const [isGeoModalOpen, setGeoModalOpen] = useState(false);

  // Sync local state when parent tileSettings change (e.g. after loading from storage)
  useEffect(() => {
    setLocalSettings(tileSettings);
  }, [tileSettings]);

  // Debounced propagation of changes to parent state (700ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSettings === tileSettings) return; // skip redundant sync
      onTileSettingsChange(localSettings);
    }, 700);

    return () => clearTimeout(timer);
  }, [localSettings, tileSettings, onTileSettingsChange]);

  // Helper: update a single field in local state
  const update = (field, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // helpers to render translated / fallback text
  const txtTileGeometry = isClient ? t("tile_geometry") : "Геометрия плитки";
  const txtChangeGeometry = isClient ? t("change_geometry") : "Изменить геометрию…";
  const txtCurrentDimensions = isClient ? t("current_dimensions") : "Текущие размеры";
  const txtGroutMm = isClient ? t("grout_mm") : "Шов (мм)";
  const txtHerringbone = isClient ? t("herringbone") : "Укладка ёлочкой";

  const txtColors = isClient ? t("colors") : "Цвета";
  const txtTileColor = isClient ? t("tile_color") : "Цвет плитки";
  const txtOpacity = isClient ? t("opacity") : "Прозрачность";
  const txtBorderColor = isClient ? t("border_color") : "Цвет границы";
  const txtGroutColor = isClient ? t("grout_color") : "Цвет шва";
  const txtShowBorder = isClient ? t("show_tile_border") : "Показывать границы плитки";
  const txtOnlyZero = isClient ? t("only_with_zero_grout") : "(доступно только при шве 0 мм)";

  const txtOffsetAndRotation = isClient ? t("offset_and_rotation") : "Смещение и поворот";
  const txtOffsetX = isClient ? t("offset_x") : "Смещение X (мм)";
  const txtOffsetY = isClient ? t("offset_y") : "Смещение Y (мм)";
  const txtRotationDeg = isClient ? t("rotation_deg") : "Поворот (°)";
  const txtRowOffset = isClient ? t("row_offset_mm") : "Step";

  const txtZoom = isClient ? t("zoom") : "Масштаб (Zoom)";
  const txtCenter = isClient ? t("center") : "Центрировать";

  const txtCalibration = isClient ? t("calibration") : "Калибровка";
  const txtKnownDistance = isClient ? t("known_distance_mm") : "Известное расстояние (мм)";
  const txtStartCalibration = isClient ? t("start_calibration") : "Начать калибровку";
  const txtClickTwoPoints = isClient ? t("click_two_points") : "Кликните по двум точкам на плане...";
  const txtCurrentScale = isClient ? t("current_scale") : "Текущий масштаб";
  const txtNotCalibrated = isClient ? t("not_calibrated") : "не откалиброван";

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Geometry popup */}
      <PopupGeometryModal
        open={isGeoModalOpen}
        onClose={() => setGeoModalOpen(false)}
        initialValues={{
          tileWidthMm: localSettings.tileWidthMm,
          tileLengthMm: localSettings.tileLengthMm,
          groutMm: localSettings.groutMm,
          rowOffsetMm: localSettings.rowOffsetMm,
        }}
        onSave={(newValues) => {
          // Batch update for performance
          setLocalSettings((prev) => ({
            ...prev,
            ...newValues,
          }));
        }}
      />

      {/* Language + Zoom go first */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <LanguageSwitcher />
        <FormControlLabel
          sx={{ mt: 0.5 }}
          control={
            <Checkbox
              checked={localSettings.pattern === "herringbone"}
              onChange={(e) => update("pattern", e.target.checked ? "herringbone" : "grid")}
            />
          }
          label={`${txtHerringbone} (herringbone)`}
        />
      </Box>

      {/* ZOOM SECTION (moved up) */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {txtZoom}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Slider min={0.25} max={10} step={0.05} value={zoom} onChange={(_, value) => onZoomChange(Number(value))} size="small" />
            <Typography variant="body2" sx={{ minWidth: 50, textAlign: "right" }}>
              {Math.round(zoom * 100)}%
            </Typography>
            <Button variant="outlined" size="small" onClick={onCenterView}>
              {txtCenter}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* TILE GEOMETRY */}
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1">{txtTileGeometry}</Typography>
            <Button variant="contained" size="small" onClick={() => setGeoModalOpen(true)}>
              {txtChangeGeometry}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary">
            {txtCurrentDimensions}: {localSettings.tileWidthMm} × {localSettings.tileLengthMm} мм, {txtGroutMm} {localSettings.groutMm},{" "}
            {txtRowOffset} {localSettings.rowOffsetMm}
          </Typography>
        </CardContent>
      </Card>

      {/* COLORS */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {txtColors}
          </Typography>

          <Box display="flex" flexDirection="column" gap={1.5}>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2">{txtTileColor}</Typography>
                <input
                  type="color"
                  value={localSettings.tileFillColor}
                  onChange={(e) => update("tileFillColor", e.target.value)}
                  style={{ border: "none", background: "transparent", width: 36, height: 24, padding: 0 }}
                />
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2">{txtBorderColor}</Typography>
                <input
                  type="color"
                  value={localSettings.tileBorderColor}
                  onChange={(e) => update("tileBorderColor", e.target.value)}
                  style={{ border: "none", background: "transparent", width: 36, height: 24, padding: 0 }}
                />
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2">{txtGroutColor}</Typography>
                <input
                  type="color"
                  value={localSettings.groutColor}
                  onChange={(e) => update("groutColor", e.target.value)}
                  style={{ border: "none", background: "transparent", width: 36, height: 24, padding: 0 }}
                />
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>
                {txtOpacity}: {Math.round((localSettings.tileOpacity ?? 1) * 100)}%
              </Typography>
              <Slider
                min={0}
                max={1}
                step={0.05}
                size="small"
                value={localSettings.tileOpacity ?? 1}
                onChange={(_, value) => update("tileOpacity", Number(value))}
              />
            </Box>
            {(() => {
              const groutValue = localSettings.groutMm ?? 0;
              const canToggleBorder = groutValue <= 0;
              const effectiveShowTileBorder = canToggleBorder ? localSettings.showTileBorder : false;

              return (
                <FormControlLabel
                  sx={{ opacity: canToggleBorder ? 1 : 0.5 }}
                  control={
                    <Checkbox
                      checked={effectiveShowTileBorder}
                      disabled={!canToggleBorder}
                      onChange={(e) => {
                        if (!canToggleBorder) return;
                        update("showTileBorder", e.target.checked);
                      }}
                    />
                  }
                  label={
                    <Box component="span">
                      {txtShowBorder}
                      {!canToggleBorder && (
                        <Tooltip title={txtOnlyZero} placement="right">
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ ml: 0.5, textDecoration: "underline dotted", cursor: "help" }}
                            color="text.secondary"
                          >
                            ?
                          </Typography>
                        </Tooltip>
                      )}
                    </Box>
                  }
                />
              );
            })()}
          </Box>
        </CardContent>
      </Card>

      {/* OFFSET & ROTATION */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {txtOffsetAndRotation}
          </Typography>

          <Box display="flex" flexDirection="row" gap={1.5}>
            <TextField
              label={txtOffsetX}
              type="number"
              size="small"
              value={localSettings.patternOffsetMmX ?? 0}
              onChange={(e) => update("patternOffsetMmX", e.target.value === "" ? 0 : Number(e.target.value))}
            />

            <TextField
              label={txtOffsetY}
              type="number"
              size="small"
              value={localSettings.patternOffsetMmY ?? 0}
              onChange={(e) => update("patternOffsetMmY", e.target.value === "" ? 0 : Number(e.target.value))}
            />

            <TextField
              label={txtRotationDeg}
              type="number"
              size="small"
              value={localSettings.rotationDeg}
              onChange={(e) => update("rotationDeg", Number(e.target.value) || 0)}
            />

            {/* <Typography variant="caption" color="text.secondary">
              {txtOffsetHint}
            </Typography> */}
          </Box>
        </CardContent>
      </Card>

      {/* CALIBRATION */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {txtCalibration}
          </Typography>

          <Box display="flex" flexDirection="column" gap={1.5}>
            <TextField
              label={txtKnownDistance}
              type="number"
              size="small"
              value={calibration.knownDistanceMm}
              onChange={(e) => onChangeKnownDistance(Number(e.target.value) || 0)}
            />

            <Button variant="contained" size="small" onClick={onStartCalibration}>
              {calibration.isCalibrating ? txtClickTwoPoints : txtStartCalibration}
            </Button>

            <Divider sx={{ my: 1 }} />

            <Typography variant="caption" color="text.secondary">
              {txtCurrentScale}: {pxPerMm ? `${pxPerMm.toFixed(3)} px / мм` : txtNotCalibrated}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default React.memo(Sidebar);
