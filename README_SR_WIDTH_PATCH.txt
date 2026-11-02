SIGMA СР COUNT PRO — SR rules help width & wrapping fix (1.6.3)

Changes:
- Expanded the help panel from 360 to 520 pixels (tracker remains 250px).
- The Owlbear action popover expands to 770px on desktop when the help panel opens.
- Removed inherited nowrap from the CardHeader, allowing all long rule descriptions to wrap inside the panel.
- Prevented horizontal scrolling; in smaller viewports the panel shrinks to fit and text wraps.
- Increased help panel height target to 630px with vertical scroll for smaller screens.
- The touch/mobile overlay remains at most 350px wide.
- All rule wording, initiative tracking and scene metadata remain unchanged.

Install patch:
1. Copy files from the patch archive over the same relative paths in your local initiative-tracker folder.
2. Run npm install if your dependencies aren't already installed, then npm run build.
3. Redeploy the built extension to your hosting and hard refresh Owlbear Rodeo.

Note: Static code checks passed. npm build was unavailable in the test container (dependencies were not cached), and live Owlbear test was not possible.
