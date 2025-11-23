"use client";

import React, { useState } from "react";
import { Button, Stack } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import { useTranslation } from "react-i18next";

export default function DonatePhone() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  const phone = "buffonblr.it@gmail.com";

  const copyPhone = () => {
    navigator.clipboard.writeText(phone);
  };

  return (
    <>
      {!visible ? (
        <Button variant="outlined" size="small" onClick={() => setVisible(true)} startIcon={<ContactMailIcon />}>
          {t("show_phone")}
        </Button>
      ) : (
        <Stack direction="row" spacing={1}>
          <Button variant="contained" size="small" disableElevation sx={{ fontWeight: 600 }}>
            {phone}
          </Button>

          <Button variant="outlined" size="small" onClick={copyPhone} startIcon={<ContentCopyIcon />}>
            {t("copy")}
          </Button>
        </Stack>
      )}
    </>
  );
}
