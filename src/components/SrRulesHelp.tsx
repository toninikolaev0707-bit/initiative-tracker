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
const LEAVE_DELAY = 1050;

/** The small ? icon inside the tracker. The actual help lives in a SEPARATE
 *  native Owlbear popover, never in or over the 250px initiative tracker. */
export function SrRulesHelp() {
  const [visible, setVisible] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>();
  const opening = useRef(false);
  const hasHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function cancelClose() {
    if (closeTimer.current !== undefined) clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
  }

  async function openHelp() {
    cancelClose();
    if (opening.current) return;
    opening.current = true;
    try {
      const alreadyOpen = await OBR.popover.getWidth(POPOVER_ID);
      if (!alreadyOpen) {
        const url = new URL(window.location.href);
        url.searchParams.set("srHelp", "1");
        await OBR.popover.open({
          id: POPOVER_ID,
          url: url.href,
          width: 376,
          height: 522,
          // Action popovers live at the top-left of Owlbear. Anchor the help
          // beside the tracker rather than stretching the tracker itself.
          anchorReference: "POSITION",
          anchorPosition: { left: 264, top: 60 },
          anchorOrigin: { horizontal: "LEFT", vertical: "TOP" },
          transformOrigin: { horizontal: "LEFT", vertical: "TOP" },
          hidePaper: true,
        });
      }
      setVisible(true);
    } catch (error) {
      console.error("Cannot open SR rules popover", error);
    } finally {
      opening.current = false;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      void OBR.popover.close(POPOVER_ID).catch(console.error);
      setVisible(false);
    }, LEAVE_DELAY);
  }

  useEffect(() => {
    // v1.6.2/1.6.3 expanded the main action popover. Reset that old size.
    void OBR.action.setWidth(250);
    const offHover = OBR.broadcast.onMessage(HOVER_CHANNEL, (event) => {
      if (event.data === "enter") cancelClose();
      if (event.data === "leave") scheduleClose();
      if (event.data === "close") {
        cancelClose();
        setVisible(false);
      }
    });
    const offAction = OBR.action.onOpenChange((isOpen) => {
      if (!isOpen) {
        cancelClose();
        setVisible(false);
        void OBR.popover.close(POPOVER_ID).catch(console.error);
      }
    });
    return () => {
      cancelClose();
      offHover();
      offAction();
      void OBR.popover.close(POPOVER_ID).catch(console.error);
    };
  }, []);

  return (
    <IconButton
      size="small"
      aria-label="Памятка по разнице СР"
      title="Правила разницы СР"
      aria-expanded={visible}
      onMouseEnter={() => { if (hasHover()) void openHelp(); }}
      onMouseLeave={() => { if (hasHover()) scheduleClose(); }}
      onFocus={() => { if (hasHover()) void openHelp(); }}
      onBlur={() => { if (hasHover()) scheduleClose(); }}
      onClick={() => {
        cancelClose();
        // Click opens the help on touch screens, and toggles it on desktop.
        void (async () => {
          const existing = await OBR.popover.getWidth(POPOVER_ID);
          if (existing && !hasHover()) {
            // Touch devices have no hover: tap again to close.
            await OBR.popover.close(POPOVER_ID);
            setVisible(false);
          } else if (!existing) {
            await openHelp();
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
          <Typography component="li" variant="body2" key={item} sx={{ lineHeight: 1.46 }}>
            {item}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

/** This component is rendered in a dedicated iframe (?srHelp=1). */
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
        <Typography variant="h6" sx={{ fontSize: 17, fontWeight: 750 }}>
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
        Преимущества получает существо, чей СР выше СР противника на указанное
        число или больше. Они действуют только против него.
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
        <Typography variant="subtitle2" sx={{ fontWeight: 750, mb: 0.6 }}>
          Правила уклонения
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
          Чтобы увернуться, соверши проверку Ловкости или основной
          характеристики против СЛ атакующего.
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.7, lineHeight: 1.5 }}>
          При натуральной 20 на атаке проверка уклонения совершается с помехой.
        </Typography>
      </Box>
    </Box>
  );
}
