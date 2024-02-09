import { GLOBAL_STATE } from "../state";
import { pan } from "./chartPanZoom";
import { clearSelection } from "../utilities/misc";

import { drawLine, dragAnnotationPath, dragAnnotationPoint } from "./lines";
import { addPoint, deletePoint, dragPath, dragPoint } from "./boundaries";
import { selectBox } from "./select";

export function chartPointerDown(e) {
  if (e.which == 2) {
    pan(e);
    return;
  }
  if (GLOBAL_STATE.locked) return;
  if (GLOBAL_STATE.activeTool == "line") {
    drawLine(e);
  } else if (GLOBAL_STATE.activeTool == "pointer") {
    if (e.target.classList.contains("point")) {
      dragPoint(e);
    } else if (e.target.classList.contains("path")) {
      dragPath(e);
    } else if (e.target.classList.contains("annotation-path")) {
      dragAnnotationPath(e);
    } else if (e.target.classList.contains("annotation-point")) {
      dragAnnotationPoint(e);
    } else if (e.target.classList.contains("dragger")) {
      return;
    }
  } else if (GLOBAL_STATE.activeTool == "select") {
    clearSelection();
    selectBox();
  } else if (GLOBAL_STATE.activeTool == "hand") {
    pan(e);
  }
}

export function chartContextMenu(e) {
  e.preventDefault();
  if (e.target.classList.contains("point")) {
    deletePoint(e);
  } else if (e.target.classList.contains("path")) {
    addPoint(e);
  }
}
