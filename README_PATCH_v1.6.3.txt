SIGMA СР COUNT PRO v1.6.3 — compact SR help popup layout

What changed:
- Reworked the SR help from a side panel into a compact in-window popup.
- The Owlbear action frame no longer expands horizontally.
- Text now wraps correctly in the available width.
- Opening the help only increases height so the popup can scroll comfortably.
- Improved spacing and readability for narrow layouts.

Apply by copying these files over your project, then rebuild:
- src/components/SrRulesHelp.tsx
- src/helpers/actionDimensions.ts
- src/action/style.css
