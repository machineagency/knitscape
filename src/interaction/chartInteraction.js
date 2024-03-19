import { GLOBAL_STATE, dispatch } from "../state";
import { pan } from "./chartPanZoom";

// import { drawLine, dragAnnotationPath, dragAnnotationPoint } from "./lines";
import {
  boundaryModePointerDown,
  boundaryModeContextMenu,
} from "./boundaryInteraction";

import { selectBox } from "./select";

export function chartPointerDown(e) {
  if (e.which == 2) {
    pan(e);
    return;
  }

  const { interactionMode } = GLOBAL_STATE;

  if (GLOBAL_STATE.locked) return;

  if (interactionMode == "path") {
    // drawLine(e);
  } else if (interactionMode == "boundary") {
    boundaryModePointerDown(e);
  } else if (interactionMode == "block") {
    dispatch({ stitchSelect: null }); // clear current selection
    selectBox(e);
  } else if (interactionMode == "pan") {
    pan(e);
  }
}

export function chartContextMenu(e) {
  e.preventDefault();
  const { interactionMode } = GLOBAL_STATE;

  if (interactionMode == "path") {
  } else if (interactionMode == "boundary") {
    boundaryModeContextMenu(e);
  } else if (interactionMode == "pan") {
  }
}
