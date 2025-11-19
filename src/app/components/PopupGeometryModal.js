"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Box, Paper, Typography, TextField, Button, Stack } from "@mui/material";

export default function PopupGeometryModal({
  open,
  onClose,
  initialValues, // { tileWidthMm, tileLengthMm, groutMm }
  onSave,
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setValues(initialValues);
  }, [open, initialValues]);

  const update = (field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 3,
          borderRadius: 2,
          width: 360,
          maxWidth: "90vw",
        }}
      >
        <Typography variant="h6" gutterBottom>
          {t("tile_geometry")}
        </Typography>

        <Stack spacing={1.5} mt={1.5}>
          <TextField
            label={t("tile_width_mm")}
            type="number"
            size="small"
            value={values.tileWidthMm}
            onChange={(e) => update("tileWidthMm", Number(e.target.value) || 0)}
          />

          <TextField
            label={t("tile_length_mm")}
            type="number"
            size="small"
            value={values.tileLengthMm}
            onChange={(e) => update("tileLengthMm", Number(e.target.value) || 0)}
          />

          <TextField
            label={t("grout_mm")}
            type="number"
            size="small"
            value={values.groutMm}
            onChange={(e) => update("groutMm", Number(e.target.value) || 0)}
          />

          <TextField
            label={t("row_offset_mm")}
            type="number"
            size="small"
            value={values.rowOffsetMm}
            onChange={(e) => update("rowOffsetMm", Number(e.target.value) || 0)}
          />
        </Stack>

        <Stack direction="row" spacing={1.5} mt={3} justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={() => {
              onSave(values);
              onClose();
            }}
          >
            {t("save")}
          </Button>
          <Button variant="outlined" onClick={onClose}>
            {t("cancel")}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
