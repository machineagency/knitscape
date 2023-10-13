import { GLOBAL_STATE } from "../state";
import { MIN_SCALE, MAX_SCALE } from "../constants";
import { centerZoom, fitChart } from "../actions/zoomFit";

import { zoom } from "../ui/zoom";
import { iconButton } from "../ui/buttons";
import { floatingToolbar } from "../ui/floatingToolbar";

export function chartControls() {
  return floatingToolbar({
    contents: [
      zoom({
        min: MIN_SCALE,
        max: MAX_SCALE,
        digits: 0,
        step: 1,
        value: GLOBAL_STATE.scale,
        zoomTo: (num) => centerZoom(num),
        zoomOut: () => centerZoom(GLOBAL_STATE.scale - 1),
        zoomIn: () => centerZoom(GLOBAL_STATE.scale + 1),
      }),
      iconButton({
        click: fitChart,
        icon: "fa-solid fa-expand",
      }),
    ],
    styles: { bottom: "10px", right: "10px" },
  });
}
