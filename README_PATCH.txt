SIGMA СР COUNT PRO — patch v1.6.4

Fixes the SR rules helper in Owlbear Rodeo:
* Opens SR rules in a separate native Owlbear popover rather than covering the tracker.
* The initiative tracker always keeps its original width (250px).
* Help text wraps normally, with no horizontal scrolling in a 376px-wide panel.
* The rules popover uses a soft fade/slide animation; supports hover on desktop,
  touch to open/close, and an explicit X button.
* Closing/opening the help does not modify SR data or round state.

To install:
1) Overlay the patch onto your existing initiative-tracker project preserving paths.
2) Run npm install (if needed) and npm run build.
3) Redeploy the built extension to your hosting.
4) Reload the extension in Owlbear Rodeo (hard-refresh if still seeing old UI).

Note: This deliverable is a source patch. A live Owlbear room test and a full npm
build couldn't be performed in the supplied environment (dependencies unavailable).
