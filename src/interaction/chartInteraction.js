import { GLOBAL_STATE } from "../state";
import { pan } from "./chartPanZoom";

import { drawLine, dragAnnotationPath, dragAnnotationPoint } from "./lines";
import {
  addPoint,
  deletePoint,
  dragPath,
  dragPoint,
  dragBoundary,
  editBoundary,
} from "./boundaries";
import { selectBox } from "./select";

export function chartPointerDown(e) {
  if (e.which == 2) {
    pan(e);
    return;
  }

  const cl = e.target.classList;

  if (GLOBAL_STATE.locked) return;
  if (GLOBAL_STATE.activeTool == "line") {
    drawLine(e);
  } else if (GLOBAL_STATE.activeTool == "pointer") {
    if (cl.contains("point")) {
      dragPoint(e);
    } else if (cl.contains("path")) {
      dragPath(e);
    } else if (cl.contains("annotation-path")) {
      dragAnnotationPath(e);
    } else if (cl.contains("annotation-point")) {
      dragAnnotationPoint(e);
    } else if (cl.contains("boundary")) {
      editBoundary(e);
      dragBoundary(e);
    } else if (cl.contains("dragger")) {
      return;
    }
  } else if (GLOBAL_STATE.activeTool == "select") {
    dispatch({ stitchSelect: null }); // clear current selection
    selectBox(e);
  } else if (GLOBAL_STATE.activeTool == "hand") {
    pan(e);
  }
}

export function chartClick(e) {
  const cl = e.target.classList;

  if (GLOBAL_STATE.activeTool == "pointer") {
    if (cl.contains("boundary")) {
      editBoundary(e);
    }
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
