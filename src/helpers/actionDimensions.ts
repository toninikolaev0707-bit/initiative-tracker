import OBR from "@owlbear-rodeo/sdk";

export const TRACKER_WIDTH = 250;

/** Keep the original tracker dimensions; SR help is a separate Owlbear popover. */
export function setTrackerHeight(height: number) {
  void OBR.action.setHeight(height);
}
