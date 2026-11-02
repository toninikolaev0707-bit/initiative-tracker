import React from "react";

import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { SrRulesHelp } from "./SrRulesHelp";

export function InitiativeHeader({
  subtitle,
  action,
}: {
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <>
      <CardHeader
        disableTypography
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, whiteSpace: "nowrap" }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: "bold", color: "text.primary" }}>
              Счётчик СР
            </Typography>
            <SrRulesHelp />
          </Box>
        }
        action={action}
        sx={{
          minHeight: 64,
          px: 1,
          py: 1,
          "& .MuiCardHeader-content": { minWidth: 0 },
          "& .MuiCardHeader-action": { display: "flex", alignItems: "center", m: 0 },
          "& .MuiCardHeader-action .MuiIconButton-root": { p: 0.55 },
        }}
      />
      <Divider variant="middle" />
      {subtitle && (
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            display: "inline-block",
            color: "text.secondary",
          }}
        >
          {subtitle}
        </Typography>
      )}
    </>
  );
}
