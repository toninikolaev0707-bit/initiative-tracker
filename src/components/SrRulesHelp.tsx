import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { setHelpVisible } from "../helpers/actionDimensions";

const FADE_DURATION = 240;
const EXIT_GRACE = 340;

export function SrRulesHelp() {
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouchLayout = () =>
    window.matchMedia("(hover: none), (pointer: coarse)").matches;

  const cancelLeave = () => {
    if (leaveTimer.current !== null) clearTimeout(leaveTimer.current);
    leaveTimer.current = null;
  };

  const show = () => {
    cancelLeave();
    setOpen(true);
  };

  const scheduleHide = () => {
    cancelLeave();
    leaveTimer.current = setTimeout(() => setOpen(false), EXIT_GRACE);
  };

  useEffect(() => {
    if (resizeTimer.current !== null) clearTimeout(resizeTimer.current);
    if (open) {
      setHelpVisible(true, isTouchLayout());
    } else {
      // Keep the iframe enlarged until the slide/fade-out finishes.
      resizeTimer.current = setTimeout(
        () => setHelpVisible(false, isTouchLayout()),
        FADE_DURATION,
      );
    }
    return () => {
      if (resizeTimer.current !== null) clearTimeout(resizeTimer.current);
    };
  }, [open]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("keydown", onEscape);
      cancelLeave();
      setHelpVisible(false, isTouchLayout());
    };
  }, []);

  return (
    <>
      <IconButton
        size="small"
        className="sr-rules-trigger"
        aria-label="Памятка по разнице СР"
        aria-expanded={open}
        aria-controls="sr-rules-panel"
        title="Правила разницы СР"
        onMouseEnter={() => { if (!isTouchLayout()) show(); }}
        onMouseLeave={() => { if (!isTouchLayout()) scheduleHide(); }}
        onFocus={() => { if (!isTouchLayout()) show(); }}
        onBlur={() => { if (!isTouchLayout()) scheduleHide(); }}
        onClick={() => {
          cancelLeave();
          if (isTouchLayout()) setOpen((previous) => !previous);
          else show();
        }}
        sx={{ color: open ? "primary.main" : "text.secondary", p: 0.3 }}
      >
        <HelpOutlineRoundedIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <Box
        id="sr-rules-panel"
        role="region"
        aria-label="Памятка по СР"
        aria-hidden={!open}
        className={`sr-rules-panel${open ? " sr-rules-panel--open" : ""}`}
        onMouseEnter={() => { if (!isTouchLayout()) show(); }}
        onMouseLeave={() => { if (!isTouchLayout()) scheduleHide(); }}
        onFocus={show}
        onBlur={scheduleHide}
        sx={{ bgcolor: "background.paper", color: "text.primary", borderColor: "divider" }}
      >
        <Box className="sr-rules-panel__inner">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: 750, fontSize: 18 }}>
              Преимущества СР
            </Typography>
            <IconButton
              aria-label="Закрыть памятку"
              size="small"
              onClick={() => setOpen(false)}
              sx={{ color: "text.secondary" }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7, lineHeight: 1.4 }}>
            Бонусы получает существо, чей СР выше СР противника на указанное
            число или больше. Эффекты действуют только против этого противника.
          </Typography>

          <SrTier title="Разница 2 СР" items={[
            "1 раз за ход — атака с преимуществом.",
          ]} />
          <SrTier title="Разница 5 СР" items={[
            "Все атаки — с преимуществом, атаки противника — с помехой.",
            "1 раз за ход — уклонение от атаки (кроме атак по области).",
            "Передвижение не провоцирует атаки возможности от противника.",
          ]} />
          <SrTier title="Разница 10+ СР" items={[
            "Все атаки — с двойным преимуществом, атаки противника — с помехой.",
            "До 3 уклонений за ход.",
            "Передвижение не провоцирует атаки возможности.",
            "Спасброски против атак противника по области — с преимуществом. При успехе урон полностью игнорируется.",
          ]} />

          <Box className="sr-rules-note" sx={{ bgcolor: "action.hover" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 750, mb: 0.5 }}>
              Правила уклонения
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
              Чтобы увернуться, соверши проверку Ловкости или основной
              характеристики против СЛ атакующего.
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.6, lineHeight: 1.4 }}>
              При натуральной 20 на атаке проверка уклонения совершается
              с помехой.
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}

function SrTier({ title, items }: { title: string; items: string[] }) {
  return (
    <Box component="section" className="sr-rules-tier">
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}>
        {title}
      </Typography>
      <Box component="ul" className="sr-rules-list">
        {items.map((item) => (
          <Typography key={item} component="li" variant="body2" sx={{ lineHeight: 1.45 }}>
            {item}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
