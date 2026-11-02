import { useEffect, useRef, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { getPluginId } from "../helpers/getPluginId";

const POPOVER_ID = getPluginId("sr-rules-popover");
const HOVER_CHANNEL = getPluginId("sr-rules-hover");
const CLOSE_DELAY = 900;

/**
 * A second, native Owlbear popover is used for the reference sheet.
 * The action popover can be limited to 250px, so placing the sheet inside it
 * (or trying to resize the action to 770px) can make the sheet invisible.
 */
export function SrRulesHelp() {
  const [visible, setVisible] = useState(false);
  const pinnedRef = useRef(false);
  const isOpening = useRef(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canHover = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function cancelClose() {
    if (closeTimeout.current !== null) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
  }

  function markShown(value: boolean) {
    setVisible(value);
  }

  async function showHelp() {
    cancelClose();
    if (isOpening.current) return;
    isOpening.current = true;
    try {
      const width = await OBR.popover.getWidth(POPOVER_ID);
      if (width === undefined) {
        // Using the same HTML entry avoids creating a separate build route.
        // The query parameter renders only the help sheet in that iframe.
        const url = new URL(window.location.href);
        url.searchParams.set("srHelp", "1");
        await OBR.popover.open({
          id: POPOVER_ID,
          url: url.href,
          width: 470,
          height: 655,
          anchorReference: "POSITION",
          anchorPosition: { left: 260, top: 55 },
          anchorOrigin: { horizontal: "LEFT", vertical: "TOP" },
          transformOrigin: { horizontal: "LEFT", vertical: "TOP" },
          hidePaper: true,
        });
      }
      markShown(true);
    } catch (error) {
      console.error("Failed to open the SR reference sheet:", error);
      markShown(false);
    } finally {
      isOpening.current = false;
    }
  }

  async function hideHelp() {
    cancelClose();
    pinnedRef.current = false;
    markShown(false);
    try {
      await OBR.popover.close(POPOVER_ID);
    } catch (error) {
      console.error("Failed to close the SR reference sheet:", error);
    }
  }

  function scheduleClose() {
    cancelClose();
    if (pinnedRef.current) return;
    closeTimeout.current = setTimeout(() => {
      if (!pinnedRef.current) void hideHelp();
    }, CLOSE_DELAY);
  }

  useEffect(() => {
    // Restore action width left behind by v1.6.2/v1.6.3.
    void OBR.action.setWidth(250).catch(console.error);
    const unsubscribeHover = OBR.broadcast.onMessage(HOVER_CHANNEL, (event) => {
      if (event.data === "enter") cancelClose();
      if (event.data === "leave") scheduleClose();
      if (event.data === "close") {
        cancelClose();
        pinnedRef.current = false;
        markShown(false);
      }
    });
    // Do not close the new popover on action.onOpenChange(false): Owlbear
    // may report the action as closed while bringing another popover forward.
    // The sheet has its own close button and native click-away dismissal.
    return () => {
      cancelClose();
      unsubscribeHover();
    };
  }, []);

  return (
    <IconButton
      size="small"
      aria-label="Памятка о преимуществах СР"
      title="Памятка о преимуществах СР"
      aria-expanded={visible}
      onMouseEnter={() => { if (canHover()) void showHelp(); }}
      onMouseLeave={() => { if (canHover()) scheduleClose(); }}
      onFocus={() => { if (canHover()) void showHelp(); }}
      onBlur={() => { if (canHover()) scheduleClose(); }}
      onClick={() => {
        cancelClose();
        // Check the actual Owlbear popover so a click can reopen it even if
        // it was dismissed externally while the trigger still looked active.
        void (async () => {
          const existingWidth = await OBR.popover.getWidth(POPOVER_ID);
          if (pinnedRef.current && existingWidth !== undefined) {
            await hideHelp();
          } else {
            pinnedRef.current = true;
            await showHelp();
          }
        })().catch(console.error);
      }}
      sx={{ color: visible ? "primary.main" : "text.secondary", p: 0.3 }}
    >
      <HelpOutlineRoundedIcon sx={{ fontSize: 20 }} />
    </IconButton>
  );
}

function Tier({ title, items }: { title: string; items: string[] }) {
  return (
    <Box component="section" className="sr-help-tier">
      <Typography variant="subtitle2" className="sr-help-tier-title" sx={{ fontWeight: 750, color: "primary.main" }}>
        {title}
      </Typography>
      <Box component="ul" className="sr-help-list">
        {items.map((item) => (
          <Typography component="li" variant="body2" key={item} sx={{ lineHeight: 1.45 }}>
            {item}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

/** Rendered by the same action HTML, but in the separate ?srHelp=1 iframe. */
export function SrRulesHelpContent() {
  const notifyHover = (status: "enter" | "leave" | "close") => {
    void OBR.broadcast.sendMessage(HOVER_CHANNEL, status, { destination: "LOCAL" })
      .catch(console.error);
  };

  return (
    <Box
      className="sr-help-sheet"
      sx={{ bgcolor: "background.paper", color: "text.primary" }}
      onMouseEnter={() => notifyHover("enter")}
      onMouseLeave={() => notifyHover("leave")}
    >
      <Box className="sr-help-header">
        <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 750 }}>
          Преимущества СР
        </Typography>
        <IconButton
          size="small"
          aria-label="Закрыть памятку"
          onClick={() => {
            notifyHover("close");
            void OBR.popover.close(POPOVER_ID).catch(console.error);
          }}
          sx={{ color: "text.secondary" }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
        Преимущества получает существо, чей СР выше СР конкретного противника
        на указанное число или больше. Эффекты действуют только против него.
      </Typography>

      <Tier title="Разница 2 СР" items={[
        "1 раз за ход — атака с преимуществом.",
      ]} />
      <Tier title="Разница 5 СР" items={[
        "Все атаки — с преимуществом, атаки противника — с помехой.",
        "1 раз за ход — уклонение от атаки (кроме атак по области).",
        "Передвижение не провоцирует атаки возможности от противника.",
      ]} />
      <Tier title="Разница 10+ СР" items={[
        "Все атаки — с двойным преимуществом, атаки противника — с помехой.",
        "До 3 уклонений за ход.",
        "Передвижение не провоцирует атаки возможности.",
        "Спасброски против атак противника по области — с преимуществом. При успехе урон полностью игнорируется.",
      ]} />

      <Box className="sr-help-note" sx={{ bgcolor: "action.hover" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 750, mb: 0.5 }}>
          Правила уклонения
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
          Чтобы увернуться, соверши проверку Ловкости или основной характеристики
          против СЛ атакующего.
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.6, lineHeight: 1.45 }}>
          При натуральной 20 на атаке проверка уклонения совершается с помехой.
        </Typography>
      </Box>
    </Box>
  );
}
