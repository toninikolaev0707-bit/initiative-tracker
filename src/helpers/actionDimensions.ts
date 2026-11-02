import OBR from "@owlbear-rodeo/sdk";

export const TRACKER_WIDTH = 250;

/** The tracker is never resized for help; help opens in its own Owlbear popover. */
export function setTrackerHeight(height: number) {
  void OBR.action.setHeight(height);
}
