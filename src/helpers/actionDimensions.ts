import OBR from "@owlbear-rodeo/sdk";

// The main tracker stays 250px wide; its help panel is displayed alongside it.
export const TRACKER_WIDTH = 250;
export const HELP_PANEL_WIDTH = 520;
export const HELP_PANEL_HEIGHT = 630;

let trackerHeight = 129;
let helpVisible = false;

/** Remember the height calculated by the tracker without collapsing open help. */
export function setTrackerHeight(height: number) {
  trackerHeight = height;
  if (!helpVisible) void OBR.action.setHeight(height);
}

/** Resize the Owlbear action iframe so the help card is not clipped. */
export function setHelpVisible(visible: boolean, compact: boolean) {
  helpVisible = visible;
  void OBR.action.setWidth(
    visible ? TRACKER_WIDTH + (compact ? 100 : HELP_PANEL_WIDTH) : TRACKER_WIDTH,
  );
  void OBR.action.setHeight(
    visible ? Math.max(trackerHeight, HELP_PANEL_HEIGHT) : trackerHeight,
  );
}
