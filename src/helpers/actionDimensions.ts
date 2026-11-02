import OBR from "@owlbear-rodeo/sdk";

// The tracker is kept narrow. When the SR help is open we only increase height,
// because a side-by-side layout is awkward inside Owlbear's small action frame.
export const TRACKER_WIDTH = 250;
export const HELP_PANEL_HEIGHT = 520;

let trackerHeight = 129;
let helpVisible = false;

/** Remember the height calculated by the tracker without collapsing open help. */
export function setTrackerHeight(height: number) {
  trackerHeight = height;
  if (!helpVisible) void OBR.action.setHeight(height);
}

/** Resize the Owlbear action iframe so the compact help card is not clipped. */
export function setHelpVisible(visible: boolean, _compact: boolean) {
  helpVisible = visible;
  void OBR.action.setWidth(TRACKER_WIDTH);
  void OBR.action.setHeight(
    visible ? Math.max(trackerHeight, HELP_PANEL_HEIGHT) : trackerHeight,
  );
}
