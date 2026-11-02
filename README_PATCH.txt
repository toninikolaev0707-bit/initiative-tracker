PATCH: SR Rules flyout for SIGMA СР COUNT PRO v1.6.2
====================================================

WHAT CHANGED
- Question-mark icon beside "Счётчик СР"; hover to open a smoothly animated side panel.
- The help panel shows the 2 / 5 / 10+ SR advantage thresholds, dodge check,
  and the natural-20 exception.
- On touch devices, tap ? to open and X to close.
- Owlbear action width/height now expand while rules are visible.
- Works with both classic and checkbox tracker modes and with player/GM view.
- SR values, turns, and network metadata are unchanged.

INSTALL PATCH ZIP
1. Extract the ZIP into your initiative-tracker project directory,
   preserving folder paths and replacing existing files.
2. In that project folder run: npm install
3. Start locally: npm run dev
4. Build for hosting: npm run build
5. Deploy the generated dist directory to your host (e.g. Cloudflare Pages).

ALTERNATIVE: PATCH FILE
In the original extracted project root run:
    git apply --ignore-whitespace initiative-tracker-sr-help.patch

The --ignore-whitespace flag is important because the original ZIP contains
CRLF line endings.

NOTE: A full dependency installation/build could not be verified in this
execution environment. TypeScript/TSX syntax and patch application were checked.
