import React, { useState } from "react";

import Box from "@mui/material/Box";
import CardHeader from "@mui/material/CardHeader";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";

// The action popover is an iframe: without resizing it, a normal tooltip
// gets clipped at its original 250px width/height.
export const RULES_POPOVER_WIDTH = 510;
export const NORMAL_POPOVER_WIDTH = 280;
export const RULES_EXTRA_HEIGHT = 560;

const rules = [
  {
    title: "Разница 2 СР",
    points: ["1 раз за ход атака с преимуществом."],
  },
  {
    title: "Разница 5 СР",
    points: [
      "Все атаки с преимуществом, атаки противника — с помехой.",
      "1 раз за ход уклонение от атаки (кроме атак по области).",
      "Передвижение не провоцирует атаки возможности от противника.",
    ],
  },
  {
    title: "Разница 10+ СР",
    points: [
      "Все атаки с двойным преимуществом, атаки противника с помехой.",
      "До 3 уклонений за ход.",
      "Передвижение не провоцирует атаки возможности.",
      "Спасброски против атак по области от противника совершаются с преимуществом. При успехе урон полностью игнорируется.",
    ],
  },
];

export function InitiativeHeader({
  subtitle,
  action,
  onRulesOpenChange,
}: {
  subtitle?: string;
  action?: React.ReactNode;
  onRulesOpenChange?: (open: boolean) => void;
}) {
  const [rulesOpen, setRulesOpen] = useState(false);

  function updateRulesOpen(open: boolean) {
    if (rulesOpen === open) return;
    setRulesOpen(open);
    onRulesOpenChange?.(open);
  }

  return (
    <Box
      sx={{ width: "100%", flexShrink: 0 }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") updateRulesOpen(false);
      }}
    >
      <CardHeader
        title="Счётчик СР"
        action={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {onRulesOpenChange && (
              <IconButton
                size="small"
                aria-label="Показать правила СР"
                aria-expanded={rulesOpen}
                aria-controls="sr-rules-summary"
                onPointerEnter={(event) => {
                  if (event.pointerType !== "touch") updateRulesOpen(true);
                }}
                onClick={() => updateRulesOpen(!rulesOpen)}
                sx={{ p: 0.5, mr: 0.25, flexShrink: 0 }}
              >
                <HelpOutlineRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            )}
            <Box sx={{ display: "flex", alignItems: "center", "& .MuiIconButton-root": { padding: "6px" } }}>
              {action}
            </Box>
          </Box>
        }
        titleTypographyProps={{
          noWrap: true,
          sx: {
            fontSize: "1rem",
            fontWeight: "bold",
            lineHeight: "32px",
            color: "text.primary",
          },
        }}
        sx={{ px: 1.5, py: 1, "& .MuiCardHeader-action": { my: 0, ml: 0.25, alignSelf: "center" }, "& .MuiCardHeader-content": { minWidth: 0 } }}
      />
      <Divider variant="middle" />

      <Collapse in={rulesOpen} timeout={240} unmountOnExit>
        <Box
          id="sr-rules-summary"
          role="region"
          aria-label="Сводка правил СР"
          sx={{
            mx: 1,
            mt: 1,
            mb: 1.5,
            px: 1.5,
            py: 1.5,
            border: 1,
            borderColor: "divider",
            borderRadius: 1.5,
            bgcolor: "background.paper",
            boxShadow: 3,
            maxHeight: "min(540px, calc(100vh - 96px))",
            overflowY: "auto",
            overscrollBehavior: "contain",
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1.5 }}>
            Сводка преимуществ по СР
          </Typography>

          {rules.map(({ title, points }) => (
            <Box key={title} sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, mb: 0.5, color: "primary.main" }}>
                {title}
              </Typography>
              <Box
                component="ul"
                sx={{
                  pl: 2.25,
                  m: 0,
                  "& li": {
                    fontSize: 13,
                    lineHeight: 1.4,
                    mb: 0.5,
                    overflowWrap: "break-word",
                    color: "text.primary",
                  },
                }}
              >
                {points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </Box>
            </Box>
          ))}

          <Divider sx={{ mb: 1.25 }} />
          <Typography sx={{ fontSize: 13, lineHeight: 1.45, mb: 1 }}>
            Чтобы увернуться нужно совершить проверку ловкости или главной характеристики сл атакующего.
          </Typography>
          <Typography sx={{ fontSize: 13, lineHeight: 1.45 }}>
            При натуральной 20 на атаке, проверка на уворот происходит с помехой.
          </Typography>
        </Box>
      </Collapse>

      {subtitle && (
        <Typography
          variant="caption"
          sx={{ px: 2, py: 1, display: "inline-block", color: "text.secondary" }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
